import { useState } from "react";
import { landingStrings } from "@/lib/strings";

const t = landingStrings.faq;

function PlusMinusIcon({ open }: { open: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" className="shrink-0">
      <line x1="5" y1="12" x2="19" y2="12" />
      {!open && <line x1="12" y1="5" x2="12" y2="19" />}
    </svg>
  );
}

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="flex flex-col md:flex-row md:gap-20 px-5 py-14 md:px-[120px] md:py-[104px]">
      <h2 className="usha-landing-heading text-[length:var(--text-h2)] mb-2 md:mb-0 md:w-[360px] md:shrink-0">{t.title}.</h2>
      <div className="flex flex-col md:flex-1">
        {t.items.map((item, i) => {
          const open = openIndex === i;
          return (
            <div key={item.q} className="border-b border-[#E7E7E9]">
              <button
                type="button"
                onClick={() => setOpenIndex(open ? null : i)}
                aria-expanded={open}
                className="flex w-full items-center justify-between gap-4 py-[22px] md:py-7 text-left"
              >
                <h3 className="usha-landing-heading text-[length:var(--text-h3)]">{item.q}</h3>
                <PlusMinusIcon open={open} />
              </button>
              {open && (
                <p className="pb-[22px] md:pb-7 text-[length:var(--text-body)] leading-[1.5] md:leading-[1.55] text-[#5C5C60]">
                  {item.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
