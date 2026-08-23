"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Droplets,
  FileText,
  GraduationCap,
  Hospital,
  Landmark,
  MapPin,
  Search,
  Zap,
} from "lucide-react";
import {
  lgasByState,
  projectDetailPath,
  projectFeedbackPath,
  projectStates,
  type AdminEra,
  type Project,
  type ProjectStatus,
} from "@/data/projects";
import { useSiteState } from "@/lib/siteState";
import { useProjects } from "@/lib/db/projects";

const PAGE_SIZE = 6;
const MAX_BUDGET = 50;

const statuses: ProjectStatus[] = [
  "In Progress",
  "Completed",
  "Planned",
  "Stalled",
];

const eras: { id: AdminEra; label: string }[] = [
  { id: "current", label: "Current Admin (2023-Present)" },
  { id: "previous", label: "Previous Admin (2015-2023)" },
  { id: "legacy", label: "Legacy Projects (Pre-2015)" },
];

const statusStyle: Record<ProjectStatus, string> = {
  "In Progress": "bg-orange text-white",
  Completed: "bg-sky-600 text-white",
  Planned: "bg-slate-400 text-white",
  Stalled: "bg-red-600 text-white",
};

function categoryIcon(category: string) {
  if (category.includes("Water")) return Droplets;
  if (category.includes("Education")) return GraduationCap;
  if (category.includes("Health")) return Hospital;
  if (category.includes("Energy")) return Zap;
  return Landmark;
}

function formatBudget(n: number, label?: string) {
  if (n <= 0) return label && label !== "TBA" ? label : "Budget TBA";
  if (n >= 1_000_000_000) return `NGN ${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `NGN ${(n / 1_000_000).toFixed(1)}M`;
  return `NGN ${n.toLocaleString()}`;
}

export default function ProjectsExplorer() {
  const { selectedState, setSelectedState, ready } = useSiteState();
  const { projects, source } = useProjects();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("budget-desc");
  const [erasSelected, setErasSelected] = useState<AdminEra[]>([
    "current",
    "previous",
    "legacy",
  ]);
  const [status, setStatus] = useState<ProjectStatus | "All">("All");
  const [state, setState] = useState("All States");
  const [lga, setLga] = useState("");
  const [budgetMax, setBudgetMax] = useState(MAX_BUDGET);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!ready) return;
    setState(selectedState);
    setLga("");
    setPage(1);
  }, [ready, selectedState]);

  // Derived from whatever is on screen, so LGAs a state has just published
  // show up in the filter without a redeploy.
  const lgaOptions = useMemo(() => {
    if (state === "All States") return [];
    const live = Array.from(
      new Set(projects.filter((p) => p.state === state).map((p) => p.lga)),
    ).filter(Boolean);
    return live.length ? live.sort() : (lgasByState[state] ?? []);
  }, [projects, state]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = projects.filter((p) => {
      if (erasSelected.length && !erasSelected.includes(p.era)) return false;
      if (status !== "All" && p.status !== status) return false;
      if (state !== "All States" && p.state !== state) return false;
      if (lga && p.lga !== lga) return false;
      if (p.budgetNgn > 0 && p.budgetNgn > budgetMax * 1_000_000_000) return false;
      if (q) {
        const hay = `${p.title} ${p.id} ${p.contractor} ${p.state}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    list = [...list].sort((a, b) => {
      if (sort === "budget-asc") return a.budgetNgn - b.budgetNgn;
      if (sort === "reports") return b.reports - a.reports;
      if (sort === "name") return a.title.localeCompare(b.title);
      return b.budgetNgn - a.budgetNgn || b.reports - a.reports;
    });

    return list;
  }, [projects, query, sort, erasSelected, status, state, lga, budgetMax]);

  const featured = filtered.find((p) => p.featured) ?? filtered[0];
  const rest = filtered.filter((p) => p.id !== featured?.id);
  const pageCount = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = rest.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleEra = (id: AdminEra) => {
    setPage(1);
    setErasSelected((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id],
    );
  };

  const onStateChange = (next: string) => {
    setState(next);
    setLga("");
    setPage(1);
    setSelectedState(next);
  };

  const reset = () => {
    setQuery("");
    setSort("budget-desc");
    setErasSelected(["current", "previous", "legacy"]);
    setStatus("All");
    setState("All States");
    setSelectedState("All States");
    setLga("");
    setBudgetMax(MAX_BUDGET);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search projects by name, ID or contractor."
            className="w-full rounded-xl border border-navy/10 bg-white py-3 pl-10 pr-4 text-sm text-navy outline-none placeholder:text-slate focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate">
          Sort by:
          <span className="relative">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none rounded-xl border border-navy/10 bg-white py-3 pl-3 pr-9 text-sm font-medium text-navy outline-none focus:border-orange/40"
            >
              <option value="budget-desc">Budget (High to Low)</option>
              <option value="budget-asc">Budget (Low to High)</option>
              <option value="reports">Most reports</option>
              <option value="name">Name</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
          </span>
        </label>
      </div>

      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <details open className="group border-b border-navy/8 pb-4">
            <summary className="flex cursor-pointer list-none items-center justify-between font-display text-sm font-bold text-navy">
              Administration
              <ChevronDown className="h-4 w-4 text-slate transition group-open:rotate-180" />
            </summary>
            <div className="mt-3 space-y-2.5">
              {eras.map((era) => (
                <label key={era.id} className="flex cursor-pointer items-start gap-2.5 text-sm text-navy-muted">
                  <input
                    type="checkbox"
                    checked={erasSelected.includes(era.id)}
                    onChange={() => toggleEra(era.id)}
                    className="mt-0.5 accent-orange"
                  />
                  {era.label}
                </label>
              ))}
            </div>
          </details>

          <div className="border-b border-navy/8 py-4">
            <p className="font-display text-sm font-bold text-navy">Project Status</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {statuses.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setStatus(status === s ? "All" : s);
                    setPage(1);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    status === s
                      ? "border-orange bg-orange-soft text-orange"
                      : "border-navy/10 text-slate hover:border-navy/25"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="border-b border-navy/8 py-4">
            <p className="font-display text-sm font-bold text-navy">Location</p>
            <div className="mt-3 space-y-2">
              <select
                value={state}
                onChange={(e) => onStateChange(e.target.value)}
                className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy outline-none"
              >
                {projectStates.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <select
                value={lga}
                onChange={(e) => {
                  setLga(e.target.value);
                  setPage(1);
                }}
                disabled={state === "All States"}
                className="w-full rounded-lg border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy outline-none disabled:bg-mist disabled:text-slate"
              >
                <option value="">
                  {state === "All States" ? "Select State First" : "All LGAs"}
                </option>
                {lgaOptions.map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="py-4">
            <p className="font-display text-sm font-bold text-navy">Budget Range (NGN)</p>
            <input
              type="range"
              min={0}
              max={MAX_BUDGET}
              value={budgetMax}
              onChange={(e) => {
                setBudgetMax(Number(e.target.value));
                setPage(1);
              }}
              className="mt-4 w-full accent-orange"
            />
            <div className="mt-1 flex justify-between text-xs text-slate">
              <span>0</span>
              <span>{budgetMax === MAX_BUDGET ? "50B+" : `${budgetMax}B`}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-2 w-full rounded-xl bg-sky-50 py-2.5 text-sm font-semibold text-sky-800 transition hover:bg-sky-100"
          >
            Reset Filters
          </button>
        </aside>

        <div>
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold text-slate">
            {source === "database" ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest/60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-forest" />
                </span>
                Live from state governments
              </>
            ) : null}
            <span className="text-slate/70">
              {filtered.length.toLocaleString("en-NG")} project
              {filtered.length === 1 ? "" : "s"}
            </span>
          </p>

          {featured ? (
            <FeaturedCard project={featured} />
          ) : (
            <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-10 text-center text-slate">
              No projects match these filters.
            </p>
          )}

          {paged.length > 0 && (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {paged.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <Pagination
              page={currentPage}
              pageCount={pageCount}
              onPage={setPage}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function FeaturedCard({ project }: { project: Project }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-navy/8 bg-white p-5 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate">
          <span>{project.category}</span>
          <span className="text-navy">{project.budgetLabel}</span>
        </div>
        <span
          className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${statusStyle[project.status]}`}
        >
          {project.status}
        </span>
      </div>
      <h2 className="mt-3 font-display text-xl font-bold text-navy md:text-2xl">
        {project.title}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate">{project.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-navy-muted">
        <span>
          <strong>Contractor:</strong> {project.contractor}
        </span>
        {project.completion && (
          <span>
            <strong>Est. Completion:</strong> {project.completion}
          </span>
        )}
        <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 font-semibold text-sky-800">
          <FileText className="h-3.5 w-3.5" />
          {project.reports} Reports
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <Link
          href={projectDetailPath(project.id)}
          className="text-sm font-semibold text-orange hover:underline"
        >
          View project details
        </Link>
        <Link
          href={projectFeedbackPath(project.id)}
          className="text-sm font-semibold text-navy/70 hover:text-navy"
        >
          Field reports
        </Link>
      </div>
    </article>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const Icon = categoryIcon(project.category);

  return (
    <article className="flex flex-col rounded-2xl border border-navy/8 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span
          className={`rounded-md px-2 py-0.5 text-[11px] font-bold ${statusStyle[project.status]}`}
        >
          {project.status}
        </span>
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-mist text-navy">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <h3 className="mt-4 font-display text-base font-bold leading-snug text-navy">
        {project.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-slate">{project.description}</p>
      <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
        <div>
          <dt className="text-slate">Budget Allocation</dt>
          <dd className="mt-0.5 font-semibold text-navy">
            {formatBudget(project.budgetNgn, project.budgetLabel)}
          </dd>
        </div>
        <div>
          <dt className="text-slate">State</dt>
          <dd className="mt-0.5 inline-flex items-center gap-1 font-semibold text-navy">
            <MapPin className="h-3 w-3 text-orange" />
            {project.state}
          </dd>
        </div>
      </dl>
      <div className="mt-auto flex items-center justify-between pt-4">
        <Link
          href={projectDetailPath(project.id)}
          className="text-sm font-semibold text-orange hover:underline"
        >
          View project details
        </Link>
        <Link
          href={projectFeedbackPath(project.id)}
          className="text-xs font-semibold text-navy/60 hover:text-navy"
          aria-label="Open feedback"
        >
          Feedback
        </Link>
      </div>
    </article>
  );
}

function Pagination({
  page,
  pageCount,
  onPage,
}: {
  page: number;
  pageCount: number;
  onPage: (n: number) => void;
}) {
  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <div className="mt-8 flex items-center justify-center gap-1.5">
      <button
        type="button"
        aria-label="Previous page"
        disabled={page === 1}
        onClick={() => onPage(page - 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy/10 text-navy disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPage(n)}
          className={`inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold ${
            n === page
              ? "bg-orange text-white"
              : "border border-navy/10 text-navy hover:bg-mist"
          }`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        aria-label="Next page"
        disabled={page === pageCount}
        onClick={() => onPage(page + 1)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy/10 text-navy disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}
