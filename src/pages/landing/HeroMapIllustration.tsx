import { landingStrings } from "@/lib/strings";

const t = landingStrings.hero.map;

/**
 * The hero's signature visual: a confident blue Maps route that runs down
 * the street and dies at a pavement pin, while the real door sits deep in a
 * courtyard — bridged only by a faint, unreachable dashed line.
 */
export function HeroMapIllustration() {
  return (
    <div className="relative rounded-[24px] overflow-hidden shadow-elegant bg-[#EDEBE4] border border-black/5 aspect-[4/5]">
      <svg
        viewBox="0 0 400 500"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-label={t.ariaLabel}
        className="block w-full h-full"
      >
        <rect width="400" height="500" fill="#EDEBE4" />
        {/* park / block fills */}
        <rect x="-20" y="-20" width="180" height="150" rx="6" fill="#E4E7DE" />
        <rect x="250" y="30" width="190" height="130" rx="6" fill="#E4E7DE" />
        <rect x="20" y="330" width="150" height="200" rx="6" fill="#E7E4DA" />
        {/* main street (where maps works) */}
        <path d="M-20 210 H420" stroke="#D7DCE0" strokeWidth="34" />
        <path d="M-20 210 H420" stroke="#fff" strokeWidth="2" strokeDasharray="10 12" opacity=".6" />
        {/* side street */}
        <path d="M200 210 V-20" stroke="#D7DCE0" strokeWidth="26" />
        {/* courtyard interior (faint, where the door hides) */}
        <rect x="210" y="250" width="170" height="220" rx="8" fill="#E9E5DB" />
        <rect x="230" y="285" width="130" height="150" rx="6" fill="#E1DCCF" stroke="#D8D2C3" strokeWidth="1.5" />
        <text x="296" y="365" fontFamily="ui-monospace, monospace" fontSize="11" fill="#B3AA9B" textAnchor="middle" letterSpacing="1">
          {t.courtyardLabel}
        </text>

        {/* MAPS BLUE ROUTE: confident down the street, stops dead at the pin */}
        <path d="M40 470 Q60 300 120 250 T196 214" stroke="#4C8DF6" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".9" />
        {/* the dead-drop pin on the pavement */}
        <g>
          <circle cx="200" cy="212" r="15" fill="#4C8DF6" opacity=".18" />
          <path d="M200 194c-7 0-12 5.5-12 12.5 0 8.5 12 19.5 12 19.5s12-11 12-19.5c0-7-5-12.5-12-12.5z" fill="#4C8DF6" />
          <circle cx="200" cy="206.5" r="4.2" fill="#fff" />
        </g>

        {/* THE GAP: dotted line from where maps stops to the real door, unreachable */}
        <path
          d="M206 220 Q250 250 285 300 T310 360"
          stroke="#C9542B"
          strokeWidth="2.5"
          strokeDasharray="3 7"
          strokeLinecap="round"
          fill="none"
          opacity=".55"
        />

        {/* the real door, deep in the courtyard */}
        <g>
          <rect x="300" y="348" width="22" height="26" rx="2" fill="#C9542B" />
          <circle cx="317" cy="361" r="1.6" fill="#fff" />
        </g>
      </svg>

      <div
        className="absolute font-mono text-[11px] font-medium tracking-wide text-[#A8431F] bg-[#F7E9E1] border border-[#C9542B]/25 px-2.5 py-1 rounded-lg shadow-sm whitespace-nowrap"
        style={{ top: "52%", left: "60%" }}
      >
        {t.gapLabel}
      </div>

      <div className="absolute left-4 right-4 bottom-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11.5px] font-semibold shadow-md">
          <span className="size-2.5 rounded-full bg-[#4C8DF6]" />
          {t.legendMapsStop}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11.5px] font-semibold shadow-md">
          <span className="size-2.5 rounded-full bg-accent" />
          {t.legendActualDoor}
        </div>
      </div>
    </div>
  );
}
