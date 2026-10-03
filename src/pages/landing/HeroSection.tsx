import { Link } from "react-router-dom";
import { landingStrings } from "@/lib/strings";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { CREATE_GUIDE_ROUTE } from "./links";
import { useVideoRequest } from "./videoRequestContext";

const t = landingStrings.hero;

function ArrowRight() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="13 6 19 12 13 18" />
    </svg>
  );
}

function CheckIconBlack() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0A0A0A" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

/** Dark bezel wrapper shared by the three fanned hero phones. */
function PhoneBezel({ children }: { children: React.ReactNode }) {
  return (
    <div className="aspect-[9/19] w-full rounded-[28px] bg-[#0A0A0A] p-2 md:p-2.5 shadow-[0_20px_48px_-20px_rgba(10,10,10,0.5)]">
      {children}
    </div>
  );
}

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <PhoneBezel>
      <div className="w-full h-full rounded-[22px] overflow-hidden bg-black">
        <img src={src} alt={alt} className="w-full h-full object-contain block" />
      </div>
    </PhoneBezel>
  );
}

/** Third hero phone — built in markup, not a screenshot (arrival state). */
function ArrivalPhoneMock() {
  return (
    <PhoneBezel>
      <div className="w-full h-full rounded-[22px] bg-[#111111] flex flex-col items-center justify-center gap-4 px-5 text-center">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-[#FFD400]">
          <CheckIconBlack />
        </span>
        <span className="usha-landing-heading text-white text-[length:var(--text-h3)]">{t.arrivalTitle}</span>
        <span className="text-[#A1A1A6] text-[length:var(--text-small)]">{t.arrivalSubtitle}</span>
      </div>
    </PhoneBezel>
  );
}

export function HeroSection() {
  const { openVideoRequest } = useVideoRequest();

  return (
      <section className="flex flex-col items-center gap-[22px] md:gap-7 px-5 pt-9 pb-0 md:px-[120px] md:pt-[88px] text-center">
        <span className="inline-flex items-center gap-2 md:gap-2.5 px-3.5 md:px-4 py-1.5 md:py-2 rounded-full bg-[#F4F4F5] text-[length:var(--text-eyebrow)] font-medium text-[#5C5C60]">
          <span className="w-[7px] h-[7px] md:w-2 md:h-2 rounded-full bg-[#1B4FFF]" />
          {t.eyebrow}
        </span>

        <h1 className="usha-landing-heading text-[length:var(--text-display)] max-w-[820px]">
          {t.title}{" "}
          <span className="text-[#A1A1A6]">{t.titleEmphasis}</span>
        </h1>

        <p className="text-[length:var(--text-lead)] leading-[1.55] text-[#5C5C60] max-w-[560px]">
          {t.subtitle}
        </p>

        <div className="flex flex-col gap-3 items-stretch sm:items-center sm:flex-row mt-1">
          <button
            type="button"
            onClick={(e) => openVideoRequest(e.currentTarget)}
            className="inline-flex items-center justify-center gap-2.5 h-14 md:h-[58px] px-7 md:px-[30px] rounded-full bg-[#0A0A0A] text-white text-[length:var(--text-body)] font-semibold"
          >
            {t.primaryCta}
            <ArrowRight />
          </button>
          <Link
            to={CREATE_GUIDE_ROUTE}
            onClick={() => trackEvent(EVENTS.LANDING_SIGNUP_CLICKED, { placement: "hero" })}
            className="inline-flex items-center justify-center h-14 md:h-[58px] px-7 md:px-[30px] rounded-full bg-[#F0F0F1] text-[#0A0A0A] text-[length:var(--text-body)] font-semibold no-underline"
          >
            {t.secondaryCta}
          </Link>
        </div>

        <p className="text-[length:var(--text-small)] text-[#A1A1A6]">{t.note}</p>

        {/* Fan of three phones, cropped by the panel's bottom edge. Only the
            centre one (the real guide step screen) shows on mobile. */}
        <div className="relative w-full max-w-[1000px] mt-8 md:mt-14 rounded-[32px] overflow-hidden bg-[#F4F4F5] px-6 pt-10 md:pt-16 h-[340px] md:h-[560px]">
          <div className="flex items-end justify-center gap-3 md:gap-6">
            <div className="hidden md:block w-[190px] md:w-[220px] shrink-0 -rotate-6 translate-y-10">
              <PhoneFrame src="/landing/guide-start.jpg" alt={landingStrings.example.startAlt} />
            </div>
            <div className="w-[230px] md:w-[260px] shrink-0 -translate-y-6 md:-translate-y-10 z-10">
              <PhoneFrame src="/landing/guide-step.jpg" alt={t.phoneAlt} />
            </div>
            <div className="hidden md:block w-[190px] md:w-[220px] shrink-0 rotate-6 translate-y-10">
              <ArrivalPhoneMock />
            </div>
          </div>
        </div>
      </section>
  );
}
