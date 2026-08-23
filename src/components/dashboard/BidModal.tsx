"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import type { TenderItem } from "@/lib/db/tenders";
import type { TenderBid } from "@/lib/bids";

type Props = {
  tender: TenderItem;
  businessName: string;
  contactEmail: string;
  existing?: TenderBid | null;
  onClose: () => void;
  onSubmit: (bid: TenderBid) => void | Promise<void>;
};

export default function BidModal({
  tender,
  businessName,
  contactEmail,
  existing,
  onClose,
  onSubmit,
}: Props) {
  const [amount, setAmount] = useState(existing?.proposedAmount ?? "");
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);

  const onSave = async (e: FormEvent, asDraft: boolean) => {
    e.preventDefault();
    if (!amount.trim()) {
      toast.error("Enter your proposed bid amount.");
      return;
    }
    setSubmitting(true);
    const now = new Date().toISOString();
    const localBid: TenderBid = {
      id: existing?.id ?? `bid-${tender.ref}-${Date.now()}`,
      tenderRef: tender.ref,
      tenderTitle: tender.title,
      tenderId: tender.id,
      businessName,
      contactEmail,
      proposedAmount: amount.trim(),
      notes: notes.trim(),
      status: asDraft ? "draft" : "submitted",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        tender.id,
      );

    try {
      if (!tender.live) {
        toast.error("This contract is reference-only. Bid on live contracts instead.");
        return;
      }

      if (isUuid) {
        const res = await fetch("/api/tenders/bids", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tenderId: tender.id,
            proposedAmount: amount.trim(),
            notes: notes.trim(),
            status: asDraft ? "draft" : "submitted",
          }),
        });
        const data = (await res.json()) as {
          bid?: TenderBid;
          error?: string;
          code?: string;
        };
        if (!res.ok) {
          if (data.code === "NEEDS_MIGRATION") {
            toast.error(
              "Run supabase/business-procurement.sql in Supabase SQL editor, then try again.",
            );
            return;
          }
          toast.error(data.error ?? "Could not submit bid.");
          return;
        }
        if (data.bid) await onSubmit(data.bid);
        toast.success(
          asDraft
            ? `Draft saved for ${tender.ref}.`
            : `Bid submitted for ${tender.ref}.`,
        );
        onClose();
        return;
      }

      toast.error("This contract is not in the live database.");
    } catch {
      toast.error("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
      <form
        onSubmit={(e) => void onSave(e, false)}
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-navy">Submit bid</h2>
            <p className="mt-1 text-sm text-slate">
              {tender.ref} · {tender.title}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-slate" />
          </button>
        </div>

        <dl className="mt-5 space-y-3 rounded-xl bg-mist/70 p-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate">
              Agency / publisher
            </dt>
            <dd className="font-medium">{tender.agency}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate">
              Est. budget
            </dt>
            <dd className="font-medium">{tender.budget}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate">
              Deadline
            </dt>
            <dd className="font-medium">{tender.deadline}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate">
              Bidding as
            </dt>
            <dd className="font-medium">{businessName}</dd>
          </div>
        </dl>

        <label className="mt-5 block text-sm font-bold text-navy">
          Proposed amount (NGN)
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 1,800,000,000"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-navy">
          Cover letter / notes
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Briefly describe your capacity, past projects, and compliance documents…"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={(e) => void onSave(e, true)}
            className="rounded-xl border border-navy/12 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist disabled:opacity-60"
          >
            Save draft
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Submitting…" : "Submit bid"}
          </button>
        </div>
      </form>
    </div>
  );
}
