## Plan: Rotate Google Maps API key

Replace the hardcoded Google Maps API key in `src/lib/maps.ts` with the new restricted key.

### Change

**File:** `src/lib/maps.ts`

Replace the fallback value on line 5:
- Old: `"AIzaSyAdCECOnMx58_QsCknysQfOaOrxpwP0xW8"`
- New: `"AIzaSyCzL2hAnuqI6HdEU_blj9M5u-XjG0u6bzA"`

The code still reads `VITE_GOOGLE_MAPS_API_KEY` from env first, so this only updates the fallback used when no env var is set (which is the case on Pro plan).

### After this change

1. In Google Cloud Console, **delete or disable the old key** (`AIzaSyAdCECOnMx58...`) so it can no longer be abused.
2. Confirm the new key has the HTTP referrer restrictions we discussed (your preview URL + published URL once available) and API restrictions (Maps JavaScript API, Places API, Geocoding API, Static Maps API).
3. Test the map picker in the wizard to confirm it still loads.
