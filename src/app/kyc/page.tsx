import type { Metadata } from "next";
import { Suspense } from "react";
import KycFlow from "@/components/KycFlow";

export const metadata: Metadata = {
  title: "Verify Account",
  description:
    "Complete individual identity or business KYC to access the NaijaPass governance portal.",
};

export default function KycPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center bg-white text-sm text-slate">
          Preparing verification…
        </div>
      }
    >
      <KycFlow />
    </Suspense>
  );
}
