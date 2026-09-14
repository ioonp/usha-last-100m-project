// Umami custom-event instrumentation.
//
// The Umami tracking script and website ID are added in index.html (Umami
// Cloud) — not here. This module is the single wrapper every component calls to
// emit a custom event. It safely no-ops when window.umami is undefined (dev,
// ad-blockers, or before the deferred script has loaded), so call sites never
// need to guard.
//
// All event-name strings live in EVENTS so the product's analytics vocabulary
// is defined in one place. Names read in product terms ("street_entrance",
// "guide") even where the underlying code model still calls something a "path"
// or "location".
//
// NOTE: this is distinct from src/lib/track.ts, which writes per-location
// page_events to Supabase. That is a separate concern and is left untouched.

declare global {
  interface Window {
    umami?: {
      track: (eventName: string, eventData?: Record<string, unknown>) => void;
    };
  }
}

// Event names are namespaced by surface with a readable prefix — landing_,
// photo_, video_, creator_ — so they cluster by surface in Umami's flat list
// and read without a legend. Keep the surface prefix, snake_case, and a
// past-tense verb; put everything else in properties, never in the name.
export const EVENTS = {
  // ── Landing (marketing site). Pageviews auto-track; these are CTA taps,
  //    each with a { placement: "hero" | "cta" | "nav" } property. ──
  LANDING_SIGNUP_CLICKED: "landing_signup_clicked",
  LANDING_SIGNIN_CLICKED: "landing_signin_clicked",
  LANDING_DEMO_CLICKED: "landing_demo_clicked",

  // ── Photo guide (photo-checkpoint walker). All fire with { slug }; the
  //    checkpoint ones also carry { index }. No PII, ever. ──
  PHOTO_OPENED: "photo_opened",
  PHOTO_STARTED: "photo_started",
  PHOTO_CHECKPOINT_VIEWED: "photo_checkpoint_viewed",
  PHOTO_ARRIVAL_REACHED: "photo_arrival_reached",
  PHOTO_COMPLETED: "photo_completed",
  PHOTO_CHECKPOINT_MISMATCH: "photo_checkpoint_mismatch",
  PHOTO_ARRIVAL_NOT_YET: "photo_arrival_not_yet",

  // ── Video guide (reel player). All fire with { slug }; feedback carries a
  //    { value } and stuck a { checkpoint, label }. No PII, ever. ──
  VIDEO_OPENED: "video_opened",
  VIDEO_STARTED: "video_started",
  VIDEO_CHECKPOINT_VIEWED: "video_checkpoint_viewed",
  VIDEO_ARRIVAL_REACHED: "video_arrival_reached",
  VIDEO_COMPLETED: "video_completed",
  VIDEO_RESTARTED: "video_restarted",
  VIDEO_HELP_CLICKED: "video_help_clicked",
  VIDEO_CHECKPOINT_MISMATCH: "video_checkpoint_mismatch",
  VIDEO_FEEDBACK: "video_feedback",
  VIDEO_STUCK: "video_stuck",

  // ── Creator (dashboard + build wizard). Guide-scoped ones carry { slug }. ──
  CREATOR_NEW_GUIDE_CLICKED: "creator_new_guide_clicked",
  CREATOR_GUIDE_OPENED: "creator_guide_opened",
  CREATOR_LINK_COPIED: "creator_link_copied",
  CREATOR_QR_DOWNLOADED: "creator_qr_downloaded",
  CREATOR_GUIDE_ARCHIVED: "creator_guide_archived",
  CREATOR_WIZARD_STARTED: "creator_wizard_started",
  CREATOR_ENTRANCE_SET: "creator_entrance_set",
  CREATOR_CHECKPOINT_ADDED: "creator_checkpoint_added",
  CREATOR_PUBLISHED: "creator_published",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

/**
 * Emit a custom event to Umami. Safe no-op when the Umami script has not loaded.
 * Every analytics call in the app must go through this helper rather than
 * touching window.umami directly.
 */
export function trackEvent(name: EventName, data?: Record<string, unknown>) {
  window.umami?.track(name, data);
}
