"use client";

import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import {
  EmptyState,
  Field,
  GhostButton,
  Modal,
  OfflineNotice,
  PageHeader,
  Panel,
  Pill,
  PrimaryButton,
  fieldClass,
  selectClass,
} from "@/components/govt/ui";
import { useStateContent } from "@/lib/db/stateContent";
import {
  STATE_CONTENT_LABELS,
  STATE_CONTENT_TYPES,
  type StateContentRow,
  type StateContentType,
} from "@/lib/db/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

const TYPE_HELP: Record<StateContentType, string> = {
  announcement: "Timely news from the governor's office or an MDA.",
  notice: "Public notices — road closures, deadlines, levies, disruptions.",
  law: "State laws and by-laws citizens and businesses must comply with.",
  order: "Executive orders issued by the governor.",
  mda: "A ministry, department or agency with its public contact details.",
  emergency: "Emergency numbers — police, fire, ambulance, disaster response.",
  service: "A citizen service and how to access it.",
};

type Draft = {
  id: string | null;
  type: StateContentType;
  title: string;
  body: string;
  contact: string;
  phone: string;
  url: string;
  category: string;
  effectiveDate: string;
  published: boolean;
};

function emptyDraft(): Draft {
  return {
    id: null,
    type: "announcement",
    title: "",
    body: "",
    contact: "",
    phone: "",
    url: "",
    category: "",
    effectiveDate: "",
    published: true,
  };
}

function draftFrom(row: StateContentRow): Draft {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body ?? "",
    contact: row.contact ?? "",
    phone: row.phone ?? "",
    url: row.url ?? "",
    category: row.category ?? "",
    effectiveDate: row.effective_date ?? "",
    published: row.published,
  };
}

export default function GovtUpdatesManager() {
  const { user, live } = useSession();
  const state = user?.govtState ?? user?.state ?? "";

  const { items, loading, reload } = useStateContent({
    state,
    includeUnpublished: true,
  });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<"all" | StateContentType>("all");

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.type === filter)),
    [items, filter],
  );

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.type, (map.get(item.type) ?? 0) + 1);
    return map;
  }, [items]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((curr) => (curr ? { ...curr, [key]: value } : curr));

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    if (!draft.title.trim()) {
      toast.error("Give this entry a title.");
      return;
    }
    if (!isSupabaseConfigured()) {
      toast.error("Connect a Supabase database before publishing. See SETUP.md.");
      return;
    }

    const row = {
      state,
      type: draft.type,
      title: draft.title.trim(),
      body: draft.body.trim() || null,
      contact: draft.contact.trim() || null,
      phone: draft.phone.trim() || null,
      url: draft.url.trim() || null,
      category: draft.category.trim() || null,
      effective_date: draft.effectiveDate || null,
      published: draft.published,
      submitted_by: user?.id ?? null,
    };

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = draft.id
        ? await supabase.from("state_content").update(row).eq("id", draft.id)
        : await supabase.from("state_content").insert(row);

      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success(draft.published ? "Published to the State Hub." : "Saved as unpublished.");
      setDraft(null);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const onTogglePublished = async (row: StateContentRow) => {
    const supabase = createClient();
    const { error } = await supabase
      .from("state_content")
      .update({ published: !row.published })
      .eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    await reload();
  };

  const onDelete = async (row: StateContentRow) => {
    if (!window.confirm(`Remove "${row.title}"?`)) return;
    const supabase = createClient();
    const { error } = await supabase.from("state_content").delete().eq("id", row.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Removed.");
    await reload();
  };

  return (
    <div className="space-y-6">
      {!live ? <OfflineNotice /> : null}

      <PageHeader
        title="Notices & Laws"
        description={`Everything here feeds the ${state || "state"} page of the State Hub that citizens and businesses browse.`}
        action={
          <PrimaryButton onClick={() => setDraft(emptyDraft())}>
            <Plus className="h-4 w-4" />
            New entry
          </PrimaryButton>
        }
      />

      <Panel className="flex flex-wrap gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`All (${items.length})`}
        />
        {STATE_CONTENT_TYPES.map((type) => (
          <FilterChip
            key={type}
            active={filter === type}
            onClick={() => setFilter(type)}
            label={`${STATE_CONTENT_LABELS[type]} (${counts.get(type) ?? 0})`}
          />
        ))}
      </Panel>

      {loading ? (
        <p className="text-sm text-white/40">Loading…</p>
      ) : visible.length ? (
        <ul className="space-y-2">
          {visible.map((row) => (
            <li
              key={row.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/10 bg-[#0e1628] px-4 py-3.5"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="blue">{STATE_CONTENT_LABELS[row.type]}</Pill>
                  {!row.published ? <Pill tone="amber">Unpublished</Pill> : null}
                  {row.category ? (
                    <span className="text-xs text-white/35">{row.category}</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold text-white/90">{row.title}</p>
                {row.body ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-white/45">
                    {row.body}
                  </p>
                ) : null}
                {row.phone || row.contact ? (
                  <p className="mt-1.5 text-xs text-white/35">
                    {[row.contact, row.phone].filter(Boolean).join(" · ")}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => void onTogglePublished(row)}
                  title={row.published ? "Hide from citizens" : "Publish"}
                  className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
                >
                  {row.published ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>
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
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title={filter === "all" ? "Nothing published yet" : "Nothing of that type yet"}
          body={`Add ${state || "your state"}'s emergency numbers, ministry contacts and public notices so citizens stop guessing.`}
          action={
            <PrimaryButton onClick={() => setDraft(emptyDraft())}>
              <Plus className="h-4 w-4" />
              New entry
            </PrimaryButton>
          }
        />
      )}

      {draft ? (
        <Modal
          title={draft.id ? "Edit entry" : `New ${state} entry`}
          onClose={() => setDraft(null)}
        >
          <form onSubmit={onSave} className="space-y-4">
            <Field label="Type" hint={TYPE_HELP[draft.type]}>
              <select
                value={draft.type}
                onChange={(e) => set("type", e.target.value as StateContentType)}
                className={selectClass}
              >
                {STATE_CONTENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {STATE_CONTENT_LABELS[type]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Title">
              <input
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder={
                  draft.type === "emergency"
                    ? "State Fire Service"
                    : draft.type === "mda"
                      ? "Ministry of Physical Planning"
                      : "e.g. Land Use Charge deadline extended"
                }
                className={fieldClass}
              />
            </Field>

            <Field label="Details">
              <textarea
                value={draft.body}
                onChange={(e) => set("body", e.target.value)}
                rows={4}
                placeholder="What citizens and businesses need to know."
                className={fieldClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact person or office">
                <input
                  value={draft.contact}
                  onChange={(e) => set("contact", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Phone">
                <input
                  value={draft.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="0803 000 0000"
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Link">
                <input
                  value={draft.url}
                  onChange={(e) => set("url", e.target.value)}
                  placeholder="https://…"
                  className={fieldClass}
                />
              </Field>
              <Field label="Category" hint="Free text — Finance, Land, Health…">
                <input
                  value={draft.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field label="Effective date">
              <input
                type="date"
                value={draft.effectiveDate}
                onChange={(e) => set("effectiveDate", e.target.value)}
                className={fieldClass}
              />
            </Field>

            <label className="flex items-center gap-2.5 text-sm text-white/70">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(e) => set("published", e.target.checked)}
                className="accent-emerald-500"
              />
              Visible to citizens and businesses
            </label>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <GhostButton onClick={() => setDraft(null)}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={saving}>
                {saving ? "Saving…" : draft.id ? "Save changes" : "Publish"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
        active
          ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
          : "border-white/10 text-white/50 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}
