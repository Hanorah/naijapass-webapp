import type { Metadata } from "next";
import DashboardHome from "@/components/dashboard/DashboardHome";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your daily NaijaPass intelligence briefing.",
};

export default function DashboardPage() {
  return <DashboardHome />;
}
