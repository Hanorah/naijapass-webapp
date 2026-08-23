"use client";

import { federalTenders } from "@/data/federalTenders";

export default function AdminTendersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Tenders</h1>
        <p className="mt-1 text-sm text-white/50">
          Federal and state procurement windows currently seeded in the app.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-white/[0.04] text-xs uppercase tracking-wide text-white/45">
            <tr>
              <th className="px-4 py-3 font-semibold">Reference</th>
              <th className="px-4 py-3 font-semibold">Title</th>
              <th className="px-4 py-3 font-semibold">MDA</th>
              <th className="px-4 py-3 font-semibold">Value</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {federalTenders.map((t) => (
              <tr
                key={t.reference}
                className="border-t border-white/8 hover:bg-white/[0.02]"
              >
                <td className="px-4 py-3 font-mono text-xs text-emerald-300/90">
                  {t.reference}
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-white">{t.title}</p>
                  <p className="text-xs text-white/40">
                    {t.sector} · {t.state ?? "Federal"} · due {t.deadline}
                  </p>
                </td>
                <td className="px-4 py-3 text-white/65">{t.mda}</td>
                <td className="px-4 py-3 text-white/80">
                  ₦{t.value.toLocaleString("en-NG")}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-semibold capitalize text-white/80">
                    {t.status}
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
