## Add Google Maps API key as build secret

The key needs to be added as a **build secret** (not a runtime secret) because it's prefixed with `VITE_` and gets baked into the frontend bundle at build time.

### Step 1 — You add the build secret (manual)
1. Open **Workspace Settings → Build Secrets**
2. Add a new secret:
   - Name: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: `AIzaSyAdCECOnMx58_QsCknysQfOaOrxpwP0xW8`
3. Save

I can't do this step for you — build secrets are workspace-level and must be entered by you.

### Step 2 — I verify it works
Once you confirm it's added, I'll:
- Trigger a rebuild so Vite picks up the new env var
- Open the wizard's Step 1 and confirm the interactive Google Map loads with a draggable pin (instead of the manual lat/lng fallback)
- Confirm the Static Maps preview renders on the end-user `/find/:slug` page

### Security note
This key will be visible in the frontend bundle (unavoidable for client-side Google Maps). Lock it down in the Google Cloud Console:
- **Application restriction:** HTTP referrers → add your Lovable preview domain (`*.lovable.app/*`) and any custom domain you'll publish to
- **API restriction:** limit to **Maps JavaScript API** and **Maps Static API** only

### No code changes needed
`src/lib/maps.ts` and `src/components/wizard/MapPinPicker.tsx` already read `VITE_GOOGLE_MAPS_API_KEY` and switch from the manual-coordinate fallback to the live map automatically once the key is present.
