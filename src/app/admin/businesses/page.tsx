"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { stateDisplayName } from "@/data/marketplace";
import { useBusinesses } from "@/lib/db/businesses";
import { useSession } from "@/components/SessionProvider";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { BUSINESSES_CHANGED_EVENT } from "@/lib/db/businessEvents";

export default function AdminBusinessesPage() {
  const { allBusinesses, source, reload, loading } = useBusinesses(undefined, {
    includeAllStatuses: true,
  });
  const { listings, setListingStatus } = useSession();
  const [q, setQ] = useState("");

  const fromDb = allBusinesses.length > 0;
  const needle = q.trim().toLowerCase();

  const dbFiltered = useMemo(() => {
    return allBusinesses.filter((b) => {
      if (!needle) return true;
      return (
        b.name.toLowerCase().includes(needle) ||
        b.state.toLowerCase().includes(needle) ||
        b.category.toLowerCase().includes(needle) ||
        (b.lga ?? "").toLowerCase().includes(needle)
      );
    });
  }, [allBusinesses, needle]);

  const listingFiltered = useMemo(() => {
    return listings.filter((b) => {
      if (!needle) return true;
      return (
        b.name.toLowerCase().includes(needle) ||
        b.state.toLowerCase().includes(needle)
      );
    });
  }, [listings, needle]);

  const count = fromDb ? dbFiltered.length : listingFiltered.length;

  const onSetStatus = async (id: string, status: "live" | "hidden") => {
    if (fromDb && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from("businesses")
        .update({ status })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(status === "live" ? "Listing published." : "Listing hidden.");
      window.dispatchEvent(new Event(BUSINESSES_CHANGED_EVENT));
      await reload();
      return;
    }
    setListingStatus(id, status);
    toast.success(status === "live" ? "Listing published." : "Listing hidden.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-navy">Businesses</h1>
        <p className="mt-1 text-sm text-slate">
          {count} listings ·{" "}
          {fromDb
            ? `live from database (${source})`
            : "session / marketplace seed"}
          {loading ? " · loading…" : ""}
        </p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search name, category, state…"
        className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest/40"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {fromDb
          ? dbFiltered.map((b) => (
              <article
                key={b.id}
                className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-navy">{b.name}</p>
                <p className="mt-1 text-xs text-slate">
                  {b.category}
                  {b.subcategory ? ` · ${b.subcategory}` : ""}
                </p>
                <p className="mt-3 text-sm text-navy/70">
                  {stateDisplayName(b.state)}
                  {b.lga ? ` · ${b.lga}` : ""}
                </p>
                {b.phone ? <p className="mt-1 text-xs text-slate">{b.phone}</p> : null}
                {b.email ? <p className="text-xs text-slate">{b.email}</p> : null}
                <p className="mt-2 line-clamp-2 text-xs text-slate">
                  {b.description || "No description"}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                      b.verified
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-amber-50 text-amber-800"
                    }`}
                  >
                    {b.verified ? "verified" : "unverified"}
                  </span>
                  <span className="rounded-full bg-navy/[0.05] px-2 py-0.5 text-[11px] font-semibold text-navy/70">
                    {b.listingStatus ?? "live"}
                  </span>
                  <span className="text-[11px] text-slate">
                    ★ {b.rating.toFixed(1)} · {b.reviews} reviews
                  </span>
                </div>
                <div className="mt-3 flex gap-2">
                  {b.listingStatus !== "live" && (
                    <button
                      type="button"
                      onClick={() => void onSetStatus(b.id, "live")}
                      className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Publish
                    </button>
                  )}
                  {b.listingStatus !== "hidden" && (
                    <button
                      type="button"
                      onClick={() => void onSetStatus(b.id, "hidden")}
                      className="rounded-lg border border-navy/12 px-3 py-1.5 text-xs font-semibold text-navy/70"
                    >
                      Hide
                    </button>
                  )}
                </div>
              </article>
            ))
          : listingFiltered.map((b) => (
              <article
                key={b.id}
                className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm"
              >
                <p className="font-semibold text-navy">{b.name}</p>
                <p className="mt-1 text-xs text-slate">{stateDisplayName(b.state)}</p>
                <span className="mt-3 inline-flex rounded-full bg-navy/[0.05] px-2 py-0.5 text-[11px] font-semibold text-navy/70">
                  {b.status}
                </span>
                <div className="mt-3 flex gap-2">
                  {b.status !== "live" && (
                    <button
                      type="button"
                      onClick={() => void onSetStatus(b.id, "live")}
                      className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white"
                    >
                      Publish
                    </button>
                  )}
                  {b.status !== "hidden" && (
                    <button
                      type="button"
                      onClick={() => void onSetStatus(b.id, "hidden")}
                      className="rounded-lg border border-navy/12 px-3 py-1.5 text-xs font-semibold text-navy/70"
                    >
                      Hide
                    </button>
                  )}
                </div>
              </article>
            ))}
      </div>
    </div>
  );
}
