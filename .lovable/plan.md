## Goal

Step 1 should only set the pin + address. The entrance/starting-point photo (currently uploaded in Step 1) moves to Step 2, where it becomes the always-present first checkpoint. The walker still sees this photo on the street arrival check screen AND as the first frame of the reel.

## Step 1 — Start point (Wizard.tsx)

- Remove the "Street arrival photo" upload block and the "Photo caption" textarea.
- Keep: map pin picker, address display, optional starting note.
- Add an explicit callout above/below the pin telling the creator:
  > "Next, in Step 2, you'll add the entrance photo as your first checkpoint — taken from the spot where Google Maps drops visitors, facing the building."
- Drop the `arrivalPhoto`, `arrivalCaption`, `onArrivalPhotoUpload` state/handlers.

## Step 2 — Checkpoints (CheckpointEditor.tsx)

- The first card is special-cased:
  - Eyebrow reads "Starting point — building entrance" instead of "Step 1".
  - Helper text under the photo slot: "Stand where Google Maps drops visitors. Photograph the entrance and any nearby landmarks (shops, signs). Walkers will see this both to confirm they're in the right place and as the first navigation step."
  - Note placeholder becomes: "e.g. Look for the dark green gate between the pharmacy and the bakery." (this note doubles as the arrival caption).
  - Cannot be deleted and cannot be moved (hide trash + up arrow; first-card down still allowed only if there are others below, but reorder must keep it at position 0 — simplest: disable both reorder buttons for index 0 and force new checkpoints to insert after it).
- Subsequent cards keep current behavior, renumbered "Step 2", "Step 3"… in the eyebrow.
- Auto-seed: if `checkpoints` is empty when Step 2 renders, prepend an empty starting-point card so the slot is always visible.

## Viewer (Viewer.tsx)

- Street arrival check screen no longer reads `loc.street_arrival_photo_url` / `loc.street_arrival_caption`. Instead, use `checkpoints[0].photo_url` and `checkpoints[0].note` for the reference image and caption overlay.
- Reel navigation: leave unchanged — it already iterates all checkpoints starting at index 0, so the entrance photo is naturally the first reel frame.

## Data model

- No migration. `street_arrival_photo_url` and `street_arrival_caption` columns stay in the DB but become unused; the Wizard stops writing to them. (Leaving them avoids touching old published locations; can be cleaned up later.)
- For locations that were saved under the old flow and still have data in `street_arrival_photo_url` with no checkpoints, the Viewer fallback shows "no photo" — acceptable since the wizard always seeds a starting-point card now and the creator can re-publish.

## Files touched

- `src/pages/Wizard.tsx` — remove arrival photo/caption UI + state; add Step 1 callout; stop sending those fields on save.
- `src/components/wizard/CheckpointEditor.tsx` — special first-card treatment, undeletable/unmovable, auto-seed, copy changes.
- `src/pages/Viewer.tsx` — street arrival screen sources image + caption from `checkpoints[0]`.
