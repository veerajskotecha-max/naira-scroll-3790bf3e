import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Loader2, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import type { JewelPiece } from "@/data/jewellery";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { readStaleReelCache, useReels, type Reel, type ReelProduct } from "@/hooks/useReels";
import { shopifyImage } from "@/lib/shopifyImage";
import { reelCover } from "@/lib/reelCovers";
import { relabelledVideoUrl } from "@/lib/videoRecovery";
import localReelPoster from "@/assets/reel-fallback.webp";
import { cartLineFor, choiceNeeded, oneTapVariant } from "@/lib/variants";
import { cleanButton } from "@/components/clean";

/*
  "Shop the reel" on the product page (phones only), and the frame that plays
  a reel as the last slide of the photo gallery.

  Drawn in the clean system the page is in (src/components/clean; it always
  renders inside the page's .nf-clean root): the same plain heading as every
  section, the pieces in a reel as rows between hairlines (photo, name, price
  and the small outline button), square ivory controls on the film, no
  shadows, no gradients, nothing in sage.

  Weight: a reel is 3.4–4.5 MB, most of what the product page ever downloads.
  It still only streams once it is on screen, and on a data-saver or 2G/3G
  connection it waits for a tap instead of starting by itself.
*/

const PREORDER_WHATSAPP = "919561557935";

const isInstagramBrowser = () => typeof navigator !== "undefined" && /Instagram|FBAN|FBAV/i.test(navigator.userAgent);

type NetInfo = { saveData?: boolean; effectiveType?: string };
const isLowData = () => {
  if (typeof navigator === "undefined") return false;
  const connection = (navigator as Navigator & { connection?: NetInfo }).connection;
  return Boolean(connection?.saveData) || /2g|3g/.test(connection?.effectiveType ?? "");
};

const parsePrice = (label?: string | null) => (label ? Number(label.replace(/[^\d.]/g, "")) || 0 : 0);

type HrefFor = (handle: string) => string;
const productHref: HrefFor = (handle) => `/jewellery/${handle}`;

const ReelPiece = ({ product, live, hrefFor }: { product: ReelProduct; live?: JewelPiece; hrefFor: HrefFor }) => {
  const { addItem, setDrawerOpen, isLoading } = useCart();
  const [adding, setAdding] = useState(false);
  // Adjustability is fit, not inventory: Shopify is the stock authority (as on JewelCard).
  const soldOut = live?.availableForSale === false;
  const image = live?.image ?? product.image_url ?? "";
  const price = live?.priceLabel ?? product.price_label ?? "";
  const name = live?.name ?? product.title;
  const href = hrefFor(product.handle);
  // On this piece's own page the row names it rather than linking to itself.
  const here = useLocation().pathname === href;

  const add = async () => {
    const variantId = live?.variantId || product.variant_id;
    // A piece that needs a size or a month is chosen on its own page.
    if (!variantId || (live && choiceNeeded(live))) {
      toast("Choose your options", { description: "Opening the product page." });
      window.location.assign(href);
      return;
    }
    setAdding(true);
    setDrawerOpen(true);
    try {
      await addItem(
        live
          ? cartLineFor(live, oneTapVariant(live))
          : { id: product.handle, variantId, name, price: parsePrice(product.price_label), priceLabel: price, currencyCode: "INR", image },
      );
    } finally {
      setAdding(false);
    }
  };

  const reserve = () => {
    const message = encodeURIComponent(`Hello Naira — I'd like to pre-order the ${product.title}. Please reserve one for me.`);
    window.open(`https://wa.me/${PREORDER_WHATSAPP}?text=${message}`, "_blank", "noopener");
  };

  const thumb = image && (
    <img src={shopifyImage(image, 160)} alt={name} className="h-full w-full object-cover" loading="lazy" decoding="async" width={48} height={48} />
  );

  const words = (
    <>
      <span className="nc-small nc-small--ink block truncate">{name}</span>
      <span className="nc-small block">
        {soldOut ? "Pre-order" : price}
        {here && <span> · this piece</span>}
      </span>
    </>
  );

  return (
    <li className="flex items-center gap-3 border-t border-[color:var(--nc-rule)] py-2.5">
      {here ? (
        <span className="block h-12 w-12 shrink-0 overflow-hidden bg-[var(--nc-linen)]">{thumb}</span>
      ) : (
        <Link to={href} className="block h-12 w-12 shrink-0 overflow-hidden bg-[var(--nc-linen)]">
          {thumb}
        </Link>
      )}
      {/* Name and price are one 44px link to the piece; on its own page the
          row names it instead of linking to itself. */}
      {here ? (
        <div className="min-w-0 flex-1">{words}</div>
      ) : (
        <Link to={href} className="flex min-h-[44px] min-w-0 flex-1 flex-col justify-center">
          {words}
        </Link>
      )}
      {soldOut ? (
        <button type="button" onClick={reserve} className={`${cleanButton({ size: "sm" })} shrink-0`}>
          Reserve
        </button>
      ) : (
        <button type="button" onClick={add} disabled={adding || isLoading} className={`${cleanButton({ size: "sm" })} shrink-0`} aria-label={`Add ${name} to bag`}>
          {adding ? "Adding…" : "Add"}
        </button>
      )}
    </li>
  );
};

/* A control on the film: a solid ivory square, ink glyph, 44px. */
const control = "nc-iconbtn !bg-[var(--nc-ivory)]";

/* Also the video slide in the product page's photo gallery (square there). */
export const ReelFrame = ({
  reel,
  active,
  canLoad,
  frameClassName = "aspect-[4/5]",
  inGallery = false,
}: {
  reel: Reel;
  active: boolean;
  canLoad: boolean;
  frameClassName?: string;
  /* In the photo gallery the controls sit bottom-right, clear of the film's
     subject; the 2px position line runs under the frame. */
  inGallery?: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const instagramBrowser = useMemo(isInstagramBrowser, []);
  /* Instagram's webview only plays from inside the tap; a data-saver or slow
     connection is asked before a multi-megabyte download starts. */
  const waitForTap = useMemo(() => instagramBrowser || isLowData(), [instagramBrowser]);
  const [userStarted, setUserStarted] = useState(false);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(waitForTap);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [slow, setSlow] = useState(false);

  const stillUrl = reelCover(reel.video_path) ?? reel.posterUrl ?? reel.products[0]?.image_url ?? localReelPoster;
  const playable = Boolean(reel.videoUrl);
  /* Stays mounted after an error, so a retry has an element to work with. */
  const shouldMountVideo = canLoad && playable;
  const objectUrlRef = useRef<string | null>(null);
  const recoveryTriedRef = useRef(false);

  /* A reel stored as application/octet-stream is refused by Safari and the
     Instagram webview; the same bytes relabelled as video/mp4 play
     (lib/videoRecovery). */
  const recoverFromMimeError = useCallback(async () => {
    if (recoveryTriedRef.current || !reel.videoUrl) return;
    recoveryTriedRef.current = true;
    try {
      // Only for a MIME refusal, once per source; null leaves the poster up.
      const url = await relabelledVideoUrl(reel.videoUrl, videoRef.current?.error ?? null);
      if (!url) return;
      objectUrlRef.current = url;
      const video = videoRef.current;
      if (!video) return;
      video.src = url;
      video.load();
      setFailed(false);
      void video
        .play()
        .then(() => setPaused(false))
        .catch(() => setPaused(true));
    } catch {
      setFailed(true);
    }
  }, [reel.videoUrl]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      return;
    }
    if (waitForTap && !userStarted) return;
    video.muted = muted;
    void video
      .play()
      .then(() => setPaused(false))
      .catch(() => undefined);
  }, [active, canLoad, waitForTap, muted, userStarted]);

  useEffect(() => {
    if (!shouldMountVideo || ready || (waitForTap && !userStarted)) return;
    const timer = window.setTimeout(() => setSlow(true), 6000);
    return () => window.clearTimeout(timer);
  }, [ready, shouldMountVideo, waitForTap, userStarted]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (waitForTap && (!userStarted || failed)) {
      setFailed(false);
      setUserStarted(true);
      setSlow(false);
      if (failed) recoveryTriedRef.current = false;
      video.muted = muted;
      video.playsInline = true;
      if (failed) {
        video.src = objectUrlRef.current ?? reel.videoUrl;
        video.load();
      }
      void video
        .play()
        .then(() => setPaused(false))
        .catch(() => setPaused(true));
      return;
    }
    if (video.paused)
      void video
        .play()
        .then(() => setPaused(false))
        .catch(() => undefined);
    else {
      video.pause();
      setPaused(true);
    }
  };

  const askFirst = waitForTap && (!userStarted || failed);

  return (
    <div className={`relative overflow-hidden bg-[var(--nc-ink)] ${frameClassName}`}>
      <img
        src={stillUrl}
        alt={reel.title ?? "Naira Flore reel"}
        className="absolute inset-0 h-full w-full object-cover"
        /* Always lazy. The showing reel's still used to load eagerly, and the
           pre-built page carries this section far below the first screen: a
           phone fetched the still (19 KB) alongside the piece's first photo,
           on the same slow connection. Once the section is near, or the
           gallery reaches its reel slide, lazy loads it at once. */
        loading="lazy"
        decoding="async"
        onError={(event) => {
          event.currentTarget.onerror = null;
          event.currentTarget.src = localReelPoster;
        }}
      />
      {shouldMountVideo && (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={stillUrl ?? undefined}
          onError={() => {
            setFailed(true);
            setReady(false);
            void recoverFromMimeError();
          }}
          className={`relative h-full w-full object-cover transition-opacity duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
          playsInline
          loop
          muted={muted}
          preload={askFirst ? (instagramBrowser ? "metadata" : "none") : "auto"}
          onClick={togglePlayback}
          onLoadedData={() => setReady(true)}
          onCanPlay={() => setReady(true)}
          onWaiting={() => setReady(false)}
          onPlaying={() => setReady(true)}
          onTimeUpdate={(event) => {
            const video = event.currentTarget;
            if (video.duration) setProgress((video.currentTime / video.duration) * 100);
          }}
        />
      )}
      {shouldMountVideo && !askFirst && !ready && !slow && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-[color:var(--nc-ivory)]">
          <Loader2 size={20} strokeWidth={1.25} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
        </div>
      )}
      {playable && (
        <>
          {/* How far the film has run: a 2px ivory line along its top edge. */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[2px]" aria-hidden="true">
            <div className="h-full bg-[var(--nc-ivory)]" style={{ width: `${progress}%` }} />
          </div>
          {askFirst ? (
            <button
              type="button"
              onClick={togglePlayback}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="Play reel"
            >
              <span className="flex h-14 w-14 items-center justify-center bg-[var(--nc-ivory)] text-[color:var(--nc-ink)]">
                <Play size={20} strokeWidth={1.25} fill="currentColor" className="ml-0.5" aria-hidden="true" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={paused || !ready ? "Play reel" : "Pause reel"}
              className={`${control} absolute ${inGallery ? "bottom-3 right-[60px]" : "left-3 top-3"}`}
            >
              {paused || !ready ? <Play size={14} strokeWidth={1.25} fill="currentColor" aria-hidden="true" /> : <Pause size={14} strokeWidth={1.25} fill="currentColor" aria-hidden="true" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            aria-label={muted ? "Unmute reel" : "Mute reel"}
            className={`${control} absolute ${inGallery ? "bottom-3 right-3" : "right-3 top-3"}`}
          >
            {muted ? <VolumeX size={16} strokeWidth={1.25} aria-hidden="true" /> : <Volume2 size={16} strokeWidth={1.25} aria-hidden="true" />}
          </button>
        </>
      )}
      {reel.title && !inGallery && (
        /* The film's own title, on a solid band along its foot. */
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-[var(--nc-ink)] px-3 py-2">
          <p className="nc-small line-clamp-1 !text-[color:var(--nc-ivory)]">{reel.title}</p>
        </div>
      )}
    </div>
  );
};

/* While the reels load, and — as a button — when they could not be fetched. */
const ReelPlaceholder = ({ onRetry }: { onRetry?: () => void }) => (
  <div
    className="relative mx-4 mt-4 w-[76vw] max-w-[300px]"
    {...(onRetry ? { role: "button", tabIndex: 0, onClick: onRetry, "aria-label": "Reload the reel" } : {})}
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-[var(--nc-linen)]">
      <img src={localReelPoster} alt="Naira Flore jewellery reel preview" className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-[var(--nc-ivory)] text-[color:var(--nc-ink)]">
        <Play size={20} strokeWidth={1.25} fill="currentColor" className="ml-0.5" aria-hidden="true" />
      </span>
    </div>
    <p className="nc-small py-3">{onRetry ? "Tap to reload the reel" : "Loading the reel…"}</p>
  </div>
);

const ReelShopNext = ({ hrefFor = productHref }: { hrefFor?: HrefFor }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data, isLoading, isError, refetch } = useReels(enabled);
  const fallback = useMemo(() => (isError ? readStaleReelCache() ?? [] : []), [isError]);
  const reels = data?.length ? data : fallback;
  const { jewellery } = useLiveJewellery();
  const liveByHandle = useMemo(() => new Map(jewellery.map((product) => [product.handle, product])), [jewellery]);

  /* The small list-and-links request runs well ahead of the section; the video
     only once the section is on screen. */
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const warmup = window.setTimeout(() => setEnabled(true), 600);
    const dataObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEnabled(true);
          dataObserver.disconnect();
        }
      },
      { rootMargin: "1400px 0px" },
    );
    const videoObserver = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), {
      rootMargin: "150px 0px",
      threshold: 0.01,
    });
    dataObserver.observe(section);
    videoObserver.observe(section);
    return () => {
      window.clearTimeout(warmup);
      dataObserver.disconnect();
      videoObserver.disconnect();
    };
  }, []);

  const onScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const slides = Array.from(rail.querySelectorAll<HTMLElement>("[data-reel-slide]"));
    if (!slides.length) return;
    const railCenter = rail.scrollLeft + rail.clientWidth / 2;
    const closest = slides.reduce((best, slide, index) => {
      const center = slide.offsetLeft + slide.offsetWidth / 2;
      const bestSlide = slides[best];
      return Math.abs(center - railCenter) < Math.abs(bestSlide.offsetLeft + bestSlide.offsetWidth / 2 - railCenter) ? index : best;
    }, 0);
    setActiveIndex(closest);
  }, []);

  const goToReel = (index: number) => {
    const rail = railRef.current;
    const slide = rail?.querySelectorAll<HTMLElement>("[data-reel-slide]")[index];
    if (!rail || !slide) return;
    rail.scrollTo({ left: slide.offsetLeft - 16, behavior: "smooth" });
  };

  return (
    <section ref={sectionRef} className="pt-12 md:hidden" aria-labelledby="shop-reels-title">
      <header className="flex items-baseline justify-between gap-3 px-4">
        <h2 id="shop-reels-title" className="nc-heading min-w-0">
          Shop the reel
        </h2>
        {reels.length > 1 && (
          <p className="nc-small shrink-0 tabular-nums">
            {activeIndex + 1} / {reels.length}
          </p>
        )}
      </header>

      {!enabled || isLoading || reels.length === 0 ? (
        <ReelPlaceholder onRetry={enabled && !isLoading && reels.length === 0 ? () => void refetch() : undefined} />
      ) : (
        <>
          <div
            ref={railRef}
            onScroll={onScroll}
            className="scrollbar-hide mt-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 pr-[20%]"
            style={{ overscrollBehaviorX: "contain" }}
          >
            {reels.map((reel, index) => {
              const isActive = index === activeIndex;
              return (
                <article key={reel.id} data-reel-slide onClick={() => !isActive && goToReel(index)} className="w-[76vw] max-w-[300px] shrink-0 snap-start">
                  <ReelFrame reel={reel} active={isActive} canLoad={inView && isActive} />
                  {reel.products.length > 0 && (
                    <div className="pt-3">
                      <p className="nc-label pb-2">In this reel</p>
                      <ul className="border-b border-[color:var(--nc-rule)]">
                        {reel.products.slice(0, 3).map((product) => (
                          <ReelPiece key={product.id} product={product} live={liveByHandle.get(product.handle)} hrefFor={hrefFor} />
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
          {reels.length > 1 && (
            <nav className="mx-4 mt-4 flex items-center gap-4" aria-label="Choose reel">
              <div className="nc-segs flex-1" aria-hidden="true">
                {reels.map((reel, index) => (
                  <span key={reel.id} data-on={index === activeIndex ? "" : undefined} />
                ))}
              </div>
              <button type="button" onClick={() => goToReel((activeIndex + 1) % reels.length)} className="nc-small nc-link nc-link--ink nc-tap shrink-0">
                Next reel
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default ReelShopNext;
