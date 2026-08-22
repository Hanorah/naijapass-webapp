import type { Metadata } from "next";
import AdminConsole from "@/components/dashboard/AdminConsole";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage NaijaPass users, verifications, and marketplace listings.",
};

export default function AdminPage() {
  return <AdminConsole />;
}
