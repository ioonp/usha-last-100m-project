import { useEffect, useRef, useState } from "react";
import { GOOGLE_MAPS_KEY, loadGoogleMaps, staticMapUrl } from "@/lib/maps";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";

type Suggestion = { place_id: string; main: string; secondary: string };

export function MapPinPicker({
  lat, lng, address, onChange,
}: {
  lat: number | null; lng: number | null;
  address?: string | null;
  onChange: (lat: number, lng: number, address: string | null) => void;
}) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const googleRef = useRef<any>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const sessionTokenRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<boolean>(lat != null && lng != null);
  const [googleReady, setGoogleReady] = useState(false);

  // Load Google Maps SDK once
  useEffect(() => {
    const p = loadGoogleMaps();
    if (!p) return;
    p.then((g) => {
      googleRef.current = g;
      autocompleteServiceRef.current = new g.maps.places.AutocompleteService();
      sessionTokenRef.current = new g.maps.places.AutocompleteSessionToken();
      geocoderRef.current = new g.maps.Geocoder();
      setGoogleReady(true);
    });
  }, []);
  const reverseGeocode = (la: number, ln: number) => {
    const gc = geocoderRef.current;
    if (!gc) { onChange(la, ln, null); return; }
    gc.geocode({ location: { lat: la, lng: ln } }, (results: any[] | null, status: string) => {
      const formatted = status === "OK" && results?.[0]?.formatted_address ? results[0].formatted_address : null;
      onChange(la, ln, formatted);
    });
  };


  // Initialize map as soon as Google is ready. Default to Brandenburg Gate, Berlin
  // until the user picks a suggestion. Marker is only added after a selection.
  useEffect(() => {
    if (!googleReady || !mapDivRef.current || mapRef.current) return;
    const g = googleRef.current;
    const hasInitial = lat != null && lng != null;
    const initLat = hasInitial ? (lat as number) : 52.51627;
    const initLng = hasInitial ? (lng as number) : 13.37769;
    const map = new g.maps.Map(mapDivRef.current, {
      center: { lat: initLat, lng: initLng },
      zoom: hasInitial ? 17 : 15,
      disableDefaultUI: true,
      zoomControl: true,
    });
    mapRef.current = map;
    placesServiceRef.current = new g.maps.places.PlacesService(map);
    if (hasInitial) {
      const marker = new g.maps.Marker({
        position: { lat: initLat, lng: initLng },
        map, draggable: true,
      });
      marker.addListener("dragend", () => {
        const p = marker.getPosition();
        if (p) reverseGeocode(p.lat(), p.lng());
      });
      markerRef.current = marker;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleReady]);

  // Debounced autocomplete predictions
  useEffect(() => {
    if (!autocompleteServiceRef.current) return;
    const q = query.trim();
    if (q.length < 2) { setSuggestions([]); setOpen(false); return; }
    const t = setTimeout(() => {
      autocompleteServiceRef.current.getPlacePredictions(
        { input: q, sessionToken: sessionTokenRef.current },
        (preds: any[] | null) => {
          if (!preds) { setSuggestions([]); setOpen(false); return; }
          setSuggestions(preds.map((p) => ({
            place_id: p.place_id,
            main: p.structured_formatting?.main_text ?? p.description,
            secondary: p.structured_formatting?.secondary_text ?? "",
          })));
          setOpen(true);
        }
      );
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const handleSelect = (s: Suggestion) => {
    setOpen(false);
    setQuery(`${s.main}${s.secondary ? ", " + s.secondary : ""}`);
    const g = googleRef.current;
    // Need a PlacesService — create with a throwaway div if map not yet up
    const svc = placesServiceRef.current ?? new g.maps.places.PlacesService(document.createElement("div"));
    svc.getDetails(
      { placeId: s.place_id, fields: ["geometry", "formatted_address"], sessionToken: sessionTokenRef.current },
      (place: any, status: string) => {
        if (status !== g.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) return;
        const la = place.geometry.location.lat();
        const ln = place.geometry.location.lng();
        const formatted = place.formatted_address ?? null;
        // Refresh session token (billable session ends on details fetch)
        sessionTokenRef.current = new g.maps.places.AutocompleteSessionToken();
        onChange(la, ln, formatted);
        setSelected(true);
        // Update map: recenter and create/move marker
        if (mapRef.current) {
          mapRef.current.setCenter({ lat: la, lng: ln });
          mapRef.current.setZoom(17);
          if (!markerRef.current) {
            const marker = new g.maps.Marker({
              position: { lat: la, lng: ln },
              map: mapRef.current, draggable: true,
            });
            marker.addListener("dragend", () => {
              const p = marker.getPosition();
              if (p) reverseGeocode(p.lat(), p.lng());
            });
            markerRef.current = marker;
          } else {
            markerRef.current.setPosition({ lat: la, lng: ln });
          }
        }
      }
    );
  };

  if (!GOOGLE_MAPS_KEY) {
    return (
      <div className="space-y-3">
        <div className="text-xs text-muted-foreground bg-accent-soft border border-accent/20 rounded-xl p-3">
          Google Maps API key missing. Enter coordinates manually.
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Latitude</Label><Input type="number" step="any" value={lat ?? ""} onChange={(e) => onChange(parseFloat(e.target.value), lng ?? 0, address ?? null)} /></div>
          <div><Label>Longitude</Label><Input type="number" step="any" value={lng ?? ""} onChange={(e) => onChange(lat ?? 0, parseFloat(e.target.value), address ?? null)} /></div>
        </div>
        {lat != null && lng != null && (
          <img src={staticMapUrl(lat, lng)} alt="Map preview" className="w-full rounded-xl border border-border" />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length && setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search your venue, transit stop, or street corner"
          className="pl-9 h-12 rounded-xl text-sm truncate"
        />
        {open && suggestions.length > 0 && (
          <div className="absolute z-30 mt-1 w-full bg-popover border border-border rounded-xl shadow-lg overflow-hidden">
            {suggestions.map((s) => (
              <button
                key={s.place_id}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 hover:bg-accent/10 transition-smooth border-b border-border last:border-0"
              >
                <div className="text-sm text-foreground">{s.main}</div>
                {s.secondary && <div className="text-xs text-muted-foreground mt-0.5">{s.secondary}</div>}
              </button>
            ))}
          </div>
        )}
      </div>

      <div ref={mapDivRef} className="w-full aspect-square md:aspect-auto md:h-[320px] rounded-2xl overflow-hidden border border-border bg-muted" />
      {selected && lat != null && lng != null && (
        <div className="text-xs text-muted-foreground">
          {address ? address : <span className="font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</span>}
        </div>
      )}
    </div>
  );
}
