"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch, getToken, isApiConfigured } from "@/lib/api/client";
import type { TenderBid } from "@/lib/bids";

export type PublishedContract = {
  id: string;
  title: string;
  reference: string | null;
  sector: string | null;
  state: string | null;
  value: number | null;
  deadline: string | null;
  status: string;
  created_at: string;
};

export type IncomingBid = {
  id: string;
  tender_id: string;
  business_name: string;
  contact_email: string;
  proposed_amount: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  tenders: {
    title: string;
    reference: string | null;
    status: string;
  } | null;
};

export function dbBidToTenderBid(row: {
  id: string;
  tender_id: string;
  business_name: string;
  contact_email: string;
  proposed_amount: number | null;
  notes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  tenders?: { title?: string; reference?: string | null } | null;
}): TenderBid {
  const tender = row.tenders;
  return {
    id: row.id,
    tenderId: row.tender_id,
    tenderRef: tender?.reference ?? row.tender_id.slice(0, 8).toUpperCase(),
    tenderTitle: tender?.title ?? "Contract",
    businessName: row.business_name,
    contactEmail: row.contact_email,
    proposedAmount: String(row.proposed_amount ?? ""),
    notes: row.notes ?? "",
    status: row.status === "draft" ? "draft" : "submitted",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Reads the signed-in user's id from the JWT held by the API client. */
function currentUserId(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/")),
    ) as { sub?: string; id?: string };
    return json.sub ?? json.id ?? null;
  } catch {
    return null;
  }
}

type ApiTender = PublishedContract & { submitted_by?: string | null };

async function fetchMyContracts(): Promise<PublishedContract[]> {
  const userId = currentUserId();
  if (!userId) return [];
  const data = await apiFetch<{ tenders?: ApiTender[] }>("/api/tenders?status=open");
  return (data.tenders ?? []).filter((tender) => tender.submitted_by === userId);
}

export function useMyPublishedContracts(enabled: boolean) {
  const [contracts, setContracts] = useState<PublishedContract[]>([]);
  const [loading, setLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled || !isApiConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      setContracts(await fetchMyContracts());
    } catch {
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { contracts, loading, reload };
}

export function useIncomingBids(enabled: boolean) {
  const [bids, setBids] = useState<IncomingBid[]>([]);
  const [loading, setLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled || !isApiConfigured()) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const mine = await fetchMyContracts();
      const lists = await Promise.all(
        mine.map(async (tender) => {
          const data = await apiFetch<{ bids?: Omit<IncomingBid, "tenders">[] }>(
            `/api/tenders/${tender.id}/bids`,
          );
          return (data.bids ?? []).map(
            (bid): IncomingBid => ({
              ...bid,
              tenders: {
                title: tender.title,
                reference: tender.reference,
                status: tender.status,
              },
            }),
          );
        }),
      );
      setBids(lists.flat());
    } catch {
      setBids([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { bids, loading, reload };
}