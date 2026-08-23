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
  const next = [bid, ...bids.filter((item) => item.id !== bid.id)];
  writeBids(next);
  return bid;
}
