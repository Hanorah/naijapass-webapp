import type { Metadata } from "next";
import BusinessDirectory from "@/components/dashboard/BusinessDirectory";

export const metadata: Metadata = {
  title: "Verified Business Directory",
  description:
    "Discover trusted merchants, service providers, and facilities across Nigeria.",
};

export default function DirectoryPage() {
  return <BusinessDirectory />;
}
