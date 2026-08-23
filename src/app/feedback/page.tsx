import type { Metadata } from "next";
import Link from "next/link";
import PageHero from "@/components/PageHero";
import FeedbackBoard from "@/components/FeedbackBoard";
import { getProjectById } from "@/data/projects";

type Props = {
  searchParams: Promise<{ project?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { project: projectId } = await searchParams;
  const project = projectId ? getProjectById(projectId) : undefined;
  if (project) {
    return {
      title: `Feedback · ${project.title}`,
      description: `Field reports and citizen sentiment for ${project.title}.`,
    };
  }
  return {
    title: "Project Feedback",
    description: "Field reports and citizen sentiment for public projects in Nigeria.",
  };
}

export default async function FeedbackPage({ searchParams }: Props) {
  const { project: projectId } = await searchParams;
  const project = projectId ? getProjectById(projectId) : undefined;

  if (!project) {
    return (
      <div className="bg-white">
        <PageHero
          label="Feedback"
          title="Choose a project"
          description="Open feedback from a project’s detail page, or browse the projects index."
        />
        <div className="mx-auto max-w-7xl px-5 py-12 text-center md:px-8">
          <Link
            href="/projects"
            className="inline-flex rounded-xl bg-forest px-5 py-3 text-sm font-semibold text-white"
          >
            Browse projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <PageHero
        label="Feedback"
        title={`Reports · ${project.title}`}
        description={`Live field updates and citizen sentiment for ${project.state} — ${project.lga}.`}
      />
      <FeedbackBoard projectId={project.id} />
    </div>
  );
}
