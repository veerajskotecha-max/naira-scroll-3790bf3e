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
   ZIRCONE TURN — two ring photos turning & flipping on scroll
   The background-removed solitaire (front + true 3/4 angle) rides the
   front/back of a 3D card. Scroll turns it out to edge-on; a gold glint
   flash hides the photo swap at max foreshortening; the 3/4 face
   continues from the same edge and reveals the stone's depth, holds for
   the callout, then flips home. Benefit callouts point at the band
   (18K GOLD FINISHED) and the stone (BRILLIANT-CUT ZIRCONE).
   Reduced-motion: everything shown, no pin.
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
      gsap.set(card, { scale: 1.08, rotationY: 0, force3D: true });
      gsap.set([faceA, faceB], { opacity: 1, force3D: true });

      const tl = gsap.timeline({
        // No pinning on any breakpoint: this section lives inside an
        // overflow-hidden / isolated wrapper, and pinning there makes the
        // page jump and flicker. Instead the turn is mapped onto the whole
        // travel of the section through the viewport — the ring starts
        // turning the moment it appears and lands its full revolution just as
        // the section leaves, so rotation speed always matches scroll speed.
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
        defaults: { ease: "none" },
      });



      tl
        // one continuous, linear revolution across the entire scroll range
        .fromTo(card, { rotationY: 0 }, { rotationY: 360, duration: 0.94 }, 0.03)
        .to(callL, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, 0.14)
        .to(lineL, { scaleX: 1, duration: 0.05, ease: "power2.out" }, 0.16)
        .to([callL, lineL], { opacity: 0, duration: 0.05 }, 0.34)
        .to(callR, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, 0.56)
        .to(lineR, { scaleX: 1, duration: 0.05, ease: "power2.out" }, 0.58)
        .to([callR, lineR], { opacity: 0, duration: 0.05 }, 0.74)
        .to(card, { scale: 0.96, duration: 0.55, ease: "power1.out" }, 0.3)
        .to(shadow, { scaleX: 0.7, opacity: 0.4, duration: 0.16 }, 0.8)
        .to(hint, { opacity: 0, duration: 0.08 }, 0.4)
        .to(finale, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.62);


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
            <div ref={cardRef} className="relative aspect-square w-[min(48vw,200px)] will-change-transform md:w-[min(34vw,380px)]" style={{ transformStyle: "preserve-3d", contain: "layout paint", isolation: "isolate" }}>
              <img data-face-a src={ringFront} alt={solitaire.name} draggable={false} className="absolute inset-0 h-full w-full object-contain" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "translateZ(1px)" }} />
              <img data-face-b src={ring34} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-contain" style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden", transform: "rotateY(180deg) translateZ(1px)" }} />
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
