"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Bell, ChevronDown, Menu, X } from "lucide-react";
import { nigerianStates } from "@/data/states";
import { BrandGlyph } from "@/components/NaijaPassMark";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/procurement", label: "Procurement" },
  { href: "/visualization", label: "Visualization" },
  { href: "/feedback", label: "Feedback" },
];

const notifications = [
  {
    title: "New award published",
    body: "Oredo LGA posted a ₦450M infrastructure award.",
    time: "2h ago",
  },
  {
    title: "Field report uploaded",
    body: "KM 62 paving update on Lagos-Ibadan Expressway.",
    time: "Yesterday",
  },
  {
    title: "Tender closing soon",
    body: "Edo rural roads bid window ends Friday.",
    time: "3d ago",
  },
];

type MenuId = "state" | "bell" | null;

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuId>(null);
  const [state, setState] = useState("Edo");
  const actionsRef = useRef<HTMLDivElement>(null);
  const overlay = pathname === "/" || pathname === "/about";
  const inverted = overlay && !scrolled && !open;

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

  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!actionsRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const toggle = (id: MenuId) => setMenu((curr) => (curr === id ? null : id));

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ${
        inverted
          ? "border-b border-transparent bg-transparent"
          : "border-b border-navy/8 bg-white/90 shadow-[0_8px_40px_-24px_rgba(12,18,24,0.35)] backdrop-blur-2xl"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-4 px-5 md:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-2.5">
          <span
            className={`relative flex h-9 w-9 items-center justify-center rounded-full transition ${
              inverted ? "bg-white/10 text-forest" : "bg-forest/12 text-forest"
            }`}
          >
            <BrandGlyph className="relative h-5 w-5" />
          </span>
          <span
            className={`font-display text-[17px] font-semibold tracking-tight ${
              inverted ? "text-white" : "text-navy"
            }`}
          >
            NaijaPass
          </span>
        </Link>

        <nav
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 xl:flex"
          aria-label="Primary"
        >
          {links.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.label}
                href={link.href}
                className={`relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors ${
                  inverted
                    ? active
                      ? "text-white"
                      : "text-white/55 hover:text-white"
                    : active
                      ? "text-navy"
                      : "text-slate hover:text-navy"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
                {active && (
                  <span
                    className={`absolute inset-x-3 -bottom-0.5 h-px ${
                      inverted ? "bg-forest" : "bg-forest"
                    }`}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div ref={actionsRef} className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative hidden md:block">
            <button
              type="button"
              onClick={() => toggle("state")}
              aria-haspopup="listbox"
              aria-expanded={menu === "state"}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-medium transition ${
                inverted
                  ? "text-white/70 hover:bg-white/8 hover:text-white"
                  : "text-navy/70 hover:bg-navy/5 hover:text-navy"
              }`}
            >
              <span>{state}</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            {menu === "state" && (
              <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-xl">
                <ul
                  role="listbox"
                  className="no-scrollbar grid max-h-80 grid-cols-1 overflow-y-auto py-1"
                >
                  {nigerianStates.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={state === s}
                        onClick={() => {
                          setState(s);
                          setMenu(null);
                        }}
                        className={`w-full px-3 py-2 text-left text-sm ${
                          state === s
                            ? "bg-orange-soft font-semibold text-forest"
                            : "text-navy hover:bg-mist"
                        }`}
                      >
                        {s}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => toggle("bell")}
              aria-label="Notifications"
              aria-expanded={menu === "bell"}
              className={`relative inline-flex rounded-full p-2 transition ${
                inverted
                  ? "text-white/70 hover:bg-white/8 hover:text-white"
                  : "text-navy/70 hover:bg-navy/5 hover:text-navy"
              }`}
            >
              <Bell className="h-4 w-4" strokeWidth={1.85} />
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-forest ring-2 ring-current/0" />
            </button>
            {menu === "bell" && (
              <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-xl">
                <p className="border-b border-navy/8 px-4 py-3 font-display text-sm font-bold text-navy">
                  Notifications
                </p>
                <ul>
                  {notifications.map((n) => (
                    <li
                      key={n.title}
                      className="border-b border-navy/6 px-4 py-3 last:border-0 hover:bg-mist/70"
                    >
                      <p className="text-sm font-semibold text-navy">{n.title}</p>
                      <p className="mt-0.5 text-xs text-slate">{n.body}</p>
                      <p className="mt-1 text-[11px] text-slate">{n.time}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <Link
            href="/signin"
            className={`hidden rounded-full px-3 py-2 text-[13px] font-semibold transition lg:inline-flex ${
              inverted ? "text-white/75 hover:text-white" : "text-navy/80 hover:text-navy"
            }`}
          >
            Sign in
          </Link>

          <Link href="/signup" className="btn btn-primary px-4 py-2.5 text-[13px] sm:px-5">
            Get Started
          </Link>

          <button
            type="button"
            className={`inline-flex rounded-full p-2 transition xl:hidden ${
              inverted ? "text-white hover:bg-white/10" : "text-navy hover:bg-navy/5"
            }`}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-navy/8 bg-white xl:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 px-5 py-4" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-base font-medium ${
                  isActive(link.href) ? "bg-white text-navy shadow-sm" : "text-navy hover:bg-white/60"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-navy/8 pt-3 md:hidden">
              <p className="px-4 pb-2 text-xs font-bold uppercase tracking-wide text-slate">
                State
              </p>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="mx-4 mb-3 w-[calc(100%-2rem)] rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm"
              >
                {nigerianStates.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <Link
              href="/signin"
              className="mt-1 rounded-xl px-4 py-3 text-base font-medium text-navy lg:hidden"
            >
              Sign in
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
