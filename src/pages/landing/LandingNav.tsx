import { Link } from "react-router-dom";
import { landingStrings } from "@/lib/strings";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { SIGN_IN_ROUTE, videoMailtoHref } from "./links";

const t = landingStrings.nav;

// Reused as the brand mark on every Creator screen too (via CreatorHeader),
// so the wordmark treatment is plain Tailwind utilities rather than the
// landing-scoped usha-landing-heading class — it needs to render correctly
// on pages that never load landing.css.
export function Logo({ to = "#top" }: { to?: string }) {
  const mark = (
    <>
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="md:w-7 md:h-7">
        <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="#0A0A0A" />
        <circle cx="12" cy="10" r="2.6" fill="#FFFFFF" />
      </svg>
      <span className="font-semibold tracking-[-0.05em] leading-none text-2xl md:text-[28px]">usha</span>
    </>
  );
  const className = "flex items-center gap-1.5 md:gap-2 no-underline text-[#0A0A0A]";
  return to.startsWith("#") ? (
    <a href={to} className={className}>{mark}</a>
  ) : (
    <Link to={to} className={className}>{mark}</Link>
  );
}

export function LandingNav() {
  return (
    <header className="flex md:grid items-center justify-between md:justify-normal md:grid-cols-3 gap-3 px-5 py-4 md:px-[120px] md:py-6">
      <Logo />
      <nav className="hidden md:flex justify-self-center gap-10 text-[length:var(--text-body)] font-medium text-[#5C5C60]">
        <a href="#how" className="no-underline hover:text-[#0A0A0A] transition-colors">{t.howItWorks}</a>
        <a href="#options" className="no-underline hover:text-[#0A0A0A] transition-colors">{t.options}</a>
        <a href="#faq" className="no-underline hover:text-[#0A0A0A] transition-colors">{t.faq}</a>
      </nav>
      <div className="flex items-center gap-2 md:gap-3 md:justify-self-end">
        <Link
          to={SIGN_IN_ROUTE}
          onClick={() => trackEvent(EVENTS.LANDING_SIGNIN_CLICKED, { placement: "nav" })}
          className="inline-flex items-center h-11 px-3 md:px-[18px] whitespace-nowrap text-[length:var(--text-body)] font-medium text-[#0A0A0A] no-underline"
        >
          {t.signIn}
        </Link>
        <a
          href={videoMailtoHref()}
          className="inline-flex items-center h-11 px-[18px] md:px-[22px] rounded-full bg-[#0A0A0A] text-white whitespace-nowrap text-[length:var(--text-body)] font-semibold no-underline"
        >
          {t.videoCta}
        </a>
      </div>
    </header>
  );
}
