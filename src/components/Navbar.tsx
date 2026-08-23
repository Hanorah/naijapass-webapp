"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Crosshair, Menu, X } from "lucide-react";
import { nigerianStates } from "@/data/states";
import NaijaPassMark from "@/components/NaijaPassMark";
import { useSession } from "@/components/SessionProvider";
import { homeForRole } from "@/lib/returnUrl";
import { initials } from "@/lib/session";
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
  const { ready, user } = useSession();
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
      if (e.key === "Escape") {
        setMenu(null);
        setOpen(false);
      }
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
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent">
      <div className="mx-auto max-w-[1440px] px-3 pt-3 md:px-5">
        <div
          ref={barRef}
          className={`mx-auto grid h-14 w-full min-w-0 max-w-6xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-full px-2.5 transition-all duration-500 sm:h-16 sm:gap-3 sm:px-3 md:h-[4.5rem] md:px-4 ${
            glass
              ? "border border-white/20 bg-white/12 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              : "border border-navy/8 bg-white/95 shadow-[0_8px_40px_-24px_rgba(12,18,24,0.35)] backdrop-blur-2xl"
          }`}
        >
          <NaijaPassMark size="lg" className="shrink-0" />

          {/* Mobile: location in the bar (where Get started used to sit) */}
          <div className="relative min-w-0 justify-self-center lg:hidden">
            <button
              type="button"
              onClick={() => setMenu((m) => (m === "state" ? null : "state"))}
              aria-haspopup="listbox"
              aria-expanded={menu === "state"}
              className={`inline-flex max-w-[min(42vw,11rem)] items-center gap-1 rounded-full px-2.5 py-1.5 text-[12px] font-medium transition sm:max-w-[12rem] sm:gap-1.5 ${
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
              <div className="absolute left-1/2 z-50 mt-2 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-xl">
                <ul
                  role="listbox"
                  className="no-scrollbar max-h-72 overflow-y-auto py-1"
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
                        className={`w-full px-3 py-2.5 text-left text-sm ${
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

          <div className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
            <div className="relative hidden lg:block">
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

            {ready && user ? (
              <Link
                href={homeForRole(user.role)}
                className={`hidden items-center gap-2 rounded-full px-2.5 py-1.5 text-[13px] font-semibold transition xl:inline-flex ${
                  glass
                    ? "bg-white/10 text-white hover:bg-white/18"
                    : "bg-[#f4f6f8] text-navy hover:bg-orange-soft"
                }`}
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="max-w-[8rem] truncate">{user.name.split(" ")[0]}</span>
              </Link>
            ) : (
              <Link
                href="/signin"
                className={`hidden rounded-full px-2.5 py-2 text-[13px] font-semibold transition xl:inline-flex ${
                  glass
                    ? "text-white/80 hover:text-white"
                    : "text-navy/80 hover:text-navy"
                }`}
              >
                Sign in
              </Link>
            )}

            {!user ? (
              <Link
                href="/signup"
                className="hidden rounded-full bg-forest px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(15,157,108,0.7)] transition hover:bg-forest-hover lg:inline-flex lg:items-center"
              >
                Get started
              </Link>
            ) : (
              <Link
                href={homeForRole(user.role)}
                className="hidden rounded-full bg-forest px-3.5 py-2 text-[13px] font-semibold text-white shadow-[0_12px_32px_-12px_rgba(15,157,108,0.7)] transition hover:bg-forest-hover lg:inline-flex lg:items-center"
              >
                Open portal
              </Link>
            )}

            <button
              type="button"
              className={`inline-flex rounded-full p-2.5 transition lg:hidden ${
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

      {/* Full-width mobile menu */}
      <div
        className={`fixed inset-0 z-[60] flex flex-col bg-[#05080b] transition-[opacity,visibility] duration-300 lg:hidden ${
          open
            ? "visible opacity-100"
            : "invisible pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 70% 50% at 80% -10%, rgba(15,157,108,0.28), transparent 55%), radial-gradient(ellipse 50% 40% at 0% 100%, rgba(15,157,108,0.12), transparent 50%)",
          }}
        />

        <div className="relative flex items-center justify-between gap-3 px-4 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
          <NaijaPassMark size="lg" className="shrink-0" />
          <button
            type="button"
            className="inline-flex rounded-full bg-white/10 p-2.5 text-white transition hover:bg-white/16"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav
          className="relative flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-4 sm:px-5"
          aria-label="Mobile"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/35">
            Navigate
          </p>
          <div className="space-y-1">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-2xl px-4 py-4 text-[1.15rem] font-semibold tracking-tight transition ${
                    active
                      ? "bg-white text-navy"
                      : "text-white/85 hover:bg-white/8 hover:text-white"
                  }`}
                  aria-current={active ? "page" : undefined}
                >
                  {link.label}
                  {active ? (
                    <span className="h-1.5 w-1.5 rounded-full bg-forest" />
                  ) : null}
                </Link>
              );
            })}
          </div>

          <div className="mt-auto space-y-3 pt-10">
            {ready && user ? (
              <Link
                href={homeForRole(user.role)}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-4 text-navy"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-forest text-sm font-bold text-white">
                  {initials(user.name)}
                </span>
                <span className="min-w-0 text-left">
                  <span className="block truncate text-base font-semibold">
                    {user.name}
                  </span>
                  <span className="block text-sm text-slate">Open portal</span>
                </span>
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-2xl bg-forest px-4 py-4 text-base font-semibold text-white shadow-[0_16px_40px_-16px_rgba(15,157,108,0.9)]"
                >
                  Get started
                </Link>
                <Link
                  href="/signin"
                  onClick={() => setOpen(false)}
                  className="flex w-full items-center justify-center rounded-2xl border border-white/15 px-4 py-4 text-base font-semibold text-white"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
