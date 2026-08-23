"use client";

import { directoryUsers } from "@/data/users";
import { stateDisplayName } from "@/data/marketplace";

export default function AdminBusinessesPage() {
  const businesses = directoryUsers.filter((u) => u.role === "business");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Businesses</h1>
        <p className="mt-1 text-sm text-white/50">
          Verified and pending business accounts in the directory.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {businesses.map((b) => (
          <article
            key={b.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <p className="font-semibold text-white">{b.name}</p>
            <p className="mt-1 text-xs text-white/45">{b.email}</p>
            <p className="mt-3 text-sm text-white/65">
              {stateDisplayName(b.state)}
            </p>
            <span
              className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                b.status === "verified"
                  ? "bg-emerald-400/15 text-emerald-300"
                  : "bg-amber-400/15 text-amber-200"
              }`}
            >
              {b.status}
            </span>
          </article>
        ))}
      </div>
    </div>
  );
}
