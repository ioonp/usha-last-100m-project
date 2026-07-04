import { Camera, MapPin, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { landingStrings } from "@/lib/strings";
import { useInView } from "./hooks";

const t = landingStrings.how;
const cardIcons = [MapPin, Camera, QrCode];

export function HowSection({ reducedMotion }: { reducedMotion: boolean }) {
  const head = useInView<HTMLDivElement>(reducedMotion);
  const cards = useInView<HTMLDivElement>(reducedMotion);

  return (
    <section className="pb-14 md:pb-[110px]">
      <div className="container mx-auto px-4">
        <div
          ref={head.ref}
          className={cn("usha-landing-reveal text-center mb-9 md:mb-14", head.inView && "usha-landing-in")}
        >
          <div className="step-eyebrow text-center mb-4">{t.eyebrow}</div>
          <h2 className="font-display font-semibold text-[30px] md:text-5xl leading-[1.08] -tracking-[0.02em] mb-4">
            {t.heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[52ch] mx-auto leading-relaxed">{t.lead}</p>
        </div>

        <div ref={cards.ref} className={cn("usha-landing-cards grid md:grid-cols-3 gap-4 md:gap-5", cards.inView && "usha-landing-go")}>
          {t.cards.map((card, i) => {
            const Icon = cardIcons[i];
            return (
              <div
                key={card.number}
                className="usha-landing-card bg-card border border-border shadow-card rounded-card p-6 md:p-7"
              >
                <div className="font-mono text-xs tracking-widest mb-4 text-muted-foreground/70">{card.number}</div>
                <div className="size-12 rounded-[14px] bg-accent-soft text-accent flex items-center justify-center mb-4">
                  <Icon className="size-6" />
                </div>
                <h3 className="font-display font-semibold text-[21px] -tracking-[0.01em] mb-2">{card.title}</h3>
                <p className="text-[14.5px] text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
