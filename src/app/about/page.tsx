import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bot, Database, FolderCheck, Gavel, Map, ShieldCheck } from "lucide-react";
import { PEXELS_DEFAULT } from "@/lib/pexelsImages";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "NaijaPass bridges institutional governance and civic reality — building an ecosystem of transparency and economic dynamism.",
};

const timeline = [
  {
    year: "2018",
    title: "The Data Deficit",
    body: "Recognizing the lack of centralized infrastructure data, we launched the initial OpenContracting portal to digitize state archives.",
  },
  {
    year: "2021",
    title: "NaijaPass Integration",
    body: "Partnered with regional authorities to integrate active bidding systems, moving from historical records to live procurement tracking.",
  },
  {
    year: "2024",
    title: "NaijaPass Launch",
    body: "Expanded into a national civic intelligence layer — connecting contractors, officials, and citizens across Nigeria’s 36 states.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-white">
      <section className="dark-canvas relative isolate overflow-hidden text-white">
        <Image
          src={PEXELS_DEFAULT}
          alt="Nigerian cityscape and civic infrastructure"
          fill
          priority
          className="object-cover object-center opacity-50"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy-deep/50 via-navy-deep/70 to-navy-deep" />
        <div className="relative mx-auto flex min-h-[70vh] max-w-4xl flex-col items-center justify-center px-4 pb-20 pt-28 text-center sm:min-h-[78vh] sm:px-5 sm:pb-24 sm:pt-36 md:px-8">
          <p className="eyebrow text-forest">About NaijaPass</p>
          <h1 className="mt-5 font-serif text-[clamp(2.1rem,7vw,5rem)] leading-[0.98] tracking-[-0.03em]">
            Building transparent <em className="italic text-forest">futures</em>.
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/65 sm:mt-6 sm:text-base md:text-lg">
            We bridge institutional governance and civic reality — a single
            source of truth for public procurement and infrastructure across
            Nigeria.
          </p>
        </div>
      </section>

      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="eyebrow">Mission</p>
          <h2 className="mt-5 max-w-2xl font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.03em] text-navy">
            Unified civic intelligence.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate md:text-[17px]">
            Establish a singular, irrefutable source of truth for public
            procurement and infrastructure development in Nigeria.
          </p>

          <div className="mt-14 grid gap-5 md:grid-cols-2">
            <article className="rounded-[28px] bg-white p-8 ring-1 ring-navy/6">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-mist text-forest">
                <ShieldCheck className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h3 className="font-serif text-2xl tracking-tight text-navy">
                Absolute transparency
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate md:text-[15px]">
                We aggregate and verify open contracting data, ensuring every
                naira spent on public works is visible, trackable, and
                accountable to the citizens it serves.
              </p>
            </article>

            <article className="rounded-[28px] bg-navy p-8 text-white">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                <Database className="h-6 w-6" strokeWidth={1.8} />
              </div>
              <h3 className="font-serif text-2xl tracking-tight">Data integrity</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/65 md:text-[15px]">
                Cryptographically secure ledgers backed by institutional audits
                — so the record cannot be quietly rewritten.
              </p>
            </article>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "State Intelligence",
                body: "Live insights across Nigeria’s 36 states — budgets, priorities, and upcoming pipelines.",
                icon: Map,
              },
              {
                title: "AI Chatbot",
                body: "Ask natural-language questions about tenders, eligibility, and submission timelines.",
                icon: Bot,
              },
              {
                title: "Verified Directory",
                body: "Discover vetted contractors, consultants, and suppliers ready for public-sector work.",
                icon: FolderCheck,
              },
              {
                title: "Procurement Hub",
                body: "Track RFPs, RFQs, and awards with clear status updates and document access.",
                icon: Gavel,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  className="rounded-[24px] bg-white p-6 ring-1 ring-navy/6"
                >
                  <Icon className="h-5 w-5 text-forest" strokeWidth={1.8} />
                  <h3 className="mt-4 font-serif text-xl tracking-tight text-navy">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">{item.body}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="pb-24 md:pb-32">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <p className="eyebrow">Our evolution</p>
          <h2 className="mt-5 font-serif text-[clamp(2rem,4vw,3.2rem)] leading-[1.1] tracking-[-0.03em] text-navy">
            From OpenContracting to NaijaPass.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate">
            What began as an initiative to digitize paper records has evolved
            into a comprehensive intelligence platform bridging contractors,
            officials, and citizens.
          </p>

          <ol className="relative mt-16 space-y-12 border-l border-navy/12 pl-10 md:ml-4">
            {timeline.map((item) => (
              <li key={item.year} className="relative">
                <span className="absolute -left-[45px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-mist bg-forest" />
                <p className="font-serif text-lg text-forest">{item.year}</p>
                <h3 className="mt-1 font-serif text-2xl tracking-tight text-navy">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate md:text-[15px]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>

          <Link href="/signup" className="btn btn-primary mt-14">
            Get started
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
