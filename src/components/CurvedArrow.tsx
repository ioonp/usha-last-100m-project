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
  // viewBox: tip anchored at (0,0), tail at (0, 100). Default points up.
  // S-curve via control point offset to the right of the path.
  const d = "M 0 100 Q 45 50 0 0";
  return (
    <svg
      width={size}
      height={size}
      viewBox="-100 -100 200 200"
      style={{
        transform: `rotate(${angle}deg)`,
        transformOrigin: "50% 50%",
        filter: withShadow ? "drop-shadow(0 2px 6px rgba(0,0,0,0.6))" : undefined,
        overflow: "visible",
      }}
      className={className}
    >
      {/* Thicker tail segment for tapered feel */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray="55 400"
        strokeDashoffset="0"
      />
      {/* Mid-weight overlay */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray="95 400"
      />
      {/* Full thin core */}
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth="6"
        strokeLinecap="round"
      />
      {/* Filled arrowhead at tip, pointing up (-y) */}
      <path d="M -14 6 L 0 -18 L 14 6 Z" fill={color} />
    </svg>
  );
}
