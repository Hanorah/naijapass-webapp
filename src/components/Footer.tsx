"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ArrowUpRight } from "lucide-react";
import NaijaPassMark from "@/components/NaijaPassMark";

const explore = [
  { href: "/projects", label: "Projects" },
  { href: "/procurement", label: "Procurement" },
  { href: "/dashboard/hub", label: "State Hub" },
  { href: "/visualization", label: "Visualization" },
];

const company = [
  { href: "/about", label: "About" },
  { href: "/signup", label: "Register business" },
  { href: "/signin", label: "Sign in" },
  { href: "/kyc", label: "Verify account" },
  { href: "/contact", label: "Contact" },
];

const legal = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/disclaimer", label: "Disclaimer" },
];

const socials = [
  {
    label: "X",
    href: "/contact",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
  },
  {
    label: "LinkedIn",
    href: "/contact",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.064 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
  {
    label: "YouTube",
    href: "/contact",
    path: "M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Enter a valid email address.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      toast.success("You're on the list — tender notes coming.");
      setEmail("");
      setLoading(false);
    }, 500);
  };

  return (
    <footer className="relative w-full max-w-[100vw] overflow-hidden bg-[#05080b] text-white">
      {/* Top CTA band */}
      <div className="relative border-b border-white/8">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(ellipse 60% 80% at 15% 50%, rgba(15,157,108,0.22), transparent 55%), radial-gradient(ellipse 40% 60% at 90% 20%, rgba(184,149,106,0.12), transparent 50%)",
          }}
        />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-5 py-16 md:flex-row md:items-end md:justify-between md:px-8 md:py-20">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-forest">
              NaijaPass
            </p>
            <h2 className="mt-4 font-serif text-[clamp(2.4rem,5vw,4.2rem)] leading-[1.02] tracking-[-0.03em] text-white">
              Your state&apos;s tenders,{" "}
              <em className="italic text-forest">in one place.</em>
            </h2>
          </div>
          <Link
            href="/signup"
            className="btn btn-primary shrink-0 self-start md:self-auto"
          >
            Create free account
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Main grid */}
      <div className="relative mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:gap-10">
          <div>
            <NaijaPassMark size="md" />
            <p className="mt-5 max-w-xs text-[15px] leading-relaxed text-white/50">
              Open tenders, state hubs, MDA contacts, and a verified directory —
              for businesses that bid and agencies that publish.
            </p>
            <div className="mt-8 flex gap-2">
              {socials.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/50 transition hover:border-forest/50 hover:bg-forest hover:text-white"
                >
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden>
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Explore
            </h3>
            <ul className="mt-5 space-y-3 text-[15px] text-white/65">
              {explore.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Company
            </h3>
            <ul className="mt-5 space-y-3 text-[15px] text-white/65">
              {company.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
              Tender briefing
            </h3>
            <p className="mt-5 text-[15px] leading-relaxed text-white/50">
              Weekly open bids and award notes for your state. No spam.
            </p>
            <form onSubmit={onSubmit} className="mt-5">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <div className="flex overflow-hidden rounded-2xl bg-white/[0.06] ring-1 ring-white/12 focus-within:ring-forest/50">
                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="min-w-0 flex-1 border-0 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 bg-forest px-4 text-sm font-semibold text-white transition hover:bg-forest-hover disabled:opacity-60"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Giant watermark brand */}
        <div
          className="pointer-events-none mt-16 select-none overflow-hidden border-t border-white/8 pt-10 md:mt-20 md:pt-14"
          aria-hidden
        >
          <p className="truncate font-display text-[clamp(3rem,12vw,9rem)] font-semibold leading-none tracking-[-0.06em] text-white/[0.04]">
            NAIJAPASS
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} NaijaPass. Built for Nigeria.</p>
          <div className="flex flex-wrap gap-5">
            {legal.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
