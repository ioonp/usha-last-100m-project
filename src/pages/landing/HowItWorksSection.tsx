import { landingStrings } from "@/lib/strings";

const t = landingStrings.how;

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function HowItWorksSection() {
  const lastIndex = t.steps.length - 1;

  return (
    <section id="how" className="flex flex-col gap-10 md:gap-14 px-5 py-14 md:px-[120px] md:py-[104px]">
      <h2 className="usha-landing-heading text-[length:var(--text-h2)]">{t.title}.</h2>
      <div className="relative flex flex-col gap-8 md:flex-row md:gap-0">
        {/* Dashed connector — desktop only, aligned with circle centres. */}
        <div aria-hidden="true" className="hidden md:block absolute left-[8%] right-[8%] top-[26px] border-t-2 border-dashed border-[#E7E7E9]" />
        {t.steps.map((s, i) => {
          const isLast = i === lastIndex;
          return (
            <div key={s.title} className="relative flex gap-4 md:flex-1 md:flex-col md:items-center md:text-center md:gap-4 md:px-4">
              <span
                className={
                  "relative z-10 inline-flex items-center justify-center w-11 h-11 md:w-[52px] md:h-[52px] shrink-0 rounded-full font-semibold text-[length:var(--text-h3)] text-white " +
                  (isLast ? "bg-[#1B4FFF]" : "bg-[#0A0A0A]")
                }
              >
                {isLast ? <CheckIcon /> : i + 1}
              </span>
              <div className="flex flex-col gap-1 md:gap-3">
                <h3 className="usha-landing-heading text-[length:var(--text-h3)]">{s.title}</h3>
                <p className="text-[length:var(--text-body)] leading-[1.5] md:leading-[1.55] text-[#5C5C60]">{s.body}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
