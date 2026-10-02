import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleProjectPublication, updateProject } from "../../actions";
import { createClient } from "@/lib/supabase/server";
import { ProjectForm } from "../project-form";
import { splitProjectDescription } from "@/lib/projects";

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default async function ProjectDetailPage({
  params,
  searchParams,
}: PageProps<"/admin/projects/[projectId]">) {
  const { projectId } = await params;
  const { error: saveError } = await searchParams;
  const supabase = await createClient();
  const [
    { data: project, error: projectError },
    { data: userData },
  ] = await Promise.all([
    supabase.from("projects").select("*").eq("id", projectId).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (projectError || !project) notFound();
  const { data: profile } = userData.user
    ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.role === "admin";
  const { description, developerInfo } = splitProjectDescription(project.description);

  return (
    <section>
      <Link href="/admin" className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← Projects
      </Link>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#dfe2da] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">
            Project inventory
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-[#202820]">{project.name}</h1>
          <p className="mt-2 text-sm text-[#687269]">{project.location}</p>
          <nav aria-label="Project sections" className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium">
            <a href="#details-heading" className="text-[#526457] hover:text-[#1e3829]">Project details</a>
            <Link href={`/admin/projects/${project.id}/media`} className="text-[#526457] hover:text-[#1e3829]">Media &amp; Marketing</Link>
            <Link href={`/admin/projects/${project.id}/mutations`} className="text-[#526457] hover:text-[#1e3829]">Mutation uploads</Link>
            <Link href={`/admin/inventory/${project.id}`} className="text-[#526457] hover:text-[#1e3829]">Plot inventory</Link>
          </nav>
        </div>
        {isAdmin && (
          <form action={toggleProjectPublication}>
            <input type="hidden" name="project_id" value={project.id} />
            <button className="border border-[#d8dbd4] bg-white px-4 py-2.5 text-sm font-medium text-[#39443b] hover:border-[#8e9b8e]">
              {project.is_published ? "Unpublish project" : "Publish project"}
            </button>
          </form>
        )}
      </div>

      <div className="max-w-3xl py-9">
        <section aria-labelledby="details-heading">
          <h2 id="details-heading" className="text-lg font-semibold text-[#29332b]">
            Project details
          </h2>
          {saveError && (
            <p role="alert" className="mt-4 border border-[#e2b7ae] bg-[#fff7f5] px-4 py-3 text-sm text-[#9a3f31]">
              {saveError}
            </p>
          )}
          {isAdmin ? (
            <div className="mt-5">
              <ProjectForm project={project} action={updateProject} submitLabel="Save changes" />
            </div>
          ) : (
            <dl className="mt-5 divide-y divide-[#e2e5de] border-y border-[#e2e5de]">
              <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
                <dt className="text-[#788078]">Base price</dt>
                <dd className="text-[#303a32]">
                  {project.base_price == null ? "Not set" : money.format(project.base_price)}
                </dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
                <dt className="text-[#788078]">Features</dt>
                <dd className="text-[#303a32]">{project.amenities?.join(", ") || "Not set"}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
                <dt className="text-[#788078]">Nearby landmarks</dt>
                <dd className="text-[#303a32]">
                  {project.nearby_landmarks?.join(", ") || "Not set"}
                </dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
                <dt className="text-[#788078]">Development</dt>
                <dd className="capitalize text-[#303a32]">{project.development_type}</dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
                <dt className="text-[#788078]">Title</dt>
                <dd className="text-[#303a32]">
                  {project.titles_ready ? "Ready for transfer" : "Not ready for transfer"}
                  {project.title_type ? ` · ${project.title_type}` : ""}
                </dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
                <dt className="text-[#788078]">Payment</dt>
                <dd className="text-[#303a32]">
                  {project.cash_price ? `Cash ${money.format(project.cash_price)}` : "Cash price not set"}
                  {project.deposit_amount
                    ? ` · Deposit ${money.format(project.deposit_amount)}`
                    : ""}
                  {project.installment_months ? ` · ${project.installment_months} months` : ""}
                </dd>
              </div>
              <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
                <dt className="text-[#788078]">Description</dt>
                <dd className="whitespace-pre-wrap text-[#303a32]">
                  {description || "Not set"}
                </dd>
              </div>
              {developerInfo && (
                <div className="grid grid-cols-[120px_1fr] gap-3 py-3 text-sm">
                  <dt className="text-[#788078]">Developer</dt>
                  <dd className="whitespace-pre-wrap text-[#303a32]">{developerInfo}</dd>
                </div>
              )}
            </dl>
          )}
        </section>
      </div>
    </section>
  );
}