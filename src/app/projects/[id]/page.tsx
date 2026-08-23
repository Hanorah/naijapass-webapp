import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  MapPin,
  MessageCircle,
  Tag,
} from "lucide-react";
import {
  projectFeedbackPath,
  projects,
  type Project,
  type ProjectStatus,
} from "@/data/projects";
import { fetchProject } from "@/lib/db/server";

const statusStyle: Record<ProjectStatus, string> = {
  "In Progress": "bg-orange/15 text-orange",
  Completed: "bg-forest/15 text-forest",
  Planned: "bg-sky-50 text-sky-800",
  Stalled: "bg-red-100 text-red-700",
};

const eraLabel: Record<Project["era"], string> = {
  current: "Current administration (2023–present)",
  previous: "Previous administration (2015–2023)",
  legacy: "Legacy (pre-2015)",
};

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await fetchProject(decodeURIComponent(id));
  if (!project) return { title: "Project not found" };
  return {
    title: project.title,
    description: project.description,
  };
}

function formatBudget(ngn: number, label: string) {
  if (ngn > 0) {
    if (ngn >= 1_000_000_000_000)
      return `₦${(ngn / 1_000_000_000_000).toFixed(1)}T`;
    if (ngn >= 1_000_000_000) return `₦${(ngn / 1_000_000_000).toFixed(1)}B`;
    if (ngn >= 1_000_000) return `₦${(ngn / 1_000_000).toFixed(0)}M`;
    return `₦${ngn.toLocaleString("en-NG")}`;
  }
  return label || "TBA";
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-xl border border-navy/8 bg-white p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate">
        {label}
      </dt>
      <dd className="mt-1.5 text-sm font-semibold leading-snug text-navy">{value}</dd>
    </div>
  );
}

export default async function ProjectDetailPage({ params }: Props) {
  const { id } = await params;
  const project = await fetchProject(decodeURIComponent(id));
  if (!project) notFound();

  const agency = project.supervisingAgency;
  const budgetDisplay = formatBudget(project.budgetNgn, project.budgetLabel);

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-navy/70 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          All projects
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_340px]">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate">
              <span
                className={`rounded-md px-2.5 py-1 text-[11px] font-bold ${statusStyle[project.status]}`}
              >
                {project.status}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-navy">
                <Tag className="h-3 w-3 text-orange" />
                {project.category}
              </span>
              <span className="rounded-full bg-mist px-2.5 py-1 text-navy">
                {eraLabel[project.era]}
              </span>
              {project.featured && (
                <span className="rounded-full bg-orange/15 px-2.5 py-1 text-orange">
                  Featured
                </span>
              )}
            </div>

            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy md:text-4xl">
              {project.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate">
              {project.description}
            </p>

            <h2 className="mt-10 font-display text-lg font-bold text-navy">
              Project details
            </h2>
            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <DetailItem label="Project ID" value={project.id} />
              <DetailItem label="Status" value={project.status} />
              <DetailItem label="Category" value={project.category} />
              <DetailItem label="Administration era" value={eraLabel[project.era]} />
              <DetailItem label="State" value={project.state} />
              <DetailItem label="LGA / location" value={project.lga} />
              <DetailItem label="Contractor" value={project.contractor} />
              <DetailItem label="Supervising agency" value={agency} />
              <DetailItem label="Budget" value={budgetDisplay} />
              <DetailItem
                label="Estimated completion"
                value={project.completion || "Not stated"}
              />
              <DetailItem
                label="Field reports logged"
                value={project.reports.toLocaleString("en-NG")}
              />
              {project.startDate ? (
                <DetailItem label="Start date" value={project.startDate} />
              ) : null}
              {project.expectedCompletion ? (
                <DetailItem
                  label="Expected completion"
                  value={project.expectedCompletion}
                />
              ) : null}
            </dl>

            {project.sourceTitle || project.sourceUrl ? (
              <p className="mt-6 text-sm text-slate">
                Source:{" "}
                {project.sourceUrl ? (
                  <a
                    href={project.sourceUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-semibold text-forest underline underline-offset-2"
                  >
                    {project.sourceTitle || project.sourceUrl}
                  </a>
                ) : (
                  <span className="font-semibold text-navy">{project.sourceTitle}</span>
                )}
              </p>
            ) : null}
          </div>

          <aside className="space-y-4 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-navy/8 bg-mist/50 p-5">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate">
                <MapPin className="h-3.5 w-3.5 text-orange" />
                Location
              </p>
              <p className="mt-2 font-display text-lg font-bold text-navy">
                {project.lga}
              </p>
              <p className="text-sm text-slate">{project.state}</p>
            </div>

            <div className="rounded-2xl border border-navy/8 bg-mist/50 p-5">
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate">
                <Building2 className="h-3.5 w-3.5 text-orange" />
                Delivery
              </p>
              <p className="mt-2 text-sm font-semibold text-navy">{project.contractor}</p>
              <p className="mt-1 text-sm text-slate">{agency}</p>
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-slate">
                <Calendar className="h-3.5 w-3.5" />
                {project.completion
                  ? `Target / completed: ${project.completion}`
                  : "Completion date not stated"}
              </p>
            </div>

            <div className="rounded-2xl bg-navy p-6 text-white">
              <p className="text-sm text-white/60">Field reports logged</p>
              <p className="mt-1 flex items-center gap-2 font-display text-3xl font-bold">
                <FileText className="h-7 w-7 text-orange" />
                {project.reports}
              </p>
              <Link
                href={projectFeedbackPath(project.id)}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-navy transition hover:bg-mist"
              >
                <MessageCircle className="h-4 w-4 text-orange" />
                View feedback & reports
              </Link>
            </div>

            {project.status === "Stalled" && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                This project is flagged as stalled. Citizen reports and status
                updates are monitored on the feedback board.
              </p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
