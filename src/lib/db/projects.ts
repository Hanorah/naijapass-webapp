"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { projects as seedProjects } from "@/data/projects";
import { normalizeDashboardState } from "@/lib/dashboardState";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  rowToProject,
  type LiveProject,
  type ProjectRow,
  type ReviewStatus,
} from "@/lib/db/types";

/** Where the projects on screen came from. */
export type ProjectSource = "loading" | "database" | "seed" | "mixed";

/** Safe column list — avoids hard-failing if a newer column is missing. */
const SELECT_COLUMNS =
  "id, title, category, description, budget_ngn, budget_label, state, lga, status, contractor, completion, reports_count, featured, era, supervising_agency, source_title, source_url, image_url, notes, published, review_status, start_date, expected_completion, submitted_by, created_at, updated_at";

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

function mergeProjects(db: LiveProject[], seed: LiveProject[]) {
  const seen = new Set(db.map((project) => project.id));
  return [...db, ...seed.filter((project) => !seen.has(project.id))];
}

function isVisiblePublished(project: LiveProject) {
  const status = project.reviewStatus || "published";
  return project.published !== false && status === "published";
}

function mapRows(data: ProjectRow[] | null): LiveProject[] {
  return (data ?? []).map((row) => {
    const project = rowToProject({
      ...row,
      // Older seeds / partial imports often leave review_status null.
      review_status: (row.review_status || "published") as ReviewStatus,
      published: row.published ?? true,
    });
    return {
      ...project,
      state: normalizeDashboardState(project.state || ""),
    };
  });
}

async function fetchProjects({ state, includeDrafts }: Options): Promise<Result> {
  const supabase = createClient();

  // Do not filter review_status in SQL — null/missing values are common after
  // seed and would hide every row. Visibility is applied client-side instead.
  let query = supabase
    .from("projects")
    .select(SELECT_COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(5000);

  const { data, error } = await query;

  if (error) {
    // Retry with a minimal column set if the schema is behind the app.
    const retry = await supabase
      .from("projects")
      .select(
        "id, title, category, description, budget_ngn, budget_label, state, lga, status, contractor, completion, reports_count, featured, era, supervising_agency, source_title, published, created_at, updated_at",
      )
      .order("updated_at", { ascending: false })
      .limit(5000);

    if (retry.error) {
      return { rows: [], error: retry.error.message || error.message };
    }

    let rows = mapRows(
      (retry.data ?? []).map((row) => ({
        ...(row as ProjectRow),
        review_status: "published" as ReviewStatus,
        source_url: null,
        image_url: null,
        notes: null,
        start_date: null,
        expected_completion: null,
        submitted_by: null,
      })),
    );

    if (!includeDrafts) rows = rows.filter(isVisiblePublished);
    if (state) rows = rows.filter((project) => sameState(project.state, state));
    return { rows, error: null };
  }

  let rows = mapRows(data as ProjectRow[] | null);
  if (!includeDrafts) rows = rows.filter(isVisiblePublished);
  if (state) rows = rows.filter((project) => sameState(project.state, state));
  return { rows, error: null };
}

/**
 * Reads projects from Supabase and merges catalogue rows for the same scope
 * so a portal never looks empty when only part of the DB is populated.
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
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED") return;
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
        .select(SELECT_COLUMNS)
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
