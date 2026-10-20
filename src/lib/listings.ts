import type { MarketplaceCategory, MarketplaceListing, ListingStatus } from "@/data/marketplace";
import type { ApiListing } from "@/lib/api/client";

const categories = new Set<string>(["construction", "logistics", "it", "manufacturing"]);

function toCategory(value: string): MarketplaceCategory {
  return (categories.has(value) ? value : "construction") as MarketplaceCategory;
}

function toStatus(value: string): ListingStatus {
  if (value === "live" || value === "pending" || value === "hidden") return value;
  return "hidden";
}

export function apiListingToMarketplace(row: ApiListing): MarketplaceListing {
  return {
    id: row.id,
    name: row.title,
    category: toCategory(row.category),
    subcategory: row.category,
    rating: 0,
    reviews: 0,
    location: [row.lga, row.state].filter(Boolean).join(", "),
    state: row.state,
    lga: row.lga ?? "",
    distance: "",
    status: toStatus(row.status),
    description: row.description ?? undefined,
    image: row.image_url ?? undefined,
    verified: row.status === "live",
  };
}

export function marketplaceToCreatePayload(listing: MarketplaceListing) {
  return {
    title: listing.name,
    category: listing.category,
    state: listing.state,
    lga: listing.lga || undefined,
    description: listing.description,
    imageUrl: listing.image,
    status: listing.status === "live" ? ("live" as const) : ("pending" as const),
  };
}
