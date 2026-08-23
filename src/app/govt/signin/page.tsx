import type { Metadata } from "next";
import { Suspense } from "react";
import GovtSignInForm from "@/components/govt/GovtSignInForm";

export const metadata: Metadata = {
  title: "State Government Portal — NaijaPass",
  description:
    "Sign-in for Nigeria's 36 state governments and the FCT Administration.",
  robots: { index: false, follow: false },
};

export default function GovtSignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-[#0b1220] text-sm text-white/60">
          Loading state portal…
        </div>
      }
    >
      <GovtSignInForm />
    </Suspense>
  );
}
