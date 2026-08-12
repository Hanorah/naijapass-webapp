"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, User, X } from "lucide-react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#projects", label: "Project" },
  { href: "#services", label: "Tables" },
  { href: "#trusted", label: "Visualization" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Home");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-navy/10 bg-white/85 shadow-sm backdrop-blur-xl"
          : "border-b border-navy/8 bg-[#f4f6f8]"
      }`}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Link href="#home" className="group flex items-center gap-2.5">
          <span className="relative flex h-9 w-9 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-orange/15 transition group-hover:bg-orange/25" />
            <svg viewBox="0 0 32 32" className="relative h-6 w-6" aria-hidden>
              <circle cx="16" cy="16" r="4" fill="#ff6b35" />
              <circle cx="16" cy="5" r="2.2" fill="#ff6b35" />
              <circle cx="16" cy="27" r="2.2" fill="#ff6b35" />
              <circle cx="5" cy="16" r="2.2" fill="#ff6b35" />
              <circle cx="27" cy="16" r="2.2" fill="#ff6b35" />
              <circle cx="8.2" cy="8.2" r="1.8" fill="#ff6b35" />
              <circle cx="23.8" cy="8.2" r="1.8" fill="#ff6b35" />
              <circle cx="8.2" cy="23.8" r="1.8" fill="#ff6b35" />
              <circle cx="23.8" cy="23.8" r="1.8" fill="#ff6b35" />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-navy">
            Edo Bid
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {links.map((link) => {
            const isActive = active === link.label;
            return (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setActive(link.label)}
                className={`relative text-[15px] font-medium transition-colors ${
                  isActive
                    ? "text-orange"
                    : "text-slate hover:text-navy"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 h-0.5 w-full rounded-full bg-orange" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            className="hidden rounded-full p-2.5 text-slate transition hover:bg-navy/5 hover:text-navy sm:inline-flex"
            aria-label="Search"
          >
            <Search className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="hidden rounded-full p-2.5 text-slate transition hover:bg-navy/5 hover:text-navy sm:inline-flex"
            aria-label="Account"
          >
            <User className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <button
            type="button"
            className="inline-flex rounded-full p-2.5 text-navy transition hover:bg-navy/5 md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-navy/8 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => {
                  setActive(link.label);
                  setOpen(false);
                }}
                className={`rounded-xl px-4 py-3 text-base font-medium ${
                  active === link.label
                    ? "bg-orange-soft text-orange"
                    : "text-navy hover:bg-mist"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
