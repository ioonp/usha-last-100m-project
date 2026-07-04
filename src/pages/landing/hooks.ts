import { useEffect, useRef, useState } from "react";

/** Tracks the `prefers-reduced-motion` media query, live. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return reduced;
}

/**
 * Flags an element as "in view" the first time it crosses `threshold`, then
 * stops observing. When motion is reduced it reports "in view" immediately
 * so scroll-triggered content renders in its final state right away.
 */
export function useInView<T extends HTMLElement>(reducedMotion: boolean, threshold = 0.3) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(reducedMotion);

  useEffect(() => {
    if (reducedMotion) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.unobserve(el);
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reducedMotion, threshold]);

  return { ref, inView };
}
