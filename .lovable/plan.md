Mobile (<768px) layout pass. No functional/color/desktop changes.

### 1. Square media on Step 1
- `src/components/wizard/CheckpointEditor.tsx` `PhotoCanvas` outer div: change `aspect-[4/3]` → `aspect-square md:aspect-[4/3]`. Image already `object-cover`.
- Same change on the empty-state upload `<label>` (currently `aspect-[4/3]`) → `aspect-square md:aspect-[4/3]`.
- `src/components/wizard/MapPinPicker.tsx` map container: replace fixed `h-[320px]` with `aspect-square md:h-[320px] md:aspect-auto`. Static fallback `<img>` and dashboard logo unchanged.

### 2. Wizard shell — `src/pages/Wizard.tsx`
- Header step indicators: tighten on mobile so 4 dots fit at 360px. Change wrapper gap `gap-3` → `gap-1.5 sm:gap-3`, dot size `size-7` → `size-6 sm:size-7`, header padding `py-4` → `py-3 sm:py-4`, container `px-4`.
- Main grid: change `px-4 py-10` → `px-4 py-6 sm:py-10`, keep `lg:grid-cols-[1fr_320px]`, reduce `gap-12` → `gap-8 lg:gap-12`.
- H1: `text-4xl` → `text-2xl sm:text-4xl`. Eyebrow stays.
- Step nav row at the bottom: make Continue full-width on mobile, Back compact. Wrap in `flex flex-col-reverse sm:flex-row sm:justify-between gap-3 mt-8 sm:mt-10`; Continue button gets `w-full sm:w-auto`.

### 3. Step 4 (Publish) — `src/pages/Wizard.tsx`
- Container: `max-w-lg` stays; ensure `w-full` and centered on mobile via `mx-auto`.
- Publish CTA: add `w-full sm:w-auto` so the initial Publish button is full-width on mobile.
- Live URL pill: keep truncation but add `min-w-0` on the URL div so `truncate` actually works inside the flex row.
- QR card: already centered; add `w-full` and on mobile let QR scale: `w-48 h-48` → `w-40 h-40 sm:w-48 sm:h-48`.
- Bottom Preview/Done row: stack on mobile — `flex flex-col sm:flex-row gap-3`; each link `flex-1 w-full`. Buttons already `w-full`.

### 4. Step 2 (Branding)
- Wrapper `max-w-lg` keeps single column already. No structural change. Ensure color row wraps: add `flex-wrap` to the accent color flex container so the hex Input doesn't overflow on 320px.

### 5. CheckpointEditor controls
- Button row already wraps; bump readability: pill text stays `text-xs`. The "Replace photo" link uses `ml-auto` — on small screens with wrapping that's fine. No change.

### Out of scope
- No changes to indicator interactions, arrow rendering, business logic, or color tokens.
- Desktop layout (≥768/1024) preserved by keeping all current classes behind `sm:` / `md:` / `lg:` prefixes.