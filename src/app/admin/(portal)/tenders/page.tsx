"use client";

import { useMemo, useState } from "react";
import { useTenders } from "@/lib/db/tenders";
import { nigerianStates } from "@/data/states";

export default function AdminTendersPage() {
  const { tenders, source, loading, importCatalogue, seeding } = useTenders();
  const [q, setQ] = useState("");
  const [state, setState] = useState("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return tenders.filter((t) => {
      if (state !== "All") {
        if (state === "Federal") {
          if (!t.federal) return false;
        } else if (!t.states.includes(state) && !t.federal) {
          return false;
        }
      }
      if (!needle) return true;
      return (
        t.title.toLowerCase().includes(needle) ||
        t.ref.toLowerCase().includes(needle) ||
        t.agency.toLowerCase().includes(needle) ||
        t.sector.toLowerCase().includes(needle)
      );
    });
  }, [tenders, q, state]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-navy">Tenders</h1>
          <p className="mt-1 text-sm text-slate">
            {filtered.length} of {tenders.length} procurement windows ·{" "}
            {source === "database" ? "live + catalogue" : "bundled catalogue"}
            {loading ? " · loading…" : ""}
          </p>
        </div>
        <button
          type="button"
          disabled={seeding}
          onClick={() => void importCatalogue()}
          className="rounded-xl border border-navy/12 px-4 py-2.5 text-sm font-semibold text-navy/70 hover:bg-navy/[0.04] disabled:opacity-50"
        >
          {seeding ? "Importing…" : "Refresh catalogue"}
        </button>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, reference, MDA…"
          className="min-w-[220px] flex-1 rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest/40"
        />
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm"
        >
          <option value="All">All jurisdictions</option>
          <option value="Federal">Federal</option>
          {nigerianStates.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-navy/8 bg-white shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">MDA</th>
              <th className="px-4 py-3 font-semibold">Budget</th>
              <th className="px-4 py-3 font-semibold">Deadline</th>
              <th className="px-4 py-3 font-semibold">Source</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr key={t.id} className="border-t border-navy/8 hover:bg-navy/[0.02]">
                <td className="px-4 py-3 font-mono text-xs text-forest">{t.ref}</td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-navy">{t.title}</p>
                  <p className="text-xs text-slate">
                    {t.sector} · {t.federal ? "Federal" : t.states.join(", ") || "—"}
                    {t.urgent ? " · urgent" : ""}
                  </p>
                </td>
                <td className="px-4 py-3 text-navy/70">{t.agency}</td>
                <td className="px-4 py-3 text-navy/80">{t.budget}</td>
                <td className="px-4 py-3 text-navy/70">{t.deadline}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-navy/[0.05] px-2 py-0.5 text-[11px] font-semibold text-navy/70">
                    {t.live ? "database" : "catalogue"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
