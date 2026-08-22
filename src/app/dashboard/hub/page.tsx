import type { Metadata } from "next";
import StateHub from "@/components/dashboard/StateHub";

export const metadata: Metadata = {
  title: "State Hub",
  description:
    "Official state directories, regulatory library, and civic infrastructure data across Nigeria.",
};

export default function HubPage() {
  return <StateHub />;
}
