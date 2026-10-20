"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Bell,
  Building2,
  ChevronDown,
  CircleHelp,
  Globe,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Search,
  Settings,
  ShoppingBag,
  Siren,
  Store,
  UserRound,
  X,
} from "lucide-react";
import { nigerianStates } from "@/data/states";
import NaijaPassMark from "@/components/NaijaPassMark";
import CivicChat from "@/components/dashboard/CivicChat";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";
import { useSession } from "@/components/SessionProvider";
import { initials, roleLabels, type Role } from "@/lib/session";

const primaryNav: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}[] = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["individual", "business", "govt", "admin"],
  },
  {
    href: "/dashboard/hub",
    label: "State Hub",
    icon: Globe,
    roles: ["individual", "business", "govt", "admin"],
  },
  {
    href: "/dashboard/marketplace",
    label: "Market Hub",
    icon: Store,
    roles: ["individual", "business", "govt", "admin"],
  },
  {
    href: "/dashboard/directory",
    label: "Directory",
    icon: ShoppingBag,
    roles: ["individual", "business", "govt", "admin"],
  },
  {
    href: "/dashboard/procurement",
    label: "Procurement",
    icon: Building2,
    roles: ["individual", "business", "govt", "admin"],
  },
  {
    href: "/dashboard/emergency",
    label: "Emergency",
    icon: Siren,
    roles: ["individual", "business", "govt", "admin"],
  },
];

const accountNav = [
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/help", label: "Help Center", icon: CircleHelp },
];

const notifications = [
  {
    title: "Tender closing Friday",
    body: "Edo rural roads bid window ends in 2 days.",
    time: "2h",
    href: "/dashboard/procurement",
  },
  {
    title: "State hub briefing",
    body: "New transport notices published for your state.",
    time: "5h",
    href: "/dashboard/hub",
  },
  {
    title: "Directory match",
    body: "3 verified suppliers match your last search.",
    time: "1d",
    href: "/dashboard/directory",
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, pending, ready, signOut } = useSession();
  const {
    search,
    setSearch,
    selectedState,
    setSelectedState,
    locating,
    locationSource,
  } = useDashboardSearch();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);
  const role: Role = user?.role ?? "individual";
  const visibleNav = primaryNav.filter((item) => item.roles.includes(role));
  const displayName = user?.name ?? "Guest";
  const mark = initials(displayName);
  const stateHint =
    locating
      ? "Detecting…"
      : locationSource === "geo"
        ? "From your location"
      : locationSource === "session"
        ? "From your profile"
        : locationSource === "user"
          ? "Selected in header"
          : null;

  useEffect(() => {
    if (!ready) return;
    if (user?.role === "admin") {
      router.replace("/admin");
      return;
    }
    if (user?.role === "govt") {
      router.replace("/govt");
      return;
    }
    if (pending && !user?.verified) {
      router.replace("/kyc");
      return;
    }
    if (!user && !pending) {
      router.replace("/signin");
    }
  }, [ready, pending, user, router]);

  useEffect(() => {
    setSidebarOpen(false);
    setProfileOpen(false);
    setBellOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) {
        setProfileOpen(false);
        setBellOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setBellOpen(false);
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const placeholder = pathname.startsWith("/dashboard/hub")
    ? "Search by-laws, gazettes, MDAs..."
    : pathname.startsWith("/dashboard/procurement")
      ? "Search tenders, agencies, or sectors"
      : pathname.startsWith("/dashboard/emergency")
        ? "Search alerts, hospitals, or stations"
        : pathname.startsWith("/dashboard/marketplace")
          ? "Search Market Hub listings..."
          : pathname.startsWith("/dashboard/help")
            ? "Search help articles..."
            : "Search businesses, tenders, or state";

  if (!ready || (!user && !pending)) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white text-sm text-slate">
        Opening portal…
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-white text-navy">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-navy-deep/50 backdrop-blur-sm lg:hidden"
          aria-label="Close sidebar"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(100vw,20rem)] flex-col overflow-hidden border-r border-white/8 bg-navy-deep text-white transition-transform duration-300 lg:w-[272px] lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 px-4 py-4">
          <NaijaPassMark size="sm" />
          <p className="mt-1.5 px-1 text-[11px] text-white/40">Governance portal</p>
        </div>

        <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-3 pb-2">
          <p className="px-2 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Workspace
          </p>
          <nav className="space-y-0.5">
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition ${
                    active
                      ? "bg-white/10 text-white shadow-[inset_3px_0_0_0_#0f9d6c]"
                      : "text-white/55 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <p className="px-2 pb-2 pt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
            Account
          </p>
          <nav className="space-y-0.5">
            {accountNav.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13.5px] font-medium transition ${
                    active
                      ? "bg-white/10 text-white shadow-[inset_3px_0_0_0_#0f9d6c]"
                      : "text-white/55 hover:bg-white/6 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.8} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="shrink-0 p-3">
          <Link
            href="/dashboard/profile"
            className="flex items-center gap-3 rounded-2xl bg-white/6 px-3 py-2.5 ring-1 ring-white/8 transition hover:bg-white/8"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-forest text-xs font-bold">
              {user?.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                mark
              )}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{displayName}</p>
              <p className="truncate text-[11px] text-white/40">
                {user?.verified ? "Verified" : "Pending"} · {roleLabels[role]}
              </p>
            </div>
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header
          ref={headerRef}
          className="sticky top-0 z-30 border-b border-navy/8 bg-white/90 backdrop-blur-2xl"
        >
          <div className="flex items-center gap-3 px-4 py-3 md:px-7">
            <button
              type="button"
              className="rounded-xl p-2 text-navy hover:bg-white lg:hidden"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border-0 bg-white py-2.5 pl-10 pr-3 text-sm outline-none ring-1 ring-navy/8 focus:ring-2 focus:ring-forest/25"
              />
            </div>

            <label className="relative hidden sm:block" title={stateHint ?? undefined}>
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-forest" />
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="appearance-none rounded-2xl bg-white py-2.5 pl-9 pr-8 text-sm font-medium outline-none ring-1 ring-navy/8"
              >
                {nigerianStates.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
            </label>

            <div className="relative">
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setBellOpen((v) => !v);
                  setProfileOpen(false);
                }}
                className="relative rounded-full p-2 text-navy hover:bg-white"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-forest ring-2 ring-mist" />
              </button>
              {bellOpen && (
                <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-navy/8">
                  <div className="flex items-center justify-between border-b border-navy/8 px-4 py-3">
                    <p className="font-display text-sm font-semibold">Notifications</p>
                    <span className="text-[11px] font-semibold text-forest">3 new</span>
                  </div>
                  <ul>
                    {notifications.map((n) => (
                      <li key={n.title}>
                        <Link
                          href={n.href}
                          className="block px-4 py-3 hover:bg-mist"
                        >
                          <p className="text-sm font-semibold">{n.title}</p>
                          <p className="mt-0.5 text-xs text-slate">{n.body}</p>
                          <p className="mt-1 text-[11px] text-slate">{n.time} ago</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen((v) => !v);
                  setBellOpen(false);
                }}
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 hover:bg-white"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-forest text-xs font-bold text-white">
                  {user?.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    mark
                  )}
                </span>
                <span className="hidden text-sm font-medium md:inline">
                  {displayName.split(" ")[0]}
                </span>
                <ChevronDown className="hidden h-4 w-4 text-slate md:inline" />
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl bg-white py-1 shadow-2xl ring-1 ring-navy/8">
                  <p className="px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate">
                    {roleLabels[role]}
                  </p>
                  <Link href="/dashboard/profile" className="block px-4 py-2 text-sm hover:bg-mist">
                    View profile
                  </Link>
                  <Link href="/dashboard/settings" className="block px-4 py-2 text-sm hover:bg-mist">
                    Settings
                  </Link>
                  <Link href="/" className="block px-4 py-2 text-sm hover:bg-mist">
                    Public site
                  </Link>
                  <button
                    type="button"
                    onClick={async () => {
                      await signOut();
                      router.push("/signin");
                    }}
                    className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-mist"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-4 py-8 md:px-7 md:py-10">{children}</main>
      </div>

      {!pathname.startsWith("/dashboard/emergency") && <CivicChat />}
    </div>
  );
}
