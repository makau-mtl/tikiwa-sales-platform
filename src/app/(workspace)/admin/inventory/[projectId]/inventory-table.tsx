"use client";

import { useState } from "react";
import { Pencil, Search } from "lucide-react";
import { deletePlot, updatePlot } from "../../actions";
import {
  Badge,
  Button,
  Card,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescriptionText,
  DialogFooter,
  DialogHeader,
  DialogTitleText,
  DialogTrigger,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";

type Plot = {
  id: string;
  plot_number: string;
  size_label: string;
  price: number;
  status: "available" | "reserved" | "sold";
};

const money = new Intl.NumberFormat("en-KE", {
  style: "currency",
  currency: "KES",
  maximumFractionDigits: 0,
});

function statusVariant(status: Plot["status"]) {
  if (status === "available") return "success" as const;
  if (status === "reserved") return "reserved" as const;
  return "soldOut" as const;
}

function PlotActions({ projectId, plot }: { projectId: string; plot: Plot }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" aria-label={`Edit plot ${plot.plot_number}`}>
          <Pencil className="size-3.5" aria-hidden="true" />
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitleText>Edit {plot.plot_number}</DialogTitleText>
          <DialogDescriptionText>Update this plot’s details and availability.</DialogDescriptionText>
        </DialogHeader>
        <form action={updatePlot} className="space-y-4">
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="plot_id" value={plot.id} />
          <label className="block text-sm font-medium text-[#344138]">
            Plot number
            <Input className="mt-1.5" name="plot_number" defaultValue={plot.plot_number} required />
          </label>
          <label className="block text-sm font-medium text-[#344138]">
            Plot size
            <Input className="mt-1.5" name="size_label" defaultValue={plot.size_label} required />
          </label>
          <label className="block text-sm font-medium text-[#344138]">
            Price (KES)
            <Input className="mt-1.5" name="price" type="number" min="0" step="any" defaultValue={plot.price} required />
          </label>
          <label className="block text-sm font-medium text-[#344138]">
            Availability
            <select className="mt-1.5 h-10 w-full rounded-md border border-[#d9e0dc] bg-white px-3 text-sm" name="status" defaultValue={plot.status}>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="sold">Sold</option>
            </select>
          </label>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
        <form action={deletePlot} className="border-t border-[#edf0ed] pt-4">
          <input type="hidden" name="project_id" value={projectId} />
          <input type="hidden" name="plot_id" value={plot.id} />
          <Button type="submit" variant="ghost" className="text-[#9a4032] hover:bg-[#fff2ef]">Delete plot</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function InventoryTable({
  projectId,
  plots,
  isAdmin,
}: {
  projectId: string;
  plots: Plot[];
  isAdmin: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const normalizedQuery = query.trim().toLowerCase();
  const filteredPlots = plots.filter((plot) => {
    const matchesQuery =
      !normalizedQuery ||
      plot.plot_number.toLowerCase().includes(normalizedQuery) ||
      plot.size_label.toLowerCase().includes(normalizedQuery);
    return matchesQuery && (status === "all" || plot.status === status);
  });
  return (
    <Card className="mt-6 overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[#e8ede9] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative block w-full sm:max-w-xs">
            <span className="sr-only">Search plots</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#819087]" aria-hidden="true" />
            <Input className="pl-9" placeholder="Search plot number or size" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <label className="sr-only" htmlFor="plot-status-filter">Filter by availability</label>
          <select
            id="plot-status-filter"
            className="h-10 rounded-md border border-[#d9e0dc] bg-white px-3 text-sm text-[#39443b]"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All availability</option>
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <p className="text-xs text-[#78867d]">Showing {filteredPlots.length} of {plots.length} plots</p>
      </div>

      {filteredPlots.length ? (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Plot</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Availability</TableHead>
              {isAdmin && <TableHead className="w-24 text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPlots.map((plot) => (
              <TableRow key={plot.id}>
                <TableCell className="font-semibold text-[#29332b]">{plot.plot_number}</TableCell>
                <TableCell className="text-[#647168]">{plot.size_label}</TableCell>
                <TableCell className="font-medium tabular-nums text-[#39443b]">{money.format(plot.price)}</TableCell>
                <TableCell>
                  <Badge variant={statusVariant(plot.status)}>
                    {plot.status === "sold" ? "Sold out" : plot.status}
                  </Badge>
                </TableCell>
                {isAdmin && <TableCell className="text-right"><PlotActions projectId={projectId} plot={plot} /></TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="px-5 py-12 text-center">
          <h3 className="text-sm font-semibold text-[#29332b]">{plots.length ? "No matching plots" : "No plots yet"}</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-[#78867d]">
            {plots.length ? "Try another search or availability filter." : "Add a plot manually or import your plot list to begin."}
          </p>
          {(query || status !== "all") && (
            <Button className="mt-4" variant="outline" size="sm" onClick={() => { setQuery(""); setStatus("all"); }}>
              Clear filters
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}