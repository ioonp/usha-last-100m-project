Plan:

1. Edit `src/components/wizard/CheckpointEditor.tsx` in the `ind.type === "spot"` rendering branch.
2. Remove the spot/point close button block only:
   - the `<button aria-label="Remove spot">...<X />...</button>` inside the point dot container.
3. Leave everything else unchanged:
   - point drag behavior
   - white dot styling and pulse
   - label input
   - arrow X button
   - arrow drag/rotate controls and animations

Technical detail:
- The X that appears on top of the point is not the arrow overlay button; it is the `Remove spot` button currently positioned with `absolute -top-1 -right-1` inside the spot marker container. Removing that block will make the X no longer render on the point at all.