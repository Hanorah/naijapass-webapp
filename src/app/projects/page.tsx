import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import ProjectsExplorer from "@/components/ProjectsExplorer";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Browse verified public infrastructure and procurement projects across Nigeria.",
};

export default function ProjectsPage() {
  return (
    <div className="bg-white">
      <PageHero
        label="Projects"
        title="Government projects across Nigeria"
        description="Browse verified public infrastructure and procurement projects. Filter by state, status, administration, and budget."
      />
      <ProjectsExplorer />
    </div>
  );
}
