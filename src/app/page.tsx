import Hero from "@/components/Hero";
import WordTicker from "@/components/home/WordTicker";
import Craft from "@/components/home/Craft";
import SplitAudience from "@/components/home/SplitAudience";
import FeaturedWork from "@/components/home/FeaturedWork";
import StatsBand from "@/components/home/StatsBand";
import Testimonials from "@/components/home/Testimonials";
import HowItWorks from "@/components/home/HowItWorks";
import FinalCta from "@/components/home/FinalCta";

export default function Home() {
  return (
    <>
      <Hero />
      <WordTicker />
      <Craft />
      <SplitAudience />
      <FeaturedWork />
      <StatsBand />
      <Testimonials />
      <HowItWorks />
      <FinalCta />
    </>
  );
}
