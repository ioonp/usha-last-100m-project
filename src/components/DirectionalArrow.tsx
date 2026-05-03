export const DIRECTIONS = ["up", "up-right", "right", "down-right", "down", "down-left", "left", "up-left"] as const;
export type Direction = typeof DIRECTIONS[number];

const ANGLES: Record<Direction, number> = {
  up: 0, "up-right": 45, right: 90, "down-right": 135,
  down: 180, "down-left": 225, left: 270, "up-left": 315,
};

export function DirectionalArrow({
  direction,
  size = 120,
  className = "",
  color = "currentColor",
  pulse = false,
}: {
  direction: Direction;
  size?: number;
  className?: string;
  color?: string;
  pulse?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{ transform: `rotate(${ANGLES[direction]}deg)` }}
      className={`drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] ${pulse ? "animate-arrow-pulse" : ""} ${className}`}
    >
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="1.2" /></filter>
      </defs>
      <g fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M50 88 L50 18" />
        <path d="M22 46 L50 16 L78 46" />
      </g>
    </svg>
  );
}
