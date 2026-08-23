"use client";

import { useCallback, useEffect, useState } from "react";
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

export function useMyPublishedContracts(enabled: boolean) {
  const [contracts, setContracts] = useState<PublishedContract[]>([]);
  const [loading, setLoading] = useState(enabled);

  const reload = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tenders/upsert");
      const data = (await res.json()) as { tenders?: PublishedContract[] };
      setContracts(data.tenders ?? []);
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
    if (!enabled) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tenders/bids?view=incoming");
      const data = (await res.json()) as { bids?: IncomingBid[] };
      setBids(data.bids ?? []);
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
