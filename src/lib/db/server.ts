import { getProjectById, projects as seedProjects } from "@/data/projects";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  PROJECT_COLUMNS,
  STATE_CONTENT_COLUMNS,
  rowToProject,
  type LiveProject,
  type ProjectRow,
  type StateContentRow,
} from "@/lib/db/types";

function seedAsLive(id: string): LiveProject | null {
  const seed = getProjectById(id);
  return seed ? { ...seed, published: true, reviewStatus: "published" } : null;
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

    return data ? rowToProject(data as ProjectRow) : seedAsLive(id);
  } catch {
    return seedAsLive(id);
  }
}

/** Published projects for a state, used by server-rendered state pages. */
export async function fetchProjectsByState(state: string): Promise<LiveProject[]> {
  const fallback = seedProjects
    .filter((project) => project.state === state)
    .map((project) => ({
      ...project,
      published: true,
      reviewStatus: "published" as const,
    }));

  if (!isSupabaseConfigured()) return fallback;

  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .eq("state", state)
      .eq("review_status", "published")
      .order("updated_at", { ascending: false });

    const rows = (data ?? []) as ProjectRow[];
    return rows.length ? rows.map(rowToProject) : fallback;
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
