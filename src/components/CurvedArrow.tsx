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
  // viewBox keeps tip anchored at (0,0) and tail near (0, 100) so the
  // editor's rotation math (atan2(-dx, dy)) keeps working unchanged.
  // Shape = perspective-projected road-marking chevron:
  //   - narrow at the tip (top, receding)
  //   - wide at the base (bottom, close to viewer)
  //   - inward notch at the bottom for that classic chevron look
  const chevron =
    "M 0 -8 " +        // tip (narrow, far)
    "L 16 60 " +       // right shoulder (mid)
    "L 42 100 " +      // right base outer (wide, near)
    "L 22 100 " +      // right base inner
    "L 0 55 " +        // bottom notch
    "L -22 100 " +     // left base inner
    "L -42 100 " +     // left base outer
    "L -16 60 " +      // left shoulder (mid)
    "Z";
  const fill = color === "white" ? "#FFD60A" : color; // bright road-marking yellow by default
  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      style={{
        transform: `rotate(${angle}deg)`,
        transformOrigin: "50% 50%",
        filter: withShadow
          ? "drop-shadow(0 6px 8px rgba(0,0,0,0.55)) drop-shadow(0 2px 2px rgba(0,0,0,0.45))"
          : undefined,
        overflow: "visible",
      }}
      className={className}
    >
      {/* Dark contact-shadow plate offset down-left to fake ground contact */}
      <path
        d={chevron}
        fill="rgba(0,0,0,0.45)"
        transform="translate(3 6)"
      />
      {/* Outer dark stroke for legibility on any background */}
      <path
        d={chevron}
        fill={fill}
        stroke="rgba(0,0,0,0.85)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* Subtle highlight along the near edge to sell the painted-floor feel */}
      <path
        d="M -38 96 L -14 64 L 14 64 L 38 96"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
