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

export function ExampleSection() {
  return (
    <section className="flex flex-col md:flex-row md:items-center gap-[18px] md:gap-[72px] px-5 py-14 md:px-[120px] md:py-[104px] bg-accent-soft">
      <div className="flex flex-col gap-[18px] md:gap-5 md:flex-1">
        <span className="text-xs md:text-[13px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t.eyebrow}</span>
        <h2 className="font-display text-[34px] md:text-5xl leading-[1.08] font-medium -tracking-[0.02em]">{t.title}</h2>
        <p className="text-base md:text-lg leading-[1.55] text-muted-foreground md:max-w-[520px]">{t.body}</p>
        <a
          href={t.url}
          className="hidden md:inline-flex items-center gap-2.5 self-start h-[52px] mt-2 px-[26px] rounded-full bg-primary text-primary-foreground text-base font-semibold no-underline"
        >
          {t.cta}
          <ArrowUpRight />
        </a>
      </div>

      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-10 w-full md:w-auto">
        <a
          href={t.url}
          aria-label={t.cta}
          className="block shrink-0 w-[260px] h-[452px] md:w-[300px] md:h-[522px] p-[9px] md:p-2.5 rounded-[40px] md:rounded-[44px] bg-primary shadow-[0_24px_48px_-20px_rgba(28,26,23,0.45)] md:shadow-[0_30px_60px_-24px_rgba(28,26,23,0.45)] no-underline"
        >
          <img src="/landing/guide-start.jpg" alt={t.startAlt} className="w-full h-full object-contain rounded-[31px] md:rounded-[34px] block" />
        </a>

        {/* Mobile-only CTA under the phone; the QR replaces it on desktop. */}
        <a
          href={t.url}
          className="md:hidden flex w-full items-center justify-center gap-2.5 h-14 mt-2 rounded-full bg-primary text-primary-foreground text-[17px] font-semibold no-underline"
        >
          {t.ctaMobile}
          <ArrowUpRight />
        </a>

        {/* QR card — desktop only. */}
        <div className="hidden md:flex w-[200px] flex-col gap-3.5 p-5 rounded-3xl bg-card border border-border">
          <img src="/landing/qr-yoga-futura.png" alt={t.qrAlt} className="w-40 h-40 block" />
          <span className="text-[15px] font-semibold leading-[1.35]">{t.qrTitle}</span>
          <span className="text-[13px] leading-[1.4] text-muted-foreground">{t.qrBody}</span>
        </div>
      </div>
    </section>
  );
}
