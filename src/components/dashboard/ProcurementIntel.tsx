"use client";

import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  Bot,
  Clock,
  Eye,
  FileText,
  FolderOpen,
  Funnel,
  Globe,
  MapPin,
  Sparkles,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";

const tenders = [
  {
    ref: "LAG-INF-2024-089",
    title: "Coastal Road Drainage Upgrade",
    agency: "Lagos State",
    agencyTone: "green",
    sector: "Infrastructure",
    budget: "N450M - N500M",
    deadline: "2 Days",
    urgent: true,
    states: ["Lagos"],
  },
  {
    ref: "FGN-EDU-2024-112",
    title: "Smart Classroom Deployment",
    agency: "Federal Min. Edu",
    agencyTone: "blue",
    sector: "Technology",
    budget: "N120M",
    deadline: "14 Days",
    urgent: false,
    states: ["FCT", "Lagos", "Kano", "Rivers", "Edo"],
  },
  {
    ref: "KAD-HLT-2024-004",
    title: "Primary Health Centre Fit-out",
    agency: "Kaduna State",
    agencyTone: "green",
    sector: "Health",
    budget: "N85M",
    deadline: "21 Days",
    urgent: false,
    states: ["Kaduna"],
  },
  {
    ref: "KAN-RDS-2024-031",
    title: "Municipal Road Rehabilitation Package",
    agency: "Kano State",
    agencyTone: "green",
    sector: "Infrastructure",
    budget: "N210M",
    deadline: "9 Days",
    urgent: true,
    states: ["Kano"],
  },
  {
    ref: "RIV-PRT-2024-018",
    title: "Port Access Road Maintenance",
    agency: "Rivers State",
    agencyTone: "green",
    sector: "Transport",
    budget: "N160M",
    deadline: "12 Days",
    urgent: false,
    states: ["Rivers"],
  },
  {
    ref: "EDO-WTR-2024-007",
    title: "Urban Water Network Extension",
    agency: "Edo State",
    agencyTone: "green",
    sector: "Water",
    budget: "N95M",
    deadline: "18 Days",
    urgent: false,
    states: ["Edo"],
  },
  {
    ref: "FCT-FAC-2024-022",
    title: "Secretariat Campus Retrofit",
    agency: "FCT Administration",
    agencyTone: "blue",
    sector: "Facilities",
    budget: "N340M",
    deadline: "6 Days",
    urgent: true,
    states: ["FCT"],
  },
];

export default function ProcurementIntel() {
  const { user } = useSession();
  const { selectedState } = useDashboardSearch();
  const isBusiness = user?.role === "business" || user?.role === "admin";
  const [tab, setTab] = useState<"Latest" | "Closing Soon">("Latest");
  const scoped = tenders.filter(
    (t) => t.states.includes(selectedState) || t.agency.startsWith("Federal"),
  );
  const rows =
    tab === "Closing Soon"
      ? [...scoped].sort((a, b) => Number(b.urgent) - Number(a.urgent))
      : scoped;

  return (
    <div>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            Procurement Intelligence
          </h1>
          <p className="mt-1 max-w-2xl text-slate">
            Discover government tenders across Nigeria
            {selectedState ? ` — focused on ${selectedState}` : ""}.
            {isBusiness
              ? " Create contract profiles and submit bids as a verified business."
              : " Browse open awards and track opportunities."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-navy/10 bg-white px-4 py-2.5 text-sm font-semibold"
          >
            <Funnel className="h-4 w-4" /> Filters
          </button>
          {isBusiness ? (
            <>
              <button
                type="button"
                onClick={() =>
                  toast.success("Contract profile created. You can attach it to bids.")
                }
                className="rounded-xl border border-forest/30 bg-white px-4 py-2.5 text-sm font-semibold text-forest hover:bg-orange-soft"
              >
                + Create contract
              </button>
              <button
                type="button"
                onClick={() => toast.success("Bid profile draft created.")}
                className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
              >
                + New Bid Profile
              </button>
            </>
          ) : (
            <Link
              href="/signup?role=business"
              className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              Register as business to bid
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Kpi
          icon={FolderOpen}
          value="1,248"
          label="Active Tenders"
          hint="+ 12% from last month"
        />
        <Kpi icon={Eye} value="84.2B" label="Total Value (NGN)" hint="Across 15 sectors" />
        <article className="relative overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 p-5">
          <Bot className="absolute -right-2 -bottom-2 h-16 w-16 text-sky-200" />
          <Sparkles className="h-5 w-5 text-sky-700" />
          <p className="mt-3 font-display text-3xl font-bold text-navy">92%</p>
          <p className="text-sm font-medium">AI Match Rate</p>
          <p className="mt-1 text-xs text-slate">
            8 high-probability matches found today.
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)]">
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
              <FileText className="h-4 w-4" /> Open Tenders
            </h2>
            <div className="inline-flex rounded-full bg-mist p-1">
              {(["Latest", "Closing Soon"] as const).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    tab === item ? "bg-white text-forest shadow-sm" : "text-slate"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase tracking-wide text-slate">
                <tr>
                  <th className="pb-3">Tender Ref / Title</th>
                  <th className="pb-3">State/Agency</th>
                  <th className="pb-3">Sector</th>
                  <th className="pb-3">Est. Budget</th>
                  <th className="pb-3">Deadline</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate">
                      No open tenders for {selectedState} right now. Try another
                      state from the header.
                    </td>
                  </tr>
                )}
                {rows.map((row) => (
                  <tr key={row.ref} className="border-t border-navy/8">
                    <td className="py-3">
                      <p className="font-semibold text-forest">{row.ref}</p>
                      <p className="text-xs text-slate">{row.title}</p>
                    </td>
                    <td>
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            row.agencyTone === "green" ? "bg-forest" : "bg-sky-500"
                          }`}
                        />
                        {row.agency}
                      </span>
                    </td>
                    <td>
                      <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-800">
                        {row.sector}
                      </span>
                    </td>
                    <td>{row.budget}</td>
                    <td
                      className={`font-semibold ${
                        row.urgent ? "text-red-600" : "text-navy"
                      }`}
                    >
                      <span className="inline-flex items-center gap-1">
                        {row.urgent && <Clock className="h-3.5 w-3.5" />}
                        {row.deadline}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {isBusiness ? (
                        <button
                          type="button"
                          onClick={() =>
                            toast.success(`Bid started for ${row.ref}`)
                          }
                          className="rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-white hover:bg-forest-hover"
                        >
                          Bid
                        </button>
                      ) : (
                        <span className="text-xs text-slate">Business only</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <Link href="/procurement" className="text-sm font-semibold text-forest">
              View All Tenders
            </Link>
          </div>
        </section>

        <div className="space-y-5">
          <article className="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-sm">
            <div className="flex items-center justify-between bg-forest px-4 py-3 text-white">
              <p className="inline-flex items-center gap-2 font-semibold">
                <Bot className="h-4 w-4" /> Bid Assistant AI
              </p>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate">Analyzing LAG-INF-2024-089...</p>
              <div className="mt-3 rounded-xl bg-sky-50 p-3 text-sm">
                <p className="font-semibold text-sky-900">Compliance Check</p>
                <p className="mt-1 text-slate">
                  Company profile meets 4/5 criteria. Missing: Tax Clearance
                  Cert 2023.
                </p>
              </div>
              <button
                type="button"
                onClick={() => toast.success("Proposal outline drafted.")}
                className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-2.5 text-sm font-semibold text-white"
              >
                <FileText className="h-4 w-4" /> Draft Proposal Structure
              </button>
            </div>
          </article>

          <article className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm">
            <h3 className="inline-flex items-center gap-2 font-display font-bold">
              <Clock className="h-4 w-4" /> My Bids Activity
            </h3>
            <ul className="mt-3 space-y-3 text-sm">
              <li className="flex justify-between">
                <span>
                  <span className="font-semibold text-sky-700">Under Review</span>
                  <br />
                  FGN-ICT-002
                </span>
                <span className="text-xs text-slate">2 days ago</span>
              </li>
              <li className="flex justify-between">
                <span>
                  <span className="font-semibold text-forest">Awarded</span>
                  <br />
                  KAD-EDU-045
                </span>
                <span className="text-xs text-slate">last week</span>
              </li>
            </ul>
          </article>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="inline-flex items-center gap-2 font-display text-lg font-bold">
            <Globe className="h-4 w-4" /> Awarded Contracts Map
          </h2>
          <button
            type="button"
            className="text-sm font-semibold text-forest"
          >
            Filter by Sector
          </button>
        </div>
        <div className="relative mt-4 flex min-h-[220px] items-center justify-center overflow-hidden rounded-xl bg-sky-50">
          <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:18px_18px]" />
          <div className="relative rounded-xl bg-white px-5 py-4 text-center shadow-sm">
            <MapPin className="mx-auto h-5 w-5 text-forest" />
            <p className="mt-2 font-semibold">Interactive Map Visualization</p>
            <p className="text-sm text-slate">Showing 42 active project locations.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

function Kpi({
  icon: Icon,
  value,
  label,
  hint,
}: {
  icon: typeof Eye;
  value: string;
  label: string;
  hint: string;
}) {
  return (
    <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-forest" />
      <p className="mt-3 font-display text-3xl font-bold">{value}</p>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-1 text-xs text-slate">{hint}</p>
    </article>
  );
}
