"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const stats = [
  { value: "36", label: "States on one map" },
  { value: "774", label: "LGAs indexed" },
  { value: "₦2.1T", label: "Public spend tracked" },
  { value: "12k+", label: "Verified firms" },
];

export default function StatsBand() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".stat-item", {
        y: 24,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 82%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="dark-canvas relative overflow-hidden">
      <div className="aurora left-[-10%] top-[-40%] h-80 w-80 bg-forest/20" />
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
