import type { Metadata } from "next";
import { Suspense } from "react";
import AdminSignInForm from "@/components/admin/AdminSignInForm";

export const metadata: Metadata = {
  title: "Admin Console — NaijaPass",
  description: "Restricted sign-in for NaijaPass platform administrators.",
  robots: { index: false, follow: false },
};

export default function AdminSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-[#120a1a] text-sm text-white/60">
          Loading admin console…
        </div>
      }
    >
      <AdminSignInForm />
    </Suspense>
  );
}
