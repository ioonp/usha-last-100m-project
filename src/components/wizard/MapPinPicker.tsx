import { useEffect, useRef, useState } from "react";
import { GOOGLE_MAPS_KEY, loadGoogleMaps, staticMapUrl } from "@/lib/maps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function MapPinPicker({
  lat, lng, onChange,
}: {
  lat: number | null; lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = loadGoogleMaps();
    if (!p || !ref.current) return;
    p.then((g) => {
      const initLat = lat ?? 40.7128;
      const initLng = lng ?? -74.006;
      const map = new g.maps.Map(ref.current!, {
        center: { lat: initLat, lng: initLng },
        zoom: 16,
        disableDefaultUI: true,
        zoomControl: true,
      });
      const marker = new g.maps.Marker({
        position: { lat: initLat, lng: initLng },
        map, draggable: true,
      });
      marker.addListener("dragend", () => {
        const p = marker.getPosition();
        if (p) onChange(p.lat(), p.lng());
      });
      map.addListener("click", (e: any) => {
        marker.setPosition(e.latLng);
        onChange(e.latLng.lat(), e.latLng.lng());
      });
      setReady(true);
      if (lat == null) onChange(initLat, initLng);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground bg-accent-soft border border-accent/20 rounded-xl p-3">
          Add <code>VITE_GOOGLE_MAPS_API_KEY</code> in Workspace → Build Secrets to enable the interactive map. For now, enter coordinates manually.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Latitude</Label><Input type="number" step="any" value={lat ?? ""} onChange={(e) => onChange(parseFloat(e.target.value), lng ?? 0)} /></div>
          <div><Label>Longitude</Label><Input type="number" step="any" value={lng ?? ""} onChange={(e) => onChange(lat ?? 0, parseFloat(e.target.value))} /></div>
        </div>
        {lat != null && lng != null && (
          <img src={staticMapUrl(lat, lng)} alt="Map preview" className="w-full rounded-xl border border-border" />
        )}
      </div>
    );
  }

  return (
    <div>
      <div ref={ref} className="w-full h-[320px] rounded-2xl overflow-hidden border border-border bg-muted" />
      {!ready && <div className="text-xs text-muted-foreground mt-2">Loading map…</div>}
      {lat != null && lng != null && (
        <div className="text-xs text-muted-foreground mt-2 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</div>
      )}
    </div>
  );
}
