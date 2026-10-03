import { Link } from "react-router-dom";
import { landingStrings } from "@/lib/strings";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { SIGN_IN_ROUTE, CREATE_GUIDE_ROUTE } from "./links";
import { useVideoRequest } from "./videoRequestContext";

const t = landingStrings.options;

// The heading's closing clause is rendered in grey; the string itself is
// unchanged copy — this just splits it for the two-tone style.
const TITLE_GREY_SUFFIX = "or you do it yourself.";

function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function Points({ points }: { points: readonly string[] }) {
  return (
    <div className="flex flex-col gap-3 md:gap-3.5 text-[length:var(--text-body)] leading-[1.45]">
      {points.map((p) => (
        <div key={p} className="flex items-start gap-2.5 md:gap-3">
          <span className="flex items-center justify-center w-6 h-6 mt-0.5 shrink-0 rounded-full bg-[#F0F0F1] text-[#0A0A0A]">
            <Check />
          </span>
          <span>{p}</span>
        </div>
      ))}
    </div>
  );
}

export function OptionsSection() {
  const { openVideoRequest } = useVideoRequest();
  const titlePrefix = t.title.slice(0, t.title.length - TITLE_GREY_SUFFIX.length);

  return (
    <section id="options" className="flex flex-col gap-7 md:gap-14 px-5 py-16 md:px-[120px] md:py-[120px]">
      <div className="flex flex-col gap-3.5 md:gap-[18px] md:items-center md:text-center">
        <span className="usha-landing-mono text-[length:var(--text-eyebrow)] uppercase tracking-[0.1em] text-[#A1A1A6]">{t.eyebrow}</span>
        <h2 className="usha-landing-heading text-[length:var(--text-h2-lead)] md:max-w-[820px]">
          {titlePrefix}
          <span className="text-[#A1A1A6]">{TITLE_GREY_SUFFIX}</span>
        </h2>
        <p className="text-[length:var(--text-lead)] leading-[1.5] text-[#5C5C60]">{t.subtitle}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:items-stretch">
        {/* Video guide — visually leading: white card, 2px black border, Recommended badge. */}
        <div id="video" className="flex flex-col gap-5 md:gap-[26px] px-6 py-7 md:p-12 rounded-[26px] md:rounded-[32px] bg-white border-2 border-[#0A0A0A] md:flex-[1.3]">
          <div className="flex items-center justify-between">
            <span className="usha-landing-mono text-[length:var(--text-eyebrow)] uppercase tracking-[0.1em] text-[#A1A1A6]">{t.video.label}</span>
            <span className="px-3 md:px-3.5 py-1.5 rounded-full bg-[#0A0A0A] text-white text-[length:var(--text-eyebrow)] font-semibold">{t.video.badge}</span>
          </div>
          <h3 className="usha-landing-heading text-[length:var(--text-card)]">{t.video.title}</h3>
          <Points points={t.video.points} />
          <div className="grow" />
          <div className="flex flex-col gap-3 mt-1">
            <button
              type="button"
              onClick={(e) => openVideoRequest(e.currentTarget)}
              className="flex w-full items-center justify-center h-14 md:h-[58px] rounded-full bg-[#0A0A0A] text-white text-[length:var(--text-body)] font-semibold"
            >
              {t.video.cta}
            </button>
            <span className="text-center text-[length:var(--text-small)] text-[#A1A1A6]">{t.video.note}</span>
          </div>
        </div>

        {/* Photo guide — free, do-it-yourself, plain panel. */}
        <div id="photo" className="flex flex-col gap-5 md:gap-[26px] px-6 py-7 md:p-12 rounded-[26px] md:rounded-[32px] bg-[#F4F4F5] md:flex-1">
          <div className="flex items-center justify-between">
            <span className="usha-landing-mono text-[length:var(--text-eyebrow)] uppercase tracking-[0.1em] text-[#A1A1A6]">{t.photo.label}</span>
            <span className="px-3 md:px-3.5 py-1.5 rounded-full bg-white text-[#0A0A0A] text-[length:var(--text-eyebrow)] font-semibold">{t.photo.badge}</span>
          </div>
          <h3 className="usha-landing-heading text-[length:var(--text-card)]">{t.photo.title}</h3>
          <Points points={t.photo.points} />
          <div className="grow" />
          <div className="flex flex-col gap-3 mt-1">
            <Link
              to={CREATE_GUIDE_ROUTE}
              onClick={() => trackEvent(EVENTS.LANDING_SIGNUP_CLICKED, { placement: "options" })}
              className="flex items-center justify-center h-14 md:h-[58px] rounded-full bg-[#F0F0F1] text-[#0A0A0A] text-[length:var(--text-body)] font-semibold no-underline"
            >
              {t.photo.cta}
            </Link>
            <span className="text-center text-[length:var(--text-small)] text-[#5C5C60]">
              {t.photo.note} {t.photo.signInPrompt}{" "}
              <Link
                to={SIGN_IN_ROUTE}
                onClick={() => trackEvent(EVENTS.LANDING_SIGNIN_CLICKED, { placement: "options" })}
                className="text-[#0A0A0A] font-semibold"
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
