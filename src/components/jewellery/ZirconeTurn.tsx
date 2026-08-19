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
      gsap.set(finale, { opacity: 0, y: 14 });
      gsap.set(card, { scale: 1.08 });
      // Each face carries its own rotationY. The card itself never rotates —
      // rotating one shared card is what forced the 360° flip-card version.
      gsap.set(faceA, { rotationY: 0, autoAlpha: 1, force3D: true });
      gsap.set(faceB, { rotationY: 46, autoAlpha: 0, force3D: true });

      /*
        The turn is triggered by the RING, not the section.

        Triggering on the section root meant the clock started as soon as its
        top edge crossed 75% of the viewport — while the ring itself was still
        below the fold. Measured on a 393x780 phone, the ring sat motionless at
        0° for the first ~240px of visible scrolling, did its entire turn in
        about 120px, and was home again before the section was even centred.
        That is the "too late, then too fast" this kept being described as.

        Anchoring to the ring's own box makes the mapping honest: the turn
        begins as the ring enters the lower edge of the screen and finishes as
        it leaves the top, so every degree of rotation is spent on screen and
        rotation speed tracks scroll speed at any section height.

        Still no pinning — this section sits inside an overflow-hidden wrapper
        where pinning makes the page jump.
      */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: card,
          // Not the ring's full edge-to-edge travel: at 88%/12% the arc spent
          // its first and last beats with the ring hugging the bottom or top
          // of the screen, so the band callout landed at 0.75 of the viewport
          // and the stone callout at 0.30. Pulling the range in keeps every
          // beat inside the comfortable middle band where the ring reads.
          start: "top 78%",
          end: "bottom 22%",
          scrub: isDesktop ? 0.5 : 0.35,
          invalidateOnRefresh: true,
          fastScrollEnd: true,
        },
        defaults: { ease: "none" },
      });



      tl
        // ── out to the 3/4 angle ──────────────────────────────────────────
        .to(faceA, { rotationY: 46, duration: 0.30 }, 0.02)
        .to(callL, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.18)
        .to(lineL, { scaleX: 1, duration: 0.06, ease: "power2.out" }, 0.20)
        .to(hint, { opacity: 0, duration: 0.08 }, 0.22)
        .to([callL, lineL], { opacity: 0, duration: 0.05 }, 0.34)

        // faceB sits above faceA in the DOM, so it fades up over a face that
        // is still fully opaque — the background is never visible between
        // them. Only once B is solid is A dropped, in one frame.
        .to(faceB, { autoAlpha: 1, duration: 0.07 }, 0.30)
        .set(faceA, { autoAlpha: 0 }, 0.37)
        .to(faceB, { rotationY: 0, duration: 0.23, ease: "power1.out" }, 0.37)

        // ── the reveal: square-on, centred, held for the stone callout ────
        .to(callR, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.60)
        .to(lineR, { scaleX: 1, duration: 0.06, ease: "power2.out" }, 0.62)
        .to([callR, lineR], { opacity: 0, duration: 0.05 }, 0.80)

        // ── and home, the same rule in reverse: restore A underneath while
        //    B still covers it, then fade B out to reveal it ───────────────
        .to(faceB, { rotationY: 46, duration: 0.14, ease: "power1.in" }, 0.78)
        .set(faceA, { rotationY: 46, autoAlpha: 1 }, 0.92)
        .to(faceB, { autoAlpha: 0, duration: 0.06 }, 0.92)
        .to(faceA, { rotationY: 0, duration: 0.08, ease: "power1.out" }, 0.94)

        .to(card, { scale: 0.98, duration: 0.6, ease: "power1.out" }, 0.3)
        .to(shadow, { scaleX: 0.78, opacity: 0.45, duration: 0.2 }, 0.7);


      /*
        The finale carries the only call to action in this section, so it is
        deliberately NOT on the scrubbed timeline. It used to fade in at 0.9 of
        the turn, which on a phone meant it was still invisible for 18 of the
        20 sampled scroll positions where the section was on screen — the block
        holds its layout space either way, so what the visitor actually saw was
        a tall empty gap above "SCROLL - IT TURNS", with the Enquire button
        never appearing at all.

        It now reveals itself the moment it enters the viewport and stays.
      */
      const finaleIn = gsap.fromTo(
        finale,
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: finale, start: "top 94%", once: true },
        },
      );

      return () => {
        tl.scrollTrigger?.kill(); tl.kill();
        finaleIn.scrollTrigger?.kill(); finaleIn.kill();
      };
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
            <div data-call-l className="absolute left-1 right-[calc(50%+27vw)] top-[62%] z-20 flex -translate-y-1/2 items-center md:left-6 md:right-[calc(50%+13vw)] lg:left-10">
              <span className="border border-[#C99A4C]/60 bg-[#FBF3EC]/95 px-2 py-1 text-[10px] leading-[1.35] tracking-[0.07em] text-[#8A6A2F] md:whitespace-nowrap md:px-4 md:py-2 md:text-[12px] md:tracking-[0.2em]" style={jost}>
                18K GOLD FINISHED
              </span>
              <span data-line-l className="block h-px flex-1 bg-[#C99A4C]" aria-hidden />
              <span className="block h-1 w-1 shrink-0 rounded-full bg-[#C99A4C] md:h-1.5 md:w-1.5" aria-hidden />
            </div>

            {/* callout — stone (right) — dot lands on centered zircone */}
            <div data-call-r className="absolute left-[calc(50%+26vw)] right-1 top-[42%] z-20 flex -translate-y-1/2 items-center md:left-[calc(50%+5vw)] md:right-6 md:top-[46%] lg:right-10">
              <span className="block h-1 w-1 shrink-0 rounded-full bg-[#C99A4C] md:h-1.5 md:w-1.5" aria-hidden />
              <span data-line-r className="block h-px flex-1 bg-[#C99A4C]" aria-hidden />
              <span className="border border-[#C99A4C]/60 bg-[#FBF3EC]/95 px-2 py-1 text-[10px] leading-[1.35] tracking-[0.07em] text-[#8A6A2F] md:whitespace-nowrap md:px-4 md:py-2 md:text-[12px] md:tracking-[0.2em]" style={jost}>
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
