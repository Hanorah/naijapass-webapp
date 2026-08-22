import type { Metadata } from "next";
import MarketplaceHub from "@/components/dashboard/MarketplaceHub";

export const metadata: Metadata = {
  title: "Market Hub",
  description:
    "Find verified local services and list your business on the NaijaPass Market Hub.",
};

export default function MarketplacePage() {
  return <MarketplaceHub />;
}
