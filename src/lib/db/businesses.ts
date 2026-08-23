"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type Business,
  type DirectoryCategory,
} from "@/data/businesses";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export type BusinessSource = "loading" | "database" | "seed";

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

function rowToBusiness(row: BusinessRow): Business {
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
    image: row.image_url ?? "",
    description: row.description ?? undefined,
    email: row.email ?? undefined,
    website: row.website ?? undefined,
    services: row.services ?? undefined,
    yearFounded: row.year_founded ?? undefined,
    employees: row.employees ?? undefined,
  };
}

async function fetchAllBusinesses() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(BUSINESS_COLUMNS)
    .eq("status", "live")
    .order("updated_at", { ascending: false });

  if (error) return { rows: null as Business[] | null, error: error.message };

  const rows = (data ?? []) as BusinessRow[];
  return { rows: rows.map(rowToBusiness), error: null };
}


export function useBusinesses(state?: string) {
  const [dbRows, setDbRows] = useState<Business[] | null>(null);
  const [settled, setSettled] = useState(!isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const result = await fetchAllBusinesses();
    setDbRows(result.rows);
    setError(result.error);
    setSettled(true);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    void (async () => {
      const result = await fetchAllBusinesses();
      if (!active) return;
      setDbRows(result.rows);
      setError(result.error);
      setSettled(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const allBusinesses = useMemo(() => {
    if (!isSupabaseConfigured()) return [];
    if (!settled) return [];
    return dbRows ?? [];
  }, [dbRows, settled]);

  const businesses = useMemo(() => {
    if (!state) return allBusinesses;
    return allBusinesses.filter((b) => b.state === state);
  }, [allBusinesses, state]);

  const source: BusinessSource = !isSupabaseConfigured()
    ? "seed"
    : settled
      ? dbRows?.length
        ? "database"
        : "seed"
      : "loading";

  return {
    businesses,
    allBusinesses,
    source,
    error,
    reload: load,
    loading: isSupabaseConfigured() && !settled,
  };
}
