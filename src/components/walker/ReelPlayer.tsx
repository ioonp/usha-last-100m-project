import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { trackEvent as trackPageEvent } from "@/lib/track";
import { trackEvent as trackUmami, EVENTS } from "@/lib/analytics";
import { walkerStrings } from "@/lib/strings";
import { WalkerHelpSheet } from "./WalkerHelpSheet";

// The reel player's view of a guide row — a structural subset of the Viewer's
// Loc, so the caller can pass its loc directly.
type ReelLocation = {
  id: string;
  studio_name: string;
  accent_color: string;
  video_url: string | null;
  manifest: unknown;
  video_version: string | null;
  start_lat: number | null;
  start_lng: number | null;
  start_note: string | null;
  start_address: string | null;
};

// Photo stills used only for the fallback list.
type ReelCheckpoint = { photo_url: string; note: string | null };

type ReelPlayerProps = {
  location: ReelLocation;
  checkpoints: ReelCheckpoint[];
};

type ManifestCheckpoint = { time: number; caption: string };
type VideoManifest = {
  checkpoints: ManifestCheckpoint[];
  arrival: { instruction: string } | null;
};

// Minimal shapes for the Screen Wake Lock API, which isn't in every lib.dom yet.
type WakeSentinel = { release: () => Promise<void> };
type WakeLockNavigator = Navigator & {
  wakeLock?: { request: (type: "screen") => Promise<WakeSentinel> };
};

// How long to wait for the video to become playable before falling back.
const LOAD_TIMEOUT_MS = 8000;
// How long the edge chevrons hold their stronger "teaching" opacity after start.
const TEACH_MS = 4000;
// A checkpoint within this many seconds of the opening frame is treated as an
// opening instruction to read while walking the first leg, not a stop to park
// on — otherwise a guide whose first checkpoint sits at t≈0 parks the instant
// it starts and looks like it never began.
const OPENING_CHECKPOINT_EPS = 0.25;
const ACCENT = "#c45a22";

/**
 * Defensive parse of the manually-populated jsonb manifest. Keeps only
 * checkpoints with a numeric time, coerces captions to strings, and sorts
 * ascending. Returns null when there is nothing usable to play.
 */
function parseManifest(raw: unknown): VideoManifest | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const rawCps = Array.isArray(obj.checkpoints) ? obj.checkpoints : [];
  const checkpoints: ManifestCheckpoint[] = rawCps
    .map((c) => {
      const cp = (c ?? {}) as Record<string, unknown>;
      return { time: Number(cp.time), caption: typeof cp.caption === "string" ? cp.caption : "" };
    })
    .filter((c) => Number.isFinite(c.time))
    .sort((a, b) => a.time - b.time);
  if (checkpoints.length === 0) return null;
  const arrivalObj = (obj.arrival ?? null) as Record<string, unknown> | null;
  const instruction =
    arrivalObj && typeof arrivalObj.instruction === "string" ? arrivalObj.instruction : null;
  return { checkpoints, arrival: instruction ? { instruction } : null };
}

export function ReelPlayer({ location, checkpoints }: ReelPlayerProps) {
  const manifest = useMemo(() => parseManifest(location.manifest), [location.manifest]);
  const cps = useMemo(() => manifest?.checkpoints ?? [], [manifest]);
  const hasVideo = Boolean(location.video_url) && cps.length > 0;
  const accent = location.accent_color || ACCENT;

  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const wakeRef = useRef<WakeSentinel | null>(null);
  // Index we're playing toward, read by the rAF loop; null when paused/parked.
  const headingRef = useRef<number | null>(null);
  const teachTimer = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(!hasVideo);
  // -1 = before the first checkpoint (start of the footage); 0..n-1 = parked.
  const [parked, setParked] = useState(-1);
  const [captionIdx, setCaptionIdx] = useState<number | null>(null);
  // Chevron affordance state. isPlaying (from the video's own play/pause events)
  // hides the chevrons mid-leg and shows them when paused at a checkpoint;
  // teachActive gives them a stronger opacity for the first few seconds.
  const [isPlaying, setIsPlaying] = useState(false);
  const [teachActive, setTeachActive] = useState(false);
  const [arrivalPrompt, setArrivalPrompt] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  const hasCoords = location.start_lat != null && location.start_lng != null;
  const addressLine =
    location.start_address ||
    (hasCoords
      ? `${location.start_lat!.toFixed(5)}, ${location.start_lng!.toFixed(5)}`
      : "Entrance location");

  // ---- wake lock -----------------------------------------------------------
  const requestWake = useCallback(async () => {
    try {
      const nav = navigator as WakeLockNavigator;
      wakeRef.current = (await nav.wakeLock?.request("screen")) ?? null;
    } catch {
      /* unsupported or denied — the walk still works, the screen may just sleep */
    }
  }, []);

  const releaseWake = useCallback(() => {
    wakeRef.current?.release().catch(() => {});
    wakeRef.current = null;
  }, []);

  // Release on unmount; re-acquire/release across tab visibility while walking.
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") releaseWake();
      else if (started && !completed) void requestWake();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      releaseWake();
    };
  }, [started, completed, requestWake, releaseWake]);

  // ---- native maps (mirrors Viewer's openMaps) -----------------------------
  const openMaps = useCallback(() => {
    if (location.start_lat == null || location.start_lng == null) return;
    const { start_lat: lat, start_lng: lng } = location;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    window.location.href = isIOS
      ? `maps://maps.apple.com/?q=${lat},${lng}`
      : `https://maps.google.com/?q=${lat},${lng}`;
  }, [location]);

  // ---- checkpoint analytics (parity with the photo path's step effect) -----
  // Fires whenever a valid checkpoint becomes the parked one — forward arrival
  // or back-seek alike — on both Umami and Supabase page_events. Reaching the
  // final checkpoint also raises arrival_reached and shows the arrival prompt.
  useEffect(() => {
    if (parked < 0 || parked >= cps.length) return;
    trackUmami(EVENTS.CHECKPOINT_VIEWED, { index: parked });
    trackPageEvent(location.id, "checkpoint_viewed", parked);
    if (parked === cps.length - 1) {
      trackUmami(EVENTS.ARRIVAL_REACHED);
      setArrivalPrompt(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parked]);

  // ---- the pause-on-checkpoint loop ----------------------------------------
  const arriveAt = useCallback(
    (i: number) => {
      const v = videoRef.current;
      if (!v) return;
      v.pause();
      // Snap to the exact timestamp so forward-arrival and back-seek land on the
      // same frame — the annotations are welded to specific frames.
      v.currentTime = cps[i].time;
      headingRef.current = null;
      setParked(i);
      setCaptionIdx(i);
    },
    [cps],
  );

  useEffect(() => {
    if (!started || failed) return;
    const tick = () => {
      const v = videoRef.current;
      const h = headingRef.current;
      if (v && h !== null && !v.paused && v.currentTime >= cps[h].time) {
        arriveAt(h);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [started, failed, cps, arriveAt]);

  // ---- controls ------------------------------------------------------------
  const playToward = useCallback((i: number) => {
    const v = videoRef.current;
    if (!v) return;
    headingRef.current = i;
    setArrivalPrompt(false);
    v.play().catch(() => {
      // Autoplay policy refused — hand the gesture back via the start overlay.
      headingRef.current = null;
      setStarted(false);
    });
  }, []);

  const start = useCallback(() => {
    setStarted(true);
    setTeachActive(true);
    if (teachTimer.current != null) window.clearTimeout(teachTimer.current);
    teachTimer.current = window.setTimeout(() => setTeachActive(false), TEACH_MS);
    trackUmami(EVENTS.WALK_STARTED);
    void requestWake();
    // Head to the first checkpoint that's actually ahead of the opening frame.
    // If the guide opens with a checkpoint welded to t≈0, that one is an
    // instruction for the first leg, not a stop: show its caption during the
    // walk and play on to the next real checkpoint, so it visibly starts.
    const target = cps.findIndex((c) => c.time > OPENING_CHECKPOINT_EPS);
    if (target > 0) setCaptionIdx(target - 1);
    playToward(target === -1 ? cps.length - 1 : target);
  }, [cps, playToward, requestWake]);

  // Right third: play the ramp forward to the next checkpoint.
  const goForward = useCallback(() => {
    if (parked >= cps.length - 1) return;
    playToward(parked + 1);
  }, [parked, cps.length, playToward]);

  // Left third: hard-seek instantly to the previous stop (no footage replay).
  // From the first checkpoint this steps to the very start of the footage.
  const goBack = useCallback(() => {
    const v = videoRef.current;
    if (!v || parked < 0) return;
    v.pause();
    headingRef.current = null;
    const prev = parked - 1;
    v.currentTime = prev < 0 ? 0 : cps[prev].time;
    setArrivalPrompt(false);
    setCaptionIdx(prev < 0 ? null : prev);
    setParked(prev);
    // Backing out of the first checkpoint returns to the start overlay (studio
    // name, address, tap-to-start) and re-arms start, rather than leaving a
    // bare, captionless first frame. Later checkpoints just step back one stop.
    if (prev < 0) setStarted(false);
  }, [parked, cps]);

  const openHelpFromCheckpoint = useCallback(() => {
    trackUmami(EVENTS.CHECKPOINT_MISMATCH, { index: Math.max(parked, 0) });
    setHelpOpen(true);
  }, [parked]);

  const confirmArrived = useCallback(() => {
    trackUmami(EVENTS.WALK_COMPLETED);
    trackPageEvent(location.id, "completed");
    setArrivalPrompt(false);
    setCompleted(true);
    releaseWake();
  }, [location.id, releaseWake]);

  const rejectArrival = useCallback(() => {
    trackUmami(EVENTS.ARRIVAL_NOT_YET);
    setHelpOpen(true);
  }, []);

  // "Start again" from the arrival screen — reset to the tap-to-start poster at
  // frame 0; the next tap replays from the beginning and re-arms the teach hint.
  const restart = useCallback(() => {
    const v = videoRef.current;
    headingRef.current = null;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setArrivalPrompt(false);
    setParked(-1);
    setCaptionIdx(null);
    setStarted(false);
  }, []);

  // ---- iOS first-frame poster + load-failure fallback ----------------------
  useEffect(() => {
    if (!hasVideo) return;
    const v = videoRef.current;
    if (!v) return;
    const onLoadedData = () => {
      if (v.currentTime === 0) v.currentTime = 0.01; // nudge a frame up as poster
    };
    const onError = () => setFailed(true);
    v.addEventListener("loadeddata", onLoadedData, { once: true });
    v.addEventListener("error", onError);
    const timer = window.setTimeout(() => {
      if (v.readyState < 2) setFailed(true); // never became playable in time
    }, LOAD_TIMEOUT_MS);
    return () => {
      v.removeEventListener("loadeddata", onLoadedData);
      v.removeEventListener("error", onError);
      window.clearTimeout(timer);
    };
  }, [hasVideo]);

  // Chevron visibility follows the video's real play/pause state (change 2).
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, []);

  // Clear the teach-window timer on unmount.
  useEffect(() => () => {
    if (teachTimer.current != null) window.clearTimeout(teachTimer.current);
  }, []);

  const helpSheet = helpOpen ? (
    <WalkerHelpSheet
      venueName={location.studio_name}
      addressLine={addressLine}
      lookFor={location.start_note}
      accent={accent}
      hasCoords={hasCoords}
      onOpenMaps={openMaps}
      onDismiss={() => setHelpOpen(false)}
    />
  ) : null;

  // ---- fallback: photo stills + captions as a text list --------------------
  if (failed) {
    return (
      <div className="relative min-h-[100dvh] w-full bg-background text-foreground no-tap-highlight">
        <div className="max-w-md mx-auto px-5 pt-8 pb-24">
          <h1 className="font-display text-3xl mb-1.5">{walkerStrings.video.fallbackTitle}</h1>
          <p className="text-muted-foreground text-sm mb-6">{walkerStrings.video.fallbackLead}</p>

          <ol className="space-y-5">
            {cps.map((c, i) => {
              const still = checkpoints[i]?.photo_url ?? null;
              return (
                <li key={i} className="rounded-2xl border border-border bg-card overflow-hidden shadow-soft">
                  {still && (
                    <img src={still} alt="" className="w-full aspect-[4/3] object-cover bg-muted" />
                  )}
                  <div className="p-4">
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: accent }}>
                      {walkerStrings.video.fallbackStep(i + 1)}
                    </div>
                    <div className="text-[15px] leading-snug">
                      {c.caption || checkpoints[i]?.note || ""}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          {manifest?.arrival?.instruction && (
            <p className="mt-6 text-[15px] font-medium">{manifest.arrival.instruction}</p>
          )}
        </div>

        {/* Escape hatch, always present. */}
        <div
          className="fixed inset-x-0 bottom-0 z-20 px-5 pt-8 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
          style={{ background: "linear-gradient(to top, hsl(var(--background)) 40%, transparent)" }}
        >
          <button
            type="button"
            onClick={openHelpFromCheckpoint}
            className="text-muted-foreground text-[13px] underline underline-offset-2 active:scale-95 transition-smooth"
          >
            {walkerStrings.doesntMatch}
          </button>
        </div>
        {helpSheet}
      </div>
    );
  }

  // ---- completed -----------------------------------------------------------
  if (completed) {
    return (
      <div
        className="relative h-[100dvh] w-full flex flex-col items-center justify-center p-6 text-center"
        style={{ backgroundColor: accent + "20" }}
      >
        <div className="animate-scale-in w-full max-w-sm">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="font-display text-4xl mb-2">{walkerStrings.video.completedTitle}</h1>
          <p className="text-muted-foreground mb-8">Welcome to {location.studio_name}.</p>
          <button
            type="button"
            onClick={() => setHelpOpen(true)}
            className="w-full rounded-full py-4 font-semibold text-white text-base shadow-elegant active:scale-[0.98] transition-smooth"
            style={{ backgroundColor: accent }}
          >
            {walkerStrings.successContact}
          </button>
        </div>
        {helpSheet}
      </div>
    );
  }

  // ---- reel player ---------------------------------------------------------
  const caption = captionIdx != null ? cps[captionIdx]?.caption : null;
  const arrivalInstruction = manifest?.arrival?.instruction ?? walkerStrings.video.arrivalFallback;
  const atLast = parked >= cps.length - 1;

  // Shown during the teach window or whenever paused at a checkpoint; hidden
  // mid-leg, and hidden entirely in the arrival state (nowhere to go forward,
  // and "Start again" covers going back). Stronger while teaching, near-
  // invisible at rest.
  const chevronsVisible = started && !arrivalPrompt && (teachActive || !isPlaying);
  const chevronOpacity = chevronsVisible ? (teachActive ? 0.6 : 0.3) : 0;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black no-tap-highlight select-none">
      {/* Player surface: touch-action none suppresses horizontal swipe-scrubbing;
          taps still fire. Portrait only, letterboxed against black. */}
      <div className="absolute inset-0" style={{ touchAction: "none" }}>
        <video
          ref={videoRef}
          key={location.video_version ?? location.video_url ?? "reel"}
          src={location.video_url ?? undefined}
          className="absolute inset-0 w-full h-full object-contain"
          playsInline
          muted
          preload="auto"
        />
      </div>

      {/* Edge tap-zones (invisible). Left third = back, right third = forward.
          z-20, below the interactive overlays which stopPropagation. */}
      <button
        type="button"
        aria-label="Back"
        onClick={goBack}
        className="absolute left-0 top-0 bottom-0 z-20"
        style={{ width: "33%" }}
      />
      <button
        type="button"
        aria-label="Forward"
        onClick={goForward}
        className="absolute right-0 top-0 bottom-0 z-20"
        style={{ width: "33%" }}
      />

      {/* Edge chevrons. A soft radial scrim (not a shape or button) darkens the
          footage under each arrow for legibility; stronger during the teach
          window, then near-invisible, and only shown when paused. Visibility
          only — the tap zones above stay active regardless. */}
      <div
        className="absolute inset-y-0 left-0 z-20 flex items-center pl-1 pointer-events-none transition-opacity duration-500"
        style={{ opacity: chevronOpacity }}
      >
        <span className="relative flex items-center justify-center size-16">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 68%)" }}
          />
          <ChevronLeft className="relative size-9 text-white drop-shadow" />
        </span>
      </div>
      <div
        className="absolute inset-y-0 right-0 z-20 flex items-center pr-1 pointer-events-none transition-opacity duration-500"
        style={{ opacity: chevronOpacity }}
      >
        <span className="relative flex items-center justify-center size-16">
          <span
            aria-hidden
            className="absolute inset-0"
            style={{ background: "radial-gradient(circle at center, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 68%)" }}
          />
          <ChevronRight className="relative size-9 text-white drop-shadow" />
        </span>
      </div>

      {/* Tap-to-start overlay (iOS inline-autoplay gesture). Studio name and
          address sit above the tap prompt as a hierarchy; the same 0.45 black
          scrim plus a text drop-shadow keeps them legible over the street photo. */}
      {!started && (
        <button
          type="button"
          onClick={start}
          className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-1.5 px-8 text-center text-white"
          style={{ background: "rgba(0,0,0,0.45)" }}
        >
          <span className="font-display text-3xl font-semibold leading-tight text-balance drop-shadow-lg">
            {location.studio_name}
          </span>
          {location.start_address && (
            <span className="text-sm font-normal leading-snug text-balance text-white/80 drop-shadow-md">
              {location.start_address}
            </span>
          )}
          <span
            className="mt-4 rounded-full px-[26px] py-[11px] text-base font-medium text-white backdrop-blur-sm"
            style={{
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
            }}
          >
            {walkerStrings.video.tapToStart}
          </span>
        </button>
      )}

      {/* Bottom band: caption stacked above the persistent escape hatch, both
          inside one gradient so they never share a line or overlap (change 3).
          The band is non-interactive except the help link, so taps on the
          caption area still fall through to the edge zones. */}
      {started && !arrivalPrompt && (
        <div
          className="absolute inset-x-0 bottom-0 z-30 px-5 pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))] flex flex-col items-start gap-3 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.45) 75%, rgba(0,0,0,0))" }}
        >
          {caption && (
            <div className="text-white text-[17px] font-medium leading-snug text-balance">{caption}</div>
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); openHelpFromCheckpoint(); }}
            className="pointer-events-auto text-white/70 text-[13px] underline underline-offset-2 active:scale-95 transition-smooth"
          >
            {walkerStrings.doesntMatch}
          </button>
        </div>
      )}

      {/* Arrival prompt at the final checkpoint. Buttons sit above the zones and
          stopPropagation so they never register as back/forward. */}
      {arrivalPrompt && atLast && (
        <div
          className="absolute inset-x-0 bottom-0 z-40 px-5 pt-12 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 40%, rgba(0,0,0,0.5) 80%, rgba(0,0,0,0))" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-white text-[18px] font-semibold leading-snug text-balance mb-4">
            {arrivalInstruction}
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); confirmArrived(); }}
              className="flex-1 rounded-full py-3.5 font-semibold text-white text-base active:scale-[0.98] transition-smooth"
              style={{ backgroundColor: accent }}
            >
              {walkerStrings.video.madeIt}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); rejectArrival(); }}
              className="flex-1 rounded-full py-3.5 font-medium text-base border border-white/40 text-white active:scale-[0.98] transition-smooth"
            >
              {walkerStrings.video.notYet}
            </button>
          </div>
          {/* Quiet restart — un-emphasized text link under the buttons; the
              arrival instruction stays the dominant element. */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); restart(); }}
            className="mt-4 mx-auto block text-white/45 text-[13px] underline underline-offset-2 active:scale-95 transition-smooth"
          >
            {walkerStrings.video.startAgain}
          </button>
        </div>
      )}

      {helpSheet}
    </div>
  );
}
