import { getProjectById, projects as seedProjects } from "@/data/projects";
import { normalizeDashboardState } from "@/lib/dashboardState";
import {
  rowToProject,
  type LiveProject,
  type ProjectRow,
  type ReviewStatus,
  type StateContentRow,
} from "@/lib/db/types";

/** Express base URL for server-side fetches (API_URL wins over the public one). */
function serverApiUrl(): string {
  return (process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");
}

async function serverFetch<T>(path: string): Promise<T | null> {
  const base = serverApiUrl();
  if (!base) return null;
  const res = await fetch(`${base}${path}`, { cache: "no-store" });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

function seedAsLive(id: string): LiveProject | null {
  const seed = getProjectById(id);
  return seed ? { ...seed, published: true, reviewStatus: "published" } : null;
}

function sameState(a: string, b: string) {
  return normalizeDashboardState(a) === normalizeDashboardState(b);
}

function seedForState(state: string): LiveProject[] {
  return seedProjects
    .filter((project) => sameState(project.state, state))
    .map((project) => ({
      ...project,
      published: true,
      reviewStatus: "published" as const,
    }));
}

function mergeById(db: LiveProject[], seed: LiveProject[]) {
  const seen = new Set(db.map((project) => project.id));
  return [...db, ...seed.filter((project) => !seen.has(project.id))];
}

function mapRow(row: ProjectRow): LiveProject {
  const project = rowToProject(row);
  const reviewStatus = (row.review_status || "published") as ReviewStatus;
  return {
    ...project,
    reviewStatus,
    published: row.published ?? reviewStatus === "published",
    state: normalizeDashboardState(project.state),
  };
}

/**
 * Server-side project lookup. Prefers the Express API so projects published by a
 * state government after the last deploy resolve, and falls back to the
 * bundled seed so the page still renders without a configured API.
 */
export async function fetchProject(id: string): Promise<LiveProject | null> {
  if (!serverApiUrl()) return seedAsLive(id);

  try {
    const data = await serverFetch<{ project?: ProjectRow }>(
      `/api/projects/${encodeURIComponent(id)}`,
    );
    return data?.project ? mapRow(data.project) : seedAsLive(id);
  } catch {
    return seedAsLive(id);
  }
}

/** Published projects for a state, used by server-rendered state pages. */
export async function fetchProjectsByState(state: string): Promise<LiveProject[]> {
  const canonical = normalizeDashboardState(state);
  const fallback = seedForState(canonical);

  if (!serverApiUrl()) return fallback;

  try {
    const data = await serverFetch<{ projects?: ProjectRow[] }>(
      `/api/projects?state=${encodeURIComponent(canonical)}`,
    );

    const rows = (data?.projects ?? [])
      .map(mapRow)
      .filter((project) => {
        if (!sameState(project.state, canonical)) return false;
        const status = project.reviewStatus || "published";
        return project.published !== false && status === "published";
      });

    if (!rows.length) return fallback;
    return mergeById(rows, fallback);
  } catch {
    return fallback;
  }
}

/** Published State Hub content for a state. Empty when nothing is published. */
export async function fetchStateContent(state: string): Promise<StateContentRow[]> {
  if (!serverApiUrl()) return [];

  try {
    const data = await serverFetch<{ items?: StateContentRow[] }>(
      `/api/state-content?state=${encodeURIComponent(state)}`,
    );
    return data?.items ?? [];
  } catch {
    return [];
  }
}
