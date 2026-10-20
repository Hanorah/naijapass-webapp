"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Gavel, MapPin, Plus, Search, Star } from "lucide-react";
import InitialsAvatar from "@/components/InitialsAvatar";
import ListingComposer from "@/components/dashboard/ListingComposer";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import { useSession } from "@/components/SessionProvider";
import { useBusinesses } from "@/lib/db/businesses";
import { directoryCategories } from "@/data/businesses";
import { stateDisplayName, type MarketplaceListing } from "@/data/marketplace";
import { uploadBusinessImage } from "@/lib/storage/businessImage";

export default function MarketplaceHub() {
  const { search, setSearch, selectedState } = useDashboardSearch();
  const { user, listings, addListing } = useSession();
  const { businesses, loading } = useBusinesses(selectedState);
  const [composerOpen, setComposerOpen] = useState(false);
  const isBusiness = user?.role === "business" || user?.role === "admin";

  const filteredBusinesses = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((biz) => {
      const hay = `${biz.name} ${biz.subcategory} ${biz.address} ${biz.lga}`.toLowerCase();
      return hay.includes(q);
    });
  }, [businesses, search]);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((item) => {
      if (item.status !== "live") return false;
      if (item.state !== selectedState) return false;
      if (!q) return true;
      return `${item.name} ${item.subcategory} ${item.description ?? ""}`
        .toLowerCase()
        .includes(q);
    });
  }, [listings, search, selectedState]);

  const stateLabel = stateDisplayName(selectedState);

  const onCreate = async (listing: MarketplaceListing) => {
    let image = listing.image;
    if (image?.startsWith("data:") && user) {
      try {
        const blob = await (await fetch(image)).blob();
        const file = new File([blob], "listing.jpg", { type: blob.type || "image/jpeg" });
        const uploaded = await uploadBusinessImage(user.id ?? user.email, file);
        if (uploaded.url) image = uploaded.url;
      } catch {
        /* keep data URL fallback for offline */
      }
    }
    await addListing({ ...listing, image });
    setComposerOpen(false);
    toast.success(
      listing.status === "live"
        ? "Listing published."
        : "Listing submitted for review.",
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-label mb-2">Market Hub</p>
          <h1 className="font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            Verified businesses in {stateLabel}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate md:text-base">
            Browse registered companies and live marketplace listings.
            {isBusiness
              ? " Publish a listing or manage your company profile, then bid on contracts."
              : " Save suppliers and explore contractors in your state."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isBusiness && (
            <>
              <button
                type="button"
                onClick={() => setComposerOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
              >
                <Plus className="h-4 w-4" />
                Publish listing
              </button>
              <Link
                href="/dashboard/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
              >
                Manage my business
              </Link>
              <Link
                href="/dashboard/procurement"
                className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
              >
                <Gavel className="h-4 w-4" />
                Bid on contracts
              </Link>
            </>
          )}
        </div>
      </div>

      <label className="relative mb-6 block max-w-xl">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search businesses and listings…"
          className="w-full rounded-xl border border-navy/10 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-forest/20"
        />
      </label>

      <p className="mb-4 text-sm font-semibold text-navy">
        {loading
          ? "Loading…"
          : `${filteredBusinesses.length} businesses · ${filteredListings.length} listings in ${stateLabel}`}
      </p>

      {loading ? (
        <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-10 text-center text-slate">
          Loading businesses…
        </p>
      ) : filteredBusinesses.length === 0 && filteredListings.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-10 text-center text-slate">
          No verified businesses or listings in {stateLabel} yet.
          {isBusiness ? " Publish a listing or set up your company profile." : ""}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredListings.map((item) => (
            <article
              key={`listing-${item.id}`}
              className="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-sm"
            >
              <div className="relative h-36 bg-mist">
                {item.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full items-center justify-center">
                    <InitialsAvatar name={item.name} size={64} rounded="2xl" />
                  </span>
                )}
                <span className="absolute left-3 top-3 rounded-md bg-navy px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                  Listing
                </span>
              </div>
              <div className="p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate">
                  {item.category} · {item.subcategory}
                </p>
                <h2 className="mt-1 font-display text-base font-bold leading-snug text-navy">
                  {item.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-sm text-slate">
                  {item.description || "Marketplace listing"}
                </p>
                <p className="mt-2 inline-flex items-center gap-1 text-sm text-slate">
                  <MapPin className="h-3.5 w-3.5 text-forest" />
                  {item.lga || stateLabel}
                </p>
              </div>
            </article>
          ))}

          {filteredBusinesses.map((biz) => {
            const categoryLabel =
              directoryCategories.find((c) => c.id === biz.category)?.label ??
              biz.category;
            return (
              <article
                key={biz.id}
                className="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <Link href={`/dashboard/directory/${biz.id}`} className="block">
                  <div className="relative h-36 bg-mist">
                    {biz.image ? (
                      <Image
                        src={biz.image}
                        alt={biz.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center">
                        <InitialsAvatar name={biz.name} size={64} rounded="2xl" />
                      </span>
                    )}
                    {biz.verified && (
                      <span className="absolute left-3 top-3 rounded-md bg-forest px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Verified
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate">
                    {categoryLabel} · {biz.subcategory}
                  </p>
                  <Link href={`/dashboard/directory/${biz.id}`}>
                    <h2 className="mt-1 font-display text-base font-bold leading-snug text-navy hover:text-forest">
                      {biz.name}
                    </h2>
                  </Link>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                    <span className="inline-flex items-center gap-1 font-semibold text-navy">
                      <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
                      {biz.rating.toFixed(1)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-slate">
                      <MapPin className="h-3.5 w-3.5 text-forest" />
                      {biz.lga}
                    </span>
                  </div>
                  <Link
                    href={`/dashboard/directory/${biz.id}`}
                    className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy-muted"
                  >
                    View company profile
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {composerOpen && (
        <ListingComposer
          defaultState={selectedState}
          defaultName={user?.name}
          ownerEmail={user?.email}
          onClose={() => setComposerOpen(false)}
          onCreate={(listing) => {
            void onCreate(listing);
          }}
        />
      )}
    </div>
  );
}
