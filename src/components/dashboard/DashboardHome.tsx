"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  CloudSun,
  FilePenLine,
  Gavel,
  MapPin,
  Megaphone,
  Newspaper,
  ShieldCheck,
  Store,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import { useMyBusiness } from "@/lib/db/myBusiness";
import { useBusinesses } from "@/lib/db/businesses";
import { useTenders } from "@/lib/db/tenders";
import { roleLabels } from "@/lib/session";
import { stateDisplayName } from "@/data/marketplace";

const hour = new Date().getHours();
const greeting =
  hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
const today = new Intl.DateTimeFormat("en-NG", {
  weekday: "long",
  month: "short",
  day: "numeric",
}).format(new Date());

export default function DashboardHome() {
  const { user, tenderBids } = useSession();
  const { selectedState, locating, locationSource } = useDashboardSearch();
  const { tenders, loading: tendersLoading } = useTenders(selectedState);
  const { allBusinesses } = useBusinesses();
  const { business: myBusiness } = useMyBusiness(user?.id, user?.email);
  const role = user?.role ?? "individual";
  const isBusiness = role === "business" || role === "admin";
  const firstName = (user?.name ?? "Citizen").split(" ")[0];
  const stateLabel = stateDisplayName(selectedState);
  const locationNote = locating
    ? "Detecting your state…"
    : locationSource === "geo"
      ? "Detected from your location"
      : locationSource === "session"
        ? "From your account"
        : locationSource === "user"
          ? "Selected in header"
          : "Default state";

  const myBids = useMemo(
    () => tenderBids.filter((bid) => bid.contactEmail === user?.email),
    [tenderBids, user?.email],
  );

  const nearbyBusinesses = useMemo(
    () => allBusinesses.filter((item) => item.state === selectedState).length,
    [allBusinesses, selectedState],
  );

  const urgentTenders = tenders.filter((t) => t.urgent).length;

  const metrics = isBusiness
    ? [
        {
          label: "Open tenders",
          value: tendersLoading ? "…" : String(tenders.length),
          hint: `${urgentTenders} closing soon`,
        },
        {
          label: "Active bids",
          value: String(myBids.filter((b) => b.status === "submitted").length),
          hint: `${myBids.filter((b) => b.status === "draft").length} drafts`,
        },
        {
          label: "Business profile",
          value: myBusiness
            ? myBusiness.status === "live"
              ? "Live"
              : "Pending"
            : "Not set",
          hint: myBusiness ? "Directory & procurement" : "Set up in profile",
          alert: !myBusiness,
        },
      ]
    : [
        {
          label: "Open tenders",
          value: tendersLoading ? "…" : String(tenders.length),
          hint: `In ${stateLabel}`,
        },
        {
          label: "Verified businesses",
          value: String(nearbyBusinesses),
          hint: `In ${stateLabel}`,
        },
        {
          label: "Verification",
          value: user?.verified ? "Verified" : "Pending",
          hint: user?.verified ? "Portal access" : "Complete KYC",
          alert: !user?.verified,
        },
      ];

  const actions = [
    {
      href: "/dashboard/hub",
      title: `${stateLabel} Hub`,
      body: "Laws, MDAs, and civic directories.",
      icon: MapPin,
    },
    {
      href: isBusiness ? "/dashboard/profile" : "/dashboard/directory",
      title: isBusiness ? "Business workspace" : "Business directory",
      body: isBusiness
        ? "Manage your company profile and bids."
        : "Find verified suppliers in your state.",
      icon: Store,
    },
    {
      href: "/dashboard/procurement",
      title: isBusiness ? "Bid on contracts" : "View tenders",
      body: "Live RFPs, awards, and closing dates.",
      icon: FilePenLine,
    },
    {
      href: "/dashboard/emergency",
      title: "Report an issue",
      body: "Alerts, hospitals, and rapid response.",
      icon: Megaphone,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">Daily briefing</p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            {greeting}, {firstName}.
          </h1>
          <p className="mt-2 text-sm text-slate md:text-[15px]">
            {roleLabels[role]} · {today} · {stateLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-navy/6">
            <MapPin className="h-4 w-4 text-forest" />
            <div className="text-sm">
              <p className="font-semibold">{stateLabel}, NG</p>
              <p className="inline-flex items-center gap-1 text-xs text-slate">
                <CloudSun className="h-3.5 w-3.5" /> {locationNote}
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-2 text-xs font-semibold text-forest ring-1 ring-navy/6">
            <span className="h-1.5 w-1.5 rounded-full bg-forest" />
            Status: Normal
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <article
            key={m.label}
            className="relative rounded-[24px] bg-white p-5 ring-1 ring-navy/6"
          >
            {"alert" in m && m.alert && (
              <span className="absolute right-4 top-4 h-2 w-2 rounded-full bg-red-500" />
            )}
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate">
              {m.label}
            </p>
            <p className="mt-3 font-serif text-4xl tracking-tight">{m.value}</p>
            <p className="mt-2 text-xs text-slate">{m.hint}</p>
          </article>
        ))}
        <article className="rounded-[24px] bg-navy p-5 text-white">
          <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/50">
            <ShieldCheck className="h-3.5 w-3.5 text-forest" />
            Verification
          </p>
          <p className="mt-3 font-serif text-4xl tracking-tight">Tier 1</p>
          <p className="mt-2 text-xs text-white/50">
            {user?.verified ? "Portal access confirmed" : "Complete KYC to upgrade"}
          </p>
        </article>
      </div>

      <div>
        <h2 className="font-serif text-2xl tracking-tight">Quick actions</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group rounded-[24px] bg-white p-5 ring-1 ring-navy/6 transition hover:-translate-y-0.5 hover:ring-forest/25"
              >
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-mist text-forest">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-4 font-semibold text-navy">{action.title}</p>
                <p className="mt-1 text-sm text-slate">{action.body}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-forest">
                  Open
                  <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <article className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl tracking-tight">
              Trending in {stateLabel}
            </h2>
            <Link href="/dashboard/hub" className="text-sm font-semibold text-forest">
              State Hub
            </Link>
          </div>
          <ul className="mt-6 space-y-5">
            <li className="flex gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mist text-forest">
                <Newspaper className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">
                  New {stateLabel} transport sector notices
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate">
                  Key changes to commercial vehicle registration and operational
                  permits in your state.
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mist text-forest">
                <Gavel className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">Open contracting window</p>
                <p className="mt-1 text-sm leading-relaxed text-slate">
                  {tenders.length > 0
                    ? `${tenders.length} open tenders match suppliers in ${stateLabel}.`
                    : "Check procurement for new opportunities in your state."}
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mist text-forest">
                <Megaphone className="h-4 w-4" />
              </span>
              <div>
                <p className="font-semibold">Emergency feed</p>
                <p className="mt-1 text-sm leading-relaxed text-slate">
                  Review hospitals, stations, and civic alerts for {stateLabel}.
                </p>
              </div>
            </li>
          </ul>
        </article>

        <article className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6">
          <h2 className="font-serif text-2xl tracking-tight">Active tenders</h2>
          <p className="mt-1 text-sm text-slate">
            {isBusiness
              ? "Review requirements and submit a bid from procurement."
              : "Browse opportunities. Register as a business to bid."}
          </p>
          <div className="mt-5 space-y-3">
            {tendersLoading ? (
              <p className="text-sm text-slate">Loading tenders…</p>
            ) : tenders.length === 0 ? (
              <p className="rounded-2xl bg-mist/80 p-4 text-sm text-slate">
                No open tenders for {stateLabel} right now.
              </p>
            ) : (
              tenders.slice(0, 2).map((tender) => (
                <Tender
                  key={tender.id}
                  badge={tender.agency}
                  closes={tender.deadline}
                  title={tender.title}
                  canBid={isBusiness}
                />
              ))
            )}
          </div>
          <Link
            href="/dashboard/procurement"
            className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-forest"
          >
            Go to Procurement Hub
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </article>
      </div>
    </div>
  );
}

function Tender({
  badge,
  closes,
  title,
  canBid,
}: {
  badge: string;
  closes: string;
  title: string;
  canBid: boolean;
}) {
  return (
    <div className="rounded-2xl bg-mist/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-forest">
          {badge}
        </span>
        <span className="text-xs text-slate">{closes}</span>
      </div>
      <p className="mt-2 text-sm font-semibold leading-snug">{title}</p>
      <Link
        href="/dashboard/procurement"
        className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold ring-1 ring-navy/8 hover:ring-forest/30"
      >
        {canBid ? "Review & bid" : "Review details"}
      </Link>
    </div>
  );
}
