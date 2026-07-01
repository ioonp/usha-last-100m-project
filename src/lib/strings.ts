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

// Copy for the public marketing landing page ("/"). All visible strings for
// that page live here so they can be tuned or localised without touching
// component markup.
export const landingStrings = {
  nav: {
    signIn: "Sign in",
    buildOne: "Build one now",
  },
  hero: {
    eyebrow: "Wayfinding for the last 100 meters",
    headlinePrefix: "Find your way to the",
    /** Words rotated through the headline's clay-colored slot, in order. */
    rotatingWords: ["studio", "venue", "gallery", "clinic", "courtyard", "door"],
    subhead:
      "Maps gets people to the street. Then it quits — right where the courtyard, the back gate, and the hidden door begin.",
    ctaPrimary: "Build one now",
    ctaSecondary: "See a demo",
    reassurance: "No app to download — visitors just tap a link.",
    map: {
      ariaLabel:
        "A map where the Google Maps route stops at the street, leaving the real door hidden in a courtyard beyond reach.",
      courtyardLabel: "HINTERHOF",
      gapLabel: "the last 100m →",
      legendMapsStop: "Where Maps stops",
      legendActualDoor: "The actual door",
    },
  },
  turn: {
    eyebrow: "Where Usha takes over",
    heading: "Pick up exactly where the map gives up.",
    lead: "You lay down a short trail of photos — each one a checkpoint with an arrow pointing to the next. Your visitor just follows the pictures, straight through the gap to your door.",
    steps: [
      {
        title: "Start where Maps drops them",
        desc: "Set the street pin — the spot everyone gets stuck.",
      },
      {
        title: "Drop photo checkpoints",
        desc: "Snap the turns. Add an arrow. That's a checkpoint.",
      },
      {
        title: "They reach the door",
        desc: "No more “I’m outside, where are you?” — they just arrive.",
      },
    ],
    map: {
      ariaLabel:
        "The same map, now with a trail of photo checkpoints bridging the gap from the street to the courtyard door.",
      courtyardLabel: "HINTERHOF",
      legendCheckpoint: "Photo checkpoint",
      legendDoorReached: "Door reached",
    },
  },
  recognition: {
    eyebrow: "You know this conversation",
    heading: "The texts you’re tired of sending.",
    lead: "Every venue with a hidden door has this thread on repeat.",
    thread: [
      { from: "them" as const, text: "I’m outside? I don’t see it 😅" },
      { from: "you" as const, text: "which entrance are you at?" },
      { from: "them" as const, text: "there’s no sign… is it the courtyard?" },
      { from: "you" as const, text: "stay there, I’ll come get you" },
    ],
    afterPrefix: "Usha replaces the whole thread with ",
    afterHighlight: "one link",
    afterSuffix: ".",
  },
  how: {
    eyebrow: "Three steps, about three minutes",
    heading: "Build a guide from your phone.",
    lead: "Walk the route once, photographing as you go. Share the link. Done.",
    cards: [
      {
        number: "01",
        title: "Drop a starting pin",
        desc: "Mark where Maps leaves people off — the street door your guide begins from.",
      },
      {
        number: "02",
        title: "Add photo checkpoints",
        desc: "Photograph each turn and point an arrow the right way. One photo per decision.",
      },
      {
        number: "03",
        title: "Share a QR or link",
        desc: "Print it, stick it by the street, drop it in your booking email. Visitors just follow.",
      },
    ],
  },
  cta: {
    eyebrow: "For studios, venues, clinics, and event hosts",
    heading: "Make one for your door.",
    body: "If people get lost finding you, fix it before your next booking. Building a guide takes about three minutes.",
    ctaPrimary: "Build one now",
    ctaSecondary: "See a demo first",
    note: "No account needed to try · No app for your visitors",
  },
  footer: {
    tagline: "Photo wayfinding for the last 100 meters · Berlin",
  },
};
