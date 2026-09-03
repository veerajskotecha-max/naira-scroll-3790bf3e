import { Suspense, lazy, useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronDown, Volume2, VolumeX } from "lucide-react";
import { useReels } from "@/hooks/useReels";
import { useIsMobile } from "@/hooks/use-mobile";

// Code-split: none of the viewer JS ships with the product page bundle.
const ReelViewer = lazy(() => import("./ReelViewer"));

const DISMISS_KEY = "naira-reel-peek-dismissed";

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
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const { data: reels } = useReels(armed && !dismissed);
  const reel = reels?.[0];

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(DISMISS_KEY) === "1" || saveData()) {
      setDismissed(true);
      return;
    }
    const onScroll = () => {
      if (window.scrollY > window.innerHeight * 1.2) {
        setArmed(true);
        window.removeEventListener("scroll", onScroll);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reveal only once the media is actually available.
  useEffect(() => {
    if (reel?.videoUrl) setShown(true);
  }, [reel?.videoUrl]);

  // Try sound first, fall back to muted when the browser blocks it.
  const startPlayback = useCallback(async () => {
    const v = videoRef.current;
    if (!v || prefersReducedMotion()) return;
    v.muted = false;
    try {
      await v.play();
      setMuted(false);
    } catch {
      v.muted = true;
      setMuted(true);
      try {
        await v.play();
      } catch {
        /* autoplay fully blocked — poster stays */
      }
    }
  }, []);

  const dismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissed(true);
    sessionStorage.setItem(DISMISS_KEY, "1");
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
    if (!v.muted) void v.play().catch(() => undefined);
  };

  if (dismissed || !reel) return null;

  return (
    <>
      {!open && (
        <div
          className="fixed z-[60] transition-all duration-500 ease-out"
          style={{
            width: isMobile ? 108 : 150,
            right: isMobile ? 12 : 24,
            bottom: isMobile ? 88 : 28,
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
              preload="none"
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
            onClick={dismiss}
            aria-label="Close reel"
            className="absolute -top-2 -left-2 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
          >
            <X size={13} style={{ color: "hsl(0 0% 20%)" }} />
          </button>

          <button
            type="button"
            onClick={dismiss}
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
