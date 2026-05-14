
## Goal

Turn the visitor experience (`src/pages/Viewer.tsx`) into an Instagram Reels-like flow: each checkpoint is a full-screen, edge-to-edge photo, and the user swipes vertically to move between steps. No timeline/progress bar. The note sits as an overlay pinned to the bottom of the screen.

## Changes

### 1. Full-screen reels container
- Replace the current "photo + bottom card" split with a single full-bleed `100dvh` photo per checkpoint.
- Stack slides vertically (welcome → checkpoint 1 … N → arrived) inside a snap-scroll container: `overflow-y-scroll snap-y snap-mandatory`, each slide `h-[100dvh] snap-start`.
- Keep image as `object-cover` with a soft top + bottom gradient for legibility.
- Direction arrows / spot indicators stay as today, rendered over the photo.

### 2. Remove the timeline
- Remove the "Step X of N" pill at the top.
- No progress dots either — pure reels feel.

### 3. Notes at the bottom
- For each checkpoint slide, render a bottom overlay (absolute, `bottom-0`, safe-area padding) containing:
  - The checkpoint `note` (larger, white text on subtle gradient/blur).
  - Primary "I'm here ✓" button (kept, still uses accent color).
  - Secondary "I can't find this" link (kept, opens existing help sheet).
- No card/sheet chrome — it floats over the photo like a Reels caption + CTA.

### 4. Welcome and arrived slides
- Welcome stays as the first snap slide (logo, name, message, optional map, Start button). Start now scrolls to the next slide instead of changing a `step` state.
- Arrived stays as the last snap slide (🎉 + "You made it!").

### 5. Navigation behavior
- Swipe (native scroll-snap) advances between slides.
- "I'm here ✓" programmatically scrolls to the next slide (`scrollIntoView({ behavior: "smooth" })`).
- Replace `step` state with refs per slide + an `IntersectionObserver` to know which checkpoint is active (used for view tracking and to pre-load the next image).
- Keep the existing `increment_location_view` call on initial load.

### 6. Out of scope
- No data model, schema, or wizard/preview changes.
- `MobilePreview.tsx` stays as is for now (can be aligned later if you want).
- No new dependencies.

## Technical notes

- File touched: `src/pages/Viewer.tsx` only.
- Container: `<div className="h-[100dvh] overflow-y-scroll snap-y snap-mandatory bg-black">`.
- Each slide: `<section className="relative h-[100dvh] snap-start snap-always">`.
- Bottom overlay: `absolute inset-x-0 bottom-0 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] bg-gradient-to-t from-black/70 via-black/40 to-transparent text-white`.
- Help sheet (`showHelp`) stays unchanged.
