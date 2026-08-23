"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, FolderCheck, Gavel, Map, MessageCircle } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { pexelsImage } from "@/lib/pexelsImages";

const crafts = [
  {
    id: "01",
    title: "State Hub",
    body: "Who governs your state, which MDA handles permits, emergency numbers, and the local laws that apply — for all 36 states and FCT.",
    tags: ["Governors", "MDAs", "Emergency"],
    icon: Map,
    image: pexelsImage(0),
  },
  {
    id: "02",
    title: "Business directory",
    body: "Search contractors and suppliers who have uploaded CAC or NIN. Filter by state and trade before you call anyone.",
    tags: ["KYC", "Contractors", "Suppliers"],
    icon: FolderCheck,
    image: pexelsImage(3),
  },
  {
    id: "03",
    title: "Procurement",
    body: "Federal and state tenders with values, deadlines, and documents. Track awards so you know who won and for how much.",
    tags: ["Tenders", "Deadlines", "Awards"],
    icon: Gavel,
    image: pexelsImage(2),
  },
  {
    id: "04",
    title: "Help desk",
    body: "Ask where to get a permit, which number to dial, or which tenders are open in your state. Answers use the same data as the portal.",
    tags: ["Permits", "Contacts", "Tenders"],
    icon: MessageCircle,
    image: pexelsImage(1),
  },
];

export default function Craft() {
  const [active, setActive] = useState(0);
  const root = useRef<HTMLElement>(null);
  const craft = crafts[active];
  const Icon = craft.icon;

  useGSAP(
    () => {
      gsap.fromTo(
        ".craft-head",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: {
            trigger: root.current,
            start: "top 78%",
            once: true,
          },
        },
      );
    },
    { scope: root },
  );

  return (
    <section ref={root} id="services" className="max-w-[100vw] overflow-x-hidden bg-white py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="craft-head flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Inside the portal</p>
            <h2 className="mt-5 max-w-xl font-serif text-[clamp(2.2rem,4.6vw,3.75rem)] leading-[1.08] tracking-[-0.03em] text-navy">
              What you can actually{" "}
              <em className="italic text-forest">do here</em>
            </h2>
          </div>
          <Link
            href="/signin"
            className="inline-flex items-center gap-2 text-sm font-semibold text-navy/70 transition hover:text-navy"
          >
            Open the portal
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-14 grid items-start gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.15fr)] lg:gap-14">
          <ol className="space-y-1">
            {crafts.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setActive(i)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex w-full items-baseline gap-4 rounded-2xl px-4 py-4 text-left transition ${
                    active === i
                      ? "bg-white text-navy shadow-[0_20px_50px_-28px_rgba(12,18,24,0.35)]"
                      : "text-navy/35 hover:text-navy/70"
                  }`}
                >
                  <span className="text-xs font-semibold tracking-[0.16em]">
                    {item.id}
                  </span>
                  <span className="font-serif text-[1.65rem] tracking-tight md:text-[1.85rem]">
                    {item.title}
                  </span>
                </button>
              </li>
            ))}
          </ol>

          <article className="overflow-hidden rounded-[28px] bg-white ring-1 ring-navy/6">
            <div className="relative h-56 md:h-72">
              <Image
                src={craft.image}
                alt={craft.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/55 to-transparent" />
              <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/92 px-3 py-1.5 text-xs font-semibold text-navy backdrop-blur">
                <Icon className="h-3.5 w-3.5 text-forest" />
                {craft.title}
              </span>
            </div>
            <div className="p-7 md:p-8">
              <h3 className="font-serif text-3xl tracking-tight text-navy">
                {craft.title}
              </h3>
              <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-slate">
                {craft.body}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {craft.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#f4f6f8] px-3 py-1 text-xs font-semibold text-navy/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
