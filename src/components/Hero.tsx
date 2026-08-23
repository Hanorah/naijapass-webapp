"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useSiteState } from "@/lib/siteState";

const slides = [
  {
    src: "/pexels-harrun-muhammad-116282236-33806113.jpg",
    alt: "Lagos cityscape at dusk",
  },
  {
    src: "/pexels-meshack-emmanuel-kazanshyi-1267432081-29832529.jpg",
    alt: "Nigerian street and skyline",
  },
  {
    src: "/pexels-daggash-farhan-1851897902-30220079.jpg",
    alt: "Modern buildings in Nigeria",
  },
  {
    src: "/pexels-shotbywrz-734724649-18431669.jpg",
    alt: "Nigerian architecture and light",
  },
  {
    src: "/pexels-shotbywrz-734724649-18431682.jpg",
    alt: "Urban Nigeria at golden hour",
  },
];

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const { selectedState } = useSiteState();

  useEffect(() => {
    const id = window.setInterval(() => {
      setActive((i) => (i + 1) % slides.length);
    }, 5500);
    return () => window.clearInterval(id);
  }, []);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({
          defaults: { ease: "power3.out", duration: 0.9 },
        });
        tl.from(".hero-kicker", { y: 16, autoAlpha: 0 })
          .from(".hero-title", { y: 28, autoAlpha: 0 }, "-=0.55")
          .from(".hero-sub", { y: 18, autoAlpha: 0 }, "-=0.55")
          .from(".hero-cta", { y: 14, autoAlpha: 0 }, "-=0.5");
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="home"
      className="relative flex min-h-[100svh] max-w-[100vw] items-center justify-center overflow-hidden"
    >
      {/* Full-bleed image slideshow */}
      <div className="absolute inset-0">
        {slides.map((slide, i) => (
          <div
            key={slide.src}
            className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.src}
              alt={slide.alt}
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover transition-transform duration-[8000ms] ease-out ${
                i === active ? "scale-105" : "scale-100"
              }`}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/55 via-navy-deep/45 to-navy-deep/70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,8,11,0.35)_100%)]" />
      </div>

      {/* Centered copy */}
      <div className="relative z-[1] mx-auto max-w-4xl px-5 pb-24 pt-36 text-center md:px-8 md:pb-28 md:pt-40">
        <p className="hero-kicker text-[13px] font-medium tracking-wide text-white/75">
          Showing data near{" "}
          <span className="font-semibold text-white">
            {selectedState === "FCT" ? "Abuja, FCT" : `${selectedState}, Nigeria`}
          </span>
        </p>
        <h1 className="hero-title mt-5 font-display text-[clamp(2.6rem,7vw,5.2rem)] font-semibold leading-[1.02] tracking-[-0.04em] text-white">
          Government work,{" "}
          <em className="font-serif font-normal italic text-white">without stress.</em>
        </h1>
        <p className="hero-sub mx-auto mt-6 max-w-lg text-[16px] leading-relaxed text-white/75 md:text-[17px]">
          Browse open tenders, find verified contractors, and get your state&apos;s
          contacts — all from one portal.
        </p>
        <div className="hero-cta mt-10 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signin" className="btn btn-primary">
            Enter portal
            <ArrowUpRight className="h-4 w-4" strokeWidth={2.1} />
          </Link>
          <Link
            href="/projects"
            className="btn border border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/18"
          >
            Browse tenders
          </Link>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-10 left-1/2 z-[1] flex -translate-x-1/2 gap-2">
        {slides.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
