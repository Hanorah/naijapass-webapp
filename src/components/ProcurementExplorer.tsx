"use client";

import { useMemo, useState } from "react";
import PaginationBar from "@/components/ui/PaginationBar";
import {
  ChevronDown,
  Download,
  Funnel,
  Search,
} from "lucide-react";
import {
  edoLgas,
  procurementColumns,
  procurementRecords,
  type ProcurementRecord,
  type ProcurementStatus,
} from "@/data/procurement";

const PAGE_SIZE = 8;

function formatAmount(n: number) {
  return n.toLocaleString("en-NG");
}

function cellValue(row: ProcurementRecord, key: (typeof procurementColumns)[number]["key"]) {
  const value = row[key];
  if (key === "contractAmount" || key === "tenderAmount") {
    return formatAmount(value as number);
  }
  if (value === "") return "—";
  return String(value);
}

function matchesLga(row: ProcurementRecord, lga: string) {
  if (lga === "All LGAs") return true;
  return (
    row.title.toLowerCase().includes(lga.toLowerCase()) ||
    row.location.toLowerCase().includes(lga.toLowerCase()) ||
    row.procuringEntity.toLowerCase().includes(lga.toLowerCase())
  );
}

function toCsv(rows: ProcurementRecord[]) {
  const headers = procurementColumns.map((c) => c.label);
  const lines = rows.map((row) =>
    procurementColumns
      .map((col) => {
        const raw = cellValue(row, col.key).split('"').join('""');
        return `"${raw}"`;
      })
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}

const statusPill: Record<ProcurementStatus, string> = {
  Active: "bg-orange/15 text-orange",
  Completed: "bg-sky-100 text-sky-800",
  Suspended: "bg-red-100 text-red-700",
};

export default function ProcurementExplorer() {
  const [query, setQuery] = useState("");
  const [state, setState] = useState("Edo");
  const [lga, setLga] = useState("All LGAs");
  const [showMore, setShowMore] = useState(false);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState<"All" | ProcurementStatus>("All");
  const [year, setYear] = useState("All");
  const [page, setPage] = useState(1);

  const categories = ["All", ...Array.from(new Set(procurementRecords.map((r) => r.category)))];
  const years = ["All", ...Array.from(new Set(procurementRecords.map((r) => r.year)))];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return procurementRecords.filter((row) => {
      if (state === "Edo" && row.body !== "LGA" && row.body !== "State Ministry" && row.body !== "Board") {
        return false;
      }
      if (!matchesLga(row, lga)) return false;
      if (category !== "All" && row.category !== category) return false;
      if (status !== "All" && row.status !== status) return false;
      if (year !== "All" && row.year !== year) return false;
      if (q) {
        const hay = Object.values(row).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [query, state, lga, category, status, year]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "procurement-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search procurement records..."
            className="w-full rounded-xl border border-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-navy outline-none placeholder:text-slate focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <FilterSelect
            value={state}
            onChange={(v) => {
              setState(v);
              setPage(1);
            }}
            options={["All States", "Edo"]}
          />
          <FilterSelect
            value={lga}
            onChange={(v) => {
              setLga(v);
              setPage(1);
            }}
            options={edoLgas}
          />
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="inline-flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm font-medium text-navy hover:bg-mist"
          >
            <Funnel className="h-4 w-4" />
            More Filters
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm font-semibold text-sky-900 hover:bg-sky-100"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {showMore && (
        <div className="mb-5 flex flex-wrap gap-2 rounded-xl border border-navy/8 bg-white p-3">
          <FilterSelect
            label="Category"
            value={category}
            onChange={(v) => {
              setCategory(v);
              setPage(1);
            }}
            options={categories}
          />
          <FilterSelect
            label="Status"
            value={status}
            onChange={(v) => {
              setStatus(v as "All" | ProcurementStatus);
              setPage(1);
            }}
            options={["All", "Active", "Completed", "Suspended"]}
          />
          <FilterSelect
            label="Year"
            value={year}
            onChange={(v) => {
              setYear(v);
              setPage(1);
            }}
            options={years}
          />
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1600px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-orange text-white">
                {procurementColumns.map((col) => (
                  <th
                    key={col.key}
                    className="whitespace-nowrap px-3 py-3 text-[11px] font-bold uppercase tracking-wide"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((row, i) => (
                <tr
                  key={`${row.value}-${row.title}-${i}`}
                  className={i % 2 === 0 ? "bg-white" : "bg-mist/70"}
                >
                  {procurementColumns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-3 py-3 text-navy-muted"
                    >
                      {col.key === "title" ? (
                        <span className="font-semibold text-forest">
                          {row.title}
                        </span>
                      ) : col.key === "status" ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusPill[row.status]}`}
                        >
                          {row.status}
                        </span>
                      ) : (
                        cellValue(row, col.key)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={procurementColumns.length}
                    className="px-4 py-12 text-center text-slate"
                  >
                    No procurement records match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="text-sm text-slate">
          Showing {filtered.length === 0 ? 0 : start + 1} to{" "}
          {Math.min(start + PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
          entries
        </p>
        <PaginationBar
          page={currentPage}
          pageCount={pageCount}
          onPage={setPage}
        />
      </div>

    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label?: string;
}) {
  return (
    <label className="relative inline-flex items-center gap-2">
      {label && <span className="text-xs font-semibold text-slate">{label}</span>}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-xl border border-navy/10 bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-navy outline-none"
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
    </label>
  );
}
