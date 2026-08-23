"use client";

import Link from "next/link";
import { useMemo, useRef } from "react";
import { ArrowUpRight, MapPin } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { projects, type Project, projectDetailPath } from "@/data/projects";
import { useSiteState, projectMatchesState } from "@/lib/siteState";

/** Only curated real projects — no invented state “templates”. */
function stateProjects(state: string): { works: Project[]; nationwideFallback: boolean } {
  const matched = projects
    .filter((p) => projectMatchesState(p.state, state))
    .slice(0, 6);
  if (matched.length || state === "All States") {
    return { works: matched, nationwideFallback: false };
  }
  return { works: projects.slice(0, 6), nationwideFallback: true };
}

function statusLabel(status: Project["status"]) {
  if (status === "In Progress") return "Live";
  return status;
}

export default function FeaturedWork() {
  const { selectedState } = useSiteState();
  const { works, nationwideFallback } = useMemo(
    () => stateProjects(selectedState),
    [selectedState],
  );
  const root = useRef<HTMLElement>(null);
  const scopeLabel =
    selectedState === "All States" || nationwideFallback
      ? "Nationwide"
      : selectedState;

  useGSAP(
    () => {
      gsap.fromTo(
        ".work-item",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.75,
          stagger: 0.06,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="projects" className="bg-white py-16 sm:py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-5 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Live projects · {scopeLabel}</p>
            <h2 className="mt-5 font-serif text-[clamp(2.2rem,4.6vw,3.75rem)] leading-[1.08] tracking-[-0.03em] text-navy">
              {scopeLabel === "Nationwide"
                ? "Public projects across Nigeria"
                : `Public projects in ${selectedState}`}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate">
              {!works.length
                ? `No curated entries for ${selectedState} yet — browse the full index or switch state in the header.`
                : nationwideFallback
                  ? `No curated entries for ${selectedState} yet — showing nationwide projects meanwhile.`
                  : selectedState === "All States"
                    ? "Pick a state in the header to filter, or browse the full projects index."
                    : "Roads, water, health, and energy works published for this state."}
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy"
          >
            {scopeLabel === "Nationwide"
              ? "See all projects"
              : `See all in ${selectedState}`}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        {works.length ? (
          <ol className="mt-14 divide-y divide-navy/8 border-y border-navy/8">
            {works.map((item, i) => (
              <li key={item.id} className="work-item">
                <Link
                  href={projectDetailPath(item.id)}
                  className="group flex flex-col gap-3 py-6 transition sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="flex min-w-0 items-baseline gap-4">
                    <span className="shrink-0 font-display text-xs font-semibold tracking-[0.16em] text-navy/40">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0">
                      <span className="block font-serif text-[1.35rem] leading-snug tracking-tight text-navy transition group-hover:text-forest md:text-[1.65rem]">
                        {item.title}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.lga}, {item.state}
                        </span>
                        <span>{item.category}</span>
                        <span>{item.budgetLabel}</span>
                      </span>
                    </span>
                  </span>
                  <span className="shrink-0 pl-8 text-[11px] font-semibold uppercase tracking-[0.16em] text-forest sm:pl-0">
                    {statusLabel(item.status)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        ) : null}
      </div>
    </section>
  );
}
