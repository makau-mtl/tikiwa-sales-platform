import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function InviteSalesAgentsPage({
  searchParams,
}: PageProps<"/admin/sales-agents/invite">) {
  const { projectId } = await searchParams;
  const supabase = await createClient();
  const { data: project } = projectId
    ? await supabase.from("projects").select("id, name").eq("id", projectId).maybeSingle()
    : { data: null };
  const backHref = project ? `/admin/projects/${project.id}/created` : "/admin";

  return (
    <section className="max-w-2xl">
      <Link href={backHref} className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← Back
      </Link>
      <div className="mt-7 border-b border-[#dfe2da] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">Team</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#202820]">Invite Sales Agents</h1>
      </div>
      <p className="mt-6 text-sm leading-6 text-[#687269]">
        Sales agent invitations are not available yet. No invitation has been sent.
        {project ? ` This project is ${project.name}.` : ""}
      </p>
    </section>
  );
}