import type { Metadata } from "next";
import ProcurementIntel from "@/components/dashboard/ProcurementIntel";

export const metadata: Metadata = {
  title: "Procurement Intelligence",
  description:
    "Discover, analyze, and bid on government contracts across Nigeria.",
};

export default function PortalProcurementPage() {
  return <ProcurementIntel />;
}
