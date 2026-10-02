import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { showAiMasterplanComingSoon, uploadProjectImage, deleteProjectImage } from "../../../actions";
import { createClient } from "@/lib/supabase/server";
import { ToastFeedback } from "@/components/toast-feedback";

export default async function ProjectMediaPage({
  params,
  searchParams,
}: PageProps<"/admin/projects/[projectId]/media">) {
  const { projectId } = await params;
  const { masterplan, notice, error } = await searchParams;
  const supabase = await createClient();
  const [{ data: project }, { data: media }, { data: userData }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).maybeSingle(),
    supabase
      .from("project_media")
      .select("id, url, kind, sort_order")
      .eq("project_id", projectId)
      .order("sort_order"),
    supabase.auth.getUser(),
  ]);

  if (!project) notFound();
  const { data: profile } = userData.user
    ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.role === "admin";
  const imageRows = await Promise.all(
    (media ?? []).map(async (item) => {
      const { data } = await supabase.storage.from("project-media").createSignedUrl(item.url, 3600);
      return { ...item, signedUrl: data?.signedUrl ?? null };
    }),
  );
  const fieldClass =
    "w-full border border-[#d8dbd4] bg-white px-2.5 py-2 text-sm text-[#29332b] outline-none focus:border-[#315b40]";

  return (
    <section className="max-w-5xl">
      <ToastFeedback message={error} />
      {notice === "media-updated" && <ToastFeedback message="Project media updated." kind="success" />}
      <Link href={`/admin/projects/${projectId}`} className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← {project.name}
      </Link>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#dfe2da] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#202820]">Media &amp; Marketing</h1>
        </div>
        {isAdmin && (
          <form action={showAiMasterplanComingSoon}>
            <input type="hidden" name="project_id" value={project.id} />
            <button className="border border-[#d8dbd4] bg-white px-4 py-2.5 text-sm font-medium text-[#39443b] hover:border-[#8e9b8e]">
              Generate AI Masterplan
            </button>
          </form>
        )}
      </div>

      {masterplan === "coming-soon" && (
        <p role="status" className="mt-5 border border-[#d8dbd4] bg-white px-4 py-3 text-sm text-[#39443b]">
          Coming Soon - AI-generated project visualizations showing plot layouts, roads, amenities, landmarks, schools, utilities, and investment highlights.
        </p>
      )}

      <section aria-labelledby="gallery-heading" className="py-7">
        <h2 id="gallery-heading" className="text-lg font-semibold text-[#29332b]">Project gallery and plot plan</h2>
        <p className="mt-1 text-sm text-[#788078]">Add gallery photos or a plot layout image. Up to 5 MB each.</p>
        {isAdmin && (
          <form action={uploadProjectImage} className="mt-4 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input type="hidden" name="project_id" value={project.id} />
            <label className="text-xs font-semibold text-[#39443b]">
              Media type
              <select className={`${fieldClass} mt-1.5`} name="kind" defaultValue="image">
                <option value="image">Gallery image</option>
                <option value="map">Plot plan</option>
              </select>
            </label>
            <label className="min-w-0 flex-1 text-xs text-[#687269]">
              <span className="sr-only">Choose gallery or plan image</span>
              <input
                className="block w-full text-xs file:mr-3 file:border-0 file:bg-[#e9eee8] file:px-3 file:py-2 file:font-medium file:text-[#315b40]"
                type="file"
                name="image"
                accept="image/jpeg,image/png,image/webp,image/avif"
                required
              />
            </label>
            <button className="border border-[#d8dbd4] px-3 py-2 text-xs font-medium text-[#39443b] hover:bg-white sm:col-span-2 sm:justify-self-start">
              Upload media
            </button>
          </form>
        )}

        {imageRows.length ? (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {imageRows.map((image) => (
              <figure key={image.id} className="relative border border-[#dfe2da] bg-white">
                {image.signedUrl ? (
                  <Image
                    src={image.signedUrl}
                    alt={`${project.name} project image`}
                    width={640}
                    height={420}
                    unoptimized
                    className="aspect-[3/2] w-full object-cover"
                  />
                ) : (
                  <div className="grid aspect-[3/2] place-items-center text-xs text-[#788078]">Image unavailable</div>
                )}
                <figcaption className="border-t border-[#dfe2da] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-[#687269]">
                  {image.kind === "map" ? "Plot plan" : "Gallery image"}
                </figcaption>
                {isAdmin && (
                  <form action={deleteProjectImage} className="absolute right-2 top-2">
                    <input type="hidden" name="project_id" value={project.id} />
                    <input type="hidden" name="media_id" value={image.id} />
                    <button className="bg-white/95 px-2 py-1.5 text-xs font-medium text-[#9a3f31] shadow-sm hover:bg-[#fff7f5]">
                      Remove
                    </button>
                  </form>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className="mt-5 border-y border-[#dfe2da] py-6 text-sm text-[#788078]">No images uploaded.</p>
        )}
      </section>
    </section>
  );
}