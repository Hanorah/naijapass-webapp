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
  TENDER_STATUSES,
  type TenderRow,
  type TenderStatus,
} from "@/lib/db/types";
import { apiFetch, isApiConfigured } from "@/lib/api/client";
import { federalTenders, formatNaira } from "@/data/federalTenders";
import { normalizeDashboardState } from "@/lib/dashboardState";

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

function seedTendersForState(state: string): TenderRow[] {
  if (!state) return [];
  const normalized = normalizeDashboardState(state);
  return federalTenders
    .filter((t) => t.state && normalizeDashboardState(t.state) === normalized)
    .map((t) => ({
      id: `seed-${t.reference}`,
      title: t.title,
      reference: t.reference,
      mda: t.mda,
      state: t.state ?? state,
      sector: t.sector,
      value: t.value,
      currency: "NGN",
      deadline: t.deadline,
      status: t.status as TenderStatus,
      description: null,
      source: "catalogue",
      published_at: null,
      lga: null,
      contact_email: null,
      document_url: null,
      submitted_by: null,
      publisher_type: "govt" as const,
      business_id: null,
      created_at: new Date().toISOString(),
    }));
}

/** MySQL-friendly DATETIME ("YYYY-MM-DD HH:MM:SS") from a date or ISO string. */
function toSqlDateTime(value: string | null | undefined) {
  if (!value) return undefined;
  const base = value.length <= 10 ? `${value}T00:00:00` : value;
  return base.slice(0, 19).replace("T", " ");
}

/** Body for POST /api/tenders. The API rejects nulls, so empty values are omitted. */
function tenderPayload(row: TenderRow, overrides: Record<string, unknown> = {}) {
  return {
    id: row.id,
    title: row.title,
    reference: row.reference || undefined,
    mda: row.mda || undefined,
    state: row.state || undefined,
    sector: row.sector || undefined,
    value: row.value ?? undefined,
    currency: row.currency || undefined,
    deadline: toSqlDateTime(row.deadline),
    status: row.status,
    description: row.description || undefined,
    source: row.source || undefined,
    lga: row.lga || undefined,
    contact_email: row.contact_email || undefined,
    document_url: row.document_url || undefined,
    publisher_type: "govt",
    ...overrides,
  };
}

async function fetchTenders(state: string): Promise<TenderRow[]> {
  if (!state) return [];
  if (!isApiConfigured()) return seedTendersForState(state);

  // The API filters by one status at a time, so gather every status for this state.
  const results = await Promise.allSettled(
    TENDER_STATUSES.map((status) =>
      apiFetch<{ tenders?: TenderRow[] }>(
        `/api/tenders?state=${encodeURIComponent(state)}&status=${status}`,
        { anonymous: true },
      ),
    ),
  );

  const failed = results.find((r) => r.status === "rejected");
  if (failed && results.every((r) => r.status === "rejected")) {
    const reason = (failed as PromiseRejectedResult).reason;
    toast.error(reason instanceof Error ? reason.message : "Could not load tenders.");
    return seedTendersForState(state);
  }

  const rows = results
    .flatMap((r) => (r.status === "fulfilled" ? (r.value.tenders ?? []) : []))
    .filter((row) => row.state === state)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  if (!rows.length) return seedTendersForState(state);

  const seen = new Set(rows.map((r) => (r.reference ?? r.id).toLowerCase()));
  const extras = seedTendersForState(state).filter(
    (r) => !seen.has((r.reference ?? r.id).toLowerCase()),
  );
  return [...rows, ...extras];
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
    if (!isApiConfigured()) {
      toast.error("Connect the API (NEXT_PUBLIC_API_URL) before publishing. See .env.example.");
      return;
    }

    const isSeed = Boolean(draft.id?.startsWith("seed-"));
    const row = {
      id: draft.id && !isSeed ? draft.id : undefined,
      title: draft.title.trim(),
      reference: draft.reference.trim() || undefined,
      mda: draft.mda.trim() || undefined,
      state,
      sector: draft.sector,
      lga: draft.lga.trim() || undefined,
      value: draft.value ? Number(draft.value.replace(/[^\d]/g, "")) || undefined : undefined,
      deadline: toSqlDateTime(draft.deadline),
      status: draft.status,
      description: draft.description.trim() || undefined,
      contact_email: draft.contactEmail.trim() || undefined,
      document_url: draft.documentUrl.trim() || undefined,
      source: `${state} State Government`,
      publisher_type: "govt",
    };

    setSaving(true);
    try {
      await apiFetch("/api/tenders", { method: "POST", body: JSON.stringify(row) });

      toast.success(draft.id && !isSeed ? "Tender updated." : "Tender published.");
      setDraft(null);
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save tender.");
    } finally {
      setSaving(false);
    }
  };
  const onDelete = async (row: TenderRow) => {
    if (row.id.startsWith("seed-")) {
      toast.error("Catalogue samples cannot be deleted — publish your own tender instead.");
      return;
    }
    if (!window.confirm(`Remove "${row.title}"?`)) return;
    try {
      await apiFetch(`/api/tenders/${encodeURIComponent(row.id)}`, {
        method: "DELETE",
      });
      toast.success("Tender removed.");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove tender.");
    }
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
        <p className="text-sm text-slate">Loading tenders…</p>
      ) : tenders.length ? (
        <div className="overflow-hidden rounded-2xl border border-navy/8">
          <table className="w-full min-w-[48rem] text-left text-sm">
            <thead className="bg-navy/[0.02] text-xs uppercase tracking-wide text-slate">
              <tr>
                <th className="px-4 py-3 font-semibold">Tender</th>
                <th className="px-4 py-3 font-semibold">Sector</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Deadline</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/8 bg-white">
              {tenders.map((row) => (
                <tr key={row.id}>
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-semibold text-navy">{row.title}</p>
                    <p className="truncate text-xs text-slate">
                      {row.reference ?? "No reference"} · {row.mda ?? state}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate">{row.sector ?? "—"}</td>
                  <td className="px-4 py-3 text-slate">
                    {row.value ? formatNaira(Number(row.value)) : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate">
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
                        className="rounded-lg p-2 text-slate hover:bg-navy/[0.04] hover:text-navy"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(row)}
                        title="Delete"
                        className="rounded-lg p-2 text-slate hover:bg-red-50 hover:text-red-600"
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

            <div className="flex justify-end gap-3 border-t border-navy/8 pt-4">
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
