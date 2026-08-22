import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms governing use of the NaijaPass civic and commerce platform.",
};

export default function TermsPage() {
  return (
    <div className="bg-white">
      <PageHero
        label="Legal"
        title="Terms of Service"
        description="These demo terms cover how you may use NaijaPass while the platform is in pilot."
      />
      <div className="mx-auto max-w-3xl space-y-6 px-5 py-12 text-[15px] leading-relaxed text-slate md:px-8">
        <p>
          NaijaPass provides civic intelligence, directories, and procurement
          discovery tools for Nigeria. By creating an account or using the
          portal, you agree to use the service lawfully and not to misuse
          listings, tenders, or emergency information.
        </p>
        <p>
          Procurement and directory data shown in this front-end demo is
          illustrative. Official bidding, awards, and legal filings must follow
          the relevant government portal and applicable law.
        </p>
        <p>
          We may suspend accounts that attempt fraud, scrape personal data, or
          submit false verification documents.
        </p>
        <Link href="/contact" className="font-semibold text-forest">
          Contact us
        </Link>
      </div>
    </div>
  );
}
