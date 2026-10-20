"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { directoryUsers } from "@/data/users";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { type ProfileRow } from "@/lib/session";

export type AdminUserPatch = {
  account_status?: string;
  role?: string;
  kyc_status?: string;
  govt_state?: string | null;
};

/** PATCH /api/admin/users/:id */
export async function patchAdminUser(id: string, patch: AdminUserPatch) {
  const body = await apiFetch<{ user?: ProfileRow; profile?: ProfileRow }>(
    `/api/admin/users/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
  return body.user ?? body.profile ?? null;
}

/** GET /api/admin/users */
export async function fetchAdminUsers(): Promise<ProfileRow[]> {
  const body = await apiFetch<
    ProfileRow[] | { users?: ProfileRow[]; profiles?: ProfileRow[] }
  >("/api/admin/users");
  if (Array.isArray(body)) return body;
  return body.users ?? body.profiles ?? [];
}

/** Seed directory: shown only when the API is not configured or unreachable. */
const seedProfiles = directoryUsers.map((u) => ({
  id: u.id,
  email: u.email,
  full_name: u.name,
  phone: null,
  role: u.role,
  account_status: u.status === "verified" ? "active" : u.status,
  state: u.state,
  lga: null,
  kyc_status: u.status,
  business_name: u.role === "business" ? u.name : null,
  business_type: null,
  cac_number: null,
  govt_state: u.role === "govt" ? u.state : null,
  department: null,
  office_title: null,
})) as ProfileRow[];

export function useAdminProfiles() {
  const [rows, setRows] = useState<ProfileRow[] | null>(null);
  const [loading, setLoading] = useState(isApiConfigured());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isApiConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setRows(await fetchAdminUsers());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load accounts.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  /** Optimistic local merge after a successful PATCH. */
  const applyPatch = useCallback((id: string, patch: Partial<ProfileRow>) => {
    setRows((curr) =>
      curr ? curr.map((row) => (row.id === id ? { ...row, ...patch } : row)) : curr,
    );
  }, []);

  const profiles = useMemo(() => rows ?? seedProfiles, [rows]);

  return {
    profiles,
    source: (rows ? "database" : "seed") as "seed" | "database",
    loading,
    error,
    reload: load,
    applyPatch,
  };
}
