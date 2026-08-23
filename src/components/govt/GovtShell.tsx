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

  const allowed = Boolean(
    user && (user.role === "govt" || user.role === "admin"),
  );

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace(`/govt/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!allowed) {
      router.replace("/dashboard");
    }
  }, [ready, user, allowed, router, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-3 bg-white px-6 text-center text-slate">
        <p className="text-sm">Opening state portal…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-sm text-slate">Sign in with your state government account.</p>
        <Link
          href={`/govt/signin?next=${encodeURIComponent(pathname)}`}
          className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
        >
          Go to state sign-in
        </Link>
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="flex min-h-dvh flex-1 flex-col items-center justify-center gap-4 bg-white px-6 text-center">
        <p className="text-sm text-slate">
          This account is not a state government login.
        </p>
        <Link
          href="/govt/signin"
          className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover"
        >
          Use a state portal account
        </Link>
      </div>
    );
  }

  const stateName = user.govtState ?? user.state ?? "Nigeria";
  const current = nav.find((item) => isActive(pathname, item.href));

  return (
    <div className="min-h-dvh bg-white text-navy">
      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-navy-deep/50 backdrop-blur-sm lg:hidden"
          aria-label="Close overlay"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(100vw,20rem)] flex-col overflow-hidden border-r border-white/8 bg-navy-deep text-white transition-transform duration-300 lg:w-[272px] lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="shrink-0 px-4 py-4">
          <div className="flex items-center justify-between gap-2">
            <NaijaPassMark size="sm" />
            <button
              type="button"
              className="rounded-lg p-2 text-white/60 lg:hidden"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-4 rounded-xl border border-forest/30 bg-forest/15 px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-emerald-300/90">
              <Landmark className="h-3 w-3" />
              State portal
            </p>
            <p className="mt-1 truncate text-sm font-bold text-white">{stateName}</p>
          </div>
        </div>

        <nav className="no-scrollbar min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-2">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition ${
                  active
                    ? "bg-white/10 text-white shadow-[inset_3px_0_0_0_#0f9d6c]"
                    : "text-white/55 hover:bg-white/6 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 space-y-3 border-t border-white/8 p-3">
          <Link
            href={`/projects?state=${encodeURIComponent(stateName)}`}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-white/45 hover:bg-white/6 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View public projects
          </Link>

          <div className="rounded-2xl bg-white/6 p-3 ring-1 ring-white/8">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-forest text-xs font-bold text-white">
                {initials(user.name)}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-white/40">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.push("/govt/signin");
              }}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold text-white/70 hover:bg-white/8"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[272px]">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-navy/8 bg-white/90 px-4 py-3 backdrop-blur-2xl md:px-7">
          <button
            type="button"
            className="rounded-xl p-2 text-navy hover:bg-navy/[0.04] lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wide text-slate">
              {stateName} government
            </p>
            <p className="text-sm font-semibold text-navy">
              {current?.label ?? "State portal"}
            </p>
          </div>
        </header>
        <main className="px-4 py-8 md:px-7 md:py-10">{children}</main>
      </div>
    </div>
  );
}
