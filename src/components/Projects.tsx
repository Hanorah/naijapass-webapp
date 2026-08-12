"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

const projects = [
  {
    title: "Lagos-Ibadan Expressway Expansion",
    description:
      "Multi-phase corridor upgrade connecting commercial hubs across South-West Nigeria.",
    tag: "Infrastructure",
    image:
      "https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1200&q=80",
    className: "md:col-span-1 md:row-span-2 min-h-[320px] md:min-h-full",
  },
  {
    title: "Abuja Secretariat Modernization",
    description: "Workplace retrofit for federal administrative campuses.",
    tag: "Facilities",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    className: "md:col-span-2 min-h-[220px]",
  },
  {
    title: "National Grid Extension",
    description: "Transmission upgrades for underserved corridors.",
    tag: "Energy",
    image:
      "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80",
    className: "min-h-[220px]",
  },
  {
    title: "Water Sanitation Plant",
    description: "Treatment capacity expansion for urban water security.",
    tag: "Public Works",
    image:
      "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
    className: "min-h-[220px]",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="bg-background py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <p className="section-label mb-4 justify-center">Our Projects</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-navy md:text-4xl">
            Most Recent Projects
          </h2>
        </motion.div>

        <div className="grid auto-rows-fr gap-4 md:grid-cols-3 md:grid-rows-2 md:gap-5">
          {projects.map((project, i) => (
            <motion.article
              key={project.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.07, duration: 0.55 }}
              className={`group relative overflow-hidden rounded-2xl ${project.className}`}
            >
              <Image
                src={project.image}
                alt={project.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy/35 to-transparent transition duration-500 group-hover:from-navy-deep/95" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <span className="inline-block rounded-md bg-orange px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  {project.tag}
                </span>
                <h3 className="mt-3 font-display text-lg font-bold leading-snug text-white md:text-xl">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="mt-1.5 max-w-md text-sm leading-relaxed text-white/75">
                    {project.description}
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="#trusted"
            className="inline-flex items-center justify-center rounded-lg border border-navy/25 bg-transparent px-6 py-3 text-sm font-semibold text-navy transition hover:border-navy hover:bg-navy hover:text-white"
          >
            View Complete Portfolio
          </Link>
        </div>
      </div>
    </section>
  );
}
