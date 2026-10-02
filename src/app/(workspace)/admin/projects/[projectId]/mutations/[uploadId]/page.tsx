import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const uploadDate = new Intl.DateTimeFormat("en-KE", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function MutationReviewPage({
  params,
}: PageProps<"/admin/projects/[projectId]/mutations/[uploadId]">) {
  const { projectId, uploadId } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: upload }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).maybeSingle(),
    supabase
      .from("mutation_uploads")
      .select("id, file_name, file_path, upload_date, processing_status, extracted_data_json")
      .eq("id", uploadId)
      .eq("project_id", projectId)
      .maybeSingle(),
  ]);

  if (!project || !upload) notFound();
  const { data: document } = await supabase.storage
    .from("mutation-documents")
    .createSignedUrl(upload.file_path, 3600);

  return (
    <section className="max-w-3xl">
      <Link href={`/admin/projects/${projectId}/mutations`} className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← Mutation uploads
      </Link>
      <div className="mt-7 border-b border-[#dfe2da] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">{project.name}</p>
        <h1 className="mt-2 break-words text-3xl font-semibold text-[#202820]">Extraction review</h1>
      </div>

      <dl className="mt-6 divide-y divide-[#dfe2da] border-y border-[#dfe2da]">
        <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
          <dt className="text-sm text-[#788078]">Document</dt>
          <dd className="break-words text-sm font-medium text-[#29332b]">{upload.file_name}</dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
          <dt className="text-sm text-[#788078]">Uploaded</dt>
          <dd className="text-sm text-[#29332b]">{uploadDate.format(new Date(upload.upload_date))}</dd>
        </div>
        <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
          <dt className="text-sm text-[#788078]">Processing status</dt>
          <dd className="text-sm font-medium capitalize text-[#29332b]">
            {upload.processing_status.replaceAll("_", " ")}
          </dd>
        </div>
        {document?.signedUrl && (
          <div className="grid gap-1 py-3 sm:grid-cols-[160px_1fr]">
            <dt className="text-sm text-[#788078]">Source document</dt>
            <dd>
              <a href={document.signedUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-[#315b40] hover:text-[#1e3829]">
                Open original
              </a>
            </dd>
          </div>
        )}
      </dl>

      <section aria-labelledby="extracted-data-heading" className="mt-8">
        <h2 id="extracted-data-heading" className="text-lg font-semibold text-[#29332b]">
          Extracted data
        </h2>
        {upload.extracted_data_json ? (
          <pre className="mt-3 overflow-x-auto border border-[#dfe2da] bg-white p-4 text-xs text-[#39443b]">
            {JSON.stringify(upload.extracted_data_json, null, 2)}
          </pre>
        ) : (
          <p className="mt-3 border-y border-[#dfe2da] py-5 text-sm text-[#687269]">
            Extraction is not available yet. OCR has not been implemented, so this document has not been analyzed and no plots have been generated from it.
          </p>
        )}
      </section>
    </section>
  );
}