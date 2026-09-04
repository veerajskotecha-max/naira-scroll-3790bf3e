import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronDown, Play, Volume2, VolumeX } from "lucide-react";
import { useReels } from "@/hooks/useReels";
import { useIsMobile } from "@/hooks/use-mobile";

// Code-split: none of the viewer JS ships with the product page bundle.
const ReelViewer = lazy(() => import("./ReelViewer"));

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const saveData = () =>
  typeof navigator !== "undefined" &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/** Floating shoppable reel that appears once the shopper scrolls past the fold. */
const ReelPeek = () => {
  const isMobile = useIsMobile();
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [pastThreshold, setPastThreshold] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: reels } = useReels(armed);
  const reel = reels?.[0];

  // Warm-up during browser idle time: fetch the (tiny) reel metadata, pull the
  // viewer chunk into cache and decode the poster. No video bytes are touched,
  // so the PDP stays light while the reel opens instantly when it appears.
  useEffect(() => {
    if (typeof window === "undefined" || saveData()) return;
    const idle =
      (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
        .requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const id = idle(() => {
      setArmed(true);
      void import("./ReelViewer");
    }, { timeout: 4000 });
    return () => {
      const cancel = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id as number);
      else window.clearTimeout(id as number);
    };
  }, []);

  // Poster first: the still is a few KB and removes the black flash on reveal.
  useEffect(() => {
    if (!reel?.posterUrl) return;
    const img = new Image();
    img.src = reel.posterUrl;
  }, [reel?.posterUrl]);


  // Anchor the reel to the Buy Now / Add to Cart block: it slides in once those
  // buttons have been passed and stays for the rest of the page, vanishing the
  // moment the shopper scrolls back up above them (over the gallery).
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (saveData()) return;

    let raf = 0;
    const evaluate = () => {
      raf = 0;
      const anchor =
        document.getElementById("product-actions") ||
        document.getElementById("product-material-details");
      let active: boolean;
      if (anchor) {
        // Active once the buttons block has been scrolled past (bottom above 85% of viewport).
        active = anchor.getBoundingClientRect().bottom <= window.innerHeight * 0.85;
      } else {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        active = window.scrollY / max >= 0.32;
      }

      setPastThreshold(active);
      if (active) {
        setArmed(true);
        setMinimised(false);
      }
    };

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(evaluate);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    evaluate();
    const t = window.setTimeout(evaluate, 600);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearTimeout(t);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // Reveal only once the media is actually available.
  useEffect(() => {
    setShown(Boolean(reel?.videoUrl) && pastThreshold && !minimised);
  }, [reel?.videoUrl, pastThreshold, minimised]);

  // Always autoplay silently — audio stays opt-in via the mute toggle.
  const startPlayback = useCallback(async () => {
    const v = videoRef.current;
    if (!v || prefersReducedMotion()) return;
    v.muted = true;
    setMuted(true);
    try {
      await v.play();
    } catch {
      /* autoplay blocked — poster stays */
    }
  }, []);

  // Kick playback whenever the widget becomes visible.
  useEffect(() => {
    if (shown) void startPlayback();
  }, [shown, startPlayback]);


  // Never keep audio/video running while tucked away.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (minimised || !pastThreshold) v.pause();
  }, [minimised, pastThreshold]);

  const minimise = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimised(true);
  };

  const showReels = () => {
    setArmed(true);
    setMinimised(false);
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) void v.play().catch(() => undefined);
  };

  return (
    <>
      {!open && pastThreshold && (minimised || !reel) && (
        <button
          type="button"
          onClick={showReels}
          aria-label="Show shoppable reels"
          className="fixed z-[110] flex min-h-10 items-center gap-1.5 rounded-full bg-white px-4 py-2 text-[10px] uppercase tracking-[0.14em] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)]"
          style={{ right: isMobile ? 12 : 24, bottom: isMobile ? 96 : 28, color: "hsl(0 0% 20%)" }}
        >
          <Play size={12} /> Reels
        </button>
      )}

      {!open && !minimised && pastThreshold && reel && (
        <div
          className="fixed z-[110] transition-all duration-500 ease-out"
          style={{
            width: isMobile ? 108 : 150,
            right: isMobile ? 12 : 24,
            bottom: isMobile ? 92 : 28,
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(24px)",
            pointerEvents: shown ? "auto" : "none",
          }}
        >
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="relative block w-full overflow-hidden shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)]"
            style={{ aspectRatio: "9/16", backgroundColor: "hsl(0 0% 8%)" }}
            aria-label="Open shoppable reels"
          >
            <video
              ref={videoRef}
              src={reel.videoUrl}
              poster={reel.posterUrl ?? undefined}
              className="absolute inset-0 h-full w-full object-cover"
              playsInline
              loop
              muted
              autoPlay
              preload="metadata"
              onLoadedMetadata={() => void startPlayback()}
              onLoadedData={() => void startPlayback()}
              onCanPlay={() => void startPlayback()}

            />
            <span
              className="absolute inset-x-0 bottom-0 px-2 py-1.5 text-left text-[9px] uppercase tracking-[0.14em] text-white"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
            >
              Watch &amp; shop
            </span>
          </button>

          <button
            type="button"
            onClick={minimise}
            aria-label="Minimise reel"
            className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
          >
            <X size={13} style={{ color: "hsl(0 0% 20%)" }} />
          </button>

          <button
            type="button"
            onClick={minimise}
            aria-label="Minimise reel"
            className="absolute -bottom-2 right-1/2 flex h-5 w-8 translate-x-1/2 items-center justify-center rounded-full bg-white shadow"
          >
            <ChevronDown size={12} style={{ color: "hsl(0 0% 20%)" }} />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute reel" : "Mute reel"}
            className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
          >
            {muted ? (
              <VolumeX size={12} style={{ color: "hsl(0 0% 20%)" }} />
            ) : (
              <Volume2 size={12} style={{ color: "hsl(0 0% 20%)" }} />
            )}
          </button>
        </div>
      )}

      {open && (
        <Suspense fallback={null}>
          <ReelViewer reels={reels ?? []} startIndex={0} onClose={() => setOpen(false)} />
        </Suspense>
      )}
    </>
  );
};

export default ReelPeek;
