"use client";

import { useCallback, useEffect, useState } from "react";
import {
  directoryLgasByState,
  type Business,
  type DirectoryCategory,
} from "@/data/businesses";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { readJson, writeJson } from "@/lib/session";

export type MyBusinessStatus = "none" | "pending" | "live" | "hidden";

export type MyBusiness = Business & {
  status: MyBusinessStatus;
  ownerId?: string;
};

const LOCAL_BUSINESS_KEY = "naijapass.myBusiness";

type BusinessRow = {
  id: string;
  owner_id: string | null;
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

const MY_BUSINESS_COLUMNS =
  "id, owner_id, name, category, subcategory, state, lga, address, phone, email, website, description, verified, rating, review_count, status, services, image_url, year_founded, employees";

function rowToMyBusiness(row: BusinessRow): MyBusiness {
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
    status: (row.status as MyBusinessStatus) ?? "pending",
    ownerId: row.owner_id ?? undefined,
  };
}

export type SaveMyBusinessInput = {
  name: string;
  category: DirectoryCategory;
  subcategory: string;
  state: string;
  lga: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  services?: string[];
  image?: string;
  yearFounded?: string;
  employees?: string;
};

function readLocalBusiness(ownerKey: string): MyBusiness | null {
  const map = readJson<Record<string, MyBusiness>>(LOCAL_BUSINESS_KEY) ?? {};
  return map[ownerKey] ?? null;
}

function writeLocalBusiness(ownerKey: string, business: MyBusiness) {
  const map = readJson<Record<string, MyBusiness>>(LOCAL_BUSINESS_KEY) ?? {};
  map[ownerKey] = business;
  writeJson(LOCAL_BUSINESS_KEY, map);
}

async function fetchMyBusiness(ownerId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("businesses")
    .select(MY_BUSINESS_COLUMNS)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) return { business: null as MyBusiness | null, error: error.message };
  if (!data) return { business: null, error: null };
  return { business: rowToMyBusiness(data as BusinessRow), error: null };
}

async function saveMyBusinessRemote(
  ownerId: string,
  ownerEmail: string,
  existingId: string | undefined,
  input: SaveMyBusinessInput,
) {
  const supabase = createClient();
  const payload = {
    owner_id: ownerId,
    name: input.name.trim(),
    category: input.category,
    subcategory: input.subcategory.trim(),
    state: input.state,
    lga: input.lga,
    address: input.address?.trim() || null,
    phone: input.phone?.trim() || null,
    email: input.email?.trim() || ownerEmail,
    website: input.website?.trim() || null,
    description: input.description?.trim() || null,
    services: input.services ?? [],
    image_url: input.image || null,
    year_founded: input.yearFounded?.trim() || null,
    employees: input.employees?.trim() || null,
    status: "pending",
  };

  if (existingId) {
    const { data, error } = await supabase
      .from("businesses")
      .update(payload)
      .eq("id", existingId)
      .select(MY_BUSINESS_COLUMNS)
      .single();
    if (error) return { business: null as MyBusiness | null, error: error.message };
    return { business: rowToMyBusiness(data as BusinessRow), error: null };
  }

  const { data, error } = await supabase
    .from("businesses")
    .insert(payload)
    .select(MY_BUSINESS_COLUMNS)
    .single();
  if (error) return { business: null, error: error.message };
  return { business: rowToMyBusiness(data as BusinessRow), error: null };
}

export function useMyBusiness(userId?: string, userEmail?: string) {
  const ownerKey = userId ?? userEmail ?? "";
  const [business, setBusiness] = useState<MyBusiness | null>(null);
  const [loading, setLoading] = useState(Boolean(ownerKey));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!ownerKey) {
      setBusiness(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    if (isSupabaseConfigured() && userId) {
      const result = await fetchMyBusiness(userId);
      setBusiness(result.business);
      setError(result.error);
    } else {
      setBusiness(readLocalBusiness(ownerKey));
      setError(null);
    }
    setLoading(false);
  }, [ownerKey, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (input: SaveMyBusinessInput) => {
      if (!ownerKey) return { business: null, error: "Not signed in." };

      if (isSupabaseConfigured() && userId && userEmail) {
        const result = await saveMyBusinessRemote(
          userId,
          userEmail,
          business?.id,
          input,
        );
        if (result.business) setBusiness(result.business);
        setError(result.error);
        return result;
      }

      const saved: MyBusiness = {
        id: business?.id ?? `local-${Date.now()}`,
        name: input.name.trim(),
        category: input.category,
        subcategory: input.subcategory.trim(),
        rating: business?.rating ?? 0,
        reviews: business?.reviews ?? 0,
        address: input.address?.trim() ?? "",
        lga: input.lga,
        state: input.state,
        hours: "Hours not listed",
        openNow: true,
        verified: false,
        pos: false,
        tags: input.services ?? [],
        phone: input.phone?.trim() ?? "",
        image: input.image ?? "",
        description: input.description?.trim(),
        email: input.email?.trim() || userEmail,
        website: input.website?.trim(),
        services: input.services,
        yearFounded: input.yearFounded,
        employees: input.employees,
        status: "pending",
        ownerId: userId,
      };
      writeLocalBusiness(ownerKey, saved);
      setBusiness(saved);
      return { business: saved, error: null };
    },
    [business, ownerKey, userEmail, userId],
  );

  const setVisibility = useCallback(
    async (status: "live" | "hidden") => {
      if (!business) return { error: "No business profile yet." };
      if (isSupabaseConfigured() && userId) {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("businesses")
          .update({ status })
          .eq("id", business.id)
          .select(MY_BUSINESS_COLUMNS)
          .single();
        if (error) return { error: error.message };
        const next = rowToMyBusiness(data as BusinessRow);
        setBusiness(next);
        return { business: next, error: null };
      }
      const next = { ...business, status };
      writeLocalBusiness(ownerKey, next);
      setBusiness(next);
      return { business: next, error: null };
    },
    [business, ownerKey, userId],
  );

  return {
    business,
    loading,
    error,
    save,
    setVisibility,
    reload: load,
    hasProfile: Boolean(business),
    lgaOptions: directoryLgasByState,
  };
}

export function useBusinessById(id: string, allBusinesses: Business[]) {
  return allBusinesses.find((item) => item.id === id);
}
