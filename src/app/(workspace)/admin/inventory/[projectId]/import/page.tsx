import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CsvImportForm } from "./csv-import-form";

export default async function ImportPlotsPage({
  params,
}: PageProps<"/admin/inventory/[projectId]/import">) {
  const { projectId } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: userData }] = await Promise.all([
    supabase.from("projects").select("id, name").eq("id", projectId).maybeSingle(),
    supabase.auth.getUser(),
  ]);

  if (!project) notFound();
  const { data: profile } = userData.user
    ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.role === "admin";

  return (
    <section className="max-w-3xl">
      <Link href={`/admin/inventory/${project.id}`} className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← {project.name} inventory
      </Link>
      <div className="mt-7 border-b border-[#dfe2da] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">Inventory</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#202820]">Import plot numbers</h1>
        <p className="mt-2 text-sm text-[#687269]">Add plots to {project.name} from a spreadsheet.</p>
      </div>
      <div className="mt-5 border-l-2 border-[#315b40] pl-4 text-sm leading-6 text-[#687269]">
        The CSV needs a Plot Number column. Add Size and Price columns when values vary by plot, or provide a default below.
      </div>
      {isAdmin ? (
        <CsvImportForm projectId={project.id} />
      ) : (
        <p className="mt-6 text-sm text-[#687269]">An admin must import project plots.</p>
      )}
    </section>
  );
}