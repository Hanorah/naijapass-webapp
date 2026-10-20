"use client";

import { useCallback, useEffect, useState } from "react";
import {
  directoryLgasByState,
  type Business,
  type DirectoryCategory,
} from "@/data/businesses";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { normalizeDashboardState } from "@/lib/dashboardState";
import { notifyBusinessesChanged } from "@/lib/db/businessEvents";
import { isStorableImageUrl } from "@/lib/storage/businessImage";
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

export type SaveMyBusinessOptions = {
  verified?: boolean;
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

async function fetchMyBusinessRemote() {
  if (isApiConfigured()) {
    try {
      const body = await apiFetch<{ business?: BusinessRow | null }>("/api/businesses/mine");
      if (!body.business) return { business: null, error: null };
      return { business: rowToMyBusiness(body.business), error: null };
    } catch (err) {
      return {
        business: null as MyBusiness | null,
        error: err instanceof Error ? err.message : "Could not load business.",
      };
    }
  }

  return { business: null as MyBusiness | null, error: "API is not configured." };
}

async function saveMyBusinessRemote(
  existingId: string | undefined,
  input: SaveMyBusinessInput,
  options: SaveMyBusinessOptions = {},
) {
  const payload = {
    id: existingId,
    ...input,
    verified: Boolean(options.verified),
    image: input.image && isStorableImageUrl(input.image) ? input.image : undefined,
  };

  if (isApiConfigured()) {
    try {
      const body = await apiFetch<{ business?: BusinessRow }>("/api/businesses", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!body.business) {
        return { business: null as MyBusiness | null, error: "Could not save business." };
      }
      return { business: rowToMyBusiness(body.business), error: null };
    } catch (err) {
      return {
        business: null as MyBusiness | null,
        error: err instanceof Error ? err.message : "Could not save business.",
      };
    }
  }

  return { business: null as MyBusiness | null, error: "API is not configured." };
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
    if (isApiConfigured() && userId) {
      const result = await fetchMyBusinessRemote();
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
    async (input: SaveMyBusinessInput, options: SaveMyBusinessOptions = {}) => {
      if (!ownerKey) return { business: null, error: "Not signed in." };

      if (isApiConfigured() && userId && userEmail) {
        const result = await saveMyBusinessRemote(business?.id, input, options);
        if (result.business) {
          setBusiness(result.business);
          notifyBusinessesChanged();
        }
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
        state: normalizeDashboardState(input.state),
        hours: "Hours not listed",
        openNow: true,
        verified: Boolean(options.verified),
        pos: false,
        tags: input.services ?? [],
        phone: input.phone?.trim() ?? "",
        image: input.image && isStorableImageUrl(input.image) ? input.image : "",
        description: input.description?.trim(),
        email: input.email?.trim() || userEmail,
        website: input.website?.trim(),
        services: input.services,
        yearFounded: input.yearFounded,
        employees: input.employees,
        status: "live",
        ownerId: userId,
      };
      writeLocalBusiness(ownerKey, saved);
      setBusiness(saved);
      notifyBusinessesChanged();
      return { business: saved, error: null };
    },
    [business, ownerKey, userEmail, userId],
  );

  const setVisibility = useCallback(
    async (status: "live" | "hidden") => {
      if (!business) return { error: "No business profile yet." };
      if (isApiConfigured() && userId) {
        try {
          const body = await apiFetch<{ business?: BusinessRow }>(
            `/api/businesses/${encodeURIComponent(business.id)}/status`,
            { method: "PATCH", body: JSON.stringify({ status }) },
          );
          const saved = body.business
            ? rowToMyBusiness(body.business)
            : ({ ...business, status } as MyBusiness);
          setBusiness(saved);
          notifyBusinessesChanged();
          return { business: saved, error: null };
        } catch (err) {
          return {
            business: null as MyBusiness | null,
            error: err instanceof Error ? err.message : "Could not update visibility.",
          };
        }
      }
      // Offline: visibility is kept on this device only.
      const next = { ...business, status };
      writeLocalBusiness(ownerKey, next);
      setBusiness(next);
      notifyBusinessesChanged();
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
