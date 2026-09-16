import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Pause, Play, ShoppingBag, Volume2, VolumeX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { isAdjustableRing } from "@/data/ringFit";
import type { JewelPiece } from "@/data/jewellery";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { useReels, type Reel, type ReelProduct } from "@/hooks/useReels";
import { shopifyImage } from "@/lib/shopifyImage";

const PREORDER_WHATSAPP = "919561557935";

const parsePrice = (label?: string | null) =>
  label ? Number(label.replace(/[^\d.]/g, "")) || 0 : 0;

const MobileProductCard = ({ product, live }: { product: ReelProduct; live?: JewelPiece }) => {
  const { addItem, setDrawerOpen, isLoading } = useCart();
  const [adding, setAdding] = useState(false);
  const soldOut = live?.availableForSale === false && !isAdjustableRing(product.handle);
  const image = live?.image ?? product.image_url ?? "";
  const price = live?.priceLabel ?? product.price_label ?? "";

  const add = async () => {
    const variantId = live?.variantId || product.variant_id;
    if (!variantId) {
      toast("Choose your options", { description: "Opening the product page." });
      window.location.assign(`/jewellery/${product.handle}`);
      return;
    }
    setAdding(true);
    try {
      await addItem({
        id: product.handle,
        variantId,
        name: live?.name ?? product.title,
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

  const preorder = () => {
    const message = encodeURIComponent(
      `Hello Naira — I'd like to pre-order the ${product.title}. Please reserve one for me.`,
    );
    window.open(`https://wa.me/${PREORDER_WHATSAPP}?text=${message}`, "_blank", "noopener");
  };

  return (
    <article className="flex min-w-0 flex-col border-r border-border last:border-r-0">
      <Link to={`/jewellery/${product.handle}`} className="block aspect-square overflow-hidden bg-muted">
        {image && (
          <img
            src={shopifyImage(image, 240)}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </Link>
      <div className="flex min-h-[92px] flex-1 flex-col px-1.5 pb-1.5 pt-2">
        <Link
          to={`/jewellery/${product.handle}`}
          className="line-clamp-2 min-h-[26px] font-cormorant text-[12px] leading-[1.12] text-foreground"
        >
          {product.title}
        </Link>
        <p className="mt-0.5 truncate font-sans text-[8px] tracking-nf-10 text-muted-foreground">
          {soldOut ? "Pre-order" : price}
        </p>
        <Button
          type="button"
          variant={soldOut ? "outline" : "default"}
          size="sm"
          onClick={soldOut ? preorder : add}
          disabled={!soldOut && (adding || isLoading)}
          className="mt-auto h-7 w-full px-1 font-sans text-[7px] uppercase tracking-nf-10"
        >
          {soldOut ? "Reserve" : adding ? "Adding…" : "Add"}
        </Button>
      </div>
    </article>
  );
};

const ReelFrame = ({
  reel,
  active,
  canLoad,
}: {
  reel: Reel;
  active: boolean;
  /** Only the reel actually on screen downloads video — everything else stays a poster. */
  canLoad: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      return;
    }
    video.muted = muted;
    void video.play().then(() => setPaused(false)).catch(() => undefined);
  }, [active, canLoad, muted]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().then(() => setPaused(false));
    else {
      video.pause();
      setPaused(true);
    }
  };

  return (
    <div className="relative aspect-[4/5] overflow-hidden bg-foreground">
      {/* Poster stays painted underneath, so the frame is never blank while the
          video streams in — and it doubles as the placeholder for inactive reels. */}
      {reel.posterUrl && (
        <img
          src={reel.posterUrl}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      )}
      {canLoad && (
        <video
          ref={videoRef}
          src={reel.videoUrl}
          poster={reel.posterUrl ?? undefined}
          className={`relative h-full w-full object-cover transition-opacity duration-500 ${
            ready ? "opacity-100" : "opacity-0"
          }`}
          playsInline
          loop
          muted={muted}
          preload="auto"
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
      {/* Soft shimmer + spinner over the poster until the first frame can play. */}
      {canLoad && !ready && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-foreground/25 backdrop-blur-[1px]">
          <span className="absolute inset-0 animate-pulse bg-gradient-to-br from-background/10 via-transparent to-background/10" />
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-background/40 border-t-background" />
        </div>
      )}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-background/30">
        <div className="h-full bg-background transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>
      <button
        type="button"
        onClick={togglePlayback}
        aria-label={paused ? "Play reel" : "Pause reel"}
        className="absolute left-2 top-2 flex h-7 w-7 items-center justify-center bg-foreground/45 text-background transition-colors hover:bg-foreground/65"
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
      </button>
      <button
        type="button"
        onClick={() => setMuted((value) => !value)}
        aria-label={muted ? "Unmute reel" : "Mute reel"}
        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center bg-foreground/45 text-background transition-colors hover:bg-foreground/65"
      >
        {muted ? <VolumeX size={12} /> : <Volume2 size={12} />}
      </button>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/75 to-transparent px-3 pb-3 pt-10 text-background">
        <p className="font-sans text-[7px] font-medium uppercase tracking-nf-15 opacity-80">Shop the reel</p>
        {reel.title && <p className="mt-0.5 line-clamp-1 font-cormorant text-[15px] leading-tight">{reel.title}</p>}
      </div>
    </div>
  );
};


const MobileReelShop = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [inView, setInView] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: reels = [], isLoading } = useReels(enabled);
  const { jewellery } = useLiveJewellery();
  const liveByHandle = useMemo(
    () => new Map(jewellery.map((product) => [product.handle, product])),
    [jewellery],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    /* Two stages so the reel starts instantly without costing the product page
       anything up front: the tiny metadata/signed-URL fetch runs well ahead of
       the section, the multi-megabyte video only once it is actually on screen. */
    const dataObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEnabled(true);
          dataObserver.disconnect();
        }
      },
      { rootMargin: "1400px 0px" },
    );
    const videoObserver = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "150px 0px", threshold: 0.01 },
    );
    dataObserver.observe(section);
    videoObserver.observe(section);
    return () => {
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
    const closestIndex = slides.reduce((closest, slide, index) => {
      const center = slide.offsetLeft + slide.offsetWidth / 2;
      const closestSlide = slides[closest];
      const closestCenter = closestSlide.offsetLeft + closestSlide.offsetWidth / 2;
      return Math.abs(center - railCenter) < Math.abs(closestCenter - railCenter) ? index : closest;
    }, 0);
    setActiveIndex(closestIndex);
  }, []);

  const goToReel = (index: number) => {
    const rail = railRef.current;
    const slide = rail?.querySelectorAll<HTMLElement>("[data-reel-slide]")[index];
    if (!rail || !slide) return;
    rail.scrollTo({ left: slide.offsetLeft - 16, behavior: "smooth" });
  };

  if (enabled && !isLoading && reels.length === 0) return null;

  return (
    <section ref={sectionRef} className="border-b border-border bg-secondary/45 py-8 md:hidden" aria-labelledby="shop-reels-title">
      <header className="flex items-end justify-between gap-3 px-4">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-primary">
            <ShoppingBag size={11} strokeWidth={1.5} />
            <p className="font-sans text-[8px] font-medium uppercase tracking-nf-15">Seen on Naira</p>
          </div>
          <h2 id="shop-reels-title" className="mt-1 font-cormorant text-[24px] italic leading-none text-foreground">
            Shop the Reel
          </h2>
        </div>
        {reels.length > 1 && (
          <p className="shrink-0 font-sans text-[9px] font-medium tabular-nums tracking-nf-10 text-muted-foreground">
            {String(activeIndex + 1).padStart(2, "0")} / {String(reels.length).padStart(2, "0")}
          </p>
        )}
      </header>

      {!enabled || isLoading ? (
        <div className="mx-4 mt-5 aspect-[4/5] max-w-[236px] animate-pulse bg-muted" aria-hidden="true" />
      ) : (
        <>
          <div
            ref={railRef}
            onScroll={onScroll}
            className="scrollbar-hide mt-5 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 pr-[28%]"
            style={{ overscrollBehaviorX: "contain" }}
          >
            {reels.map((reel, index) => {
              const isActive = index === activeIndex;
              return (
                <article
                  key={reel.id}
                  data-reel-slide
                  onClick={() => !isActive && goToReel(index)}
                  className={`w-[60vw] max-w-[236px] shrink-0 snap-start border border-border bg-background transition-all duration-300 ${
                    isActive ? "opacity-100 shadow-sm" : "opacity-60"
                  }`}
                >
                  {/* Only the reel on screen streams; the rest stay posters, so a
                      swipe reveals a poster first, then plays. */}
                  <ReelFrame
                    reel={reel}
                    active={isActive}
                    canLoad={inView && isActive}
                  />
                  <div className={`grid ${reel.products.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {reel.products.slice(0, 3).map((product) => (
                      <MobileProductCard key={product.id} product={product} live={liveByHandle.get(product.handle)} />
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
          {reels.length > 1 && (
            <nav className="mx-4 mt-4 flex items-center gap-3" aria-label="Choose reel">
              <div className="flex h-5 flex-1 items-center gap-1" aria-hidden="true">
                {reels.map((reel, index) => (
                  <span
                    key={reel.id}
                    className={`h-[2px] flex-1 transition-colors duration-300 ${index <= activeIndex ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => goToReel((activeIndex + 1) % reels.length)}
                className="h-7 shrink-0 gap-1 px-2 font-sans text-[8px] uppercase tracking-nf-10"
              >
                Next reel <ChevronRight size={11} />
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default MobileReelShop;