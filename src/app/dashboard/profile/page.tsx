import type { Metadata } from "next";
import ProfileView from "@/components/dashboard/ProfileView";

export const metadata: Metadata = {
  title: "Profile",
  description: "Your NaijaPass identity, verification, and contact details.",
};

export default function ProfilePage() {
  return <ProfileView />;
}
