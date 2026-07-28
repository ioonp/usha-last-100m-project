import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { landingStrings } from "@/lib/strings";
import { useInView } from "./hooks";

const t = landingStrings.cta;

export function CtaSection({ reducedMotion }: { reducedMotion: boolean }) {
  const { ref, inView } = useInView<HTMLDivElement>(reducedMotion);

  return (
    <section className="px-4 pb-10 md:pb-[72px]">
      <div
        ref={ref}
        className={cn(
          "usha-landing-reveal relative overflow-hidden max-w-[1024px] mx-auto rounded-[32px] bg-primary text-primary-foreground text-center px-6 py-11 md:px-16 md:py-[72px]",
          inView && "usha-landing-in",
        )}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 20% 0%, rgba(201,84,43,.28), transparent 55%), radial-gradient(circle at 90% 100%, rgba(201,84,43,.18), transparent 50%)",
          }}
        />
        <div className="relative">
          <div className="step-eyebrow text-center mb-4 text-accent">{t.eyebrow}</div>
          <h2 className="font-display font-semibold text-[30px] md:text-5xl leading-[1.08] -tracking-[0.02em] mb-3.5 text-primary-foreground">
            {t.heading}
          </h2>
          <p className="text-[17px] text-primary-foreground/72 max-w-[44ch] mx-auto mb-8">{t.body}</p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <Link to="/auth?mode=signup">
              <Button size="lg" className="rounded-full px-7 h-[52px] text-[15.5px] bg-accent text-accent-foreground hover:bg-accent/90 shadow-[0_8px_24px_rgba(201,84,43,.4)]">
                {t.ctaPrimary}
                <ArrowRight className="ml-1 size-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-7 h-[52px] text-[15.5px] bg-transparent text-primary-foreground border-primary-foreground/25 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              onClick={() => toast(landingStrings.demoUnavailable)}
            >
              {t.ctaSecondary}
            </Button>
          </div>
          <div className="mt-5 font-mono text-[13.5px] tracking-wide text-primary-foreground/50">{t.note}</div>
        </div>
      </div>
    </section>
  );
}
