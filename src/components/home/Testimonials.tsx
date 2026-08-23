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
    body: "We used to miss Edo road tenders until someone forwarded a PDF. Now we check NaijaPass every morning and download the pack ourselves.",
    name: "Adaeze Okonkwo",
    role: "Director, Okonkwo Civil Ltd · Edo",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=80",
  },
  {
    body: "Instead of printing bid packs for the courier, we publish once on the portal. Contractors in Kano see the deadline the same day.",
    name: "Ibrahim Suleiman",
    role: "Procurement, Kano State Ministry of Works",
    avatar:
      "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=200&q=80",
  },
  {
    body: "Needed MEP firms in Port Harcourt with CAC already done. Filtered the directory by Rivers and category — three calls, not three weeks.",
    name: "Fatima Abdullahi",
    role: "Principal, Abdullahi & Co. · Rivers",
    avatar:
      "https://images.unsplash.com/photo-1589156280159-27698a70f29e?auto=format&fit=crop&w=200&q=80",
  },
 
];

export default function Testimonials() {
  const root = useRef<HTMLElement>(null);
  const featured = quotes[0];

  useGSAP(
    () => {
      gsap.fromTo(
        ".t-head",
        { y: 20, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: root.current,
            start: "top 80%",
            once: true,
          },
        },
      );
      gsap.fromTo(
        ".t-card",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.7,
          stagger: 0.07,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: ".t-grid",
            start: "top 82%",
            once: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="t-head">
          <p className="eyebrow">From users</p>
          <h2 className="mt-5 max-w-xl font-serif text-[clamp(2.2rem,4.6vw,3.6rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            How firms and MDAs use NaijaPass
          </h2>
        </div>

        <div className="t-grid mt-14 grid gap-5 md:grid-cols-2">
          <article className="t-card flex flex-col justify-between rounded-[28px] bg-navy p-8 text-white md:row-span-2 md:p-10">
            <p className="font-serif text-[1.65rem] leading-[1.25] tracking-tight md:text-[2rem]">
              &ldquo;{featured.body}&rdquo;
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
              <p className="text-[15px] leading-relaxed text-navy">
                &ldquo;{quote.body}&rdquo;
              </p>
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
