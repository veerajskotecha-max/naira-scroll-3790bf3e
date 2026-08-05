import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { productFromShopify } from "@/components/ProductCard";
import { fetchShopifyProducts } from "@/lib/shopify";

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────────────────────────────────────────
   THE FLORE EDIT — a 3D "scroll to surf" deck of Indo-Western pieces.
   Cards ride a perspective track from right to left as the section is
   pinned; the piece passing the focus zone zooms forward, straightens
   and reveals its name, so the collection is read one piece at a time.
   Reduced motion: the deck falls back to a plain horizontal scroller.
   ─────────────────────────────────────────────────────────────── */

const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const IndoWesternCarousel = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const { data: shopifyProducts = [] } = useQuery({
    queryKey: ["shopify-products", "flore-edit"],
    queryFn: () => fetchShopifyProducts(12),
    staleTime: 1000 * 60 * 5,
  });

  const pieces = useMemo(() => {
    const pool = shopifyProducts.map(productFromShopify);
    return [...pool].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [shopifyProducts]);

  useGSAP(
    () => {
      const root = rootRef.current;
      const pin = pinRef.current;
      const track = trackRef.current;
      if (!root || !pin || !track || pieces.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", track);
        if (!cards.length) return;

        const layout = () => {
          const vw = window.innerWidth;
          const step = cards[0].offsetWidth * (vw < 700 ? 0.46 : 0.42);
          const focus = vw < 700 ? vw * 0.42 : vw * 0.36;
          return { step, focus };
        };

        let { step, focus } = layout();

        cards.forEach((card, i) => {
          gsap.set(card, { position: "absolute", top: "50%", left: 0, xPercent: -50, yPercent: -50, zIndex: cards.length - i });
        });

        const place = (progress: number) => {
          const vw = window.innerWidth;
          const travel = step * (cards.length - 1) + vw * 0.9;
          const head = vw * 1.05 - travel * progress;

          cards.forEach((card, i) => {
            const x = head + i * step;
            const d = (x - focus) / step; // distance from the focus zone, in card steps
            const near = Math.max(0, 1 - Math.abs(d) / 1.25);
            gsap.set(card, {
              x,
              rotationY: -26 + near * 24,
              rotationZ: -2.5 + near * 2.5,
              scale: 0.78 + near * 0.3,
              opacity: gsap.utils.clamp(0, 1, 1 - Math.max(0, Math.abs(d) - 2.4) * 0.55),
              filter: `brightness(${(0.62 + near * 0.38).toFixed(3)})`,
            });
            const label = card.querySelector<HTMLElement>("[data-label]");
            if (label) gsap.set(label, { opacity: Math.max(0, near * 2.6 - 1.4), y: 10 - near * 10 });
          });
        };

        place(0);

        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: () => `+=${Math.max(1400, window.innerHeight * 2.4)}`,
          pin: pin,
          scrub: 0.6,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
          onRefresh: () => {
            ({ step, focus } = layout());
          },
          onUpdate: (self) => place(self.progress),
        });

        return () => st.kill();
      });

      mm.add("(prefers-reduced-motion: reduce)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", track);
        cards.forEach((card) => {
          gsap.set(card, { position: "relative", x: 0, rotationY: 0, rotationZ: 0, scale: 1, opacity: 1, filter: "none" });
          const label = card.querySelector<HTMLElement>("[data-label]");
          if (label) gsap.set(label, { opacity: 1, y: 0 });
        });
      });

      return () => mm.revert();
    },
    { scope: rootRef, dependencies: [pieces.length] }
  );

  if (pieces.length === 0) return null;

  return (
    <section ref={rootRef} aria-label="The Flore Edit" style={{ backgroundColor: "#171513" }}>
      <div ref={pinRef} className="relative overflow-hidden" style={{ height: "100svh", backgroundColor: "#171513" }}>
        {/* Heading */}
        <div className="absolute left-0 top-0 z-30 px-5 pt-[120px] md:px-14 md:pt-[140px]">
          <p className="text-[9px] uppercase tracking-[0.34em]" style={{ ...jost, color: "#AEBDB6" }}>
            Indo-Western
          </p>
          <h2
            className="mt-3 leading-[0.92] uppercase"
            style={{
              ...editorial,
              color: "#F3EEE7",
              fontWeight: 600,
              letterSpacing: "0.01em",
              fontSize: "clamp(38px, 9vw, 96px)",
            }}
          >
            The Flore
            <br />
            Edit{" "}
            <span className="align-super text-[0.34em]" style={{ ...jost, color: "#E5B9A4" }}>
              ({pieces.length})
            </span>
          </h2>
        </div>

        {/* 3D track */}
        <div
          ref={trackRef}
          className="absolute inset-0"
          style={{ perspective: "1100px", perspectiveOrigin: "40% 55%" }}
        >
          {pieces.map((p) => (
            <Link
              key={p.handle}
              to={`/product/${p.handle}`}
              data-card
              className="block will-change-transform"
              style={{
                width: "clamp(210px, 46vw, 380px)",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", backgroundColor: "#201D1A" }}>
                <img
                  src={p.image}
                  alt={`${p.name}, Indo-Western piece by Naira Flore`}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{ boxShadow: "inset 0 0 0 1px rgba(243,238,231,0.14)" }}
                />
              </div>
              <div data-label className="mt-3 px-0.5">
                <p className="truncate text-[13px] md:text-[15px]" style={{ ...editorial, color: "#F3EEE7" }}>
                  {p.name}
                </p>
                <p className="mt-1 text-[9px] uppercase tracking-[0.24em]" style={{ ...jost, color: "#AEBDB6" }}>
                  {p.category} · {p.price}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-7 right-5 z-30 md:bottom-10 md:right-14">
          <p className="text-[9px] uppercase tracking-[0.34em]" style={{ ...jost, color: "#8E8A84" }}>
            Scroll to surf
          </p>
        </div>
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{ background: "linear-gradient(to top, rgba(23,21,19,0.9), rgba(23,21,19,0))" }}
        />
      </div>
    </section>
  );
};

export default IndoWesternCarousel;
