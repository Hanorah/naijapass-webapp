"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { TENDER_COLUMNS, type TenderRow } from "@/lib/db/types";
import { federalTenders } from "@/data/federalTenders";

export type TenderItem = {
  id: string;
  ref: string;
  title: string;
  agency: string;
  agencyTone: "green" | "blue";
  sector: string;
  budget: string;
  deadline: string;
  urgent: boolean;
  states: string[];
  federal?: boolean;
};

export type TenderSource = "loading" | "database" | "seed";

function formatValue(value: number | null, currency = "NGN") {
  if (!value || value <= 0) return "Budget TBA";
  const prefix = currency === "NGN" ? "N" : `${currency} `;
  if (value >= 1_000_000_000) return `${prefix}${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${prefix}${(value / 1_000_000).toFixed(0)}M`;
  return `${prefix}${value.toLocaleString("en-NG")}`;
}

function deadlineLabel(deadline: string | null) {
  if (!deadline) return "No deadline";
  const ms = new Date(deadline).getTime() - Date.now();
  const days = Math.ceil(ms / (1000 * 60 * 60 * 24));
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "Closes in 1 day";
  return `Closes in ${days} days`;
}

function rowToTender(row: TenderRow): TenderItem {
  const state = row.state ?? "Federal";
  return {
    id: row.id,
    ref: row.reference ?? row.id.slice(0, 8).toUpperCase(),
    title: row.title,
    agency: row.mda ?? state,
    agencyTone: !row.state || row.state === "FCT" ? "blue" : "green",
    sector: row.sector ?? "General",
    budget: formatValue(row.value, row.currency),
    deadline: deadlineLabel(row.deadline),
    urgent: row.deadline
      ? new Date(row.deadline).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7
      : false,
    states: row.state ? [row.state] : [],
    federal: !row.state,
  };
}

function seedFromFederal(): TenderItem[] {
  return federalTenders
    .filter((t) => t.status === "open")
    .map((t) => ({
      id: t.reference,
      ref: t.reference,
      title: t.title,
      agency: t.mda,
      agencyTone: (!t.state || t.state === "FCT" ? "blue" : "green") as "green" | "blue",
      sector: t.sector,
      budget: formatValue(t.value),
      deadline: deadlineLabel(t.deadline),
      urgent:
        new Date(t.deadline).getTime() - Date.now() < 1000 * 60 * 60 * 24 * 7,
      states: t.state ? [t.state] : [],
      federal: !t.state,
    }));
}

export function tenderMatchesState(tender: TenderItem, state: string) {
  if (tender.federal) return true;
  return tender.states.includes(state);
}

function mergeTenders(db: TenderItem[], seed: TenderItem[]) {
  const seen = new Set<string>();
  const out: TenderItem[] = [];
  for (const item of [...db, ...seed]) {
    const key = item.ref.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

async function fetchAllTenders() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenders")
    .select(TENDER_COLUMNS)
    .eq("status", "open")
    .order("deadline", { ascending: true });

  if (error) return { rows: null as TenderItem[] | null, error: error.message };

  const rows = (data ?? []) as TenderRow[];
  return { rows: rows.map(rowToTender), error: null };
}

export function useTenders(state?: string) {
  const seed = useMemo(() => seedFromFederal(), []);
  const [dbRows, setDbRows] = useState<TenderItem[] | null>(null);
  const [settled, setSettled] = useState(!isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    const result = await fetchAllTenders();
    setDbRows(result.rows);
    setError(result.error);
    setSettled(true);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    let active = true;
    void (async () => {
      const result = await fetchAllTenders();
      if (!active) return;
      setDbRows(result.rows);
      setError(result.error);
      setSettled(true);
    })();
    return () => {
      active = false;
    };
  }, []);

  const allTenders = useMemo(() => {
    if (!isSupabaseConfigured()) return seed;
    return mergeTenders(settled ? (dbRows ?? []) : [], seed);
  }, [dbRows, seed, settled]);

  const tenders = useMemo(() => {
    if (!state) return allTenders;
    return allTenders.filter((t) => tenderMatchesState(t, state));
  }, [allTenders, state]);

  const source: TenderSource = !isSupabaseConfigured()
    ? "seed"
    : settled
      ? dbRows?.length
        ? "database"
        : "seed"
      : "loading";

  return {
    tenders,
    allTenders,
    source,
    error,
    reload: load,
    loading: isSupabaseConfigured() && !settled,
  };
}
