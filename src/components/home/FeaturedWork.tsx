"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { projects, type Project, projectDetailPath } from "@/data/projects";
import { useSiteState, projectMatchesState } from "@/lib/siteState";

/** Only curated real projects — no invented state “templates”. */
function stateProjects(state: string): Project[] {
  return projects
    .filter((p) => projectMatchesState(p.state, state))
    .slice(0, 6);
}

function statusLabel(status: Project["status"]) {
  if (status === "In Progress") return "Live";
  return status;
}

export default function FeaturedWork() {
  const { selectedState } = useSiteState();
  const works = useMemo(() => stateProjects(selectedState), [selectedState]);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const work = works[active] ?? works[0];

  useEffect(() => {
    setActive(0);
  }, [selectedState]);

  useGSAP(
    () => {
      gsap.fromTo(
        ".work-col",
        { y: 36, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          stagger: 0.1,
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

  if (!works.length) {
    return (
      <section ref={root} id="projects" className="bg-white py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <p className="eyebrow">
            Live projects ·{" "}
            {selectedState === "All States" ? "Nationwide" : selectedState}
          </p>
          <h2 className="mt-5 font-serif text-[clamp(2.2rem,4.6vw,3.75rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            {selectedState === "All States"
              ? "Public projects across Nigeria"
              : `Public projects in ${selectedState}`}
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate">
            We only list verified works with real project photos. No curated
            entries for {selectedState} yet — browse the full index or switch
            state in the header.
          </p>
          <Link
            href="/projects"
            className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-forest"
          >
            Open projects index
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    );
  }

  if (!work) return null;

  return (
    <section ref={root} id="projects" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">
              Live projects ·{" "}
              {selectedState === "All States" ? "Nationwide" : selectedState}
            </p>
            <h2 className="mt-5 font-serif text-[clamp(2.2rem,4.6vw,3.75rem)] leading-[1.08] tracking-[-0.03em] text-navy">
              {selectedState === "All States"
                ? "Public projects across Nigeria"
                : `Public projects in ${selectedState}`}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate">
              {selectedState === "All States"
                ? "Pick a state in the header to filter, or browse the full projects index."
                : "Change your state in the header to see roads, water, health, and energy works for that state."}
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy"
          >
            {selectedState === "All States"
              ? "See all projects"
              : `See all in ${selectedState}`}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
          <ol className="work-col divide-y divide-navy/8">
            {works.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center justify-between gap-4 py-5 text-left transition ${
                    active === i ? "text-navy" : "text-navy/55 hover:text-navy/80"
                  }`}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-display text-xs font-semibold tracking-[0.16em]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 font-serif text-[1.35rem] leading-snug tracking-tight md:text-[1.65rem]">
                      {item.title}
                    </span>
                  </span>
                  {active === i && (
                    <span className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] text-forest sm:inline">
                      Preview
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ol>

          <Link
            href={projectDetailPath(work.id)}
            className="work-col group flex min-h-[340px] flex-col justify-end overflow-hidden rounded-[28px] bg-navy p-7 md:min-h-[460px] md:p-8"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
              {work.category} · {work.budgetLabel} · {statusLabel(work.status)}
            </p>
            <h3 className="mt-2 font-serif text-3xl tracking-tight text-white md:text-4xl">
              {work.title}
            </h3>
            <p className="mt-2 text-sm text-white/55">
              {work.lga}, {work.state}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
