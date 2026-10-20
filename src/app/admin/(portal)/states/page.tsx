"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Landmark, Search, ShieldCheck, ShieldX } from "lucide-react";
import { nigerianStates } from "@/data/states";
import { type ProfileRow } from "@/lib/session";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { fetchAdminUsers, patchAdminUser } from "@/lib/db/adminProfiles";

type Row = {
  state: string;
  profile: ProfileRow | null;
  projects: number;
  content: number;
};

function tally(data: { state: string | null }[] | null) {
  const map = new Map<string, number>();
  for (const item of data ?? []) {
    if (!item.state) continue;
    const key = item.state.replace(/\s+state$/i, "").trim();
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return map;
}

async function fetchStateRows(): Promise<Row[]> {
  const blank = nigerianStates.map((state) => ({
    state,
    profile: null,
    projects: 0,
    content: 0,
  }));
  if (!isApiConfigured()) return blank;

  const [projects, content, users] = await Promise.allSettled([
    apiFetch<{ projects?: { state: string | null }[] }>("/api/projects", { anonymous: true }),
    apiFetch<{ items?: { state: string | null }[] }>("/api/state-content", { anonymous: true }),
    fetchAdminUsers(),
  ]);

  const govtByState = new Map<string, ProfileRow>();
  if (users.status === "fulfilled") {
    for (const profile of users.value) {
      if (profile.role !== "govt" || !profile.govt_state) continue;
      govtByState.set(profile.govt_state.replace(/\s+state$/i, "").trim(), profile);
    }
  }

  const projectCounts = tally(
    projects.status === "fulfilled" ? (projects.value.projects ?? null) : null,
  );
  const contentCounts = tally(
    content.status === "fulfilled" ? (content.value.items ?? null) : null,
  );

  return nigerianStates.map((state) => ({
    state,
    profile: govtByState.get(state) ?? null,
    projects: projectCounts.get(state) ?? 0,
    content: contentCounts.get(state) ?? 0,
  }));
}
export default function AdminStatesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setRows(await fetchStateRows());
    setLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const next = await fetchStateRows();
      if (!active) return;
      setRows(next);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, []);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(
      (row) =>
        row.state.toLowerCase().includes(needle) ||
        (row.profile?.email ?? "").toLowerCase().includes(needle),
    );
  }, [rows, query]);

  const provisioned = rows.filter((row) => row.profile).length;

  const onToggleStatus = async (row: Row) => {
    if (!row.profile) return;
    const next = row.profile.account_status === "active" ? "suspended" : "active";
    try {
      await patchAdminUser(row.profile.id, { account_status: next });
      toast.success(next === "suspended" ? "Account suspended." : "Account reactivated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update account.");
    }
    await load();
  };
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-navy">State governments</h1>
          <p className="mt-1 text-sm text-slate">
            {provisioned} of {nigerianStates.length} states have a portal login.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-2 rounded-xl border border-navy/10 px-4 py-2.5 text-sm font-semibold text-navy/70 hover:bg-navy/[0.04] hover:text-navy"
        >
          Refresh
        </button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/60" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search state or email…"
          className="w-full rounded-xl border border-navy/8 bg-navy/[0.04] py-2.5 pl-9 pr-3 text-sm text-navy outline-none placeholder:text-slate focus:border-forest/40"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate">Loading state accounts…</p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-navy/8">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-slate">
              <tr>
                <th className="px-4 py-3 font-semibold">State</th>
                <th className="px-4 py-3 font-semibold">Login</th>
                <th className="px-4 py-3 font-semibold">Projects</th>
                <th className="px-4 py-3 font-semibold">Hub entries</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.state} className="border-t border-navy/8 hover:bg-navy/[0.02]">
                  <td className="px-4 py-3">
                    <p className="flex items-center gap-2 font-semibold text-navy">
                      <Landmark className="h-3.5 w-3.5 text-forest" />
                      {row.state}
                    </p>
                    {row.profile?.full_name ? (
                      <p className="mt-0.5 text-xs text-slate">
                        {row.profile.full_name}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-slate">
                    {row.profile?.email ?? (
                      <span className="text-slate/60">Not provisioned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-navy/70">{row.projects}</td>
                  <td className="px-4 py-3 text-navy/70">{row.content}</td>
                  <td className="px-4 py-3">
                    {row.profile ? (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          row.profile.account_status === "active"
                            ? "bg-emerald-400/15 text-forest"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {row.profile.account_status}
                      </span>
                    ) : (
                      <span className="rounded-full bg-navy/[0.06] px-2 py-0.5 text-[11px] font-semibold text-slate">
                        missing
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.profile ? (
                      <button
                        type="button"
                        onClick={() => void onToggleStatus(row)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-navy/10 px-3 py-1.5 text-xs font-semibold text-navy/65 hover:bg-navy/[0.04] hover:text-navy"
                      >
                        {row.profile.account_status === "active" ? (
                          <>
                            <ShieldX className="h-3.5 w-3.5" />
                            Suspend
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Reactivate
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="text-xs text-slate/50">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
