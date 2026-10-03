import type { CSSProperties } from "react";
import "./landing/landing.css";
import { LandingNav } from "./landing/LandingNav";
import { HeroSection } from "./landing/HeroSection";
import { ProblemsSection } from "./landing/ProblemsSection";
import { ExampleSection } from "./landing/ExampleSection";
import { OptionsSection } from "./landing/OptionsSection";
import { HowItWorksSection } from "./landing/HowItWorksSection";
import { FaqSection } from "./landing/FaqSection";
import { ClosingSection } from "./landing/ClosingSection";
import { VideoRequestProvider } from "./landing/VideoRequestProvider";

// Landing-page type scale: nine fluid roles, each a clamp from 390px → 1440px.
// Scoped to the landing root only (not the global theme or Tailwind config) so
// Walker/Creator screens are untouched. Elements reference these via
// `text-[length:var(--text-<role>)]`.
const typeScale = {
  "--text-display": "clamp(2.375rem, 1.771rem + 2.476vw, 4rem)",
  "--text-h2-lead": "clamp(2rem, 1.629rem + 1.524vw, 3rem)",
  "--text-h2": "clamp(1.75rem, 1.471rem + 1.143vw, 2.5rem)",
  "--text-card": "clamp(1.625rem, 1.486rem + 0.571vw, 2rem)",
  "--text-h3": "clamp(1.125rem, 1.079rem + 0.19vw, 1.25rem)",
  "--text-lead": "clamp(1.0625rem, 1.016rem + 0.19vw, 1.1875rem)",
  "--text-body": "clamp(1rem, 0.977rem + 0.095vw, 1.0625rem)",
  "--text-small": "clamp(0.8125rem, 0.789rem + 0.095vw, 0.875rem)",
  "--text-eyebrow": "clamp(0.75rem, 0.727rem + 0.095vw, 0.8125rem)",
} as CSSProperties;

const Index = () => {
  return (
    <VideoRequestProvider>
      <div id="top" style={typeScale} className="usha-landing-root min-h-screen bg-white text-[#0A0A0A]">
        <LandingNav />
        <HeroSection />
        <ProblemsSection />
        <ExampleSection />
        <OptionsSection />
        <HowItWorksSection />
        <FaqSection />
        <ClosingSection />
      </div>
    </VideoRequestProvider>
  );
};

export default Index;
