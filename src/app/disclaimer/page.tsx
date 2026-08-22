import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Government Disclaimer",
  description:
    "Disclaimer on official government data, procurement, and emergency information on NaijaPass.",
};

export default function DisclaimerPage() {
  return (
    <div className="bg-white">
      <PageHero
        label="Legal"
        title="Government Disclaimer"
        description="NaijaPass is an independent civic platform. It is not an official government website."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 text-[15px] leading-relaxed text-slate md:px-8">
        <p>
          Listings, tender summaries, MDA contacts, laws, and emergency numbers
          shown in this demo are curated for product exploration. Always confirm
          critical actions on the relevant federal, state, or LGA portal before
          bidding, filing, or relying on emergency routing.
        </p>
        <p>
          NaijaPass does not replace official gazettes, Bureau of Public
          Procurement notices, court records, or emergency call centres. Where
          information conflicts, the official source controls.
        </p>
        <p>
          Partnerships with state governments and data providers may expand
          coverage over time. Until then, treat portal content as informational
          and illustrative.
        </p>
        <div className="flex flex-wrap gap-5 pt-2">
          <Link href="/terms" className="font-semibold text-forest">
            Terms of Service
          </Link>
          <Link href="/privacy" className="font-semibold text-forest">
            Privacy Policy
          </Link>
          <Link href="/contact" className="font-semibold text-forest">
            Contact
          </Link>
        </div>
      </div>
    </div>
  );
}
