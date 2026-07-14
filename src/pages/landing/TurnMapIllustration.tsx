import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { landingStrings } from "@/lib/strings";

const t = landingStrings.howItWorks.map;

/**
 * The same street/courtyard map as the hero, redrawn with a trail of photo
 * checkpoints bridging the gap. When `go` is true the trail draws itself in,
 * checkpoints pop in one after another, and the door turns green ("reached").
 */
export function TurnMapIllustration({ go }: { go: boolean }) {
  return (
    <div className="relative rounded-[24px] overflow-hidden shadow-elegant bg-[#EDEBE4] border border-black/5 aspect-square">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
        aria-label={t.ariaLabel}
        className={cn("block w-full h-full usha-landing-trail", go && "usha-landing-go")}
      >
        <rect width="400" height="400" fill="#EDEBE4" />
        <rect x="-20" y="-20" width="160" height="120" rx="6" fill="#E4E7DE" />
        <rect x="250" y="-20" width="190" height="110" rx="6" fill="#E4E7DE" />
        <path d="M-20 150 H420" stroke="#D7DCE0" strokeWidth="30" />
        <path d="M200 150 V-20" stroke="#D7DCE0" strokeWidth="22" />
        <rect x="205" y="185" width="180" height="200" rx="8" fill="#E9E5DB" />
        <rect x="225" y="215" width="140" height="140" rx="6" fill="#E1DCCF" stroke="#D8D2C3" strokeWidth="1.5" />
        <text x="295" y="290" fontFamily="ui-monospace, monospace" fontSize="10" fill="#B3AA9B" textAnchor="middle" letterSpacing="1">
          {t.courtyardLabel}
        </text>

        {/* start pin (street) */}
        <g>
          <circle cx="120" cy="152" r="13" fill="#4C8DF6" opacity=".16" />
          <path d="M120 136c-6.5 0-11 5-11 11.5 0 7.8 11 17.5 11 17.5s11-9.7 11-17.5c0-6.5-4.5-11.5-11-11.5z" fill="#4C8DF6" />
          <circle cx="120" cy="147" r="3.8" fill="#fff" />
        </g>

        {/* the drawn trail bridging the gap */}
        <path
          className="usha-landing-draw"
          style={{ "--len": 120 } as CSSProperties}
          d="M120 168 Q140 190 175 200"
          stroke="#C9542B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="1 9"
          fill="none"
        />
        <path
          className="usha-landing-draw usha-landing-draw-d2"
          style={{ "--len": 120 } as CSSProperties}
          d="M188 208 Q220 228 250 250"
          stroke="#C9542B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="1 9"
          fill="none"
        />
        <path
          className="usha-landing-draw usha-landing-draw-d3"
          style={{ "--len": 90 } as CSSProperties}
          d="M262 262 Q285 285 300 305"
          stroke="#C9542B"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="1 9"
          fill="none"
        />

        {/* checkpoint photo dots */}
        <g className="usha-landing-cpdot usha-landing-cp1">
          <circle cx="181" cy="204" r="13" fill="#fff" stroke="#C9542B" strokeWidth="2.5" />
          <path d="M175 204a6 6 0 0112 0" stroke="#C9542B" strokeWidth="1.6" fill="none" />
          <circle cx="181" cy="203" r="2.2" fill="#C9542B" />
        </g>
        <g className="usha-landing-cpdot usha-landing-cp2">
          <circle cx="256" cy="256" r="13" fill="#fff" stroke="#C9542B" strokeWidth="2.5" />
          <path d="M250 256a6 6 0 0112 0" stroke="#C9542B" strokeWidth="1.6" fill="none" />
          <circle cx="256" cy="255" r="2.2" fill="#C9542B" />
        </g>

        {/* the door, now reached */}
        <g className="usha-landing-cpdot usha-landing-cp3">
          <circle cx="311" cy="318" r="17" fill="#2F7D5B" opacity=".14" />
          <rect x="303" y="308" width="18" height="22" rx="2" fill="#2F7D5B" />
          <circle cx="317" cy="319" r="1.5" fill="#fff" />
        </g>
      </svg>

      <div className="absolute left-4 right-4 bottom-4 flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11.5px] font-semibold shadow-md">
          <span className="size-2.5 rounded-full bg-accent" />
          {t.legendCheckpoint}
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-white/95 backdrop-blur px-3 py-1.5 text-[11.5px] font-semibold shadow-md">
          <span className="size-2.5 rounded-full bg-success" />
          {t.legendDoorReached}
        </div>
      </div>
    </div>
  );
}
