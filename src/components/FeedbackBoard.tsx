"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import {
  Heart,
  MapPin,
  MessageCircle,
  Search,
  Star,
  UserRound,
} from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import {
  getProjectById,
  projectDetailPath,
  projectFeedbackPath,
  supervisingAgency,
} from "@/data/projects";
import {
  getReportByTicket,
  getReportsForProject,
  getSentimentForProject,
  reportStatusClass,
} from "@/data/projectFeedback";
import { signInUrl, signUpUrl } from "@/lib/returnUrl";

const FEEDBACK_TOPICS = [
  "Road quality",
  "Timeline",
  "Safety",
  "Contractor performance",
  "Community impact",
  "Other",
];

type Props = {
  projectId: string;
};

export default function FeedbackBoard({ projectId }: Props) {
  const { ready, user, feedbackForProject, submitProjectFeedback } = useSession();
  const project = getProjectById(projectId);
  const reports = useMemo(() => getReportsForProject(projectId), [projectId]);
  const userEntries = useMemo(
    () => (ready ? feedbackForProject(projectId) : []),
    [ready, feedbackForProject, projectId],
  );
  const sentiment = useMemo(
    () => getSentimentForProject(projectId, userEntries),
    [projectId, userEntries],
  );
  const agency = project ? supervisingAgency(project) : "Federal Ministry of Works";
  const returnPath = projectFeedbackPath(projectId);

  const [ticket, setTicket] = useState("");
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [topic, setTopic] = useState(FEEDBACK_TOPICS[0]);
  const [body, setBody] = useState("");
  const [likes, setLikes] = useState<Record<string, number>>(() =>
    Object.fromEntries(reports.map((r) => [r.id, r.likes])),
  );

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-16 text-center md:px-8">
        <p className="text-slate">Project not found.</p>
        <Link href="/projects" className="mt-4 inline-block text-sm font-semibold text-forest">
          Browse projects
        </Link>
      </div>
    );
  }

  const onTrack = (e: FormEvent) => {
    e.preventDefault();
    const id = ticket.trim().toUpperCase();
    if (!id) {
      toast.error("Enter a ticket ID to track.");
      return;
    }
    const hit = getReportByTicket(id);
    if (!hit) {
      toast.error(`No report found for ${id} on this project.`);
      return;
    }
    if (hit.projectId !== projectId) {
      toast.error(`${id} belongs to a different project.`);
      return;
    }
    toast.success(`${hit.title} is currently ${hit.status}.`);
  };

  const onSubmitFeedback = async (e: FormEvent) => {
    e.preventDefault();
    if (!user?.verified) {
      toast.error("Sign in and verify your account to submit feedback.");
      return;
    }
    if (!body.trim()) {
      toast.error("Describe your experience before submitting.");
      return;
    }
    const entry = await submitProjectFeedback({
      projectId,
      rating,
      topic,
      body,
    });
    if (!entry) {
      toast.error("Could not save feedback. Try signing in again.");
      return;
    }
    setBody("");
    toast.success("Thanks — your feedback was recorded.");
  };

  const formatWhen = (iso: string) =>
    new Date(iso).toLocaleDateString("en-NG", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  const statusBadge =
    project.status === "Stalled"
      ? "bg-red-100 text-red-700"
      : project.status === "Completed"
        ? "bg-forest/15 text-forest"
        : "bg-sky-50 text-sky-800";

  return (
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            href={projectDetailPath(project.id)}
            className="text-sm font-semibold text-forest hover:underline"
          >
            ← Project details
          </Link>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy md:text-[2.1rem]">
            {project.title}
          </h1>
          <p className="mt-2 max-w-2xl text-slate">{project.description}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-sm font-semibold ${statusBadge}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              project.status === "Stalled"
                ? "bg-red-500"
                : project.status === "Completed"
                  ? "bg-forest"
                  : "bg-orange"
            }`}
          />
          {project.status}
        </span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">
              Track field report
            </h2>
            <p className="mt-1 text-xs text-slate">
              Ticket IDs for this project start with{" "}
              <code className="rounded bg-mist px-1 py-0.5">{project.id}</code>
              {reports[0] ? ` (e.g. ${reports[0].id})` : ""}
            </p>
            <form
              onSubmit={onTrack}
              className="mt-3 flex flex-col gap-2 sm:flex-row"
            >
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate" />
                <input
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                  placeholder={`# e.g. ${project.id}-001`}
                  className="w-full rounded-xl border border-navy/10 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
                />
              </label>
              <button
                type="submit"
                className="rounded-xl bg-navy px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-navy-muted"
              >
                Track Status
              </button>
            </form>
          </article>

          <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">
              Live field reports
            </h2>
            {reports.length === 0 ? (
              <p className="mt-4 text-sm text-slate">
                No digitised field reports for this project yet. Check back after
                site teams upload updates.
              </p>
            ) : (
              <ol className="relative mt-6 space-y-8 border-l border-navy/12 pl-6">
                {reports.map((report) => (
                  <li key={report.id} className="relative">
                    <span
                      className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white ${
                        report.status === "Delayed"
                          ? "bg-red-500"
                          : report.status === "Completed"
                            ? "bg-slate-400"
                            : "bg-orange"
                      }`}
                    />
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-navy">
                        {report.title}
                      </h3>
                      <span className="text-xs text-slate">{report.time}</span>
                    </div>
                    <p className="mt-1 font-mono text-[11px] text-slate">{report.id}</p>
                    <p className="mt-2 text-sm leading-relaxed text-slate">
                      {report.body}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-medium text-navy">
                        <MapPin className="h-3 w-3 text-orange" />
                        {report.location}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${reportStatusClass(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </div>
                    {report.image && (
                      <div className="relative mt-4 h-40 overflow-hidden rounded-xl bg-sky-50">
                        <Image
                          src={report.image}
                          alt={report.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 640px"
                        />
                      </div>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-mist">
                          <UserRound className="h-3.5 w-3.5" />
                        </span>
                        {report.author}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setLikes((prev) => ({
                            ...prev,
                            [report.id]: (prev[report.id] ?? 0) + 1,
                          }))
                        }
                        className="inline-flex items-center gap-1 font-medium hover:text-orange"
                      >
                        <Heart className="h-3.5 w-3.5" />
                        {likes[report.id]}
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </article>

          {ready && user?.verified ? (
            <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-navy">
                Submit feedback
              </h2>
              <p className="mt-1 text-xs text-slate">
                Signed in as {user.name}. Your rating updates citizen sentiment for
                this project.
              </p>
              <form onSubmit={onSubmitFeedback} className="mt-4 space-y-4">
                <div>
                  <p className="text-xs font-semibold text-navy-muted">Rating</p>
                  <div className="mt-2 flex gap-1">
                    {([1, 2, 3, 4, 5] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="rounded-lg p-1 transition hover:bg-mist"
                        aria-label={`Rate ${value} out of 5`}
                      >
                        <Star
                          className={`h-6 w-6 ${
                            value <= rating ? "text-orange" : "text-navy/20"
                          }`}
                          fill={value <= rating ? "currentColor" : "none"}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block">
                  <span className="text-xs font-semibold text-navy-muted">Topic</span>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
                  >
                    {FEEDBACK_TOPICS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-semibold text-navy-muted">
                    Your experience
                  </span>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    placeholder="What have you seen on site? Be specific about location and date if you can."
                    className="mt-1.5 w-full resize-none rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange/40 focus:ring-2 focus:ring-orange/15"
                  />
                </label>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white transition hover:bg-forest/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Post feedback
                </button>
              </form>
            </article>
          ) : (
            <article className="rounded-2xl border border-navy/10 bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-navy">
                Share your experience
              </h2>
              <p className="mt-2 text-sm text-slate">
                Create a free account and complete verification to rate this project
                and add field notes.
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link
                  href={signUpUrl(returnPath)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-navy px-4 py-3 text-sm font-semibold text-white transition hover:bg-navy-muted"
                >
                  <MessageCircle className="h-4 w-4 text-orange" />
                  Create account
                </Link>
                <Link
                  href={signInUrl(returnPath)}
                  className="flex flex-1 items-center justify-center rounded-xl border border-navy/10 px-4 py-3 text-sm font-semibold text-navy hover:border-orange/30"
                >
                  Sign in
                </Link>
              </div>
            </article>
          )}

          {userEntries.length > 0 && (
            <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
              <h2 className="font-display text-base font-bold text-navy">
                Your feedback
              </h2>
              <ul className="mt-4 space-y-4">
                {userEntries.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-xl border border-navy/8 bg-mist/40 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-orange">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className="h-3.5 w-3.5"
                            fill={i < entry.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-slate">{formatWhen(entry.createdAt)}</span>
                    </div>
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-forest">
                      {entry.topic}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate">{entry.body}</p>
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>

        <aside className="space-y-6">
          <article className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="font-display text-base font-bold text-navy">
              Citizen sentiment
            </h2>
            <div className="mt-4 flex items-end gap-3">
              <p className="font-display text-4xl font-bold text-navy">
                {sentiment.score.toFixed(1)}
              </p>
              <div className="pb-1">
                <div className="flex text-orange">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4"
                      fill={i < Math.round(sentiment.score) ? "currentColor" : "none"}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate">
                  {sentiment.totalFeedbacks.toLocaleString()} feedbacks
                </p>
              </div>
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Positive", pct: sentiment.positivePct, bar: "bg-forest" },
                { label: "Neutral", pct: sentiment.neutralPct, bar: "bg-slate-400" },
                { label: "Negative", pct: sentiment.negativePct, bar: "bg-red-500" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="mb-1 flex justify-between text-xs font-medium text-navy-muted">
                    <span>{row.label}</span>
                    <span>{row.pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-mist">
                    <div
                      className={`h-full rounded-full ${row.bar}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs font-bold uppercase tracking-wide text-slate">
              Top discussed topics
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {sentiment.topics.map((topic) => (
                <span
                  key={topic}
                  className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          </article>

          <article className="rounded-2xl bg-navy p-5 text-white shadow-sm">
            <h2 className="font-display text-base font-bold">Project details</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-white/50">Contractor</dt>
                <dd className="mt-0.5 font-semibold">{project.contractor}</dd>
              </div>
              <div>
                <dt className="text-white/50">Supervising agency</dt>
                <dd className="mt-0.5 font-semibold">{agency}</dd>
              </div>
              <div>
                <dt className="text-white/50">Budget</dt>
                <dd className="mt-0.5 font-semibold">{project.budgetLabel}</dd>
              </div>
              {project.completion && (
                <div>
                  <dt className="text-white/50">Est. completion</dt>
                  <dd className="mt-0.5 font-semibold">{project.completion}</dd>
                </div>
              )}
              <div>
                <dt className="text-white/50">Location</dt>
                <dd className="mt-0.5 font-semibold">
                  {project.lga}, {project.state}
                </dd>
              </div>
            </dl>
          </article>
        </aside>
      </div>
    </div>
  );
}
