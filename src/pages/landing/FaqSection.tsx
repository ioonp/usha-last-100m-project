import { landingStrings } from "@/lib/strings";

const t = landingStrings.faq;

export function FaqSection() {
  return (
    <section id="faq" className="flex flex-col md:flex-row md:gap-20 px-5 py-14 md:px-[120px] md:py-[104px] border-t border-border">
      <h2 className="font-display text-[34px] md:text-5xl font-medium -tracking-[0.02em] mb-2 md:mb-0 md:w-[360px] md:shrink-0">{t.title}</h2>
      <div className="flex flex-col md:flex-1">
        {t.items.map((item) => (
          <div key={item.q} className="flex flex-col gap-2 md:gap-2.5 py-[22px] md:py-7 border-b border-border">
            <h3 className="text-[17px] md:text-xl font-semibold">{item.q}</h3>
            <p className="text-[15px] md:text-[17px] leading-[1.5] md:leading-[1.55] text-muted-foreground">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
