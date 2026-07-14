import { cn } from "@/lib/utils";
import { landingStrings } from "@/lib/strings";
import { useInView } from "./hooks";

const t = landingStrings.recognition;

export function RecognitionSection({ reducedMotion }: { reducedMotion: boolean }) {
  const heading = useInView<HTMLDivElement>(reducedMotion);
  const after = useInView<HTMLDivElement>(reducedMotion);

  return (
    <section className="bg-secondary py-14 md:py-[110px] text-center">
      <div className="container mx-auto px-4">
        <div ref={heading.ref} className={cn("usha-landing-reveal", heading.inView && "usha-landing-in")}>
          <div className="step-eyebrow text-center mb-4">{t.eyebrow}</div>
          <h2 className="font-display font-semibold text-[30px] md:text-5xl leading-[1.08] -tracking-[0.02em] mb-4">
            {t.heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[52ch] mx-auto mb-8 leading-relaxed">
            {t.lead}
          </p>
        </div>

        {/* Bubbles render statically — the staggered rise was dropped to keep the
            page calm; the trail draw is the one signature motion. */}
        <div className="flex flex-col gap-3 max-w-[440px] mx-auto">
          {t.thread.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "px-[18px] py-[13px] rounded-[18px] text-[15px] max-w-[78%]",
                msg.from === "them"
                  ? "self-start bg-card text-card-foreground shadow-card rounded-bl-[5px]"
                  : "self-end bg-[#DCE7FF] text-[#1c3b7a] rounded-br-[5px]",
              )}
            >
              {msg.text}
            </div>
          ))}
        </div>

        <div
          ref={after.ref}
          className={cn(
            "usha-landing-reveal mt-9 font-display font-medium text-xl md:text-[26px] -tracking-[0.01em]",
            after.inView && "usha-landing-in",
          )}
        >
          {t.afterPrefix}
          <span className="text-success">{t.afterHighlight}</span>
          {t.afterSuffix}
        </div>
      </div>
    </section>
  );
}
