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

// Walker-facing copy for the public guide-following experience (the
// /find/:slug Viewer). Wayfinding-signage tone: short, high-contrast,
// unambiguous. Kept here rather than inline so Walker copy stays tunable in one
// place and reads correctly at ~390px.
export const walkerStrings = {
  /** Welcome-screen primer between the subtitle and the map preview: guide
   *  length plus a rough time. Photo count is derived from the live checkpoint
   *  count; the duration is a static estimate until real timing data exists. */
  guidePrimer: (photoCount: number) =>
    `${photoCount} ${photoCount === 1 ? "photo" : "photos"} · about 90 seconds from the street`,

  /** Per-checkpoint step counter, e.g. "Checkpoint 1 of 3". */
  checkpointCounter: (current: number, total: number) =>
    `Checkpoint ${current} of ${total}`,
  /** Headline fallback for a mid-route checkpoint with no saved note. */
  keepGoing: "Keep going",
  /** Headline fallback for the final checkpoint — signals near-arrival. */
  almostThere: "Almost there",
  /** Low-emphasis checkpoint link that opens the stuck/help fallback. */
  doesntMatch: "This doesn't match — help",

  /** Relabelled arrival "Not yet" action — opens the map/contact fallback. */
  arrivalNotYet: "Not yet — show me the map",

  /** Success-screen primary action — opens the venue contact fallback. */
  successContact: "Still can't find the door? Contact us",
  /** Success-screen demoted secondary link. */
  startOver: "Start over",

  /** Shared stuck/help + venue-contact fallback sheet, reached from the arrival
   *  "Not yet" action, each checkpoint's "doesn't match" link, and the success
   *  screen. Surfaces the venue details that exist plus the existing map
   *  handler; there is no phone/email column to expose. */
  help: {
    title: "Can't find the door?",
    body: "Open the map to get your bearings, or head back to the street entrance and follow the photos from there.",
    venueLabel: "Venue",
    lookForLabel: "Look for",
    openMaps: "Open in Maps",
    dismiss: "Close",
  },
};
