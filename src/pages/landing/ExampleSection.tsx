import { landingStrings } from "@/lib/strings";

const t = landingStrings.example;

function ArrowUpRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="7" y1="17" x2="17" y2="7" />
      <polyline points="8 7 17 7 17 16" />
    </svg>
  );
}

function PhoneFrame({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="aspect-[9/19] w-full rounded-[28px] bg-[#0A0A0A] p-2 md:p-2.5 shadow-[0_20px_48px_-20px_rgba(10,10,10,0.5)]">
      <div className="w-full h-full rounded-[22px] overflow-hidden bg-black">
        <img src={src} alt={alt} className="w-full h-full object-contain block" />
      </div>
    </div>
  );
}

export function ExampleSection() {
  return (
    <section className="flex flex-col items-center gap-8 md:gap-14 px-5 py-14 md:px-[120px] md:py-[104px] text-center">
      <div className="flex flex-col items-center gap-3.5 md:gap-5 max-w-[640px]">
        <span className="usha-landing-mono text-[length:var(--text-eyebrow)] uppercase tracking-[0.1em] text-[#A1A1A6]">{t.eyebrow}</span>
        <h2 className="usha-landing-heading text-[length:var(--text-h2)]">{t.title}</h2>
        <p className="text-[length:var(--text-lead)] leading-[1.55] text-[#5C5C60]">{t.body}</p>
      </div>

      <div className="w-full rounded-[32px] bg-[#F4F4F5] px-5 py-10 md:px-16 md:py-16 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
        <a href={t.url} aria-label={t.cta} className="block shrink-0 w-[220px] md:w-[260px] no-underline">
          <PhoneFrame src="/landing/guide-start.jpg" alt={t.startAlt} />
        </a>

        {/* Mobile-only CTA under the phone; the QR card replaces it on desktop. */}
        <a
          href={t.url}
          className="md:hidden flex w-full items-center justify-center gap-2.5 h-14 rounded-full bg-[#0A0A0A] text-white text-[length:var(--text-body)] font-semibold no-underline"
        >
          {t.ctaMobile}
          <ArrowUpRight />
        </a>

        {/* QR card — desktop only. */}
        <div className="hidden md:flex w-[220px] flex-col items-center gap-4 p-6 rounded-3xl bg-white border border-[#E7E7E9]">
          <img src="/landing/qr-yoga-futura.png" alt={t.qrAlt} className="w-36 h-36 block" />
          <span className="text-[length:var(--text-body)] font-semibold text-center">{t.qrTitle}</span>
          <span className="text-[length:var(--text-small)] leading-[1.4] text-[#5C5C60] text-center">{t.qrBody}</span>
          <a
            href={t.url}
            className="flex w-full items-center justify-center gap-2 h-12 rounded-full bg-[#0A0A0A] text-white text-[length:var(--text-body)] font-semibold no-underline"
          >
            {t.cta}
            <ArrowUpRight />
          </a>
        </div>
      </div>
    </section>
  );
}
