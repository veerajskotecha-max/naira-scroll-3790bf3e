import { useEffect, useRef, useState } from "react";
import printUrl from "@/assets/naira-box-print.webp";
import posterUrl from "@/assets/naira-box-poster.webp";
// The solitaire from the homepage ring turn, revealed when the drawer opens.
import ringUrl from "@/assets/jewellery/ring-cut-34.webp";

/*
  The Naira box, turning in 3D — the brand's answer to the bag above the
  footer on bluorng.com. Rendered by NairaBoxShowcase. Tapping it opens the
  drawer on the ring; tapping again closes it.

  The scene is ~146 KB gzipped (three.js) and sits at the bottom of every page, so it is
  fetched only when the box comes within a screen of the viewport. Until the
  scene has drawn its first frame a still of the same box holds the space,
  and it stays as the fallback if WebGL is unavailable, so there is never an
  empty square or a layout jump.
*/
const NairaBox3D = ({ className = "" }: { className?: string }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [live, setLive] = useState(false);
  // The hint goes once the box has been opened: by then it has done its job.
  const [opened, setOpened] = useState(false);
  const handleRef = useRef<{ toggle: () => void } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || typeof IntersectionObserver === "undefined") return;
    let cancelled = false;
    let handle: { toggle: () => void; dispose: () => void } | null = null;

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
              onOpen: () => !cancelled && setOpened(true),
            });
            handleRef.current = handle;
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
      handleRef.current = null;
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
      {/* The scene sets the cursor itself: a pointer only over the box, which
          is the only part a tap opens. */}
      <canvas
        ref={canvasRef}
        role="button"
        tabIndex={live ? 0 : -1}
        aria-label="The Naira gift box. Tap to open it and see the ring inside; drag to spin it."
        onKeyDown={(e) => {
          if (e.key !== "Enter" && e.key !== " ") return;
          e.preventDefault();
          handleRef.current?.toggle();
        }}
        className={`absolute inset-0 h-full w-full touch-pan-y outline-none transition-opacity duration-500 focus-visible:ring-1 focus-visible:ring-[var(--nf-accent)] ${live ? "opacity-100" : "opacity-0"}`}
      />
      <p
        aria-hidden="true"
        className={`pointer-events-none absolute inset-x-0 bottom-[8%] text-center font-nf-label text-[10px] uppercase tracking-nf-16 text-[color:rgb(var(--nf-ink-rgb)/0.45)] transition-opacity duration-500 ${live && !opened ? "opacity-100" : "opacity-0"}`}
      >
        Tap to open
      </p>
    </div>
  );
};

export default NairaBox3D;
