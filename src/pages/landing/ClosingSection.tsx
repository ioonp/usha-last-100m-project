import { Link } from "react-router-dom";
import { landingStrings } from "@/lib/strings";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { CREATE_GUIDE_ROUTE, videoMailtoHref } from "./links";

const t = landingStrings.closing;
const f = landingStrings.footer;

export function ClosingSection() {
  return (
    <section className="flex flex-col px-5 pt-16 pb-7 md:px-[120px] md:pt-[120px] md:pb-10 bg-primary text-primary-foreground">
      <div className="flex flex-col gap-[18px] md:items-center md:text-center md:gap-6">
        <h2 className="font-display text-[40px] md:text-[68px] leading-[1.04] md:leading-[1.02] font-medium -tracking-[0.025em] md:max-w-[900px]">{t.title}</h2>
        <p className="text-base md:text-lg leading-[1.5] text-primary-foreground/80">{t.body}</p>
        <div className="flex flex-col gap-3 mt-2 md:flex-row md:gap-4 md:mt-3">
          <a href={videoMailtoHref()} className="flex md:inline-flex items-center justify-center h-14 md:h-[58px] md:px-[30px] rounded-full bg-background text-foreground text-[17px] font-semibold no-underline">
            {t.videoCta}
          </a>
          <Link
            to={CREATE_GUIDE_ROUTE}
            onClick={() => trackEvent(EVENTS.LANDING_SIGNUP_CLICKED, { placement: "closing" })}
            className="flex md:inline-flex items-center justify-center h-14 md:h-[58px] md:px-[30px] rounded-full border-[1.5px] border-background text-primary-foreground text-[17px] font-semibold no-underline"
          >
            {t.photoCta}
          </Link>
        </div>
      </div>

      <div className="grow min-h-16 md:min-h-24" />

      {/* Imprint & Privacy are intentionally omitted — no routes/pages exist yet
          (out of scope here). Contact points at the same inbox as the video CTAs. */}
      <footer className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between pt-6 md:pt-8 border-t border-primary-foreground/15">
        <div className="order-1 flex items-center gap-3 md:gap-4">
          <span className="font-display text-[22px] md:text-2xl font-semibold">usha</span>
          <span className="text-[13px] md:text-sm text-primary-foreground/60">{f.domain}</span>
        </div>
        <span className="order-3 md:order-2 text-[13px] md:text-sm text-primary-foreground/60">{f.madeIn}</span>
        <div className="order-2 md:order-3 flex gap-6 md:gap-7 text-[13px] md:text-sm">
          <a href={`mailto:${landingStrings.videoRequestEmail.to}`} className="text-primary-foreground/60 no-underline">{f.contact}</a>
        </div>
      </footer>
    </section>
  );
}
