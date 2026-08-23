"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const stats = [
  { value: "36", label: "States + FCT covered" },
  { value: "774", label: "LGAs in the index" },
  { value: "Daily", label: "Tender & award updates" },
  { value: "1 login", label: "Hub, directory, bids" },
];

export default function StatsBand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".stat-item",
        { y: 24, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: root.current,
            start: "top 82%",
            once: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="dark-canvas relative max-w-[100vw] overflow-hidden">
      <div className="aurora left-0 top-[-40%] h-80 w-80 bg-forest/20" />
      <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-10 px-5 py-20 md:grid-cols-4 md:px-8 md:py-24">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-item">
            <p className="font-serif text-[clamp(2.4rem,5vw,3.8rem)] leading-none tracking-tight text-white">
              {stat.value}
            </p>
            <p className="mt-3 text-sm text-white/45">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
