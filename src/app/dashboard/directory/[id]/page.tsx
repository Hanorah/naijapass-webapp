"use client";

import { use } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Phone } from "lucide-react";
import BusinessProfile from "@/components/dashboard/BusinessProfile";
import { useBusinesses } from "@/lib/db/businesses";
import { directoryCategories } from "@/data/businesses";

export default function DirectoryProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { allBusinesses, loading } = useBusinesses();
  const biz = allBusinesses.find((item) => item.id === id);

  if (loading) {
    return (
      <div className="px-4 py-16 text-center md:px-6">
        <p className="text-sm text-slate">Loading business profile…</p>
      </div>
    );
  }

  if (!biz) {
    return (
      <div className="px-4 py-16 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Business not found</h1>
        <p className="mt-2 text-sm text-slate">
          This company is not in the verified directory yet.
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
              onClick={() => toast.success("Contact request logged.")}
              className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-hover"
            >
              <Phone className="h-4 w-4" />
              Request contact
            </button>
          )}
        </div>
      }
    />
  );
}
