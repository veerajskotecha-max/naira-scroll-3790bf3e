import { useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { jewellery } from "@/data/jewellery";

gsap.registerPlugin(ScrollTrigger);

/* Mobile browsers resize the viewport when the URL bar hides/shows. Without
   this, ScrollTrigger refreshes mid-scroll and the pinned deck visibly jumps. */
ScrollTrigger.config({ ignoreMobileResize: true });

/* ───────────────────────────────────────────────────────────────
   THE PETITE SIX — a 3D "scroll to surf" deck of bestselling jewellery.
   Cards ride a perspective track from right to left as the section is
   pinned; the piece passing the focus zone zooms forward, straightens
   and reveals its name, so the collection is read one piece at a time.
   Reduced motion: the deck falls back to a plain horizontal scroller.
   ─────────────────────────────────────────────────────────────── */

const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const GildedSixCarousel = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const bestsellers = ["the-vow", "the-halo", "the-solitaire-drop", "the-ripple-hoop", "the-sugar-tennis", "the-rosewater-line"];

  const pieces = useMemo(
    () =>
      bestsellers
        .map((handle) => jewellery.find((j) => j.handle === handle))
        .filter((j): j is (typeof jewellery)[number] => Boolean(j)),
    []
  );

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
          const step = cards[0].offsetWidth * (vw < 700 ? 1.05 : vw < 1100 ? 0.95 : 0.86);
          const focus = vw * 0.5;
          const drop = vw < 700 ? 48 : vw < 1100 ? 30 : 0; // clear the headline
          return { step, focus, drop };
        };

        let { step, focus, drop } = layout();

        cards.forEach((card, i) => {
          gsap.set(card, { position: "absolute", top: "50%", left: 0, xPercent: -50, yPercent: -50, zIndex: i });
        });

        // dwell easing: each piece holds in the focus zone, then flips to the next
        const dwell = (p: number) => {
          const n = cards.length - 1;
          if (n <= 0) return 0;
          const t = gsap.utils.clamp(0, n, p * n);
          const seg = Math.min(Math.floor(t), n - 1);
          const f = t - seg;
          const hold = 0.34; // portion of each segment spent resting on the piece
          const move = gsap.utils.clamp(0, 1, (f - hold) / (1 - hold * 2));
          const eased = move * move * (3 - 2 * move); // smoothstep
          return seg + eased;
        };

        const place = (progress: number) => {
          const t = dwell(progress);
          // left → right travel: head slides right, piece i rests at focus when t === i
          const head = focus + t * step;

          cards.forEach((card, i) => {
            const x = head - i * step;
            const d = (x - focus) / step; // steps away from the focus zone
            const near = Math.max(0, 1 - Math.abs(d) / 0.9);
            gsap.set(card, {
              x,
              y: drop,
              rotationY: gsap.utils.clamp(-26, 26, -d * 26),
              rotationZ: 0,
              scale: 0.62 + near * 0.46,
              opacity: gsap.utils.clamp(0, 1, 1 - Math.max(0, Math.abs(d) - 1.15) * 1.1),
              filter: `brightness(${(0.62 + near * 0.38).toFixed(3)})`,
              zIndex: Math.round(100 - Math.abs(d) * 10),
            });
            const label = card.querySelector<HTMLElement>("[data-label]");
            if (label) gsap.set(label, { opacity: Math.max(0, near * 2.6 - 1.3), y: 10 - near * 10 });
          });
        };

        place(0);

        // Mobile URL-bar collapse changes window.innerHeight mid-scroll, which
        // would otherwise fire a refresh and make the pin jump. Height-only
        // resizes are ignored; a real orientation change still refreshes.
        ScrollTrigger.config({ ignoreMobileResize: true });

        // Measure the pinned box itself rather than the window. The box is sized
        // in CSS `svh`, which does not equal window.innerHeight on mobile — the
        // browser chrome accounts for the difference. Driving the scroll distance
        // from innerHeight therefore left the pin spacer and the pinned element
        // disagreeing, which is what opened the gap below the deck.
        //
        // This has to be a function, not a string: `end` is evaluated once at
        // creation, so a template literal freezes the value it was built from and
        // invalidateOnRefresh has nothing to recompute.
        const distance = () => {
          const h = pin.offsetHeight || window.innerHeight;
          return `+=${Math.round(h * 0.55 * cards.length + h * 0.2)}`;
        };

        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          // ~one viewport of scroll per piece, then the section releases
          end: distance,
          pin: pin,
          pinType: "fixed",
          pinSpacing: true,
          scrub: 0.45,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: (self) => {
            ({ step, focus, drop } = layout());
            place(self.progress);
          },
          onUpdate: (self) => place(self.progress),
        });

        // Images are decoded before the deck is scrolled into view, so no
        // late layout shift / stall when the pin engages.
        const imgs = Array.from(track.querySelectorAll("img"));
        let pending = imgs.length;
        const done = () => {
          if (--pending <= 0) ScrollTrigger.refresh();
        };
        imgs.forEach((img) => {
          if (img.complete) done();
          else {
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          }
        });

        return () => st.kill();
      });


      mm.add("(prefers-reduced-motion: reduce)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-card]", track);
        // The track is absolutely positioned and its parent clips overflow, so
        // simply un-absoluting the cards left them stacked vertically with every
        // one after the first cut off. Lay them out as a swipeable row instead,
        // which needs no scroll animation to work.
        gsap.set(track, {
          position: "absolute",
          display: "flex",
          alignItems: "center",
          gap: 24,
          overflowX: "auto",
          overflowY: "hidden",
          padding: "0 24px",
          perspective: "none",
        });
        cards.forEach((card) => {
          gsap.set(card, {
            position: "relative",
            flex: "0 0 auto",
            top: "auto",
            left: "auto",
            xPercent: 0,
            yPercent: 0,
            x: 0,
            y: 0,
            rotationY: 0,
            rotationZ: 0,
            scale: 1,
            opacity: 1,
            filter: "none",
            zIndex: 1,
          });
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
    <section ref={rootRef} aria-label="The Petite Six" style={{ backgroundColor: "#14211F" }}>
      <div
        ref={pinRef}
        className="relative overflow-hidden"
        style={{
          height: "100svh",
          backgroundColor: "#14211F",
          backgroundImage:
            "radial-gradient(90% 70% at 78% 18%, rgba(47,93,99,0.55) 0%, transparent 62%)," +
            "radial-gradient(70% 60% at 12% 88%, rgba(229,185,164,0.20) 0%, transparent 66%)," +
            "radial-gradient(120% 90% at 50% 50%, rgba(174,189,182,0.10) 0%, transparent 70%)," +
            "linear-gradient(150deg, #16241F 0%, #12191B 48%, #1B1512 100%)",
        }}
      >
        {/* diagonal atelier rules */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(118deg, rgba(243,238,231,0.10) 0px, rgba(243,238,231,0.10) 1px, transparent 1px, transparent 120px)",
          }}
        />
        {/* soft vignette */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(120% 80% at 50% 50%, transparent 40%, rgba(8,10,10,0.62) 100%)" }}
        />
        {/* Heading */}
        <div className="absolute left-0 top-0 z-30 px-5 pt-[120px] md:px-14 md:pt-[140px]">
          <p className="text-[9px] uppercase tracking-[0.34em]" style={{ ...jost, color: "#AEBDB6" }}>
            Jewellery Bestsellers
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
            The Petite
            <br />
            Six{" "}
            <span className="align-super text-[0.34em]" style={{ ...jost, color: "#E5B9A4" }}>
              ({pieces.length})
            </span>
          </h2>
        </div>

        {/* 3D track */}
        <div
          ref={trackRef}
          className="absolute inset-0"
          style={{ perspective: "1100px", perspectiveOrigin: "50% 52%" }}
        >
          {pieces.map((p) => (
            <Link
              key={p.handle}
              to={`/jewellery/${p.handle}`}
              data-card
              className="block will-change-transform"
              style={{
                width: "clamp(190px, 52vw, 340px)",
                transformStyle: "preserve-3d",
                backfaceVisibility: "hidden",
              }}
            >
              <div className="relative overflow-hidden" style={{ aspectRatio: "3/4", backgroundColor: "#201D1A" }}>
                <img
                  src={p.image}
                  alt={`${p.name}, demi-fine jewellery by Naira Flore`}
                  loading="eager"
                  decoding="async"
                  fetchPriority="low"
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
                  {p.category} · {p.priceLabel}
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
          style={{ background: "linear-gradient(to top, rgba(14,20,20,0.92), rgba(14,20,20,0))" }}
        />
      </div>
    </section>
  );
};

export default GildedSixCarousel;
