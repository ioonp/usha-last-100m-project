import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Heart } from "lucide-react";
import { trackEvent as trackPageEvent } from "@/lib/track";
import { trackEvent as trackUmami, EVENTS } from "@/lib/analytics";
import { walkerStrings } from "@/lib/strings";
import { WalkerHelpSheet } from "./WalkerHelpSheet";

// The reel player's view of a guide row — a structural subset of the Viewer's
// Loc, so the caller can pass its loc directly.
type ReelLocation = {
  id: string;
  slug: string;
  studio_name: string;
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
// A checkpoint within this many seconds of the opening frame is treated as an
// opening instruction to read while walking the first leg, not a stop to park
// on — otherwise a guide whose first checkpoint sits at t≈0 parks the instant
// it starts and looks like it never began.
const OPENING_CHECKPOINT_EPS = 0.25;

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

  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const wakeRef = useRef<WakeSentinel | null>(null);
  // Index we're playing toward, read by the rAF loop; null when paused/parked.
  const headingRef = useRef<number | null>(null);

  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(!hasVideo);
  // -1 = before the first checkpoint (start of the footage); 0..n-1 = parked.
  const [parked, setParked] = useState(-1);
  // Video position in seconds, sampled by the rAF loop to fill the progress bar.
  const [elapsed, setElapsed] = useState(0);
  const [captionIdx, setCaptionIdx] = useState<number | null>(null);
  // Chevron affordance state. isPlaying (from the video's own play/pause events)
  // hides the chevrons while a leg is playing and shows them when paused at a
  // checkpoint — the same on every leg, the first included.
  const [isPlaying, setIsPlaying] = useState(false);
  const [arrivalPrompt, setArrivalPrompt] = useState(false);
  const [completed, setCompleted] = useState(false);
  // Success-screen feedback: null until a tile is tapped, then the choice is highlighted.
  const [feedbackChoice, setFeedbackChoice] = useState<"positive" | "negative" | null>(null);
  // Stuck screen (reached from "Not yet"): stuckDone flips to the Thanks state.
  const [stuck, setStuck] = useState(false);
  const [stuckDone, setStuckDone] = useState(false);
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
      else if (started && !completed && !stuck) void requestWake();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      releaseWake();
    };
  }, [started, completed, stuck, requestWake, releaseWake]);

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
    trackUmami(EVENTS.VIDEO_CHECKPOINT_VIEWED, { slug: location.slug, index: parked });
    trackPageEvent(location.id, "checkpoint_viewed", parked);
    if (parked === cps.length - 1) {
      trackUmami(EVENTS.VIDEO_ARRIVAL_REACHED, { slug: location.slug });
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
      if (v) setElapsed(v.currentTime); // no-op re-render while paused (same value)
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
    trackUmami(EVENTS.VIDEO_STARTED, { slug: location.slug });
    void requestWake();
    // Head to the first checkpoint that's actually ahead of the opening frame.
    // If the guide opens with a checkpoint welded to t≈0, that one is an
    // instruction for the first leg, not a stop: show its caption during the
    // walk and play on to the next real checkpoint, so it visibly starts.
    const target = cps.findIndex((c) => c.time > OPENING_CHECKPOINT_EPS);
    if (target > 0) setCaptionIdx(target - 1);
    playToward(target === -1 ? cps.length - 1 : target);
  }, [cps, playToward, requestWake, location.slug]);

  // Right third: play the ramp forward to the next checkpoint.
  const goForward = useCallback(() => {
    if (parked >= cps.length - 1) return;
    playToward(parked + 1);
  }, [parked, cps.length, playToward]);

  // Left third: hard-seek to the previous stop (no footage replay). Active on
  // every leg the moment the walk has started — including the first leg, where
  // parked is still -1 while playing toward the first checkpoint.
  const goBack = useCallback(() => {
    const v = videoRef.current;
    if (!v || !started) return;
    v.pause();
    headingRef.current = null;
    setArrivalPrompt(false);
    const prev = parked - 1;
    if (prev < 0) {
      // Backing out of the first leg — whether mid-play before the first
      // checkpoint (parked = -1) or parked on it (parked = 0) — returns to the
      // start overlay (studio name, address, tap-to-start) and re-arms start,
      // rather than leaving a bare, captionless first frame.
      v.currentTime = 0;
      setCaptionIdx(null);
      setParked(-1);
      setStarted(false);
    } else {
      // Later checkpoints step back one stop.
      v.currentTime = cps[prev].time;
      setCaptionIdx(prev);
      setParked(prev);
    }
  }, [started, parked, cps]);

  const openHelpFromCheckpoint = useCallback(() => {
    trackUmami(EVENTS.VIDEO_CHECKPOINT_MISMATCH, { slug: location.slug, index: Math.max(parked, 0) });
    trackUmami(EVENTS.VIDEO_HELP_CLICKED, { slug: location.slug });
    setHelpOpen(true);
  }, [parked, location.slug]);

  const confirmArrived = useCallback(() => {
    trackUmami(EVENTS.VIDEO_COMPLETED, { slug: location.slug });
    trackPageEvent(location.id, "completed");
    setArrivalPrompt(false);
    setCompleted(true);
    releaseWake();
  }, [location.id, location.slug, releaseWake]);

  // "Not yet" — open the tap-only "where did you get stuck?" screen. No email or
  // studio contact details; the signal comes to us via the guide_stuck event.
  const rejectArrival = useCallback(() => {
    // The meaningful stuck signal is video_stuck, fired when they pick a reason.
    setArrivalPrompt(false);
    setStuck(true);
    releaseWake();
  }, [releaseWake]);

  // One-tap success feedback (thumbs up/down) on the completed screen.
  const sendFeedback = useCallback((value: "positive" | "negative") => {
    trackUmami(EVENTS.VIDEO_FEEDBACK, { slug: location.slug, value });
    setFeedbackChoice(value);
  }, [location.slug]);

  // One-tap "where did you get stuck?" pick. checkpoint is the manifest index,
  // or -1 for the "Somewhere else" catch-all.
  const sendStuck = useCallback((checkpoint: number, label: string) => {
    trackUmami(EVENTS.VIDEO_STUCK, { slug: location.slug, checkpoint, label });
    setStuckDone(true);
  }, [location.slug]);

  // "Start again" from the arrival screen — reset to the tap-to-start poster at
  // frame 0; the next tap replays the walk from the beginning.
  const restart = useCallback(() => {
    trackUmami(EVENTS.VIDEO_RESTARTED, { slug: location.slug });
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
    // Clear the arrival/success/stuck surfaces so it returns to the start overlay.
    setCompleted(false);
    setFeedbackChoice(null);
    setStuck(false);
    setStuckDone(false);
  }, [location.slug]);

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

  const helpSheet = helpOpen ? (
    <WalkerHelpSheet
      venueName={location.studio_name}
      addressLine={addressLine}
      lookFor={location.start_note}
      hasCoords={hasCoords}
      onOpenMaps={openMaps}
      onDismiss={() => setHelpOpen(false)}
    />
  ) : null;

  // ---- fallback: photo stills + captions as a text list --------------------
  if (failed) {
    return (
      <div className="usha-walker-scope relative min-h-[100dvh] w-full bg-background text-foreground no-tap-highlight">
        <div className="max-w-md mx-auto px-5 pt-8 pb-24">
          <h1 className="font-display font-semibold text-3xl mb-1.5">{walkerStrings.video.fallbackTitle}</h1>
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
                    <div className="text-[11px] font-semibold uppercase tracking-wider mb-1 text-accent">
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
    const tileBase =
      "flex size-16 items-center justify-center rounded-[18px] border-2 bg-white text-[30px] leading-none transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]";
    const tileState = (v: "positive" | "negative") =>
      feedbackChoice === null
        ? "border-transparent"
        : feedbackChoice === v
          ? "border-[#0A0A0A]"
          : "border-transparent opacity-40";
    return (
      <div
        className="usha-walker-scope relative h-[100dvh] w-full bg-white flex flex-col items-center justify-center px-5 text-center"
        // Inline so it beats the scope's own white text colour.
        style={{ color: "#0A0A0A" }}
      >
        <div className="animate-scale-in w-full max-w-sm">
          <span className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-[#0A0A0A]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </span>
          <h1 className="font-semibold text-[40px] leading-none tracking-[-0.045em] mb-3">{walkerStrings.video.completedTitle}</h1>
          <p className="text-[17px] text-[#5C5C60] mb-8">Welcome to {location.studio_name}.</p>

          {/* One-tap "was this easy to follow?" — a single tap fires
              guide_feedback; the chosen tile gets a 2px border and the other
              fades. */}
          <div className="rounded-[24px] bg-[#F4F4F5] p-6 mb-6">
            <p className="text-base font-medium mb-4">{walkerStrings.video.feedbackQuestion}</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                aria-label={walkerStrings.video.feedbackYes}
                disabled={feedbackChoice !== null}
                onClick={() => sendFeedback("positive")}
                className={`${tileBase} ${tileState("positive")}`}
              >
                <span aria-hidden="true">👍</span>
              </button>
              <button
                type="button"
                aria-label={walkerStrings.video.feedbackNo}
                disabled={feedbackChoice !== null}
                onClick={() => sendFeedback("negative")}
                className={`${tileBase} ${tileState("negative")}`}
              >
                <span aria-hidden="true">👎</span>
              </button>
            </div>
            {feedbackChoice !== null && (
              <p className="mt-4 text-[15px] font-semibold">{walkerStrings.video.feedbackThanks}</p>
            )}
          </div>

          {/* Secondary link to the Usha landing page. */}
          <a
            href={walkerStrings.video.createOwnPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 rounded-full bg-[#F0F0F1] px-6 text-base font-semibold text-[#0A0A0A] active:scale-95 transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
          >
            {walkerStrings.video.createOwnCta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>

        {/* Quiet signature footer, pinned to the bottom. */}
        <p className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1.5 text-center text-xs text-[#6B6B70] pb-[max(1rem,env(safe-area-inset-bottom))]">
          {walkerStrings.video.madeInBerlin}
          <Heart className="size-3.5 text-[#0A0A0A]" fill="currentColor" aria-hidden="true" />
        </p>
      </div>
    );
  }

  // ---- still lost: tap-only "where did you get stuck?" ---------------------
  if (stuck) {
    return (
      <div className="usha-walker-scope relative h-[100dvh] w-full bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="animate-scale-in w-full max-w-sm">
          {!stuckDone ? (
            <>
              <h1 className="font-display font-semibold text-[26px] leading-tight mb-5">
                {walkerStrings.video.stuckQuestion}
              </h1>
              {/* One tappable option per checkpoint of THIS guide (manifest
                  captions), plus a catch-all. A single tap fires guide_stuck. */}
              <div className="flex flex-col gap-2 text-left">
                {cps.map((c, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendStuck(i, c.caption)}
                    className="w-full rounded-2xl border border-[#2E2E32] bg-[#1F1F22] px-4 py-3 text-[15px] leading-snug text-white active:scale-[0.98] transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  >
                    {c.caption}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => sendStuck(-1, walkerStrings.video.stuckElsewhere)}
                  className="w-full rounded-2xl border border-[#2E2E32] bg-[#1F1F22] px-4 py-3 text-[15px] font-medium leading-snug text-white active:scale-[0.98] transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  {walkerStrings.video.stuckElsewhere}
                </button>
              </div>
            </>
          ) : (
            <>
              <span className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full bg-[#FFD400] text-[#0A0A0A]">
                <Heart className="size-8" strokeWidth={2.5} aria-hidden="true" />
              </span>
              <p className="mb-8 text-[15px] font-semibold text-accent">
                {walkerStrings.video.stuckThanks}
              </p>
              {/* Gentle next step — replay the guide. No email, no contact. */}
              <button
                type="button"
                onClick={restart}
                className="h-14 w-full rounded-full bg-[#FFD400] font-semibold text-[#0A0A0A] text-base active:scale-[0.98] transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {walkerStrings.video.startAgain}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ---- reel player ---------------------------------------------------------
  const caption = captionIdx != null ? cps[captionIdx]?.caption : null;
  const arrivalInstruction = manifest?.arrival?.instruction ?? walkerStrings.video.arrivalFallback;
  const atLast = parked >= cps.length - 1;

  // Shown whenever paused at a checkpoint (every leg, the first included);
  // hidden while a leg is playing, and hidden entirely in the arrival state
  // (nowhere to go forward, and "Start again" covers going back).
  const chevronsVisible = started && !arrivalPrompt && !isPlaying;
  const chevronOpacity = chevronsVisible ? 0.3 : 0;

  return (
    // Stage: full viewport with a calm near-black surround. On phones the frame
    // below fills it edge-to-edge (mobile is unchanged); on wider viewports the
    // frame becomes a centered 9:16 panel and this shows as the letterbox.
    <div
      className="usha-walker-scope relative h-[100dvh] w-full overflow-hidden flex items-center justify-center bg-black no-tap-highlight select-none"
      style={{ background: "radial-gradient(120% 120% at 50% 50%, #0b0b0d 0%, #000000 72%)" }}
    >
      {/* Portrait 9:16 player frame. Full-bleed on phones (h-full w-full); from
          sm+ it is centered and capped to the viewport height minus a small
          margin, with width derived from the 9:16 ratio so the video keeps its
          shape instead of stretching. Every overlay lives inside this frame, so
          they stay positioned relative to the player, not the window. */}
      <div className="relative h-full w-full overflow-hidden bg-black sm:h-[calc(100dvh-2rem)] sm:w-auto sm:aspect-[9/16] sm:max-w-full sm:rounded-2xl sm:shadow-2xl">
      {/* Player surface: touch-action none suppresses horizontal swipe-scrubbing;
          taps still fire. Portrait only, letterboxed against black. */}
      <div className="absolute inset-0" style={{ touchAction: "none" }}>
        <video
          ref={videoRef}
          key={location.video_version ?? location.video_url ?? "reel"}
          src={location.video_url ?? undefined}
          className={`absolute inset-0 w-full h-full ${arrivalPrompt && atLast ? "object-cover" : "object-contain"}`}
          playsInline
          muted
          preload="auto"
        />
      </div>

      {/* Segmented progress bar (Instagram Stories style), display-only. One
          segment per checkpoint: passed = solid white, the active one fills with
          currentTime toward the next checkpoint, upcoming = dim white. A soft
          top scrim keeps it legible over bright footage. pointer-events-none so
          taps fall through to the edge zones — navigation stays on the arrows.
          Hidden in the arrival state, like the nav arrows. */}
      {!arrivalPrompt && (
        <div
          role="progressbar"
          aria-label={walkerStrings.video.progressLabel}
          aria-valuemin={0}
          aria-valuemax={cps.length}
          aria-valuenow={started ? Math.min(parked + 1, cps.length) : 0}
          className="absolute top-0 inset-x-0 z-50 pointer-events-none px-3 pb-6 pt-[max(0.5rem,env(safe-area-inset-top))]"
          style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0))" }}
        >
          <div className="flex gap-1">
            {cps.map((_, i) => {
              const prevT = i === 0 ? 0 : cps[i - 1].time;
              const thisT = cps[i].time;
              const fill = !started
                ? 0
                : elapsed >= thisT
                  ? 1
                  : elapsed <= prevT || thisT <= prevT
                    ? 0
                    : (elapsed - prevT) / (thisT - prevT);
              return (
                <div key={i} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${Math.round(fill * 100)}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

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
          footage under each arrow for legibility; near-invisible, and only
          shown when paused at a checkpoint. Visibility only — the tap zones
          above stay active regardless. */}
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
          <span className="font-display text-3xl font-semibold leading-tight text-balance drop-shadow-lg [text-shadow:var(--walker-text-halo)]">
            {location.studio_name}
          </span>
          {location.start_address && (
            <span className="text-sm font-normal leading-snug text-balance text-white/80 drop-shadow-md [text-shadow:var(--walker-text-halo)]">
              {location.start_address}
            </span>
          )}
          {/* Wrapper carries the ripple rings as siblings of the glass pill, so the
              pill's own backdrop-filter / clipping never cuts them off. */}
          <span className="usha-ripple-wrap relative mt-4 inline-flex">
            <span className="usha-ripple-ring usha-ripple-ring-1" aria-hidden="true" />
            <span className="usha-ripple-ring usha-ripple-ring-2" aria-hidden="true" />
            <span className="usha-glass-pill relative rounded-full px-[26px] py-[11px] text-base font-medium text-white">
              {walkerStrings.video.tapToStart}
            </span>
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

      {/* Arrival prompt at the final checkpoint: a white bottom sheet laid
          directly over the (edge-to-edge) final frame. Buttons sit above the
          zones and stopPropagation so they never register as back/forward.
          Bottom padding adds the iOS safe area. */}
      {arrivalPrompt && atLast && (
        <div
          className="absolute inset-x-0 bottom-0 z-40 rounded-t-[28px] bg-white px-5 pt-7"
          style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-[#0A0A0A] text-[22px] font-semibold leading-[1.25] tracking-[-0.025em] text-balance mb-5">
            {arrivalInstruction}
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); confirmArrived(); }}
              className="h-14 flex-1 rounded-full bg-[#0A0A0A] font-semibold text-white text-[17px] active:scale-[0.98] transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              {walkerStrings.video.madeIt}
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); rejectArrival(); }}
              className="h-14 flex-1 rounded-full bg-[#F0F0F1] font-semibold text-[#0A0A0A] text-[17px] active:scale-[0.98] transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
            >
              {walkerStrings.video.notYet}
            </button>
          </div>
          {/* Quiet restart — un-emphasized text link under the buttons. */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); restart(); }}
            className="mt-4 mx-auto block text-[#6B6B70] text-[14px] underline underline-offset-4 active:scale-95 transition-smooth focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0A0A0A]"
          >
            {walkerStrings.video.startAgain}
          </button>
        </div>
      )}

      {helpSheet}
      </div>
    </div>
  );
}
