"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const steps = [
  {
    n: "01",
    title: "Search intelligence",
    body: "Filter by state, sector, and budget. Live insights across Nigeria’s 36 states — pipelines, priorities, and upcoming tenders.",
  },
  {
    n: "02",
    title: "Verify and prepare",
    body: "Check the verified directory, run KYC, and ask the AI chatbot about eligibility and submission timelines before you bid.",
  },
  {
    n: "03",
    title: "Track procurement",
    body: "Follow RFPs, RFQs, and awards with documents, status updates, and field reports — one source of truth for firms and citizens.",
  },
];

export default function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".step-card", {
        y: 28,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-white pb-8 pt-8 md:pb-12 md:pt-4">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-5 max-w-xl font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          From intelligence to award.
        </h2>
        <div className="mt-14 grid gap-px overflow-hidden rounded-[28px] bg-navy/8 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.n} className="step-card bg-white p-8 md:p-10">
              <p className="font-serif text-3xl text-forest">{step.n}</p>
              <h3 className="mt-6 font-serif text-2xl tracking-tight text-navy">
                {step.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate">{step.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
