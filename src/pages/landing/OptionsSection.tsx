import { Link } from "react-router-dom";
import { landingStrings } from "@/lib/strings";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { SIGN_IN_ROUTE, CREATE_GUIDE_ROUTE, videoMailtoHref } from "./links";

const t = landingStrings.options;

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Points({ points }: { points: readonly string[] }) {
  return (
    <div className="flex flex-col gap-3 md:gap-3.5 text-base md:text-[17px] leading-[1.45]">
      {points.map((p) => (
        <div key={p} className="flex gap-2.5 md:gap-3"><Check /><span>{p}</span></div>
      ))}
    </div>
  );
}

export function OptionsSection() {
  return (
    <section id="options" className="flex flex-col gap-7 md:gap-14 px-5 py-16 md:px-[120px] md:py-[120px]">
      <div className="flex flex-col gap-3.5 md:gap-[18px] md:items-center md:text-center">
        <span className="text-xs md:text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t.eyebrow}</span>
        <h2 className="font-display text-[38px] md:text-[60px] leading-[1.05] md:leading-[1.04] font-medium -tracking-[0.025em] md:max-w-[820px]">{t.title}</h2>
        <p className="text-base md:text-lg leading-[1.5] text-muted-foreground">{t.subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
        {/* Video guide — visually leading: heavier border + Recommended badge. */}
        <div id="video" className="flex flex-col gap-5 md:gap-[26px] px-6 py-7 md:p-12 rounded-[26px] md:rounded-[32px] bg-card border-2 border-primary md:flex-[1.3]">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t.video.label}</span>
            <span className="px-3 md:px-3.5 py-1.5 rounded-full bg-primary text-primary-foreground text-xs md:text-[13px] font-semibold">{t.video.badge}</span>
          </div>
          <h3 className="font-display text-[34px] md:text-[44px] leading-[1.05] font-medium -tracking-[0.02em]">{t.video.title}</h3>
          <Points points={t.video.points} />
          <div className="grow" />
          <div className="flex flex-col gap-3 mt-1">
            <a href={videoMailtoHref()} className="flex items-center justify-center h-14 md:h-[58px] rounded-full bg-primary text-primary-foreground text-[17px] font-semibold no-underline">
              {t.video.cta}
            </a>
            <span className="text-center text-[13px] md:text-sm text-muted-foreground">{t.video.note}</span>
          </div>
        </div>

        {/* Photo guide — free, do-it-yourself. */}
        <div id="photo" className="flex flex-col gap-5 md:gap-[26px] px-6 py-7 md:p-12 rounded-[26px] md:rounded-[32px] border border-border md:flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs md:text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t.photo.label}</span>
            <span className="px-3 md:px-3.5 py-1.5 rounded-full bg-accent-soft text-foreground text-xs md:text-[13px] font-semibold">{t.photo.badge}</span>
          </div>
          <h3 className="font-display text-[34px] md:text-[44px] leading-[1.05] font-medium -tracking-[0.02em]">{t.photo.title}</h3>
          <Points points={t.photo.points} />
          <div className="grow" />
          <div className="flex flex-col gap-3 mt-1">
            <Link
              to={CREATE_GUIDE_ROUTE}
              onClick={() => trackEvent(EVENTS.LANDING_SIGNUP_CLICKED, { placement: "options" })}
              className="flex items-center justify-center h-14 md:h-[58px] rounded-full border-[1.5px] border-primary text-foreground text-[17px] font-semibold no-underline"
            >
              {t.photo.cta}
            </Link>
            <span className="text-center text-[13px] md:text-sm text-muted-foreground">
              {t.photo.note} {t.photo.signInPrompt}{" "}
              <Link
                to={SIGN_IN_ROUTE}
                onClick={() => trackEvent(EVENTS.LANDING_SIGNIN_CLICKED, { placement: "options" })}
                className="text-foreground font-semibold"
              >
                {t.photo.signIn}
              </Link>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
