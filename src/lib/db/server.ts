import { getProjectById, projects as seedProjects } from "@/data/projects";
import { normalizeDashboardState } from "@/lib/dashboardState";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  PROJECT_COLUMNS,
  STATE_CONTENT_COLUMNS,
  rowToProject,
  type LiveProject,
  type ProjectRow,
  type ReviewStatus,
  type StateContentRow,
} from "@/lib/db/types";

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
 * Server-side project lookup. Prefers the database so projects published by a
 * state government after the last deploy resolve, and falls back to the
 * bundled seed so the page still renders without a configured project.
 */
export async function fetchProject(id: string): Promise<LiveProject | null> {
  if (!isSupabaseConfigured()) return seedAsLive(id);

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("id", id)
      .maybeSingle();

    return data ? mapRow(data as ProjectRow) : seedAsLive(id);
  } catch {
    return seedAsLive(id);
  }
}

/** Published projects for a state, used by server-rendered state pages. */
export async function fetchProjectsByState(state: string): Promise<LiveProject[]> {
  const canonical = normalizeDashboardState(state);
  const fallback = seedForState(canonical);

  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("review_status", "published")
      .eq("published", true)
      .order("updated_at", { ascending: false })
      .limit(5000);

    const rows = ((data ?? []) as ProjectRow[])
      .map(mapRow)
      .filter((project) => sameState(project.state, canonical));

    if (!rows.length) return fallback;
    return mergeById(rows, fallback);
  } catch {
    return fallback;
  }
}

/** Published State Hub content for a state. Empty when nothing is published. */
export async function fetchStateContent(state: string): Promise<StateContentRow[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("state_content")
      .select(STATE_CONTENT_COLUMNS)
      .eq("state", state)
      .eq("published", true)
      .order("created_at", { ascending: false });

    return (data ?? []) as StateContentRow[];
  } catch {
    return [];
  }
}
