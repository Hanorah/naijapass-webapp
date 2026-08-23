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
  Phone,
  Shield,
  Siren,
} from "lucide-react";
import StateMap from "@/components/StateMap";
import { useDashboardSearch } from "@/components/dashboard/DashboardSearchContext";

export default function EmergencyCommand() {
  const { selectedState } = useDashboardSearch();

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
                {selectedState}
              </span>
            </div>
            <StateMap selectedState={selectedState} height="280px" />
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
                    <p className="font-bold">Check your state hub for live alerts</p>
                    <p className="mt-1 text-sm text-navy-muted">
                      Emergency notices published by {selectedState} appear in the
                      State Hub emergency feed.
                    </p>
                    <Link
                      href="/dashboard/hub"
                      className="mt-3 inline-flex rounded-lg bg-white px-3 py-1.5 text-xs font-semibold"
                    >
                      Open State Hub
                    </Link>
                  </div>
                </div>
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
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Ambulance className="h-4 w-4" />
                  </span>
                  <span>
                    <p className="text-sm font-semibold">Emergency services</p>
                    <p className="text-xs text-slate">Dial 112 or 767</p>
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => toast.success("112 — national emergency line")}
                  className="rounded-full bg-mist px-3 py-1.5 text-xs font-semibold"
                >
                  Call
                </button>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-700">
                    <Hospital className="h-4 w-4" />
                  </span>
                  <span>
                    <p className="text-sm font-semibold">Nearest hospital</p>
                    <p className="text-xs text-slate">See State Hub directory</p>
                  </span>
                </span>
                <Link href="/dashboard/hub" className="text-xs font-semibold text-forest">
                  View
                </Link>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-orange/10 text-orange">
                    <CarFront className="h-4 w-4" />
                  </span>
                  <span>
                    <p className="text-sm font-semibold">Traffic & road alerts</p>
                    <p className="text-xs text-slate">{selectedState} transport notices</p>
                  </span>
                </span>
                <Link href="/dashboard/hub" className="text-xs font-semibold text-forest">
                  View
                </Link>
              </li>
            </ul>
          </section>

          <section className="rounded-2xl bg-navy p-5 text-white shadow-sm">
            <h2 className="inline-flex items-center gap-2 font-display font-bold">
              <Shield className="h-4 w-4 text-forest" /> Report an incident
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Use verified channels for fires, accidents, and security incidents in{" "}
              {selectedState}.
            </p>
            <button
              type="button"
              onClick={() => toast.success("Incident report logged locally for demo.")}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-4 py-3 text-sm font-semibold text-white"
            >
              <Phone className="h-4 w-4" />
              Report now
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}
