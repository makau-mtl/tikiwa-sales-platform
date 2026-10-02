import Link from "next/link";
import { notFound } from "next/navigation";
import { createPlot, createPlotBatch } from "../../actions";
import { createClient } from "@/lib/supabase/server";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { ToastFeedback } from "@/components/toast-feedback";
import { InventoryTable } from "./inventory-table";

export default async function ProjectInventoryPage({
  params,
  searchParams,
}: PageProps<"/admin/inventory/[projectId]">) {
  const { projectId } = await params;
  const { error, notice } = await searchParams;
  const supabase = await createClient();
  const [{ data: project }, { data: plots }, { data: userData }] = await Promise.all([
    supabase.from("projects").select("id, name, location").eq("id", projectId).maybeSingle(),
    supabase
      .from("plots")
      .select("id, plot_number, size_label, price, status")
      .eq("project_id", projectId)
      .order("plot_number"),
    supabase.auth.getUser(),
  ]);

  if (!project) notFound();
  const { data: profile } = userData.user
    ? await supabase.from("profiles").select("role").eq("id", userData.user.id).maybeSingle()
    : { data: null };
  const isAdmin = profile?.role === "admin";
  const counts = (plots ?? []).reduce(
    (result, plot) => {
      if (plot.status in result) {
        result[plot.status as keyof typeof result] += 1;
      }
      return result;
    },
    { available: 0, reserved: 0, sold: 0 },
  );

  return (
    <section>
      <ToastFeedback message={error} />
      {notice === "plots-added" && <ToastFeedback message="Plot batch added." kind="success" />}
      {notice === "plot-added" && <ToastFeedback message="Plot added." kind="success" />}
      {notice === "plot-updated" && <ToastFeedback message="Plot updated." kind="success" />}
      {notice === "plot-deleted" && <ToastFeedback message="Plot deleted." kind="success" />}
      {notice === "availability-updated" && <ToastFeedback message="Availability updated for selected plots." kind="success" />}
      <Link href="/admin/inventory" className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← Inventory
      </Link>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#dfe2da] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a15b35]">Availability management</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#202820]">{project.name}</h1>
          <p className="mt-2 text-sm text-[#687269]">{project.location} · {plots?.length ?? 0} plots</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <nav aria-label="Inventory views" className="flex flex-wrap gap-4 text-sm font-medium">
            <span className="text-[#1e3829]">Plot inventory</span>
            <Link href={`/admin/inventory/${projectId}/map`} className="text-[#526457] hover:text-[#1e3829]">Inventory map</Link>
            <Link href={`/admin/inventory/${projectId}/reservations`} className="text-[#526457] hover:text-[#1e3829]">Reservations</Link>
          </nav>
          {isAdmin && (
            <Link href={`/admin/inventory/${projectId}/import`} className="inline-flex h-9 items-center rounded-md bg-[#1e3829] px-3 text-sm font-medium text-white hover:bg-[#315b40]">
              Import CSV
            </Link>
          )}
        </div>
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3">
        {([
          ["Available", counts.available],
          ["Reserved", counts.reserved],
          ["Sold", counts.sold],
        ] as const).map(([label, count]) => (
          <Card key={label} className="min-w-0">
            <CardContent className="p-4">
            <dt className="text-xs text-[#788078]">{label}</dt>
            <dd className="mt-1 text-xl font-semibold text-[#29332b]">{count}</dd>
            </CardContent>
          </Card>
        ))}
      </dl>

      {isAdmin && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle>Add plots</CardTitle>
            <p className="text-sm text-[#718077]">Enter one plot, or expand to generate a numbered series.</p>
          </CardHeader>
          <CardContent>
          <form action={createPlot} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="project_id" value={project.id} />
            <label className="text-xs font-semibold text-[#39443b]">
              Plot number
              <Input className="mt-1.5" name="plot_number" required />
            </label>
            <label className="text-xs font-semibold text-[#39443b]">
              Plot size
              <Input className="mt-1.5" name="size_label" placeholder="50 × 100 ft" required />
            </label>
            <label className="text-xs font-semibold text-[#39443b]">
              Price per plot (KES)
              <Input className="mt-1.5" name="price" type="number" min="0" step="any" required />
            </label>
            <Button type="submit" className="self-end">Add plot</Button>
          </form>

          <details className="mt-5 border-t border-[#e8ede9] pt-4">
            <summary className="cursor-pointer text-sm font-semibold text-[#39443b]">Generate a numbered batch</summary>
            <form action={createPlotBatch} className="mt-4">
              <input type="hidden" name="project_id" value={project.id} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <label className="text-xs font-semibold text-[#39443b]">
                  Plot size
                  <Input className="mt-1.5" name="size_label" placeholder="50 × 100 ft" required />
                </label>
                <label className="text-xs font-semibold text-[#39443b]">
                  Block prefix
                  <Input className="mt-1.5" name="identifier_prefix" placeholder="A-" pattern="[A-Za-z0-9][A-Za-z0-9-]*-" title="Start with a letter or number and end with a hyphen, e.g. A-" required />
                </label>
                <label className="text-xs font-semibold text-[#39443b]">
                  First number
                  <Input className="mt-1.5" name="start_number" type="number" min="1" step="1" defaultValue="1" required />
                </label>
                <label className="text-xs font-semibold text-[#39443b]">
                  Number of plots
                  <Input className="mt-1.5" name="quantity" type="number" min="1" max="500" step="1" defaultValue="15" required />
                </label>
                <label className="text-xs font-semibold text-[#39443b]">
                  Price per plot (KES)
                  <Input className="mt-1.5" name="price" type="number" min="0" step="any" required />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#788078]">Example: prefix A-, first number 1, quantity 15 creates A-001 through A-015.</p>
                <Button type="submit" variant="outline">Generate plots</Button>
              </div>
            </form>
          </details>
          </CardContent>
        </Card>
      )}

      <InventoryTable projectId={projectId} plots={plots ?? []} isAdmin={isAdmin} />
    </section>
  );
}