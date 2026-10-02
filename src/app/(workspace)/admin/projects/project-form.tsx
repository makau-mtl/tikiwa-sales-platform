import type { ReactNode } from "react";
import { splitProjectDescription, splitProjectLocation } from "@/lib/projects";

type ProjectValues = {
  id?: string;
  name: string;
  location: string;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
};

export function ProjectForm({
  project,
  action,
  submitLabel,
}: {
  project?: ProjectValues;
  action: (formData: FormData) => Promise<void>;
  submitLabel: string;
}) {
  const fieldClass =
    "mt-1.5 w-full border border-[#d8dbd4] bg-white px-3 py-2.5 text-sm text-[#29332b] outline-none focus:border-[#315b40]";
  const labelClass = "block text-xs font-semibold text-[#39443b]";
  const field = (label: string, control: ReactNode) => (
    <label className={labelClass}>
      {label}
      {control}
    </label>
  );
  const { areaTown, county } = splitProjectLocation(project?.location ?? "");
  const { description, developerInfo } = splitProjectDescription(project?.description ?? null);

  return (
    <form action={action} className="space-y-6">
      {project?.id && <input type="hidden" name="project_id" value={project.id} />}
      <h2 className="border-b border-[#dfe2da] pb-2 text-sm font-semibold text-[#303a32]">
        Project Information
      </h2>
      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "Project name",
          <input className={fieldClass} name="name" required defaultValue={project?.name} />,
        )}
        {field(
          "County",
          <input
            className={fieldClass}
            name="county"
            required
            defaultValue={county}
          />,
        )}
        {field(
          "Area/Town",
          <input className={fieldClass} name="area_town" required defaultValue={areaTown} />,
        )}
      </div>
      <details className="border-y border-[#dfe2da]">
        <summary className="cursor-pointer py-4 text-sm font-semibold text-[#303a32]">
          Additional Project Details (Optional)
        </summary>
        <div className="grid gap-5 border-t border-[#dfe2da] py-5">
          {field(
            "Cover image",
            <input
              className={`${fieldClass} file:mr-3 file:border-0 file:bg-[#e9eee8] file:px-3 file:py-2 file:font-medium file:text-[#315b40]`}
              type="file"
              name="cover_image"
              accept="image/jpeg,image/png,image/webp,image/avif"
            />,
          )}
          {field(
            "Description",
            <textarea
              className={`${fieldClass} min-h-24 resize-y`}
              name="description"
              rows={4}
              defaultValue={description}
            />,
          )}
          {field(
            "Developer information",
            <textarea
              className={`${fieldClass} min-h-20 resize-y`}
              name="developer_info"
              rows={3}
              defaultValue={developerInfo}
            />,
          )}
          <div className="grid gap-5 sm:grid-cols-2">
            {field(
              "Latitude",
              <input
                className={fieldClass}
                name="latitude"
                type="number"
                min="-90"
                max="90"
                step="any"
                defaultValue={project?.latitude ?? ""}
              />,
            )}
            {field(
              "Longitude",
              <input
                className={fieldClass}
                name="longitude"
                type="number"
                min="-180"
                max="180"
                step="any"
                defaultValue={project?.longitude ?? ""}
              />,
            )}
          </div>
          {field(
            "Gallery images",
            <input
              className={`${fieldClass} file:mr-3 file:border-0 file:bg-[#e9eee8] file:px-3 file:py-2 file:font-medium file:text-[#315b40]`}
              type="file"
              name="gallery_images"
              accept="image/jpeg,image/png,image/webp,image/avif"
              multiple
            />,
          )}
          <p className="text-xs text-[#788078]">Use JPEG, PNG, WebP, or AVIF images. Combined image size must be 5 MB or less.</p>
        </div>
      </details>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#dfe2da] pt-5">
        <p className="text-xs text-[#788078]">Plot prices can be added when importing inventory.</p>
        <button
          type="submit"
          className="bg-[#1e3829] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#315b40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b40]"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}