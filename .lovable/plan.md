# On-Location Capture Flow

Replace the existing 4-step desktop wizard with a single mobile-first flow the creator runs **while physically walking the route**. Wired to the real backend so we can publish and usability-test end-to-end.

## The Flow

```text
Dashboard
   │  [+ New location]
   ▼
┌─────────────────────────────────────────┐
│ 1. STARTING POINT                       │
│  • "Use my location" → request GPS      │
│  • Show map w/ pin at device coords     │
│  • User can drag pin to fine-tune       │
│  • Optional starting note               │
│  [Confirm starting point]               │
├─────────────────────────────────────────┤
│ 2. CHECKPOINTS (loop, one at a time)    │
│  • Big camera button → native camera    │
│  • Photo preview                        │
│  • Drag arrow on top of photo           │
│  • Optional note                        │
│  • [Save & add next]  [Finish route]    │
│  Sidebar: thumbnail strip of captured   │
│  checkpoints, tap to edit/delete/reorder│
├─────────────────────────────────────────┤
│ 3. BRANDING (quick, optional)           │
│  • Studio name (prefilled from profile) │
│  • Logo, accent color, welcome message  │
│  • "Skip for now" allowed               │
├─────────────────────────────────────────┤
│ 4. PUBLISH                              │
│  • Share URL + QR + copy button         │
└─────────────────────────────────────────┘
```

The route is **persisted continuously** — each confirmed checkpoint is saved immediately, so if the creator's phone dies mid-walk they can resume from the dashboard.

## Key UX Decisions

- **Mobile-first layout.** Single column, large tap targets, sticky bottom action bar. Still usable on desktop (with the existing map picker) but optimized for a phone held one-handed outdoors.
- **GPS with confirm-on-map.** On Step 1, request `navigator.geolocation`, drop the pin at the device coords, show it on the existing Google map, allow drag to nudge before confirming. Handle denied/unavailable gracefully (fall back to current map picker behavior).
- **Camera-native capture.** `<input type="file" accept="image/*" capture="environment">` to open the phone camera directly. Compress via existing `lib/upload.ts`.
- **Inline arrow editor** after each shot — reuse `CheckpointEditor`'s arrow drag logic in a single-checkpoint, full-screen variant.
- **Resume support.** If a draft `location` row exists (unpublished, owned by user), the dashboard shows "Continue capturing" instead of "New location".

## Implementation

Files touched:

- **`src/pages/Capture.tsx`** (new) — replaces `Wizard.tsx` as the primary flow. Routed at `/capture/:id` (id can be `new`).
- **`src/components/capture/GeoStartStep.tsx`** (new) — GPS request + map confirmation. Wraps existing `MapPinPicker`.
- **`src/components/capture/CheckpointCaptureStep.tsx`** (new) — camera input, photo preview, arrow drag, note field, thumbnail strip.
- **`src/components/capture/BrandingStep.tsx`** (new) — slim version of current Step 3.
- **`src/components/capture/PublishStep.tsx`** (new) — share URL + QR (extracted from current Wizard).
- **`src/components/wizard/CheckpointEditor.tsx`** — extract the single-checkpoint arrow editor into a reusable subcomponent used by both old wizard and new capture step.
- **`src/pages/Dashboard.tsx`** — replace "Open wizard" CTA with "New location" routing to `/capture/new`; surface in-progress drafts as "Continue capturing".
- **`src/App.tsx`** — add `/capture/:id` route. **Keep** `/wizard/:id` for now as a hidden fallback (not linked in UI) so existing drafts still open; remove in a follow-up after testing.

No schema changes — the existing `locations` + `checkpoints` tables already support the data (`start_lat`, `start_lng`, `start_address`, `start_note`, per-checkpoint `photo_url`, `arrow_direction`, `note`, `indicators`, `position`, `published`). Continuous save just calls the same `upsert` logic per step.

Persistence model: create the `locations` row on Step 1 confirm (`published=false`), then insert each checkpoint as it's saved (instead of the wizard's current delete-and-reinsert-all-at-end pattern). This unlocks the resume flow.

Geolocation: `navigator.geolocation.getCurrentPosition` with `{ enableHighAccuracy: true, timeout: 10000 }`. Permission-denied state shows "Pick on map instead" CTA.

Camera: file input with `capture="environment"`; preview the captured `File` via `URL.createObjectURL` before upload so the arrow can be placed before the network round-trip.

## What we're *not* changing

- Visual design system, viewer page, analytics, auth.
- Database schema.
- The arrow overlay rendering logic in the viewer.

## Out of scope (next iterations)

- Auto-capture GPS per checkpoint (could enable later for "nearest checkpoint" hints).
- Offline queue if the creator loses signal mid-walk.
- Reordering checkpoints via drag (tap-to-edit/delete only for v1).
