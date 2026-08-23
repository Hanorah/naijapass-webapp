import { readJson, writeJson } from "@/lib/session";

export type TenderBid = {
  id: string;
  tenderRef: string;
  tenderTitle: string;
  tenderId: string;
  businessName: string;
  contactEmail: string;
  proposedAmount: string;
  notes: string;
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
};

export const BIDS_KEY = "naijapass.tenderBids";

export function readBids(): TenderBid[] {
  return readJson<TenderBid[]>(BIDS_KEY) ?? [];
}

export function writeBids(bids: TenderBid[]) {
  writeJson(BIDS_KEY, bids);
}

export function upsertBid(bid: TenderBid) {
  const bids = readBids();
  const next = [
    bid,
    ...bids.filter(
      (item) =>
        item.id !== bid.id &&
        !(item.tenderRef === bid.tenderRef && item.contactEmail === bid.contactEmail),
    ),
  ];
  writeBids(next);
  return bid;
}

export function mergeBids(primary: TenderBid[], secondary: TenderBid[]): TenderBid[] {
  const byKey = new Map<string, TenderBid>();
  for (const bid of [...secondary, ...primary]) {
    const key = `${bid.tenderId || bid.tenderRef}:${bid.contactEmail}`;
    byKey.set(key, bid);
  }
  return Array.from(byKey.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
}
