"use client";

import { useState } from "react";
import {
  Briefcase,
  FileText,
  Funnel,
  Layers,
  Lightbulb,
  MoreVertical,
} from "lucide-react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ComposedChart,
} from "recharts";

const kpis = [
  {
    label: "Total Projects",
    value: "4,285",
    trend: "+10% this year",
    icon: Briefcase,
    iconClass: "bg-orange/15 text-orange",
  },
  {
    label: "Total Awards",
    value: "1,890",
    trend: "+5% this quarter",
    icon: Lightbulb,
    iconClass: "bg-sky-100 text-sky-700",
  },
  {
    label: "Total Contracts",
    value: "₦850B",
    trend: "+8% YoY",
    icon: FileText,
    iconClass: "bg-mist text-navy-muted",
  },
  {
    label: "Total Tenders",
    value: "312",
    trend: "Stable",
    icon: Layers,
    iconClass: "bg-mist text-navy-muted",
  },
];

const budgetTrends = [
  { year: "2019", allocated: 118, released: 86 },
  { year: "2020", allocated: 142, released: 108 },
  { year: "2021", allocated: 176, released: 132 },
  { year: "2022", allocated: 228, released: 174 },
  { year: "2023", allocated: 286, released: 221 },
  { year: "2024", allocated: 348, released: 274 },
];

const stateShare = [
  { name: "Lagos", value: 32, color: "#006b41" },
  { name: "Kano", value: 22, color: "#008751" },
  { name: "Rivers", value: 18, color: "#1b2a41" },
  { name: "FCT", value: 16, color: "#7dd3fc" },
  { name: "Oyo", value: 12, color: "#0d4a3a" },
];

const categoryActive = [
  { name: "Infrastructure", value: 920 },
  { name: "Education", value: 540 },
  { name: "Healthcare", value: 410 },
  { name: "Agriculture", value: 320 },
  { name: "Power", value: 260 },
  { name: "Water", value: 190 },
  { name: "Security", value: 95 },
];

const categoryCompleted = [
  { name: "Infrastructure", value: 610 },
  { name: "Education", value: 470 },
  { name: "Healthcare", value: 355 },
  { name: "Agriculture", value: 280 },
  { name: "Power", value: 210 },
  { name: "Water", value: 165 },
  { name: "Security", value: 120 },
];

export default function VisualizationDashboard() {
  const [mode, setMode] = useState<"Active" | "Completed">("Active");
  const bars = mode === "Active" ? categoryActive : categoryCompleted;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-5 py-8 md:px-8 md:py-10">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <article
              key={kpi.label}
              className="rounded-2xl border border-navy/6 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate">{kpi.label}</p>
                <span
                  className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${kpi.iconClass}`}
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-display text-3xl font-bold text-navy">
                {kpi.value}
              </p>
              <p className="mt-2 text-xs font-medium text-emerald-700">{kpi.trend}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)]">
        <article className="rounded-2xl border border-navy/6 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-bold text-navy">
                Budget Trends by Year
              </h2>
              <p className="text-sm text-slate">
                Allocated vs Released Funds (Billions ₦)
              </p>
            </div>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate hover:bg-mist"
              aria-label="Chart options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={budgetTrends}>
                <defs>
                  <linearGradient id="allocFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#008751" stopOpacity={0.28} />
                    <stop offset="100%" stopColor="#008751" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8eef3" />
                <XAxis dataKey="year" tick={{ fill: "#64748b", fontSize: 12 }} />
                <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e8eef3",
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="allocated"
                  name="Allocated Funds"
                  stroke="#008751"
                  strokeWidth={2.5}
                  fill="url(#allocFill)"
                />
                <Line
                  type="monotone"
                  dataKey="released"
                  name="Released Funds"
                  stroke="#1b2a41"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-navy/6 bg-white p-5 shadow-sm">
          <div className="mb-2 flex items-start justify-between">
            <h2 className="font-display text-lg font-bold text-navy">
              State-wise Allocation
            </h2>
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate hover:bg-mist"
              aria-label="Filter regions"
            >
              <Funnel className="h-4 w-4" />
            </button>
          </div>
          <div className="relative h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stateShare}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={92}
                  paddingAngle={3}
                >
                  {stateShare.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center pb-8">
              <div className="text-center">
                <p className="text-[11px] uppercase tracking-wide text-slate">
                  Top Region
                </p>
                <p className="font-display text-lg font-bold text-navy">Lagos</p>
              </div>
            </div>
          </div>
        </article>
      </div>

      <article className="rounded-2xl border border-navy/6 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold text-navy">
            Projects by Category
          </h2>
          <div className="inline-flex rounded-full bg-mist p-1">
            {(["Active", "Completed"] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${
                  mode === item
                    ? "bg-orange text-white shadow-sm"
                    : "text-slate hover:text-navy"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bars}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8eef3" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
              <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e8eef3",
                }}
              />
              <Bar dataKey="value" name="Projects" fill="#008751" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </article>

    </div>
  );
}
