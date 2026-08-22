"use client";

import { use } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Gavel, MessageCircle } from "lucide-react";
import BusinessProfile from "@/components/dashboard/BusinessProfile";
import { useSession } from "@/components/SessionProvider";
import { marketplaceCategories, stateDisplayName } from "@/data/marketplace";

export default function MarketplaceProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { listings, user } = useSession();
  const listing = listings.find((item) => item.id === id);
  const isBusiness = user?.role === "business" || user?.role === "admin";

  if (!listing) {
    return (
      <div className="px-4 py-16 text-center md:px-6">
        <h1 className="font-display text-2xl font-bold text-navy">Listing not found</h1>
        <Link
          href="/dashboard/marketplace"
          className="mt-4 inline-block text-sm font-semibold text-forest"
        >
          Back to Market Hub
        </Link>
      </div>
    );
  }

  const categoryLabel =
    marketplaceCategories.find((c) => c.id === listing.category)?.label ??
    listing.category;

  return (
    <BusinessProfile
      backHref="/dashboard/marketplace"
      backLabel="Back to Market Hub"
      profile={{
        id: listing.id,
        name: listing.name,
        subtitle: `${categoryLabel} · ${listing.subcategory}`,
        rating: listing.rating,
        reviews: listing.reviews,
        location: listing.location,
        state: stateDisplayName(listing.state),
        phone: listing.phone,
        email: listing.email,
        website: listing.website,
        websiteMode: listing.websiteMode,
        description: listing.description,
        image: listing.image,
        services: listing.services,
        yearFounded: listing.yearFounded,
        employees: listing.employees,
        verified: listing.verified ?? listing.integrated,
      }}
      actions={
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() =>
              toast.success(
                listing.integrated
                  ? `Connect & Pay opened for ${listing.name}.`
                  : `Quote requested from ${listing.name}.`,
              )
            }
            className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white hover:bg-forest-hover"
          >
            <MessageCircle className="h-4 w-4" />
            {listing.integrated ? "Connect & Pay" : "Request Quote"}
          </button>
          {isBusiness && (
            <Link
              href="/dashboard/procurement"
              className="inline-flex items-center gap-2 rounded-xl border border-navy/15 px-5 py-3 text-sm font-semibold text-navy hover:bg-mist"
            >
              <Gavel className="h-4 w-4 text-forest" />
              Bid on government contracts
            </Link>
          )}
        </div>
      }
    />
  );
}
