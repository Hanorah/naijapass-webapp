export type FieldReportStatus = "In Progress" | "Delayed" | "Completed" | "Planned";

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

/** Bundled project feedback seed data. */
const reports: FieldReport[] = [
  {
    id: "NP-FCT-ABJKAD-001",
    projectId: "NP-FCT-ABJKAD",
    title: "Palliative Cutting & Scarification",
    time: "Oct 2024",
    body: "Contractors mobilized cold milling machinery at Kilometre 31+200. Asphalt laying commenced on cut points under active traffic management.",
    location: "Dikko Junction",
    status: "In Progress",
    author: "Civic Monitor North-Central",
    likes: 42,
    image: "https://upload.wikimedia.org/Abuja_Kaduna_Road.jpg",
  },
  {
    id: "NP-NAS-LAFIA-001",
    projectId: "NP-NAS-LAFIA",
    title: "CHEC Earthworks & Drainage Progress",
    time: "Feb 2024",
    body: "China Harbour completed 80 percent of stone base and binder course applications. Drainage construction active near Sabon Kwara intersection.",
    location: "Lafia Bypass Km 12",
    status: "In Progress",
    author: "Nasarawa Audit Group",
    likes: 38,
    image: "https://upload.wikimedia.org/Lafia_Bypass.jpg",
  },
  {
    id: "NP-EBO-TUNN-001",
    projectId: "NP-EBO-TUNN",
    title: "Vanco Underpass Piling Operations",
    time: "Dec 2024",
    body: "Active piling on central caps observed. Mobilization payout reached 70 percent, though equipment density remains low relative to project scale.",
    location: "Abakaliki Vanco Junction",
    status: "In Progress",
    author: "South-East Open Contracting",
    likes: 89,
    image: "https://upload.wikimedia.org/Vanco_Bridge.jpg",
  },
  {
    id: "NP-RIV-BONNY-001",
    projectId: "NP-RIV-BONNY",
    title: "Bodo-Bonny Mainstay Span Bridge",
    time: "May 2024",
    body: "Final concrete deck pours completed across the main river bridge spans, linking Bonny Island directly to the mainland corridor.",
    location: "Bonny Island Span",
    status: "Completed",
    author: "Niger Delta Review",
    likes: 154,
    image: "https://upload.wikimedia.org/Bodo_Bonny_Bridge.jpg",
  },
];

const sentimentByProject: Record<string, ProjectSentiment> = {
  "NP-FCT-ABJKAD": {
    score: 4.1,
    totalFeedbacks: 126,
    positivePct: 70,
    neutralPct: 20,
    negativePct: 10,
    topics: ["Site Progress", "Contractor Performance", "Safety"],
  },
  "NP-NAS-LAFIA": {
    score: 4.1,
    totalFeedbacks: 120,
    positivePct: 70,
    neutralPct: 20,
    negativePct: 10,
    topics: ["Site Progress", "Contractor Performance", "Safety"],
  },
  "NP-EBO-TUNN": {
    score: 4.1,
    totalFeedbacks: 267,
    positivePct: 70,
    neutralPct: 20,
    negativePct: 10,
    topics: ["Site Progress", "Contractor Performance", "Safety"],
  },
  "NP-RIV-BONNY": {
    score: 4.1,
    totalFeedbacks: 462,
    positivePct: 70,
    neutralPct: 20,
    negativePct: 10,
    topics: ["Site Progress", "Contractor Performance", "Safety"],
  }
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
