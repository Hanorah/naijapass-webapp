"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  Ambulance,
  Building2,
  CarFront,
  Download,
  ExternalLink,
  FileText,
  Flame,
  Landmark,
  MapPinned,
  Megaphone,
  Network,
  Phone,
  Search,
  Shield,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import StateMap from "@/components/StateMap";
import { getStateProfile } from "@/data/stateProfiles";
import { useStateContent } from "@/lib/db/stateContent";

const governors: Record<
  string,
  { name: string; photo: string; tagline: string; party: string | null }
> = {};

function getGovernorInfo(state: string) {
  if (governors[state]) return governors[state];
  const profile = getStateProfile(state);
  if (!profile) {
    return {
      name: "Executive Governor",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      tagline: "Official civic information for this state.",
      party: null as string | null,
    };
  }
  return {
    name: profile.governor,
    photo:
      profile.governorPhotoUrl ??
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    tagline: profile.slogan,
    party: profile.party,
  };
}

const categoryStyle: Record<string, string> = {
  Finance: "bg-sky-100 text-sky-800",
  Transportation: "bg-sky-50 text-sky-700",
  Infrastructure: "bg-slate-100 text-slate-700",
};

export default function StateHub() {
  const { selectedState, setSelectedState } = useDashboardSearch();
  const [query, setQuery] = useState("");
  const governor = getGovernorInfo(selectedState);
  const profile = getStateProfile(selectedState);

  const code = selectedState.slice(0, 3).toUpperCase();

  // Anything the state government has published in its own portal wins over
  // the bundled profile; the profile is the fallback until they publish.
  const { items: published } = useStateContent({ state: selectedState });

  const announcements = useMemo(
    () =>
      published.filter(
        (item) =>
          item.type === "announcement" ||
          item.type === "notice" ||
          item.type === "service",
      ),
    [published],
  );

  const laws = useMemo(() => {
    const live = published
      .filter((item) => item.type === "law" || item.type === "order")
      .map((item) => ({
        title: item.title,
        ref:
          item.category
            ? `${code}S/${item.category.slice(0, 3).toUpperCase()}/${new Date(item.created_at).getFullYear().toString().slice(-2)}`
            : `${code}S/DOC/${new Date(item.created_at).getFullYear().toString().slice(-2)}`,
        category: item.category ?? (item.type === "order" ? "Executive Order" : "Law"),
        date: item.effective_date ?? item.created_at.slice(0, 10),
        url: item.url ?? undefined,
      }));
    if (live.length) return live;

    const seeded = (profile?.laws ?? []).map((law) => ({
      title: law.title,
      ref: `${code}S/${law.category.slice(0, 3).toUpperCase()}/${String(law.year).slice(-2)}`,
      category: law.category,
      date: `${law.year}`,
      url: undefined as string | undefined,
    }));
    return seeded.length
      ? seeded
      : [
          {
            title: `${selectedState} State Revenue Administration Law 2023`,
            ref: `${code}S/LAW/23-01`,
            category: "Finance",
            date: "Oct 12, 2023",
            url: undefined as string | undefined,
          },
          {
            title: "Executive Order: Traffic Management Agency",
            ref: `${code}S/EO/24-02`,
            category: "Transportation",
            date: "Jan 15, 2024",
            url: undefined as string | undefined,
          },
        ];
  }, [published, profile, code, selectedState]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return laws;
    return laws.filter((l) =>
      `${l.title} ${l.ref} ${l.category}`.toLowerCase().includes(q),
    );
  }, [query, laws]);

  const mdas = useMemo(() => {
    const live = published
      .filter((item) => item.type === "mda")
      .map((item) => ({
        tag: (item.category ?? item.title).split(" ")[0],
        icon: Building2,
        name: item.title,
        body: item.body ?? item.category ?? "State ministry, department or agency.",
        phone: item.phone ?? "",
      }));
    if (live.length) return live;

    const seeded = (profile?.mdas ?? []).map((m) => ({
      tag: m.focus.split(" ")[0],
      icon: Building2,
      name: m.name,
      body: m.focus,
      phone: m.phone,
    }));
    return seeded.length
      ? seeded
      : [
          {
            tag: "Revenue",
            icon: Wallet,
            name: `${selectedState} State Internal Revenue Service`,
            body: "Assessment, collection, and accounting of internally generated revenue.",
            phone: "0700 547 547",
          },
        ];
  }, [published, profile, selectedState]);

  const emergencies = useMemo(() => {
    const live = published
      .filter((item) => item.type === "emergency")
      .map((item) => ({
        label: item.title,
        number: item.phone ?? "112",
        icon: /fire/i.test(item.title)
          ? Flame
          : /ambulance|medical|health/i.test(item.title)
            ? Ambulance
            : /traffic|road/i.test(item.title)
              ? CarFront
              : Shield,
      }));
    if (live.length) return live;

    return profile
      ? [
          { label: "National Emergency", number: profile.emergency.national, icon: Shield },
          { label: "State Police", number: profile.emergency.police, icon: Shield },
          { label: "Fire Service", number: profile.emergency.fire, icon: Flame },
          { label: "Ambulance", number: profile.emergency.ambulance, icon: Ambulance },
        ]
      : [
          { label: "Police Command", number: "112", icon: Shield },
          { label: "Fire Service", number: "0803 208 3000", icon: Flame },
          { label: "Ambulance (SEMA)", number: "0803 300 3000", icon: Ambulance },
          { label: "Traffic", number: "0800 000 0000", icon: CarFront },
        ];
  }, [published, profile]);

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-start justify-between gap-4">
          <span className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-forest text-white">
            <Landmark className="h-7 w-7" />
          </span>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <span className="rounded-full bg-forest/10 px-2.5 py-1 text-xs font-bold text-forest">
              Official Hub
            </span>
            <span className="text-xs text-slate">Last updated: 2h ago</span>
          </div>
        </div>
        <h1 className="mt-4 font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          {selectedState} State Hub
        </h1>
        <p className="mt-2 max-w-2xl text-slate">
          {governor.tagline} Access official state directories, regulatory
          frameworks, and civic infrastructure data.
        </p>
        <div className="mt-5 flex flex-wrap items-start gap-4">
          <div className="inline-flex items-center gap-3 rounded-xl border border-navy/10 bg-[#f7faf9] p-2 pr-4">
            <Image
              src={governor.photo}
              alt={governor.name}
              width={44}
              height={44}
              className="h-11 w-11 rounded-full object-cover"
            />
            <div>
              <p className="text-sm font-bold text-navy">{governor.name}</p>
              <p className="text-xs text-slate">
                {selectedState === "FCT" ? "Minister" : "Executive Governor"}
                {governor.party ? ` · ${governor.party}` : ""}
                {profile?.termEndYear ? ` · term to ${profile.termEndYear}` : ""}
              </p>
              {profile?.ssg ? (
                <p className="mt-0.5 text-xs text-slate">SSG: {profile.ssg}</p>
              ) : null}
              {profile?.speaker ? (
                <p className="text-xs text-slate">Speaker: {profile.speaker}</p>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {profile?.officialPortal ? (
              <a
                href={profile.officialPortal}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/10 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:border-forest/30 hover:text-forest"
              >
                Official website
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
            {profile?.procurementPortal ? (
              <a
                href={profile.procurementPortal}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 rounded-full border border-navy/10 bg-white px-3 py-1.5 text-xs font-semibold text-navy hover:border-forest/30 hover:text-forest"
              >
                Open tenders portal
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      {announcements.length ? (
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
              <Megaphone className="h-4 w-4 text-forest" />
              From the {selectedState} government
            </h2>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-forest">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-forest/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-forest" />
              </span>
              Official
            </span>
          </div>
          <ul className="space-y-3">
            {announcements.slice(0, 6).map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-navy/8 bg-[#f7faf9] p-4"
              >
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-forest/10 px-2 py-0.5 font-bold text-forest">
                    {item.type === "service"
                      ? "Citizen service"
                      : item.type === "notice"
                        ? "Public notice"
                        : "Announcement"}
                  </span>
                  <span className="text-slate">
                    {new Date(item.effective_date ?? item.created_at).toLocaleDateString(
                      "en-NG",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                </div>
                <p className="mt-2 font-semibold text-navy">{item.title}</p>
                {item.body ? (
                  <p className="mt-1 text-sm leading-relaxed text-slate">{item.body}</p>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate">
                  {item.contact ? <span>{item.contact}</span> : null}
                  {item.phone ? <span>{item.phone}</span> : null}
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="inline-flex items-center gap-1 font-semibold text-forest"
                    >
                      Details
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
            <MapPinned className="h-4 w-4 text-forest" />
            Your Location
          </h2>
          <span className="text-xs text-slate">Auto-detected via GPS + maps</span>
        </div>
        <StateMap
          selectedState={selectedState}
          onStateDetected={(state) => setSelectedState(state)}
          height="280px"
        />
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
              <FileText className="h-4 w-4 text-forest" />
              State Law & Regulatory Library
            </h2>
            <button type="button" className="text-sm font-semibold text-forest">
              View All →
            </button>
          </div>
          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by laws, executive orders, gazettes..."
              className="w-full rounded-xl border border-navy/8 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:ring-2 focus:ring-forest/20"
            />
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-[11px] uppercase tracking-wide text-slate">
                <tr>
                  <th className="pb-3 font-semibold">Document Title</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Date Enacted</th>
                  <th className="pb-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((law) => (
                  <tr key={law.ref} className="border-t border-navy/8">
                    <td className="py-3.5 pr-3">
                      <p className="font-semibold text-navy">{law.title}</p>
                      <p className="text-xs text-slate">Ref: {law.ref}</p>
                    </td>
                    <td className="pr-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          categoryStyle[law.category] ?? "bg-mist text-navy"
                        }`}
                      >
                        {law.category}
                      </span>
                    </td>
                    <td className="pr-3 text-slate">{law.date}</td>
                    <td>
                      <button
                        type="button"
                        aria-label={`Download ${law.title}`}
                        className="rounded-lg p-1.5 text-forest hover:bg-mist"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
            <Activity className="h-4 w-4 text-forest" />
            Infrastructure Pulse
          </h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-xl border border-navy/6 bg-[#f7faf9] p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Power Grid Load</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-forest">
                  Stable
                </span>
              </div>
              <p className="mt-2 text-xs text-slate">Current Draw: 420MW</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                <div className="h-full w-[56%] rounded-full bg-forest" />
              </div>
              <p className="mt-1 text-xs text-slate">Capacity: 750MW</p>
            </div>
            <div className="rounded-xl border border-navy/6 bg-[#f7faf9] p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Major Arteries Flow</p>
                <span className="text-xs font-bold text-red-600">Heavy Traffic</span>
              </div>
              <p className="mt-3 flex items-center justify-between text-sm">
                Zaria Road
                <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                  Congested
                </span>
              </p>
              <p className="mt-2 flex items-center justify-between text-sm">
                Murtala Muhammed Way
                <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-800">
                  Moderate
                </span>
              </p>
            </div>
            <div className="rounded-xl border border-navy/6 bg-[#f7faf9] p-3.5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Water Supply</p>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-forest">
                  Normal
                </span>
              </div>
              <p className="mt-2 text-sm text-slate">
                Tamburawa Water Treatment Plant operating at 85% capacity.
              </p>
            </div>
          </div>
        </section>
      </div>

      <section>
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
          <Network className="h-4 w-4 text-forest" />
          Key Ministries, Departments & Agencies (MDAs)
        </h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {mdas.map((mda) => {
            const Icon = mda.icon;
            return (
              <article
                key={mda.tag}
                className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-forest/10 text-forest">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-muted">
                    {mda.tag}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[15px] font-bold leading-snug">
                  {mda.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{mda.body}</p>
                <div className="mt-5 flex gap-2">
                  <a
                    href={`tel:${mda.phone}`}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-navy/15 py-2 text-sm font-semibold hover:bg-mist"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call
                  </a>
                  <Link
                    href="/dashboard/directory"
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-navy/15 py-2 text-sm font-semibold hover:bg-mist"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Portal
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl bg-[#fdecee] p-5 md:p-6">
        <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold text-red-700">
          <TriangleAlert className="h-5 w-5" />
          {selectedState} Emergency Contacts
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {emergencies.map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.label}
                href={`tel:${item.number}`}
                className="rounded-xl bg-white p-4 shadow-sm"
              >
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm text-slate">{item.label}</p>
                <p className="mt-1 font-display text-lg font-bold text-forest">
                  {item.number}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      <footer className="flex flex-col gap-2 border-t border-navy/8 pt-4 text-xs text-slate sm:flex-row sm:justify-between">
        <p>
          © {new Date().getFullYear()} Federal Republic of Nigeria. Powered by
          StateAI.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
          <Link href="/disclaimer">Government Disclaimer</Link>
          <Link href="/privacy">Data Protection</Link>
        </div>
      </footer>
    </div>
  );
}
