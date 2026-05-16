import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CurvedArrow } from "@/components/CurvedArrow";
import { normalizeIndicator, type Indicator as EditorIndicator, type LegacyDirection } from "@/components/wizard/CheckpointEditor";
import { staticMapUrl } from "@/lib/maps";
import { Phone, MapPin, X, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, ArrowUpLeft, ArrowUpRight, ArrowDownLeft, ArrowDownRight, ChevronLeft } from "lucide-react";
import { trackEvent } from "@/lib/track";

type Loc = {
  id: string; slug: string; studio_name: string; logo_url: string | null;
  accent_color: string; welcome_message: string; start_lat: number | null;
  start_lng: number | null; start_note: string | null; start_address: string | null;
};
type Indicator = EditorIndicator;
type CP = { id: string; position: number; photo_url: string; arrow_direction: LegacyDirection; note: string | null; indicators?: any[] };

const LEGACY_TO_ANGLE: Record<LegacyDirection, number> = {
  up: 0, "up-right": 45, right: 90, "down-right": 135,
  down: 180, "down-left": 225, left: 270, "up-left": 315,
};

const DIR_ICON: Record<LegacyDirection, React.ComponentType<{ className?: string }>> = {
  up: ArrowUp, "up-right": ArrowUpRight, right: ArrowRight, "down-right": ArrowDownRight,
  down: ArrowDown, "down-left": ArrowDownLeft, left: ArrowLeft, "up-left": ArrowUpLeft,
};

const ACCENT = "#c45a22";

export default function Viewer() {
  const { slug } = useParams();
  const [loc, setLoc] = useState<Loc | null>(null);
  const [cps, setCps] = useState<CP[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  // -1 = landing, 0..total-1 = checkpoint, total = success
  const [step, setStep] = useState(-1);
  const [showArrival, setShowArrival] = useState(false);

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
      trackEvent((l as Loc).id, "page_opened");
    })();
  }, [slug]);

  // Track checkpoint views and completion as `step` changes.
  useEffect(() => {
    if (!loc) return;
    if (step >= 0 && step < cps.length) {
      trackEvent(loc.id, "checkpoint_viewed", step);
    } else if (cps.length > 0 && step >= cps.length) {
      trackEvent(loc.id, "completed");
    }
  }, [step, loc, cps.length]);

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center text-muted-foreground">Loading…</div>;
  if (!loc) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h1 className="font-display text-3xl mb-2">Page not found</h1>
      <p className="text-muted-foreground mb-4">This wayfinding page isn't available.</p>
      <Link to="/" className="text-accent underline">Back home</Link>
    </div>
  );

  const accent = loc.accent_color || ACCENT;
  const total = cps.length;
  const cp = step >= 0 && step < total ? cps[step] : null;

  const goNext = () => {
    if (step < total) setStep(step + 1);
  };
  const goPrev = () => {
    if (step > 0) setStep(step - 1);
  };

  // ---------- LANDING ----------
  if (step === -1) {
    if (showArrival) {
      const addressLine =
        loc.start_address ||
        (loc.start_lat != null && loc.start_lng != null
          ? `${loc.start_lat.toFixed(5)}, ${loc.start_lng.toFixed(5)}`
          : "Entrance location");
      const firstCp = cps[0] ?? null;
      const arrivalPhoto = firstCp?.photo_url ?? null;
      const arrivalCaption = firstCp?.note || loc.start_note || null;
      return (
        <div className="relative min-h-[100dvh] w-full bg-background flex flex-col no-tap-highlight">
          {/* Top bar */}
          <div
            className="flex items-center px-4 pb-2"
            style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
          >
            <button
              onClick={() => setShowArrival(false)}
              aria-label="Back"
              className="size-10 -ml-2 rounded-full flex items-center justify-center active:bg-muted transition-smooth"
            >
              <ChevronLeft className="size-6" />
            </button>
          </div>

          <div className="flex-1 px-5 pb-6 max-w-md w-full mx-auto animate-fade-in-up">
            <div className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: accent }}>
              Step 1 — Confirm you've arrived
            </div>
            <h1 className="font-display text-3xl leading-tight mb-5 text-balance">
              Do you see this on the street?
            </h1>

            {/* Address card */}
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-border bg-card mb-4 shadow-soft">
              <div
                className="size-9 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: accent + "20" }}
              >
                <MapPin className="size-4" style={{ color: accent }} />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">
                  Entrance address
                </div>
                <div className="text-sm font-medium break-words">{addressLine}</div>
              </div>
            </div>

            {/* Street arrival reference photo (first checkpoint) */}
            {arrivalPhoto ? (
              <div className="relative rounded-2xl overflow-hidden border border-border mb-6 shadow-soft aspect-[4/3] bg-muted">
                <img
                  src={arrivalPhoto}
                  alt="Street arrival reference"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {arrivalCaption && (
                  <div
                    className="absolute inset-x-0 bottom-0 px-4 py-3 text-white text-[13px] leading-snug"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 20%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0))",
                    }}
                  >
                    <div className="text-[10px] font-semibold uppercase tracking-wider opacity-80 mb-0.5">
                      Look for
                    </div>
                    {arrivalCaption}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border mb-6 p-6 text-center text-sm text-muted-foreground bg-muted/30">
                No street arrival photo yet.
              </div>
            )}

            <div className="text-center text-base font-medium mb-4">
              Are you standing in front of this building?
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowArrival(false);
                  setStep(0);
                  if (loc) trackEvent(loc.id, "arrival_confirmed");
                }}
                disabled={total === 0}
                className="w-full rounded-full py-4 font-semibold text-white text-base shadow-elegant disabled:opacity-50 active:scale-[0.98] transition-smooth"
                style={{ backgroundColor: accent }}
              >
                Yes, I'm here
              </button>
              <button
                onClick={() => setShowArrival(false)}
                className="w-full rounded-full py-4 font-medium text-base border-2 active:scale-[0.98] transition-smooth"
                style={{ borderColor: accent, color: accent }}
              >
                Not yet
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div
        className="relative h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center bg-background no-tap-highlight"
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
            onClick={() => setShowArrival(true)}
            disabled={total === 0}
            className="w-full rounded-full py-4 font-medium text-white text-lg shadow-elegant disabled:opacity-50 active:scale-95 transition-smooth"
            style={{ backgroundColor: accent }}
          >
            Start the walk →
          </button>
        </div>
      </div>
    );
  }

  // ---------- SUCCESS ----------
  if (step >= total) {
    return (
      <div
        className="relative h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center"
        style={{ backgroundColor: accent + "20" }}
      >
        <div className="animate-scale-in">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-display text-4xl mb-2">You made it!</h1>
          <p className="text-muted-foreground mb-8">Welcome to {loc.studio_name}.</p>
          <button onClick={() => setStep(-1)} className="text-sm text-muted-foreground underline">
            Start over
          </button>
        </div>
      </div>
    );
  }

  // ---------- REEL CHECKPOINT ----------
  const rawIndicators = (cp!.indicators ?? []) as any[];
  const indicators: Indicator[] = rawIndicators.map(normalizeIndicator);
  const hasIndicators = indicators.length > 0;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black no-tap-highlight select-none">
      {/* Photo */}
      <img src={cp!.photo_url} alt="" className="absolute inset-0 w-full h-full object-cover" />

      {/* Indicators (arrows + spots) overlaid on the photo */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {hasIndicators ? (
          indicators.map((ind) => (
            <div
              key={ind.id}
              className="absolute"
              style={{
                left: `${ind.x * 100}%`,
                top: `${ind.y * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {ind.type === "direction" ? (
                <CurvedArrow angle={ind.angle} size={140} color="white" />
              ) : (
                <div
                  className="flex flex-col items-center"
                  style={{ filter: "drop-shadow(0 2px 8px rgba(0,0,0,0.55))" }}
                >
                  <div className="relative">
                    <span
                      className="block absolute inset-0 rounded-full animate-spot-pulse"
                      style={{ backgroundColor: accent }}
                      aria-hidden
                    />
                    <span
                      className="relative block size-5 rounded-full border-2"
                      style={{ backgroundColor: accent, borderColor: "#FFFDF8" }}
                    />
                  </div>
                  {ind.label && (
                    <span className="mt-1.5 px-2 py-0.5 text-[11px] font-medium text-foreground bg-white/95 rounded-md">
                      {ind.label}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <CurvedArrow
              angle={LEGACY_TO_ANGLE[cp!.arrow_direction] ?? 0}
              size={160}
              color="white"
            />
          </div>
        )}
      </div>

      {/* Top progress dots */}
      <div
        className="absolute inset-x-0 top-0 z-20 flex gap-1.5 px-4 pb-2"
        style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
      >
        {cps.map((_, i) => {
          const state = i < step ? "done" : i === step ? "current" : "future";
          const bg =
            state === "current" ? accent : state === "done" ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.25)";
          return (
            <span
              key={i}
              className="flex-1 h-1 rounded-full transition-colors"
              style={{ backgroundColor: bg }}
            />
          );
        })}
      </div>

      {/* Tap zones */}
      <button
        type="button"
        aria-label="Previous"
        onClick={goPrev}
        disabled={step === 0}
        className="absolute left-0 top-12 bottom-36 z-20 disabled:opacity-40"
        style={{ width: "45%" }}
      />
      <button
        type="button"
        aria-label="Next"
        onClick={goNext}
        className="absolute right-0 top-12 bottom-36 z-20"
        style={{ width: "45%" }}
      />

      {/* Bottom info panel */}
      <div
        className="absolute inset-x-0 bottom-0 z-20 px-5 pt-16"
        style={{
          paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
          background: "linear-gradient(to top, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.6) 70%, rgba(0,0,0,0))",
        }}
      >
        <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: accent }}>
          Step {step + 1} of {total}
        </div>
        <div className="text-white text-[17px] font-medium leading-snug mb-1.5 text-balance">
          {cp!.note || "Keep going"}
        </div>
        {/* Optional secondary note line could go here if data model expands */}
        <button
          onClick={() => setShowHelp(true)}
          className="text-[12px] text-white/60 underline underline-offset-2 mb-3"
        >
          I can't find this
        </button>

        <div className="flex items-center justify-center gap-2 text-white/50 text-[12px] py-2">
          <ArrowLeft className="size-3.5" />
          <span>tap sides to move</span>
          <ArrowRight className="size-3.5" />
        </div>
      </div>

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
