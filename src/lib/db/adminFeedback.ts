"use client";

import { useCallback, useEffect, useState } from "react";
import { projects } from "@/data/projects";
import { getReportsForProject } from "@/data/projectFeedback";
import {
  FEEDBACK_COLUMNS,
  type FeedbackRow,
} from "@/lib/db/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type AdminFeedbackItem = FeedbackRow & {
  kind: "feedback" | "field_report";
  title?: string;
  location?: string;
  author?: string;
  status?: string;
};

type FieldReportRow = {
  id: string;
  project_id: string;
  title: string;
  body: string;
  location: string | null;
  author: string | null;
  status: string | null;
  verified: boolean | null;
  created_at: string;
};

export function useAdminFeedback() {
  const [items, setItems] = useState<AdminFeedbackItem[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured());

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      const seed = projects.flatMap((p) =>
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
      setItems(seed);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const [feedback, reports] = await Promise.all([
      supabase
        .from("project_feedback")
        .select(FEEDBACK_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("field_reports")
        .select(
          "id, project_id, title, body, location, author, status, verified, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    const feedbackItems: AdminFeedbackItem[] = (
      (feedback.data ?? []) as FeedbackRow[]
    ).map((row) => ({ ...row, kind: "feedback" as const }));

    const reportItems: AdminFeedbackItem[] = (
      (reports.data ?? []) as FieldReportRow[]
    ).map((row) => ({
      id: row.id,
      project_id: row.project_id,
      user_id: null,
      user_name: row.author,
      user_email: null,
      rating: 0,
      topic: row.title,
      body: row.body,
      visibility: row.verified ? ("public" as const) : ("hidden" as const),
      created_at: row.created_at,
      kind: "field_report" as const,
      title: row.title,
      location: row.location ?? undefined,
      author: row.author ?? undefined,
      status: row.status ?? undefined,
    }));

    const merged = [...feedbackItems, ...reportItems].sort((a, b) =>
      b.created_at.localeCompare(a.created_at),
    );

    if (!merged.length) {
      const seed = projects.flatMap((p) =>
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
      setItems(seed);
    } else {
      setItems(merged);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { items, loading, reload: load };
}
