"use client";

import { useMemo, useState } from "react";
import { type ProjectStatus } from "@/data/projects";
import { nigerianStates } from "@/data/states";
import { useProjects } from "@/lib/db/projects";

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
  // Admins see drafts too, so a state's unpublished work is never invisible.
  const { projects, source } = useProjects({ includeDrafts: true });
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
        p.lga.toLowerCase().includes(query)
      );
    });
  }, [projects, q, state, status]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Projects</h1>
        <p className="mt-1 text-sm text-white/50">
          {filtered.length} of {projects.length} infrastructure records ·{" "}
          {source === "database"
            ? "live from the database"
            : "bundled seed data"}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, ID, contractor…"
          className="min-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-emerald-400/40"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#121a2b] px-3 py-2.5 text-sm text-white"
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
          className="rounded-xl border border-white/10 bg-[#121a2b] px-3 py-2.5 text-sm text-white"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-white/45">
            <tr>
              <th className="px-4 py-3 font-semibold">Project</th>
              <th className="px-4 py-3 font-semibold">State</th>
              <th className="px-4 py-3 font-semibold">Budget</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Contractor</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-white/8 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{p.title}</p>
                  <p className="text-xs text-white/40">
                    {p.id} · {p.category}
                  </p>
                </td>
                <td className="px-4 py-3 text-white/70">
                  {p.state}
                  <span className="block text-xs text-white/35">{p.lga}</span>
                </td>
                <td className="px-4 py-3 text-white/80">
                  {formatBudget(p.budgetNgn, p.budgetLabel)}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-white/80">
                    {p.status}
                  </span>
                  {p.reviewStatus !== "published" ? (
                    <span className="ml-1.5 rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                      {p.reviewStatus}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-white/65">{p.contractor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
