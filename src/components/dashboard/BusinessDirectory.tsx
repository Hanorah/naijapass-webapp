"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BedDouble,
  Briefcase,
  ChevronDown,
  GraduationCap,
  Heart,
  Phone,
  Plus,
  ShoppingBag,
  Star,
  Truck,
  X,
} from "lucide-react";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import InitialsAvatar from "@/components/InitialsAvatar";
import { useSession } from "@/components/SessionProvider";
import { useBusinesses } from "@/lib/db/businesses";
import { stateDisplayName } from "@/data/marketplace";
import {
  directoryCategories,
  directoryLgasByState,
  lagosLgas,
  type DirectoryCategory,
} from "@/data/businesses";

const PAGE = 6;

const catIcons = {
  bed: BedDouble,
  plus: Plus,
  bag: ShoppingBag,
  briefcase: Briefcase,
  grad: GraduationCap,
  truck: Truck,
};

export default function BusinessDirectory() {
  const { search, selectedState } = useDashboardSearch();
  const { user } = useSession();
  const { businesses, loading, source } = useBusinesses(selectedState);
  const isBusiness = user?.role === "business" || user?.role === "admin";
  const [lga, setLga] = useState("All LGAs");
  const [categories, setCategories] = useState<DirectoryCategory[]>([]);
  const [showAllCats, setShowAllCats] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(true);
  const [openNow, setOpenNow] = useState(false);
  const [posOnly, setPosOnly] = useState(false);
  const [sort, setSort] = useState("rating");
  const [visible, setVisible] = useState(PAGE);
  const [saved, setSaved] = useState<string[]>([]);

  const lgaOptions = directoryLgasByState[selectedState] ?? lagosLgas;

  useEffect(() => {
    setLga("All LGAs");
    setVisible(PAGE);
  }, [selectedState]);

  const visibleCats = showAllCats
    ? directoryCategories
    : directoryCategories.slice(0, 4);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = businesses.filter((b) => {
      if (b.state !== selectedState) return false;
      if (lga !== "All LGAs" && b.lga !== lga) return false;
      if (categories.length && !categories.includes(b.category)) return false;
      if (verifiedOnly && !b.verified) return false;
      if (openNow && !b.openNow) return false;
      if (posOnly && !b.pos) return false;
      if (q) {
        const hay = `${b.name} ${b.subcategory} ${b.address} ${b.state}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "reviews") return b.reviews - a.reviews;
      return b.rating - a.rating;
    });
    return list;
  }, [businesses, search, selectedState, lga, categories, verifiedOnly, openNow, posOnly, sort]);

  const shown = filtered.slice(0, visible);

  const toggleCat = (id: DirectoryCategory) => {
    setVisible(PAGE);
    setCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id],
    );
  };

  const reset = () => {
    setLga("All LGAs");
    setCategories([]);
    setVerifiedOnly(true);
    setOpenNow(false);
    setPosOnly(false);
    setSort("rating");
    setVisible(PAGE);
  };

  return (
      <div>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
              Verified Business Directory
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate md:text-base">
              Discover trusted merchants and service providers in {selectedState}.
              Change state from the header to explore other hubs.
            </p>
          </div>
          {isBusiness ? (
            <Link
              href="/dashboard/profile"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              Manage my business
            </Link>
          ) : (
            <Link
              href="/signup?role=business"
              className="inline-flex shrink-0 items-center justify-center rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              + Register Business
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-forest/10 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-sm font-bold">Filters</h2>
              <button
                type="button"
                onClick={reset}
                className="text-xs font-semibold text-forest"
              >
                Reset
              </button>
            </div>

            <p className="mt-4 text-xs font-bold uppercase tracking-wide text-slate">
              Location
            </p>
            <select
              value={selectedState}
              disabled
              className="mt-2 w-full rounded-lg border border-navy/10 bg-[#f4f6f8] px-3 py-2 text-sm"
            >
              <option>{selectedState}</option>
            </select>
            <select
              value={lga}
              onChange={(e) => {
                setLga(e.target.value);
                setVisible(PAGE);
              }}
              className="mt-2 w-full rounded-lg border border-navy/10 bg-white px-3 py-2 text-sm"
            >
              {lgaOptions.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>

            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate">
              Category
            </p>
            <div className="mt-2 space-y-1.5">
              {visibleCats.map((cat) => {
                const Icon = catIcons[cat.icon];
                const on = categories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => toggleCat(cat.id)}
                      className="accent-forest"
                    />
                    <Icon className="h-4 w-4 text-forest" />
                    {cat.label}
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => setShowAllCats((v) => !v)}
              className="mt-2 text-xs font-semibold text-forest"
            >
              {showAllCats ? "Show fewer categories" : "Show all categories"}
            </button>

            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate">
              Status & Features
            </p>
            <div className="mt-3 space-y-3">
              <Toggle
                label="Verified Only"
                on={verifiedOnly}
                onChange={(v) => {
                  setVerifiedOnly(v);
                  setVisible(PAGE);
                }}
              />
              <Toggle
                label="Open Now"
                on={openNow}
                onChange={(v) => {
                  setOpenNow(v);
                  setVisible(PAGE);
                }}
              />
              <Toggle
                label="Accepts POS"
                on={posOnly}
                onChange={(v) => {
                  setPosOnly(v);
                  setVisible(PAGE);
                }}
              />
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <Chip>Active: {stateDisplayName(selectedState)}</Chip>
                {verifiedOnly && (
                  <Chip onClick={() => setVerifiedOnly(false)}>Verified Only</Chip>
                )}
              </div>
              <label className="flex items-center gap-2 text-sm text-slate">
                Sort by:
                <span className="relative">
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="appearance-none rounded-lg border border-navy/10 bg-white py-2 pl-3 pr-8 text-sm font-medium text-navy"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="reviews">Most reviewed</option>
                    <option value="name">Name</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2" />
                </span>
              </label>
            </div>

            {loading ? (
              <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-10 text-center text-slate">
                Loading verified businesses…
              </p>
            ) : shown.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-navy/15 bg-white p-10 text-center text-slate">
                No verified businesses in {stateDisplayName(selectedState)} match these filters.
                {isBusiness
                  ? " Set up your company profile to appear here once approved."
                  : " Try another LGA or clear filters."}
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {shown.map((biz) => (
                  <article
                    key={biz.id}
                    className="overflow-hidden rounded-2xl border border-forest/10 bg-white shadow-sm"
                  >
                    <div className="relative h-40 bg-mist">
                      <Link href={`/dashboard/directory/${biz.id}`} className="absolute inset-0">
                        {biz.image ? (
                          <Image
                            src={biz.image}
                            alt={biz.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center">
                            <InitialsAvatar name={biz.name} size={72} rounded="2xl" />
                          </span>
                        )}
                      </Link>
                      {biz.verified && (
                        <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-forest px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Verified
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label="Save business"
                        onClick={() =>
                          setSaved((prev) =>
                            prev.includes(biz.id)
                              ? prev.filter((id) => id !== biz.id)
                              : [...prev, biz.id],
                          )
                        }
                        className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-forest"
                      >
                        <Heart
                          className="h-4 w-4"
                          fill={saved.includes(biz.id) ? "currentColor" : "none"}
                        />
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-slate">
                        <span>
                          {directoryCategories.find((c) => c.id === biz.category)?.label} ·{" "}
                          {biz.subcategory}
                        </span>
                        <span className="inline-flex items-center gap-0.5 text-forest">
                          <Star className="h-3.5 w-3.5" fill="currentColor" />
                          {biz.rating}
                        </span>
                      </div>
                      <Link href={`/dashboard/directory/${biz.id}`}>
                        <h3 className="mt-1.5 font-display text-base font-bold leading-snug hover:text-forest">
                          {biz.name}
                        </h3>
                      </Link>
                      <p className="mt-1 text-sm text-slate">{biz.address}</p>
                      <p className="mt-0.5 text-xs font-medium text-forest">
                        {biz.hours}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {biz.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-md bg-white px-2 py-0.5 text-[11px] font-medium text-navy-muted"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/dashboard/directory/${biz.id}`}
                          className="flex-1 rounded-lg bg-forest py-2 text-center text-sm font-semibold text-white hover:bg-forest-hover"
                        >
                          View profile
                        </Link>
                        <a
                          href={`tel:${biz.phone}`}
                          aria-label={`Call ${biz.name}`}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-forest/20 text-forest hover:bg-mist"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {visible < filtered.length && (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisible((v) => v + PAGE)}
                  className="rounded-xl border border-forest/20 bg-white px-5 py-2.5 text-sm font-semibold text-forest hover:bg-mist"
                >
                  Load More Businesses
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between text-sm"
    >
      {label}
      <span
        className={`relative h-5 w-9 rounded-full transition ${
          on ? "bg-forest" : "bg-slate-300"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${
            on ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </button>
  );
}

function Chip({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy">
      {children}
      {onClick ? (
        <button type="button" onClick={onClick} aria-label="Remove filter">
          <X className="h-3 w-3" />
        </button>
      ) : null}
    </span>
  );
}
