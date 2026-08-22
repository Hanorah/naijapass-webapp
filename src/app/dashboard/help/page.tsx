import type { Metadata } from "next";
import HelpCenter from "@/components/dashboard/HelpCenter";

export const metadata: Metadata = {
  title: "Help Center",
  description: "Guides, FAQs, and support for the NaijaPass governance portal.",
};

export default function HelpPage() {
  return <HelpCenter />;
}
