import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import RingAtelierBackdrop from "@/components/jewellery/RingAtelierBackdrop";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import ringFront from "@/assets/jewellery/ring-cut-front.webp";
import ring34 from "@/assets/jewellery/ring-cut-34.webp";

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────────────────────────────────────────
   ZIRCONE TURN — two ring photos turning on scroll

   The illusion: the background-removed solitaire turns away to 46°, the
   photo is swapped for the true 3/4 angle at that extreme, and that face
   turns back to square-on. The eye reads one ring rotating and revealing
   its depth. It holds there for the stone callout, then runs home the
   same way.

   Two rules this section keeps breaking, so they are written down.

   1. The turn NEVER passes 90°. These are flat photos: at 90° a plane is
      edge-on and has zero width, so the ring vanishes. A full 360° spin
      (which is what shipped on 18-19 Aug) makes it disappear twice per
      scroll. backface-visibility does not save this — there is genuinely
      nothing to draw. 46° is the limit because it is the angle the 3/4
      photograph was actually shot at.

   2. The swap never fades both faces at once. Whichever face is arriving
      fades up ON TOP of a fully opaque outgoing face, and only then is the
      outgoing one hidden. Cross-fading both at once lets the background
      through at the midpoint, and that dip is the "desktop flicker" the
      earlier fixes were chasing.

   Callouts point at the band (18K GOLD FINISHED) and the stone
   (BRILLIANT-CUT ZIRCONE). Reduced-motion: everything shown, no motion.
   ─────────────────────────────────────────────────────────────── */

const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const solitaire =
  jewellery.find((j) => j.handle === "golden-duet-ring") ??
  jewellery.find((j) => j.category === "Rings") ??
  jewellery[0];


const ZirconeTurn = ({ idAttr, showViewAll = true, inheritBackdrop = false }: { idAttr?: string; showViewAll?: boolean; inheritBackdrop?: boolean }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qv, setQv] = useState<JewelPiece | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
      const isDesktop = !!ctx.conditions?.desktop;
      const root = rootRef.current, pin = pinRef.current, card = cardRef.current;
      if (!root || !pin || !card) return;


      const faceA = pin.querySelector<HTMLElement>("[data-face-a]");
      const faceB = pin.querySelector<HTMLElement>("[data-face-b]");
      const callL = pin.querySelector<HTMLElement>("[data-call-l]");
      const callR = pin.querySelector<HTMLElement>("[data-call-r]");
      const lineL = pin.querySelector<HTMLElement>("[data-line-l]");
      const lineR = pin.querySelector<HTMLElement>("[data-line-r]");
      const finale = pin.querySelector<HTMLElement>("[data-finale]");
      const shadow = pin.querySelector<HTMLElement>("[data-shadow]");
      const hint = pin.querySelector<HTMLElement>("[data-hint]");

      gsap.set([callL, callR], { opacity: 0, y: 10 });
      gsap.set([lineL, lineR], { scaleX: 0 });
      gsap.set(lineL, { transformOrigin: "100% 50%" });
      gsap.set(lineR, { transformOrigin: "0% 50%" });
      gsap.set(finale, { opacity: 0, y: 18 });
      gsap.set(card, { scale: 1.08 });
      // Each face carries its own rotationY. The card itself never rotates —
      // rotating one shared card is what forced the 360° flip-card version.
      // Plain opacity, never autoAlpha: toggling `visibility` on a 3D-transformed
      // layer makes Chrome drop and re-create the composited layer, and that
      // re-rasterisation is the one-frame flash seen on desktop/tablet.
      gsap.set(faceA, { rotationY: 0, opacity: 1, force3D: true });
      gsap.set(faceB, { rotationY: 46, opacity: 0, force3D: true });

      const tl = gsap.timeline({
        // No pinning on any breakpoint: this section lives inside an
        // overflow-hidden / isolated wrapper, and pinning there makes the
        // page jump and flicker. Instead the turn is mapped onto the whole
        // travel of the section through the viewport — the ring starts
        // turning the moment it appears and lands its full revolution just as
        // the section leaves, so rotation speed always matches scroll speed.
        scrollTrigger: {
          trigger: root,
          start: isDesktop ? "top 85%" : "top 75%",
          end: isDesktop ? "+=110%" : "+=120%",
          scrub: 0.45,
          invalidateOnRefresh: true,
          // fastScrollEnd removed: it snaps the timeline forward in one frame
          // after a fast flick, which reads as a pop/flash on desktop.
        },
        defaults: { ease: "none" },
      });



      tl
        .to(callL, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, 0.06)
        .to(lineL, { scaleX: 1, duration: 0.05, ease: "power2.out" }, 0.08)
        .to([callL, lineL], { opacity: 0, duration: 0.04 }, 0.24)

        // out to the 3/4 angle
        .to(faceA, { rotationY: 46, duration: 0.26, ease: "power1.in" }, 0.05)
        // faceB sits above faceA in the DOM, so it fades up over a face that
        // is still fully opaque — the background is never visible between
        // them. Only once B is solid is A dropped, in one frame.
        .to(faceB, { opacity: 1, duration: 0.08 }, 0.31)
        .set(faceA, { opacity: 0 }, 0.39)
        .to(faceB, { rotationY: 0, duration: 0.22, ease: "power1.out" }, 0.39)

        .to(callR, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, 0.5)
        .to(lineR, { scaleX: 1, duration: 0.05, ease: "power2.out" }, 0.52)
        .to([callR, lineR], { opacity: 0, duration: 0.04 }, 0.66)

        // and home. The same rule in reverse: restore A underneath while B
        // still covers it, then fade B out to reveal it.
        .to(faceB, { rotationY: 46, duration: 0.12, ease: "power1.in" }, 0.7)
        .set(faceA, { rotationY: 46, opacity: 1 }, 0.82)
        .to(faceB, { opacity: 0, duration: 0.08 }, 0.82)
        .to(faceA, { rotationY: 0, duration: 0.1, ease: "power1.out" }, 0.9)

        .to(card, { scale: 0.96, duration: 0.5, ease: "power1.out" }, 0.4)
        .to(shadow, { scaleX: 0.7, opacity: 0.4, duration: 0.14 }, 0.8)
        .to(hint, { opacity: 0, duration: 0.08 }, 0.78)
        .to(finale, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.9);


      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const pin = pinRef.current;
      if (!pin) return;
      pin.querySelectorAll<HTMLElement>("[data-call-l],[data-call-r],[data-finale]").forEach((el) => {
        el.style.opacity = "1"; el.style.transform = "none";
      });
      pin.querySelectorAll<HTMLElement>("[data-line-l],[data-line-r]").forEach((el) => { el.style.transform = "none"; });
    });

    return () => mm.revert();
  }, { scope: rootRef });

  return (
    <section id={idAttr} className={`relative text-[#1A1614] ${inheritBackdrop ? "" : "bg-[#FBF3EC]"}`}>
      <div ref={rootRef}>
        <div
          ref={pinRef}
          className="relative flex flex-col items-center justify-center px-4 pb-4 pt-[96px] md:h-[100svh] md:min-h-[560px] md:px-6 md:pb-10 md:pt-[120px]"
        >
          {/* atelier backdrop — paper wash, 3D drift, touch blooms */}
          {!inheritBackdrop && <RingAtelierBackdrop />}
          {/* quiet wash */}
          {!inheritBackdrop && (
            <div className="pointer-events-none absolute inset-0 [background:radial-gradient(62%_46%_at_50%_42%,rgba(255,224,205,0.45)_0%,transparent_66%)]" />
          )}

          <p className="relative z-20 mb-3 text-center text-[10px] leading-relaxed tracking-[0.4em] text-[#B0843A] md:mb-6 md:text-[11px] md:tracking-[0.5em]" style={jost}>
            THE ZIRCONE EDIT · DEMI-FINE
          </p>


          {/* the ring — two photos turning (wrapper spans full width so callouts never clip) */}
          <div className="relative flex w-full max-w-[520px] justify-center md:max-w-[900px]" style={{ perspective: "1200px" }}>
            {/* No `contain: paint` and no `isolation` here: both force a fresh
                paint context on a 3D-transformed subtree, which is what made
                the faces re-rasterise mid-turn and flash. */}
            <div ref={cardRef} className="relative aspect-square w-[min(48vw,200px)] will-change-transform md:w-[min(34vw,380px)]" style={{ transformStyle: "preserve-3d" }}>
              <img data-face-a src={ringFront} alt={solitaire.name} draggable={false} className="absolute inset-0 h-full w-full object-contain" style={{ willChange: "transform, opacity", transform: "translateZ(0)" }} />
              <img data-face-b src={ring34} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-contain" style={{ opacity: 0, willChange: "transform, opacity", transform: "translateZ(0)" }} />
              {/* contact shadow */}
              <div data-shadow aria-hidden className="pointer-events-none absolute -bottom-3 left-1/2 h-3 w-[58%] -translate-x-1/2 rounded-full opacity-60 md:-bottom-6 md:h-4"
                style={{ background: "radial-gradient(ellipse, rgba(122,90,40,0.38) 0%, transparent 70%)", filter: "blur(4px)" }} />
            </div>

            {/* callout — band (left) — dot lands on ring band */}
            <div data-call-l className="absolute left-1 right-[calc(50%+19vw)] top-[62%] z-20 flex -translate-y-1/2 items-center md:left-6 md:right-[calc(50%+13vw)] lg:left-10">
              <span className="border border-[#C99A4C]/60 bg-[#FBF3EC]/95 px-2.5 py-1.5 text-[12px] leading-tight tracking-[0.12em] text-[#8A6A2F] md:whitespace-nowrap md:px-4 md:py-2 md:text-[12px] md:tracking-[0.2em]" style={jost}>
                18K GOLD FINISHED
              </span>
              <span data-line-l className="block h-px flex-1 bg-[#C99A4C]" aria-hidden />
              <span className="block h-1 w-1 shrink-0 rounded-full bg-[#C99A4C] md:h-1.5 md:w-1.5" aria-hidden />
            </div>

            {/* callout — stone (right) — dot lands on centered zircone */}
            <div data-call-r className="absolute left-[calc(50%+6vw)] right-1 top-[42%] z-20 flex -translate-y-1/2 items-center md:left-[calc(50%+5vw)] md:right-6 md:top-[46%] lg:right-10">
              <span className="block h-1 w-1 shrink-0 rounded-full bg-[#C99A4C] md:h-1.5 md:w-1.5" aria-hidden />
              <span data-line-r className="block h-px flex-1 bg-[#C99A4C]" aria-hidden />
              <span className="border border-[#C99A4C]/60 bg-[#FBF3EC]/95 px-2.5 py-1.5 text-[12px] leading-tight tracking-[0.12em] text-[#8A6A2F] md:whitespace-nowrap md:px-4 md:py-2 md:text-[12px] md:tracking-[0.2em]" style={jost}>
                BRILLIANT-CUT ZIRCONE
              </span>
            </div>

          </div>


          {/* finale */}
          <div data-finale className="relative z-20 mt-3 text-center md:mt-8">
            <p className="mt-1 text-[13px] italic text-[#1A1614]/55 md:text-[13px]" style={editorial}>Rhodium finished · brilliant-cut zircone · 4-prong</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-3 md:mt-4 md:gap-4">
              <button onClick={() => setQv(solitaire)} className="press-scale border border-[#1A1614] px-6 py-2.5 text-[10px] tracking-[0.3em] hover:bg-[#1A1614] hover:text-[#FBF3EC] md:px-7" style={jost}>
                ENQUIRE
              </button>
              {showViewAll && (
                <Link to="/jewellery" className="border-b border-[#B0843A] pb-0.5 text-[10px] tracking-[0.25em] text-[#8A6A2F]" style={jost}>
                  VIEW ALL →
                </Link>
              )}
            </div>
          </div>

          <span data-hint className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.4em] text-[#1A1614]/35 md:bottom-5" style={jost}>SCROLL · IT TURNS</span>
        </div>

      </div>
      <JewelQuickView piece={qv} open={!!qv} onOpenChange={(o) => { if (!o) setQv(null); }} />
    </section>
  );
};

export default ZirconeTurn;
