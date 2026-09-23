import { landingStrings } from "@/lib/strings";

const t = landingStrings.how;

export function HowItWorksSection() {
  return (
    <section id="how" className="flex flex-col gap-7 md:gap-12 px-5 py-14 md:px-[120px] md:py-[104px] border-t border-border">
      <h2 className="font-display text-[34px] md:text-5xl font-medium -tracking-[0.02em]">{t.title}</h2>
      <div className="flex flex-col gap-7 md:grid md:grid-cols-3 md:gap-12">
        {t.steps.map((s, i) => (
          <div key={s.title} className="flex gap-4 md:flex-col md:gap-4">
            <span className="inline-flex items-center justify-center w-11 h-11 md:w-[52px] md:h-[52px] shrink-0 rounded-full border-[1.5px] border-primary font-display text-[19px] md:text-[22px]">
              {i + 1}
            </span>
            <div className="flex flex-col gap-1 md:gap-4">
              <h3 className="text-[19px] md:text-[22px] font-semibold">{s.title}</h3>
              <p className="text-[15px] md:text-[17px] leading-[1.5] md:leading-[1.55] text-muted-foreground">{s.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
