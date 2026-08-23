"use client";

import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  BookOpen,
  Gavel,
  LifeBuoy,
  MessageCircle,
  Search,
  Shield,
  Store,
} from "lucide-react";

const faqs = [
  {
    q: "How do I verify my account?",
    a: "Open Settings → Security and complete KYC, or continue from Profile if verification is still pending. Individuals upload identity documents; businesses add CAC and tax records.",
    tag: "KYC",
  },
  {
    q: "How do I bid on a government contract?",
    a: "Open Procurement, review eligibility, then submit from a verified business account. Closing dates and documents sit on each tender card.",
    tag: "Procurement",
  },
  {
    q: "Why is the dashboard showing a different state?",
    a: "The portal prefers your saved state, then device location. Change it anytime from the header selector or Settings → Home state.",
    tag: "Account",
  },
  {
    q: "How do I publish a Market Hub listing?",
    a: "Business and admin roles can create listings from Market Hub. Pending items are reviewed before they go live in the directory.",
    tag: "Marketplace",
  },
  {
    q: "What should I do in an emergency?",
    a: "Open Emergency for live alerts, hospital and station directories, and the report flow. Do not use the portal in place of 112 or local first responders.",
    tag: "Safety",
  },
];

const topics = [
  {
    title: "Getting started",
    body: "Navigate the briefing, set your state, and complete verification.",
    icon: BookOpen,
  },
  {
    title: "Procurement",
    body: "Filter tenders, track awards, and prepare bids.",
    icon: Gavel,
  },
  {
    title: "Marketplace",
    body: "Find suppliers or publish your own listings.",
    icon: Store,
  },
  {
    title: "Trust & KYC",
    body: "What we check, how long it takes, and what you can access.",
    icon: Shield,
  },
];

export default function HelpCenter() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(faqs[0].q);
  const [message, setMessage] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter((item) =>
      `${item.q} ${item.a} ${item.tag}`.toLowerCase().includes(q),
    );
  }, [query]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Write a short note so we can help.");
      return;
    }
    const subject = encodeURIComponent(`NaijaPass help — ${query.trim() || "support"}`);
    const body = encodeURIComponent(message.trim());
    window.location.href = `mailto:support@naijapass.ng?subject=${subject}&body=${body}`;
    toast.success("Opening your email app…");
    setMessage("");
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Support</p>
        <h1 className="mt-3 font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          Help Center
        </h1>
        <p className="mt-2 max-w-xl text-sm text-slate md:text-[15px]">
          Guides, answers, and a line to the civic desk — without leaving the
          portal.
        </p>
      </div>

      <div className="relative max-w-xl">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search help articles..."
          className="w-full rounded-2xl bg-white py-3 pl-11 pr-4 text-sm outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <article
              key={topic.title}
              className="rounded-[24px] bg-white p-5 ring-1 ring-navy/6"
            >
              <Icon className="h-4 w-4 text-forest" />
              <h2 className="mt-4 font-serif text-xl tracking-tight">{topic.title}</h2>
              <p className="mt-1 text-sm text-slate">{topic.body}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-2">
          {filtered.map((item) => {
            const expanded = open === item.q;
            return (
              <article
                key={item.q}
                className="rounded-[22px] bg-white ring-1 ring-navy/6"
              >
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : item.q)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="font-semibold">{item.q}</span>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-forest">
                    {item.tag}
                  </span>
                </button>
                {expanded && (
                  <p className="px-5 pb-5 text-sm leading-relaxed text-slate">
                    {item.a}
                  </p>
                )}
              </article>
            );
          })}
          {filtered.length === 0 && (
            <p className="rounded-[22px] bg-white px-5 py-8 text-center text-sm text-slate ring-1 ring-navy/6">
              No articles match that search.
            </p>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-[24px] bg-navy p-6 text-white md:p-7"
        >
          <p className="inline-flex items-center gap-2 text-sm font-semibold">
            <LifeBuoy className="h-4 w-4 text-forest" />
            Civic desk
          </p>
          <h2 className="mt-3 font-serif text-2xl tracking-tight">
            Still stuck? Write us.
          </h2>
          <p className="mt-2 text-sm text-white/55">
            Describe the page, the action, and what you expected. We route it to
            the right desk.
          </p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="I was trying to…"
            className="mt-5 w-full rounded-2xl bg-white/8 px-3 py-3 text-sm text-white outline-none ring-1 ring-white/12 placeholder:text-white/35 focus:ring-forest"
          />
          <button type="submit" className="btn btn-primary mt-4">
            <MessageCircle className="h-4 w-4" />
            Send to support
          </button>
        </form>
      </div>
    </div>
  );
}
