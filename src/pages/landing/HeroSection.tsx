import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { landingStrings } from "@/lib/strings";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { RequestForm } from "@/components/RequestForm";
import { CREATE_GUIDE_ROUTE } from "./links";

const t = landingStrings.hero;

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}

export function HeroSection() {
  const [formOpen, setFormOpen] = useState(false);
  const videoBtnRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <section className="flex flex-col md:flex-row md:items-center gap-[22px] md:gap-[72px] px-5 pt-9 pb-14 md:px-[120px] md:pt-[88px] md:pb-[104px]">
        <div className="flex flex-col gap-[22px] md:gap-7 md:flex-1">
          <span className="self-start inline-flex items-center gap-2 md:gap-2.5 px-3.5 md:px-4 py-1.5 md:py-2 rounded-full bg-accent-soft text-[13px] md:text-sm font-medium">
            <span className="w-[7px] h-[7px] md:w-2 md:h-2 rounded-full bg-accent" />
            {t.eyebrow}
          </span>

          <h1 className="font-display text-[44px] md:text-[76px] leading-[1.04] md:leading-[1.02] font-medium -tracking-[0.025em]">
            {t.title}{" "}
            <em className="italic font-normal">{t.titleEmphasis}</em>
          </h1>

          <p className="text-[17px] md:text-xl leading-[1.55] text-muted-foreground md:max-w-[560px]">
            {t.subtitle}
          </p>

          <div className="flex flex-col gap-1.5 mt-1 md:flex-row md:items-center md:gap-7 md:mt-2">
            <button
              type="button"
              ref={videoBtnRef}
              onClick={() => setFormOpen(true)}
              className="flex md:inline-flex items-center justify-center md:justify-start gap-2.5 h-14 md:h-[58px] md:px-[30px] rounded-full bg-primary text-primary-foreground text-[17px] font-semibold"
            >
              {t.primaryCta}
              <ArrowRight />
            </button>
            <Link
              to={CREATE_GUIDE_ROUTE}
              onClick={() => trackEvent(EVENTS.LANDING_SIGNUP_CLICKED, { placement: "hero" })}
              className="flex md:inline items-center justify-center h-12 md:h-auto text-base font-medium text-foreground underline underline-offset-4"
            >
              {t.secondaryCta}
            </Link>
          </div>

          <p className="text-[13px] md:text-sm text-center md:text-left text-muted-foreground">{t.note}</p>
        </div>

        {/* Phone frame — the real guide step screen. Decorative here (not a link). */}
        <div className="self-center md:self-auto shrink-0 w-[300px] h-[512px] md:w-[380px] md:h-[650px] mt-4 md:mt-0 p-2.5 md:p-3 rounded-[44px] md:rounded-[52px] bg-primary shadow-[0_30px_60px_-24px_rgba(28,26,23,0.45)] md:shadow-[0_40px_80px_-30px_rgba(28,26,23,0.45)]">
          <div className="w-full h-full rounded-[34px] md:rounded-[40px] bg-black overflow-hidden">
            <img src="/landing/guide-step.jpg" alt={t.phoneAlt} className="w-full h-full object-contain block" />
          </div>
        </div>
      </section>

      <RequestForm
        formType="video_guide"
        open={formOpen}
        onClose={() => setFormOpen(false)}
        triggerRef={videoBtnRef}
      />
    </>
  );
}
