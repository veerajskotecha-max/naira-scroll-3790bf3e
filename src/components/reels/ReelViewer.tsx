import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { X, Volume2, VolumeX, Play, ChevronUp, ChevronDown, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import type { Reel, ReelProduct } from "@/hooks/useReels";
import { useCart } from "@/contexts/CartContext";
import { useLiveJewellery, useLiveJewel } from "@/hooks/useLiveJewellery";

interface Props {
  reels: Reel[];
  startIndex?: number;
  onClose: () => void;
}

const parsePrice = (label?: string | null) =>
  label ? Number(label.replace(/[^\d.]/g, "")) || 0 : 0;

const PREORDER_WHATSAPP = "919561557935";

const ProductTag = ({
  product,
  soldOut,
  onClose,
}: {
  product: ReelProduct;
  soldOut: boolean;
  onClose: () => void;
}) => {
  const { addItem, setDrawerOpen, isLoading } = useCart();
  const live = useLiveJewel(product.handle);
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const productPath = `/jewellery/${product.handle}`;

  // Always leave the reel behind when we send the shopper to the product page.
  const goToProduct = () => {
    onClose();
    navigate(productPath);
  };


  const add = async () => {
    // Prefer the live Shopify variant so the add always lands on a real SKU.
    const variantId = live?.variantId || product.variant_id;
    if (!variantId) {
      toast("Choose your options", { description: "Opening the product page." });
      goToProduct();
      return;
    }
    setAdding(true);
    try {
      await addItem({
        id: product.handle,
        variantId,
        name: live?.name ?? product.title,
        price: live?.price ?? parsePrice(product.price_label),
        priceLabel: live?.priceLabel ?? product.price_label ?? "",
        currencyCode: "INR",
        image: live?.image ?? product.image_url ?? "",
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
    <div
      className="flex items-center gap-2.5 p-1.5 pr-2 backdrop-blur-md"
      style={{
        backgroundColor: "rgba(255,255,255,0.96)",
        boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
      }}
    >
      {(live?.image || product.image_url) && (
        <button type="button" onClick={goToProduct} aria-label={`View ${product.title}`} className="shrink-0">
          <img
            src={live?.image ?? product.image_url ?? ""}
            alt={product.title}
            className="h-11 w-11 object-cover"
            loading="lazy"
            decoding="async"
          />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <Link
          to={productPath}
          onClick={onClose}
          className="block truncate font-cormorant text-[14px] leading-tight"
          style={{ color: "hsl(0 0% 12%)" }}
        >
          {product.title}
        </Link>
        <span className="block truncate text-[10.5px] tracking-[0.04em]" style={{ color: "hsl(0 0% 42%)" }}>
          {soldOut
            ? `${product.price_label ?? ""}${product.price_label ? " · " : ""}Reserve today · 2 weeks delivery`
            : product.price_label}
        </span>
      </div>
      <button
        type="button"
        onClick={soldOut ? preorder : add}
        disabled={!soldOut && (adding || isLoading)}
        className="press-scale h-8 shrink-0 px-3 text-[9.5px] font-medium uppercase tracking-[0.14em] disabled:opacity-60"
        style={
          soldOut
            ? { backgroundColor: "transparent", color: "hsl(0 0% 12%)", border: "1px solid hsl(0 0% 12%)" }
            : { backgroundColor: "hsl(0 0% 12%)", color: "#fff" }
        }
      >
        {soldOut ? "Pre-order" : adding ? "Adding…" : "Add"}
      </button>
    </div>
  );
};



const ReelSlide = ({
  reel,
  active,
  muted,
  onToggleMute,
  onClose,
}: {
  reel: Reel;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
  onClose: () => void;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Live stock: a piece that has sold out in Shopify becomes a pre-order.
  const { jewellery } = useLiveJewellery();
  const soldOutHandles = useMemo(
    () => new Set(jewellery.filter((p) => p.availableForSale === false).map((p) => p.handle)),
    [jewellery],
  );




  // Only the active slide holds a loaded video — neighbours are released.
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) {
      v.muted = muted;
      void v.play().catch(() => {
        v.muted = true;
        void v.play().catch(() => undefined);
      });
    } else {
      v.pause();
      v.currentTime = 0;
      setRevealed(false);
      setExpanded(false);
    }

  }, [active, muted]);


  return (
    <div className="relative flex h-full w-full items-center justify-center snap-start" style={{ scrollSnapAlign: "start" }}>
      <div
        className="relative"
        style={{ width: "min(100%, calc(100dvh * 9 / 16))", aspectRatio: "9/16", maxHeight: "100%" }}
      >
        {active || reel.posterUrl ? (
          <video
            ref={ref}
            src={active ? reel.videoUrl : undefined}
            poster={reel.posterUrl ?? undefined}
            className="h-full w-full object-cover"
            playsInline
            loop
            preload={active ? "auto" : "none"}
            onClick={() => {
              const v = ref.current;
              if (!v) return;
              if (v.paused) {
                void v.play();
                setPaused(false);
              } else {
                v.pause();
                setPaused(true);
              }
            }}
            onTimeUpdate={(e) => {
              const v = e.currentTarget;
              if (v.duration) setProgress((v.currentTime / v.duration) * 100);
              // Shoppable cards surface near the end of the story — 20s in,
              // or a touch earlier on shorter cuts so they never miss the loop.
              const cue = Math.min(20, Math.max(4, (v.duration || 24) - 6));
              if (v.currentTime >= cue) setRevealed(true);
            }}

          />
        ) : null}

        {paused && active && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <Play size={54} fill="#fff" style={{ color: "#fff", opacity: 0.85 }} />
          </div>
        )}

        {/* progress */}
        <div className="absolute inset-x-0 top-0 h-[2px]" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>
          <div className="h-full" style={{ width: `${progress}%`, backgroundColor: "#fff" }} />
        </div>

        <button
          type="button"
          onClick={onToggleMute}
          aria-label={muted ? "Unmute" : "Mute"}
          className="absolute right-3 top-4 flex h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
        >
          {muted ? <VolumeX size={16} color="#fff" /> : <Volume2 size={16} color="#fff" />}
        </button>

        {/* Soft scrim so the shoppable cards stay legible over the footage */}
        {reel.products.length > 0 && (
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 transition-all duration-500"
            style={{
              height: expanded ? "62%" : "24%",
              opacity: revealed ? 1 : 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.66), rgba(0,0,0,0))",
            }}
          />
        )}


        <div className="absolute inset-x-0 bottom-0 p-3 pb-4">
          {reel.caption && (
            <p
              className="mb-2 font-cormorant text-[15px] transition-opacity duration-500"
              style={{
                color: "#fff",
                textShadow: "0 1px 6px rgba(0,0,0,0.6)",
                opacity: revealed ? 0 : 1,
              }}
            >
              {reel.caption}
            </p>
          )}

          {reel.products.length > 0 && (
            <div
              className="transition-all duration-500 ease-out"
              style={{
                opacity: revealed ? 1 : 0,
                transform: revealed ? "translateY(0)" : "translateY(14px)",
                pointerEvents: revealed ? "auto" : "none",
              }}
            >
              {/* Expanded stack — stays out of the way until tapped */}
              <div
                className="space-y-1.5 overflow-hidden transition-all duration-500 ease-out"
                style={{
                  maxHeight: expanded ? `${reel.products.length * 68 + 12}px` : "0px",
                  opacity: expanded ? 1 : 0,
                  marginBottom: expanded ? "8px" : "0px",
                }}
              >
                {reel.products.map((p, i) => (
                  <div
                    key={p.id}
                    className="transition-all duration-500 ease-out"
                    style={{
                      opacity: expanded ? 1 : 0,
                      transform: expanded ? "translateY(0)" : "translateY(10px)",
                      transitionDelay: `${expanded ? i * 90 : 0}ms`,
                    }}
                  >
                    <ProductTag product={p} soldOut={soldOutHandles.has(p.handle)} onClose={onClose} />
                  </div>
                ))}
              </div>

              {/* Single elegant trigger — one line, never blocks the reel */}
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="press-scale flex w-full items-center justify-center gap-2 px-4 py-2.5 backdrop-blur-md"
                style={{
                  backgroundColor: expanded ? "rgba(255,255,255,0.96)" : "rgba(20,20,20,0.72)",
                  color: expanded ? "hsl(0 0% 12%)" : "#fff",
                  boxShadow: "0 6px 24px rgba(0,0,0,0.28)",
                }}
              >
                {expanded ? (
                  <ChevronDown size={14} />
                ) : (
                  <ShoppingBag size={13} strokeWidth={1.6} />
                )}
                <span className="text-[10px] font-medium uppercase tracking-[0.22em]">
                  {expanded ? "Hide" : `Shop this reel · ${reel.products.length}`}
                </span>
              </button>
            </div>
          )}
        </div>


      </div>
    </div>
  );
};

const ReelViewer = ({ reels, startIndex = 0, onClose }: Props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(false);

  const goTo = useCallback(
    (i: number) => {
      const el = scrollRef.current;
      if (!el) return;
      const next = Math.min(Math.max(i, 0), reels.length - 1);
      el.scrollTo({ top: next * el.clientHeight, behavior: "smooth" });
      setIndex(next);
    },
    [reels.length],
  );

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        setIndex((i) => {
          goTo(i + 1);
          return i;
        });
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        setIndex((i) => {
          goTo(i - 1);
          return i;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, goTo]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el && startIndex) el.scrollTop = startIndex * el.clientHeight;
  }, [startIndex]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setIndex(Math.round(el.scrollTop / el.clientHeight));
  }, []);

  const multi = reels.length > 1;

  return createPortal(
    <div className="fixed inset-0 z-[130]" style={{ backgroundColor: "hsl(0 0% 4%)" }}>
      <button
        type="button"
        onClick={onClose}
        aria-label="Close reels"
        className="absolute left-3 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      >
        <X size={17} color="#fff" />
      </button>

      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="h-full w-full snap-y snap-mandatory overflow-y-auto scrollbar-hide"
        style={{ scrollbarWidth: "none", overscrollBehavior: "contain" }}
      >
        {reels.map((reel, i) => (
          <div key={reel.id} className="h-full w-full">
            <ReelSlide
              reel={reel}
              active={i === index}
              muted={muted}
              onToggleMute={() => setMuted((m) => !m)}
            />
          </div>
        ))}
      </div>

      {multi && (
        <>
          {/* Shift controls */}
          <div className="pointer-events-none absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Previous reel"
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            >
              <ChevronUp size={18} color="#fff" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === reels.length - 1}
              aria-label="Next reel"
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full disabled:opacity-30"
              style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
            >
              <ChevronDown size={18} color="#fff" />
            </button>
          </div>

          {/* Position dots */}
          <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-1.5">
            {reels.map((r, i) => (
              <button
                key={r.id}
                type="button"
                onClick={() => goTo(i)}
                aria-label={`Go to reel ${i + 1}`}
                className="h-6 w-[3px]"
                style={{ backgroundColor: i === index ? "#fff" : "rgba(255,255,255,0.3)" }}
              />
            ))}
          </div>

          {index === 0 && (
            <div
              className="pointer-events-none absolute inset-x-0 bottom-2 z-10 text-center text-[10px] uppercase tracking-[0.18em]"
              style={{ color: "rgba(255,255,255,0.7)" }}
            >
              Swipe up for more
            </div>
          )}
        </>
      )}
    </div>,
    document.body,
  );
};

export default ReelViewer;
