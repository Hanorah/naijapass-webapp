"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Crosshair, Menu, X } from "lucide-react";
import { nigerianStates } from "@/data/states";
import NaijaPassMark from "@/components/NaijaPassMark";
import { useSiteState } from "@/lib/siteState";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/procurement", label: "Procurement" },
];

type MenuId = "state" | null;

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<MenuId>(null);
  const { selectedState, setSelectedState } = useSiteState();
  const barRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";
  const glass = isHome && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
      if (!barRef.current?.contains(e.target as Node)) setMenu(null);
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

  const linkClass = (active: boolean) =>
    `shrink-0 rounded-full px-2.5 py-1.5 text-[13px] font-medium transition-colors xl:px-3 ${
      glass
        ? active
          ? "text-white"
          : "text-white/60 hover:text-white"
        : active
          ? "text-navy"
          : "text-slate hover:text-navy"
    }`;

  return (
    <header
      className={`${
        isHome ? "fixed inset-x-0 top-0" : "sticky top-0"
      } z-50 bg-transparent`}
    >
      <div className="mx-auto max-w-[1440px] px-3 pb-2 pt-3 md:px-5">
        <div
          ref={barRef}
          className={`mx-auto grid h-16 w-full min-w-0 max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-full px-2.5 transition-all duration-500 sm:gap-3 sm:px-3 md:h-[4.5rem] md:px-4 ${
            glass
              ? "border border-white/20 bg-white/12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              : "border border-navy/8 bg-white/95 shadow-[0_8px_40px_-24px_rgba(12,18,24,0.35)] backdrop-blur-2xl"
          }`}
        >
          {/* Brand */}
          <NaijaPassMark size="lg" className="shrink-0" />

          {/* Links — flex in the middle, never absolute-overlap */}
          <nav
            className="hidden min-w-0 items-center justify-center gap-0.5 overflow-hidden lg:flex"
            aria-label="Primary"
          >
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={linkClass(isActive(link.href))}
                aria-current={isActive(link.href) ? "page" : undefined}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={() => setMenu((m) => (m === "state" ? null : "state"))}
                aria-haspopup="listbox"
                aria-expanded={menu === "state"}
                className={`inline-flex max-w-[9.5rem] items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium transition ${
                  glass
                    ? "bg-white/10 text-white hover:bg-white/18"
                    : "bg-[#f4f6f8] text-navy hover:bg-orange-soft"
                }`}
              >
                <Crosshair className="h-3.5 w-3.5 shrink-0 opacity-70" />
                <span className="min-w-0 truncate font-semibold">{selectedState}</span>
                <ChevronDown className="h-3.5 w-3.5 shrink-0 opacity-70" />
              </button>
              {menu === "state" && (
                <div className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-xl">
                  <ul
                    role="listbox"
                    className="no-scrollbar max-h-80 overflow-y-auto py-1"
                  >
                    {["All States", ...nigerianStates].map((s) => (
                      <li key={s}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={selectedState === s}
                          onClick={() => {
                            setSelectedState(s);
                            setMenu(null);
                          }}
                          className={`w-full px-3 py-2 text-left text-sm ${
                            selectedState === s
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

            <Link
              href="/signin"
              className={`hidden rounded-full px-2.5 py-2 text-[13px] font-semibold transition xl:inline-flex ${
                glass ? "text-white/80 hover:text-white" : "text-navy/80 hover:text-navy"
              }`}
            >
              Sign in
            </Link>

            <Link
              href="/signup"
              className="btn btn-primary hidden px-3.5 py-2 text-[13px] lg:inline-flex"
            >
              Get started
            </Link>

            <button
              type="button"
              className={`inline-flex rounded-full p-2 transition lg:hidden ${
                glass ? "text-white hover:bg-white/10" : "text-navy hover:bg-navy/5"
              }`}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="mx-3 mt-2 overflow-hidden rounded-3xl border border-navy/8 bg-white shadow-xl lg:hidden">
          <nav className="flex flex-col gap-1 px-3 py-4" aria-label="Mobile">
            {links.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className={`rounded-xl px-4 py-3 text-base font-medium ${
                  isActive(link.href) ? "bg-[#f4f6f8] text-navy" : "text-navy hover:bg-mist"
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
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="mx-4 mb-3 w-[calc(100%-2rem)] rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm"
              >
                {["All States", ...nigerianStates].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <Link
              href="/signin"
              className="mt-1 rounded-xl px-4 py-3 text-base font-medium text-navy xl:hidden"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="mx-2 mt-2 rounded-xl bg-forest px-4 py-3 text-center text-base font-semibold text-white lg:hidden"
            >
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
