// NOTE: Browser Maps key — must ship to the client for Maps JS API to work.
// Lock this down in Google Cloud Console (HTTP referrer + API restrictions) before publishing.
export const GOOGLE_MAPS_KEY: string | undefined =
  (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined) ||
  "AIzaSyCzL2hAnuqI6HdEU_blj9M5u-XjG0u6bzA";

export function staticMapUrl(lat: number, lng: number, opts: { width?: number; height?: number; zoom?: number } = {}) {
  const { width = 600, height = 320, zoom = 16 } = opts;
  if (GOOGLE_MAPS_KEY) {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&scale=2&markers=color:0xb45309%7C${lat},${lng}&style=feature:poi%7Cvisibility:off&key=${GOOGLE_MAPS_KEY}`;
  }
  // OSM fallback (staticmap.openstreetmap.de can be flaky; use a tile-stitched fallback)
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lng}&zoom=${zoom}&size=${width}x${height}&markers=${lat},${lng},red-pushpin`;
}

let mapsPromise: Promise<any> | null = null;
export function loadGoogleMaps(): Promise<any> | null {
  if (!GOOGLE_MAPS_KEY) return null;
  if (mapsPromise) return mapsPromise;
  mapsPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps) return resolve((window as any).google);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_KEY}&libraries=places`;
    s.async = true;
    s.onload = () => resolve((window as any).google);
    s.onerror = reject;
    document.head.appendChild(s);
  });
  return mapsPromise;
}
