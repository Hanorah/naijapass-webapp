"use client";

import { projects } from "@/data/projects";
import { getReportsForProject } from "@/data/projectFeedback";

export default function AdminFeedbackPage() {
  const reports = projects.flatMap((p) => getReportsForProject(p.id));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-white">Feedback & reports</h1>
        <p className="mt-1 text-sm text-white/50">
          Field inspection reports linked to infrastructure projects.
        </p>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-white">{r.title}</p>
                <p className="mt-1 text-xs text-white/40">
                  {r.id} · {r.projectId} · {r.time}
                </p>
              </div>
              <span className="rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-semibold text-white/75">
                {r.status}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-white/65">{r.body}</p>
            <p className="mt-3 text-xs text-white/40">
              {r.location} · {r.author} · {r.likes} likes
            </p>
          </article>
        ))}
        {reports.length === 0 && (
          <p className="text-sm text-white/45">No field reports yet.</p>
        )}
      </div>
    </div>
  );
}
