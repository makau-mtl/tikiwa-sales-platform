import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteProject, toggleProjectPublication } from "./actions";

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default async function AdminHomePage() {
  const supabase = await createClient();
  const [
    { data: projects, error: projectsError },
    { data: userData },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, location, base_price, is_published, updated_at")
      .order("updated_at", { ascending: false }),
    supabase.auth.getUser(),
  ]);
  const { data: profile } = userData.user
    ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  return (
    <section aria-labelledby="workspace-heading">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#dfe2da] pb-7">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">
            Inventory
          </p>
          <h1 id="workspace-heading" className="mt-2 text-3xl font-semibold text-[#202820]">
            Projects
          </h1>
          <p className="mt-2 text-sm text-[#687269]">
            {projects?.length ?? 0} projects in the inventory
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/admin/projects/new"
            className="bg-[#1e3829] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#315b40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b40]"
          >
            Add project
          </Link>
        )}
      </div>

      {projectsError ? (
        <p className="py-8 text-sm text-[#9a3f31]">Projects could not be loaded.</p>
      ) : projects?.length ? (
        <div className="divide-y divide-[#dfe2da]">
          {projects.map((project) => (
            <article
              key={project.id}
              className="grid gap-4 py-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
            >
              <Link href={`/admin/projects/${project.id}`} className="group min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-[#202820] group-hover:text-[#315b40]">
                    {project.name}
                  </h2>
                  <span
                    className={`border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                      project.is_published
                        ? "border-[#b6d0bb] bg-[#edf5ee] text-[#315b40]"
                        : "border-[#dfe2da] bg-white text-[#687269]"
                    }`}
                  >
                    {project.is_published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#687269]">{project.location}</p>
                <p className="mt-2 text-sm font-medium text-[#39443b]">
                  {project.base_price == null ? "Price not set" : `From ${money.format(project.base_price)}`}
                </p>
              </Link>

              {isAdmin && (
                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <form action={toggleProjectPublication}>
                    <input type="hidden" name="project_id" value={project.id} />
                    <button className="border border-[#d8dbd4] px-3 py-2 text-xs font-medium text-[#39443b] hover:bg-white">
                      {project.is_published ? "Unpublish" : "Publish"}
                    </button>
                  </form>
                  <form action={deleteProject} className="flex items-center gap-2">
                    <input type="hidden" name="project_id" value={project.id} />
                    <label className="sr-only" htmlFor={`confirm-${project.id}`}>
                      Type {project.name} to confirm deletion
                    </label>
                    <input
                      id={`confirm-${project.id}`}
                      name="confirm_name"
                      required
                      placeholder="Type project name"
                      className="w-36 border border-[#d8dbd4] bg-white px-2 py-2 text-xs outline-none focus:border-[#9a3f31]"
                    />
                    <button className="border border-[#e2b7ae] px-3 py-2 text-xs font-medium text-[#9a3f31] hover:bg-[#fff7f5]">
                      Delete
                    </button>
                  </form>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="py-14 text-center">
          <p className="text-lg font-medium text-[#303a32]">No projects yet</p>
          <p className="mt-2 text-sm text-[#788078]">
            Create the first project to start managing plots and availability.
          </p>
        </div>
      )}
    </section>
  );
}