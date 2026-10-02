import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

type PlotCounts = {
  total: number;
  available: number;
  reserved: number;
  sold: number;
};

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

export default async function InventoryPage() {
  const supabase = await createClient();
  const [
    { data: projects, error: projectError },
    { data: plots, error: plotError },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id, name, location, base_price")
      .order("name"),
    supabase.from("plots").select("project_id, status"),
  ]);

  const countsByProject: Record<string, PlotCounts> = {};
  for (const plot of plots ?? []) {
    const counts = countsByProject[plot.project_id] ?? {
      total: 0,
      available: 0,
      reserved: 0,
      sold: 0,
    };
    counts.total += 1;
    if (plot.status in counts && plot.status !== "total") {
      counts[plot.status as keyof Omit<PlotCounts, "total">] += 1;
    }
    countsByProject[plot.project_id] = counts;
  }

  const totals = Object.values(countsByProject).reduce(
    (result, counts) => ({
      total: result.total + counts.total,
      available: result.available + counts.available,
      reserved: result.reserved + counts.reserved,
      sold: result.sold + counts.sold,
    }),
    { total: 0, available: 0, reserved: 0, sold: 0 },
  );

  return (
    <section aria-labelledby="inventory-heading">
      <div className="border-b border-[#dfe2da] pb-7">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a15b35]">
          Inventory
        </p>
        <h1 id="inventory-heading" className="mt-2 text-3xl font-semibold text-[#202820]">
          Plot inventory
        </h1>
        <p className="mt-2 text-sm text-[#687269]">
          Plot records and availability across projects.
        </p>
      </div>

      {projectError || plotError ? (
        <p className="py-8 text-sm text-[#9a3f31]">Inventory could not be loaded.</p>
      ) : (
        <>
          <dl className="grid grid-cols-2 border-b border-[#dfe2da] sm:grid-cols-4">
            {([
              ["Total plots", totals.total],
              ["Available", totals.available],
              ["Reserved", totals.reserved],
              ["Sold", totals.sold],
            ] as const).map(([label, count]) => (
              <div key={label} className="border-r border-[#dfe2da] py-5 pr-4 last:border-r-0 sm:px-5 first:sm:pl-0">
                <dt className="text-xs font-medium text-[#788078]">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-[#29332b]">{count}</dd>
              </div>
            ))}
          </dl>

          {projects?.length ? (
            <div className="divide-y divide-[#dfe2da]">
              {projects.map((project) => {
                const counts = countsByProject[project.id] ?? {
                  total: 0,
                  available: 0,
                  reserved: 0,
                  sold: 0,
                };

                return (
                  <article key={project.id} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <div>
                      <h2 className="text-base font-semibold text-[#29332b]">{project.name}</h2>
                      <p className="mt-1 text-sm text-[#687269]">
                        {project.location} · {counts.total} plots · {project.base_price == null ? "Price not set" : `From ${money.format(project.base_price)}`}
                      </p>
                      <p className="mt-1 text-xs text-[#788078]">
                        {counts.available} available · {counts.reserved} reserved · {counts.sold} sold
                      </p>
                    </div>
                    <Link
                      href={`/admin/projects/${project.id}#plots-heading`}
                      className="text-sm font-semibold text-[#315b40] hover:text-[#1e3829]"
                    >
                      Manage plots &amp; availability
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-sm text-[#788078]">Create a project before adding plot inventory.</p>
          )}
        </>
      )}

      <section aria-labelledby="deferred-tools-heading" className="mt-10 border-t border-[#dfe2da] pt-6">
        <h2 id="deferred-tools-heading" className="text-sm font-semibold text-[#29332b]">
          Deferred inventory tools
        </h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-[#39443b]">Inventory map</h3>
            <p className="mt-1 text-sm text-[#788078]">
              Deferred until plot geometry and map workflows are validated.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-[#39443b]">Reservations</h3>
            <p className="mt-1 text-sm text-[#788078]">
              Deferred; the current MVP does not create reservation records.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}