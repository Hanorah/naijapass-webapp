"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Star } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import {
  EmptyState,
  OfflineNotice,
  PageHeader,
  Panel,
  Pill,
  StatCard,
} from "@/components/govt/ui";
import { useProjects } from "@/lib/db/projects";
import { type FeedbackRow } from "@/lib/db/types";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { projectDetailPath } from "@/data/projects";

/** Keeps the number of per-project requests bounded. */
const MAX_PROJECTS_QUERIED = 30;

async function fetchFeedback(projectIds: string[]): Promise<FeedbackRow[]> {
  if (!isApiConfigured() || !projectIds.length) return [];

  const results = await Promise.allSettled(
    projectIds.slice(0, MAX_PROJECTS_QUERIED).map((id) =>
      apiFetch<{ feedback?: FeedbackRow[] }>(
        `/api/projects/${encodeURIComponent(id)}/feedback`,
        { anonymous: true },
      ),
    ),
  );

  return results
    .flatMap((result) => (result.status === "fulfilled" ? (result.value.feedback ?? []) : []))
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 300);
}
export default function GovtFeedbackBoard() {
  const { user, live } = useSession();
  const state = user?.govtState ?? user?.state ?? "";

  const { projects } = useProjects({ state, includeDrafts: true });
  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);

  const projectTitles = useMemo(() => {
    const map = new Map<string, string>();
    for (const project of projects) map.set(project.id, project.title);
    return map;
  }, [projects]);

  const projectIds = useMemo(() => projects.map((p) => p.id), [projects]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const next = await fetchFeedback(projectIds);
      if (!active) return;
      setRows(next);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [projectIds]);

  const stats = useMemo(() => {
    if (!rows.length) return { count: 0, average: 0, negative: 0 };
    const total = rows.reduce((sum, row) => sum + row.rating, 0);
    return {
      count: rows.length,
      average: Math.round((total / rows.length) * 10) / 10,
      negative: rows.filter((row) => row.rating <= 2).length,
    };
  }, [rows]);

  const onToggleVisibility = async (row: FeedbackRow) => {
    const visibility = row.visibility === "public" ? "hidden" : "public";
    try {
      await apiFetch(`/api/projects/feedback/${encodeURIComponent(row.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ visibility }),
      });
      setRows((curr) =>
        curr.map((item) => (item.id === row.id ? { ...item, visibility } : item)),
      );
      toast.success(visibility === "hidden" ? "Feedback hidden." : "Feedback restored.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update feedback.");
    }
  };
  return (
    <div className="space-y-6">
      {!live ? <OfflineNotice /> : null}

      <PageHeader
        title="Citizen Feedback"
        description={`What people in ${state || "your state"} are saying about the projects you publish. You can hide abusive posts, but you cannot delete criticism.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total responses" value={stats.count} />
        <StatCard
          label="Average rating"
          value={stats.average ? `${stats.average} / 5` : "—"}
        />
        <StatCard
          label="Needs attention"
          value={stats.negative}
          sub="Rated 1 or 2 out of 5"
        />
      </div>

      {loading ? (
        <p className="text-sm text-slate">Loading feedback…</p>
      ) : rows.length ? (
        <ul className="space-y-2">
          {rows.map((row) => (
            <li
              key={row.id}
              className="rounded-2xl border border-navy/8 bg-white px-4 py-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Rating value={row.rating} />
                    {row.visibility === "hidden" ? <Pill tone="amber">Hidden</Pill> : null}
                    {row.topic ? (
                      <span className="text-xs text-slate">{row.topic}</span>
                    ) : null}
                  </div>
                  <Link
                    href={projectDetailPath(row.project_id)}
                    target="_blank"
                    className="mt-2 block truncate text-sm font-semibold text-forest hover:text-forest-hover"
                  >
                    {projectTitles.get(row.project_id) ?? row.project_id}
                  </Link>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate">{row.body}</p>
                  <p className="mt-2 text-xs text-slate/60">
                    {row.user_name ?? "Verified citizen"} ·{" "}
                    {new Date(row.created_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => void onToggleVisibility(row)}
                  title={row.visibility === "public" ? "Hide" : "Restore"}
                  className="rounded-lg p-2 text-slate hover:bg-navy/[0.04] hover:text-navy"
                >
                  {row.visibility === "public" ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Panel>
          <EmptyState
            title="No feedback yet"
            body="Once citizens rate your published projects, their responses land here so you can see which projects are working and which are not."
          />
        </Panel>
      )}
    </div>
  );
}

function Rating({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((step) => (
        <Star
          key={step}
          className={`h-3.5 w-3.5 ${
            step <= value ? "fill-amber-400 text-amber-400" : "text-navy/15"
          }`}
        />
      ))}
    </span>
  );
}
