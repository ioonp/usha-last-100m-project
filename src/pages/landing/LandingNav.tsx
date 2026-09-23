import { Link } from "react-router-dom";
import { landingStrings } from "@/lib/strings";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { SIGN_IN_ROUTE, videoMailtoHref } from "./links";

const t = landingStrings.nav;

function Logo() {
  return (
    <a href="#top" className="flex items-center gap-1.5 md:gap-2 no-underline text-foreground">
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" className="md:w-7 md:h-7">
        <path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" className="fill-accent" />
        <circle cx="12" cy="10" r="2.6" className="fill-background" />
      </svg>
      <span className="font-display text-2xl md:text-[28px] font-semibold -tracking-[0.02em]">usha</span>
    </a>
  );
}

export function LandingNav() {
  return (
    <header className="flex items-center justify-between px-5 py-4 md:px-[120px] md:py-6 border-b border-border">
      <Logo />
      <nav className="hidden md:flex gap-10 text-[15px] font-medium">
        <a href="#how" className="no-underline text-foreground hover:text-accent transition-colors">{t.howItWorks}</a>
        <a href="#options" className="no-underline text-foreground hover:text-accent transition-colors">{t.options}</a>
        <a href="#faq" className="no-underline text-foreground hover:text-accent transition-colors">{t.faq}</a>
      </nav>
      <div className="flex items-center gap-1 md:gap-3">
        <Link
          to={SIGN_IN_ROUTE}
          onClick={() => trackEvent(EVENTS.LANDING_SIGNIN_CLICKED, { placement: "nav" })}
          className="inline-flex items-center h-11 px-3 md:px-[18px] rounded-full md:border md:border-border text-[15px] font-semibold text-foreground no-underline"
        >
          {t.signIn}
        </Link>
        <a
          href={videoMailtoHref()}
          className="inline-flex items-center h-11 px-[18px] md:px-[22px] rounded-full bg-primary text-primary-foreground text-[15px] font-semibold no-underline"
        >
          {t.videoCta}
        </a>
      </div>
    </header>
  );
}
