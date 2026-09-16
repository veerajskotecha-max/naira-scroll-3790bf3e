import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Pause, Play, ShoppingBag, Volume2, VolumeX } from "lucide-react";
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
            src={shopifyImage(image, 320)}
            alt={product.title}
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
          />
        )}
      </Link>
      <div className="flex min-h-[132px] flex-1 flex-col px-2 pb-2 pt-2.5">
        <Link
          to={`/jewellery/${product.handle}`}
          className="line-clamp-2 min-h-9 font-cormorant text-[15px] leading-[1.15] text-foreground"
        >
          {product.title}
        </Link>
        <p className="mt-1 truncate font-sans text-[10px] text-muted-foreground">
          {soldOut ? "Pre-order · 2 weeks" : price}
        </p>
        <Button
          type="button"
          variant={soldOut ? "outline" : "default"}
          size="sm"
          onClick={soldOut ? preorder : add}
          disabled={!soldOut && (adding || isLoading)}
          className="mt-auto h-8 w-full px-1 font-sans text-[8px] uppercase tracking-nf-10"
        >
          {soldOut ? "Reserve" : adding ? "Adding…" : "Add"}
        </Button>
      </div>
    </article>
  );
};

const ReelFrame = ({ reel, active }: { reel: Reel; active: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!active) {
      video.pause();
      return;
    }
    video.muted = muted;
    void video.play().then(() => setPaused(false)).catch(() => undefined);
  }, [active, muted]);

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
    <div className="relative aspect-[9/16] overflow-hidden bg-foreground">
      <video
        ref={videoRef}
        src={active ? reel.videoUrl : undefined}
        poster={reel.posterUrl ?? undefined}
        className="h-full w-full object-cover"
        playsInline
        loop
        muted={muted}
        preload={active ? "metadata" : "none"}
        onClick={togglePlayback}
        onTimeUpdate={(event) => {
          const video = event.currentTarget;
          if (video.duration) setProgress((video.currentTime / video.duration) * 100);
        }}
      />
      <div className="absolute inset-x-0 top-0 h-0.5 bg-background/30">
        <div className="h-full bg-background" style={{ width: `${progress}%` }} />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={togglePlayback}
        aria-label={paused ? "Play reel" : "Pause reel"}
        className="absolute left-3 top-3 bg-foreground/45 text-background hover:bg-foreground/65 hover:text-background"
      >
        {paused ? <Play /> : <Pause />}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setMuted((value) => !value)}
        aria-label={muted ? "Unmute reel" : "Mute reel"}
        className="absolute right-3 top-3 bg-foreground/45 text-background hover:bg-foreground/65 hover:text-background"
      >
        {muted ? <VolumeX /> : <Volume2 />}
      </Button>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-foreground/70 to-transparent px-4 pb-4 pt-16 text-background">
        <p className="font-sans text-[9px] font-medium uppercase tracking-nf-15">Shop the reel</p>
        {reel.title && <p className="mt-1 font-cormorant text-[21px] leading-tight">{reel.title}</p>}
      </div>
    </div>
  );
};

const MobileReelShop = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
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
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setEnabled(true);
          observer.disconnect();
        }
      },
      { rootMargin: "600px 0px" },
    );
    observer.observe(section);
    return () => observer.disconnect();
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
    <section ref={sectionRef} className="border-b border-border bg-secondary/45 py-12 md:hidden" aria-labelledby="shop-reels-title">
      <header className="px-4 text-center">
        <div className="mx-auto mb-3 flex w-max items-center gap-2 text-primary">
          <ShoppingBag size={13} strokeWidth={1.5} />
          <p className="font-sans text-[9px] font-medium uppercase tracking-nf-15">Seen on Naira</p>
        </div>
        <h2 id="shop-reels-title" className="font-cormorant text-[32px] italic leading-none text-foreground">Shop the Reel</h2>
        <p className="mt-3 font-sans text-[10px] uppercase tracking-nf-10 text-muted-foreground">Swipe through {Math.max(reels.length, 2)} shoppable reels</p>
      </header>

      {!enabled || isLoading ? (
        <div className="mx-4 mt-7 aspect-[9/16] animate-pulse bg-muted" aria-hidden="true" />
      ) : (
        <>
          <div
            ref={railRef}
            onScroll={onScroll}
            className="scrollbar-hide mt-7 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pr-[15%]"
            style={{ overscrollBehaviorX: "contain" }}
          >
            {reels.map((reel, index) => (
              <article key={reel.id} data-reel-slide className="w-[86vw] max-w-[338px] shrink-0 snap-start">
                <ReelFrame reel={reel} active={index === activeIndex} />
                <div className={`grid border-x border-b border-border bg-background ${reel.products.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {reel.products.slice(0, 3).map((product) => (
                    <MobileProductCard key={product.id} product={product} live={liveByHandle.get(product.handle)} />
                  ))}
                </div>
              </article>
            ))}
          </div>
          {reels.length > 1 && (
            <nav className="mx-4 mt-5 flex items-center gap-3" aria-label="Choose reel">
              <p className="w-11 shrink-0 font-sans text-[10px] font-medium tabular-nums text-foreground">
                {String(activeIndex + 1).padStart(2, "0")} / {String(reels.length).padStart(2, "0")}
              </p>
              <div className="flex h-7 flex-1 items-center gap-1" aria-hidden="true">
                {reels.map((reel, index) => (
                  <span
                    key={reel.id}
                    className={`h-1 flex-1 transition-colors duration-300 ${index <= activeIndex ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={() => goToReel((activeIndex + 1) % reels.length)}
                className="h-8 shrink-0 px-2 font-sans text-[9px] uppercase tracking-nf-10"
              >
                Next reel
              </Button>
            </nav>
          )}
        </>
      )}
    </section>
  );
};

export default MobileReelShop;