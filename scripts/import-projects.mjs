import fs from "fs";
import path from "path";

const ROOT = path.resolve(import.meta.dirname, "..");
const TEXT_PATH = path.join(ROOT, "public/text");

const STATUSES = new Set(["In Progress", "Completed", "Planned", "Stalled"]);
const PROJECT_LINE = /^NP-[A-Z]{3}-[A-Z0-9]+\t/;
const REPORT_LINE = /^NP-[A-Z]{3}-[A-Z0-9]+-\d{3}\t/;

function isProjectLine(line) {
  if (!PROJECT_LINE.test(line)) return false;
  const id = line.split("\t")[0]?.trim() ?? "";
  return !/-\d{3}$/.test(id);
}

const STATE_CODES = {
  ABI: "Abia",
  ADA: "Adamawa",
  AKW: "Akwa Ibom",
  ANA: "Anambra",
  BAU: "Bauchi",
  BAY: "Bayelsa",
  BEN: "Benue",
  BOR: "Borno",
  CRS: "Cross River",
  DEL: "Delta",
  EBO: "Ebonyi",
  EDO: "Edo",
  EKI: "Ekiti",
  ENU: "Enugu",
  FCT: "FCT",
  GOM: "Gombe",
  IMO: "Imo",
  JIG: "Jigawa",
  KAD: "Kaduna",
  KAN: "Kano",
  KAT: "Katsina",
  KEB: "Kebbi",
  KOG: "Kogi",
  KWA: "Kwara",
  LAG: "Lagos",
  NAS: "Nasarawa",
  NIG: "Niger",
  OGN: "Ogun",
  OND: "Ondo",
  OSU: "Osun",
  OYO: "Oyo",
  PLA: "Plateau",
  RIV: "Rivers",
  SOK: "Sokoto",
  TAR: "Taraba",
  YOB: "Yobe",
  ZAM: "Zamfara",
};

function inferCategory(title) {
  const t = title.toLowerCase();
  if (/\b(rail|train)\b/.test(t)) return "Rail";
  if (/\b(port|seaport|dry port|icd|inland river port)\b/.test(t)) return "Ports";
  if (/\b(airport|runway)\b/.test(t)) return "Facilities";
  if (/\b(hospital|medical|oncology|health|infectious)\b/.test(t)) return "Health";
  if (/\b(water|reticulation|irrigation)\b/.test(t) && !/hydropower|power plant/.test(t))
    return "Water";
  if (/\b(dam)\b/.test(t) && !/hydropower/.test(t)) return "Water";
  if (/\b(school|university|subeb|smart school|college|plasu|oaustech|kwasu|cust)\b/.test(t))
    return "Education";
  if (/\b(hydro|hydropower|power station|electricity|solar|ipp|thermal|\d+mw)\b/.test(t))
    return "Energy";
  if (/\b(dam)\b/.test(t)) return "Energy";
  if (
    /\b(factory|industrial|mill|market|hub|garment|sugar|potato|rice|agri|plantation|ftz|steel|oil)\b/.test(
      t,
    )
  )
    return "Industry";
  if (/\b(cultural|arts|festival|tower.*cultural)\b/.test(t)) return "Culture";
  if (
    /\b(road|highway|expressway|flyover|bridge|bypass|carriageway|interchange|dual|corridor|palliative)\b/.test(
      t,
    )
  )
    return "Transport";
  if (/\b(housing|terminal|bus)\b/.test(t)) return "Public Works";
  return "Public Works";
}

function inferEra(budgetLabel) {
  if (/legacy/i.test(budgetLabel)) return "legacy";
  return "current";
}

function parseBudget(raw) {
  const budgetMatch = raw.match(/₦([\d,]+)/);
  const budgetNgn = budgetMatch ? Number.parseInt(budgetMatch[1].replace(/,/g, ""), 10) : 0;
  const labelMatch = raw.match(/\(([^)]+)\)/);
  const budgetLabel = labelMatch ? labelMatch[1] : budgetNgn > 0 ? `₦${budgetNgn}` : "TBA";
  return { budgetNgn, budgetLabel };
}

function parseJurisdiction(raw) {
  const match = raw.match(/^(.+?)\s*\((.+)\)$/);
  if (!match) return { state: raw.trim(), lga: "" };
  return { state: match[1].trim(), lga: match[2].trim() };
}

function nextNonEmpty(lines, start) {
  for (let i = start; i < lines.length; i++) {
    const value = lines[i].trim();
    if (value) return { value, index: i + 1 };
  }
  return { value: "", index: lines.length };
}

function parseProjects(text) {
  const lines = text.split(/\r?\n/);
  const projects = [];
  const reportSection = text.indexOf("Field Inspection Protocols");
  const stopAt = reportSection === -1 ? lines.length : text.slice(0, reportSection).split(/\r?\n/).length;

  for (let i = 0; i < stopAt; i++) {
    if (!isProjectLine(lines[i])) continue;

    const parts = lines[i].split("\t");
    const id = parts[0].trim();
    const title = parts[1]?.trim() ?? "";
    const jurisdiction = parts[2]?.trim() ?? "";
    const budgetRaw = parts[3]?.trim() ?? "";

    let cursor = i + 1;
    let status = parts[4]?.trim() ?? "";
    if (!STATUSES.has(status)) {
      const statusLine = nextNonEmpty(lines, cursor);
      status = STATUSES.has(statusLine.value) ? statusLine.value : "In Progress";
      cursor = statusLine.index;
    } else {
      cursor++;
    }

    while (cursor < stopAt && !lines[cursor].trim()) cursor++;
    const contractorLine = nextNonEmpty(lines, cursor);
    const contractor = contractorLine.value;
    cursor = contractorLine.index;

    while (cursor < stopAt && !lines[cursor].trim()) cursor++;
    const agencyLine = nextNonEmpty(lines, cursor);
    const supervisingAgency = agencyLine.value;
    cursor = agencyLine.index;

    while (cursor < stopAt && !lines[cursor].trim()) cursor++;
    const sourceLine = nextNonEmpty(lines, cursor);
    const sourceTitle = sourceLine.value;
    i = sourceLine.index;

    const { state, lga } = parseJurisdiction(jurisdiction);
    const { budgetNgn, budgetLabel } = parseBudget(budgetRaw);
    const stateCode = id.split("-")[1];
    const normalizedState = STATE_CODES[stateCode] ?? state;

    projects.push({
      id,
      title,
      category: inferCategory(title),
      state: normalizedState,
      lga,
      budgetNgn,
      budgetLabel,
      status,
      contractor,
      supervisingAgency,
      sourceTitle,
      era: inferEra(budgetLabel),
    });
  }

  return projects;
}

function parseFieldReports(text) {
  const lines = text.split(/\r?\n/);
  const reports = [];
  const startAt = lines.findIndex((line) => line.includes("Field Inspection Protocols"));
  if (startAt === -1) return reports;

  for (let i = startAt; i < lines.length; i++) {
    if (!REPORT_LINE.test(lines[i])) continue;

    const parts = lines[i].split("\t");
    const id = parts[0]?.trim() ?? "";
    const projectId = parts[1]?.trim() ?? "";
    const title = parts[2]?.trim() ?? "";
    const time = parts[3]?.trim() ?? "";

    const bodyLine = nextNonEmpty(lines, i + 1);
    const body = bodyLine.value;

    let cursor = bodyLine.index;
    while (cursor < lines.length && !lines[cursor].trim()) cursor++;

    const metaParts = (lines[cursor] ?? "").split("\t");
    const location = metaParts[0]?.trim() ?? "";
    const status = STATUSES.has(metaParts[1]?.trim() ?? "")
      ? metaParts[1].trim()
      : "In Progress";
    const author = metaParts[2]?.trim() ?? "";
    const likes = Number.parseInt(metaParts[3] ?? "0", 10) || 0;
    let image = metaParts[4]?.trim() ?? "";
    if (image.startsWith("upload.")) image = `https://${image}`;

    i = cursor;

    reports.push({
      id,
      projectId,
      title,
      time,
      body,
      location,
      status,
      author,
      likes,
      image: image || null,
    });
  }

  return reports;
}

function buildDescription(row) {
  const parts = [
    `${row.title} is a ${row.category.toLowerCase()} project in ${row.lga}, ${row.state}.`,
    `Contractor: ${row.contractor}.`,
  ];
  if (row.supervisingAgency && row.supervisingAgency !== row.contractor) {
    parts.push(`Supervising agency: ${row.supervisingAgency}.`);
  }
  parts.push(`Status: ${row.status}.`);
  if (row.sourceTitle) parts.push(`Source: ${row.sourceTitle}.`);
  return parts.join(" ");
}

function markFeatured(projects) {
  const byState = new Map();
  for (const project of projects) {
    if (!byState.has(project.state)) byState.set(project.state, []);
    byState.get(project.state).push(project);
  }

  for (const stateProjects of byState.values()) {
    const ranked = [...stateProjects].sort((a, b) => {
      const score = (p) => p.budgetNgn + (p.status === "In Progress" ? 1_000_000_000_000 : 0);
      return score(b) - score(a);
    });
    ranked.slice(0, 3).forEach((p) => {
      p.featured = true;
    });
  }
}

function attachReportCounts(projects, reports) {
  const likesByProject = new Map();
  for (const report of reports) {
    likesByProject.set(
      report.projectId,
      (likesByProject.get(report.projectId) ?? 0) + report.likes,
    );
  }

  for (const project of projects) {
    project.reports = likesByProject.get(project.id) ?? (project.status === "In Progress" ? 25 : 15);
  }
}

function esc(value) {
  return JSON.stringify(value ?? "");
}

function toProject(row) {
  const lines = [
    "  {",
    `    id: ${esc(row.id)},`,
    `    title: ${esc(row.title)},`,
    `    category: ${esc(row.category)},`,
    `    description: ${esc(buildDescription(row))},`,
    `    budgetNgn: ${row.budgetNgn},`,
    `    budgetLabel: ${esc(row.budgetLabel)},`,
    `    state: ${esc(row.state)},`,
    `    lga: ${esc(row.lga)},`,
    `    status: ${esc(row.status)},`,
    `    contractor: ${esc(row.contractor)},`,
    `    reports: ${row.reports},`,
  ];
  if (row.featured) lines.push("    featured: true,");
  lines.push(`    era: ${esc(row.era)},`);
  lines.push(`    supervisingAgency: ${esc(row.supervisingAgency)},`);
  lines.push("  }");
  return lines.join("\n");
}

function toReport(row) {
  const lines = [
    "  {",
    `    id: ${esc(row.id)},`,
    `    projectId: ${esc(row.projectId)},`,
    `    title: ${esc(row.title)},`,
    `    time: ${esc(row.time)},`,
    `    body: ${esc(row.body)},`,
    `    location: ${esc(row.location)},`,
    `    status: ${esc(row.status)},`,
    `    author: ${esc(row.author)},`,
    `    likes: ${row.likes},`,
  ];
  if (row.image) lines.push(`    image: ${esc(row.image)},`);
  lines.push("  }");
  return lines.join("\n");
}

const text = fs.readFileSync(TEXT_PATH, "utf8").replace(/^\uFEFF/, "");
const projects = parseProjects(text);
const fieldReports = parseFieldReports(text);

markFeatured(projects);
attachReportCounts(projects, fieldReports);

const projectsOutput = `export type ProjectStatus = "In Progress" | "Completed" | "Planned" | "Stalled";
export type AdminEra = "current" | "previous" | "legacy";

export type Project = {
  id: string;
  title: string;
  category: string;
  description: string;
  budgetNgn: number;
  budgetLabel: string;
  state: string;
  lga: string;
  status: ProjectStatus;
  contractor: string;
  completion?: string;
  reports: number;
  featured?: boolean;
  era: AdminEra;
  supervisingAgency: string;
};

/** Generated from public/text — run \`node scripts/import-projects.mjs\` to refresh. */
export const projects: Project[] = [
${projects.map(toProject).join(",\n")},
];

export const projectStates = [
  "All States",
  ...Array.from(new Set(projects.map((p) => p.state))).sort(),
];

export const lgasByState: Record<string, string[]> = projects.reduce(
  (acc, p) => {
    acc[p.state] = acc[p.state]
      ? Array.from(new Set([...acc[p.state], p.lga]))
      : [p.lga];
    return acc;
  },
  {} as Record<string, string[]>,
);

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}

export function projectDetailPath(id: string) {
  return \`/projects/\${encodeURIComponent(id)}\`;
}

export function projectFeedbackPath(id: string) {
  return \`/feedback?project=\${encodeURIComponent(id)}\`;
}

export function supervisingAgency(project: Project): string {
  return project.supervisingAgency;
}
`;

const sentimentProjects = [...new Set(fieldReports.map((r) => r.projectId))];

const feedbackOutput = `export type FieldReportStatus = "In Progress" | "Delayed" | "Completed" | "Planned";

export type FieldReport = {
  id: string;
  projectId: string;
  title: string;
  time: string;
  body: string;
  location: string;
  status: FieldReportStatus;
  author: string;
  likes: number;
  image?: string | null;
};

export type ProjectSentiment = {
  score: number;
  totalFeedbacks: number;
  positivePct: number;
  neutralPct: number;
  negativePct: number;
  topics: string[];
};

/** Generated from public/text — run \`node scripts/import-projects.mjs\` to refresh. */
const reports: FieldReport[] = [
${fieldReports.map(toReport).join(",\n")},
];

const sentimentByProject: Record<string, ProjectSentiment> = {
${sentimentProjects
  .map((projectId) => {
    const likes = fieldReports
      .filter((r) => r.projectId === projectId)
      .reduce((sum, r) => sum + r.likes, 0);
    return `  "${projectId}": {
    score: 4.1,
    totalFeedbacks: ${Math.max(likes * 3, 120)},
    positivePct: 70,
    neutralPct: 20,
    negativePct: 10,
    topics: ["Site Progress", "Contractor Performance", "Safety"],
  }`;
  })
  .join(",\n")}
};

const defaultSentiment: ProjectSentiment = {
  score: 4.0,
  totalFeedbacks: 120,
  positivePct: 68,
  neutralPct: 22,
  negativePct: 10,
  topics: ["Progress Updates", "Safety", "Contractor Performance"],
};

export function getReportsForProject(projectId: string): FieldReport[] {
  return reports.filter((r) => r.projectId === projectId);
}

export function getReportByTicket(ticketId: string): FieldReport | undefined {
  return reports.find((r) => r.id === ticketId.trim().toUpperCase());
}

export function getSentimentForProject(
  projectId: string,
  userEntries: { rating: number }[] = [],
): ProjectSentiment {
  const base = sentimentByProject[projectId] ?? defaultSentiment;
  if (!userEntries.length) return base;

  const ratings = userEntries.map((e) => e.rating);
  const userAvg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
  const positive = ratings.filter((r) => r >= 4).length;
  const neutral = ratings.filter((r) => r === 3).length;
  const negative = ratings.filter((r) => r <= 2).length;
  const total = ratings.length;
  const userPositivePct = Math.round((positive / total) * 100);
  const userNeutralPct = Math.round((neutral / total) * 100);
  const userNegativePct = Math.round((negative / total) * 100);

  const combinedTotal = base.totalFeedbacks + total;
  const combinedScore =
    (base.score * base.totalFeedbacks + userAvg * total) / combinedTotal;

  const topics = [
    ...new Set([
      ...base.topics,
      ...userEntries
        .map((e) => ("topic" in e && typeof e.topic === "string" ? e.topic : ""))
        .filter(Boolean),
    ]),
  ].slice(0, 5);

  return {
    score: Math.round(combinedScore * 10) / 10,
    totalFeedbacks: combinedTotal,
    positivePct: Math.round((base.positivePct * base.totalFeedbacks + userPositivePct * total) / combinedTotal),
    neutralPct: Math.round((base.neutralPct * base.totalFeedbacks + userNeutralPct * total) / combinedTotal),
    negativePct: Math.round((base.negativePct * base.totalFeedbacks + userNegativePct * total) / combinedTotal),
    topics: topics.length ? topics : base.topics,
  };
}

export function reportStatusClass(status: FieldReportStatus): string {
  if (status === "Delayed") return "bg-red-100 text-red-700";
  if (status === "Completed") return "bg-slate-200 text-navy-muted";
  if (status === "Planned") return "bg-sky-50 text-sky-800";
  return "bg-orange/15 text-orange";
}
`;

fs.writeFileSync(path.join(ROOT, "src/data/projects.ts"), projectsOutput);
fs.writeFileSync(path.join(ROOT, "src/data/projectFeedback.ts"), feedbackOutput);

function sqlStr(value) {
  if (value == null || value === "") return "NULL";
  return `'${String(value).replace(/'/g, "''")}'`;
}

const projectInserts = projects
  .map(
    (p) =>
      `  (${sqlStr(p.id)}, ${sqlStr(p.title)}, ${sqlStr(p.category)}, ${sqlStr(buildDescription(p))}, ${p.budgetNgn}, ${sqlStr(p.budgetLabel)}, ${sqlStr(p.state)}, ${sqlStr(p.lga)}, ${sqlStr(p.status)}, ${sqlStr(p.contractor)}, ${p.reports}, ${p.featured ? "true" : "false"}, ${sqlStr(p.era)}, ${sqlStr(p.supervisingAgency)}, ${sqlStr(p.sourceTitle)}, true)`,
  )
  .join(",\n");

const reportInserts = fieldReports
  .map(
    (r) =>
      `  (${sqlStr(r.id)}, ${sqlStr(r.projectId)}, ${sqlStr(r.title)}, ${sqlStr(r.time)}, ${sqlStr(r.body)}, ${sqlStr(r.location)}, ${sqlStr(r.status)}, ${sqlStr(r.author)}, ${r.likes}, ${sqlStr(r.image)}, true)`,
  )
  .join(",\n");

const seedSql = `-- ═══════════════════════════════════════════════════════════
-- NaijaPass seed — projects + field reports
-- Prerequisite: run schema.sql first
-- Generated by: node scripts/import-projects.mjs
-- ═══════════════════════════════════════════════════════════

truncate table public.field_reports cascade;
truncate table public.project_feedback cascade;
truncate table public.projects cascade;

insert into public.projects (
  id, title, category, description, budget_ngn, budget_label,
  state, lga, status, contractor, reports_count, featured, era,
  supervising_agency, source_title, published
) values
${projectInserts};

insert into public.field_reports (
  id, project_id, title, time_label, body, location, status,
  author, likes, image_url, verified
) values
${reportInserts};
`;

fs.writeFileSync(path.join(ROOT, "supabase/seed.sql"), seedSql);
console.log(
  `Wrote ${projects.length} projects and ${fieldReports.length} field reports (+ supabase/seed.sql)`,
);
