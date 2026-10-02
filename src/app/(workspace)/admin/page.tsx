import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import { ToastFeedback } from "@/components/toast-feedback";
import { ProjectActions } from "./project-actions";

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default async function AdminHomePage({
  searchParams,
}: PageProps<"/admin">) {
  const { error, notice } = await searchParams;
  const supabase = await createClient();
  const [
    { data: projects, error: projectsError },
    { data: plots, error: plotsError },
    { data: userData },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, location, base_price, is_published, updated_at")
      .order("updated_at", { ascending: false }),
    supabase.from("plots").select("status"),
    supabase.auth.getUser(),
  ]);
  const { data: profile } = userData.user
    ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.role === "admin";
  const availableCount = (plots ?? []).filter((plot) => plot.status === "available").length;
  const reservedCount = (plots ?? []).filter((plot) => plot.status === "reserved").length;
  const soldCount = (plots ?? []).filter((plot) => plot.status === "sold").length;
  const stats = [
    { label: "Projects", value: projects?.length ?? 0, detail: "In your portfolio" },
    { label: "Total plots", value: plots?.length ?? 0, detail: "Across all projects" },
    { label: "Available", value: availableCount, detail: "Ready for sale" },
    { label: "Reserved", value: reservedCount, detail: "Currently held" },
    { label: "Sold", value: soldCount, detail: "Completed sales" },
  ];

  return (
    <section aria-labelledby="workspace-heading">
      <ToastFeedback message={error} />
      {notice === "project-deleted" && <ToastFeedback message="Project deleted." kind="success" />}
      {notice === "project-publication-updated" && (
        <ToastFeedback message="Project publication status updated." kind="success" />
      )}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a15b35]">Portfolio overview</p>
          <h1 id="workspace-heading" className="mt-2 text-3xl font-semibold text-[#202820]">Projects</h1>
        </div>
        {isAdmin && (
          <Link href="/admin/projects/new" className="inline-flex h-10 items-center justify-center rounded-md bg-[#1e3829] px-4 text-sm font-medium text-white transition hover:bg-[#315b40] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315b40]">
            Create project
          </Link>
        )}
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-xs font-medium text-[#68766e]">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <p className="text-2xl font-semibold tabular-nums text-[#202820]">{stat.value}</p>
              <p className="mt-1 text-xs text-[#849087]">{stat.detail}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {projectsError || plotsError ? (
        <p role="alert" className="mt-8 rounded-md border border-[#ecc4bd] bg-[#fff2ef] px-4 py-3 text-sm text-[#9a4032]">
          Projects could not be loaded. Refresh and try again.
        </p>
      ) : projects?.length ? (
        <div className="mt-9">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-base font-semibold text-[#29332b]">All projects</h2>
            <p className="text-xs text-[#68766e]">{projects.length} total</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="group transition-shadow hover:shadow-md">
              <CardHeader className="flex-row items-start justify-between gap-3 p-5 pb-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="truncate text-base font-semibold text-[#202820]">{project.name}</h3>
                    <Badge variant={project.is_published ? "published" : "draft"}>
                      {project.is_published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="mt-1.5 truncate text-sm text-[#68766e]">{project.location}</p>
                </div>
                {isAdmin && (
                  <ProjectActions
                    projectId={project.id}
                    projectName={project.name}
                    isPublished={project.is_published}
                  />
                )}
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="flex items-end justify-between gap-3 border-t border-[#edf0ed] pt-4">
                  <div>
                    <p className="text-xs text-[#849087]">Starting price</p>
                    <p className="mt-1 text-sm font-semibold text-[#344138]">
                      {project.base_price == null ? "Not set" : money.format(project.base_price)}
                    </p>
                  </div>
                  <Link href={`/admin/projects/${project.id}`} className="text-sm font-semibold text-[#315b40] hover:underline">
                    Open project <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
        </div>
      ) : (
        <div className="mt-8 rounded-lg border border-dashed border-[#cfd9d2] bg-white px-5 py-14 text-center">
          <div className="mx-auto grid size-11 place-items-center rounded-full bg-[#edf4ee] text-lg text-[#315b40]" aria-hidden="true">＋</div>
          <h2 className="mt-4 text-base font-semibold text-[#29332b]">No projects yet</h2>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-[#68766e]">Create your first project to start building its plot inventory.</p>
          {isAdmin && (
            <Link href="/admin/projects/new" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-[#1e3829] px-4 text-sm font-medium text-white hover:bg-[#315b40]">
              Create project
            </Link>
          )}
        </div>
      )}
    </section>
  );
}