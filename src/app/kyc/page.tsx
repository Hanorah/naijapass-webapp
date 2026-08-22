import type { Metadata } from "next";
import KycFlow from "@/components/KycFlow";

export const metadata: Metadata = {
  title: "Verify Account",
  description:
    "Complete individual identity or business KYC to access the NaijaPass governance portal.",
};

export default function KycPage() {
  return <KycFlow />;
}
