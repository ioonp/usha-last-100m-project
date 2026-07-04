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

export const EVENTS = {
  // --- Walker funnel ---
  FINDME_OPENED: "findme_opened",
  WALK_STARTED: "walk_started",
  CHECKPOINT_VIEWED: "checkpoint_viewed",
  ARRIVAL_REACHED: "arrival_reached",
  WALK_COMPLETED: "walk_completed",

  // Walker fallback escapes. Both UI controls exist in the current code and are
  // wired at their call sites (the per-checkpoint "this doesn't match" link and
  // the arrival-screen "not yet" button in src/pages/Viewer.tsx).
  CHECKPOINT_MISMATCH: "checkpoint_mismatch",
  ARRIVAL_NOT_YET: "arrival_not_yet",

  // --- Creator funnel ---
  WIZARD_STARTED: "wizard_started",
  STREET_ENTRANCE_SET: "street_entrance_set",
  CHECKPOINT_ADDED: "checkpoint_added",
  GUIDE_PUBLISHED: "guide_published",
  FINDME_LINK_COPIED: "findme_link_copied",
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
