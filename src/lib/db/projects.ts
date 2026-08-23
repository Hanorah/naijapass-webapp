"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { projects as seedProjects } from "@/data/projects";
import { normalizeDashboardState } from "@/lib/dashboardState";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  PROJECT_COLUMNS,
  rowToProject,
  type LiveProject,
  type ProjectRow,
  type ReviewStatus,
} from "@/lib/db/types";

/** Where the projects on screen came from. */
export type ProjectSource = "loading" | "database" | "seed" | "mixed";

const seedAsLive: LiveProject[] = seedProjects.map((project) => ({
  ...project,
  published: true,
  reviewStatus: "published" as const,
}));

type Options = {
  /** Limit to one state. The government portal passes its own state here. */
  state?: string;
  /** Include drafts. RLS still restricts these to rows the user may see. */
  includeDrafts?: boolean;
};

type Result = { rows: LiveProject[]; error: string | null };

function sameState(a: string, b: string) {
  return normalizeDashboardState(a) === normalizeDashboardState(b);
}

function seedForState(state?: string) {
  if (!state) return seedAsLive;
  return seedAsLive.filter((project) => sameState(project.state, state));
}

/** Prefer database rows; keep seed rows whose ids are not already in the DB. */
function mergeProjects(db: LiveProject[], seed: LiveProject[]) {
  const seen = new Set(db.map((project) => project.id));
  return [...db, ...seed.filter((project) => !seen.has(project.id))];
}

function mapRows(data: ProjectRow[] | null): LiveProject[] {
  return (data ?? []).map((row) => {
    const project = rowToProject(row);
    const reviewStatus = (row.review_status || "published") as ReviewStatus;
    return {
      ...project,
      reviewStatus,
      published: row.published ?? reviewStatus === "published",
      state: normalizeDashboardState(project.state),
    };
  });
}

async function fetchProjects({ state, includeDrafts }: Options): Promise<Result> {
  const supabase = createClient();
  let query = supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(5000);

  if (!includeDrafts) {
    query = query.eq("review_status", "published").eq("published", true);
  }

  // Prefer exact match on the canonical state name; fall back to a broad
  // fetch + client filter so older rows with odd casing still appear.
  if (state) query = query.eq("state", state);

  const { data, error } = await query;
  if (error) return { rows: [], error: error.message };

  let rows = mapRows(data as ProjectRow[] | null);

  // If the exact eq matched nothing (legacy casing), pull published rows and filter.
  if (state && rows.length === 0) {
    let retry = supabase
      .from("projects")
      .select(PROJECT_COLUMNS)
      .order("updated_at", { ascending: false })
      .limit(5000);
    if (!includeDrafts) {
      retry = retry.eq("review_status", "published").eq("published", true);
    }
    const second = await retry;
    if (!second.error) {
      rows = mapRows(second.data as ProjectRow[] | null).filter((project) =>
        sameState(project.state, state),
      );
    }
  } else if (state) {
    rows = rows.filter((project) => sameState(project.state, state));
  }

  return { rows, error: null };
}

/**
 * Reads projects from Supabase and always merges in catalogue rows for the
 * same state so the portal never looks empty when seed.sql has not run yet
 * (or only partially imported).
 */
export function useProjects(options: Options = {}) {
  const { state, includeDrafts = false } = options;
  const normalizedState = state?.trim()
    ? normalizeDashboardState(state)
    : undefined;
  const [dbRows, setDbRows] = useState<LiveProject[] | null>(null);
  const [settled, setSettled] = useState(!isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const fallback = useMemo(
    () => seedForState(normalizedState),
    [normalizedState],
  );

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const result = await fetchProjects({
      state: normalizedState,
      includeDrafts,
    });
    setDbRows(result.rows);
    setError(result.error);
    setSettled(true);
  }, [normalizedState, includeDrafts]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;

    void (async () => {
      const result = await fetchProjects({
        state: normalizedState,
        includeDrafts,
      });
      if (!active) return;
      setDbRows(result.rows);
      setError(result.error);
      setSettled(true);
    })();

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void (async () => {
        const result = await fetchProjects({
          state: normalizedState,
          includeDrafts,
        });
        if (!active) return;
        setDbRows(result.rows);
        setError(result.error);
        setSettled(true);
      })();
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [normalizedState, includeDrafts]);

  const projects = useMemo(() => {
    if (!isSupabaseConfigured()) return fallback;
    if (dbRows === null) return fallback;
    return mergeProjects(dbRows, fallback);
  }, [dbRows, fallback]);

  const source: ProjectSource = !settled
    ? "loading"
    : !dbRows?.length
      ? "seed"
      : dbRows.length < projects.length
        ? "mixed"
        : "database";

  return { projects, source, error, reload: load };
}

/** Single project by id, with the same seed fallback. */
export function useProject(id: string | undefined) {
  const [row, setRow] = useState<LiveProject | null>(null);
  const [loading, setLoading] = useState(Boolean(id) && isSupabaseConfigured());

  const fallback = useMemo(
    () => (id ? (seedAsLive.find((project) => project.id === id) ?? null) : null),
    [id],
  );

  useEffect(() => {
    if (!id || !isSupabaseConfigured()) return;

    let active = true;

    void (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("projects")
        .select(PROJECT_COLUMNS)
        .eq("id", id)
        .maybeSingle();

      if (!active) return;
      setRow(data ? mapRows([data as ProjectRow])[0] ?? null : null);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return { project: row ?? fallback, loading };
}
