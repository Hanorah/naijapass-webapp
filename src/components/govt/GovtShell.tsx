"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import {
  ClipboardList,
  ExternalLink,
  FolderKanban,
  Landmark,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  MessageSquareText,
  Settings,
  X,
} from "lucide-react";
import NaijaPassMark from "@/components/NaijaPassMark";
import { useSession } from "@/components/SessionProvider";
import { initials } from "@/lib/session";

const nav = [
  { href: "/govt", label: "Overview", icon: LayoutDashboard },
  { href: "/govt/projects", label: "Projects", icon: FolderKanban },
  { href: "/govt/tenders", label: "Tenders", icon: ClipboardList },
  { href: "/govt/updates", label: "Notices & Laws", icon: Megaphone },
  { href: "/govt/feedback", label: "Citizen Feedback", icon: MessageSquareText },
  { href: "/govt/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  if (href === "/govt") return pathname === "/govt";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function GovtShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, signOut } = useSession();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/govt/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (user.role !== "govt" && user.role !== "admin") {
      router.replace("/dashboard");
    }
  }, [ready, user, router, pathname]);

  if (!ready || !user || (user.role !== "govt" && user.role !== "admin")) {
    return (
      <div className="flex min-h-full flex-1 items-center justify-center bg-[#0b1220] text-white/70">
        Checking state portal access…
      </div>
    );
  }

  const stateName = user.govtState ?? user.state ?? "Nigeria";
  const current = nav.find((item) => isActive(pathname, item.href));

  return (
    <div className="flex min-h-full flex-1 bg-[#0b1220] text-white">
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-white/10 bg-[#0e1628] p-4 transition-transform lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <NaijaPassMark />
          <button
            type="button"
            className="rounded-lg p-2 text-white/60 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/8 px-3 py-2.5">
          <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-300/80">
            <Landmark className="h-3 w-3" />
            State portal
          </p>
          <p className="mt-1 truncate text-sm font-bold text-white">{stateName}</p>
        </div>

        <nav className="mt-5 flex-1 space-y-1 overflow-y-auto">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-emerald-500/15 text-emerald-300"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
          <Link
            href={`/projects?state=${encodeURIComponent(stateName)}`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white/50 hover:bg-white/5 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View public page
          </Link>

          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-white/45">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/govt/signin");
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/5"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-white/10 bg-[#0b1220]/90 px-4 py-3 backdrop-blur lg:px-8">
          <button
            type="button"
            className="rounded-lg p-2 text-white/70 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40">
              {stateName} government
            </p>
            <p className="text-sm font-semibold text-white/90">
              {current?.label ?? "State portal"}
            </p>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
