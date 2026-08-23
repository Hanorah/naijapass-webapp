"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import type { TenderItem } from "@/lib/db/tenders";
import type { TenderBid } from "@/lib/bids";

type Props = {
  tender: TenderItem;
  businessName: string;
  contactEmail: string;
  existing?: TenderBid | null;
  onClose: () => void;
  onSubmit: (bid: TenderBid) => void;
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

  const onSave = (e: FormEvent, asDraft: boolean) => {
    e.preventDefault();
    if (!amount.trim()) {
      toast.error("Enter your proposed bid amount.");
      return;
    }
    setSubmitting(true);
    const now = new Date().toISOString();
    const bid: TenderBid = {
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
    onSubmit(bid);
    toast.success(
      asDraft
        ? `Draft saved for ${tender.ref}.`
        : `Bid submitted for ${tender.ref}. We will confirm by email.`,
    );
    setSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
      <form
        onSubmit={(e) => onSave(e, false)}
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
              Agency
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
            placeholder="Briefly describe your capacity, past projects, and compliance documents attached…"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <p className="mt-3 text-xs text-slate">
          Ensure CAC, tax clearance, and PENCOM are current. Final submission may
          require document upload at the issuing MDA portal.
        </p>

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
            onClick={(e) => onSave(e, true)}
            className="rounded-xl border border-navy/12 px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
          >
            Save draft
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit bid"}
          </button>
        </div>
      </form>
    </div>
  );
}
