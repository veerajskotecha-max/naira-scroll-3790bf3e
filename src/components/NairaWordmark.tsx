import { useEffect, useRef, useState } from "react";
import { FILL, HALF_WIDTH } from "@/lib/nairaFlower/config";
import { FLOWER_ASPECT, flowerPath } from "@/lib/nairaFlower/outline";
import { WORDMARK, WORDMARK_FLOWER as F } from "@/lib/nairaFlower/wordmark";

const PATH = flowerPath();
const { width: W, height: H } = WORDMARK;

/* The 3D flower's canvas, in wordmark units: centred on the I's stem and on
   the flower, wide enough for the low leaf to swing clear on both sides. */
const BOX = {
  left: F.axis - HALF_WIDTH * F.height,
  top: F.cy - F.height / FILL / 2,
  width: HALF_WIDTH * 2 * F.height,
  height: F.height / FILL,
};
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/*
  The header wordmark: NAIRA as vector letters from the brand deck, with the
  flower that stands as its I drawn on top and, once the page has settled,
  turning in 3D around the I's stem.

  The header is on every page and above the fold, so three.js (~146 KB gzip)
  must not compete with the page for the first load. The flat flower is part
  of the wordmark from the first paint; the scene is fetched only once the
  page has loaded, a few seconds have passed and the browser is idle, lands
  face-on exactly over the flat flower, and the two cross-fade. Its first
  frame costs a phone a few hundred milliseconds of main thread; "idle" alone
  used to fire while a catalogue-ad visitor's product page was still coming
  in, so the wait is also measured from load.

  Anyone with reduced motion, Data Saver, a slow connection or a low-memory
  phone keeps the flat flower and never downloads three.js at all, and so
  does a browser without WebGL — the logo is whole either way.
*/
const START_AFTER_LOAD_MS = 5000;

type NetworkInfo = { saveData?: boolean; effectiveType?: string };

/** Whether this device should skip the 3D flower entirely. */
const keepFlatFlower = (): boolean => {
  const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const nav = navigator as Navigator & { connection?: NetworkInfo; deviceMemory?: number };
  const slowNetwork = /^(slow-2g|2g|3g)$/.test(nav.connection?.effectiveType ?? "");
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory < 4;
  return reduced || Boolean(nav.connection?.saveData) || slowNetwork || lowMemory;
};
const NairaWordmark = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (keepFlatFlower()) return;

    let cancelled = false;
    let handle: { dispose: () => void } | null = null;
    let cancelWait = () => {};

    const start = () => {
      const run = () =>
        import("@/lib/nairaFlower/scene")
          .then(({ mountNairaFlower }) => {
            if (cancelled) return;
            handle = mountNairaFlower(canvas, {
              axisOffset: (F.cx - F.axis) / F.height,
              onReady: () => !cancelled && setLive(true),
            });
          })
          .catch(() => {
            /* No WebGL or the chunk failed: the flat flower stays. */
          });
      const later = window.setTimeout(() => {
        if (window.requestIdleCallback) {
          const id = window.requestIdleCallback(run, { timeout: 5000 });
          cancelWait = () => window.cancelIdleCallback(id);
        } else {
          run();
        }
      }, START_AFTER_LOAD_MS);
      cancelWait = () => window.clearTimeout(later);
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

  const flowerLeft = F.cx - (FLOWER_ASPECT / 2) * F.height;
  const flowerTop = F.cy - F.height / 2;

  return (
    <span className={`relative block ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="NAIRA" className="block h-auto w-full overflow-visible">
        <path d={WORDMARK.d} style={{ fill: "var(--nf-sage)" }} />
        <path
          d={PATH}
          data-flower
          transform={`translate(${flowerLeft} ${flowerTop}) scale(${F.height})`}
          className={`transition-opacity duration-700 ${live ? "opacity-0" : "opacity-100"}`}
          style={{ fill: "var(--nf-blush)" }}
        />
      </svg>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`pointer-events-none absolute transition-opacity duration-700 ${live ? "opacity-100" : "opacity-0"}`}
        style={{
          left: pct(BOX.left, W),
          top: pct(BOX.top, H),
          width: pct(BOX.width, W),
          height: pct(BOX.height, H),
        }}
      />
    </span>
  );
};

export default NairaWordmark;
