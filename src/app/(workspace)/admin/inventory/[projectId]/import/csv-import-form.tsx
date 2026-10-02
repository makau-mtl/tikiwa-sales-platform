"use client";

import { useActionState } from "react";
import { importPlotCsv, type PlotCsvImportState } from "../../../actions";

const initialState: PlotCsvImportState = {
  imported: null,
  rejected: 0,
  errors: [],
};

export function CsvImportForm({ projectId }: { projectId: string }) {
  const action = importPlotCsv.bind(null, projectId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <label className="block text-xs font-semibold text-[#39443b]">
        CSV file
        <input
          className="mt-1.5 block w-full text-sm file:mr-3 file:border-0 file:bg-[#e9eee8] file:px-3 file:py-2 file:font-medium file:text-[#315b40]"
          type="file"
          name="csv_file"
          accept=".csv,text/csv"
          required
        />
      </label>
      <p className="-mt-3 text-xs text-[#788078]">
        Include a Plot Number column. Size and Price columns are optional.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-[#39443b]">
          Default plot size
          <input className="mt-1.5 w-full border border-[#d8dbd4] bg-white px-3 py-2.5 text-sm" name="default_size_label" placeholder="Used when a row has no size" />
        </label>
        <label className="block text-xs font-semibold text-[#39443b]">
          Default plot price (KES)
          <input className="mt-1.5 w-full border border-[#d8dbd4] bg-white px-3 py-2.5 text-sm" name="default_price" type="number" min="0" step="any" placeholder="Used when a row has no price" />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="bg-[#1e3829] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#315b40] disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Importing..." : "Validate and import"}
      </button>

      {(state.imported !== null || state.errors.length > 0) && (
        <section aria-live="polite" className="border-y border-[#dfe2da] py-5">
          <h2 className="text-base font-semibold text-[#29332b]">
            {state.imported === null ? "Import could not be completed" : "Import results"}
          </h2>
          <p className="mt-2 text-sm text-[#39443b]">
            {state.imported ?? 0} imported · {state.rejected} rejected
          </p>
          {state.errors.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-[#9a3f31]">Rows needing attention</h3>
              <ul className="mt-2 space-y-1 text-sm text-[#7e4137]">
                {state.errors.map((error, index) => (
                  <li key={`${index}-${error}`}>{error}</li>
                ))}
              </ul>
              {state.rejected > state.errors.length && (
                <p className="mt-2 text-xs text-[#788078]">Showing the first {state.errors.length} row errors.</p>
              )}
            </div>
          )}
        </section>
      )}
    </form>
  );
}