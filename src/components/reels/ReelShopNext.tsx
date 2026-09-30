import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import { isAdjustableRing } from "@/data/ringFit";
import type { JewelPiece } from "@/data/jewellery";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { readStaleReelCache, useReels, type Reel, type ReelProduct } from "@/hooks/useReels";
import { shopifyImage } from "@/lib/shopifyImage";
import { reelCover } from "@/lib/reelCovers";
import localReelPoster from "@/assets/reel-fallback.webp";

/*
  "Shop the reel" for the redesigned product page.

  The live section (MobileReelShop.tsx) squeezed three product cards under each
  video, with 7–8px lettering, navy Add buttons and slate text from the stock
  palette. Here the pieces in a reel are a list under it — photo, name, price
  and a deep-sage Add — on Naira's ivory, with round ivory controls on the
  video and a gold progress line.

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
  const soldOut = live?.availableForSale === false && !isAdjustableRing(product.handle);
  const image = live?.image ?? product.image_url ?? "";
  const price = live?.priceLabel ?? product.price_label ?? "";
  const name = live?.name ?? product.title;
  const href = hrefFor(product.handle);
  // On this piece's own page the row names it rather than linking to itself.
  const here = useLocation().pathname === href;

  const add = async () => {
    const variantId = live?.variantId || product.variant_id;
    if (!variantId) {
      toast("Choose your options", { description: "Opening the product page." });
      window.location.assign(href);
      return;
    }
    setAdding(true);
    try {
      await addItem({
        id: product.handle,
        variantId,
        name,
        price: live?.price ?? parsePrice(product.price_label),
        priceLabel: price,
        currencyCode: "INR",
        image,
      });
      setDrawerOpen(true);
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

  return (
    <li className="flex items-center gap-3 py-2.5">
      {here ? (
        <span className="block h-12 w-12 shrink-0 overflow-hidden bg-nf-ivory-deep">{thumb}</span>
      ) : (
        <Link to={href} className="block h-12 w-12 shrink-0 overflow-hidden bg-nf-ivory-deep">
          {thumb}
        </Link>
      )}
      <div className="min-w-0 flex-1">
        {here ? (
          <span className="block truncate font-cormorant text-[15px] leading-tight text-nf-ink">{name}</span>
        ) : (
          <Link to={href} className="block truncate font-cormorant text-[15px] leading-tight text-nf-ink">
            {name}
          </Link>
        )}
        <p className="mt-0.5 text-[12px] text-nf-ink/70">
          {soldOut ? "Pre-order" : price}
          {here && <span className="text-nf-gold-text"> · this piece</span>}
        </p>
      </div>
      {soldOut ? (
        <button
          type="button"
          onClick={reserve}
          className="press-scale h-9 shrink-0 border border-nf-ink/25 px-3.5 font-nf-label text-[10.5px] uppercase tracking-nf-16 text-nf-ink"
        >
          Reserve
        </button>
      ) : (
        <button
          type="button"
          onClick={add}
          disabled={adding || isLoading}
          className="press-scale h-8 shrink-0 border border-[var(--nf-cta)] px-3.5 font-nf-label text-[9.5px] uppercase tracking-nf-16 text-[var(--nf-cta)] transition-colors hover:bg-[var(--nf-cta)] hover:text-nf-ivory disabled:opacity-60"
          aria-label={`Add ${name} to bag`}
        >
          {adding ? "Adding…" : "Add"}
        </button>
      )}
    </li>
  );
};

/* Square, like every corner on the site. */
const control =
  "flex h-9 w-9 items-center justify-center bg-nf-ivory/85 text-nf-ink shadow-[0_2px_10px_-4px_rgb(var(--nf-ink-rgb)/0.5)] backdrop-blur-sm transition-colors hover:bg-nf-ivory";

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
  /* In the photo gallery the page's back and wishlist buttons hold the top
     corners and the counter the bottom-left: controls go bottom-right. */
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

  useEffect(
    () => () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  /* Supabase serves the reels as application/octet-stream, which Safari and
     the Instagram webview refuse; the same bytes relabelled as video/mp4 play
     (see MobileReelShop.tsx). */
  const recoverFromMimeError = useCallback(async () => {
    if (recoveryTriedRef.current || !reel.videoUrl) return;
    recoveryTriedRef.current = true;
    try {
      const response = await fetch(reel.videoUrl);
      if (!response.ok) throw new Error(`video fetch ${response.status}`);
      const url = URL.createObjectURL(new Blob([await response.blob()], { type: "video/mp4" }));
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
    <div className={`relative overflow-hidden bg-nf-ink ${frameClassName}`}>
      <img
        src={stillUrl}
        alt={reel.title ?? "Naira Flore reel"}
        className="absolute inset-0 h-full w-full object-cover"
        loading={active ? "eager" : "lazy"}
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
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-7 w-7 animate-spin border-2 border-nf-ivory/40 border-t-nf-ivory" style={{ borderRadius: "50%" }} />
        </div>
      )}
      {playable && (
        <>
          <div className={`absolute inset-x-3 h-[2px] bg-nf-ivory/30 ${inGallery ? "bottom-2" : "top-3"}`}>
            <div className="h-full bg-nf-ivory transition-[width] duration-150" style={{ width: `${progress}%` }} />
          </div>
          {askFirst ? (
            <button
              type="button"
              onClick={togglePlayback}
              className="absolute inset-0 flex items-center justify-center"
              aria-label="Play reel"
            >
              <span className="flex h-14 w-14 items-center justify-center bg-nf-ivory/90 text-nf-ink shadow-[0_6px_24px_-8px_rgb(var(--nf-ink-rgb)/0.6)]">
                <Play size={20} fill="currentColor" className="ml-0.5" />
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={togglePlayback}
              aria-label={paused || !ready ? "Play reel" : "Pause reel"}
              className={`${control} absolute ${inGallery ? "bottom-5 right-14" : "left-3 top-5"}`}
            >
              {paused || !ready ? <Play size={13} fill="currentColor" /> : <Pause size={13} fill="currentColor" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => setMuted((value) => !value)}
            aria-label={muted ? "Unmute reel" : "Mute reel"}
            className={`${control} absolute ${inGallery ? "bottom-5 right-3" : "right-3 top-5"}`}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </>
      )}
      {reel.title && !inGallery && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-nf-ink/70 to-transparent px-4 pb-3.5 pt-12">
          <p className="line-clamp-1 font-cormorant text-[17px] leading-tight text-nf-ivory">{reel.title}</p>
        </div>
      )}
    </div>
  );
};

/* While the reels load, and — as a button — when they could not be fetched. */
const ReelPlaceholder = ({ onRetry }: { onRetry?: () => void }) => (
  <div
    className="relative mx-4 mt-5 w-[76vw] max-w-[300px] border border-nf-gold/25 bg-nf-ivory"
    {...(onRetry ? { role: "button", tabIndex: 0, onClick: onRetry, "aria-label": "Reload the reel" } : {})}
  >
    <div className="relative aspect-[4/5] overflow-hidden bg-nf-ivory-deep">
      <img src={localReelPoster} alt="Naira Flore jewellery reel preview" className="absolute inset-0 h-full w-full object-cover" loading="eager" decoding="async" />
      <span className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-nf-ivory/90 text-nf-ink">
        <Play size={20} fill="currentColor" className="ml-0.5" />
      </span>
    </div>
    <p className="px-4 py-3 text-[12px] text-nf-ink/70">{onRetry ? "Tap to reload the reel" : "Loading the reel…"}</p>
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
    <section ref={sectionRef} className="border-y border-nf-gold/25 bg-nf-ivory-deep py-10 md:hidden" aria-labelledby="shop-reels-title">
      <header className="flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          <p className="font-nf-label text-[10px] uppercase tracking-nf-24 text-nf-gold-text">Seen on Naira</p>
          <h2 id="shop-reels-title" className="mt-1.5 font-cormorant text-[26px] leading-none text-nf-ink">
            Shop the reel
          </h2>
        </div>
        {reels.length > 1 && (
          <p className="shrink-0 font-nf-label text-[11px] tabular-nums tracking-nf-8 text-nf-ink/70">
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
            className="scrollbar-hide mt-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 pr-[20%]"
            style={{ overscrollBehaviorX: "contain" }}
          >
            {reels.map((reel, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={reel.id}
                  data-reel-slide
                  onClick={() => !isActive && goToReel(index)}
                  className={`w-[76vw] max-w-[300px] shrink-0 snap-start border border-nf-gold/25 bg-nf-ivory transition-opacity duration-300 ${
                    isActive ? "opacity-100 shadow-[0_18px_40px_-28px_rgb(var(--nf-ink-rgb)/0.55)]" : "opacity-75"
                  }`}
                >
                  <ReelFrame reel={reel} active={isActive} canLoad={inView && isActive} />
                  {reel.products.length > 0 && (
                    <div className="px-3.5 pb-1 pt-2">
                      <p className="pt-1 font-nf-label text-[9.5px] uppercase tracking-nf-24 text-nf-gold-text">In this reel</p>
                      <ul className="divide-y divide-nf-gold/20">
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
            <nav className="mx-4 mt-5 flex items-center gap-4" aria-label="Choose reel">
              <div className="flex h-5 flex-1 items-center gap-1.5" aria-hidden="true">
                {reels.map((reel, index) => (
                  <span
                    key={reel.id}
                    className={`h-[2px] flex-1 transition-colors duration-300 ${index <= activeIndex ? "bg-nf-gold" : "bg-nf-ink/15"}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => goToReel((activeIndex + 1) % reels.length)}
                className="inline-flex min-h-[40px] shrink-0 items-center gap-1 font-nf-label text-[11px] uppercase tracking-nf-16 text-nf-gold-text"
              >
                Next reel <ChevronRight size={13} />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default ReelShopNext;
