"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import {
  EmptyState,
  Field,
  GhostButton,
  Modal,
  OfflineNotice,
  PageHeader,
  Pill,
  PrimaryButton,
  fieldClass,
  selectClass,
} from "@/components/govt/ui";
import {
  TENDER_COLUMNS,
  TENDER_STATUSES,
  type TenderRow,
  type TenderStatus,
} from "@/lib/db/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { formatNaira } from "@/data/federalTenders";

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
];

type Draft = {
  id: string | null;
  title: string;
  reference: string;
  mda: string;
  sector: string;
  lga: string;
  value: string;
  deadline: string;
  status: TenderStatus;
  description: string;
  contactEmail: string;
  documentUrl: string;
};

function emptyDraft(state: string): Draft {
  return {
    id: null,
    title: "",
    reference: "",
    mda: state ? `${state} Ministry of Works` : "",
    sector: "Infrastructure",
    lga: "",
    value: "",
    deadline: "",
    status: "open",
    description: "",
    contactEmail: "",
    documentUrl: "",
  };
}

async function fetchTenders(state: string): Promise<TenderRow[]> {
  if (!isSupabaseConfigured() || !state) return [];

  const supabase = createClient();
  const { data, error } = await supabase
    .from("tenders")
    .select(TENDER_COLUMNS)
    .eq("state", state)
    .order("created_at", { ascending: false });

  if (error) {
    toast.error(error.message);
    return [];
  }
  return (data ?? []) as TenderRow[];
}

function draftFrom(row: TenderRow): Draft {
  return {
    id: row.id,
    title: row.title,
    reference: row.reference ?? "",
    mda: row.mda ?? "",
    sector: row.sector ?? "Infrastructure",
    lga: row.lga ?? "",
    value: row.value ? String(row.value) : "",
    deadline: row.deadline ? row.deadline.slice(0, 10) : "",
    status: row.status,
    description: row.description ?? "",
    contactEmail: row.contact_email ?? "",
    documentUrl: row.document_url ?? "",
  };
}

export default function GovtTendersManager() {
  const { user, live } = useSession();
  const state = user?.govtState ?? user?.state ?? "";

  const [tenders, setTenders] = useState<TenderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const rows = await fetchTenders(state);
    setTenders(rows);
    setLoading(false);
  }, [state]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const rows = await fetchTenders(state);
      if (!active) return;
      setTenders(rows);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [state]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((curr) => (curr ? { ...curr, [key]: value } : curr));

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Give the tender a title.");
      return;
    }
    if (!isSupabaseConfigured()) {
      toast.error("Connect a Supabase database before publishing. See .env.example.");
      return;
    }

    const row = {
      title: draft.title.trim(),
      reference: draft.reference.trim() || null,
      mda: draft.mda.trim() || null,
      state,
      sector: draft.sector,
      lga: draft.lga.trim() || null,
      value: draft.value ? Number(draft.value.replace(/[^\d]/g, "")) : null,
      deadline: draft.deadline ? new Date(draft.deadline).toISOString() : null,
      status: draft.status,
      description: draft.description.trim() || null,
      contact_email: draft.contactEmail.trim() || null,
      document_url: draft.documentUrl.trim() || null,
      source: `${state} State Government`,
      published_at: new Date().toISOString(),
      submitted_by: user?.id ?? null,
    };

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = draft.id
        ? await supabase.from("tenders").update(row).eq("id", draft.id)
        : await supabase.from("tenders").insert(row);

      if (error) {
        toast.error(
          /duplicate key/i.test(error.message)
            ? "That tender reference is already in use."
            : error.message,
        );
        return;
      }

      toast.success(draft.id ? "Tender updated." : "Tender published.");
      setDraft(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (row: TenderRow) => {
    if (!window.confirm(`Remove "${row.title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("tenders").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Tender removed.");
    await load();
  };

  const toneFor = (status: TenderStatus) =>
    status === "open"
      ? "green"
      : status === "awarded"
        ? "blue"
        : status === "cancelled"
          ? "red"
          : "slate";

  return (
    <div className="space-y-6">
      {!live ? <OfflineNotice /> : null}

      <PageHeader
        title="Tenders"
        description={`Open procurement for ${state || "your state"}. Verified businesses see these in the procurement hub the moment you publish.`}
        action={
          <PrimaryButton onClick={() => setDraft(emptyDraft(state))}>
            <Plus className="h-4 w-4" />
            New tender
          </PrimaryButton>
        }
      />

      {loading ? (
        <p className="text-sm text-white/40">Loading tenders…</p>
      ) : tenders.length ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Tender</th>
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Deadline</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 bg-[#0e1628]">
              {tenders.map((row) => (
                <tr key={row.id}>
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-semibold text-white/90">{row.title}</p>
                    <p className="truncate text-xs text-white/35">
                      {row.reference ?? "No reference"} · {row.mda ?? state}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-white/60">{row.sector ?? "—"}</td>
                  <td className="px-4 py-3 text-white/60">
                    {row.value ? formatNaira(Number(row.value)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {row.deadline
                      ? new Date(row.deadline).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Pill tone={toneFor(row.status)}>{row.status}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => setDraft(draftFrom(row))}
                        title="Edit"
                        className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(row)}
                        title="Delete"
                        className="rounded-lg p-2 text-white/40 hover:bg-red-400/10 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState
          title="No tenders published"
          body={`Publish a ${state} tender and every verified business on the portal can find and bid on it.`}
          action={
            <PrimaryButton onClick={() => setDraft(emptyDraft(state))}>
              <Plus className="h-4 w-4" />
              New tender
            </PrimaryButton>
          }
        />
      )}

      {draft ? (
        <Modal
          wide
          title={draft.id ? "Edit tender" : `New ${state} tender`}
          onClose={() => setDraft(null)}
        >
          <form onSubmit={onSave} className="space-y-4">
            <Field label="Tender title">
              <input
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Supply and installation of 400 solar street lights"
                className={fieldClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Reference" hint="Must be unique across the portal.">
                <input
                  value={draft.reference}
                  onChange={(e) => set("reference", e.target.value)}
                  placeholder={`${state.slice(0, 3).toUpperCase()}/2026/014`}
                  className={fieldClass}
                />
              </Field>
              <Field label="Procuring ministry or agency">
                <input
                  value={draft.mda}
                  onChange={(e) => set("mda", e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Sector">
                <select
                  value={draft.sector}
                  onChange={(e) => set("sector", e.target.value)}
                  className={selectClass}
                >
                  {SECTORS.map((sector) => (
                    <option key={sector}>{sector}</option>
                  ))}
                </select>
              </Field>
              <Field label="Estimated value (₦)">
                <input
                  value={draft.value}
                  onChange={(e) => set("value", e.target.value.replace(/[^\d]/g, ""))}
                  inputMode="numeric"
                  placeholder="450000000"
                  className={fieldClass}
                />
              </Field>
              <Field label="LGA (optional)">
                <input
                  value={draft.lga}
                  onChange={(e) => set("lga", e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Submission deadline">
                <input
                  type="date"
                  value={draft.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Status">
                <select
                  value={draft.status}
                  onChange={(e) => set("status", e.target.value as TenderStatus)}
                  className={selectClass}
                >
                  {TENDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Scope of work">
              <textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Deliverables, eligibility requirements, bid security, opening date and venue…"
                className={fieldClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Enquiries email">
                <input
                  type="email"
                  value={draft.contactEmail}
                  onChange={(e) => set("contactEmail", e.target.value)}
                  placeholder="procurement@state.gov.ng"
                  className={fieldClass}
                />
              </Field>
              <Field label="Tender document URL">
                <input
                  value={draft.documentUrl}
                  onChange={(e) => set("documentUrl", e.target.value)}
                  placeholder="https://…"
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <GhostButton onClick={() => setDraft(null)}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? "Saving…" : draft.id ? "Save changes" : "Publish tender"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
