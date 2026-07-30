/* ───────────────────────────────────────────────────────────────
   REVEAL FALLBACK
   IntersectionObserver reveals across the site can miss their initial
   callback (route transitions, layout shifts while images settle, GSAP
   pin spacers), leaving in-view content stuck at opacity 0 until the
   visitor happens to scroll. Every reveal component pairs its observer
   with this: an immediate + rAF + timed re-check that force-reveals
   anything already inside the viewport. Returns a disposer.
   ─────────────────────────────────────────────────────────────── */

export const isInViewport = (el: Element | null | undefined): boolean => {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  return r.top < window.innerHeight && r.bottom > 0 && r.height > 0;
};

export function armRevealFallback(check: () => void): () => void {
  check();
  const raf = requestAnimationFrame(check);
  const t1 = window.setTimeout(check, 350);
  const t2 = window.setTimeout(check, 1100);
  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(t1);
    clearTimeout(t2);
  };
}
