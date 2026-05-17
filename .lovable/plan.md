
## Scope

All changes are in `src/pages/Viewer.tsx` (the end-user walking experience). No DB, no wizard changes.

## Changes

### 1. "I can't find this" → open Maps app directly
- Replace the inline "I can't find this" underline button (and remove the help bottom sheet) with a single button labeled **📍 Show me on map** plus subtext "Opens in Maps app".
- On click: use `loc.start_lat` / `loc.start_lng` (entrance pin saved in Step 1) and deep-link:
  - iOS (`/iPad|iPhone|iPod/.test(navigator.userAgent)`): `maps://maps.apple.com/?q={lat},{lng}`
  - Otherwise: `https://maps.google.com/?q={lat},{lng}`
- If coordinates are missing, fall back to disabling the button.
- Keep `trackEvent` (add a `help_opened`-style call if useful) — no new event types unless trivial.
- Remove the help sheet ("Need a hand?" / Call the studio) since it's no longer reachable.

### 2. Arrow positioning
- Verify behavior: arrows are already saved with `x` / `y` as 0–1 fractions in `indicators` (jsonb) and rendered with `left: x*100%`, `top: y*100%`. This already works for checkpoints created with the indicator editor.
- The "centered arrow" only appears as a **legacy fallback** when a checkpoint has no `indicators` (old data using only `arrow_direction`). Keep that fallback but render it higher (e.g. `top: 38%`) so the bottom gradient doesn't cover it.
- No data-model change required. If the user is seeing arrows always centered on new checkpoints, that's a separate bug we'd need to repro — flagged but not changed here.

### 3. Remove bottom "tap sides to move" + add edge buttons
- Delete the "tap sides to move" row at the bottom.
- Keep the existing invisible left/right tap zones (good for thumb reach), but add **visible 48px circular buttons**:
  - Left button: `absolute left-4 top-1/2 -translate-y-1/2`, hidden when `step === 0`.
  - Right button: `absolute right-4 top-1/2 -translate-y-1/2`, always shown until last step (advances; on last checkpoint it advances to success).
  - Style: `bg-white/90`, `shadow-lg`, `ChevronLeft`/`ChevronRight` icons from lucide.
- Ensure buttons sit at `z-30` above the gradient.

### 4. Progress bar enhancement
- Replace the equal-width flex bars with fixed-width pills:
  - Active step: `w-12 h-1 rounded-full` filled with `accent`.
  - Completed: `w-8 h-1 bg-white`.
  - Upcoming: `w-8 h-1 bg-white/30`.
- Center the row (`justify-center gap-2`), keep safe-area top padding.

### 5. Gradient / arrow overlap
- Reduce bottom gradient height (e.g. `pt-10` instead of `pt-16`) so creator-placed arrows near the bottom of the photo aren't obscured. Indicators already render above; this just makes the gradient less aggressive.

## Files touched
- `src/pages/Viewer.tsx` only.

## Out of scope
- Wizard / creator side (Step 2 already saves arrow x/y/angle correctly).
- Any DB migration or schema change.
- Analytics event additions beyond what already exists.
