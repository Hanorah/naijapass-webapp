import type { Metadata } from "next";
import { Suspense } from "react";
import SignupChoice from "@/components/SignupChoice";

export const metadata: Metadata = {
  title: "Sign Up",
  description:
    "Create a NaijaPass account as an individual citizen or a registered business.",
};

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-white text-sm text-slate">
          Loading signup…
        </div>
      }
    >
      <SignupChoice />
    </Suspense>
  );
}
