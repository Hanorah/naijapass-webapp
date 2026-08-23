import type { AdminEra, Project, ProjectStatus } from "@/data/projects";

export const PROJECT_STATUSES: ProjectStatus[] = [
  "Planned",
  "In Progress",
  "Completed",
  "Stalled",
];

export const PROJECT_CATEGORIES = [
  "Transport",
  "Health",
  "Education",
  "Energy",
  "Water",
  "Housing",
  "Agriculture",
  "Security",
  "Environment",
  "ICT",
  "Other",
];

export const REVIEW_STATUSES = ["draft", "published", "archived"] as const;
export type ReviewStatus = (typeof REVIEW_STATUSES)[number];

/** A row of public.projects. */
export type ProjectRow = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  budget_ngn: number | null;
  budget_label: string | null;
  state: string;
  lga: string | null;
  status: string;
  contractor: string | null;
  completion: string | null;
  reports_count: number | null;
  featured: boolean | null;
  era: string | null;
  supervising_agency: string | null;
  source_title: string | null;
  source_url: string | null;
  image_url: string | null;
  notes: string | null;
  published: boolean;
  review_status: ReviewStatus;
  start_date: string | null;
  expected_completion: string | null;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
};

export const PROJECT_COLUMNS =
  "id, title, category, description, budget_ngn, budget_label, state, lga, status, contractor, completion, reports_count, featured, era, supervising_agency, source_title, source_url, image_url, notes, published, review_status, start_date, expected_completion, submitted_by, created_at, updated_at";

/** A project as the rest of the app expects it, plus the authoring fields. */
export type LiveProject = Project & {
  published: boolean;
  reviewStatus: ReviewStatus;
  sourceTitle?: string;
  sourceUrl?: string;
  imageUrl?: string;
  notes?: string;
  startDate?: string;
  expectedCompletion?: string;
  updatedAt?: string;
};

function asStatus(value: string): ProjectStatus {
  return (PROJECT_STATUSES as string[]).includes(value)
    ? (value as ProjectStatus)
    : "In Progress";
}

function asEra(value: string | null): AdminEra {
  return value === "previous" || value === "legacy" ? value : "current";
}

export function rowToProject(row: ProjectRow): LiveProject {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    description: row.description ?? "",
    budgetNgn: Number(row.budget_ngn ?? 0),
    budgetLabel: row.budget_label ?? formatBudgetLabel(Number(row.budget_ngn ?? 0)),
    state: row.state,
    lga: row.lga ?? "",
    status: asStatus(row.status),
    contractor: row.contractor ?? "",
    completion: row.completion ?? undefined,
    reports: row.reports_count ?? 0,
    featured: row.featured ?? false,
    era: asEra(row.era),
    supervisingAgency: row.supervising_agency ?? "",
    published: row.published,
    reviewStatus: row.review_status,
    sourceTitle: row.source_title ?? undefined,
    sourceUrl: row.source_url ?? undefined,
    imageUrl: row.image_url ?? undefined,
    notes: row.notes ?? undefined,
    startDate: row.start_date ?? undefined,
    expectedCompletion: row.expected_completion ?? undefined,
    updatedAt: row.updated_at,
  };
}

/** ₦366,000,000 → "₦366M". Keeps generated and hand-entered budgets consistent. */
export function formatBudgetLabel(amount: number): string {
  if (!amount || amount <= 0) return "TBA";
  if (amount >= 1_000_000_000_000) return `₦${trim(amount / 1_000_000_000_000)}T`;
  if (amount >= 1_000_000_000) return `₦${trim(amount / 1_000_000_000)}B`;
  if (amount >= 1_000_000) return `₦${trim(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `₦${trim(amount / 1_000)}K`;
  return `₦${amount}`;
}

function trim(value: number) {
  return Number(value.toFixed(value < 10 ? 1 : 0)).toString();
}

/** Turns "Kano" + "Bus Rapid Transit" into a stable, readable project id. */
export function buildProjectId(state: string, title: string): string {
  const statePart = state.replace(/[^A-Za-z]/g, "").slice(0, 3).toUpperCase();
  const titlePart = title
    .replace(/[^A-Za-z0-9\s]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 6)
    .toUpperCase();
  const suffix = Date.now().toString(36).slice(-4).toUpperCase();
  return `NP-${statePart || "NGA"}-${titlePart || "PRJ"}${suffix}`;
}

// ─── State content ─────────────────────────────────────────

export const STATE_CONTENT_TYPES = [
  "announcement",
  "notice",
  "law",
  "order",
  "mda",
  "emergency",
  "service",
] as const;
export type StateContentType = (typeof STATE_CONTENT_TYPES)[number];

export const STATE_CONTENT_LABELS: Record<StateContentType, string> = {
  announcement: "Announcement",
  notice: "Public notice",
  law: "Law",
  order: "Executive order",
  mda: "Ministry / agency",
  emergency: "Emergency contact",
  service: "Citizen service",
};

export type StateContentRow = {
  id: string;
  state: string;
  type: StateContentType;
  title: string;
  body: string | null;
  contact: string | null;
  phone: string | null;
  url: string | null;
  category: string | null;
  effective_date: string | null;
  published: boolean;
  submitted_by: string | null;
  created_at: string;
  updated_at: string;
};

export const STATE_CONTENT_COLUMNS =
  "id, state, type, title, body, contact, phone, url, category, effective_date, published, submitted_by, created_at, updated_at";

// ─── Tenders ───────────────────────────────────────────────

export const TENDER_STATUSES = ["open", "closed", "awarded", "cancelled"] as const;
export type TenderStatus = (typeof TENDER_STATUSES)[number];

export type TenderRow = {
  id: string;
  title: string;
  reference: string | null;
  mda: string | null;
  state: string | null;
  sector: string | null;
  value: number | null;
  currency: string;
  deadline: string | null;
  status: TenderStatus;
  description: string | null;
  source: string | null;
  published_at: string | null;
  lga: string | null;
  contact_email: string | null;
  document_url: string | null;
  submitted_by: string | null;
  created_at: string;
};

export const TENDER_COLUMNS =
  "id, title, reference, mda, state, sector, value, currency, deadline, status, description, source, published_at, lga, contact_email, document_url, submitted_by, created_at";

// ─── Citizen feedback ──────────────────────────────────────

export type FeedbackRow = {
  id: string;
  project_id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  rating: number;
  topic: string | null;
  body: string;
  visibility: "public" | "hidden";
  created_at: string;
};

export const FEEDBACK_COLUMNS =
  "id, project_id, user_id, user_name, user_email, rating, topic, body, visibility, created_at";
