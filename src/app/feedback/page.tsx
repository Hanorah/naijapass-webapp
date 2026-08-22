import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import FeedbackBoard from "@/components/FeedbackBoard";

export const metadata: Metadata = {
  title: "Project Feedback",
  description:
    "Live field reports and citizen sentiment for the Lagos-Ibadan Expressway Expansion.",
};

export default function FeedbackPage() {
  return (
    <div className="bg-white">
      <PageHero
        label="Feedback"
        title="Field reports and citizen sentiment"
        description="Live updates from the Lagos-Ibadan Expressway Expansion — track a segment, read site reports, and see public sentiment."
      />
      <FeedbackBoard />
    </div>
  );
}
