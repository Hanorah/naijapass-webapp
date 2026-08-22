"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Star,
  UserRound,
} from "lucide-react";

const reports = [
  {
    id: "SEG-042",
    title: "Ogere Axis Paving",
    time: "2 hours ago",
    body: "Asphalt laying completed on the northbound carriageway. Compaction tests passed. Night crew staging for KM 63.",
    location: "KM 62",
    status: "In Progress",
    statusClass: "bg-orange/15 text-orange",
    image:
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=900&q=80",
    author: "Site Engineer",
    likes: 23,
  },
  {
    id: "SEG-038",
    title: "Shagamu Interchange Drainage",
    time: "Yesterday",
    body: "Culvert installation paused after heavy rainfall. Pumps deployed; expected restart once water levels recede.",
    location: "Shagamu Interchange",
    status: "Delayed",
    statusClass: "bg-red-100 text-red-700",
    image: null,
    author: "Resident Engineer",
    likes: 11,
  },
  {
    id: "SEG-021",
    title: "Ibadan Toll Gate Demolition",
    time: "3 days ago",
    body: "Obsolete plaza structures cleared. Temporary traffic management in place pending new gantry install.",
    location: "Ibadan Toll Gate",
    status: "Completed",
    statusClass: "bg-slate-200 text-navy-muted",
    image: null,
    author: "Works Supervisor",
    likes: 41,
  },
];

const topics = ["Traffic Management", "Pothole Repairs", "Night Lighting"];

export default function FeedbackBoard() {
  const [ticket, setTicket] = useState("");
  const [likes, setLikes] = useState<Record<string, number>>(
    Object.fromEntries(reports.map((r) => [r.id, r.likes])),
  );

  const onTrack = (e: FormEvent) => {
    e.preventDefault();
    const id = ticket.trim().toUpperCase();
    if (!id) {
      toast.error("Enter a ticket ID to track.");
      return;
    }
    const hit = reports.find((r) => r.id === id);
    toast.success(
      hit
        ? `${hit.title} is currently ${hit.status}.`
        : `No live segment found for ${id}.`,
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-navy md:text-[2.1rem]">
            Lagos-Ibadan Expressway Expansion
          </h1>
          <p className="mt-2 max-w-2xl text-slate">
            Section II (Shagamu Interchange to Ibadan) rehabilitation and
            expansion project tracking.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-sky-50 px-3 py-1.5 text-sm font-semibold text-sky-800">
          <span className="h-2 w-2 rounded-full bg-orange" />
          In Progress
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">
              Track Specific Segment
            </h2>
            <form
              onSubmit={onTrack}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                  placeholder="# Enter Ticket ID (e.g., SEG-042)"
                  className="w-full rounded-xl border border-navy/10 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-muted"
              >
                Track Status
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">
              Live Field Reports
            </h2>
            <ol className="relative mt-6 space-y-8 border-l border-navy/12 pl-6">
              {reports.map((report) => (
                <li key={report.id} className="relative">
                  <span
                    className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                      report.status === "Delayed"
                        ? "bg-red-500"
                        : report.status === "Completed"
                          ? "bg-slate-400"
                          : "bg-orange"
                    }`}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display font-bold text-navy">
                      {report.title}
                    </h3>
                    <span className="text-xs text-slate">{report.time}</span>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {report.body}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy">
                      <MapPin className="h-3 w-3 text-orange" />
                      {report.location}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${report.statusClass}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  {report.image && (
                    <div className="relative mt-4 h-40 overflow-hidden rounded-xl bg-sky-50">
                      <Image
                        src={report.image}
                        alt={report.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 640px"
                      />
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between text-xs text-slate">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mist">
                        <UserRound className="h-3.5 w-3.5" />
                      </span>
                      {report.author}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setLikes((prev) => ({
                          ...prev,
                          [report.id]: (prev[report.id] ?? 0) + 1,
                        }))
                      }
                      className="inline-flex items-center gap-1 font-medium hover:text-orange"
                    >
                      <Heart className="h-3.5 w-3.5" />
                      {likes[report.id]}
                    </button>
                  </div>
                </li>
              ))}
            </ol>
            <button
              type="button"
              onClick={() => toast.success("Older reports will load as they are digitized.")}
              className="mt-6 w-full rounded-xl border border-navy/10 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
            >
              Load Older Reports
            </button>
          </article>
        </div>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">
              Citizen Sentiment
            </h2>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-display text-4xl font-bold text-navy">4.2</p>
              <div className="pb-1">
                <div className="flex text-orange">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      fill={i < 4 ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate">1,288 feedbacks</p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Positive", pct: 72, bar: "bg-forest" },
                { label: "Neutral", pct: 20, bar: "bg-slate-400" },
                { label: "Negative", pct: 8, bar: "bg-red-500" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-xs font-medium text-navy-muted">
                    <span>{row.label}</span>
                    <span>{row.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist">
                    <div
                      className={`h-full rounded-full ${row.bar}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate">
              Top Discussed Topics
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {topics.map((topic) => (
                <button
                  key={topic}
                  type="button"
                  className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 hover:bg-sky-100"
                >
                  {topic}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-2xl bg-navy p-5 text-white shadow-sm">
            <h2 className="font-display text-base font-bold">Project Details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-white/50">Contractor</dt>
                <dd className="mt-0.5 font-semibold">Julius Berger Nig. PLC</dd>
              </div>
              <div>
                <dt className="text-white/50">Supervising Agency</dt>
                <dd className="mt-0.5 font-semibold">Fed. Ministry of Works</dd>
              </div>
              <div>
                <dt className="text-white/50">Budget</dt>
                <dd className="mt-0.5 font-semibold">₦134.8B</dd>
              </div>
              <div>
                <dt className="text-white/50">Est. Completion</dt>
                <dd className="mt-0.5 font-semibold">Dec 2026</dd>
              </div>
            </dl>
          </article>

          <Link
            href="/signup"
            className="flex items-center justify-center gap-2 rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm font-semibold text-navy shadow-sm hover:border-orange/30"
          >
            <MessageCircle className="h-4 w-4 text-orange" />
            Submit feedback
          </Link>
        </aside>
      </div>
    </div>
  );
}
