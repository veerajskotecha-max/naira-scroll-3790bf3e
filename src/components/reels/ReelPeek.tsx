import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { X, Play, Volume2, VolumeX } from "lucide-react";
import { useReels } from "@/hooks/useReels";
import { reelCover } from "@/lib/reelCovers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

// Code-split: none of the viewer JS ships with the product page bundle.
const ReelViewer = lazy(() => import("./ReelViewer"));
const MobileReelShop = lazy(() => import("./MobileReelShop"));

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const saveData = () =>
  typeof navigator !== "undefined" &&
  (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;

/** Floating shoppable reel that appears once the shopper scrolls past the fold. */
const ReelPeek = ({ suppressed = false }: { suppressed?: boolean }) => {
  const isMobile = useIsMobile();
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [pastThreshold, setPastThreshold] = useState(false);
  const [open, setOpen] = useState(false);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const suppressClickUntil = useRef(0);
  const instagramBrowser = useMemo(
    () => typeof navigator !== "undefined" && /Instagram|FBAN|FBAV/i.test(navigator.userAgent),
    [],
  );
  // Position handed to the fullscreen viewer so it resumes on the same frame.
  const handoffTime = useRef(0);

  const openViewer = () => {
    handoffTime.current = videoRef.current?.currentTime ?? 0;
    setOpen(true);
  };

  const openViewerFromClick = () => {
    if (Date.now() < suppressClickUntil.current) return;
    openViewer();
  };

  // Some iOS in-app browsers (Instagram, Facebook) never synthesize `click` on
  // a fixed, video-backed element. Pointer events are the one path every one of
  // them fires, so open from pointerup too and swallow the follow-up click.
  const rememberTouchStart = (event: React.PointerEvent) => {
    touchStart.current = { x: event.clientX, y: event.clientY };
  };

  const openViewerFromTouch = (event: React.PointerEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (event.pointerType === "mouse") return; // desktop keeps the click path
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) {
      suppressClickUntil.current = Date.now() + 500;
      return;
    }
    // Block the synthetic click this tap will produce, so one tap = one open.
    suppressClickUntil.current = Date.now() + 500;
    openViewer();
  };


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
      void import("./MobileReelShop");
    }, { timeout: 4000 });
    return () => {
      const cancel = (window as Window & { cancelIdleCallback?: (h: number) => void }).cancelIdleCallback;
      if (cancel) cancel(id as number);
      else window.clearTimeout(id as number);
    };
  }, []);

  // Poster first: the still is a few KB and removes the black flash on reveal.
  useEffect(() => {
    const still = reelCover(reel?.video_path) ?? reel?.posterUrl;
    if (!still) return;
    const img = new Image();
    img.src = still;
  }, [reel?.video_path, reel?.posterUrl]);


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
      // Never auto-restore: once the shopper closes the reel it stays closed
      // until they tap the Reels bubble again.
      if (active) setArmed(true);

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

  // The bundled cover is enough to reveal the preview. A failed signed URL must
  // never remove the shopper's way into the reel drawer.
  useEffect(() => {
    setShown(Boolean(reel) && pastThreshold && !minimised && !suppressed);
  }, [reel, pastThreshold, minimised, suppressed]);

  // Always autoplay silently — audio stays opt-in via the mute toggle.
  const startPlayback = useCallback(async () => {
    const v = videoRef.current;
    if (!v || prefersReducedMotion() || instagramBrowser) return;
    v.muted = true;
    setMuted(true);
    try {
      await v.play();
    } catch {
      /* autoplay blocked — poster stays */
    }
  }, [instagramBrowser]);

  // Kick playback whenever the widget becomes visible.
  useEffect(() => {
    if (shown) void startPlayback();
  }, [shown, startPlayback]);


  // Never keep audio/video running while tucked away.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (minimised || !pastThreshold || suppressed) v.pause();
  }, [minimised, pastThreshold, suppressed]);

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
      {!suppressed && !open && pastThreshold && (minimised || !reel) && (
          <Button
          type="button"
          onClick={showReels}
          aria-label="Show shoppable reels"
            variant="secondary"
            className="fixed z-[35] min-h-11 gap-1.5 rounded-full px-4 py-2 text-[10px] uppercase tracking-nf-15 shadow-lg"
            style={{ right: isMobile ? 12 : 24, bottom: isMobile ? "calc(var(--pdp-sticky-bar-h, 72px) + 16px)" : 28 }}
        >
          <Play size={12} /> Reels
          </Button>
      )}

      {!suppressed && !open && !minimised && pastThreshold && reel && (
        <div
          className="fixed z-[35] transition-all duration-500 ease-out"
          style={{
            width: isMobile ? 108 : 150,
            right: isMobile ? 12 : 24,
            bottom: isMobile ? "calc(var(--pdp-sticky-bar-h, 72px) + 16px)" : 28,
            opacity: shown ? 1 : 0,
            transform: shown ? "translateY(0)" : "translateY(24px)",
            pointerEvents: shown ? "auto" : "none",
          }}
        >
          <Button
            type="button"
            onClick={openViewerFromClick}
            onTouchStart={rememberTouchStart}
            onTouchEnd={openViewerFromTouch}
            variant="ghost"
            className="relative block h-auto w-full touch-manipulation select-none overflow-hidden p-0 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.45)] hover:bg-transparent"
            style={{ aspectRatio: "9/16" }}
            aria-label="Open shoppable reels"
          >
            <img
              src={reelCover(reel.video_path) ?? reel.posterUrl ?? reel.products[0]?.image_url ?? ""}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            />
            {reel.videoUrl && !instagramBrowser && (
              <video
                ref={videoRef}
                src={reel.videoUrl}
                poster={reelCover(reel.video_path) ?? reel.posterUrl ?? undefined}
                className="pointer-events-none absolute inset-0 h-full w-full object-cover"
                playsInline
                loop
                muted
                autoPlay
                preload="metadata"
                onLoadedMetadata={() => void startPlayback()}
                onLoadedData={() => void startPlayback()}
                onCanPlay={() => void startPlayback()}
              />
            )}
            <span
              className="pointer-events-none absolute inset-x-0 bottom-0 whitespace-normal px-2 py-1.5 text-left text-[8px] uppercase leading-snug tracking-[0.12em] text-white"
              style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
            >
              Click here to watch &amp; shop
            </span>
          </Button>

          <Button
            type="button"
            onClick={minimise}
            aria-label="Minimise reel"
            variant="secondary"
            size="icon"
            className="absolute -left-3 -top-3 h-11 w-11 rounded-full shadow"
          >
            <X size={13} />
          </Button>

          {!instagramBrowser && reel.videoUrl && <Button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? "Unmute reel" : "Mute reel"}
            variant="secondary"
            size="icon"
            className="absolute -right-3 -top-3 h-11 w-11 rounded-full shadow"
          >
            {muted ? (
              <VolumeX size={12} />
            ) : (
              <Volume2 size={12} />
            )}
          </Button>}
        </div>
      )}

      {open && !isMobile && (
        <Suspense fallback={null}>
          <ReelViewer
            reels={reels ?? []}
            startIndex={0}
            startTime={handoffTime.current}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}

      {isMobile && (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="bottom"
            className="h-[90dvh] overflow-y-auto border-border p-0 pb-[env(safe-area-inset-bottom)] [&>button]:right-3 [&>button]:top-3 [&>button]:rounded-none [&>button]:bg-secondary [&>button]:focus:ring-0 [&>button]:focus:ring-offset-0"
          >
            <SheetTitle className="sr-only">Shop the Reel</SheetTitle>
            <Suspense fallback={<div className="h-full bg-background" aria-hidden="true" />}>
              <MobileReelShop drawer />
            </Suspense>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default ReelPeek;
