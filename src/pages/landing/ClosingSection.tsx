import { Link } from "react-router-dom";
import { landingStrings } from "@/lib/strings";
import { trackEvent, EVENTS } from "@/lib/analytics";
import { CREATE_GUIDE_ROUTE, videoMailtoHref } from "./links";
import { Logo } from "./LandingNav";

const t = landingStrings.closing;
const f = landingStrings.footer;
const nav = landingStrings.nav;

function HeartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" className="inline-block shrink-0">
      <path
        d="M12 21s-7.5-4.9-10.2-9.6C.1 8.7 1.4 5 5 4.1c2.2-.5 4.2.5 5.5 2.4C11.8 4.6 13.8 3.6 16 4.1c3.6.9 4.9 4.6 3.2 7.3C19.5 16.1 12 21 12 21z"
        fill="#1B4FFF"
      />
    </svg>
  );
}

// Footer link columns reuse the exact same destinations as the nav and
// existing contact link — no new pages/routes.
const productLinks = [
  { label: nav.howItWorks, href: "#how" },
  { label: nav.options, href: "#options" },
  { label: nav.faq, href: "#faq" },
];

export function ClosingSection() {
  return (
    <>
      <section className="px-5 py-14 md:px-[120px] md:py-[104px]">
        <div className="flex flex-col items-center text-center gap-[18px] md:gap-6 rounded-[32px] bg-[#F4F4F5] px-6 py-14 md:px-16 md:py-20">
          <h2 className="usha-landing-heading text-[length:var(--text-h2-lead)] md:max-w-[820px]">{t.title}</h2>
          <p className="text-[length:var(--text-lead)] leading-[1.5] text-[#5C5C60]">{t.body}</p>
          <div className="flex flex-col gap-3 mt-2 md:flex-row md:gap-4 md:mt-3">
            <a
              href={videoMailtoHref()}
              className="flex md:inline-flex items-center justify-center h-14 md:h-[58px] md:px-[30px] rounded-full bg-[#0A0A0A] text-white text-[length:var(--text-body)] font-semibold no-underline"
            >
              {t.videoCta}
            </a>
            <Link
              to={CREATE_GUIDE_ROUTE}
              onClick={() => trackEvent(EVENTS.LANDING_SIGNUP_CLICKED, { placement: "closing" })}
              className="flex md:inline-flex items-center justify-center h-14 md:h-[58px] md:px-[30px] rounded-full bg-[#F0F0F1] text-[#0A0A0A] text-[length:var(--text-body)] font-semibold no-underline"
            >
              {t.photoCta}
            </Link>
          </div>
        </div>
      </section>

      <footer className="px-5 pt-10 pb-8 md:px-[120px] md:pt-14 md:pb-10 border-t border-[#E7E7E9]">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div className="flex flex-col gap-3 md:max-w-[280px]">
            <Logo />
            <p className="text-[length:var(--text-small)] text-[#5C5C60]">{f.tagline}</p>
          </div>
          <div className="flex gap-10 md:gap-16">
            <div className="flex flex-col gap-3">
              <span className="text-[length:var(--text-small)] font-semibold text-[#0A0A0A]">{f.productHeading}</span>
              {productLinks.map((l) => (
                <a key={l.label} href={l.href} className="text-[length:var(--text-small)] text-[#5C5C60] no-underline">
                  {l.label}
                </a>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <span className="text-[length:var(--text-small)] font-semibold text-[#0A0A0A]">{f.companyHeading}</span>
              <a href={`mailto:${landingStrings.videoRequestEmail.to}`} className="text-[length:var(--text-small)] text-[#5C5C60] no-underline">
                {f.contact}
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mt-10 md:mt-14 pt-6 border-t border-[#E7E7E9]">
          <span className="text-[length:var(--text-small)] text-[#A1A1A6]">{f.copyright}</span>
          <span className="text-[length:var(--text-small)] text-[#A1A1A6] inline-flex items-center gap-1.5">
            {f.madeIn} <HeartIcon />
          </span>
        </div>
      </footer>
    </>
  );
}
