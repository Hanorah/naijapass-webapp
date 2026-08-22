"use client";

import { motion } from "framer-motion";

const institutions = [
  "Federal Gov",
  "State Ministries",
  "World Bank",
  "AfDB",
  "BOI",
];

export default function TrustedBy() {
  return (
    <section id="trusted" className="bg-white py-14 md:py-16">
      <div className="mx-auto max-w-7xl px-5 text-center md:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-[0.2em] text-slate"
        >
          Trusted by Leading Institutions
        </motion.p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-5 md:gap-x-14">
          {institutions.map((name, i) => (
            <motion.span
              key={name}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="font-display text-sm font-bold uppercase tracking-[0.12em] text-navy/35 transition hover:text-navy/60 md:text-base"
            >
              {name}
            </motion.span>
          ))}
        </div>
      </div>
    </section>
  );
}
