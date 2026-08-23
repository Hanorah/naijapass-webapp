"use client";

import { useRef } from "react";
import { gsap, useGSAP, ScrollTrigger } from "@/lib/gsap";

const copy =
  "Nigeria runs on 36 states and 774 LGAs — each with its own tenders, laws, and emergency contacts. NaijaPass puts it in one portal: pick your state, see open contracts, verified businesses, MDA contacts, and dial numbers that actually work.";

export default function NigeriaReveal() {
  const root = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const words = textRef.current?.querySelectorAll(".reveal-word");
        if (!words?.length || !root.current) return;

        gsap.set(words, { color: "rgba(12, 18, 24, 0.22)" });

        const scrollDistance = Math.max(words.length * 18, window.innerHeight * 1.1);

        gsap.to(words, {
          color: "rgba(12, 18, 24, 1)",
          ease: "none",
          stagger: 0.04,
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: `+=${scrollDistance}`,
            pin: true,
            scrub: 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onLeave: () => ScrollTrigger.refresh(),
            onEnterBack: () => ScrollTrigger.refresh(),
          },
        });
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const words = textRef.current?.querySelectorAll(".reveal-word");
        if (words) gsap.set(words, { color: "rgba(12, 18, 24, 1)" });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const words = copy.split(" ");

  return (
    <section
      ref={root}
      className="relative z-[1] -mt-10 max-w-[100vw] overflow-hidden rounded-t-[2.5rem] bg-white sm:rounded-t-[3.5rem] md:-mt-14 md:rounded-t-[4.5rem]"
      aria-label="About NaijaPass"
    >
      <div className="flex min-h-[100svh] items-center justify-center px-5 py-20 md:px-10 lg:px-16">
        <p
          ref={textRef}
          className="mx-auto max-w-[1100px] text-center font-display text-[clamp(1.65rem,4.2vw,3.15rem)] font-semibold leading-[1.28] tracking-[-0.03em]"
        >
          {words.map((word, i) => (
            <span key={i} className="reveal-word inline">
              {word}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
