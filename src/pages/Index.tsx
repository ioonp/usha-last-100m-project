import "./landing/landing.css";
import { usePrefersReducedMotion } from "./landing/hooks";
import { LandingNav } from "./landing/LandingNav";
import { HeroSection } from "./landing/HeroSection";
import { TurnSection } from "./landing/TurnSection";
import { RecognitionSection } from "./landing/RecognitionSection";
import { HowSection } from "./landing/HowSection";
import { CtaSection } from "./landing/CtaSection";
import { LandingFooter } from "./landing/LandingFooter";

const Index = () => {
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />
      <HeroSection reducedMotion={reducedMotion} />
      <TurnSection reducedMotion={reducedMotion} />
      <RecognitionSection reducedMotion={reducedMotion} />
      <HowSection reducedMotion={reducedMotion} />
      <CtaSection reducedMotion={reducedMotion} />
      <LandingFooter />
    </div>
  );
};

export default Index;
