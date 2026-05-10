Make the "Direction" and "Spot" buttons under each photo act as toggles:

1. In `src/components/wizard/CheckpointEditor.tsx`, change `addIndicator(i, type)` into `toggleIndicator(i, type)`:
   - If an indicator of that type already exists in `c.indicators`, remove it (filter it out).
   - Otherwise, add it as today (default angle 45 for direction, empty label for spot).

2. Update both pill buttons in the JSX:
   - Remove the `disabled={!!dir}` / `disabled={hasSpot}` props so they remain clickable when active.
   - Keep the existing active styling (filled dark pill when present) so users see state.
   - Update `aria-pressed` / `title` to reflect "Add" vs "Remove".
   - Wire `onClick` to the new toggle function.

3. No other changes:
   - Arrow drag/rotate/animation, arrow X button, point dot, label input, and pulse all remain untouched.
   - Indicator data shape and persistence unchanged.

Result: tapping Spot once adds the dot, tapping it again removes it. Same for Direction. The on-canvas spot no longer needs its own X (already removed).