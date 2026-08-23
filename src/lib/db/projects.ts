"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { projects as seedProjects } from "@/data/projects";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  PROJECT_COLUMNS,
  rowToProject,
  type LiveProject,
  type ProjectRow,
} from "@/lib/db/types";

/** Where the projects on screen came from. Drives the "live" badge in the UI. */
export type ProjectSource = "loading" | "database" | "seed";

const seedAsLive: LiveProject[] = seedProjects.map((project) => ({
  ...project,
  published: true,
  reviewStatus: "published",
}));

type Options = {
  /** Limit to one state. The government portal passes its own state here. */
  state?: string;
  /** Include drafts. RLS still restricts these to rows the user may see. */
  includeDrafts?: boolean;
};

type Result = { rows: LiveProject[] | null; error: string | null };

async function fetchProjects({ state, includeDrafts }: Options): Promise<Result> {
  const supabase = createClient();
  let query = supabase
    .from("projects")
    .select(PROJECT_COLUMNS)
    .order("updated_at", { ascending: false });

  if (state) query = query.eq("state", state);
  if (!includeDrafts) query = query.eq("review_status", "published");

  const { data, error } = await query;
  if (error) return { rows: null, error: error.message };

  const rows = (data ?? []) as ProjectRow[];
  // No rows means schema.sql ran but seed.sql did not — fall back to the seed
  // rather than showing an empty portal.
  return { rows: rows.length ? rows.map(rowToProject) : null, error: null };
}

/**
 * Reads projects from Supabase, falling back to the bundled seed so every
 * public page still renders before the database is populated.
 */
export function useProjects(options: Options = {}) {
  const { state, includeDrafts = false } = options;
  const [rows, setRows] = useState<LiveProject[] | null>(null);
  const [settled, setSettled] = useState(!isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const fallback = useMemo(
    () => (state ? seedAsLive.filter((project) => project.state === state) : seedAsLive),
    [state],
  );

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const result = await fetchProjects({ state, includeDrafts });
    setRows(result.rows);
    setError(result.error);
    setSettled(true);
  }, [state, includeDrafts]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;

    void (async () => {
      const result = await fetchProjects({ state, includeDrafts });
      if (!active) return;
      setRows(result.rows);
      setError(result.error);
      setSettled(true);
    })();

    return () => {
      active = false;
    };
  }, [state, includeDrafts]);

  const source: ProjectSource = rows ? "database" : settled ? "seed" : "loading";

  return { projects: rows ?? fallback, source, error, reload: load };
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
      setRow(data ? rowToProject(data as ProjectRow) : null);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return { project: row ?? fallback, loading };
}
