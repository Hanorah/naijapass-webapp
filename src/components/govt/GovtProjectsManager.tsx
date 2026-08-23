"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ExternalLink, Pencil, Plus, Search, Trash2 } from "lucide-react";
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
import { useProjects } from "@/lib/db/projects";
import {
  PROJECT_CATEGORIES,
  PROJECT_STATUSES,
  buildProjectId,
  formatBudgetLabel,
  type LiveProject,
  type ReviewStatus,
} from "@/lib/db/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { projectDetailPath } from "@/data/projects";

type Draft = {
  id: string | null;
  title: string;
  category: string;
  description: string;
  budgetNgn: string;
  lga: string;
  status: string;
  contractor: string;
  supervisingAgency: string;
  completion: string;
  startDate: string;
  expectedCompletion: string;
  sourceTitle: string;
  sourceUrl: string;
  imageUrl: string;
  reviewStatus: ReviewStatus;
};

function emptyDraft(): Draft {
  return {
    id: null,
    title: "",
    category: "Transport",
    description: "",
    budgetNgn: "",
    lga: "",
    status: "In Progress",
    contractor: "",
    supervisingAgency: "",
    completion: "",
    startDate: "",
    expectedCompletion: "",
    sourceTitle: "",
    sourceUrl: "",
    imageUrl: "",
    reviewStatus: "published",
  };
}

function draftFrom(project: LiveProject): Draft {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    description: project.description,
    budgetNgn: project.budgetNgn ? String(project.budgetNgn) : "",
    lga: project.lga,
    status: project.status,
    contractor: project.contractor,
    supervisingAgency: project.supervisingAgency,
    completion: project.completion ?? "",
    startDate: project.startDate ?? "",
    expectedCompletion: project.expectedCompletion ?? "",
    sourceTitle: project.sourceTitle ?? "",
    sourceUrl: project.sourceUrl ?? "",
    imageUrl: project.imageUrl ?? "",
    reviewStatus: project.reviewStatus,
  };
}

export default function GovtProjectsManager() {
  const { user, live } = useSession();
  const state = user?.govtState ?? user?.state ?? "";

  const { projects, reload, source } = useProjects({ state, includeDrafts: true });
  const [draft, setDraft] = useState<Draft | null>(null);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return projects.filter((project) => {
      if (statusFilter !== "All" && project.status !== statusFilter) return false;
      if (!needle) return true;
      return (
        project.title.toLowerCase().includes(needle) ||
        project.lga.toLowerCase().includes(needle) ||
        project.contractor.toLowerCase().includes(needle) ||
        project.id.toLowerCase().includes(needle)
      );
    });
  }, [projects, query, statusFilter]);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((curr) => (curr ? { ...curr, [key]: value } : curr));

  const onSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;

    if (!draft.title.trim()) {
      toast.error("Give the project a title.");
      return;
    }
    if (!draft.lga.trim()) {
      toast.error("Enter the LGA this project sits in.");
      return;
    }
    if (!isSupabaseConfigured()) {
      toast.error("Connect a Supabase database before publishing. See .env.example.");
      return;
    }

    const budget = Number(draft.budgetNgn.replace(/[^\d]/g, "")) || 0;
    const row = {
      id: draft.id ?? buildProjectId(state, draft.title),
      title: draft.title.trim(),
      category: draft.category,
      description: draft.description.trim(),
      budget_ngn: budget,
      budget_label: formatBudgetLabel(budget),
      state,
      lga: draft.lga.trim(),
      status: draft.status,
      contractor: draft.contractor.trim(),
      completion: draft.completion.trim() || null,
      supervising_agency: draft.supervisingAgency.trim(),
      source_title: draft.sourceTitle.trim() || null,
      source_url: draft.sourceUrl.trim() || null,
      image_url: draft.imageUrl.trim() || null,
      start_date: draft.startDate || null,
      expected_completion: draft.expectedCompletion || null,
      review_status: draft.reviewStatus,
      published: draft.reviewStatus === "published",
      submitted_by: user?.id ?? null,
    };

    setSaving(true);
    try {
      const supabase = createClient();
      const { error } = draft.id
        ? await supabase.from("projects").update(row).eq("id", draft.id)
        : await supabase.from("projects").insert(row);

      if (error) {
        toast.error(
          /row-level security/i.test(error.message)
            ? `Your account is not authorised to publish for ${state}.`
            : error.message,
        );
        return;
      }

      toast.success(
        draft.reviewStatus === "published"
          ? `${row.title} is now live for citizens.`
          : `${row.title} saved as a draft.`,
      );
      setDraft(null);
      await reload();
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (project: LiveProject) => {
    if (!isSupabaseConfigured()) {
      toast.error("Connect a Supabase database first.");
      return;
    }
    if (!window.confirm(`Remove "${project.title}" permanently?`)) return;

    const supabase = createClient();
    const { error } = await supabase.from("projects").delete().eq("id", project.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Project removed.");
    await reload();
  };

  const onToggleVisibility = async (project: LiveProject) => {
    if (!isSupabaseConfigured()) {
      toast.error("Connect a Supabase database first.");
      return;
    }
    const next: ReviewStatus = project.reviewStatus === "published" ? "draft" : "published";
    const supabase = createClient();
    const { error } = await supabase
      .from("projects")
      .update({ review_status: next, published: next === "published" })
      .eq("id", project.id);

    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(next === "published" ? "Published to citizens." : "Hidden from citizens.");
    await reload();
  };

  return (
    <div className="space-y-6">
      {!live ? <OfflineNotice /> : null}

      <PageHeader
        title="Projects"
        description={`Every project you publish appears on the public map and in ${state || "your state"}'s project explorer within seconds.`}
        action={
          <PrimaryButton onClick={() => setDraft(emptyDraft())}>
            <Plus className="h-4 w-4" />
            New project
          </PrimaryButton>
        }
      />

      <Panel className="flex flex-wrap items-center gap-3">
        <span className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, LGA, contractor or ID"
            className={`${fieldClass} pl-9`}
          />
        </span>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={`${selectClass} w-auto`}
        >
          <option value="All">All statuses</option>
          {PROJECT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <span className="text-xs text-white/35">
          {visible.length} of {projects.length}
        </span>
      </Panel>

      {source === "seed" && live ? (
        <p className="text-xs text-white/35">
          These are bundled sample projects. The first project you publish is
          written to your database and replaces this preview.
        </p>
      ) : null}

      {visible.length ? (
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-wide text-white/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">LGA</th>
                <th className="px-4 py-3 font-semibold">Budget</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Visibility</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/8 bg-[#0e1628]">
              {visible.map((project) => (
                <tr key={project.id} className="align-middle">
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-semibold text-white/90">
                      {project.title}
                    </p>
                    <p className="truncate text-xs text-white/35">
                      {project.id} · {project.category}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-white/60">{project.lga || "—"}</td>
                  <td className="px-4 py-3 text-white/60">{project.budgetLabel}</td>
                  <td className="px-4 py-3">
                    <Pill
                      tone={
                        project.status === "Completed"
                          ? "green"
                          : project.status === "Stalled"
                            ? "red"
                            : project.status === "Planned"
                              ? "slate"
                              : "blue"
                      }
                    >
                      {project.status}
                    </Pill>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => void onToggleVisibility(project)}
                      title="Toggle public visibility"
                    >
                      <Pill tone={project.reviewStatus === "published" ? "green" : "amber"}>
                        {project.reviewStatus === "published" ? "Live" : "Draft"}
                      </Pill>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={projectDetailPath(project.id)}
                        target="_blank"
                        title="View public page"
                        className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDraft(draftFrom(project))}
                        title="Edit"
                        className="rounded-lg p-2 text-white/40 hover:bg-white/5 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(project)}
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
          title={query || statusFilter !== "All" ? "Nothing matches that filter" : "No projects yet"}
          body={
            query || statusFilter !== "All"
              ? "Try a different search term or clear the status filter."
              : `Publish your first ${state} project — title, budget, LGA and contractor is enough to get started.`
          }
          action={
            <PrimaryButton onClick={() => setDraft(emptyDraft())}>
              <Plus className="h-4 w-4" />
              New project
            </PrimaryButton>
          }
        />
      )}

      {draft ? (
        <Modal
          wide
          title={draft.id ? "Edit project" : `New ${state} project`}
          onClose={() => setDraft(null)}
        >
          <form onSubmit={onSave} className="space-y-4">
            <Field label="Project title">
              <input
                value={draft.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Ikorodu–Sagamu Road Rehabilitation"
                className={fieldClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select
                  value={draft.category}
                  onChange={(e) => set("category", e.target.value)}
                  className={selectClass}
                >
                  {PROJECT_CATEGORIES.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </Field>
              <Field label="Local government area">
                <input
                  value={draft.lga}
                  onChange={(e) => set("lga", e.target.value)}
                  placeholder="e.g. Ikorodu"
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field
              label="Budget (₦)"
              hint={
                draft.budgetNgn
                  ? `Displays as ${formatBudgetLabel(Number(draft.budgetNgn.replace(/[^\d]/g, "")) || 0)}`
                  : "Digits only — 2500000000 for ₦2.5 billion."
              }
            >
              <input
                value={draft.budgetNgn}
                onChange={(e) => set("budgetNgn", e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                placeholder="2500000000"
                className={fieldClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contractor">
                <input
                  value={draft.contractor}
                  onChange={(e) => set("contractor", e.target.value)}
                  placeholder="e.g. Julius Berger Nigeria Plc"
                  className={fieldClass}
                />
              </Field>
              <Field label="Supervising agency">
                <input
                  value={draft.supervisingAgency}
                  onChange={(e) => set("supervisingAgency", e.target.value)}
                  placeholder={`e.g. ${state} Ministry of Works`}
                  className={fieldClass}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Status">
                <select
                  value={draft.status}
                  onChange={(e) => set("status", e.target.value)}
                  className={selectClass}
                >
                  {PROJECT_STATUSES.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </Field>
              <Field label="Start date">
                <input
                  type="date"
                  value={draft.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className={fieldClass}
                />
              </Field>
              <Field label="Expected completion">
                <input
                  type="date"
                  value={draft.expectedCompletion}
                  onChange={(e) => set("expectedCompletion", e.target.value)}
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field label="Description" hint="What is being built, and who benefits.">
              <textarea
                value={draft.description}
                onChange={(e) => set("description", e.target.value)}
                rows={4}
                placeholder="Dualisation of 12.4km of the Ikorodu–Sagamu corridor including drainage and street lighting…"
                className={fieldClass}
              />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Source title" hint="Where a citizen can verify this.">
                <input
                  value={draft.sourceTitle}
                  onChange={(e) => set("sourceTitle", e.target.value)}
                  placeholder="e.g. 2026 Approved Budget, page 214"
                  className={fieldClass}
                />
              </Field>
              <Field label="Source URL">
                <input
                  value={draft.sourceUrl}
                  onChange={(e) => set("sourceUrl", e.target.value)}
                  placeholder="https://budget.lagosstate.gov.ng/…"
                  className={fieldClass}
                />
              </Field>
            </div>

            <Field label="Visibility">
              <select
                value={draft.reviewStatus}
                onChange={(e) => set("reviewStatus", e.target.value as ReviewStatus)}
                className={selectClass}
              >
                <option value="published">Published — visible to everyone</option>
                <option value="draft">Draft — only your office can see it</option>
                <option value="archived">Archived — retired from the portal</option>
              </select>
            </Field>

            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
              <GhostButton onClick={() => setDraft(null)}>Cancel</GhostButton>
              <PrimaryButton type="submit" disabled={saving}>
                {saving
                  ? "Saving…"
                  : draft.reviewStatus === "published"
                    ? "Publish project"
                    : "Save draft"}
              </PrimaryButton>
            </div>
          </form>
        </Modal>
      ) : null}
    </div>
  );
}
