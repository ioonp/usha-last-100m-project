// Visual definition of the directional arrow glyph — the "skewed stack" of
// evenly spaced chevrons rendered by CurvedArrow. Everything that controls how
// the glyph LOOKS lives here so it can be retuned without touching render or
// drag/rotate logic. Geometry is expressed in the CurvedArrow viewBox space
// (-100..100 on each axis); at angle 0 the stack points "up" (tip toward -y),
// with the base chevron nearest the anchor at the bottom.

/** Single coral colour shared by every chevron (only the opacity is graded). */
export const ARROW_CORAL = "#D86C49";

/**
 * Opacity per chevron from base (tail, nearest the anchor — fully opaque) to
 * tip (faintest). The array length is also the number of chevrons drawn.
 */
export const CHEVRON_OPACITIES = [1, 0.78, 0.58, 0.42] as const;

/** Number of chevrons in the stack. */
export const CHEVRON_COUNT = CHEVRON_OPACITIES.length;

/** Stroke width of each chevron's two arms (viewBox units). */
export const CHEVRON_STROKE_WIDTH = 14;

/** Half the full width of a chevron — identical for all four (no taper). */
export const CHEVRON_HALF_WIDTH = 46;

/** Vertical drop from the tip down to each arm end (the depth of the V). */
export const CHEVRON_ARM_DROP = 22;

/** Even spacing between chevron centres along the arrow axis. */
export const CHEVRON_SPACING = 48;

/** Centre (y) of the base chevron — the one nearest the anchor/tail. */
export const CHEVRON_BASE_CY = 72;

/** Rounded caps + joins so each V reads as a soft chevron. */
export const CHEVRON_LINECAP = "round" as const;
export const CHEVRON_LINEJOIN = "round" as const;
