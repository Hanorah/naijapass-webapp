"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  ArrowUpRight,
  ClipboardList,
  FolderKanban,
  Megaphone,
  MessageSquareText,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { EmptyState, Panel, Pill, StatCard } from "@/components/govt/ui";
import { useProjects } from "@/lib/db/projects";
import { useStateContent } from "@/lib/db/stateContent";
import { formatBudgetLabel } from "@/lib/db/types";
import { getStateProfile } from "@/data/stateProfiles";

export default function GovtOverview() {
  const { user } = useSession();
  const state = user?.govtState ?? user?.state ?? "";

  const { projects } = useProjects({ state, includeDrafts: true });
  const { items: content } = useStateContent({ state, includeUnpublished: true });
  const profile = getStateProfile(state);

  const stats = useMemo(() => {
    const published = projects.filter(
      (p) => !p.reviewStatus || p.reviewStatus === "published",
    );
    const budget = published.reduce((sum, p) => sum + (p.budgetNgn || 0), 0);
    return {
      total: projects.length,
      drafts: projects.filter((p) => p.reviewStatus === "draft").length,
      ongoing: published.filter((p) => p.status === "In Progress").length,
      completed: published.filter((p) => p.status === "Completed").length,
      stalled: published.filter((p) => p.status === "Stalled").length,
      budget,
      tendersHint: content.filter((c) => c.type === "announcement" || c.type === "notice").length,
    };
  }, [projects, content]);

  const recent = projects.slice(0, 8);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-wide text-forest">
          {profile?.zone ? `${profile.zone} · ` : ""}
          {profile?.capital ? `Capital: ${profile.capital}` : "State portal"}
          {profile?.governor ? ` · Governor: ${profile.governor}` : ""}
        </p>
        <h1 className="mt-1.5 font-serif text-4xl tracking-[-0.03em] text-navy">
          {state
            ? state === "FCT"
              ? "Federal Capital Territory"
              : `${state} State`
            : "State portal"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate">
          Publish projects, tenders, and State Hub updates for {state || "your state"}.
          Citizens see them on the public map, State Hub, and procurement search.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Projects"
          value={stats.total}
          sub={stats.drafts ? `${stats.drafts} unpublished draft(s)` : "All published"}
        />
        <StatCard label="In progress" value={stats.ongoing} sub="Currently under execution" />
        <StatCard label="Completed" value={stats.completed} sub="Delivered to citizens" />
        <StatCard
          label="Published budget"
          value={formatBudgetLabel(stats.budget)}
          sub={stats.stalled ? `${stats.stalled} stalled project(s)` : "No stalled projects"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <Panel>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-base font-bold text-navy">
              Recently updated projects
            </h2>
            <Link
              href="/govt/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-hover"
            >
              Manage all
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.length ? (
            <ul className="mt-4 space-y-2">
              {recent.map((project) => (
                <li
                  key={project.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-navy/8 bg-navy/[0.02] px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-navy">
                      {project.title}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-slate">
                      {project.lga || state} · {project.budgetLabel} ·{" "}
                      {project.contractor || "Contractor TBA"}
                      {project.supervisingAgency ? ` · ${project.supervisingAgency}` : ""}
                    </p>
                  </div>
                  <Pill
                    tone={
                      project.reviewStatus === "draft"
                        ? "amber"
                        : project.status === "Completed"
                          ? "green"
                          : project.status === "Stalled"
                            ? "red"
                            : "blue"
                    }
                  >
                    {project.reviewStatus === "draft" ? "Draft" : project.status}
                  </Pill>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4">
              <EmptyState
                title="No projects yet"
                body={`Publish your first ${state} project so citizens can track it.`}
              />
            </div>
          )}

        </Panel>

        <div className="space-y-4">
          <Panel>
            <h2 className="font-display text-base font-bold text-navy">
              Publish something
            </h2>
            <div className="mt-4 space-y-2">
              <QuickLink
                href="/govt/projects"
                icon={FolderKanban}
                label="Add a project"
                body="Roads, hospitals, schools, water, power."
              />
              <QuickLink
                href="/govt/tenders"
                icon={ClipboardList}
                label="Open a tender"
                body="Invite verified businesses to bid."
              />
              <QuickLink
                href="/govt/updates"
                icon={Megaphone}
                label="Post a notice or law"
                body="Announcements, orders, MDA and emergency contacts."
              />
              <QuickLink
                href="/govt/feedback"
                icon={MessageSquareText}
                label="Read citizen feedback"
                body="What people are saying about your projects."
              />
            </div>
          </Panel>

          <Panel>
            <h2 className="font-display text-base font-bold text-navy">
              State Hub content
            </h2>
            <p className="mt-1.5 text-sm text-slate">
              {content.length
                ? `${content.length} item(s) for ${state} (${stats.tendersHint} notices/announcements).`
                : `Nothing published for ${state} yet — citizens currently see the bundled state profile.`}
            </p>
            {profile ? (
              <dl className="mt-3 grid gap-2 text-xs text-slate sm:grid-cols-2">
                <div>
                  <dt className="font-semibold text-navy/70">Population</dt>
                  <dd>{profile.population ?? "—"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-navy/70">LGAs</dt>
                  <dd>{profile.lgas ?? "—"}</dd>
                </div>
              </dl>
            ) : null}
            <Link
              href="/govt/updates"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-forest hover:text-forest-hover"
            >
              Manage State Hub
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </Panel>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
  body,
}: {
  href: string;
  icon: typeof FolderKanban;
  label: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-3 rounded-xl border border-navy/8 bg-navy/[0.02] px-3.5 py-3 transition hover:border-forest/30 hover:bg-forest/5"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-forest/10 text-forest">
        <Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-navy">{label}</span>
        <span className="mt-0.5 block text-xs text-slate">{body}</span>
      </span>
    </Link>
  );
}
