"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { roleLabels } from "@/lib/session";
import { stateDisplayName } from "@/data/marketplace";
import { patchAdminUser, useAdminProfiles } from "@/lib/db/adminProfiles";
export default function AdminUsersPage() {
  const { profiles, source, reload, loading, applyPatch } = useAdminProfiles();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("All");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return profiles.filter((u) => {
      if (role !== "All" && u.role !== role) return false;
      if (!needle) return true;
      return (
        (u.full_name ?? "").toLowerCase().includes(needle) ||
        (u.email ?? "").toLowerCase().includes(needle) ||
        (u.business_name ?? "").toLowerCase().includes(needle) ||
        (u.state ?? "").toLowerCase().includes(needle)
      );
    });
  }, [profiles, q, role]);

  const onToggle = async (id: string, current: string) => {
    if (source !== "database") {
      toast.error("Connect the API to manage accounts.");
      return;
    }
    const next =
      current === "active" || current === "verified" ? "suspended" : "active";
    try {
      await patchAdminUser(id, { account_status: next });
      applyPatch(id, { account_status: next });
      toast.success(next === "suspended" ? "Account suspended." : "Account reactivated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update account.");
      await reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-navy">Users</h1>
        <p className="mt-1 text-sm text-slate">
          {filtered.length} accounts · {source === "database" ? "live profiles" : "directory seed"}
          {loading ? " · loading…" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search name, email, state…"
          className="min-w-[220px] flex-1 rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest/40"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm"
        >
          <option value="All">All roles</option>
          <option value="individual">Individual</option>
          <option value="business">Business</option>
          <option value="govt">Government</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-navy/8 bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-navy/[0.03] text-xs uppercase tracking-wide text-slate">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">State</th>
              <th className="px-4 py-3 font-semibold">KYC</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((account) => (
              <tr key={account.id} className="border-t border-navy/8 hover:bg-navy/[0.02]">
                <td className="px-4 py-3">
                  <p className="font-semibold text-navy">
                    {account.full_name || account.business_name || "—"}
                  </p>
                  <p className="text-xs text-slate">{account.email}</p>
                  {account.phone ? (
                    <p className="text-xs text-slate">{account.phone}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-navy/70">
                  {roleLabels[account.role as keyof typeof roleLabels] ?? account.role}
                  {account.department ? (
                    <span className="block text-xs text-slate">{account.department}</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-navy/70">
                  {stateDisplayName(account.govt_state ?? account.state ?? "")}
                </td>
                <td className="px-4 py-3 text-navy/70">{account.kyc_status}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      account.account_status === "active" || account.account_status === "verified"
                        ? "bg-emerald-50 text-emerald-800"
                        : account.account_status === "pending"
                          ? "bg-amber-50 text-amber-800"
                          : "bg-rose-50 text-rose-700"
                    }`}
                  >
                    {account.account_status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {account.role !== "admin" ? (
                    <button
                      type="button"
                      onClick={() => void onToggle(account.id, account.account_status)}
                      className="rounded-lg border border-navy/12 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:bg-navy/[0.04]"
                    >
                      {account.account_status === "active" || account.account_status === "verified"
                        ? "Suspend"
                        : "Reactivate"}
                    </button>
                  ) : (
                    <span className="text-xs text-slate">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
