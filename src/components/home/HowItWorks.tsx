"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const steps = [
  {
    n: "01",
    title: "Choose your state",
    body: "We try to detect it from your location. You can also pick from the list. Tenders, contacts, and laws then filter to that state.",
  },
  {
    n: "02",
    title: "Verify with NIN or CAC",
    body: "Individuals upload NIN. Businesses upload CAC and tax docs. Once verified, you can list in the directory and follow tenders.",
  },
  {
    n: "03",
    title: "Use the portal",
    body: "Read open bids, download documents, call MDAs, or ask the help desk. Same login for directory, procurement, and state hub.",
  },
];

export default function HowItWorks() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".step-card",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-white pb-8 pt-8 md:pb-12 md:pt-4">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <p className="eyebrow">Getting started</p>
        <h2 className="mt-5 max-w-xl font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.08] tracking-[-0.03em] text-navy">
          Sign up. Pick a state. Get to work.
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
