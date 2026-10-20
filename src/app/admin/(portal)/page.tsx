"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Building2,
  ClipboardList,
  FolderKanban,
  Landmark,
  MessageSquareText,
  Store,
  Users,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { useProjects } from "@/lib/db/projects";
import { useTenders } from "@/lib/db/tenders";
import { useBusinesses } from "@/lib/db/businesses";
import { useAdminProfiles } from "@/lib/db/adminProfiles";
import { useAdminFeedback } from "@/lib/db/adminFeedback";
import { formatBudgetLabel } from "@/lib/db/types";
import { nigerianStates } from "@/data/states";

export default function AdminOverviewPage() {
  const { listings } = useSession();
  const { projects, source: projectSource } = useProjects({ includeDrafts: true });
  const { tenders, source: tenderSource } = useTenders();
  const { allBusinesses, source: businessSource } = useBusinesses();
  const { profiles, loading: profilesLoading } = useAdminProfiles();
  const { items: feedback } = useAdminFeedback();

  const statusCounts = useMemo(
    () => ({
      inProgress: projects.filter((p) => p.status === "In Progress").length,
      completed: projects.filter((p) => p.status === "Completed").length,
      planned: projects.filter((p) => p.status === "Planned").length,
      stalled: projects.filter((p) => p.status === "Stalled").length,
      drafts: projects.filter((p) => p.reviewStatus === "draft").length,
      budget: projects
        .filter((p) => p.reviewStatus === "published")
        .reduce((sum, p) => sum + (p.budgetNgn || 0), 0),
    }),
    [projects],
  );

  const openTenders = tenders.filter((t) => !t.deadline.toLowerCase().includes("closed")).length;
  const pendingUsers = profiles.filter(
    (p) => p.kyc_status === "pending" || p.account_status === "pending",
  );
  const govtAccounts = profiles.filter((p) => p.role === "govt").length;
  const liveListings =
    allBusinesses.length > 0
      ? allBusinesses.filter((b) => b.verified).length
      : listings.filter((l) => l.status === "live").length;

  const cards = [
    {
      href: "/admin/projects",
      label: "Projects",
      icon: FolderKanban,
      value: projects.length,
      hint:
        projectSource === "database" || projectSource === "mixed"
          ? `${statusCounts.drafts} drafts · live data`
          : "Catalogue + database",
    },
    {
      href: "/admin/users",
      label: "Users",
      icon: Users,
      value: profilesLoading ? "…" : profiles.length,
      hint: `${pendingUsers.length} pending verification`,
    },
    {
      href: "/admin/tenders",
      label: "Tenders",
      icon: ClipboardList,
      value: tenders.length,
      hint: `${openTenders} open · ${tenderSource === "database" ? "live" : "seed"}`,
    },
    {
      href: "/admin/marketplace",
      label: "Marketplace",
      icon: Store,
      value: allBusinesses.length || listings.length,
      hint: `${liveListings} live · ${businessSource === "database" ? "DB" : "session"}`,
    },
  ];

  const recentFeedback = feedback.slice(0, 5);
  const byState = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of projects) {
      map.set(p.state, (map.get(p.state) ?? 0) + 1);
    }
    return nigerianStates
      .map((state) => ({ state, count: map.get(state) ?? 0 }))
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [projects]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-navy sm:text-4xl">
          Operations overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-slate">
          Nationwide projects, accounts, tenders, and marketplace. Counts refresh
          from the API when connected ({formatBudgetLabel(statusCounts.budget)}{" "}
          published project budget · {govtAccounts} state portal accounts).
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm transition hover:border-forest/30 hover:bg-forest/5"
            >
              <Icon className="h-5 w-5 text-forest" />
              <p className="mt-4 font-serif text-3xl text-navy">{card.value}</p>
              <p className="mt-1 text-sm font-semibold text-navy/80">{card.label}</p>
              <p className="mt-0.5 text-xs text-slate">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-navy">Project pipeline</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {(
              [
                ["In Progress", statusCounts.inProgress, "bg-amber-400"],
                ["Completed", statusCounts.completed, "bg-emerald-400"],
                ["Planned", statusCounts.planned, "bg-sky-400"],
                ["Stalled", statusCounts.stalled, "bg-rose-400"],
              ] as const
            ).map(([label, count, color]) => (
              <li key={label} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  {label}
                </span>
                <span className="font-semibold text-navy">{count}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/projects"
            className="mt-5 inline-flex text-sm font-semibold text-forest hover:text-forest-hover"
          >
            Manage all projects →
          </Link>
        </section>

        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-navy">States with projects</h2>
            <Landmark className="h-4 w-4 text-slate" />
          </div>
          {byState.length === 0 ? (
            <p className="mt-4 text-sm text-slate">No projects loaded yet.</p>
          ) : (
            <ul className="mt-4 space-y-2">
              {byState.map((row) => (
                <li
                  key={row.state}
                  className="flex items-center justify-between rounded-xl border border-navy/8 px-3 py-2 text-sm"
                >
                  <span className="font-medium text-navy">{row.state}</span>
                  <span className="text-slate">{row.count}</span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/states"
            className="mt-5 inline-flex text-sm font-semibold text-forest hover:text-forest-hover"
          >
            State governments →
          </Link>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-navy">Pending verifications</h2>
            <Building2 className="h-4 w-4 text-slate" />
          </div>
          {pendingUsers.length === 0 ? (
            <p className="mt-4 text-sm text-slate">No pending accounts.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingUsers.slice(0, 6).map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-navy/8 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-navy">
                      {u.full_name || u.business_name || u.email}
                    </p>
                    <p className="text-xs text-slate">
                      {u.role} · {u.state ?? "—"} · {u.kyc_status}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                    pending
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/users"
            className="mt-5 inline-flex text-sm font-semibold text-forest hover:text-forest-hover"
          >
            Review users →
          </Link>
        </section>

        <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-navy">Recent feedback</h2>
            <MessageSquareText className="h-4 w-4 text-slate" />
          </div>
          <div className="mt-4 divide-y divide-navy/8">
            {recentFeedback.length === 0 ? (
              <p className="py-2 text-sm text-slate">No citizen feedback yet.</p>
            ) : (
              recentFeedback.map((r) => (
                <article key={r.id} className="py-3">
                  <p className="text-sm font-semibold text-navy">
                    {r.topic || "Citizen comment"} · {r.rating}/5
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate">
                    {r.body}
                  </p>
                  <p className="mt-2 text-[11px] text-slate">
                    {r.project_id} · {r.user_name || "Anonymous"} · {r.visibility}
                  </p>
                </article>
              ))
            )}
          </div>
          <Link
            href="/admin/feedback"
            className="mt-3 inline-flex text-sm font-semibold text-forest hover:text-forest-hover"
          >
            Open feedback & reports →
          </Link>
        </section>
      </div>
    </div>
  );
}
