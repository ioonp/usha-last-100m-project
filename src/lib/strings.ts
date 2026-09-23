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

// Marketing landing page ("/") copy, from the design handoff
// (landing.strings.en.json).
export const landingStrings = {
  nav: {
    howItWorks: "How it works",
    options: "Pricing",
    faq: "FAQ",
    signIn: "Sign in",
    videoCta: "Get a video guide",
  },
  hero: {
    eyebrow: "For venues in Berlin's Hinterhöfe",
    title: "Guests lost in your courtyard? We guide them the",
    titleEmphasis: "last 100 meters.",
    subtitle:
      "A short walking guide that takes guests from the street, through the archways, straight to your door. No app, just a link or a QR code.",
    primaryCta: "Get a video guide",
    secondaryCta: "or make a free photo guide",
    note: "Video guides on request · Photo guides are free",
    phoneAlt:
      "Usha guide step screen: a passageway leading to the courtyard, with the instruction Keep going, it's further back",
  },
  problems: {
    title: "Sound familiar?",
    late: {
      title: "Guests arrive late",
      body: "They find the street, then lose minutes in the wrong courtyard.",
    },
    calls: {
      title: "\"Where exactly are you?\"",
      body: "Your team answers the same directions call before every class or booking.",
    },
    impression: {
      title: "A stressful first impression",
      body: "The visit starts with searching instead of the calm you've designed.",
    },
  },
  example: {
    eyebrow: "Live at Yoga Futura, Kreuzberg",
    title: "One real courtyard, from street to door.",
    body: "This is the guide Yoga Futura's guests use to find the studio at Kreuzberger Straße 30: short clips, one instruction per turn, straight to the door.",
    cta: "Open the live guide",
    ctaMobile: "Try the live guide",
    qrTitle: "Scan to try it on your phone",
    qrBody: "Works best standing in front of the building, but you can walk it from your desk.",
    url: "https://usha.live/find/yoga-futura-kreuzberg",
    startAlt: "Start screen of the Yoga Futura guide with a Tap to start button over the street view",
    qrAlt: "QR code linking to the Yoga Futura guide",
  },
  options: {
    eyebrow: "Two ways to get your guide",
    title: "We do it for you, or you do it yourself.",
    subtitle: "Start where you are. Every photo guide can be upgraded to video later.",
    video: {
      label: "Video guide",
      badge: "Recommended",
      title: "We film it for you.",
      points: [
        "We come by and film the route from the street to your door",
        "Edited into a short, step-by-step video guide",
        "Every arch, gate and door highlighted",
        "Live within 3 days, shared by link and QR code",
      ],
      cta: "Request a video guide",
      note: "Tell us your venue. We reply within a day.",
    },
    photo: {
      label: "Photo guide",
      badge: "Free",
      title: "Do it yourself.",
      points: [
        "Snap a photo of each turn with your phone",
        "Add one short instruction per photo",
        "Publish in about 5 minutes",
        "Upgrade to a video guide anytime",
      ],
      cta: "Create a free guide",
      note: "Takes about 5 minutes on your phone.",
      signInPrompt: "Already have a guide?",
      signIn: "Sign in",
    },
  },
  how: {
    title: "How it works",
    steps: [
      { title: "Create the guide", body: "We film your route, or you upload a photo of each turn." },
      { title: "Share one link", body: "Add it to booking confirmations, Google Maps and your website, or print the QR code for the street entrance." },
      { title: "Guests walk straight in", body: "One clear step at a time, from the street to the right door." },
    ],
  },
  faq: {
    title: "Questions",
    items: [
      { q: "Do guests need to download an app?", a: "No. The guide opens in the browser from a link or a QR code." },
      { q: "How long does filming take?", a: "About 15 minutes on site. We walk the route once and handle the editing ourselves." },
      { q: "Can I start free and switch to video later?", a: "Yes. Publish a photo guide today and request a video guide whenever you're ready." },
      { q: "What if something in the courtyard changes?", a: "Tell us and we'll update your guide." },
    ],
  },
  closing: {
    title: "Stop giving directions over the phone.",
    body: "Get guests to your door, from their very first visit.",
    videoCta: "Get a video guide",
    photoCta: "Make a free photo guide",
  },
  footer: {
    domain: "usha.live",
    madeIn: "Made in Berlin ❤️",
    imprint: "Imprint",
    privacy: "Privacy",
    contact: "Contact",
  },
  // The video CTAs open a mailto built from these (address + subject live here
  // as the constant).
  videoRequestEmail: {
    to: "iapara.ion.g@gmail.com",
    subject: "Video guide for my venue",
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
    /** Quiet restart link on the arrival screen. */
    startAgain: "Start again",
    /** Fallback heading when the video can't load. */
    fallbackTitle: "Follow the photos",
    /** Fallback intro line under the heading. */
    fallbackLead: "The video couldn't load — here are the steps to the door.",
    /** Per-step label in the fallback list, e.g. "Step 2". */
    fallbackStep: (n: number) => `Step ${n}`,
    /** Success screen — one-tap "was this easy to follow?" (👍/👎), then a
     *  Thanks. Yes/No strings are the accessible labels behind the emoji. */
    feedbackQuestion: "Was this easy to follow?",
    feedbackYes: "Yes, easy to follow",
    feedbackNo: "No, I struggled",
    feedbackThanks: "Thanks!",
    /** Stuck screen — "where did you get stuck?"; per-checkpoint options come
     *  from the manifest captions, plus this catch-all and a Thanks. */
    stuckQuestion: "Where did you get stuck?",
    stuckElsewhere: "Somewhere else",
    stuckThanks: "Thanks — that helps us fix it",
    /** Arrival screen — secondary link to the Usha landing page (new tab). */
    createOwnCta: "Create your own guide →",
    landingUrl: "https://usha.live",
    /** Arrival screen — quiet signature footer near the bottom. */
    madeInBerlin: "Made in Berlin ❤️",
    /** Accessible label for the Stories-style segmented progress bar. */
    progressLabel: "Walk progress",
  },
};
