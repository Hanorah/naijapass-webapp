import type { Metadata } from "next";
import { Suspense } from "react";
import SignInForm from "@/components/SignInForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to the NaijaPass governance portal.",
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-white text-sm text-slate">
          Loading sign in…
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
