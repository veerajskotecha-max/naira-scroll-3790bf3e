import { useEffect, useRef, useState } from "react";
import printUrl from "@/assets/naira-box-print.webp";
import posterUrl from "@/assets/naira-box-poster.webp";
// The solitaire from the homepage ring turn, revealed when the drawer opens.
import ringUrl from "@/assets/jewellery/ring-cut-34.webp";

/*
  The Naira box, turning in 3D — the brand's answer to the bag above the
  footer on bluorng.com. Rendered by NairaBoxShowcase.

  The scene is ~146 KB gzipped (three.js) and sits at the bottom of every page, so it is
  fetched only when the box comes within a screen of the viewport. Until the
  scene has drawn its first frame a still of the same box holds the space,
  and it stays as the fallback if WebGL is unavailable, so there is never an
  empty square or a layout jump.
*/
const NairaBox3D = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") return;
    let cancelled = false;
    let handle: { dispose: () => void } | null = null;

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        import("@/lib/nairaBox/scene")
          .then(({ mountNairaBox }) => {
            if (cancelled) return;
            handle = mountNairaBox(canvas, {
              printUrl,
              ringUrl,
              reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
              onReady: () => !cancelled && setLive(true),
            });
          })
          .catch(() => {
            /* No WebGL or the chunk failed: the still stays. */
          });
      },
      { rootMargin: "100% 0px" }
    );
    io.observe(canvas);

    return () => {
      cancelled = true;
      io.disconnect();
      handle?.dispose();
    };
  }, []);

  return (
    <div className={`relative mx-auto aspect-[5/4] ${className || "w-full"}`}>
      <img
        src={posterUrl}
        alt=""
        aria-hidden="true"
        loading="lazy"
        decoding="async"
        className={`pointer-events-none absolute inset-0 h-full w-full object-contain transition-opacity duration-500 ${live ? "opacity-0" : "opacity-100"}`}
      />
      <canvas
        ref={canvasRef}
        role="img"
        aria-label="The Naira gift box, turning. Drag to spin it."
        className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y transition-opacity duration-500 active:cursor-grabbing ${live ? "opacity-100" : "opacity-0"}`}
      />
    </div>
  );
};

export default NairaBox3D;
