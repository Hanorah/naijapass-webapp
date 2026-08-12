"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ArrowRight, Linkedin, Twitter, Youtube } from "lucide-react";

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
    <footer className="bg-navy text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-2 md:px-8 lg:grid-cols-4 lg:gap-10">
        <div className="lg:pr-6">
          <Link href="#home" className="inline-flex items-center gap-2.5">
            <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
              <circle cx="16" cy="16" r="4" fill="#ff6b35" />
              <circle cx="16" cy="5" r="2.2" fill="#ff6b35" />
              <circle cx="16" cy="27" r="2.2" fill="#ff6b35" />
              <circle cx="5" cy="16" r="2.2" fill="#ff6b35" />
              <circle cx="27" cy="16" r="2.2" fill="#ff6b35" />
            </svg>
            <span className="font-display text-lg font-bold">Edo Bid</span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Building transparent pathways between businesses and government
            infrastructure opportunities across Nigeria.
          </p>
          <div className="mt-6 flex gap-3">
            {[
              { Icon: Twitter, label: "Twitter" },
              { Icon: Linkedin, label: "LinkedIn" },
              { Icon: Youtube, label: "YouTube" },
            ].map(({ Icon, label }) => (
              <a
                key={label}
                href="#"
                aria-label={label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:border-orange hover:bg-orange hover:text-white"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-orange">
            Company
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {["About", "Blog", "FAQ"].map((item) => (
              <li key={item}>
                <Link href="#about" className="transition hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-orange">
            Legal
          </h3>
          <ul className="mt-4 space-y-3 text-sm text-white/70">
            {[
              "Terms & Conditions",
              "Claim",
              "Privacy & Policy",
              "Contact us",
            ].map((item) => (
              <li key={item}>
                <Link href="#home" className="transition hover:text-white">
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-orange">
            Newsletter
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            Subscribe for weekly tender alerts and market briefings.
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
              className="min-w-0 flex-1 rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-navy outline-none ring-2 ring-transparent placeholder:text-slate focus:ring-orange"
            />
            <button
              type="submit"
              disabled={loading}
              aria-label="Subscribe"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange text-white transition hover:bg-orange-hover disabled:opacity-60"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-5 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between md:px-8">
          <p>All Rights Reserved © Edo Bid {new Date().getFullYear()}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="#home" className="hover:text-white">
              Terms & Conditions
            </Link>
            <Link href="#home" className="hover:text-white">
              Claim
            </Link>
            <Link href="#home" className="hover:text-white">
              Privacy & Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
