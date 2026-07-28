import { useState } from "react";
import { cn } from "@/lib/utils";
import { landingStrings } from "@/lib/strings";
import { useInView } from "./hooks";

const t = landingStrings.recognition;

export function RecognitionSection({ reducedMotion }: { reducedMotion: boolean }) {
  const heading = useInView<HTMLDivElement>(reducedMotion);
  const after = useInView<HTMLDivElement>(reducedMotion);
  // Which worked example is on show. Presentational only — the page reads the
  // same for everyone, the pills just pick which segment the story is told in.
  const [segmentId, setSegmentId] = useState(t.segments[0].id);
  const segment = t.segments.find((s) => s.id === segmentId) ?? t.segments[0];

  return (
    <section className="bg-secondary py-14 md:py-[110px] text-center">
      <div className="container mx-auto px-4">
        <div ref={heading.ref} className={cn("usha-landing-reveal", heading.inView && "usha-landing-in")}>
          <div className="step-eyebrow text-center mb-4">{t.eyebrow}</div>

          {/* Clay fills the selected pill only — it stays the brand/progress
              colour, so at most one pill wears it at a time. */}
          <div
            role="group"
            aria-label={t.segmentsLabel}
            className="flex flex-wrap justify-center gap-2 mb-7"
          >
            {t.segments.map((s) => {
              const selected = s.id === segment.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setSegmentId(s.id)}
                  className={cn(
                    "rounded-full px-4 h-9 text-[14px] border transition-colors",
                    selected
                      ? "bg-accent text-accent-foreground border-accent"
                      : "bg-card text-muted-foreground border-border hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              );
            })}
          </div>

          <h2 className="font-display font-semibold text-[30px] md:text-5xl leading-[1.08] -tracking-[0.02em] mb-4">
            {segment.heading}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-[52ch] mx-auto mb-8 leading-relaxed">
            {segment.lead}
          </p>
        </div>

        {/* Bubbles render statically — the staggered rise was dropped to keep the
            page calm; the trail draw is the one signature motion. */}
        <div className="flex flex-col gap-3 max-w-[440px] mx-auto">
          {segment.thread.map((msg, i) => (
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
