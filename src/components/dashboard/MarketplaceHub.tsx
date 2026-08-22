"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  Bookmark,
  Gavel,
  Globe,
  MapPin,
  Search,
  Star,
  Store,
  Wrench,
  X,
} from "lucide-react";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import { useSession } from "@/components/SessionProvider";
import {
  marketplaceCategories,
  marketplaceLgas,
  stateDisplayName,
  type MarketplaceCategory,
  type MarketplaceListing,
  type WebsiteMode,
} from "@/data/marketplace";

export default function MarketplaceHub() {
  const { search, setSearch, selectedState } = useDashboardSearch();
  const { user, listings, addListing } = useSession();
  const [state, setState] = useState(selectedState);
  const [lga, setLga] = useState("All LGAs");
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [composer, setComposer] = useState(false);

  const canCreate = user?.role === "business" || user?.role === "admin";
  const canBid = canCreate;
  const lgas = marketplaceLgas[state] ?? ["All LGAs"];

  useEffect(() => {
    if (marketplaceLgas[selectedState]) {
      setState(selectedState);
      setLga("All LGAs");
    }
  }, [selectedState]);

  const counts = useMemo(() => {
    const map = Object.fromEntries(
      marketplaceCategories.map((cat) => [cat.id, 0]),
    ) as Record<MarketplaceCategory, number>;
    for (const listing of listings) {
      if (listing.status !== "hidden") map[listing.category] += 1;
    }
    return map;
  }, [listings]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((listing) => {
      if (listing.status === "hidden") return false;
      if (user?.role !== "admin" && listing.status === "pending") {
        if (listing.ownerEmail !== user?.email) return false;
      }
      if (listing.state !== state) return false;
      if (lga !== "All LGAs" && listing.lga !== lga) return false;
      if (categories.length && !categories.includes(listing.category)) {
        return false;
      }
      if (q) {
        const hay = `${listing.name} ${listing.subcategory} ${listing.location}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [listings, state, lga, categories, search, user]);

  const myListings = useMemo(
    () =>
      canCreate
        ? listings.filter((item) => item.ownerEmail === user?.email)
        : [],
    [canCreate, listings, user?.email],
  );

  const toggleCat = (id: MarketplaceCategory) => {
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const reset = () => {
    setLga("All LGAs");
    setCategories([]);
    setSearch("");
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="section-label mb-2">Market Hub</p>
          <h1 className="font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            Verified businesses near {stateDisplayName(state)}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate md:text-base">
            Browse listings, open full profiles, and connect with suppliers.
            {canBid
              ? " As a business you can publish listings and bid on government contracts."
              : " Save services and explore contractors in your state."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {canBid && (
            <Link
              href="/dashboard/procurement"
              className="inline-flex items-center gap-2 rounded-xl border border-navy/15 bg-white px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
            >
              <Gavel className="h-4 w-4 text-forest" />
              Bid on contracts
            </Link>
          )}
          {canCreate && (
            <button
              type="button"
              onClick={() => setComposer(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              <Store className="h-4 w-4" />
              Create listing
            </button>
          )}
        </div>
      </div>

      {canCreate && myListings.length > 0 && (
        <section className="mb-6 rounded-2xl border border-forest/15 bg-orange-soft/40 p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-sm font-bold text-navy">
              Your listings ({myListings.length})
            </h2>
            <Link
              href={`/dashboard/marketplace/${myListings[0].id}`}
              className="text-xs font-semibold text-forest"
            >
              Manage
            </Link>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {myListings.slice(0, 4).map((item) => (
              <Link
                key={item.id}
                href={`/dashboard/marketplace/${item.id}`}
                className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-navy shadow-sm ring-1 ring-navy/8"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search businesses..."
              className="w-full rounded-xl border border-navy/10 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-forest/20"
            />
          </label>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setLga("All LGAs");
              }}
              className="rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm"
            >
              {Object.keys(marketplaceLgas).map((item) => (
                <option key={item} value={item}>
                  {stateDisplayName(item)}
                </option>
              ))}
            </select>
            <select
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              className="rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm"
            >
              {lgas.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate">
            Categories
          </p>
          <div className="mt-2 space-y-1.5">
            {marketplaceCategories.map((cat) => (
              <label
                key={cat.id}
                className="flex cursor-pointer items-center justify-between rounded-lg px-1 py-1.5 text-sm"
              >
                <span className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={categories.includes(cat.id)}
                    onChange={() => toggleCat(cat.id)}
                    className="accent-forest"
                  />
                  {cat.label}
                </span>
                <span className="text-xs text-slate">({counts[cat.id]})</span>
              </label>
            ))}
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-5 w-full rounded-xl border border-navy/15 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
          >
            Reset Filters
          </button>
        </aside>

        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm font-semibold text-navy">
              {filtered.length} listings in {stateDisplayName(state)}
            </p>
          </div>

          {filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-10 text-center text-slate">
              No Market Hub listings match these filters.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((listing) => (
                <ListingCard
                  key={listing.id}
                  listing={listing}
                  saved={saved.includes(listing.id)}
                  onSave={() =>
                    setSaved((prev) =>
                      prev.includes(listing.id)
                        ? prev.filter((id) => id !== listing.id)
                        : [...prev, listing.id],
                    )
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {composer && (
        <ListingComposer
          defaultState={state}
          defaultName={user?.role === "business" ? user.name : ""}
          ownerEmail={user?.email}
          onClose={() => setComposer(false)}
          onCreate={(listing) => {
            addListing(listing);
            setComposer(false);
            setState(listing.state);
            toast.success(`${listing.name} is now live on Market Hub.`);
          }}
        />
      )}
    </div>
  );
}

function ListingCard({
  listing,
  saved,
  onSave,
}: {
  listing: MarketplaceListing;
  saved: boolean;
  onSave: () => void;
}) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/dashboard/marketplace/${listing.id}`} className="block">
        <div
          className="relative h-36 bg-cover bg-center"
          style={{
            backgroundImage: `url(${
              listing.image ||
              "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80"
            })`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-navy/50 to-transparent" />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
            {(listing.verified || listing.integrated) && (
              <span className="rounded-md bg-forest px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Verified
              </span>
            )}
            {listing.topRated && (
              <span className="rounded-md bg-orange px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                Top Rated
              </span>
            )}
            {listing.status === "pending" && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800">
                Pending
              </span>
            )}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/dashboard/marketplace/${listing.id}`} className="min-w-0">
            <h2 className="font-display text-base font-bold leading-snug text-navy group-hover:text-forest">
              {listing.name}
            </h2>
            <p className="mt-1 text-sm text-slate">{listing.subcategory}</p>
          </Link>
          <button
            type="button"
            aria-label="Save listing"
            onClick={onSave}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
              saved
                ? "border-forest bg-orange-soft text-forest"
                : "border-navy/10 text-slate hover:bg-mist"
            }`}
          >
            <Bookmark className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <span className="inline-flex items-center gap-1 font-semibold text-navy">
            <Star className="h-4 w-4 text-amber-500" fill="currentColor" />
            {listing.rating.toFixed(1)}
          </span>
          <span className="inline-flex items-center gap-1 text-slate">
            <MapPin className="h-3.5 w-3.5 text-forest" />
            {listing.lga}
          </span>
        </div>

        {listing.websiteMode === "url" && listing.website ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-forest">
            <Globe className="h-3.5 w-3.5" /> Website listed
          </p>
        ) : listing.websiteMode === "request-build" ? (
          <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-amber-700">
            <Wrench className="h-3.5 w-3.5" /> Build request
          </p>
        ) : null}

        <Link
          href={`/dashboard/marketplace/${listing.id}`}
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-navy py-2.5 text-sm font-semibold text-white hover:bg-navy-muted"
        >
          View full profile
        </Link>
      </div>
    </article>
  );
}

function ListingComposer({
  defaultState,
  defaultName,
  ownerEmail,
  onClose,
  onCreate,
}: {
  defaultState: string;
  defaultName: string;
  ownerEmail?: string;
  onClose: () => void;
  onCreate: (listing: MarketplaceListing) => void;
}) {
  const [name, setName] = useState(defaultName);
  const [category, setCategory] = useState<MarketplaceCategory>("construction");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [websiteMode, setWebsiteMode] = useState<WebsiteMode>("url");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState(
    marketplaceLgas[defaultState] ? defaultState : "Lagos",
  );
  const [lga, setLga] = useState(
    marketplaceLgas[defaultState]?.[1] ??
      marketplaceLgas.Lagos?.[1] ??
      "Municipal",
  );
  const lgas = (marketplaceLgas[state] ?? ["All LGAs"]).filter(
    (item) => item !== "All LGAs",
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subcategory.trim()) {
      toast.error("Enter a business name and service category.");
      return;
    }
    if (websiteMode === "url" && website.trim() && !/^https?:\/\//i.test(website.trim())) {
      toast.error("Website must start with http:// or https://");
      return;
    }
    onCreate({
      id: `listing-${Date.now()}`,
      name: name.trim(),
      category,
      subcategory: subcategory.trim(),
      rating: 0,
      reviews: 0,
      location: `${lga}, ${stateDisplayName(state)}`,
      state,
      lga,
      distance: "0.2 km",
      integrated: true,
      verified: true,
      ownerEmail,
      status: "live",
      description: description.trim() || undefined,
      phone: phone.trim() || undefined,
      websiteMode,
      website: websiteMode === "url" ? website.trim() || undefined : undefined,
      services: [subcategory.trim()],
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80",
    });
    if (websiteMode === "request-build") {
      toast.success("We’ll reach out about building your business website.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
      <form
        onSubmit={onSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-xl font-bold text-navy">
              Create Market Hub listing
            </h2>
            <p className="mt-1 text-sm text-slate">
              Publish your business profile. Add a website or ask NaijaPass to
              build one.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-slate" />
          </button>
        </div>

        <label className="mt-5 block text-sm font-bold text-navy">
          Business Name
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-navy">
          About your business
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="What you deliver for public and private clients…"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            Category
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as MarketplaceCategory)
              }
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {marketplaceCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-navy">
            Service
            <input
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              placeholder="e.g. Road construction"
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
        </div>

        <label className="mt-4 block text-sm font-bold text-navy">
          Phone
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+234 …"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
          />
        </label>

        <fieldset className="mt-5">
          <legend className="text-sm font-bold text-navy">Website</legend>
          <div className="mt-2 space-y-2">
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-navy/10 p-3 text-sm">
              <input
                type="radio"
                name="websiteMode"
                checked={websiteMode === "url"}
                onChange={() => setWebsiteMode("url")}
                className="mt-1 accent-forest"
              />
              <span>
                <span className="font-semibold text-navy">I have a website</span>
                <span className="mt-0.5 block text-slate">
                  Add your live URL to the profile.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-navy/10 p-3 text-sm">
              <input
                type="radio"
                name="websiteMode"
                checked={websiteMode === "request-build"}
                onChange={() => setWebsiteMode("request-build")}
                className="mt-1 accent-forest"
              />
              <span>
                <span className="font-semibold text-navy">
                  Request NaijaPass to build it
                </span>
                <span className="mt-0.5 block text-slate">
                  We’ll follow up to ship a business site for you.
                </span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-navy/10 p-3 text-sm">
              <input
                type="radio"
                name="websiteMode"
                checked={websiteMode === "none"}
                onChange={() => setWebsiteMode("none")}
                className="mt-1 accent-forest"
              />
              <span className="font-semibold text-navy">Skip for now</span>
            </label>
          </div>
          {websiteMode === "url" && (
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.ng"
              className="mt-3 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-forest/15"
            />
          )}
        </fieldset>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            State
            <select
              value={state}
              onChange={(e) => {
                setState(e.target.value);
                setLga(marketplaceLgas[e.target.value]?.[1] ?? "Municipal");
              }}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {Object.keys(marketplaceLgas).map((item) => (
                <option key={item} value={item}>
                  {stateDisplayName(item)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-navy">
            LGA
            <select
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {lgas.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            Publish listing
          </button>
        </div>
      </form>
    </div>
  );
}
