"use client";

import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Globe,
  Mail,
  MapPin,
  Phone,
  Star,
  Users,
  Wrench,
} from "lucide-react";
import { PEXELS_DEFAULT } from "@/lib/pexelsImages";

export type ProfileView = {
  id: string;
  name: string;
  subtitle: string;
  rating: number;
  reviews: number;
  location: string;
  state: string;
  phone?: string;
  email?: string;
  website?: string;
  websiteMode?: "url" | "request-build" | "none";
  description?: string;
  image?: string;
  services?: string[];
  yearFounded?: string;
  employees?: string;
  verified?: boolean;
  tags?: string[];
};

export default function BusinessProfile({
  profile,
  backHref,
  backLabel = "Back",
  actions,
}: {
  profile: ProfileView;
  backHref: string;
  backLabel?: string;
  actions?: React.ReactNode;
}) {
  const image = profile.image || PEXELS_DEFAULT;

  return (
    <div>
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm font-semibold text-forest hover:text-forest-hover"
      >
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="mt-5 overflow-hidden rounded-3xl border border-navy/8 bg-white shadow-sm">
        <div className="relative h-52 md:h-72">
          <Image
            src={image}
            alt={profile.name}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
            <div className="flex flex-wrap items-center gap-2">
              {profile.verified && (
                <span className="rounded-md bg-forest px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                  Verified
                </span>
              )}
              <span className="rounded-md bg-white/15 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
                {profile.subtitle}
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold text-white md:text-4xl">
              {profile.name}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-white/80">
              <MapPin className="h-4 w-4" />
              {profile.location} · {profile.state}
            </p>
          </div>
        </div>

        <div className="grid gap-8 p-6 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.85fr)] md:p-8">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <span className="inline-flex items-center gap-1.5 font-display text-2xl font-bold text-navy">
                <Star className="h-5 w-5 text-amber-500" fill="currentColor" />
                {profile.rating.toFixed(1)}
              </span>
              <span className="text-sm text-slate">
                {profile.reviews} reviews
              </span>
            </div>

            <h2 className="mt-8 font-display text-lg font-bold text-navy">About</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate">
              {profile.description ||
                `${profile.name} is a verified organization listed on NaijaPass for public-sector and civic engagement.`}
            </p>

            {!!profile.services?.length && (
              <>
                <h2 className="mt-8 font-display text-lg font-bold text-navy">
                  Services
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-navy"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </>
            )}

            {!!profile.tags?.length && (
              <>
                <h2 className="mt-8 font-display text-lg font-bold text-navy">
                  Amenities
                </h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-navy/10 px-2.5 py-1 text-xs font-semibold text-navy-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}

            {actions && <div className="mt-8">{actions}</div>}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-navy/8 bg-mist/60 p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-slate">
                Contact
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {profile.phone && (
                  <li>
                    <a
                      href={`tel:${profile.phone}`}
                      className="inline-flex items-center gap-2 font-medium text-navy hover:text-forest"
                    >
                      <Phone className="h-4 w-4 text-forest" />
                      {profile.phone}
                    </a>
                  </li>
                )}
                {profile.email && (
                  <li>
                    <a
                      href={`mailto:${profile.email}`}
                      className="inline-flex items-center gap-2 font-medium text-navy hover:text-forest"
                    >
                      <Mail className="h-4 w-4 text-forest" />
                      {profile.email}
                    </a>
                  </li>
                )}
                {profile.websiteMode === "url" && profile.website && (
                  <li>
                    <a
                      href={profile.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 font-medium text-navy hover:text-forest"
                    >
                      <Globe className="h-4 w-4 text-forest" />
                      Visit website
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </li>
                )}
                {profile.websiteMode === "request-build" && (
                  <li>
                    <button
                      type="button"
                      onClick={() =>
                        toast.success(
                          "Build request sent. NaijaPass will contact this business about a website.",
                        )
                      }
                      className="inline-flex items-center gap-2 font-medium text-forest"
                    >
                      <Wrench className="h-4 w-4" />
                      Website build requested
                    </button>
                  </li>
                )}
                {!profile.website && profile.websiteMode !== "request-build" && (
                  <li className="inline-flex items-center gap-2 text-slate">
                    <Globe className="h-4 w-4" />
                    No website listed
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-navy/8 bg-white p-5">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-slate">
                Company
              </h3>
              <dl className="mt-4 space-y-3 text-sm">
                {profile.yearFounded && (
                  <div className="flex items-start gap-2">
                    <Building2 className="mt-0.5 h-4 w-4 text-forest" />
                    <div>
                      <dt className="text-slate">Founded</dt>
                      <dd className="font-semibold text-navy">{profile.yearFounded}</dd>
                    </div>
                  </div>
                )}
                {profile.employees && (
                  <div className="flex items-start gap-2">
                    <Users className="mt-0.5 h-4 w-4 text-forest" />
                    <div>
                      <dt className="text-slate">Team size</dt>
                      <dd className="font-semibold text-navy">{profile.employees}</dd>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-forest" />
                  <div>
                    <dt className="text-slate">Primary state</dt>
                    <dd className="font-semibold text-navy">{profile.state}</dd>
                  </div>
                </div>
              </dl>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
