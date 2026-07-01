// User-facing Creator copy that isn't bound to a single component's markup.
// New strings live here rather than being hardcoded inline, so copy can be
// tuned (or localised later) in one place.

// Category-neutral wording for a business/venue name across the Creator
// surface — reads correctly for studios, event hosts, venues, and any business
// with a hard-to-find entrance. Kept short so labels/placeholders don't clip at
// ~390px.
export const locationStrings = {
  /** Field label for the business/venue name. */
  nameLabel: "Location name",
  /** Broad example signalling any venue fits; shortened to fit a ~390px input. */
  namePlaceholder: "e.g. Mahalaya Yoga or Kreuzberg Warehouse",
  /** Seed value for a new, unnamed location. */
  defaultName: "My Location",
  /** Fallback shown in the live preview before a name is entered. */
  previewFallback: "Your location",
};

export const publishStrings = {
  /** Eyebrow above the pre-publish summary card. */
  summaryEyebrow: "Going live",
  // NOTE: key name kept (code identifier); only the display value is generalised.
  studioLabel: "Location",
  linkLabel: "Find Me link",
  /** One-line description of the guide contents about to be published. */
  contents: (checkpoints: number) =>
    `Street Entrance + ${checkpoints} ${checkpoints === 1 ? "checkpoint" : "checkpoints"}`,
};
