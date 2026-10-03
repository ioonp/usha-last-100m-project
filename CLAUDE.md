# CLAUDE.md

Records cross-cutting decisions for the Usha last-100m wayfinding app that
aren't obvious from the code.

## Video Guide — technical model

A walk-through MP4 that auto-pauses at checkpoint timestamps — a second guide
type alongside the photo-checkpoint flow.

### Aspect ratio

Portrait 9:16, locked. The player renders portrait only — no rotation or
landscape handling.

### Annotation text — two-layer hybrid

Supersedes the earlier rule that all annotation text is baked into the MP4.

- **Baked (CapCut, welded to specific frames):** speed ramps, the 3-second
  held frames, positioned highlights such as the street-number box sitting on
  the gate, and the daylight scrim.
- **DOM overlay (driven by the manifest):** the bottom caption line only. It
  sits in a fixed bottom zone with an optional black gradient behind it for
  legibility, added in post rather than in CapCut. Caption strings live in the
  manifest and route through the i18n constants like all other strings.

Why the split: positioned highlights must sit on a spot in the footage, so they
stay baked; the caption line stays editable in code without a CapCut re-export.

### Walker controls — reel-style edge tap-zones

Not a Back/Next button bar. The left third of the screen goes back, the right
third goes forward, with a near-invisible chevron at vertical centre that fades
after the first tap. The asymmetric behaviour is unchanged: forward plays the
speed ramp to the next checkpoint, back hard-seeks instantly to the previous
checkpoint. Only the surface moved to the edges — the control logic is the same.

### Open interaction constraints (unresolved)

- **Hit-testing:** the help link and the arrival buttons sit geometrically
  inside the edge tap-zones, so they must capture the tap and not register as
  back or forward.
- **Swipe vs tap:** the reel look invites swipe-scrubbing, which this format
  deliberately does not support — the video is for walking, not scrubbing. The
  likely resolution is tap-only with swipe suppressed; to be decided before
  player interaction is built.

## Two visual systems — Creator/landing vs. Walker

- **Creator surface and landing page** share one white-gallery system: the CSS
  variables in `src/index.css` `:root` and the Tailwind config, Geist /
  Geist Mono, near-black `#0A0A0A` primary, single ultramarine accent. Change the
  look of those screens through the tokens or the shared `Button`/`Input`
  primitives, not per-screen overrides. Landing-only styling is scoped with
  `usha-landing-*` classes in `landing.css` (imported by `Index.tsx`).
- **The Walker player at `/find/*`** (`Viewer.tsx`, `ReelPlayer.tsx`, and
  `WalkerHelpSheet.tsx`, which renders inside them) has its own look, defined by
  the `.usha-walker-scope` block at the end of `index.css`. Every top-level
  render root in those two files carries that class. It redefines the shared
  token variables (dark surfaces, white text, `#FFD400` accent), so the existing
  `bg-background`, `text-muted-foreground`, `text-accent` etc. classes resolve
  to the Walker palette inside it. Do not edit the shared tokens expecting the
  Walker to follow.
  - The block is deliberately **unlayered** (outside `@layer`): Tailwind's
    generated utilities are unlayered and would otherwise beat it.
  - The scope sets `color` to white. On a light surface inside it, a
    `text-[#0A0A0A]` class loses to that rule — set the colour inline, as the
    completion screen does.
  - The venue's `accent_color` no longer affects the Walker UI. The wizard's
    accent picker and the Creator preview still exist but are cosmetic there.
- **Walker screens:** the arrival sheet and completion screen are black-and-white
  (no yellow at all). The fallback list, "where did you get stuck?" screen, help
  sheet, and the photo-guide flow in `Viewer.tsx` still use the dark + `#FFD400`
  style. The completion screen's emoji tiles are native 👍/👎 on purpose; other
  Walker emoji were replaced with stroke icons.
- **Arrival instruction text** comes from each guide's manifest
  (`arrival.instruction`, stored data). `walkerStrings.video.arrivalFallback` is
  only used when a manifest has none, so changing that string doesn't change
  guides that carry their own wording.

## Landing page video-guide request modal

- There is **one** `RequestForm` instance, mounted by `VideoRequestProvider` in
  `Index.tsx`. Every "get a video guide" CTA (navbar, hero, options card, closing
  section) calls `openVideoRequest(e.currentTarget)` from `useVideoRequest()`;
  the clicked button is the focus-return target. No CTA uses `mailto:` any more
  (only the footer Contact link does).
- **Deep link:** `/?request=video` opens the modal on load, then the provider
  removes just that parameter with `history.replaceState` (other params and the
  hash stay), so refresh/back/close never reopen it. The Walker completion
  screen's "Create your own guide" points at `/?request=video&from=guide-end`
  (`walkerStrings.video.createOwnPath`); `from` is only a traffic tag. The
  parameter names are constants in `landing/links.ts`.

## Smaller Creator-side decisions

- `CreatorHeader` (pin + "usha" + Sign out) is used on Dashboard and Analytics
  only. Wizard, Capture and AnalyticsLocation keep their own functional headers
  (back link / step progress); don't replace those with it.
- `Button` variant `secondary` is the `#F0F0F1` pill. `outline` is kept for the
  dashed "Add checkpoint" buttons.
- `MapPinPicker` uses Google's default map style (the custom style constant was
  tried and removed). The `focus-visible` 2px `#111` outline on the map container
  stays.

## Working notes

- Dashboard, Wizard and Capture sit behind auth against the **remote** Supabase
  project. Don't create test accounts there to check UI; use code review or a
  public route.
- `/find/yoga-futura-kreuzberg` is a live video guide. Walking it (start,
  checkpoints, "I made it", feedback taps) fires real analytics events.
- In the desktop app's browser pane, a hidden pane stalls `requestAnimationFrame`
  and timers, so the video player's checkpoint loop stops advancing. Front the
  tab (`tabs_select`) before scripting a walk-through. Screenshots can also lag a
  frame behind an interaction; re-take one before assuming something failed.
