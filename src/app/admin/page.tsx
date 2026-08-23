"use client";

import Link from "next/link";
import {
  Building2,
  ClipboardList,
  FolderKanban,
  MessageSquareText,
  Store,
  Users,
} from "lucide-react";
import { projects } from "@/data/projects";
import { directoryUsers } from "@/data/users";
import { federalTenders } from "@/data/federalTenders";
import { useSession } from "@/components/SessionProvider";
import { getReportsForProject } from "@/data/projectFeedback";

const cards = [
  {
    href: "/admin/projects",
    label: "Projects",
    icon: FolderKanban,
    getValue: () => projects.length,
    hint: "Infrastructure tracked nationwide",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    getValue: () => directoryUsers.length,
    hint: "Individuals, businesses, admins",
  },
  {
    href: "/admin/tenders",
    label: "Open tenders",
    icon: ClipboardList,
    getValue: () => federalTenders.filter((t) => t.status === "open").length,
    hint: "Procurement windows live",
  },
  {
    href: "/admin/marketplace",
    label: "Marketplace",
    icon: Store,
    getValue: (listings: { status: string }[]) =>
      listings.filter((l) => l.status === "live").length,
    hint: "Live vendor listings",
  },
];

export default function AdminOverviewPage() {
  const { listings } = useSession();

  const statusCounts = {
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    planned: projects.filter((p) => p.status === "Planned").length,
    stalled: projects.filter((p) => p.status === "Stalled").length,
  };

  const pendingUsers = directoryUsers.filter((u) => u.status === "pending");
  const sampleReports = projects
    .flatMap((p) => getReportsForProject(p.id))
    .slice(0, 4);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-white sm:text-4xl">
          Operations overview
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-white/55">
          Manage projects, accounts, tenders, and marketplace content. Data
          currently loads from seeded app files — wire Supabase next for live
          CRUD.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const value =
            card.label === "Marketplace"
              ? card.getValue(listings)
              : (card.getValue as () => number)();
          return (
            <Link
              key={card.href}
              href={card.href}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-400/30 hover:bg-emerald-500/5"
            >
              <Icon className="h-5 w-5 text-emerald-400" />
              <p className="mt-4 font-serif text-3xl text-white">{value}</p>
              <p className="mt-1 text-sm font-semibold text-white/80">
                {card.label}
              </p>
              <p className="mt-0.5 text-xs text-white/40">{card.hint}</p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-lg font-semibold text-white">Project pipeline</h2>
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
                <span className="flex items-center gap-2 text-white/70">
                  <span className={`h-2 w-2 rounded-full ${color}`} />
                  {label}
                </span>
                <span className="font-semibold text-white">{count}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/admin/projects"
            className="mt-5 inline-flex text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Manage all projects →
          </Link>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">
              Pending verifications
            </h2>
            <Building2 className="h-4 w-4 text-white/35" />
          </div>
          {pendingUsers.length === 0 ? (
            <p className="mt-4 text-sm text-white/45">No pending accounts.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {pendingUsers.map((u) => (
                <li
                  key={u.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-white/8 px-3 py-2.5"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{u.name}</p>
                    <p className="text-xs text-white/45">
                      {u.role} · {u.state}
                    </p>
                  </div>
                  <span className="rounded-full bg-amber-400/15 px-2 py-0.5 text-[11px] font-semibold text-amber-200">
                    pending
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            href="/admin/users"
            className="mt-5 inline-flex text-sm font-semibold text-emerald-300 hover:text-emerald-200"
          >
            Review users →
          </Link>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-white">
            Recent field reports
          </h2>
          <MessageSquareText className="h-4 w-4 text-white/35" />
        </div>
        <div className="mt-4 divide-y divide-white/8">
          {sampleReports.map((r) => (
            <article key={r.id} className="py-3">
              <p className="text-sm font-semibold text-white">{r.title}</p>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/50">
                {r.body}
              </p>
              <p className="mt-2 text-[11px] text-white/35">
                {r.projectId} · {r.location} · {r.author}
              </p>
            </article>
          ))}
        </div>
        <Link
          href="/admin/feedback"
          className="mt-3 inline-flex text-sm font-semibold text-emerald-300 hover:text-emerald-200"
        >
          Open feedback & reports →
        </Link>
      </section>
    </div>
  );
}
