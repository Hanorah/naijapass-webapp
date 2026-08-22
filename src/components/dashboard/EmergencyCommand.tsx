"use client";

import Link from "next/link";
import toast from "react-hot-toast";
import {
  Ambulance,
  CarFront,
  Flame,
  Hospital,
  MapPin,
  Megaphone,
  Minus,
  Phone,
  Plus,
  Shield,
  Siren,
} from "lucide-react";

export default function EmergencyCommand() {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-[clamp(2rem,3.4vw,2.85rem)] leading-[1.08] tracking-[-0.03em] text-navy">
            Emergency & Safety Command
          </h1>
          <p className="mt-1 text-slate">
            Real-time civic intelligence and rapid response directory.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-forest">
          <span className="h-2 w-2 animate-pulse rounded-full bg-forest" />
          Live Tracking: Active
        </span>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.85fr)]">
        <div className="space-y-5">
          <section className="overflow-hidden rounded-2xl border border-navy/8 bg-white shadow-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <h2 className="inline-flex items-center gap-2 font-display font-bold">
                <MapPin className="h-4 w-4" /> Threat Map & Live Tracking
              </h2>
              <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-700">
                2 High
              </span>
            </div>
            <div className="relative h-[280px] bg-[#0d2a32]">
              <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(#1f6f78_1px,transparent_1px),linear-gradient(90deg,#1f6f78_1px,transparent_1px)] [background-size:28px_28px]" />
              <span className="absolute left-[22%] top-[38%] h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_8px_rgba(239,68,68,0.25)]" />
              <span className="absolute left-[48%] top-[52%] h-3 w-3 rounded-full bg-red-500 shadow-[0_0_0_8px_rgba(239,68,68,0.25)]" />
              <span className="absolute left-[63%] top-[28%] h-3 w-3 rounded-full bg-orange shadow-[0_0_0_8px_rgba(255,107,53,0.25)]" />
              <div className="absolute left-3 top-3 flex flex-col overflow-hidden rounded-lg bg-white/90">
                <button type="button" className="p-2" aria-label="Zoom in">
                  <Plus className="h-4 w-4" />
                </button>
                <button type="button" className="border-t p-2" aria-label="Zoom out">
                  <Minus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="inline-flex items-center gap-2 font-display font-bold text-red-700">
              <Megaphone className="h-4 w-4" /> Live Area Alerts
            </h2>
            <article className="mt-4 rounded-xl bg-red-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
                    <Flame className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-bold">Major Industrial Fire - Ikeja</p>
                    <p className="mt-1 text-sm text-navy-muted">
                      Multiple units dispatched to Ogba Industrial Estate.
                      Evacuation recommended for a 2km radius. Expect heavy
                      traffic on Acme Road.
                    </p>
                    <button
                      type="button"
                      className="mt-3 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold"
                    >
                      View on Map
                    </button>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-slate">2 mins ago</span>
              </div>
            </article>
            <article className="mt-3 rounded-xl bg-sky-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex gap-3">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange text-white">
                    <CarFront className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-bold">Severe Traffic Gridlock - Third Mainland</p>
                    <p className="mt-1 text-sm text-navy-muted">
                      Accident involving two commercial vehicles on the
                      island-bound lane. Traffic backed up to Oworonshoki. Use
                      alternative routes.
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-xs text-slate">15 mins ago</span>
              </div>
            </article>
          </section>
        </div>

        <div className="space-y-5">
          <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="inline-flex items-center gap-2 font-display font-bold text-forest">
              <Siren className="h-4 w-4" /> Nearest to Me
            </h2>
            <ul className="mt-4 space-y-3">
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-forest">
                    <Hospital className="h-4 w-4" />
                  </span>
                  <span>
                    <p className="text-sm font-semibold">General Hospital Lagos</p>
                    <p className="text-xs text-slate">1.2 km - Broad St, Marina</p>
                  </span>
                </span>
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-forest">
                  12 Beds Available
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-700">
                  <Shield className="h-4 w-4" />
                </span>
                <span>
                  <p className="text-sm font-semibold">Lion Building Command</p>
                  <p className="text-xs text-slate">0.8 km - Campbell St</p>
                </span>
              </li>
              <li className="flex items-center gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600">
                  <Ambulance className="h-4 w-4" />
                </span>
                <span>
                  <p className="text-sm font-semibold">Onikan Fire Station</p>
                  <p className="text-xs text-slate">2.1 km - Awolowo Rd</p>
                </span>
              </li>
            </ul>
            <Link
              href="/dashboard/directory"
              className="mt-4 block rounded-xl border border-navy/15 py-2 text-center text-sm font-semibold"
            >
              View Full Directory
            </Link>
          </section>

          <section className="rounded-2xl border border-navy/8 bg-white p-5 shadow-sm">
            <h2 className="inline-flex items-center gap-2 font-display font-bold text-forest">
              <Phone className="h-4 w-4" /> Quick Dial
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a href="tel:112" className="rounded-xl bg-mist p-3">
                <p className="font-display text-2xl font-bold text-red-600">112</p>
                <p className="text-xs text-slate">National Toll-Free</p>
              </a>
              <a href="tel:767" className="rounded-xl bg-mist p-3">
                <p className="font-display text-2xl font-bold">767</p>
                <p className="text-xs text-slate">Lagos State Emergency</p>
              </a>
              <a
                href="tel:08000333333"
                className="col-span-2 rounded-xl bg-mist p-3"
              >
                <p className="text-sm font-semibold">Domestic Violence Hotline</p>
                <p className="font-display text-lg font-bold">08000 333 333</p>
              </a>
            </div>
          </section>
        </div>
      </div>

      <button
        type="button"
        onClick={() => toast.error("SOS dispatched to nearest response unit.")}
        className="fixed bottom-6 right-6 z-40 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-red-600 text-sm font-bold text-white shadow-lg"
      >
        SOS
      </button>

      <footer className="mt-8 flex flex-col gap-2 border-t border-navy/8 pt-4 text-xs text-slate sm:flex-row sm:justify-between">
        <p>NaijaPass © {new Date().getFullYear()} Federal Republic of Nigeria. Powered by GritinAI.</p>
        <div className="flex gap-3">
          <Link href="/privacy">Privacy Policy</Link>
          <Link href="/terms">Terms of Service</Link>
        </div>
      </footer>
    </div>
  );
}
