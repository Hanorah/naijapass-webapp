"use client";

import toast from "react-hot-toast";
import { useSession } from "@/components/SessionProvider";
import { marketplaceCategories, stateDisplayName } from "@/data/marketplace";

export default function AdminMarketplacePage() {
  const { listings, setListingStatus } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Marketplace</h1>
        <p className="mt-1 text-sm text-white/50">
          Publish or hide vendor listings shown in the Market Hub.
        </p>
      </div>

      <ul className="space-y-3">
        {listings.map((listing) => (
          <li
            key={listing.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div>
              <p className="font-semibold text-white">{listing.name}</p>
              <p className="text-xs text-white/45">
                {
                  marketplaceCategories.find((cat) => cat.id === listing.category)
                    ?.label
                }{" "}
                · {stateDisplayName(listing.state)} · {listing.status}
              </p>
            </div>
            <div className="flex gap-2">
              {listing.status !== "live" && (
                <button
                  type="button"
                  onClick={() => {
                    setListingStatus(listing.id, "live");
                    toast.success(`${listing.name} is live.`);
                  }}
                  className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-[#0b1220]"
                >
                  Publish
                </button>
              )}
              {listing.status !== "hidden" && (
                <button
                  type="button"
                  onClick={() => {
                    setListingStatus(listing.id, "hidden");
                    toast.success(`${listing.name} hidden.`);
                  }}
                  className="rounded-lg border border-white/15 px-3 py-1.5 text-xs font-semibold text-white/80"
                >
                  Hide
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
