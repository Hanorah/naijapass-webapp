"use client";

import { use } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Phone } from "lucide-react";
import BusinessProfile from "@/components/dashboard/BusinessProfile";
import { useBusinessProfile } from "@/lib/db/businesses";
import { directoryCategories } from "@/data/businesses";

export default function DirectoryProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { business: biz, loading, error } = useBusinessProfile(id);

  if (loading) {
    return (
      <div className="px-4 py-16 text-center md:px-6">
        <p className="text-sm text-slate">Loading business profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-16 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Could not load profile</h1>
        <p className="mt-2 text-sm text-slate">{error}</p>
        <Link
          href="/dashboard/directory"
          className="mt-4 inline-block text-sm font-semibold text-forest"
        >
          Back to directory
        </Link>
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="px-4 py-16 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Business not found</h1>
        <p className="mt-2 text-sm text-slate">
          This company is not in the verified directory yet, or the link is outdated.
        </p>
        <Link
          href="/dashboard/directory"
          className="mt-4 inline-block text-sm font-semibold text-forest"
        >
          Back to directory
        </Link>
      </div>
    );
  }

  const categoryLabel =
    directoryCategories.find((c) => c.id === biz.category)?.label ?? biz.category;

  return (
    <BusinessProfile
      backHref="/dashboard/directory"
      backLabel="Back to directory"
      profile={{
        id: biz.id,
        name: biz.name,
        subtitle: `${categoryLabel} · ${biz.subcategory}`,
        rating: biz.rating,
        reviews: biz.reviews,
        location: biz.address,
        state: biz.state,
        phone: biz.phone,
        email: biz.email,
        website: biz.website,
        websiteMode: biz.websiteMode,
        description: biz.description,
        image: biz.image,
        services: biz.services,
        yearFounded: biz.yearFounded,
        employees: biz.employees,
        verified: biz.verified,
        tags: biz.tags,
      }}
      actions={
        <div className="flex flex-wrap gap-3">
          {biz.phone ? (
            <a
              href={`tel:${biz.phone.replace(/\s/g, "")}`}
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              <Phone className="h-4 w-4" />
              Call {biz.name.split(" ")[0]}
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                const subject = encodeURIComponent(`Contact request — ${biz.name}`);
                const body = encodeURIComponent(
                  `Hello ${biz.name},\n\nI found your listing on NaijaPass and would like to connect.\n`,
                );
                if (biz.email) {
                  window.location.href = `mailto:${biz.email}?subject=${subject}&body=${body}`;
                } else if (biz.phone) {
                  window.location.href = `tel:${biz.phone.replace(/\s/g, "")}`;
                } else {
                  toast.error("This business has no email or phone on file.");
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              <Phone className="h-4 w-4" />
              Contact business
            </button>
          )}
        </div>
      }
    />
  );
}
