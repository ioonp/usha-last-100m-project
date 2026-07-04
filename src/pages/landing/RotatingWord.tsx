import { useEffect, useState, type CSSProperties } from "react";

const INTERVAL_MS = 2200;
const FADE_MS = 300;

type Phase = "visible" | "exiting" | "entering";

/**
 * Cycles through `words` with a short fade-and-slide crossfade, matching the
 * hero's "Find your way to the [word]." rotator. Static on the first word
 * when motion is reduced.
 */
export function RotatingWord({ words, reducedMotion }: { words: string[]; reducedMotion: boolean }) {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("visible");

  useEffect(() => {
    if (reducedMotion || words.length <= 1) return;

    const timers: { fade?: number; raf1?: number; raf2?: number } = {};

    const interval = window.setInterval(() => {
      setPhase("exiting");
      timers.fade = window.setTimeout(() => {
        setIndex((i) => (i + 1) % words.length);
        setPhase("entering");
        timers.raf1 = requestAnimationFrame(() => {
          timers.raf2 = requestAnimationFrame(() => setPhase("visible"));
        });
      }, FADE_MS);
    }, INTERVAL_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timers.fade);
      if (timers.raf1) cancelAnimationFrame(timers.raf1);
      if (timers.raf2) cancelAnimationFrame(timers.raf2);
    };
  }, [words, reducedMotion]);

  const style: CSSProperties | undefined = reducedMotion
    ? undefined
    : phase === "exiting"
      ? { transition: "opacity .3s, transform .3s", opacity: 0, transform: "translateY(-8px)" }
      : phase === "entering"
        ? { transition: "none", opacity: 0, transform: "translateY(8px)" }
        : { transition: "opacity .3s, transform .3s", opacity: 1, transform: "translateY(0)" };

  return (
    <span className="inline-block md:block">
      <span className="inline-block text-accent" style={style}>
        {words[index]}
      </span>
    </span>
  );
}
