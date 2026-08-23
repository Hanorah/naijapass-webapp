"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type ProjectStatus } from "@/data/projects";
import { nigerianStates } from "@/data/states";
import { useProjects } from "@/lib/db/projects";
import { projectDetailPath } from "@/data/projects";

const statuses: Array<ProjectStatus | "All"> = [
  "All",
  "In Progress",
  "Completed",
  "Planned",
  "Stalled",
];

function formatBudget(ngn: number, label: string) {
  if (ngn <= 0) return label || "TBA";
  if (ngn >= 1_000_000_000_000) return `₦${(ngn / 1_000_000_000_000).toFixed(1)}T`;
  if (ngn >= 1_000_000_000) return `₦${(ngn / 1_000_000_000).toFixed(1)}B`;
  if (ngn >= 1_000_000) return `₦${(ngn / 1_000_000).toFixed(0)}M`;
  return `₦${ngn.toLocaleString("en-NG")}`;
}

export default function AdminProjectsPage() {
  const { projects } = useProjects({ includeDrafts: true });
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");
  const [status, setStatus] = useState<(typeof statuses)[number]>("All");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (state !== "All" && p.state !== state) return false;
      if (status !== "All" && p.status !== status) return false;
      if (!query) return true;
      return (
        p.title.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query) ||
        p.contractor.toLowerCase().includes(query) ||
        p.lga.toLowerCase().includes(query) ||
        (p.supervisingAgency ?? "").toLowerCase().includes(query)
      );
    });
  }, [projects, q, state, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-navy">Projects</h1>
        <p className="mt-1 text-sm text-slate">
          {filtered.length} of {projects.length} infrastructure records
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, ID, contractor, agency…"
          className="min-w-[220px] flex-1 rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy outline-none placeholder:text-slate/50 focus:border-forest/40"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy"
        >
          <option value="All">All states</option>
          {nigerianStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as (typeof statuses)[number])}
          className="rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm text-navy"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-navy/8 bg-white shadow-sm">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">State / LGA</th>
              <th className="px-4 py-3 font-semibold">Budget</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Contractor</th>
              <th className="px-4 py-3 font-semibold">Agency</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-navy/8 hover:bg-navy/[0.02]">
                <td className="px-4 py-3">
                  <Link
                    href={projectDetailPath(p.id)}
                    className="font-semibold text-navy hover:text-forest"
                    target="_blank"
                  >
                    {p.title}
                  </Link>
                  <p className="text-xs text-slate">
                    {p.id} · {p.category}
                    {p.startDate ? ` · started ${p.startDate}` : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-navy/80">
                  {p.state}
                  <span className="block text-xs text-slate">{p.lga}</span>
                </td>
                <td className="px-4 py-3 text-navy/80">
                  {formatBudget(p.budgetNgn, p.budgetLabel)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-navy/[0.06] px-2 py-0.5 text-[11px] font-semibold text-navy/80">
                    {p.status}
                  </span>
                  {p.reviewStatus !== "published" ? (
                    <span className="ml-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                      {p.reviewStatus}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-navy/70">{p.contractor || "—"}</td>
                <td className="px-4 py-3 text-navy/70">
                  {p.supervisingAgency || "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
