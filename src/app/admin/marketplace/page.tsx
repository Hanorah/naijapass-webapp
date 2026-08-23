"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { marketplaceCategories, stateDisplayName } from "@/data/marketplace";
import { useSession } from "@/components/SessionProvider";
import { useBusinesses } from "@/lib/db/businesses";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { BUSINESSES_CHANGED_EVENT } from "@/lib/db/businessEvents";

export default function AdminMarketplacePage() {
  const { listings, setListingStatus } = useSession();
  const { allBusinesses, reload } = useBusinesses(undefined, {
    includeAllStatuses: true,
  });
  const [q, setQ] = useState("");

  const fromDb = allBusinesses.length > 0;

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (fromDb) {
      return allBusinesses
        .filter((b) => {
          if (!needle) return true;
          return (
            b.name.toLowerCase().includes(needle) ||
            b.state.toLowerCase().includes(needle) ||
            b.category.toLowerCase().includes(needle)
          );
        })
        .map((b) => ({
          id: b.id,
          name: b.name,
          category: b.category,
          state: b.state,
          status: b.listingStatus ?? (b.verified ? "live" : "hidden"),
          detail: `${b.lga || "—"} · ★ ${b.rating.toFixed(1)} · ${b.phone || "no phone"}`,
          live: true as const,
        }));
    }
    return listings
      .filter((l) => {
        if (!needle) return true;
        return l.name.toLowerCase().includes(needle);
      })
      .map((l) => ({
        id: l.id,
        name: l.name,
        category: l.category,
        state: l.state,
        status: l.status,
        detail:
          marketplaceCategories.find((cat) => cat.id === l.category)?.label ??
          l.category,
        live: false as const,
      }));
  }, [allBusinesses, listings, fromDb, q]);

  const onSetStatus = async (id: string, status: "live" | "hidden", live: boolean) => {
    if (live && isSupabaseConfigured()) {
      const supabase = createClient();
      const { error } = await supabase
        .from("businesses")
        .update({ status })
        .eq("id", id);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(status === "live" ? "Published." : "Hidden.");
      window.dispatchEvent(new Event(BUSINESSES_CHANGED_EVENT));
      await reload();
      return;
    }
    setListingStatus(id, status);
    toast.success(status === "live" ? "Published." : "Hidden.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-navy">Marketplace</h1>
        <p className="mt-1 text-sm text-slate">
          Publish or hide vendor listings shown in the Market Hub · {rows.length}{" "}
          {fromDb ? "from database" : "from session"}
        </p>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search listings…"
        className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest/40"
      />

      <ul className="space-y-3">
        {rows.map((listing) => (
          <li
            key={listing.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-navy/8 bg-white p-4 shadow-sm"
          >
            <div>
              <p className="font-semibold text-navy">{listing.name}</p>
              <p className="text-xs text-slate">
                {listing.category} · {stateDisplayName(listing.state)} ·{" "}
                {listing.status}
              </p>
              <p className="mt-1 text-xs text-slate">{listing.detail}</p>
            </div>
            <div className="flex gap-2">
              {listing.status !== "live" && (
                <button
                  type="button"
                  onClick={() => void onSetStatus(listing.id, "live", listing.live)}
                  className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white"
                >
                  Publish
                </button>
              )}
              {listing.status !== "hidden" && (
                <button
                  type="button"
                  onClick={() => void onSetStatus(listing.id, "hidden", listing.live)}
                  className="rounded-lg border border-navy/15 px-3 py-1.5 text-xs font-semibold text-navy/80"
                >
                  Hide
                </button>
              )}
            </div>
          </li>
        ))}
        {rows.length === 0 ? (
          <p className="text-sm text-slate">No marketplace listings yet.</p>
        ) : null}
      </ul>
    </div>
  );
}
