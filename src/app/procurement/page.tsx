import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProcurementExplorer from "@/components/ProcurementExplorer";

export const metadata: Metadata = {
  title: "Procurement Data",
  description:
    "Search and export open tenders and awarded contracts across Nigeria’s 36 states and FCT.",
};

export default function ProcurementPage() {
  return (
    <div className="bg-white">
      <PageHero
        label="Procurement"
        title="Tenders and awards across Nigeria"
        description="Browse open tenders and awarded contracts nationwide. Filter by state, LGA, category, status, and year — then export the results."
      />
      <ProcurementExplorer />
    </div>
  );
}
