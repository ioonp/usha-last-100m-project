export function CurvedArrow({
  angle = 0,
  size = 120,
  color = "white",
  className = "",
  withShadow = true,
}: {
  angle?: number;
  size?: number;
  color?: string;
  className?: string;
  withShadow?: boolean;
}) {
  // viewBox keeps the tip-of-cascade anchored at (0, ~-100) and the tail
  // (largest chevron) near (0, +100). The editor's rotation math
  // (atan2(-dx, dy)) on the tail handle keeps working unchanged because the
  // bottom-most chevron sits at the bottom of the viewBox.
  //
  // Cascading open V chevrons receding toward the top, Google-Maps style:
  // white fill, blue stroke, soft drop shadow. The top (smallest) chevron is
  // slightly translucent to reinforce depth.
  // Instagram-editorial: thin open V strokes, warm white, hand-annotated feel.
  const STROKE = color === "white" ? "#FFFDF8" : color;

  // Each chevron defined by: cy (vertical center), w (half-width),
  // h (half-height of the V), opacity.
  const chevrons = [
    { cy:  72, w: 48, h: 24, o: 1.0  }, // bottom — largest, closest
    { cy:  10, w: 34, h: 18, o: 0.9  },
    { cy: -50, w: 22, h: 12, o: 0.7  }, // top — smallest, farthest
  ];

  const chevronPath = (cy: number, w: number, h: number) =>
    `M ${-w} ${cy} L 0 ${cy - h} L ${w} ${cy}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      style={{
        transform: `rotate(${angle}deg)`,
        transformOrigin: "50% 50%",
        filter: withShadow
          ? "drop-shadow(0 1px 3px rgba(0,0,0,0.2))"
          : undefined,
        overflow: "visible",
      }}
      className={className}
    >
      {chevrons.map((c, i) => (
        <g key={i} opacity={c.o}>
          <path
            d={chevronPath(c.cy, c.w, c.h)}
            fill="none"
            stroke="rgba(0,0,0,0.55)"
            strokeWidth={6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={chevronPath(c.cy, c.w, c.h)}
            fill="none"
            stroke={STROKE}
            strokeWidth={4}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
    </svg>
  );
}
