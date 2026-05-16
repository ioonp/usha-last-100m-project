import { supabase } from "@/integrations/supabase/client";

export type EventType =
  | "page_opened"
  | "arrival_confirmed"
  | "checkpoint_viewed"
  | "completed";

export function trackEvent(
  locationId: string,
  eventType: EventType,
  checkpointIndex?: number,
) {
  // Fire-and-forget. No PII, no cookies, no IP.
  void supabase.from("page_events").insert({
    location_id: locationId,
    event_type: eventType,
    checkpoint_index: checkpointIndex ?? null,
  });
}