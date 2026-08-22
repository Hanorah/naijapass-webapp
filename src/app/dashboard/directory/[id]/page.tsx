"use client";

import { use } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Phone } from "lucide-react";
import BusinessProfile from "@/components/dashboard/BusinessProfile";
import { directoryCategories, getBusinessById } from "@/data/businesses";

export default function DirectoryProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const biz = getBusinessById(id);

  if (!biz) {
    return (
      <div className="px-4 py-16 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Business not found</h1>
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
          <a
            href={`tel:${biz.phone}`}
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            <Phone className="h-4 w-4" />
            Call business
          </a>
          <button
            type="button"
            onClick={() => toast.success(`Saved ${biz.name} to your directory.`)}
            className="rounded-xl border border-navy/15 px-5 py-3 text-sm font-semibold text-navy hover:bg-mist"
          >
            Save
          </button>
        </div>
      }
    />
  );
}
