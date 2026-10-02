import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";

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
          <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {([
              ["Total plots", totals.total],
              ["Available", totals.available],
              ["Reserved", totals.reserved],
              ["Sold", totals.sold],
            ] as const).map(([label, count]) => (
              <Card key={label}>
                <CardContent className="p-4">
                <dt className="text-xs font-medium text-[#788078]">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold text-[#29332b]">{count}</dd>
                </CardContent>
              </Card>
            ))}
          </dl>

          {projects?.length ? (
            <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => {
                const counts = countsByProject[project.id] ?? {
                  total: 0,
                  available: 0,
                  reserved: 0,
                  sold: 0,
                };

                return (
                  <Card key={project.id}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{project.name}</CardTitle>
                      <p className="text-sm text-[#68766e]">{project.location}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="muted">{counts.total} plots</Badge>
                        <Badge variant="success">{counts.available} available</Badge>
                        <Badge variant="reserved">{counts.reserved} reserved</Badge>
                        <Badge variant="soldOut">{counts.sold} sold out</Badge>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-[#39443b]">
                        {project.base_price == null ? "Price not set" : `From ${money.format(project.base_price)}`}
                      </p>
                      <Link href={`/admin/inventory/${project.id}`} className="mt-4 inline-flex h-9 items-center rounded-md border border-[#d9e0dc] px-3 text-sm font-medium text-[#39443b] hover:bg-[#f3f6f4]">
                        Manage inventory
                      </Link>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="mt-7 border-dashed">
              <CardContent className="px-5 py-12 text-center">
                <h2 className="text-base font-semibold text-[#29332b]">No project inventory yet</h2>
                <p className="mx-auto mt-1 max-w-sm text-sm text-[#788078]">Create a project, then add plots manually or import them from a CSV file.</p>
                <Link href="/admin/projects/new" className="mt-5 inline-flex h-10 items-center justify-center rounded-md bg-[#1e3829] px-4 text-sm font-medium text-white hover:bg-[#315b40]">
                  Create project
                </Link>
              </CardContent>
            </Card>
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