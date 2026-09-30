import { landingStrings } from "@/lib/strings";

const t = landingStrings.problems;

const cards = [t.late, t.calls, t.impression];

export function ProblemsSection() {
  return (
    <section className="flex flex-col gap-8 md:gap-14 px-5 pb-16 md:px-[120px] md:pb-28 text-center">
      <h2 className="usha-landing-heading text-[length:var(--text-h2)] mx-auto">{t.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 md:divide-x md:divide-[#E7E7E9]">
        {cards.map((c, i) => (
          <div
            key={c.title}
            className="flex flex-col gap-2 md:gap-4 py-6 md:py-0 md:px-8 border-t border-[#E7E7E9] first:border-t-0 md:border-t-0 text-left md:text-center"
          >
            <span className="usha-landing-mono text-[length:var(--text-small)] text-[#A1A1A6]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="usha-landing-heading text-[length:var(--text-h3)]">{c.title}</h3>
            <p className="text-[length:var(--text-body)] leading-[1.5] md:leading-[1.55] text-[#5C5C60]">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
