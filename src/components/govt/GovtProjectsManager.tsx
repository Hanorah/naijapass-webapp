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
import { apiFetch, isApiConfigured } from "@/lib/api/client";
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

/** Body for POST /api/projects. The API rejects nulls, so empty values are omitted. */
function projectPayload(project: LiveProject, overrides: Record<string, unknown> = {}) {
  return {
    id: project.id,
    title: project.title,
    category: project.category,
    description: project.description || undefined,
    budget_ngn: project.budgetNgn || undefined,
    budget_label: project.budgetLabel || undefined,
    state: project.state,
    lga: project.lga || undefined,
    status: project.status,
    contractor: project.contractor || undefined,
    completion: project.completion || undefined,
    featured: project.featured,
    era: project.era,
    supervising_agency: project.supervisingAgency || undefined,
    source_title: project.sourceTitle || undefined,
    source_url: project.sourceUrl || undefined,
    image_url: project.imageUrl || undefined,
    notes: project.notes || undefined,
    start_date: project.startDate || undefined,
    expected_completion: project.expectedCompletion || undefined,
    review_status: project.reviewStatus,
    published: project.reviewStatus === "published",
    ...overrides,
  };
}

export default function GovtProjectsManager() {
  const { user } = useSession();
  const state = user?.govtState ?? user?.state ?? "";

  const { projects, reload } = useProjects({ state, includeDrafts: true });
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
    if (!isApiConfigured()) {
      toast.error("Connect the API (NEXT_PUBLIC_API_URL) before publishing. See .env.example.");
      return;
    }

    const budget = Number(draft.budgetNgn.replace(/[^\d]/g, "")) || 0;
    const title = draft.title.trim();
    const row = {
      id: draft.id ?? buildProjectId(state, draft.title),
      title,
      category: draft.category,
      description: draft.description.trim() || undefined,
      budget_ngn: budget || undefined,
      budget_label: formatBudgetLabel(budget),
      state,
      lga: draft.lga.trim(),
      status: draft.status,
      contractor: draft.contractor.trim() || undefined,
      completion: draft.completion.trim() || undefined,
      supervising_agency: draft.supervisingAgency.trim() || undefined,
      source_title: draft.sourceTitle.trim() || undefined,
      source_url: draft.sourceUrl.trim() || undefined,
      image_url: draft.imageUrl.trim() || undefined,
      start_date: draft.startDate || undefined,
      expected_completion: draft.expectedCompletion || undefined,
      review_status: draft.reviewStatus,
      published: draft.reviewStatus === "published",
    };

    setSaving(true);
    try {
      await apiFetch("/api/projects", { method: "POST", body: JSON.stringify(row) });

      toast.success(
        draft.reviewStatus === "published"
          ? `${title} is now live for citizens.`
          : `${title} saved as a draft.`,
      );
      setDraft(null);
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save project.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (project: LiveProject) => {
    if (!isApiConfigured()) {
      toast.error("Connect the API first.");
      return;
    }
    if (!window.confirm(`Delete "${project.title}"? This permanently removes it.`)) {
      return;
    }

    try {
      await apiFetch(`/api/projects/${encodeURIComponent(project.id)}`, {
        method: "DELETE",
      });
      toast.success("Project removed.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not remove project.");
    }
  };

  const onToggleVisibility = async (project: LiveProject) => {
    if (!isApiConfigured()) {
      toast.error("Connect the API first.");
      return;
    }
    const next: ReviewStatus = project.reviewStatus === "published" ? "draft" : "published";
    try {
      await apiFetch("/api/projects", {
        method: "POST",
        body: JSON.stringify(
          projectPayload(project, { review_status: next, published: next === "published" }),
        ),
      });
      toast.success(next === "published" ? "Published to citizens." : "Hidden from citizens.");
      await reload();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update project.");
    }
  };
  return (
    <div className="space-y-6">
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
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate/60" />
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
        <span className="text-xs text-slate">
          {visible.length} of {projects.length}
        </span>
      </Panel>

      {visible.length ? (
        <div className="overflow-hidden rounded-2xl border border-navy/8">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="bg-navy/[0.02] text-xs uppercase tracking-wide text-slate">
              <tr>
                <th className="px-4 py-3 font-semibold">Project</th>
                <th className="px-4 py-3 font-semibold">LGA</th>
                <th className="px-4 py-3 font-semibold">Budget</th>
                <th className="px-4 py-3 font-semibold">Contractor</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Visibility</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy/8 bg-white">
              {visible.map((project) => (
                <tr key={project.id} className="align-middle">
                  <td className="max-w-xs px-4 py-3">
                    <p className="truncate font-semibold text-navy">
                      {project.title}
                    </p>
                    <p className="truncate text-xs text-slate">
                      {project.id} · {project.category}
                      {project.supervisingAgency
                        ? ` · ${project.supervisingAgency}`
                        : ""}
                      {project.completion ? ` · ${project.completion}% done` : ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-slate">{project.lga || "—"}</td>
                  <td className="px-4 py-3 text-slate">{project.budgetLabel}</td>
                  <td className="max-w-[10rem] truncate px-4 py-3 text-slate">
                    {project.contractor || "—"}
                  </td>
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
                        className="rounded-lg p-2 text-slate hover:bg-navy/[0.04] hover:text-navy"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDraft(draftFrom(project))}
                        title="Edit"
                        className="rounded-lg p-2 text-slate hover:bg-navy/[0.04] hover:text-navy"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void onDelete(project)}
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

            <div className="flex justify-end gap-3 border-t border-navy/8 pt-4">
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
