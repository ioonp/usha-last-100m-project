import { Camera, DoorOpen, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { landingStrings } from "@/lib/strings";
import { useInView } from "./hooks";
import { TurnMapIllustration } from "./TurnMapIllustration";

const t = landingStrings.turn;
const stepIcons = [MapPin, Camera, DoorOpen];

export function TurnSection({ reducedMotion }: { reducedMotion: boolean }) {
  const copy = useInView<HTMLDivElement>(reducedMotion);
  const map = useInView<HTMLDivElement>(reducedMotion);

  return (
    <section className="bg-secondary py-14 md:py-[110px]">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-9 md:gap-16 items-center">
        <div
          ref={copy.ref}
          className={cn("usha-landing-reveal order-2 md:order-1", copy.inView && "usha-landing-in")}
        >
          <div className="step-eyebrow mb-4">{t.eyebrow}</div>
          <h2 className="font-display font-semibold text-[30px] md:text-5xl leading-[1.08] -tracking-[0.02em] mb-4">
            {t.heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[52ch] leading-relaxed">{t.lead}</p>

          <div className="mt-6 flex flex-col gap-4">
            {t.steps.map((step, i) => {
              const Icon = stepIcons[i];
              return (
                <div key={step.title} className="flex gap-3.5 items-start">
                  <div className="size-[38px] rounded-[11px] bg-accent-soft text-accent flex items-center justify-center shrink-0">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-[15.5px] font-semibold mb-0.5">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-snug">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          ref={map.ref}
          className={cn("usha-landing-reveal order-1 md:order-2", map.inView && "usha-landing-in")}
        >
          <div className="max-w-[440px] mx-auto md:max-w-none">
            <TurnMapIllustration go={map.inView} />
          </div>
        </div>
      </div>
    </section>
  );
}
