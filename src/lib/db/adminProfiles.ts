"use client";

import { useCallback, useEffect, useState } from "react";
import { directoryUsers } from "@/data/users";
import { PROFILE_COLUMNS, type ProfileRow } from "@/lib/session";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export function useAdminProfiles() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setProfiles([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error: err } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .order("full_name", { ascending: true });

    if (err) {
      setError(err.message);
      setProfiles([]);
    } else {
      setError(null);
      setProfiles((data ?? []) as ProfileRow[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Seed directory used only when the DB has no profiles yet. */
  const seedFallback = directoryUsers.map((u) => ({
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

  return {
    profiles: profiles.length ? profiles : seedFallback,
    source: profiles.length ? ("database" as const) : ("seed" as const),
    loading,
    error,
    reload: load,
  };
}
