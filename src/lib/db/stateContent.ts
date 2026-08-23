"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  STATE_CONTENT_COLUMNS,
  type StateContentRow,
  type StateContentType,
} from "@/lib/db/types";

type Options = {
  state?: string;
  type?: StateContentType;
  /** The government portal passes true so authors can see their own drafts. */
  includeUnpublished?: boolean;
};

async function fetchStateContent({ state, type, includeUnpublished }: Options) {
  const supabase = createClient();
  let query = supabase
    .from("state_content")
    .select(STATE_CONTENT_COLUMNS)
    .order("created_at", { ascending: false });

  if (state) query = query.eq("state", state);
  if (type) query = query.eq("type", type);
  if (!includeUnpublished) query = query.eq("published", true);

  const { data, error } = await query;
  return {
    items: error ? [] : ((data ?? []) as StateContentRow[]),
    error: error?.message ?? null,
  };
}

/**
 * Notices, laws, MDA contacts and emergency numbers published by a state.
 * Returns an empty list rather than failing when nothing is published or the
 * project is not configured — callers fall back to bundled state profiles.
 */
export function useStateContent(options: Options = {}) {
  const { state, type, includeUnpublished = false } = options;
  const [items, setItems] = useState<StateContentRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const result = await fetchStateContent({ state, type, includeUnpublished });
    setItems(result.items);
    setError(result.error);
    setLoading(false);
  }, [state, type, includeUnpublished]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    let active = true;

    void (async () => {
      const result = await fetchStateContent({ state, type, includeUnpublished });
      if (!active) return;
      setItems(result.items);
      setError(result.error);
      setLoading(false);
    })();

    return () => {
      active = false;
    };
  }, [state, type, includeUnpublished]);

  return { items, loading, error, reload };
}
