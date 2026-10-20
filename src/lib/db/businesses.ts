"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  businesses as seedBusinesses,
  getBusinessById,
  type Business,
  type DirectoryCategory,
} from "@/data/businesses";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { isLiveBackend } from "@/lib/backend";
import { BUSINESSES_CHANGED_EVENT } from "@/lib/db/businessEvents";
import { normalizeDashboardState } from "@/lib/dashboardState";
import { pexelsImageForKey } from "@/lib/pexelsImages";

export type BusinessSource = "loading" | "database" | "seed" | "mixed";

type BusinessRow = {
  id: string;
  name: string;
  category: string;
  subcategory: string | null;
  state: string;
  lga: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  verified: boolean;
  rating: number;
  review_count: number;
  status: string;
  services: string[] | null;
  image_url: string | null;
  year_founded: string | null;
  employees: string | null;
};

export type LiveBusiness = Business & { listingStatus?: string };

const seedAsLive: LiveBusiness[] = seedBusinesses.map((business) => ({
  ...business,
  listingStatus: "live",
}));

function mergeBusinesses(db: LiveBusiness[], seed: LiveBusiness[]) {
  const seen = new Set(db.map((business) => business.id));
  return [...db, ...seed.filter((business) => !seen.has(business.id))];
}

function rowToBusiness(row: BusinessRow): LiveBusiness {
  return {
    id: row.id,
    name: row.name,
    category: row.category as DirectoryCategory,
    subcategory: row.subcategory ?? "",
    rating: Number(row.rating ?? 0),
    reviews: row.review_count ?? 0,
    address: row.address ?? "",
    lga: row.lga ?? "",
    state: row.state,
    hours: "Hours not listed",
    openNow: true,
    verified: row.verified,
    pos: false,
    tags: row.services ?? [],
    phone: row.phone ?? "",
    image: row.image_url || pexelsImageForKey(row.id),
    description: row.description ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    services: row.services ?? undefined,
    yearFounded: row.year_founded ?? undefined,
    employees: row.employees ?? undefined,
    listingStatus: row.status,
  };
}

async function fetchAllBusinesses(liveOnly = true) {
  if (isApiConfigured()) {
    try {
      const data = await apiFetch<{ businesses?: BusinessRow[] }>("/api/businesses", {
        anonymous: true,
      });
      let rows = (data.businesses ?? []).map(rowToBusiness);
      if (liveOnly) rows = rows.filter((b) => b.listingStatus === "live");
      return { rows, error: null };
    } catch (err) {
      return {
        rows: null as LiveBusiness[] | null,
        error: err instanceof Error ? err.message : "Could not load businesses.",
      };
    }
  }

  return { rows: [] as LiveBusiness[], error: "API is not configured." };
}

async function fetchBusinessById(id: string) {
  if (isApiConfigured()) {
    try {
      const data = await apiFetch<{ business?: BusinessRow }>(`/api/businesses/${id}`, {
        anonymous: true,
      });
      if (!data.business) return { business: null, error: null };
      return { business: rowToBusiness(data.business), error: null };
    } catch (err) {
      return {
        business: null as LiveBusiness | null,
        error: err instanceof Error ? err.message : "Could not load business.",
      };
    }
  }

  return { business: null as LiveBusiness | null, error: "API is not configured." };
}

export function useBusinessProfile(id: string) {
  const fallback = useMemo(
    () => (id ? (getBusinessById(id) as LiveBusiness | undefined) ?? null : null),
    [id],
  );
  const [business, setBusiness] = useState<Business | null>(fallback);
  const [loading, setLoading] = useState(Boolean(id) && isLiveBackend());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setBusiness(null);
      setLoading(false);
      return;
    }
    if (!isLiveBackend()) {
      setBusiness(fallback);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await fetchBusinessById(id);
    setBusiness(result.business ?? fallback);
    setError(result.error);
    setLoading(false);
  }, [id, fallback]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onChanged = () => {
      void load();
    };
    window.addEventListener(BUSINESSES_CHANGED_EVENT, onChanged);
    return () => window.removeEventListener(BUSINESSES_CHANGED_EVENT, onChanged);
  }, [load]);

  return { business: business ?? fallback, loading, error, reload: load };
}

export function useBusinesses(
  state?: string,
  options: { includeAllStatuses?: boolean } = {},
) {
  const includeAllStatuses = options.includeAllStatuses ?? false;
  const [dbRows, setDbRows] = useState<LiveBusiness[] | null>(null);
  const [settled, setSettled] = useState(!isLiveBackend());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isLiveBackend()) return;
    const result = await fetchAllBusinesses(!includeAllStatuses);
    setDbRows(result.rows);
    setError(result.error);
    setSettled(true);
  }, [includeAllStatuses]);

  useEffect(() => {
    if (!isLiveBackend()) return;
    let active = true;
    void (async () => {
      const result = await fetchAllBusinesses(!includeAllStatuses);
      if (!active) return;
      setDbRows(result.rows);
      setError(result.error);
      setSettled(true);
    })();

    const onChanged = () => {
      void load();
    };
    window.addEventListener(BUSINESSES_CHANGED_EVENT, onChanged);

    return () => {
      active = false;
      window.removeEventListener(BUSINESSES_CHANGED_EVENT, onChanged);
    };
  }, [load, includeAllStatuses]);

  const allBusinesses = useMemo(() => {
    if (!isLiveBackend()) return seedAsLive;
    if (dbRows === null) return seedAsLive;
    return mergeBusinesses(dbRows, seedAsLive);
  }, [dbRows]);

  const businesses = useMemo(() => {
    if (!state) return allBusinesses;
    const normalized = normalizeDashboardState(state);
    return allBusinesses.filter(
      (b) => normalizeDashboardState(b.state) === normalized,
    );
  }, [allBusinesses, state]);

  const source: BusinessSource = !settled
    ? "loading"
    : !dbRows?.length
      ? "seed"
      : dbRows.length < allBusinesses.length
        ? "mixed"
        : "database";

  return {
    businesses,
    allBusinesses,
    source,
    error,
    reload: load,
    loading: isLiveBackend() && !settled,
  };
}
