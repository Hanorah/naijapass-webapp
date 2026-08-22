"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function FinalCta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.from(".cta-line", {
        y: 24,
        autoAlpha: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-white px-5 pb-20 pt-10 md:px-8 md:pb-28 md:pt-16">
      <div className="dark-canvas relative mx-auto max-w-7xl overflow-hidden rounded-[32px] px-6 py-20 text-center md:px-16 md:py-28">
        <div className="aurora left-1/2 top-[-30%] h-80 w-80 -translate-x-1/2 bg-forest/30" />
        <div className="relative">
          <p className="cta-line eyebrow justify-center text-forest">Ready when you are</p>
          <h2 className="cta-line mx-auto mt-6 max-w-3xl font-serif text-[clamp(2.4rem,5.4vw,4.4rem)] leading-[1.02] tracking-[-0.03em] text-white">
            Start with your <em className="italic text-forest">state</em>.
          </h2>
          <p className="cta-line mx-auto mt-5 max-w-lg text-[16px] leading-relaxed text-white/55">
            Browse government projects, open the map, or register your business
            to access verified directories and procurement across Nigeria.
          </p>
          <div className="cta-line mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signin" className="btn btn-primary">
              Enter the portal
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/signup" className="btn btn-ghost-dark">
              Register a business
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
