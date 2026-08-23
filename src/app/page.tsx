import Hero from "@/components/Hero";
import NigeriaReveal from "@/components/home/NigeriaReveal";
import SplitAudience from "@/components/home/SplitAudience";
import Craft from "@/components/home/Craft";
import FeaturedWork from "@/components/home/FeaturedWork";
import StatsBand from "@/components/home/StatsBand";
import Testimonials from "@/components/home/Testimonials";
import HowItWorks from "@/components/home/HowItWorks";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <NigeriaReveal />
      <SplitAudience />
      <Craft />
      <FeaturedWork />
      <StatsBand />
      <Testimonials />
      <HowItWorks />
      <FinalCta />
    </>
  );
}
