import {
  ARROW_CORAL,
  CHEVRON_OPACITIES,
  CHEVRON_STROKE_WIDTH,
  CHEVRON_HALF_WIDTH,
  CHEVRON_ARM_DROP,
  CHEVRON_SPACING,
  CHEVRON_BASE_CY,
  CHEVRON_LINECAP,
  CHEVRON_LINEJOIN,
} from "@/lib/arrowGlyph";

export function CurvedArrow({
  angle = 0,
  size = 120,
  className = "",
  animate = true,
}: {
  angle?: number;
  size?: number;
  /** Accepted for call-site compatibility; the flat glyph is always coral. */
  color?: string;
  className?: string;
  /** Accepted for call-site compatibility; the flat glyph has no shadow. */
  withShadow?: boolean;
  animate?: boolean;
}) {
  // Skewed stack of evenly spaced, equal-width chevrons pointing toward the
  // heading. At angle 0 the stack points "up" (each V's tip toward -y) and the
  // base chevron sits at the bottom, nearest the anchor. The SVG transform
  // below rotates the whole group rigidly around the viewBox centre (0,0) —
  // the same pivot the editor's drag/rotate handles already rely on, so
  // placement, dragging and rotation are unchanged.
  const w = CHEVRON_HALF_WIDTH;
  const h = CHEVRON_ARM_DROP;
  // One chevron: arms at (±w, cy), tip above them at (0, cy - h).
  const chevronPath = (cy: number) => `M ${-w} ${cy} L 0 ${cy - h} L ${w} ${cy}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      style={{
        transform: `rotate(${angle}deg)`,
        transformOrigin: "50% 50%",
        overflow: "visible",
      }}
      className={className}
    >
      <style>{`
        @keyframes curvedArrowPulse {
          0%, 100% { opacity: var(--base-o, 1); }
          50% { opacity: calc(var(--base-o, 1) * 0.65); }
        }
      `}</style>
      {CHEVRON_OPACITIES.map((o, i) => {
        // i = 0 is the base (bottom, fully opaque); higher i steps toward the
        // tip (up the axis and fainter).
        const cy = CHEVRON_BASE_CY - i * CHEVRON_SPACING;
        return (
          <g
            key={i}
            opacity={o}
            style={
              animate
                ? ({
                    "--base-o": o,
                    animation: "curvedArrowPulse 1.8s ease-in-out infinite",
                    animationDelay: `${i * 0.25}s`,
                  } as any)
                : undefined
            }
          >
            <path
              d={chevronPath(cy)}
              fill="none"
              stroke={ARROW_CORAL}
              strokeWidth={CHEVRON_STROKE_WIDTH}
              strokeLinecap={CHEVRON_LINECAP}
              strokeLinejoin={CHEVRON_LINEJOIN}
            />
          </g>
        );
      })}
    </svg>
  );
}
