"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

const works = [
  {
    n: "01",
    title: "Lagos–Ibadan Expressway",
    meta: "Transport · ₦124.5B · Live",
    image:
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1600&q=80",
  },
  {
    n: "02",
    title: "Kano Regional Water Supply",
    meta: "Water · ₦45.2B · Completed",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=1600&q=80",
  },
  {
    n: "03",
    title: "FCT STEM Labs",
    meta: "Education · ₦12.0B · Planned",
    image:
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    n: "04",
    title: "National Grid Extension",
    meta: "Energy · South-East corridor",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=1600&q=80",
  },
  {
    n: "05",
    title: "Rivers Specialist Hospital",
    meta: "Health · Renovation · Live",
    image:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function FeaturedWork() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const work = works[active];

  useGSAP(
    () => {
      gsap.from(".work-col", {
        y: 36,
        autoAlpha: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 78%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="projects" className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Selected work</p>
            <h2 className="mt-5 font-serif text-[clamp(2.2rem,4.6vw,3.75rem)] leading-[1.08] tracking-[-0.03em] text-navy">
              Featured public builds.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate">
              Hover a corridor to preview. Open any case for the full story.
            </p>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy"
          >
            View the full pipeline
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid items-stretch gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.2fr)]">
          <ol className="work-col divide-y divide-navy/8">
            {works.map((item, i) => (
              <li key={item.n}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  onClick={() => setActive(i)}
                  className={`flex w-full items-center justify-between gap-4 py-5 text-left transition ${
                    active === i ? "text-navy" : "text-navy/32 hover:text-navy/70"
                  }`}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="font-display text-xs font-semibold tracking-[0.16em]">
                      {item.n}
                    </span>
                    <span className="font-serif text-[1.55rem] leading-none tracking-tight md:text-[1.85rem]">
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
            href="/projects"
            className="work-col group relative min-h-[340px] overflow-hidden rounded-[28px] md:min-h-[460px]"
          >
            <Image
              src={work.image}
              alt={work.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/88 via-navy/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 md:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
                {work.meta}
              </p>
              <h3 className="mt-2 font-serif text-3xl tracking-tight text-white md:text-4xl">
                {work.title}
              </h3>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
