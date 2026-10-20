"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { type StateContentRow, type StateContentType } from "@/lib/db/types";

type Options = {
  state?: string;
  type?: StateContentType;
  /** The government portal passes true so authors can see their own drafts. */
  includeUnpublished?: boolean;
};

async function fetchStateContent({ state, type, includeUnpublished }: Options) {
  try {
    const params = new URLSearchParams();
    if (state) params.set("state", state);
    if (type) params.set("type", type);
    const qs = params.toString();
    const data = await apiFetch<{ items?: StateContentRow[]; content?: StateContentRow[] }>(
      `/api/state-content${qs ? `?${qs}` : ""}`,
      { anonymous: !includeUnpublished },
    );
    let items = data.items ?? data.content ?? [];
    if (type) items = items.filter((item) => item.type === type);
    if (!includeUnpublished) items = items.filter((item) => item.published !== false);
    return { items, error: null as string | null };
  } catch (err) {
    return {
      items: [] as StateContentRow[],
      error: err instanceof Error ? err.message : "Could not load state content.",
    };
  }
}

/**
 * Notices, laws, MDA contacts and emergency numbers published by a state.
 * Returns an empty list rather than failing when nothing is published or the
 * API is not configured — callers fall back to bundled state profiles.
 */
export function useStateContent(options: Options = {}) {
  const { state, type, includeUnpublished = false } = options;
  const [items, setItems] = useState<StateContentRow[]>([]);
  const [loading, setLoading] = useState(isApiConfigured());
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!isApiConfigured()) return;
    const result = await fetchStateContent({ state, type, includeUnpublished });
    setItems(result.items);
    setError(result.error);
    setLoading(false);
  }, [state, type, includeUnpublished]);

  useEffect(() => {
    if (!isApiConfigured()) return;

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
