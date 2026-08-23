"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

export default function SplitAudience() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".split-card",
        { y: 36, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          stagger: 0.12,
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
    <section ref={root} className="relative z-[1] w-full max-w-[100vw] overflow-x-hidden bg-white px-5 pb-10 pt-4 md:px-8 md:pb-14 md:pt-6">
      <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[32px] lg:grid-cols-2">
        <article className="split-card group relative min-h-[480px] overflow-hidden md:min-h-[560px]">
          <Image
            src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80"
            alt="Construction site in Nigeria"
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/40 to-navy-deep/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest">
              For businesses
            </p>
            <h3 className="mt-3 max-w-sm font-serif text-[2.15rem] leading-[1.1] tracking-tight text-white md:text-4xl">
              Bid on real tenders, not rumours.
            </h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/65">
              See open RFPs by state and sector, download the pack, and check who
              won past awards before you spend on a bid.
            </p>
            <Link
              href="/projects"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              Browse tenders
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </article>

        <article className="split-card group relative min-h-[480px] overflow-hidden md:min-h-[560px]">
          <Image
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80"
            alt="Government building"
            fill
            className="object-cover transition duration-700 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-deep via-navy-deep/45 to-navy-deep/10" />
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-forest">
              For government
            </p>
            <h3 className="mt-3 max-w-sm font-serif text-[2.15rem] leading-[1.1] tracking-tight text-white md:text-4xl">
              Put your tenders where firms look.
            </h3>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-white/65">
              Publish RFPs and awards on NaijaPass so contractors in your state
              see them the same day — not weeks later by courier.
            </p>
            <Link
              href="/signup"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white"
            >
              Register as an agency
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
