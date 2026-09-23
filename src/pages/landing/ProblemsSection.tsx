import { landingStrings } from "@/lib/strings";

const t = landingStrings.problems;

const ClockIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15.5 14" />
  </svg>
);
const PhoneIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
  </svg>
);
const CompassIcon = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" /><polygon points="15.5 8.5 13.5 13.5 8.5 15.5 10.5 10.5" />
  </svg>
);

const cards = [
  { icon: ClockIcon, ...t.late },
  { icon: PhoneIcon, ...t.calls },
  { icon: CompassIcon, ...t.impression },
];

export function ProblemsSection() {
  return (
    <section className="flex flex-col gap-5 md:gap-10 px-5 pb-16 md:px-[120px] md:pb-28">
      <h2 className="font-display text-[32px] md:text-[40px] font-medium -tracking-[0.02em]">{t.title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        {cards.map((c) => (
          <div key={c.title} className="flex gap-4 md:flex-col md:gap-3.5 p-5 md:p-8 rounded-[20px] md:rounded-3xl bg-card border border-border">
            <span className="inline-flex items-center justify-center w-11 h-11 md:w-12 md:h-12 shrink-0 rounded-full bg-accent-soft text-foreground">
              {c.icon}
            </span>
            <div className="flex flex-col gap-1 md:gap-3.5">
              <h3 className="text-lg md:text-[21px] font-semibold">{c.title}</h3>
              <p className="text-[15px] md:text-base leading-[1.5] md:leading-[1.55] text-muted-foreground">{c.body}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
