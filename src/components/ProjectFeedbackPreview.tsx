"use client";

import Link from "next/link";
import { useMemo } from "react";
import { MessageCircle, Star } from "lucide-react";
import { useSession } from "@/components/SessionProvider";
import { getReportsForProject, type FieldReport } from "@/data/projectFeedback";
import { projectFeedbackPath } from "@/data/projects";

type Props = {
  projectId: string;
  limit?: number;
};

type PreviewItem = {
  id: string;
  author: string;
  body: string;
  when: string;
  rating?: number;
};

export default function ProjectFeedbackPreview({ projectId, limit = 4 }: Props) {
  const { ready, feedbackForProject } = useSession();
  const reports = useMemo(() => getReportsForProject(projectId), [projectId]);
  const userEntries = useMemo(
    () => (ready ? feedbackForProject(projectId) : []),
    [ready, feedbackForProject, projectId],
  );

  const items = useMemo(() => {
    const fromReports: PreviewItem[] = reports.map((report: FieldReport) => ({
      id: report.id,
      author: report.author,
      body: report.body,
      when: report.time,
    }));
    const fromUsers: PreviewItem[] = userEntries.map((entry) => ({
      id: entry.id,
      author: "You",
      body: entry.body,
      when: new Date(entry.createdAt).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      rating: entry.rating,
    }));
    return [...fromUsers, ...fromReports].slice(0, limit);
  }, [reports, userEntries, limit]);

  const total = reports.length + userEntries.length;
  const feedbackPath = projectFeedbackPath(projectId);

  if (total === 0) {
    return (
      <div className="rounded-2xl border border-navy/8 bg-mist/40 p-5">
        <h2 className="font-display text-base font-bold text-navy">Citizen feedback</h2>
        <p className="mt-2 text-sm text-slate">
          No comments yet. Be the first to share what you see on site.
        </p>
        <Link
          href={feedbackPath}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline"
        >
          <MessageCircle className="h-4 w-4" />
          Leave feedback
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-bold text-navy">Recent feedback</h2>
        {total > limit ? (
          <Link href={feedbackPath} className="text-sm font-semibold text-forest hover:underline">
            Show all ({total})
          </Link>
        ) : null}
      </div>
      <ul className="mt-4 space-y-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-navy/8 bg-mist/30 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm font-semibold text-navy">{item.author}</p>
              <span className="text-xs text-slate">{item.when}</span>
            </div>
            {item.rating ? (
              <div className="mt-1 flex text-orange">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5"
                    fill={i < item.rating! ? "currentColor" : "none"}
                  />
                ))}
              </div>
            ) : null}
            <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate">{item.body}</p>
          </li>
        ))}
      </ul>
      {total > limit ? (
        <Link
          href={feedbackPath}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-navy/10 px-4 py-2.5 text-sm font-semibold text-navy hover:border-forest/30 hover:text-forest"
        >
          Show all comments
        </Link>
      ) : (
        <Link
          href={feedbackPath}
          className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-forest hover:underline"
        >
          View feedback board
        </Link>
      )}
    </div>
  );
}
