"use client";

import Image from "next/image";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

type Quote = {
  body: string;
  name: string;
  role: string;
  avatar: string;
};

const quotes: Quote[] = [
  {
    body: "State intelligence across 36 states in one dashboard. We finally see budgets and pipelines before they hit the papers.",
    name: "Adaeze Okonkwo",
    role: "Director, Okonkwo Civil Ltd",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
  },
  {
    body: "The procurement hub made RFPs, closing dates, and awards visible. Our LGA no longer loses weeks forwarding bid packs.",
    name: "Ibrahim Suleiman",
    role: "Procurement lead, Kano State",
    avatar:
      "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&q=80",
  },
  {
    body: "The verified directory is the difference. We only engage contractors and suppliers that have already been vetted.",
    name: "Fatima Abdullahi",
    role: "Principal, Abdullahi & Co.",
    avatar:
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=200&q=80",
  },
  {
    body: "I ask the AI chatbot about eligibility and timelines in plain language. It reads the tender so my team does not have to.",
    name: "Tunde Adebayo",
    role: "Founder, Gridline MEP",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
];

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const featured = quotes[0];

  useGSAP(
    () => {
      gsap.from(".t-head", {
        y: 20,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: { trigger: root.current, start: "top 80%" },
      });
      gsap.from(".t-card", {
        y: 28,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: "power3.out",
        scrollTrigger: { trigger: ".t-grid", start: "top 82%" },
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="t-head">
          <p className="eyebrow">Voices</p>
          <h2 className="mt-5 max-w-xl font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            Institutions and firms already on NaijaPass.
          </h2>
        </div>

        <div className="t-grid mt-14 grid gap-5 md:grid-cols-2">
          <article className="t-card flex flex-col justify-between rounded-[28px] bg-navy p-8 text-white md:row-span-2 md:p-10">
            <p className="font-serif text-[1.65rem] leading-[1.25] tracking-tight md:text-[2rem]">
              “{featured.body}”
            </p>
            <div className="mt-10 flex items-center gap-3">
              <span className="relative h-11 w-11 overflow-hidden rounded-full">
                <Image
                  src={featured.avatar}
                  alt={featured.name}
                  fill
                  className="object-cover"
                  sizes="44px"
                />
              </span>
              <div>
                <p className="text-sm font-semibold">{featured.name}</p>
                <p className="text-xs text-white/50">{featured.role}</p>
              </div>
            </div>
          </article>

          {quotes.slice(1).map((quote) => (
            <article
              key={quote.name}
              className="t-card flex flex-col justify-between rounded-[28px] bg-white p-7 ring-1 ring-navy/6"
            >
              <p className="text-[15px] leading-relaxed text-navy">“{quote.body}”</p>
              <div className="mt-8 flex items-center gap-3">
                <span className="relative h-10 w-10 overflow-hidden rounded-full">
                  <Image
                    src={quote.avatar}
                    alt={quote.name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </span>
                <div>
                  <p className="text-sm font-semibold text-navy">{quote.name}</p>
                  <p className="text-xs text-slate">{quote.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
