import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ToastFeedback } from "@/components/toast-feedback";

export default async function ProjectCreatedPage({
  params,
}: PageProps<"/admin/projects/[projectId]/created">) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name, location")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) notFound();

  const actions = [
    {
      title: "Import Plot Numbers (CSV)",
      detail: "Add many plots from a spreadsheet.",
      href: `/admin/inventory/${project.id}/import`,
    },
    {
      title: "Add Plots Manually",
      detail: "Enter plot details in the inventory.",
      href: `/admin/inventory/${project.id}`,
    },
    {
      title: "Invite Sales Agents",
      detail: "Sales team invitations are not available yet.",
      href: `/admin/sales-agents/invite?projectId=${project.id}`,
    },
    {
      title: "Skip For Now",
      detail: "Return to the projects dashboard.",
      href: "/admin",
    },
  ];

  return (
    <section className="mx-auto max-w-3xl">
      <ToastFeedback message={`${project.name} was created successfully.`} kind="success" />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">Project setup</p>
      <h1 className="mt-2 text-3xl font-semibold text-[#202820]">Project created successfully</h1>
      <p className="mt-2 text-sm text-[#687269]">{project.name} · {project.location}</p>
      <h2 className="mt-9 text-lg font-semibold text-[#29332b]">Choose your next step</h2>
      <div className="mt-3 divide-y divide-[#dfe2da] border-y border-[#dfe2da]">
        {actions.map((action) => (
          <Link
            key={action.title}
            href={action.href}
            className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-white"
          >
            <span>
              <span className="block text-sm font-semibold text-[#29332b]">{action.title}</span>
              <span className="mt-1 block text-xs text-[#788078]">{action.detail}</span>
            </span>
            <span aria-hidden="true" className="text-sm text-[#315b40]">→</span>
          </Link>
        ))}
      </div>
    </section>
  );
}