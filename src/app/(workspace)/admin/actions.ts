"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  combineProjectDescription,
  formatProjectLocation,
  slugifyProjectName,
} from "@/lib/projects";
import { parseCsv } from "@/lib/csv";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

const projectMediaBucket = "project-media";
const mutationDocumentsBucket = "mutation-documents";
const maxImageSize = 5 * 1024 * 1024;
const allowedImageTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxMutationSize = 5 * 1024 * 1024;
const mutationFileExtensions: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
};
const plotStatuses = ["available", "reserved", "sold"] as const;

export type PlotCsvImportState = {
  imported: number | null;
  rejected: number;
  errors: string[];
};

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || profile?.role !== "admin") {
    throw new Error("Only admins can change inventory.");
  }

  return supabase;
}

function formString(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function requiredString(formData: FormData, key: string, label: string) {
  const value = formString(formData, key);
  if (!value) throw new Error(`${label} is required.`);
  return value;
}

function numericValue(value: string, label: string, minimum: number, maximum = Infinity) {
  const number = Number(value);
  if (!value || !Number.isFinite(number) || number < minimum || number > maximum) {
    throw new Error(`${label} must be a valid number.`);
  }
  return number;
}

function projectSaveError(error: unknown) {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = error.code;
    if (code === "PGRST204" || code === "42703") {
      return "The database is missing the new project fields. Apply the pending project-details migration, then try again.";
    }
    if (code === "23505") {
      return "A project could not be saved because one of its values conflicts with an existing project.";
    }
  }

  if (error instanceof Error && /schema cache|column .* does not exist/i.test(error.message)) {
    return "The database is missing the new project fields. Apply the pending project-details migration, then try again.";
  }

  return error instanceof Error ? error.message : "The project could not be saved.";
}

function redirectWithProjectError(path: string, error: unknown): never {
  redirect(`${path}?error=${encodeURIComponent(projectSaveError(error))}`);
}

function projectValues(formData: FormData) {
  const name = requiredString(formData, "name", "Project name");
  const county = requiredString(formData, "county", "County");
  const areaTown = requiredString(formData, "area_town", "Area/Town");
  const latitude = formString(formData, "latitude");
  const longitude = formString(formData, "longitude");

  return {
    name,
    location: formatProjectLocation(areaTown, county),
    description: combineProjectDescription(
      formString(formData, "description"),
      formString(formData, "developer_info"),
    ),
    latitude: latitude ? numericValue(latitude, "Latitude", -90, 90) : null,
    longitude: longitude ? numericValue(longitude, "Longitude", -180, 180) : null,
  };
}

type ProjectImageUpload = { file: File; isCover: boolean };

function projectImageUploads(formData: FormData): ProjectImageUpload[] {
  const coverImage = formData.get("cover_image");
  const galleryImages = formData.getAll("gallery_images");
  const uploads = [
    ...(coverImage instanceof File && coverImage.size > 0
      ? [{ file: coverImage, isCover: true }]
      : []),
    ...galleryImages
      .filter((image): image is File => image instanceof File && image.size > 0)
      .map((file) => ({ file, isCover: false })),
  ];

  for (const { file } of uploads) {
    if (!allowedImageTypes.includes(file.type) || file.size > maxImageSize) {
      throw new Error("Use JPEG, PNG, WebP, or AVIF images up to 5 MB each.");
    }
  }
  if (uploads.reduce((total, upload) => total + upload.file.size, 0) > maxImageSize) {
    throw new Error("The combined cover and gallery images must be 5 MB or smaller.");
  }

  return uploads;
}

async function saveProjectImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  uploads: ProjectImageUpload[],
) {
  if (!uploads.length) return;

  const hasCover = uploads.some((upload) => upload.isCover);
  const { data: existingMedia, error: existingError } = await supabase
    .from("project_media")
    .select("id, sort_order")
    .eq("project_id", projectId);
  if (existingError) throw new Error(existingError.message);
  const currentMaxSortOrder = (existingMedia ?? []).reduce(
    (maximum, image) => Math.max(maximum, image.sort_order ?? 0),
    0,
  );
  const nextSortOrder = hasCover ? 1 : currentMaxSortOrder + 1;
  const uploadedPaths: string[] = [];
  const mediaRows: { project_id: string; kind: string; url: string; sort_order: number }[] = [];

  for (const [index, upload] of uploads.entries()) {
    const extension = upload.file.type.split("/")[1].replace("jpeg", "jpg");
    const objectPath = `${projectId}/${crypto.randomUUID()}.${extension}`;
    const { error } = await supabase.storage
      .from(projectMediaBucket)
      .upload(objectPath, upload.file, { contentType: upload.file.type, upsert: false });
    if (error) {
      await supabase.storage.from(projectMediaBucket).remove(uploadedPaths);
      throw new Error("The project was saved, but an image could not be uploaded.");
    }
    uploadedPaths.push(objectPath);
    mediaRows.push({
      project_id: projectId,
      kind: "image",
      url: objectPath,
      sort_order: upload.isCover ? 0 : nextSortOrder + index,
    });
  }

  const { data: insertedMedia, error: mediaError } = await supabase
    .from("project_media")
    .insert(mediaRows)
    .select("id");
  if (mediaError) {
    await supabase.storage.from(projectMediaBucket).remove(uploadedPaths);
    throw new Error("The project was saved, but image details could not be saved.");
  }

  const existingIds = (existingMedia ?? []).map((image) => image.id);
  if (hasCover && existingIds.length) {
    const { error: reorderError } = await supabase
      .from("project_media")
      .update({ sort_order: 1000 })
      .in("id", existingIds);
    if (reorderError) {
      const insertedIds = (insertedMedia ?? []).map((image) => image.id);
      await supabase.from("project_media").delete().in("id", insertedIds);
      await supabase.storage.from(projectMediaBucket).remove(uploadedPaths);
      throw new Error("The new cover image could not be set. Existing images were left unchanged.");
    }
  }
}

function plotValues(formData: FormData) {
  const status = formString(formData, "status");
  if (status && !plotStatuses.includes(status as (typeof plotStatuses)[number])) {
    throw new Error("Choose a valid plot status.");
  }

  return {
    plot_number: requiredString(formData, "plot_number", "Plot number"),
    size_label: requiredString(formData, "size_label", "Plot size"),
    price: numericValue(formString(formData, "price"), "Price", 0),
    ...(status ? { status: status as (typeof plotStatuses)[number] } : {}),
  };
}

function revalidateInventory(projectId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/projects");
  if (projectId) {
    revalidatePath(`/admin/projects/${projectId}`);
    revalidatePath(`/admin/projects/${projectId}/media`);
    revalidatePath(`/admin/inventory/${projectId}`);
    revalidatePath("/admin/inventory");
  }
}

export async function createProject(formData: FormData) {
  const supabase = await requireAdmin();
  let values: ReturnType<typeof projectValues>;
  let images: ProjectImageUpload[];
  try {
    values = projectValues(formData);
    images = projectImageUploads(formData);
  } catch (error) {
    redirectWithProjectError("/admin/projects/new", error);
  }

  const slugBase = slugifyProjectName(values.name);
  let projectId: string | null = null;
  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const slug = suffix === 1 ? slugBase : `${slugBase}-${suffix}`;
    const { data: existing, error: lookupError } = await supabase
      .from("projects")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (lookupError) redirectWithProjectError("/admin/projects/new", lookupError);
    if (existing) continue;

    const { data, error } = await supabase
      .from("projects")
      .insert({ ...values, slug, base_price: null })
      .select("id")
      .single();
    if (error && "code" in error && error.code === "23505") continue;
    if (error) redirectWithProjectError("/admin/projects/new", error);
    projectId = data.id;
    break;
  }

  if (!projectId) {
    redirectWithProjectError("/admin/projects/new", new Error("Could not generate a unique project address."));
  }

  try {
    await saveProjectImages(supabase, projectId, images);
  } catch (error) {
    redirectWithProjectError(`/admin/projects/${projectId}`, error);
  }
  revalidateInventory(projectId);
  redirect(`/admin/projects/${projectId}/created`);
}

export async function updateProject(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  let values: ReturnType<typeof projectValues>;
  let images: ProjectImageUpload[];
  try {
    values = projectValues(formData);
    images = projectImageUploads(formData);
  } catch (error) {
    redirectWithProjectError(`/admin/projects/${projectId}`, error);
  }
  const { error } = await supabase
    .from("projects")
    .update(values)
    .eq("id", projectId);

  if (error) redirectWithProjectError(`/admin/projects/${projectId}`, error);
  try {
    await saveProjectImages(supabase, projectId, images);
  } catch (imageError) {
    redirectWithProjectError(`/admin/projects/${projectId}`, imageError);
  }
  revalidateInventory(projectId);
  redirect(`/admin/projects/${projectId}`);
}

export async function toggleProjectPublication(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const { data: project, error: readError } = await supabase
    .from("projects")
    .select("is_published")
    .eq("id", projectId)
    .single();

  if (readError) throw new Error(readError.message);
  const { error } = await supabase
    .from("projects")
    .update({ is_published: !project.is_published })
    .eq("id", projectId);

  if (error) throw new Error(error.message);
  revalidateInventory(projectId);
  redirect(`/admin/inventory/${projectId}`);
}

export async function showAiMasterplanComingSoon(formData: FormData) {
  await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  redirect(`/admin/projects/${projectId}/media?masterplan=coming-soon`);
}

function redirectWithMutationError(projectId: string, message: string): never {
  redirect(`/admin/projects/${projectId}/mutations?error=${encodeURIComponent(message)}`);
}

export async function uploadMutation(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const file = formData.get("mutation_file");

  if (!(file instanceof File) || file.size === 0) {
    redirectWithMutationError(projectId, "Choose a mutation PDF, JPG, or PNG file.");
  }
  if (!mutationFileExtensions[file.type] || file.size > maxMutationSize) {
    redirectWithMutationError(projectId, "Use a PDF, JPG, or PNG file up to 5 MB.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();
  if (projectError || !project) {
    redirectWithMutationError(projectId, "The selected project could not be found.");
  }

  const objectPath = `${projectId}/${crypto.randomUUID()}.${mutationFileExtensions[file.type]}`;
  const { error: uploadError } = await supabase.storage
    .from(mutationDocumentsBucket)
    .upload(objectPath, file, { contentType: file.type, upsert: false });
  if (uploadError) {
    redirectWithMutationError(projectId, "The mutation document could not be uploaded.");
  }

  const { error: recordError } = await supabase.from("mutation_uploads").insert({
    project_id: projectId,
    file_path: objectPath,
    file_name: file.name.trim().slice(0, 255),
  });

  if (recordError) {
    await supabase.storage.from(mutationDocumentsBucket).remove([objectPath]);
    redirectWithMutationError(projectId, "The upload was stored but its history record could not be saved.");
  }

  revalidatePath(`/admin/projects/${projectId}/mutations`);
  redirect(`/admin/projects/${projectId}/mutations`);
}

export async function deleteProject(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const confirmName = requiredString(formData, "confirm_name", "Project name confirmation");
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("name")
    .eq("id", projectId)
    .single();

  if (projectError) throw new Error(projectError.message);
  if (confirmName !== project.name) {
    throw new Error("The project name confirmation does not match.");
  }

  const { count: visitCount, error: visitsError } = await supabase
    .from("site_visits")
    .select("id", { count: "exact", head: true })
    .eq("project_id", projectId);
  if (visitsError) throw new Error(visitsError.message);
  if (visitCount) {
    throw new Error("Projects with scheduled site visits cannot be deleted.");
  }

  const { data: media, error: mediaError } = await supabase
    .from("project_media")
    .select("url")
    .eq("project_id", projectId);

  if (mediaError) throw new Error(mediaError.message);
  const paths = (media ?? []).map((item) => item.url);
  if (paths.length) {
    const { error } = await supabase.storage.from(projectMediaBucket).remove(paths);
    if (error) throw new Error(error.message);
  }

  const { data: mutationUploads, error: mutationUploadsError } = await supabase
    .from("mutation_uploads")
    .select("file_path")
    .eq("project_id", projectId);
  if (mutationUploadsError) throw new Error(mutationUploadsError.message);
  const mutationPaths = (mutationUploads ?? []).map((upload) => upload.file_path);
  if (mutationPaths.length) {
    const { error } = await supabase.storage
      .from(mutationDocumentsBucket)
      .remove(mutationPaths);
    if (error) throw new Error(error.message);
  }

  const { error } = await supabase.from("projects").delete().eq("id", projectId);
  if (error) throw new Error(error.message);
  revalidateInventory();
  redirect("/admin");
}

export async function createPlotBatch(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const sizeLabel = requiredString(formData, "size_label", "Plot size");
  const identifierPrefix = requiredString(formData, "identifier_prefix", "Identifier prefix");
  if (!/^[A-Za-z0-9][A-Za-z0-9-]*-$/.test(identifierPrefix)) {
    throw new Error("Prefix must start with a letter or number and end with a hyphen, for example A-.");
  }

  const startNumber = numericValue(formString(formData, "start_number"), "Start number", 1);
  const quantity = numericValue(formString(formData, "quantity"), "Quantity", 1, 500);
  if (!Number.isInteger(startNumber) || !Number.isInteger(quantity)) {
    throw new Error("Start number and quantity must be whole numbers.");
  }

  const lastNumber = startNumber + quantity - 1;
  const numberWidth = Math.max(3, String(lastNumber).length);
  const plotNumbers = Array.from({ length: quantity }, (_, index) =>
    `${identifierPrefix}${String(startNumber + index).padStart(numberWidth, "0")}`,
  );
  const price = numericValue(formString(formData, "price"), "Price", 0);

  const { data: existingPlots, error: existingError } = await supabase
    .from("plots")
    .select("plot_number")
    .eq("project_id", projectId)
    .in("plot_number", plotNumbers);
  if (existingError) throw new Error(existingError.message);
  if (existingPlots?.length) {
    const duplicates = existingPlots.map((plot) => plot.plot_number).join(", ");
    throw new Error(`These plot identifiers already exist: ${duplicates}.`);
  }

  const { error } = await supabase.from("plots").insert(
    plotNumbers.map((plotNumber) => ({
      project_id: projectId,
      plot_number: plotNumber,
      size_label: sizeLabel,
      price,
    })),
  );

  if (error) throw new Error(error.message);
  revalidateInventory(projectId);
  redirect(`/admin/inventory/${projectId}`);
}

export async function createPlot(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const values = plotValues(formData);
  const { error } = await supabase.from("plots").insert({
    ...values,
    project_id: projectId,
    status: "available",
  });

  if (error && "code" in error && error.code === "23505") {
    throw new Error("That plot number already exists in this project.");
  }
  if (error) throw new Error(error.message);
  revalidateInventory(projectId);
  redirect(`/admin/inventory/${projectId}`);
}

export async function importPlotCsv(
  projectId: string,
  _previousState: PlotCsvImportState,
  formData: FormData,
): Promise<PlotCsvImportState> {
  const supabase = await requireAdmin();
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .maybeSingle();
  if (projectError || !project) {
    return { imported: null, rejected: 0, errors: ["The selected project could not be found."] };
  }

  const file = formData.get("csv_file");
  if (!(file instanceof File) || file.size === 0 || !file.name.toLowerCase().endsWith(".csv")) {
    return { imported: null, rejected: 0, errors: ["Choose a non-empty CSV file."] };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { imported: null, rejected: 0, errors: ["CSV files must be 5 MB or smaller."] };
  }

  let rows: string[][];
  try {
    rows = parseCsv((await file.text()).replace(/^\uFEFF/, ""));
  } catch (error) {
    return {
      imported: null,
      rejected: 0,
      errors: [error instanceof Error ? error.message : "The CSV could not be read."],
    };
  }
  if (rows.length < 2) {
    return { imported: null, rejected: 0, errors: ["Add a header row and at least one plot row."] };
  }

  const headers = rows[0].map((header) =>
    header.trim().toLowerCase().replace(/[\s-]+/g, "_").replace(/^\uFEFF/, ""),
  );
  const plotNumberIndex = headers.indexOf("plot_number");
  const sizeIndex = headers.findIndex((header) => ["size_label", "size", "plot_size"].includes(header));
  const priceIndex = headers.indexOf("price");
  if (new Set(headers).size !== headers.length) {
    return { imported: null, rejected: rows.length - 1, errors: ["The CSV contains duplicate column names."] };
  }
  if (plotNumberIndex < 0) {
    return { imported: null, rejected: rows.length - 1, errors: ["The CSV needs a Plot Number column."] };
  }
  const plotRows = rows.slice(1);
  if (plotRows.length > 500) {
    return { imported: null, rejected: plotRows.length, errors: ["Import up to 500 plots at a time."] };
  }

  const defaultSize = formString(formData, "default_size_label");
  const defaultPriceText = formString(formData, "default_price");
  const { data: existingPlots, error: existingError } = await supabase
    .from("plots")
    .select("plot_number")
    .eq("project_id", projectId);
  if (existingError) {
    return { imported: null, rejected: 0, errors: ["Existing inventory could not be checked. Try again."] };
  }

  const existingNumbers = new Set((existingPlots ?? []).map((plot) => plot.plot_number));
  const seenNumbers = new Set<string>();
  const validPlots: { project_id: string; plot_number: string; size_label: string; price: number; status: "available" }[] = [];
  const errors: string[] = [];

  for (const [index, row] of plotRows.entries()) {
    const rowNumber = index + 2;
    const plotNumber = row[plotNumberIndex]?.trim() ?? "";
    const rowErrors: string[] = [];
    if (!plotNumber) rowErrors.push("plot number is empty");
    else if (seenNumbers.has(plotNumber)) rowErrors.push(`duplicate plot number "${plotNumber}" in this file`);
    else if (existingNumbers.has(plotNumber)) rowErrors.push(`plot number "${plotNumber}" already exists`);
    if (plotNumber) seenNumbers.add(plotNumber);

    const rowSize = sizeIndex >= 0 ? row[sizeIndex]?.trim() ?? "" : "";
    const sizeLabel = rowSize || defaultSize;
    if (!sizeLabel) rowErrors.push("plot size is missing; add a size value or default plot size");

    const rowPrice = priceIndex >= 0 ? row[priceIndex]?.trim() ?? "" : "";
    const priceText = rowPrice || defaultPriceText;
    const price = Number(priceText);
    if (!priceText || !Number.isFinite(price) || price < 0) {
      rowErrors.push("plot price is missing or invalid; add a price value or default plot price");
    }
    if (row.length > headers.length && row.slice(headers.length).some((value) => value.trim())) {
      rowErrors.push("row has more values than the header");
    }

    if (rowErrors.length) {
      errors.push(`Row ${rowNumber}: ${rowErrors.join("; ")}.`);
    } else {
      validPlots.push({
        project_id: projectId,
        plot_number: plotNumber,
        size_label: sizeLabel,
        price,
        status: "available",
      });
    }
  }

  if (validPlots.length) {
    const { error: insertError } = await supabase.from("plots").insert(validPlots);
    if (insertError) {
      return {
        imported: 0,
        rejected: plotRows.length,
        errors: ["No rows were imported because the inventory changed or could not be saved. Refresh and try again."],
      };
    }
    revalidatePath("/admin/inventory");
    revalidatePath(`/admin/inventory/${projectId}`);
    revalidatePath("/admin");
  }

  return {
    imported: validPlots.length,
    rejected: errors.length,
    errors: errors.slice(0, 100),
  };
}

export async function updatePlot(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const plotId = requiredString(formData, "plot_id", "Plot");
  const { error } = await supabase
    .from("plots")
    .update(plotValues(formData))
    .eq("id", plotId)
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);
  revalidateInventory(projectId);
  redirect(`/admin/inventory/${projectId}`);
}

export async function deletePlot(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const plotId = requiredString(formData, "plot_id", "Plot");
  const { error } = await supabase
    .from("plots")
    .delete()
    .eq("id", plotId)
    .eq("project_id", projectId);

  if (error) throw new Error(error.message);
  revalidateInventory(projectId);
  redirect(`/admin/projects/${projectId}`);
}

export async function uploadProjectImage(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const image = formData.get("image");
  const kind = formString(formData, "kind") || "image";

  if (!(image instanceof File) || image.size === 0) {
    throw new Error("Choose an image to upload.");
  }
  if (!['image', 'map'].includes(kind)) {
    throw new Error("Choose a valid project media type.");
  }
  if (!allowedImageTypes.includes(image.type) || image.size > maxImageSize) {
    throw new Error("Use a JPEG, PNG, WebP, or AVIF image up to 5 MB.");
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id")
    .eq("id", projectId)
    .single();
  if (projectError) throw new Error(projectError.message);

  const extension = image.type.split("/")[1].replace("jpeg", "jpg");
  const objectPath = `${project.id}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from(projectMediaBucket)
    .upload(objectPath, image, { contentType: image.type, upsert: false });
  if (uploadError) throw new Error(uploadError.message);

  const { error: mediaError } = await supabase.from("project_media").insert({
    project_id: projectId,
    kind,
    url: objectPath,
  });

  if (mediaError) {
    await supabase.storage.from(projectMediaBucket).remove([objectPath]);
    throw new Error(mediaError.message);
  }

  revalidateInventory(projectId);
  redirect(`/admin/projects/${projectId}/media`);
}

export async function deleteProjectImage(formData: FormData) {
  const supabase = await requireAdmin();
  const projectId = requiredString(formData, "project_id", "Project");
  const mediaId = requiredString(formData, "media_id", "Image");
  const { data: media, error: mediaError } = await supabase
    .from("project_media")
    .select("url")
    .eq("id", mediaId)
    .eq("project_id", projectId)
    .single();

  if (mediaError) throw new Error(mediaError.message);
  const { error: storageError } = await supabase.storage
    .from(projectMediaBucket)
    .remove([media.url]);
  if (storageError) throw new Error(storageError.message);

  const { error } = await supabase
    .from("project_media")
    .delete()
    .eq("id", mediaId)
    .eq("project_id", projectId);
  if (error) throw new Error(error.message);
  revalidateInventory(projectId);
  redirect(`/admin/projects/${projectId}/media`);
}