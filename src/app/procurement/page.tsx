import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProcurementExplorer from "@/components/ProcurementExplorer";

export const metadata: Metadata = {
  title: "Procurement Data",
  description:
    "Search and export awarded contracts across Edo State local governments.",
};

export default function ProcurementPage() {
  return (
    <div className="bg-white">
      <PageHero
        label="Procurement"
        title="Awarded contracts and tenders"
        description="Search and export awarded contracts across Edo State local governments — status, amounts, and procuring entities."
      />
      <ProcurementExplorer />
    </div>
  );
}
