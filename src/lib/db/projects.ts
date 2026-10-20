"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { projects as seedProjects } from "@/data/projects";
import { normalizeDashboardState } from "@/lib/dashboardState";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { isLiveBackend } from "@/lib/backend";
import {
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
  if (isApiConfigured()) {
    try {
      const qs = state ? `?state=${encodeURIComponent(state)}` : "";
      const data = await apiFetch<{ projects?: ProjectRow[] }>(`/api/projects${qs}`, {
        anonymous: !includeDrafts,
      });
      let rows = mapRows(data.projects ?? null);
      if (!includeDrafts) rows = rows.filter(isVisiblePublished);
      if (state) rows = rows.filter((project) => sameState(project.state, state));
      return { rows, error: null };
    } catch (err) {
      return {
        rows: [],
        error: err instanceof Error ? err.message : "Could not load projects.",
      };
    }
  }

  return { rows: [], error: "API is not configured." };
}

/**
 * Reads projects from the Express API and merges catalogue rows for the same scope
 * so a portal never looks empty when only part of the DB is populated.
 */
export function useProjects(options: Options = {}) {
  const { state, includeDrafts = false } = options;
  const normalizedState = state?.trim()
    ? normalizeDashboardState(state)
    : undefined;
  const [dbRows, setDbRows] = useState<LiveProject[] | null>(null);
  const [settled, setSettled] = useState(!isLiveBackend());
  const [error, setError] = useState<string | null>(null);

  const fallback = useMemo(
    () => seedForState(normalizedState),
    [normalizedState],
  );

  const load = useCallback(async () => {
    if (!isLiveBackend()) return;
    const result = await fetchProjects({
      state: normalizedState,
      includeDrafts,
    });
    setDbRows(result.rows);
    setError(result.error);
    setSettled(true);
  }, [normalizedState, includeDrafts]);

  useEffect(() => {
    if (!isLiveBackend()) return;

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

    return () => {
      active = false;
    };
  }, [normalizedState, includeDrafts]);

  const projects = useMemo(() => {
    if (!isLiveBackend()) return fallback;
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
  const [loading, setLoading] = useState(Boolean(id) && isLiveBackend());

  const fallback = useMemo(
    () => (id ? (seedAsLive.find((project) => project.id === id) ?? null) : null),
    [id],
  );

  useEffect(() => {
    if (!id || !isLiveBackend()) return;

    let active = true;

    void (async () => {
      if (isApiConfigured()) {
        try {
          const data = await apiFetch<{ project?: ProjectRow }>(`/api/projects/${id}`, {
            anonymous: true,
          });
          if (!active) return;
          setRow(data.project ? mapRows([data.project])[0] ?? null : null);
        } catch {
          if (!active) return;
          setRow(null);
        } finally {
          if (active) setLoading(false);
        }
        return;
      }

      if (active) setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [id]);

  return { project: row ?? fallback, loading };
}
