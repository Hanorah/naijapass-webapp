import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import VisualizationDashboard from "@/components/VisualizationDashboard";

export const metadata: Metadata = {
  title: "Visualization",
  description:
    "National procurement dashboards — projects, awards, budget trends, and category mix.",
};

export default function VisualizationPage() {
  return (
    <div className="bg-white">
      <PageHero
        label="Visualization"
        title="National procurement dashboards"
        description="Projects, awards, budget trends, and category mix — a live view of public spend across Nigeria."
      />
      <VisualizationDashboard />
    </div>
  );
}
