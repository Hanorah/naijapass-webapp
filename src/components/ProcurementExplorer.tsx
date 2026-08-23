"use client";

import { useMemo, useState } from "react";
import PaginationBar from "@/components/ui/PaginationBar";
import {
  ChevronDown,
  Download,
  Funnel,
  Search,
} from "lucide-react";
import { edoLgas, procurementRecords } from "@/data/procurement";
import { lgasByState } from "@/data/projects";
import { nigerianStates } from "@/data/states";
import { useTenders, type TenderItem } from "@/lib/db/tenders";

const PAGE_SIZE = 8;

type RowKind = "Award" | "Tender";

type LandingRow = {
  id: string;
  title: string;
  state: string;
  lga: string;
  agency: string;
  category: string;
  amount: string;
  status: string;
  year: string;
  kind: RowKind;
  reference: string;
};

const columns: { key: keyof LandingRow; label: string }[] = [
  { key: "title", label: "Title" },
  { key: "state", label: "State" },
  { key: "lga", label: "LGA" },
  { key: "agency", label: "Procuring entity" },
  { key: "category", label: "Category" },
  { key: "amount", label: "Amount" },
  { key: "status", label: "Status" },
  { key: "year", label: "Year" },
  { key: "kind", label: "Type" },
  { key: "reference", label: "Reference" },
];

function formatNaira(n: number) {
  if (!n || n <= 0) return "TBA";
  return `NGN ${n.toLocaleString("en-NG")}`;
}

function awardLga(title: string, location: string): string {
  const fromTitle = title.replace(/\s+Local Government$/i, "").trim();
  if (fromTitle && !/ministry|board|agency/i.test(fromTitle)) return fromTitle;
  return location || "—";
}

function awardsToRows(): LandingRow[] {
  return procurementRecords.map((row, i) => ({
    id: `award-edo-${i}`,
    title: row.title,
    state: row.contractorOrigin || "Edo",
    lga: awardLga(row.title, row.location),
    agency: row.procuringEntity,
    category: row.category,
    amount: formatNaira(row.contractAmount || row.tenderAmount),
    status: row.status,
    year: row.year,
    kind: "Award" as const,
    reference: row.value,
  }));
}

function tenderToRow(t: TenderItem): LandingRow {
  const yearMatch = t.deadline.match(/\d{4}/);
  const year =
    yearMatch?.[0] ??
    (t.deadline.includes("Closed") ? "—" : String(new Date().getFullYear()));
  return {
    id: t.id,
    title: t.title,
    state: t.federal || !t.states.length ? "Federal" : t.states[0],
    lga: "—",
    agency: t.agency,
    category: t.sector,
    amount: t.budget,
    status: t.deadline.startsWith("Closed")
      ? "Closed"
      : t.urgent
        ? "Urgent"
        : "Open",
    year,
    kind: "Tender",
    reference: t.ref,
  };
}

function statusClass(status: string) {
  if (status === "Active" || status === "Open") return "bg-orange/15 text-orange";
  if (status === "Urgent") return "bg-red-100 text-red-700";
  if (status === "Completed" || status === "Closed") return "bg-sky-100 text-sky-800";
  if (status === "Suspended") return "bg-red-100 text-red-700";
  return "bg-mist text-navy-muted";
}

function toCsv(rows: LandingRow[]) {
  const headers = columns.map((c) => c.label);
  const lines = rows.map((row) =>
    columns
      .map((col) => `"${String(row[col.key]).split('"').join('""')}"`)
      .join(","),
  );
  return [headers.join(","), ...lines].join("\n");
}

export default function ProcurementExplorer() {
  const { allTenders, source } = useTenders();
  const [query, setQuery] = useState("");
  const [state, setState] = useState("All States");
  const [lga, setLga] = useState("All LGAs");
  const [showMore, setShowMore] = useState(false);
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [year, setYear] = useState("All");
  const [kind, setKind] = useState<"All" | RowKind>("All");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const awards = awardsToRows();
    const tenders = allTenders.map(tenderToRow);
    const seen = new Set(tenders.map((t) => t.reference.toLowerCase()));
    // Prefer live/catalogue tender rows when an award shares a reference.
    const uniqueAwards = awards.filter(
      (a) => !seen.has(a.reference.toLowerCase()),
    );
    return [...tenders, ...uniqueAwards];
  }, [allTenders]);

  const stateOptions = useMemo(() => {
    const fromData = new Set(rows.map((r) => r.state).filter(Boolean));
    const ordered = [
      "All States",
      "Federal",
      ...nigerianStates.filter((s) => fromData.has(s) || s === "Edo"),
    ];
    // Keep any extra labels present in data (e.g. odd spellings).
    for (const s of fromData) {
      if (!ordered.includes(s)) ordered.push(s);
    }
    return ordered;
  }, [rows]);

  const lgaOptions = useMemo(() => {
    if (state === "All States" || state === "Federal") {
      return ["All LGAs"];
    }
    const fromCatalogue = lgasByState[state] ?? [];
    const fromRows = rows
      .filter((r) => r.state === state && r.lga && r.lga !== "—")
      .map((r) => r.lga);
    const edoExtra =
      state === "Edo"
        ? edoLgas.filter((name) => name !== "All LGAs")
        : [];
    return [
      "All LGAs",
      ...Array.from(new Set([...fromCatalogue, ...fromRows, ...edoExtra])).sort(),
    ];
  }, [state, rows]);

  const categories = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.category))).sort()],
    [rows],
  );
  const years = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.year))).filter((y) => y !== "—").sort().reverse()],
    [rows],
  );
  const statuses = useMemo(
    () => ["All", ...Array.from(new Set(rows.map((r) => r.status))).sort()],
    [rows],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((row) => {
      if (state !== "All States" && row.state !== state) return false;
      if (lga !== "All LGAs") {
        const needle = lga.toLowerCase();
        const hay = `${row.lga} ${row.title} ${row.agency}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (category !== "All" && row.category !== category) return false;
      if (status !== "All" && row.status !== status) return false;
      if (year !== "All" && row.year !== year) return false;
      if (kind !== "All" && row.kind !== kind) return false;
      if (q) {
        const hay = Object.values(row).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [rows, query, state, lga, category, status, year, kind]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = filtered.slice(start, start + PAGE_SIZE);

  const onStateChange = (next: string) => {
    setState(next);
    setLga("All LGAs");
    setPage(1);
  };

  const exportCsv = () => {
    const blob = new Blob([toCsv(filtered)], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "naijapass-procurement.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-5 sm:py-8 md:px-8 md:py-10">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search procurement across Nigeria…"
            className="w-full rounded-xl border border-navy/10 bg-white py-2.5 pl-10 pr-4 text-sm text-navy outline-none placeholder:text-slate focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
          />
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 lg:flex lg:w-auto lg:flex-wrap lg:items-center">
          <FilterSelect
            label="State"
            value={state}
            onChange={onStateChange}
            options={stateOptions}
            fullWidth
          />
          <FilterSelect
            label="LGA"
            value={lga}
            onChange={(v) => {
              setLga(v);
              setPage(1);
            }}
            options={lgaOptions}
            disabled={state === "All States" || state === "Federal"}
            fullWidth
          />
          <button
            type="button"
            onClick={() => setShowMore((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-navy/10 bg-white px-3.5 py-2.5 text-sm font-medium text-navy hover:bg-mist"
          >
            <Funnel className="h-4 w-4" />
            More Filters
          </button>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3.5 py-2.5 text-sm font-semibold text-sky-900 hover:bg-sky-100"
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
              setStatus(v);
              setPage(1);
            }}
            options={statuses}
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
          <FilterSelect
            label="Type"
            value={kind}
            onChange={(v) => {
              setKind(v as "All" | RowKind);
              setPage(1);
            }}
            options={["All", "Tender", "Award"]}
          />
        </div>
      )}

      <p className="mb-3 text-xs font-semibold text-slate">
        {source === "database" ? "Live + catalogue · " : null}
        {filtered.length.toLocaleString("en-NG")} record
        {filtered.length === 1 ? "" : "s"}
        {state !== "All States" ? ` · ${state}` : " · all states"}
      </p>

      {/* Mobile cards */}
      <div className="space-y-3 md:hidden">
        {paged.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center text-sm text-slate">
            No procurement records match these filters.
          </p>
        ) : (
          paged.map((row) => (
            <article
              key={row.id}
              className="rounded-2xl border border-navy/10 bg-white p-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}
                >
                  {row.status}
                </span>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-navy/50">
                  {row.kind}
                </span>
              </div>
              <h3 className="mt-2 font-semibold leading-snug text-navy">{row.title}</h3>
              <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                <div>
                  <dt className="text-slate">State</dt>
                  <dd className="mt-0.5 font-semibold text-navy">{row.state}</dd>
                </div>
                <div>
                  <dt className="text-slate">LGA</dt>
                  <dd className="mt-0.5 font-semibold text-navy">{row.lga}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-slate">Agency</dt>
                  <dd className="mt-0.5 font-semibold text-navy">{row.agency}</dd>
                </div>
                <div>
                  <dt className="text-slate">Amount</dt>
                  <dd className="mt-0.5 font-semibold text-forest">{row.amount}</dd>
                </div>
                <div>
                  <dt className="text-slate">Year</dt>
                  <dd className="mt-0.5 font-semibold text-navy">{row.year}</dd>
                </div>
              </dl>
              <p className="mt-3 truncate text-[11px] text-slate">{row.reference}</p>
            </article>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-xl border border-navy/10 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[1100px] w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-orange text-white">
                {columns.map((col) => (
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
                  key={row.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-mist/70"}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-3 py-3 text-navy-muted"
                    >
                      {col.key === "title" ? (
                        <span className="inline-block max-w-[320px] truncate align-bottom font-semibold text-forest">
                          {row.title}
                        </span>
                      ) : col.key === "status" ? (
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass(row.status)}`}
                        >
                          {row.status}
                        </span>
                      ) : col.key === "kind" ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-navy">
                          {row.kind}
                        </span>
                      ) : (
                        String(row[col.key])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
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
  disabled,
  fullWidth,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  label?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <label
      className={`relative inline-flex items-center gap-2 ${fullWidth ? "w-full lg:w-auto" : ""}`}
    >
      {label && (
        <span className="shrink-0 text-xs font-semibold text-slate">{label}</span>
      )}
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`appearance-none rounded-xl border border-navy/10 bg-white py-2.5 pl-3 pr-9 text-sm font-medium text-navy outline-none disabled:bg-mist disabled:text-slate ${
          fullWidth ? "min-w-0 flex-1 lg:flex-none" : ""
        }`}
      >
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
    </label>
  );
}
