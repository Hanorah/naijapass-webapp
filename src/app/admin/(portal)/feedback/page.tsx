"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { setAdminFeedbackVisibility, useAdminFeedback } from "@/lib/db/adminFeedback";
export default function AdminFeedbackPage() {
  const { items, loading, reload, applyVisibility } = useAdminFeedback();
  const [q, setQ] = useState("");
  const [kind, setKind] = useState<"all" | "feedback" | "field_report">("all");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items.filter((r) => {
      if (kind !== "all" && r.kind !== kind) return false;
      if (!needle) return true;
      return (
        r.body.toLowerCase().includes(needle) ||
        (r.topic ?? "").toLowerCase().includes(needle) ||
        r.project_id.toLowerCase().includes(needle) ||
        (r.user_name ?? "").toLowerCase().includes(needle)
      );
    });
  }, [items, q, kind]);

  const onToggle = async (id: string, visibility: "public" | "hidden") => {
    const next = visibility === "public" ? "hidden" : "public";
    try {
      await setAdminFeedbackVisibility(id, next);
      applyVisibility(id, next);
      toast.success(next === "hidden" ? "Feedback hidden." : "Feedback restored.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update feedback.");
      await reload();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl text-navy">Feedback & reports</h1>
        <p className="mt-1 text-sm text-slate">
          Citizen feedback and field inspection reports · {filtered.length} shown
          {loading ? " · loading…" : ""}
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search body, project, author…"
          className="min-w-[220px] flex-1 rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm outline-none focus:border-forest/40"
        />
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as typeof kind)}
          className="rounded-xl border border-navy/10 bg-white px-3 py-2.5 text-sm"
        >
          <option value="all">All types</option>
          <option value="feedback">Citizen feedback</option>
          <option value="field_report">Field reports</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((r) => (
          <article
            key={`${r.kind}-${r.id}`}
            className="rounded-2xl border border-navy/8 bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-navy">
                  {r.title || r.topic || "Citizen comment"}
                  {r.rating > 0 ? ` · ${r.rating}/5` : ""}
                </p>
                <p className="mt-1 text-xs text-slate">
                  {r.kind === "field_report" ? "Field report" : "Feedback"} ·{" "}
                  {r.project_id} · {r.created_at}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-navy/[0.05] px-2 py-0.5 text-[11px] font-semibold text-navy/75">
                  {r.status || r.visibility}
                </span>
                {r.kind === "feedback" ? (
                  <button
                    type="button"
                    onClick={() => void onToggle(r.id, r.visibility)}
                    className="rounded-lg border border-navy/12 px-3 py-1.5 text-xs font-semibold text-navy/70 hover:bg-navy/[0.04]"
                  >
                    {r.visibility === "public" ? "Hide" : "Restore"}
                  </button>
                ) : null}
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-navy/75">{r.body}</p>
            <p className="mt-3 text-xs text-slate">
              {[r.location, r.author || r.user_name || "Anonymous", r.user_email]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </article>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-slate">No feedback or reports yet.</p>
        )}
      </div>
    </div>
  );
}
