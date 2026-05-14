import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CurvedArrow } from "@/components/CurvedArrow";
import { normalizeIndicator, type Indicator as EditorIndicator, type LegacyDirection } from "@/components/wizard/CheckpointEditor";
import { staticMapUrl } from "@/lib/maps";
import { Phone, MapPin, X } from "lucide-react";

type Loc = {
  id: string; slug: string; studio_name: string; logo_url: string | null;
  accent_color: string; welcome_message: string; start_lat: number | null;
  start_lng: number | null; start_note: string | null;
};
type Indicator = EditorIndicator;
type CP = { id: string; position: number; photo_url: string; arrow_direction: LegacyDirection; note: string | null; indicators?: any[] };

const LEGACY_TO_ANGLE: Record<LegacyDirection, number> = {
  up: 0, "up-right": 45, right: 90, "down-right": 135,
  down: 180, "down-left": 225, left: 270, "up-left": 315,
};

export default function Viewer() {
  const { slug } = useParams();
  const [loc, setLoc] = useState<Loc | null>(null);
  const [cps, setCps] = useState<CP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);

  const scrollToSlide = (index: number) => {
    slideRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data: l } = await supabase.from("locations").select("*").eq("slug", slug).eq("published", true).eq("archived", false).maybeSingle();
      if (!l) { setLoading(false); return; }
      setLoc(l as Loc);
      const { data: c } = await supabase.from("checkpoints").select("*").eq("location_id", l.id).order("position");
      setCps((c as unknown as CP[]) || []);
      setLoading(false);
      // Pre-load images
      (c || []).forEach((cp: any) => { const im = new Image(); im.src = cp.photo_url; });
      // increment view
      supabase.rpc("increment_location_view", { p_slug: slug });
    })();
  }, [slug]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!loc) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-display text-3xl mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-4">This wayfinding page isn't available.</p>
      <Link to="/" className="text-accent underline">Back home</Link>
    </div>
  );

  const accent = loc.accent_color;
  const total = cps.length;

  // Slides: 0 = welcome, 1..total = checkpoints, total+1 = arrived
  const totalSlides = total + 2;

  return (
    <div
      className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory bg-black no-tap-highlight"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Welcome */}
      <section
        ref={(el) => (slideRefs.current[0] = el)}
        className="relative h-[100dvh] w-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center"
        style={{ backgroundColor: accent + "12" }}
      >
        <div className="max-w-sm w-full animate-fade-in-up">
          {loc.logo_url ? (
            <img src={loc.logo_url} alt={loc.studio_name} className="size-20 rounded-full object-cover mx-auto mb-5 shadow-soft" />
          ) : (
            <div className="size-20 rounded-full mx-auto mb-5" style={{ backgroundColor: accent }} />
          )}
          <h1 className="font-display text-4xl mb-3">{loc.studio_name}</h1>
          <p className="text-muted-foreground mb-8 text-balance">{loc.welcome_message}</p>

          {loc.start_lat != null && loc.start_lng != null && (
            <div className="rounded-2xl overflow-hidden border border-border mb-3 shadow-soft">
              <img src={staticMapUrl(loc.start_lat, loc.start_lng, { width: 600, height: 280 })} alt="Starting point" className="w-full" />
            </div>
          )}
          {loc.start_note && <p className="text-sm text-muted-foreground mb-6 italic">"{loc.start_note}"</p>}

          <button
            onClick={() => scrollToSlide(1)}
            disabled={total === 0}
            className="w-full rounded-full py-4 font-medium text-white text-lg shadow-elegant disabled:opacity-50 active:scale-95 transition-smooth"
            style={{ backgroundColor: accent }}
          >
            Start the walk →
          </button>
        </div>
      </section>

      {/* Checkpoints */}
      {cps.map((cp, i) => {
        const slideIndex = i + 1;
        return (
          <section
            key={cp.id}
            ref={(el) => (slideRefs.current[slideIndex] = el)}
            className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black"
          >
            <img src={cp.photo_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70 pointer-events-none" />

            {cp.indicators && cp.indicators.length > 0 ? (
              cp.indicators.map(normalizeIndicator).map((ind) => (
                <div
                  key={ind.id}
                  className="absolute pointer-events-none"
                  style={{ left: `${ind.x * 100}%`, top: `${ind.y * 100}%`, transform: "translate(-50%, -50%)" }}
                >
                  {ind.type === "direction" ? (
                    <CurvedArrow angle={ind.angle} size={Math.min(160, window.innerWidth * 0.4)} color="white" />
                  ) : (
                    <div className="flex flex-col items-center" style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}>
                      <div className="relative">
                        <span className="block absolute inset-0 rounded-full bg-white animate-spot-pulse" aria-hidden />
                        <span className="relative block size-6 rounded-full bg-white border-2 border-foreground" />
                      </div>
                      {ind.label && (
                        <span className="mt-1.5 px-2 py-0.5 text-xs font-medium text-foreground bg-white/95 rounded-md">
                          {ind.label}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <CurvedArrow angle={LEGACY_TO_ANGLE[cp.arrow_direction] ?? 0} size={Math.min(240, window.innerWidth * 0.55)} color="white" />
              </div>
            )}

            {/* Bottom overlay: note + actions */}
            <div
              className="absolute inset-x-0 bottom-0 px-5 pt-10 bg-gradient-to-t from-black/80 via-black/50 to-transparent text-white"
              style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
            >
              {cp.note && (
                <p className="text-base mb-4 text-balance leading-snug drop-shadow-md">{cp.note}</p>
              )}
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => scrollToSlide(slideIndex + 1)}
                  className="rounded-full py-4 text-base font-semibold text-white shadow-elegant active:scale-[0.98] transition-smooth"
                  style={{ backgroundColor: accent }}
                >
                  I'm here ✓
                </button>
                <button
                  onClick={() => setShowHelp(true)}
                  className="rounded-full py-2.5 text-sm text-white/90 border border-white/30 backdrop-blur-sm active:bg-white/10 transition-smooth"
                >
                  I can't find this
                </button>
              </div>
            </div>
          </section>
        );
      })}

      {/* Arrived */}
      <section
        ref={(el) => (slideRefs.current[totalSlides - 1] = el)}
        className="relative h-[100dvh] w-full snap-start snap-always flex flex-col items-center justify-center p-6 text-center"
        style={{ backgroundColor: accent + "20" }}
      >
        <div className="animate-scale-in">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-display text-4xl mb-2">You made it!</h1>
          <p className="text-muted-foreground mb-8">Welcome to {loc.studio_name}.</p>
          <button onClick={() => scrollToSlide(0)} className="text-sm text-muted-foreground underline">
            Start over
          </button>
        </div>
      </section>

      {/* Help sheet */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 z-30 flex items-end animate-fade-in" onClick={() => setShowHelp(false)}>
          <div className="bg-card w-full rounded-t-3xl p-6 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl">Need a hand?</h2>
              <button onClick={() => setShowHelp(false)} className="size-8 rounded-full bg-muted flex items-center justify-center"><X className="size-4" /></button>
            </div>
            <p className="text-muted-foreground text-sm mb-4">Reach out to {loc.studio_name} directly:</p>
            <div className="space-y-2">
              {loc.start_lat != null && loc.start_lng != null && (
                <a href={`https://maps.google.com/?q=${loc.start_lat},${loc.start_lng}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-4 rounded-2xl border border-border active:bg-muted transition-smooth">
                  <MapPin className="size-5" style={{ color: accent }} />
                  <div className="text-sm font-medium">Open in maps</div>
                </a>
              )}
              <a href="tel:" className="flex items-center gap-3 p-4 rounded-2xl border border-border active:bg-muted transition-smooth">
                <Phone className="size-5" style={{ color: accent }} />
                <div className="text-sm font-medium">Call the studio</div>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
