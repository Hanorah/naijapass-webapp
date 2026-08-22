import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How NaijaPass handles account and location data in the pilot product.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <PageHero
        label="Legal"
        title="Privacy Policy"
        description="A plain-language summary of what we store during the NaijaPass pilot."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 text-[15px] leading-relaxed text-slate md:px-8">
        <p>
          This demo stores your session, profile fields, notification
          preferences, and marketplace listings in your browser (localStorage).
          Demo accounts are not a production NDPR-compliant backend.
        </p>
        <p>
          Location is used only to suggest a default state. You can change state
          anytime from the portal header.
        </p>
        <p>
          For the production product, citizen data will follow NDPR requirements
          and Nigerian data-residency practices described in the NaijaPass PRD.
        </p>
        <Link href="/contact" className="font-semibold text-forest">
          Ask a privacy question
        </Link>
      </div>
    </div>
  );
}
