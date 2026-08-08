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
