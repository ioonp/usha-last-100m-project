import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { landingStrings } from "@/lib/strings";
import { HeroMapIllustration } from "./HeroMapIllustration";

const t = landingStrings.hero;

export function HeroSection() {
  return (
    <header className="pt-10 pb-14 md:pt-[86px] md:pb-[90px]">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-9 md:gap-16 items-center">
        <div>
          <div className="step-eyebrow mb-5">{t.eyebrow}</div>
          <h1 className="font-display font-semibold text-[42px] sm:text-6xl md:text-7xl leading-[1.02] -tracking-[0.025em] mb-6 text-balance">
            {t.headline}
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-[34ch] mb-8 leading-relaxed">
            {t.subhead}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="rounded-full px-7 h-[52px] text-[15.5px]">
                {t.ctaPrimary}
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
            <Link to="/demo">
              <Button size="lg" variant="ghost" className="rounded-full px-7 h-[52px] text-[15.5px]">
                {t.ctaSecondary}
              </Button>
            </Link>
          </div>
          <div className="mt-5 flex items-center gap-2 text-[13.5px] text-muted-foreground">
            <Check className="size-[15px] text-success" />
            {t.reassurance}
          </div>
          <div className="mt-3 font-mono text-xs tracking-wide text-muted-foreground/70">{t.proof}</div>
        </div>

        <HeroMapIllustration />
      </div>
    </header>
  );
}
