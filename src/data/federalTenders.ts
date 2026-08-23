export type FederalTender = {
  reference: string;
  title: string;
  mda: string;
  state: string | null;
  sector: string;
  value: number;
  deadline: string;
  status: "open" | "closed" | "awarded";
  source: "nocopo" | "budeshi" | "state-ocp" | "budgit";
  publishedAt: string;
};

/** Federal & state procurement from NOCOPO, Budeshi, and state OCP portals (BudgIT ecosystem). */
export const federalTenders: FederalTender[] = [
  {
    reference: "BPP/2026/001",
    title: "Rehabilitation of Federal Roads — Lagos-Ibadan Expressway Section B",
    mda: "Federal Ministry of Works",
    state: "Ogun",
    sector: "Infrastructure",
    value: 45000000000,
    deadline: "2026-09-15",
    status: "open",
    source: "nocopo",
    publishedAt: "2026-06-01",
  },
  {
    reference: "BPP/2026/002",
    title: "Supply of Medical Equipment to Federal Teaching Hospitals",
    mda: "Federal Ministry of Health",
    state: null,
    sector: "Health",
    value: 12500000000,
    deadline: "2026-08-30",
    status: "open",
    source: "nocopo",
    publishedAt: "2026-05-20",
  },
  {
    reference: "BPP/2026/003",
    title: "National Identity Management System Phase III",
    mda: "National Identity Management Commission",
    state: "FCT",
    sector: "ICT",
    value: 8700000000,
    deadline: "2026-07-31",
    status: "open",
    source: "budeshi",
    publishedAt: "2026-05-15",
  },
  {
    reference: "KAD/OCDS/2026/014",
    title: "Construction of Kaduna State Internal Revenue Service HQ",
    mda: "Kaduna State Public Procurement Authority",
    state: "Kaduna",
    sector: "Infrastructure",
    value: 3200000000,
    deadline: "2026-08-20",
    status: "open",
    source: "state-ocp",
    publishedAt: "2026-06-10",
  },
  {
    reference: "LAG/LASG/2026/089",
    title: "Lagos State Smart City Surveillance Network Expansion",
    mda: "Lagos State Ministry of Science & Technology",
    state: "Lagos",
    sector: "ICT",
    value: 5600000000,
    deadline: "2026-09-01",
    status: "open",
    source: "state-ocp",
    publishedAt: "2026-06-05",
  },
  {
    reference: "EDO/2026/034",
    title: "Edo State Rural Road Network — Phase II (Egor & Ovia LGAs)",
    mda: "Edo State Ministry of Infrastructure",
    state: "Edo",
    sector: "Infrastructure",
    value: 1800000000,
    deadline: "2026-08-15",
    status: "open",
    source: "state-ocp",
    publishedAt: "2026-05-28",
  },
  {
    reference: "BPP/2025/441",
    title: "Supply and Installation of Solar Mini-Grids — North-East Zone",
    mda: "Rural Electrification Agency",
    state: "Borno",
    sector: "Energy",
    value: 9800000000,
    deadline: "2026-07-20",
    status: "open",
    source: "nocopo",
    publishedAt: "2026-04-10",
  },
  {
    reference: "RIV/2026/012",
    title: "Port Harcourt Water Supply Rehabilitation Project",
    mda: "Rivers State Ministry of Water Resources",
    state: "Rivers",
    sector: "Water",
    value: 2400000000,
    deadline: "2026-08-10",
    status: "open",
    source: "state-ocp",
    publishedAt: "2026-05-22",
  },
  {
    reference: "BPP/2026/004",
    title: "Procurement of Agricultural Inputs — National Food Security Programme",
    mda: "Federal Ministry of Agriculture",
    state: null,
    sector: "Agriculture",
    value: 15000000000,
    deadline: "2026-09-30",
    status: "open",
    source: "budgit",
    publishedAt: "2026-06-01",
  },
  {
    reference: "KAN/2026/007",
    title: "Kano State Metro Bus Fleet Procurement",
    mda: "Kano State Ministry of Transport",
    state: "Kano",
    sector: "Transportation",
    value: 4100000000,
    deadline: "2026-08-25",
    status: "open",
    source: "state-ocp",
    publishedAt: "2026-05-18",
  },
  {
    reference: "BPP/2025/398",
    title: "Construction of Federal Secretariat Complex — Abuja Phase IV",
    mda: "Federal Capital Territory Administration",
    state: "FCT",
    sector: "Infrastructure",
    value: 22000000000,
    deadline: "2026-07-15",
    status: "open",
    source: "nocopo",
    publishedAt: "2026-03-20",
  },
  {
    reference: "PLT/2026/003",
    title: "Plateau State Tourism Infrastructure — Jos Plateau Circuit",
    mda: "Plateau State Ministry of Tourism",
    state: "Plateau",
    sector: "Tourism",
    value: 950000000,
    deadline: "2026-08-05",
    status: "open",
    source: "state-ocp",
    publishedAt: "2026-05-10",
  },
  {
    reference: "BPP/2026/005",
    title: "National Broadband Infrastructure Rollout — Phase II",
    mda: "Nigerian Communications Commission",
    state: null,
    sector: "ICT",
    value: 35000000000,
    deadline: "2026-10-01",
    status: "open",
    source: "budeshi",
    publishedAt: "2026-06-08",
  },
  {
    reference: "ABJ/2026/002",
    title: "Abia State Aba Industrial Cluster Power Supply",
    mda: "Abia State Ministry of Power",
    state: "Abia",
    sector: "Energy",
    value: 1200000000,
    deadline: "2026-08-18",
    status: "open",
    source: "state-ocp",
    publishedAt: "2026-05-25",
  },
  {
    reference: "BPP/2025/512",
    title: "Renovation of Federal Unity Colleges — Batch 7",
    mda: "Federal Ministry of Education",
    state: null,
    sector: "Education",
    value: 6800000000,
    deadline: "2026-07-30",
    status: "awarded",
    source: "nocopo",
    publishedAt: "2026-02-14",
  },
];

export function formatNaira(amount: number): string {
  if (amount >= 1_000_000_000) return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `₦${(amount / 1_000_000).toFixed(0)}M`;
  return `₦${amount.toLocaleString()}`;
}

export function openTendersForState(state: string): FederalTender[] {
  return federalTenders.filter(
    (t) => t.status === "open" && (t.state === state || t.state === null),
  );
}
