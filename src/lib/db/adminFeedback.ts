"use client";

import { useCallback, useEffect, useState } from "react";
import { projects } from "@/data/projects";
import { getReportsForProject } from "@/data/projectFeedback";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { type FeedbackRow } from "@/lib/db/types";

export type AdminFeedbackItem = FeedbackRow & {
  kind: "feedback" | "field_report";
  title?: string;
  location?: string;
  author?: string;
  status?: string;
};

/** Bundled field inspection reports (not stored in the API). */
function fieldReports(): AdminFeedbackItem[] {
  return projects.flatMap((p) =>
    getReportsForProject(p.id).map(
      (r): AdminFeedbackItem => ({
        id: r.id,
        project_id: r.projectId,
        user_id: null,
        user_name: r.author,
        user_email: null,
        rating: 0,
        topic: r.title,
        body: r.body,
        visibility: "public",
        created_at: r.time,
        kind: "field_report",
        title: r.title,
        location: r.location,
        author: r.author,
        status: r.status,
      }),
    ),
  );
}

/** PATCH /api/admin/feedback/:id */
export async function setAdminFeedbackVisibility(
  id: string,
  visibility: "public" | "hidden",
) {
  await apiFetch(`/api/admin/feedback/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ visibility }),
  });
}

export function useAdminFeedback() {
  const [items, setItems] = useState<AdminFeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const reports = fieldReports();
    if (!isApiConfigured()) {
      setItems(reports);
      setLoading(false);
      return;
    }
    try {
      const body = await apiFetch<
        FeedbackRow[] | { feedback?: FeedbackRow[]; items?: FeedbackRow[] }
      >("/api/admin/feedback");
      const rows = Array.isArray(body) ? body : (body.feedback ?? body.items ?? []);
      const citizen = rows.map((row): AdminFeedbackItem => ({ ...row, kind: "feedback" }));
      setItems([...citizen, ...reports]);
      setError(null);
    } catch (err) {
      setItems(reports);
      setError(err instanceof Error ? err.message : "Could not load feedback.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const applyVisibility = useCallback((id: string, visibility: "public" | "hidden") => {
    setItems((curr) =>
      curr.map((item) =>
        item.kind === "feedback" && item.id === id ? { ...item, visibility } : item,
      ),
    );
  }, []);

  return { items, loading, error, reload: load, applyVisibility };
}
