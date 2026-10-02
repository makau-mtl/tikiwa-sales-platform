import Link from "next/link";
import { notFound } from "next/navigation";
import { createPlot, createPlotBatch, deletePlot, updatePlot } from "../../actions";
import { createClient } from "@/lib/supabase/server";

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default async function ProjectInventoryPage({
  params,
}: PageProps<"/admin/inventory/[projectId]">) {
  const { projectId } = await params;
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
  const fieldClass =
    "w-full border border-[#d8dbd4] bg-white px-2.5 py-2 text-sm text-[#29332b] outline-none focus:border-[#315b40]";
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
      <Link href="/admin/inventory" className="text-sm font-medium text-[#526457] hover:text-[#1e3829]">
        ← Inventory
      </Link>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-4 border-b border-[#dfe2da] pb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">Availability management</p>
          <h1 className="mt-2 text-3xl font-semibold text-[#202820]">{project.name}</h1>
          <p className="mt-2 text-sm text-[#687269]">{project.location} · {plots?.length ?? 0} plots</p>
        </div>
        <nav aria-label="Inventory views" className="flex flex-wrap gap-4 text-sm font-medium">
          <span className="text-[#1e3829]">Plot inventory</span>
          <Link href={`/admin/inventory/${projectId}/map`} className="text-[#526457] hover:text-[#1e3829]">Inventory map</Link>
          <Link href={`/admin/inventory/${projectId}/reservations`} className="text-[#526457] hover:text-[#1e3829]">Reservations</Link>
        </nav>
      </div>

      <dl className="grid grid-cols-3 border-b border-[#dfe2da]">
        {([
          ["Available", counts.available],
          ["Reserved", counts.reserved],
          ["Sold", counts.sold],
        ] as const).map(([label, count]) => (
          <div key={label} className="border-r border-[#dfe2da] py-4 pr-3 last:border-r-0 sm:px-5 first:sm:pl-0">
            <dt className="text-xs text-[#788078]">{label}</dt>
            <dd className="mt-1 text-xl font-semibold text-[#29332b]">{count}</dd>
          </div>
        ))}
      </dl>

      {isAdmin && (
        <div className="border-b border-[#dfe2da] py-6">
          <form action={createPlot} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input type="hidden" name="project_id" value={project.id} />
            <label className="text-xs font-semibold text-[#39443b]">
              Plot number
              <input className={`${fieldClass} mt-1.5`} name="plot_number" required />
            </label>
            <label className="text-xs font-semibold text-[#39443b]">
              Plot size
              <input className={`${fieldClass} mt-1.5`} name="size_label" placeholder="50 × 100 ft" required />
            </label>
            <label className="text-xs font-semibold text-[#39443b]">
              Price per plot (KES)
              <input className={`${fieldClass} mt-1.5`} name="price" type="number" min="0" step="any" required />
            </label>
            <button className="self-end bg-[#1e3829] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#315b40]">Add plot</button>
          </form>

          <details className="mt-5 border-t border-[#dfe2da] pt-4">
            <summary className="cursor-pointer text-sm font-semibold text-[#39443b]">Generate a numbered batch</summary>
            <form action={createPlotBatch} className="mt-4">
              <input type="hidden" name="project_id" value={project.id} />
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <label className="text-xs font-semibold text-[#39443b]">
                  Plot size
                  <input className={`${fieldClass} mt-1.5`} name="size_label" placeholder="50 × 100 ft" required />
                </label>
                <label className="text-xs font-semibold text-[#39443b]">
                  Block prefix
                  <input className={`${fieldClass} mt-1.5`} name="identifier_prefix" placeholder="A-" pattern="[A-Za-z0-9][A-Za-z0-9-]*-" title="Start with a letter or number and end with a hyphen, e.g. A-" required />
                </label>
                <label className="text-xs font-semibold text-[#39443b]">
                  First number
                  <input className={`${fieldClass} mt-1.5`} name="start_number" type="number" min="1" step="1" defaultValue="1" required />
                </label>
                <label className="text-xs font-semibold text-[#39443b]">
                  Number of plots
                  <input className={`${fieldClass} mt-1.5`} name="quantity" type="number" min="1" max="500" step="1" defaultValue="15" required />
                </label>
                <label className="text-xs font-semibold text-[#39443b]">
                  Price per plot (KES)
                  <input className={`${fieldClass} mt-1.5`} name="price" type="number" min="0" step="any" required />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-[#788078]">Example: prefix A-, first number 1, quantity 15 creates A-001 through A-015.</p>
                <button className="border border-[#d8dbd4] px-4 py-2.5 text-sm font-medium text-[#39443b] hover:bg-white">Generate plots</button>
              </div>
            </form>
          </details>
          <Link href={`/admin/inventory/${projectId}/import`} className="mt-4 inline-block text-sm font-semibold text-[#315b40] hover:text-[#1e3829]">
            Import Plot Numbers (CSV)
          </Link>
        </div>
      )}

      {plots?.length ? (
        <div className="divide-y divide-[#dfe2da]">
          {plots.map((plot) => (
            <div key={plot.id} className="py-4">
              {isAdmin ? (
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                  <form action={updatePlot} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <input type="hidden" name="project_id" value={project.id} />
                    <input type="hidden" name="plot_id" value={plot.id} />
                    <label className="text-[11px] font-semibold text-[#788078]">
                      Plot number
                      <input className={`${fieldClass} mt-1`} name="plot_number" defaultValue={plot.plot_number} required />
                    </label>
                    <label className="text-[11px] font-semibold text-[#788078]">
                      Size
                      <input className={`${fieldClass} mt-1`} name="size_label" defaultValue={plot.size_label} required />
                    </label>
                    <label className="text-[11px] font-semibold text-[#788078]">
                      Price (KES)
                      <input className={`${fieldClass} mt-1`} name="price" type="number" min="0" step="any" defaultValue={plot.price} required />
                    </label>
                    <label className="text-[11px] font-semibold text-[#788078]">
                      Availability
                      <select className={`${fieldClass} mt-1`} name="status" defaultValue={plot.status}>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="sold">Sold</option>
                      </select>
                    </label>
                    <button className="justify-self-start border border-[#d8dbd4] px-3 py-2 text-xs font-medium text-[#39443b] hover:bg-white sm:col-span-2 lg:col-span-4">Save plot</button>
                  </form>
                  <form action={deletePlot}>
                    <input type="hidden" name="project_id" value={project.id} />
                    <input type="hidden" name="plot_id" value={plot.id} />
                    <button className="border border-[#e2b7ae] px-3 py-2 text-xs font-medium text-[#9a3f31] hover:bg-[#fff7f5]">Delete plot</button>
                  </form>
                </div>
              ) : (
                <div className="grid gap-2 text-sm sm:grid-cols-4 sm:items-center">
                  <p className="font-medium text-[#303a32]">{plot.plot_number}</p>
                  <p className="text-[#687269]">{plot.size_label}</p>
                  <p className="text-[#39443b]">{money.format(plot.price)}</p>
                  <p className="capitalize text-[#687269]">{plot.status}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="py-7 text-sm text-[#788078]">No plots have been added to this project.</p>
      )}
    </section>
  );
}