export type ProjectStatus = "In Progress" | "Completed" | "Planned" | "Stalled";
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
  image: string;
};

export const projects: Project[] = [
  {
    id: "NP-001",
    title: "Lagos-Ibadan Expressway Expansion",
    category: "Transport Infrastructure",
    description:
      "Comprehensive reconstruction and expansion of the dual carriageway to ease freight and passenger movement between Lagos and the South-West hinterland.",
    budgetNgn: 124_500_000_000,
    budgetLabel: "NGN 124.5B",
    state: "Lagos",
    lga: "Ikeja",
    status: "In Progress",
    contractor: "Julius Berger Nig.",
    completion: "Dec 2025",
    reports: 142,
    featured: true,
    era: "current",
    image:
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "NP-002",
    title: "Kano Regional Water Supply Expansion",
    category: "Water Resources",
    description:
      "Treatment and distribution upgrades serving metropolitan Kano and adjoining LGAs.",
    budgetNgn: 45_200_000_000,
    budgetLabel: "NGN 45.2B",
    state: "Kano",
    lga: "Nassarawa",
    status: "Completed",
    contractor: "CWE Construction",
    completion: "Mar 2024",
    reports: 89,
    era: "current",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "NP-003",
    title: "FCT Universal Basic Education Tech Labs",
    category: "Education",
    description:
      "Digital classrooms and STEM labs across public primary schools in the Federal Capital Territory.",
    budgetNgn: 12_000_000_000,
    budgetLabel: "NGN 12.0B",
    state: "Abuja (FCT)",
    lga: "Municipal",
    status: "Planned",
    contractor: "TBD",
    reports: 12,
    era: "current",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "NP-004",
    title: "Rivers State Specialist Hospital Renovation",
    category: "Health",
    description:
      "Ward, theatre, and diagnostic wing rehabilitation at the state specialist hospital.",
    budgetNgn: 8_500_000_000,
    budgetLabel: "NGN 8.5B",
    state: "Rivers",
    lga: "Port Harcourt",
    status: "Stalled",
    contractor: "MediStruct Ltd",
    reports: 304,
    era: "previous",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "NP-005",
    title: "Abuja Secretariat Modernization",
    category: "Facilities",
    description:
      "Workplace retrofit for federal administrative campuses including energy-efficient HVAC.",
    budgetNgn: 32_800_000_000,
    budgetLabel: "NGN 32.8B",
    state: "Abuja (FCT)",
    lga: "Municipal",
    status: "In Progress",
    contractor: "Cappa & D'Alberto",
    completion: "Aug 2026",
    reports: 67,
    era: "current",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "NP-006",
    title: "National Grid Extension — South-South",
    category: "Energy",
    description:
      "Transmission upgrades connecting underserved corridors in Edo, Delta, and Bayelsa.",
    budgetNgn: 78_400_000_000,
    budgetLabel: "NGN 78.4B",
    state: "Edo",
    lga: "Oredo",
    status: "In Progress",
    contractor: "PowerGrid Consortium",
    completion: "Nov 2027",
    reports: 51,
    era: "current",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "NP-007",
    title: "Benin Stormwater Drainage Phase II",
    category: "Public Works",
    description:
      "Channelization and flood-control works across high-risk catchments in Benin City.",
    budgetNgn: 18_600_000_000,
    budgetLabel: "NGN 18.6B",
    state: "Edo",
    lga: "Ikpoba-Okha",
    status: "Completed",
    contractor: "Setraco Nigeria Ltd",
    completion: "Jan 2023",
    reports: 44,
    era: "previous",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "NP-008",
    title: "Edo Rural Roads Rehabilitation",
    category: "Transport Infrastructure",
    description:
      "Laterite and asphaltic overlay of farm-to-market roads in Edo Central and North.",
    budgetNgn: 6_200_000_000,
    budgetLabel: "NGN 6.2B",
    state: "Edo",
    lga: "Esan West",
    status: "Planned",
    contractor: "TBD",
    reports: 9,
    era: "current",
    image:
      "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=900&q=80",
  },
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
