import { LandingNav } from "./landing/LandingNav";
import { HeroSection } from "./landing/HeroSection";
import { ProblemsSection } from "./landing/ProblemsSection";
import { ExampleSection } from "./landing/ExampleSection";
import { OptionsSection } from "./landing/OptionsSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { FaqSection } from "./landing/FaqSection";
import { ClosingSection } from "./landing/ClosingSection";

const Index = () => {
  return (
    <div id="top" className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <HeroSection />
      <ProblemsSection />
      <ExampleSection />
      <OptionsSection />
      <HowItWorksSection />
      <FaqSection />
      <ClosingSection />
    </div>
  );
};

export default Index;
