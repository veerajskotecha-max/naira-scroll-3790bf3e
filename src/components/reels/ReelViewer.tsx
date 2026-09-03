import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { X, Volume2, VolumeX, Play, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { Reel, ReelProduct } from "@/hooks/useReels";
import { useCart } from "@/contexts/CartContext";

interface Props {
  reels: Reel[];
  startIndex?: number;
  onClose: () => void;
}

const parsePrice = (label?: string | null) =>
  label ? Number(label.replace(/[^\d.]/g, "")) || 0 : 0;

const ProductTag = ({ product }: { product: ReelProduct }) => {
  const { addItem, setDrawerOpen, isLoading } = useCart();
  const [adding, setAdding] = useState(false);

  const add = async () => {
    if (!product.variant_id) {
      toast("Opening product", { description: "Pick your options on the product page." });
      return;
    }
    setAdding(true);
    try {
      await addItem({
        id: product.handle,
        variantId: product.variant_id,
        name: product.title,
        price: parsePrice(product.price_label),
        priceLabel: product.price_label ?? "",
        currencyCode: "INR",
        image: product.image_url ?? "",
      });
      setDrawerOpen(true);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-2 backdrop-blur-sm"
      style={{ backgroundColor: "rgba(255,255,255,0.94)" }}
    >
      {product.image_url && (
        <img
          src={product.image_url}
          alt={product.title}
          className="h-12 w-12 shrink-0 object-cover"
          loading="lazy"
          decoding="async"
        />
      )}
      <div className="min-w-0 flex-1">
        <Link
          to={`/jewellery/${product.handle}`}
          className="block truncate font-cormorant text-[14px] leading-tight"
          style={{ color: "hsl(0 0% 12%)" }}
        >
          {product.title}
        </Link>
        {product.price_label && (
          <span className="text-[11px]" style={{ color: "hsl(0 0% 40%)" }}>
            {product.price_label}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={add}
        disabled={adding || isLoading}
        className="press-scale h-9 shrink-0 px-3 text-[10px] font-medium uppercase tracking-[0.12em] disabled:opacity-60"
        style={{ backgroundColor: "hsl(0 0% 12%)", color: "#fff" }}
      >
        {adding ? "Adding…" : "Add"}
      </button>
    </div>
  );
};

const ReelSlide = ({
  reel,
  active,
  muted,
  onToggleMute,
}: {
  reel: Reel;
  active: boolean;
  muted: boolean;
  onToggleMute: () => void;
}) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealed, setRevealed] = useState(false);


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

        <div className="absolute inset-x-0 bottom-0 space-y-2 p-3">
          {reel.caption && (
            <p className="font-cormorant text-[15px]" style={{ color: "#fff", textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
              {reel.caption}
            </p>
          )}
          {reel.products.map((p) => (
            <ProductTag key={p.id} product={p} />
          ))}
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
