"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";
import { nigerianStates } from "@/data/states";
import { stateDisplayName } from "@/data/marketplace";
import { apiFetch } from "@/lib/api/client";

const SECTORS = [
  "Infrastructure",
  "Health",
  "Education",
  "Energy",
  "Water",
  "ICT",
  "Agriculture",
  "Security",
  "Transport",
  "Consultancy",
  "Supplies",
  "Other",
];

type Props = {
  defaultState: string;
  companyName: string;
  contactEmail: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateContractModal({
  defaultState,
  companyName,
  contactEmail,
  onClose,
  onCreated,
}: Props) {
  const [title, setTitle] = useState("");
  const [sector, setSector] = useState("Infrastructure");
  const [state, setState] = useState(defaultState);
  const [lga, setLga] = useState("");
  const [value, setValue] = useState("");
  const [deadline, setDeadline] = useState("");
  const [description, setDescription] = useState("");
  const [contact, setContact] = useState(contactEmail);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Give the contract a title.");
      return;
    }
    setSaving(true);
    try {
      const numericValue = Number(value.replace(/[^0-9.]/g, ""));
      await apiFetch("/api/tenders", {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          sector,
          mda: companyName || undefined,
          state: state || undefined,
          lga: lga.trim() || undefined,
          value: Number.isFinite(numericValue) && numericValue > 0 ? numericValue : undefined,
          deadline: deadline || undefined,
          description: description.trim() || undefined,
          contact_email: contact.trim() || undefined,
          publisher_type: "business",
        }),
      });      toast.success("Contract published — other businesses can bid now.");
      try {
        window.dispatchEvent(new CustomEvent("naijapass:tenders-changed"));
      } catch {
        /* ignore */
      }
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not publish contract.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-navy/40 p-4 sm:items-center">
      <form
        onSubmit={onSubmit}
        className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-xl font-bold text-navy">
              Publish a contract
            </h2>
            <p className="mt-1 text-sm text-slate">
              Post an RFP for other verified businesses to bid on. Published as{" "}
              <strong>{companyName}</strong>.
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5 text-slate" />
          </button>
        </div>

        <label className="mt-5 block text-sm font-bold text-navy">
          Contract title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Supply of school furniture — Phase 1"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <label className="mt-4 block text-sm font-bold text-navy">
          Scope / requirements
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Deliverables, eligibility, bid security, opening date…"
            className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal outline-none focus:ring-2 focus:ring-forest/15"
          />
        </label>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            Sector
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {SECTORS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-navy">
            Est. budget (NGN)
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 50000000"
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            State
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 bg-white px-3 py-2.5 text-sm font-normal"
            >
              {nigerianStates.map((s) => (
                <option key={s} value={s}>
                  {stateDisplayName(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-bold text-navy">
            LGA (optional)
            <input
              value={lga}
              onChange={(e) => setLga(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-bold text-navy">
            Bid deadline
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
          <label className="block text-sm font-bold text-navy">
            Contact email
            <input
              type="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-navy/12 px-3 py-2.5 text-sm font-normal"
            />
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-navy hover:bg-mist"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-4 py-2.5 text-sm font-semibold text-white hover:bg-forest-hover disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {saving ? "Publishing…" : "Publish contract"}
          </button>
        </div>
      </form>
    </div>
  );
}
