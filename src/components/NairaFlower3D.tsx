import { useEffect, useRef, useState } from "react";
import { FILL } from "@/lib/nairaFlower/config";
import { FLOWER_ASPECT, flowerPath } from "@/lib/nairaFlower/outline";

const PATH = flowerPath();

/*
  The brand-deck flower, cast in gold and turning beside the header wordmark
  at the Naira box's pace.

  The header is on every page and above the fold, so three.js (~146 KB gzip)
  must not compete with the page for the first load. A flat gold still of the
  same drawing holds the spot from the first paint; the scene is fetched only
  once the page has loaded and the browser is idle, and the still cross-fades
  into it. Anyone with reduced motion or Data Saver keeps the still and never
  downloads three.js at all, and so does a browser without WebGL.
*/
/* className must carry a position (relative or absolute): the still and the
   canvas are stacked inside it. */
const NairaFlower3D = ({ className = "relative" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (reduced || saveData) return;

    let cancelled = false;
    let handle: { dispose: () => void } | null = null;
    let cancelWait = () => {};

    const start = () => {
      const run = () =>
        import("@/lib/nairaFlower/scene")
          .then(({ mountNairaFlower }) => {
            if (cancelled) return;
            handle = mountNairaFlower(canvas, { onReady: () => !cancelled && setLive(true) });
          })
          .catch(() => {
            /* No WebGL or the chunk failed: the still stays. */
          });
      if (window.requestIdleCallback) {
        const id = window.requestIdleCallback(run, { timeout: 3000 });
        cancelWait = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(run, 1200);
        cancelWait = () => window.clearTimeout(id);
      }
    };

    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      cancelled = true;
      window.removeEventListener("load", start);
      cancelWait();
      handle?.dispose();
    };
  }, []);

  return (
    <span aria-hidden="true" className={`pointer-events-none block aspect-[3/4] ${className}`}>
      <svg
        viewBox={`0 0 ${FLOWER_ASPECT} 1`}
        className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}
        style={{ height: `${FILL * 100}%`, fill: "var(--nf-gold)" }}
      >
        <path d={PATH} />
      </svg>
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full transition-opacity duration-700 ${live ? "opacity-100" : "opacity-0"}`}
      />
    </span>
  );
};

export default NairaFlower3D;
