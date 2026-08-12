"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bot,
  FolderCheck,
  Gavel,
  Map,
  type LucideIcon,
} from "lucide-react";

const services: {
  title: string;
  description: string;
  icon: LucideIcon;
  tint: string;
}[] = [
  {
    title: "State Intelligence",
    description:
      "Live insights across Nigeria’s 36 states — budgets, priorities, and upcoming pipelines.",
    icon: Map,
    tint: "bg-sky-100 text-sky-700",
  },
  {
    title: "AI Chatbot",
    description:
      "Ask natural-language questions about tenders, eligibility, and submission timelines.",
    icon: Bot,
    tint: "bg-violet-100 text-violet-700",
  },
  {
    title: "Verified Directory",
    description:
      "Discover vetted contractors, consultants, and suppliers ready for public-sector work.",
    icon: FolderCheck,
    tint: "bg-emerald-100 text-emerald-700",
  },
  {
    title: "Procurement Hub",
    description:
      "Track RFPs, RFQs, and awards with clear status updates and document access.",
    icon: Gavel,
    tint: "bg-orange-soft text-orange",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Services() {
  return (
    <section id="services" className="bg-white py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.2fr)] md:gap-16 md:px-8 lg:items-start">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          id="about"
          className="max-w-md"
        >
          <p className="section-label mb-4">Services</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-navy md:text-4xl">
            What we do
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate md:text-[17px]">
            From market intelligence to award tracking, Edo Bid equips businesses
            to compete fairly and win government contracts with confidence.
          </p>
          <Link
            href="#projects"
            className="mt-8 inline-flex items-center justify-center rounded-lg bg-orange px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-hover"
          >
            View All Services
          </Link>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="group rounded-2xl border border-navy/6 bg-mist/60 p-6 transition duration-300 hover:-translate-y-1 hover:border-orange/20 hover:bg-white hover:shadow-xl hover:shadow-navy/5"
              >
                <div
                  className={`mb-5 inline-flex h-11 w-11 items-center justify-center rounded-xl ${service.tint}`}
                >
                  <Icon className="h-5 w-5" strokeWidth={1.85} />
                </div>
                <h3 className="font-display text-lg font-bold text-navy">
                  {service.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {service.description}
                </p>
                <Link
                  href="#projects"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange transition group-hover:gap-2"
                >
                  Learn more
                  <span aria-hidden>→</span>
                </Link>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
