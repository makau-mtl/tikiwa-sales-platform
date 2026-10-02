import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function ProjectReservationsPage({
  params,
}: PageProps<"/admin/inventory/[projectId]/reservations">) {
  const { projectId } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("id, name")
    .eq("id", projectId)
    .maybeSingle();

  if (!project) notFound();

  return (
    <section className="max-w-3xl">
      <Link href={`/admin/inventory/${projectId}`} className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← {project.name} inventory
      </Link>
      <div className="mt-7 border-b border-[#dfe2da] pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">Inventory</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#202820]">Reservations</h1>
      </div>
      <p className="mt-6 text-sm leading-6 text-[#687269]">
        Reservation management is deferred. The current MVP tracks plot availability only and does not create reservation records.
      </p>
    </section>
  );
}