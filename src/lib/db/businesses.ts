"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  businesses as seedBusinesses,
  getBusinessById,
  type Business,
  type DirectoryCategory,
} from "@/data/businesses";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
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

const BUSINESS_COLUMNS =
  "id, name, category, subcategory, state, lga, address, phone, email, website, description, verified, rating, review_count, status, services, image_url, year_founded, employees";

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
  const supabase = createClient();
  let query = supabase
    .from("businesses")
    .select(BUSINESS_COLUMNS)
    .order("updated_at", { ascending: false });

  if (liveOnly) query = query.eq("status", "live");

  const { data, error } = await query;

  if (error) return { rows: null as LiveBusiness[] | null, error: error.message };

  const rows = (data ?? []) as BusinessRow[];
  return { rows: rows.map(rowToBusiness), error: null };
}

async function fetchBusinessById(id: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(BUSINESS_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (error) return { business: null as LiveBusiness | null, error: error.message };
  if (!data) return { business: null, error: null };
  return { business: rowToBusiness(data as BusinessRow), error: null };
}

export function useBusinessProfile(id: string) {
  const fallback = useMemo(
    () => (id ? (getBusinessById(id) as LiveBusiness | undefined) ?? null : null),
    [id],
  );
  const [business, setBusiness] = useState<Business | null>(fallback);
  const [loading, setLoading] = useState(Boolean(id) && isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setBusiness(null);
      setLoading(false);
      return;
    }
    if (!isSupabaseConfigured()) {
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
  const [settled, setSettled] = useState(!isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const result = await fetchAllBusinesses(!includeAllStatuses);
    setDbRows(result.rows);
    setError(result.error);
    setSettled(true);
  }, [includeAllStatuses]);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
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
    if (!isSupabaseConfigured()) return seedAsLive;
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
    loading: isSupabaseConfigured() && !settled,
  };
}
