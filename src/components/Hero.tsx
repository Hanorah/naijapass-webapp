"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import NigeriaMap from "@/components/NigeriaMap";
import { gsap, useGSAP } from "@/lib/gsap";

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.85 },
        });
        tl.from(".hero-kicker", { y: 18, autoAlpha: 0 })
          .from(".hero-title", { y: 28, autoAlpha: 0 }, "-=0.55")
          .from(".hero-sub", { y: 20, autoAlpha: 0 }, "-=0.55")
          .from(".hero-cta", { y: 14, autoAlpha: 0 }, "-=0.5")
          .from(".hero-meta", { y: 12, autoAlpha: 0 }, "-=0.45")
          .from(".hero-visual", { y: 36, autoAlpha: 0, duration: 1.05 }, "-=0.85")
          .from(".hero-chip", { y: 14, autoAlpha: 0, stagger: 0.1 }, "-=0.55");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="home"
      className="dark-canvas relative -mt-20 overflow-hidden"
    >
      <div className="aurora -left-24 top-[-8%] h-[55vw] w-[55vw] max-h-[640px] max-w-[640px] bg-forest/25" />
      <div className="aurora right-[-12%] top-[18%] h-[42vw] w-[42vw] max-h-[480px] max-w-[480px] bg-emerald-400/10" />
      <div className="aurora bottom-[-20%] left-[30%] h-72 w-72 bg-gold/10" />
      <div className="hero-grid pointer-events-none absolute inset-0" />

      <div className="relative mx-auto grid min-h-[100svh] max-w-7xl items-center gap-12 px-5 pb-20 pt-32 md:px-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16 lg:pb-24 lg:pt-28">
        <div className="max-w-xl">
          <p className="hero-kicker eyebrow mb-7 text-forest">
            National civic infrastructure
          </p>
          <h1 className="hero-title font-serif text-[clamp(2.7rem,6.4vw,5.4rem)] leading-[0.96] tracking-[-0.03em] text-white">
            The operating system for{" "}
            <em className="italic text-forest">public Nigeria</em>.
          </h1>
          <p className="hero-sub mt-7 max-w-md text-[16px] leading-relaxed text-white/62 md:text-[17px] md:leading-[1.75]">
            Intelligence, verified firms, and open procurement across 36 states
            and 774 LGAs — built for businesses that bid, and governments that
            publish.
          </p>
          <div className="hero-cta mt-10 flex flex-wrap items-center gap-3">
            <Link href="/signin" className="btn btn-primary">
              Enter the portal
              <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} />
            </Link>
            <Link href="/projects" className="btn btn-ghost-dark">
              Browse projects
            </Link>
          </div>
          <div className="hero-meta mt-12 flex flex-wrap gap-x-8 gap-y-4 border-t border-white/10 pt-6 text-sm text-white/50">
            <p>
              <span className="block font-serif text-2xl text-white">₦48.2B</span>
              awarded this week
            </p>
            <p>
              <span className="block font-serif text-2xl text-white">128</span>
              tenders closing
            </p>
            <p>
              <span className="block font-serif text-2xl text-white">12k+</span>
              verified firms
            </p>
          </div>
        </div>

        <div className="hero-visual relative">
          <div className="hero-chip glass-chip absolute -left-2 top-8 z-20 hidden px-4 py-3 sm:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
              Live procurement
            </p>
            <p className="mt-1 font-serif text-2xl text-white">₦48.2B</p>
            <p className="text-xs text-white/50">awarded this week</p>
          </div>
          <div className="hero-chip glass-chip absolute -right-1 bottom-12 z-20 hidden px-4 py-3 lg:block">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">
              Coverage
            </p>
            <p className="mt-1 font-serif text-2xl text-white">36 states</p>
            <p className="text-xs text-white/50">774 LGAs indexed</p>
          </div>
          <NigeriaMap />
        </div>
      </div>
    </section>
  );
}
