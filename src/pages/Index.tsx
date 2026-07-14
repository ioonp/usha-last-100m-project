import "./landing/landing.css";
import { usePrefersReducedMotion } from "./landing/hooks";
import { LandingNav } from "./landing/LandingNav";
import { HeroSection } from "./landing/HeroSection";
import { RecognitionSection } from "./landing/RecognitionSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { CtaSection } from "./landing/CtaSection";
import { LandingFooter } from "./landing/LandingFooter";

const Index = () => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <HeroSection />
      <RecognitionSection reducedMotion={reducedMotion} />
      <HowItWorksSection reducedMotion={reducedMotion} />
      <CtaSection reducedMotion={reducedMotion} />
      <LandingFooter />
    </div>
  );
};

export default Index;
