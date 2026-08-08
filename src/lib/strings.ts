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

export const landingStrings = {
  nav: {
    signIn: "Sign in",
    buildOne: "Build one now",
  },
  // Shown by both demo buttons (hero + closing CTA) instead of opening /demo.
  // The route still exists, but its canned example doesn't match the studio
  // story this page tells, so the buttons acknowledge the click for now.
  demoUnavailable: "Demo not available yet",
  hero: {
    eyebrow: "Wayfinding for the last 100 meters",
    // Static, owner-voiced headline (was a rotating word). Speaks to the owner's
    // outcome, not the lost visitor, and keeps the hero calm. Segment-neutral:
    // "visitors" covers students, guests, attendees and patients alike, so the
    // hero reads as universal and only the example section names a segment.
    headline: "Your visitors stop getting lost at the door.",
    subhead:
      "Maps drops them on the street. Usha walks them the rest of the way — through the courtyard, past the side gate, to your door. With photos, not another text from you.",
    ctaPrimary: "Build your guide",
    ctaSecondary: "Check a Demo",
    reassurance: "No app to download. They just tap a link.",
    proof: "Made in Berlin, for Berlin's courtyards and back buildings.",
    map: {
      ariaLabel:
        "A map where the Google Maps route stops at the street, leaving the real door hidden in a courtyard beyond reach.",
      courtyardLabel: "HINTERHOF",
      gapLabel: "the last 100m →",
      legendMapsStop: "Where Maps stops",
      legendActualDoor: "The actual door",
    },
  },
  recognition: {
    eyebrow: "Every hard-to-find door has this thread",
    /** Screen-reader label for the segment pill row. */
    segmentsLabel: "Show the example for",
    /**
     * One worked example per segment, all sharing the same shape — heading,
     * one-line lead, four-message thread — so switching pills re-themes the
     * copy without moving the layout. The first entry is the default.
     *
     * Presentational only: the selected segment is local component state on the
     * landing page and is never persisted, routed, or sent anywhere.
     */
    segments: [
      {
        id: "studio",
        label: "Studio",
        heading: "The texts you’re tired of sending.",
        lead: "Every Hinterhof studio has this thread on repeat with new students.",
        thread: [
          { from: "them" as const, text: "I’m outside? I don’t see it 😅" },
          { from: "you" as const, text: "which entrance are you at?" },
          { from: "them" as const, text: "there’s no sign… is it the courtyard?" },
          { from: "you" as const, text: "stay there, I’ll come get you" },
        ],
      },
      {
        id: "rental",
        label: "Airbnb / short-stay rental",
        heading: "The check-in messages you answer at midnight.",
        lead: "Every short-stay host has this thread on repeat with arriving guests.",
        thread: [
          { from: "them" as const, text: "I’m at the address but which building? 😅" },
          { from: "you" as const, text: "are you by the green gate?" },
          { from: "them" as const, text: "there are three doors, none have your name" },
          { from: "you" as const, text: "hang on, I’ll come down" },
        ],
      },
      {
        id: "event",
        label: "Event space",
        heading: "The calls you take right at doors open.",
        lead: "Every multi-building venue has this thread on repeat while guests arrive.",
        thread: [
          { from: "them" as const, text: "we’re on site — which building is it? 😅" },
          { from: "you" as const, text: "have you passed the loading bay?" },
          { from: "them" as const, text: "there’s no signage, just numbers" },
          { from: "you" as const, text: "stay there, someone’s coming out" },
        ],
      },
      {
        id: "clinic",
        label: "Clinic / practice",
        heading: "The calls your front desk keeps taking.",
        lead: "Every practice down a passage has this thread on repeat with new patients.",
        thread: [
          { from: "them" as const, text: "I’m at the address, I don’t see the practice 😅" },
          { from: "you" as const, text: "are you through the passage yet?" },
          { from: "them" as const, text: "just a row of buzzers, no names" },
          { from: "you" as const, text: "wait there, I’ll come out" },
        ],
      },
    ],
    afterPrefix: "Usha replaces the whole thread with ",
    afterHighlight: "one link",
    afterSuffix: ".",
  },
  // The former "turn" and "how" sections merged into one — the three steps were
  // being described twice with two schematic maps. Copy from "turn", the numbered
  // steps from "how" (owner-voiced), and the trail map as the single visual.
  howItWorks: {
    eyebrow: "Where Usha takes over",
    heading: "Pick up exactly where the map gives up.",
    lead: "Walk the route once, photographing as you go. Your visitor just follows the pictures, straight through the gap to your door.",
    steps: [
      { number: "01", title: "Drop a starting pin", desc: "Mark where Maps leaves people off — the street your guide begins from." },
      { number: "02", title: "Add photo checkpoints", desc: "Photograph each turn and point an arrow the right way. One photo per decision." },
      { number: "03", title: "Share a QR or link", desc: "Print it by the street, drop it in your confirmation email. Visitors just follow." },
    ],
    map: {
      ariaLabel:
        "The same map, now with a trail of photo checkpoints bridging the gap from the street to the courtyard door.",
      courtyardLabel: "HINTERHOF",
      legendCheckpoint: "Photo checkpoint",
      legendDoorReached: "Door reached",
    },
  },
  cta: {
    eyebrow: "For any door nobody can find",
    heading: "Make one for your door.",
    body: "If someone’s first visit starts with “I can’t find you,” fix it before the next one. Building a guide takes about three minutes.",
    ctaPrimary: "Build your guide",
    ctaSecondary: "See a demo",
    note: "No account needed to try · No app to download",
  },
  footer: {
    tagline: "Photo wayfinding for the last 100 meters · Berlin",
  },
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

  /** Video Guide (reel player) chrome. The arrival instruction itself is
   *  manifest data, not a string here; these are the surrounding UI labels. */
  video: {
    /** Tap-to-start overlay — the first gesture iOS needs for inline playback. */
    tapToStart: "Tap to start",
    /** Arrival prompt, affirmative. */
    madeIt: "I made it",
    /** Arrival prompt, negative — opens the help sheet. */
    notYet: "Not yet",
    /** Used when the manifest omits an arrival instruction. */
    arrivalFallback: "You've arrived.",
    /** Shown after "I made it". */
    completedTitle: "You made it!",
    /** Fallback heading when the video can't load. */
    fallbackTitle: "Follow the photos",
    /** Fallback intro line under the heading. */
    fallbackLead: "The video couldn't load — here are the steps to the door.",
    /** Per-step label in the fallback list, e.g. "Step 2". */
    fallbackStep: (n: number) => `Step ${n}`,
  },
};
