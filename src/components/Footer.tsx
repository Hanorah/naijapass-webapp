"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ArrowRight } from "lucide-react";
import { BrandGlyph } from "@/components/NaijaPassMark";

const socials = [
  {
    label: "X",
    href: "/contact",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.727-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z",
  },
  {
    label: "LinkedIn",
    href: "/contact",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
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
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    window.setTimeout(() => {
      toast.success("You're subscribed — welcome aboard.");
      setEmail("");
      setLoading(false);
    }, 500);
  };

  return (
    <footer className="dark-canvas relative overflow-hidden text-white">
      <div className="aurora -right-20 top-0 h-80 w-80 bg-forest/15" />
      <div className="relative mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-24">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_0.7fr_0.7fr_1.1fr] lg:gap-10">
          <div className="max-w-sm">
            <Link href="/" className="inline-flex items-center gap-2.5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/8 text-forest">
                <BrandGlyph className="h-5 w-5" />
              </span>
              <span className="font-display text-lg font-semibold">NaijaPass</span>
            </Link>
            <p className="mt-6 font-serif text-2xl leading-snug tracking-tight text-white/90 md:text-[1.7rem]">
              Transparent pathways between business and government.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-white/45">
              Civic intelligence, verified directories, and open contracting
              across Nigeria’s 36 states.
            </p>
            <div className="mt-7 flex gap-2.5">
              {socials.map(({ label, href, path }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/55 transition hover:border-forest hover:bg-forest hover:text-white"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 fill-current"
                    aria-hidden
                  >
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
            <ul className="mt-5 space-y-3.5 text-sm text-white/65">
              {[
                { href: "/projects", label: "Projects" },
                { href: "/procurement", label: "Procurement" },
                { href: "/visualization", label: "Visualization" },
                { href: "/feedback", label: "Feedback" },
              ].map((item) => (
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
            <ul className="mt-5 space-y-3.5 text-sm text-white/65">
              {[
                { href: "/about", label: "About" },
                { href: "/signup", label: "Register business" },
                { href: "/signin", label: "Sign in" },
                { href: "/kyc", label: "Verify account" },
              ].map((item) => (
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
              Briefing
            </h3>
            <p className="mt-5 text-sm leading-relaxed text-white/50">
              Weekly tender alerts and market notes. No noise.
            </p>
            <form onSubmit={onSubmit} className="mt-5 flex gap-2">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="min-w-0 flex-1 rounded-full border-0 bg-white/6 px-4 py-2.5 text-sm text-white outline-none ring-1 ring-white/12 placeholder:text-white/30 focus:ring-forest"
              />
              <button
                type="submit"
                disabled={loading}
                aria-label="Subscribe"
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-forest text-white transition hover:bg-forest-hover disabled:opacity-60"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/8">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>© {new Date().getFullYear()} NaijaPass. All rights reserved.</p>
          <div className="flex flex-wrap gap-5">
            <Link href="/disclaimer" className="hover:text-white">
              Disclaimer
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
