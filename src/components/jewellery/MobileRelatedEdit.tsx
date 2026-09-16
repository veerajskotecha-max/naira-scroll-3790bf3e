import { useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { JewelPiece } from "@/data/jewellery";
import { shopifyImage } from "@/lib/shopifyImage";
import floralBg from "@/assets/floral-pattern-bg.webp";

/** Gentle scroll-linked drift for the floral overlays (writes a CSS var, no re-renders). */
const useScrollDrift = (ref: React.RefObject<HTMLElement>) => {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // -1 (section below viewport) → 1 (section above viewport)
      const progress = Math.max(-1, Math.min(1, (vh / 2 - (rect.top + rect.height / 2)) / vh));
      el.style.setProperty("--nf-drift", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ref]);
};

const sidePetals = [
  { side: "left", top: "6%", w: 96, op: 0.3, rot: -24, color: "#E5B9A4", depth: 34, sway: 10, dur: "13s" },
  { side: "left", top: "48%", w: 70, op: 0.24, rot: 14, color: "#AEBDB6", depth: -26, sway: -8, dur: "17s" },
  { side: "right", top: "18%", w: 84, op: 0.28, rot: 22, color: "#AEBDB6", depth: -30, sway: 9, dur: "15s" },
  { side: "right", top: "66%", w: 110, op: 0.26, rot: -12, color: "#E5B9A4", depth: 40, sway: -11, dur: "19s" },
] as const;

type MobileRelatedEditProps = {
  current: JewelPiece;
  jewellery: JewelPiece[];
};

const ProductCopy = ({ piece, align = "left" }: { piece: JewelPiece; align?: "left" | "right" }) => (
  <div className={`min-w-0 pt-2 ${align === "right" ? "text-right" : "text-left"}`}>
    <p className="truncate font-cormorant text-[14px] leading-none text-foreground">{piece.name}</p>
    <p className="mt-1 font-sans text-[9px] uppercase tracking-nf-10 text-muted-foreground">
      {piece.availableForSale === false ? "Pre-order" : piece.priceLabel}
    </p>
  </div>
);

const ProductImage = ({ piece, sizes }: { piece: JewelPiece; sizes: string }) => (
  <img
    src={shopifyImage(piece.image, 640)}
    alt={piece.name}
    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
    loading="lazy"
    decoding="async"
    sizes={sizes}
  />
);

const MobileRelatedEdit = ({ current, jewellery }: MobileRelatedEditProps) => {
  const recommendations = useMemo(() => {
    const candidates = jewellery.filter((piece) => piece.handle !== current.handle && piece.image);
    const sameCategory = candidates.filter((piece) => piece.category === current.category);
    const otherCategories = candidates.filter((piece) => piece.category !== current.category);
    return [...sameCategory, ...otherCategories].slice(0, 5);
  }, [current.category, current.handle, jewellery]);

  const sectionRef = useRef<HTMLElement>(null);
  useScrollDrift(sectionRef);

  if (recommendations.length < 5) return null;

  const [anchor, high, overlap, wide, tucked] = recommendations;

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-b border-border bg-background px-4 py-12 md:hidden"
      aria-labelledby="mobile-related-title"
      style={{ ["--nf-drift" as string]: 0 }}
    >
      <style>{`
        @keyframes nf-petal-sway {
          0%, 100% { transform: translate3d(0,0,0) rotate(var(--nf-rot)); }
          50% { transform: translate3d(var(--nf-sway), -6px, 0) rotate(calc(var(--nf-rot) + 6deg)); }
        }
        @media (prefers-reduced-motion: reduce) {
          .nf-related-petal, .nf-related-wash { animation: none !important; }
        }
      `}</style>

      {/* hero floral wash, drifting gently with scroll */}
      <div
        className="nf-related-wash pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-multiply"
        aria-hidden
        style={{
          backgroundImage: `url(${floralBg})`,
          backgroundSize: "150% auto",
          transform: "translate3d(0, calc(var(--nf-drift) * -26px), 0)",
          willChange: "transform",
        }}
      />
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(90%_55%_at_50%_0%,#FFF1E6_0%,transparent_60%),radial-gradient(70%_50%_at_100%_100%,#E5B9A4_0%,transparent_55%)] opacity-60" />

      {/* side petals — float on scroll */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {sidePetals.map((p, i) => (
          <div
            key={i}
            className="absolute"
            style={{
              top: p.top,
              [p.side]: "-18px",
              transform: `translate3d(0, calc(var(--nf-drift) * ${p.depth}px), 0)`,
              willChange: "transform",
            }}
          >
            <svg
              className="nf-related-petal block"
              viewBox="0 0 100 34"
              width={p.w}
              height={p.w * 0.34}
              style={{
                opacity: p.op,
                ["--nf-rot" as string]: `${p.rot}deg`,
                ["--nf-sway" as string]: `${p.sway}px`,
                animation: `nf-petal-sway ${p.dur} ease-in-out ${i * 0.7}s infinite`,
              }}
            >
              <path d="M2,17 C18,2 70,2 98,17 C70,32 18,32 2,17 Z" fill={p.color} />
            </svg>
          </div>
        ))}
      </div>

      <header className="relative mb-8 flex flex-col items-center text-center">
        <p className="font-sans text-[9px] font-medium uppercase tracking-nf-15 text-primary">Curated for you</p>
        <h2 id="mobile-related-title" className="mt-2 font-cormorant text-[32px] italic leading-none text-foreground">
          You May Also Like
        </h2>
      </header>

      <div className="relative mx-auto grid max-w-[390px] grid-cols-12 gap-3">
        <Link to={`/jewellery/${anchor.handle}`} className="group relative col-span-8 row-span-2 block pb-5">
          <div className="aspect-square overflow-hidden bg-muted">
            <ProductImage piece={anchor} sizes="67vw" />
          </div>
          <div className="absolute bottom-0 -left-1 max-w-[90%] border border-border bg-background px-2.5 py-2 shadow-sm">
            <ProductCopy piece={anchor} />
          </div>
        </Link>

        <Link to={`/jewellery/${high.handle}`} className="group col-span-4 mt-7 block">
          <div className="aspect-square overflow-hidden bg-muted">
            <ProductImage piece={high} sizes="33vw" />
          </div>
          <ProductCopy piece={high} />
        </Link>

        <Link to={`/jewellery/${overlap.handle}`} className="group relative z-10 col-span-5 -mt-7 block">
          <div className="aspect-square overflow-hidden border-4 border-background bg-muted shadow-md">
            <ProductImage piece={overlap} sizes="42vw" />
          </div>
          <ProductCopy piece={overlap} align="right" />
        </Link>

        <Link to={`/jewellery/${wide.handle}`} className="group relative z-10 col-span-7 mt-1 block">
          <div className="aspect-square overflow-hidden bg-muted">
            <ProductImage piece={wide} sizes="58vw" />
          </div>
          {wide.availableForSale === false && (
            <span className="absolute right-2 top-2 bg-foreground px-2 py-1 font-sans text-[8px] uppercase tracking-nf-10 text-background">
              Pre-order
            </span>
          )}
          <div className="relative bg-background pr-2">
            <ProductCopy piece={wide} />
          </div>
        </Link>

        <Link to={`/jewellery/${tucked.handle}`} className="group relative col-start-7 col-span-6 -mt-3 block">
          <div className="aspect-square overflow-hidden border-4 border-background bg-muted shadow-md">
            <ProductImage piece={tucked} sizes="50vw" />
          </div>
          <ProductCopy piece={tucked} />
        </Link>
      </div>

      <div className="relative mt-10 flex justify-center">
        <Button asChild variant="outline" className="h-11 border-foreground px-8 font-sans text-[9px] uppercase tracking-nf-15">
          <Link to="/jewellery">
            Explore all <ArrowUpRight size={13} />
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default MobileRelatedEdit;