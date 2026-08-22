import type { Metadata } from "next";
import SettingsPanel from "@/components/dashboard/SettingsPanel";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage account details, notifications, and portal security.",
};

export default function SettingsPage() {
  return <SettingsPanel />;
}
