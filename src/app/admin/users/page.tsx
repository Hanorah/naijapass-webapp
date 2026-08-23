"use client";

import { directoryUsers } from "@/data/users";
import { roleLabels } from "@/lib/session";
import { stateDisplayName } from "@/data/marketplace";

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Users</h1>
        <p className="mt-1 text-sm text-white/50">
          Individuals and businesses. Admins manage access here.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-white/45">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">State</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {directoryUsers.map((account) => (
              <tr
                key={account.id}
                className="border-t border-white/8 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{account.name}</p>
                  <p className="text-xs text-white/40">{account.email}</p>
                </td>
                <td className="px-4 py-3 text-white/70">
                  {roleLabels[account.role]}
                </td>
                <td className="px-4 py-3 text-white/70">
                  {stateDisplayName(account.state)}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      account.status === "verified"
                        ? "bg-emerald-400/15 text-emerald-300"
                        : account.status === "pending"
                          ? "bg-amber-400/15 text-amber-200"
                          : "bg-rose-400/15 text-rose-300"
                    }`}
                  >
                    {account.status}
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
