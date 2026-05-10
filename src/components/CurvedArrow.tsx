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
  const BLUE = "#4285F4";
  const fill = color === "white" ? "#FFFFFF" : color;

  // Each chevron defined by: cy (vertical center), w (half-width),
  // h (half-height of the V), thickness, opacity.
  const chevrons = [
    { cy:  72, w: 46, h: 22, t: 14, o: 1.0  }, // bottom — largest, closest
    { cy:  20, w: 34, h: 18, t: 12, o: 1.0  },
    { cy: -28, w: 24, h: 14, t: 10, o: 0.95 },
    { cy: -68, w: 16, h: 10, t:  8, o: 0.85 }, // top — smallest, farthest
  ];

  // Build an open chevron (V shape, no filled body) as a closed band:
  // outer V on top, inner V offset down by `t` to give it thickness.
  const chevronPath = (cy: number, w: number, h: number, t: number) => {
    const yTip   = cy - h;       // outer tip (top of V)
    const yArms  = cy;           // outer arm tips (bottom of V)
    const yTipI  = cy - h + t;   // inner tip
    const yArmsI = cy + t;       // inner arm tips
    // proportional inner half-width so the band stays even
    const wi = w - t;
    return [
      `M ${-w} ${yArms}`,
      `L 0 ${yTip}`,
      `L ${w} ${yArms}`,
      `L ${wi} ${yArmsI}`,
      `L 0 ${yTipI}`,
      `L ${-wi} ${yArmsI}`,
      `Z`,
    ].join(" ");
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      style={{
        transform: `rotate(${angle}deg)`,
        transformOrigin: "50% 50%",
        filter: withShadow
          ? "drop-shadow(0 4px 4px rgba(0,0,0,0.35))"
          : undefined,
        overflow: "visible",
      }}
      className={className}
    >
      {chevrons.map((c, i) => (
        <path
          key={i}
          d={chevronPath(c.cy, c.w, c.h, c.t)}
          fill={fill}
          stroke={BLUE}
          strokeWidth={3}
          strokeLinejoin="round"
          opacity={c.o}
        />
      ))}
    </svg>
  );
}
