import Link from "next/link";
import { notFound } from "next/navigation";
import { uploadMutation } from "../../../actions";
import { createClient } from "@/lib/supabase/server";

const uploadDate = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function MutationUploadsPage({
  params,
  searchParams,
}: PageProps<"/admin/projects/[projectId]/mutations">) {
  const { projectId } = await params;
  const { error: actionError } = await searchParams;
  const supabase = await createClient();
  const [
    { data: project },
    { data: uploads, error: uploadsError },
    { data: userData },
  ] = await Promise.all([
    supabase.from("projects").select("id, name, location").eq("id", projectId).maybeSingle(),
    supabase
      .from("mutation_uploads")
      .select("id, file_name, upload_date, processing_status")
      .eq("project_id", projectId)
      .order("upload_date", { ascending: false }),
    supabase.auth.getUser(),
  ]);

  if (!project) notFound();
  const { data: profile } = userData.user
    ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  return (
    <section className="max-w-4xl">
      <Link href={`/admin/projects/${projectId}`} className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← {project.name}
      </Link>
      <div className="mt-7 border-b border-[#dfe2da] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">Projects</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#202820]">Mutation uploads</h1>
        <p className="mt-2 text-sm text-[#687269]">{project.location}</p>
      </div>

      <section aria-labelledby="upload-heading" className="border-b border-[#dfe2da] py-7">
        <h2 id="upload-heading" className="text-lg font-semibold text-[#29332b]">
          Upload subdivision documents
        </h2>
        <p className="mt-1 text-sm text-[#687269]">
          PDF, JPG, and PNG files up to 5 MB. OCR is not enabled; uploads are stored for future extraction and review.
        </p>
        {actionError && (
          <p role="alert" className="mt-4 border border-[#e2b7ae] bg-[#fff7f5] px-4 py-3 text-sm text-[#9a3f31]">
            {actionError}
          </p>
        )}
        {isAdmin && (
          <form action={uploadMutation} encType="multipart/form-data" className="mt-5 flex flex-wrap items-end gap-3">
            <input type="hidden" name="project_id" value={projectId} />
            <label className="min-w-0 flex-1 text-xs font-semibold text-[#39443b]">
              Mutation file
              <input
                className="mt-1.5 block w-full text-sm file:mr-3 file:border-0 file:bg-[#e9eee8] file:px-3 file:py-2 file:font-medium file:text-[#315b40]"
                type="file"
                name="mutation_file"
                accept="application/pdf,image/jpeg,image/png"
                required
              />
            </label>
            <button className="bg-[#1e3829] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#315b40]">
              Upload mutation
            </button>
          </form>
        )}
      </section>

      <section aria-labelledby="history-heading" className="pt-7">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="history-heading" className="text-lg font-semibold text-[#29332b]">Upload history</h2>
          <p className="text-xs text-[#788078]">{uploads?.length ?? 0} documents</p>
        </div>
        {uploadsError ? (
          <p role="alert" className="mt-4 text-sm text-[#9a3f31]">Upload history could not be loaded. Apply the mutation uploads migration if it has not been deployed.</p>
        ) : uploads?.length ? (
          <div className="mt-3 divide-y divide-[#dfe2da] border-y border-[#dfe2da]">
            {uploads.map((upload) => (
              <article key={upload.id} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <Link
                    href={`/admin/projects/${projectId}/mutations/${upload.id}`}
                    className="break-words text-sm font-semibold text-[#315b40] hover:text-[#1e3829]"
                  >
                    {upload.file_name}
                  </Link>
                  <p className="mt-1 text-xs text-[#788078]">
                    Uploaded {uploadDate.format(new Date(upload.upload_date))}
                  </p>
                </div>
                <span className="text-xs font-medium text-[#687269]">
                  {upload.processing_status === "uploaded" ? "Uploaded · awaiting processing" : upload.processing_status.replaceAll("_", " ")}
                </span>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-3 border-y border-[#dfe2da] py-6 text-sm text-[#788078]">No mutation documents have been uploaded.</p>
        )}
      </section>
    </section>
  );
}