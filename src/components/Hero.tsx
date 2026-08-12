"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function Hero() {
  return (
    <section
      id="home"
      className="relative isolate min-h-[88vh] overflow-hidden text-white"
    >
      <Image
        src="https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=2400&q=80"
        alt="Aerial cityscape at dusk"
        fill
        priority
        className="object-cover object-center"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-navy-deep/92 via-navy/78 to-navy/55" />
      <div className="absolute inset-0 hero-grid opacity-60" aria-hidden />

      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[min(70vw,520px)] w-[min(70vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10"
        aria-hidden
      >
        <div className="absolute inset-[12%] rounded-full border border-white/8" />
        <div className="absolute inset-[28%] rounded-full border border-orange/20" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="select-none text-center font-display text-[clamp(1.1rem,3.5vw,2rem)] font-bold uppercase tracking-[0.35em] text-white/8">
            Unified
            <br />
            Brokers
          </span>
        </div>
      </div>

      <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-center px-5 py-24 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-2xl"
        >
          <p className="section-label mb-5 text-orange drop-shadow-sm">
            NaijaPass Portal
          </p>
          <h1 className="font-display text-[clamp(2.35rem,5.5vw,4.25rem)] font-bold leading-[1.08] tracking-tight text-white">
            Unified Gateway to Nigeria&apos;s 36 States
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
            Connect your business with verified government projects, procurement
            pipelines, and state-level intelligence — all in one trusted portal.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              href="#projects"
              className="inline-flex items-center justify-center rounded-lg bg-orange px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange/25 transition hover:bg-orange-hover hover:shadow-orange/35"
            >
              Explore Opportunities
            </Link>
            <Link
              href="#about"
              className="inline-flex items-center justify-center rounded-lg border border-white/40 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/70 hover:bg-white/12"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
