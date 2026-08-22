import type { Metadata } from "next";
import EmergencyCommand from "@/components/dashboard/EmergencyCommand";

export const metadata: Metadata = {
  title: "Emergency & Safety Command",
  description: "Real-time civic intelligence and rapid response directory.",
};

export default function EmergencyPage() {
  return <EmergencyCommand />;
}
