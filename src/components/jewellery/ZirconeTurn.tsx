import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import ringFront from "@/assets/jewellery/ring-cut-front.png";
import ring34 from "@/assets/jewellery/ring-cut-34.png";

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────────────────────────────────────────
   ZIRCONE TURN — two ring photos turning & flipping on scroll
   The background-removed solitaire (front + true 3/4 angle) rides the
   front/back of a 3D card. Scroll turns it out to edge-on; a gold glint
   flash hides the photo swap at max foreshortening; the 3/4 face
   continues from the same edge and reveals the stone's depth, holds for
   the callout, then flips home. Benefit callouts point at the band
   (18K GOLD COATED) and the stone (BRILLIANT-CUT ZIRCONE).
   Reduced-motion: everything shown, no pin.
   ─────────────────────────────────────────────────────────────── */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const solitaire = jewellery.find((j) => j.handle === "the-vow")!;

const ZirconeTurn = ({ idAttr, showViewAll = true }: { idAttr?: string; showViewAll?: boolean }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qv, setQv] = useState<JewelPiece | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // Desktop / tablet — full pinned flip timeline
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const root = rootRef.current, pin = pinRef.current, card = cardRef.current;
      if (!root || !pin || !card) return;

      const faceA = pin.querySelector<HTMLElement>("[data-face-a]");
      const faceB = pin.querySelector<HTMLElement>("[data-face-b]");
      const flash = pin.querySelector<HTMLElement>("[data-flash]");
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
      gsap.set(card, { scale: 1 });
      gsap.set(faceA, { rotationY: 0, opacity: 1 });
      gsap.set(faceB, { rotationY: 46, opacity: 0 });
      gsap.set(flash, { opacity: 0, scaleY: 0.3, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top+=1",
          end: "+=120%",
          scrub: 1,
          pin: pin,
          pinSpacing: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "none" },
      });

      tl
        .to(callL, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, 0.06)
        .to(lineL, { scaleX: 1, duration: 0.05, ease: "power2.out" }, 0.08)
        .to([callL, lineL], { opacity: 0, duration: 0.04 }, 0.24)
        .to(faceA, { rotationY: 46, duration: 0.26, ease: "power1.in" }, 0.05)
        .to(flash, { opacity: 1, scaleY: 1, duration: 0.03, ease: "power2.out" }, 0.29)
        .to(flash, { opacity: 0, scaleY: 0.3, duration: 0.05 }, 0.33)
        .to(faceA, { opacity: 0, duration: 0.02 }, 0.305)
        .to(faceB, { opacity: 1, duration: 0.02 }, 0.315)
        .to(faceB, { rotationY: 0, duration: 0.24, ease: "power1.out" }, 0.33)
        .to(callR, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, 0.5)
        .to(lineR, { scaleX: 1, duration: 0.05, ease: "power2.out" }, 0.52)
        .to([callR, lineR], { opacity: 0, duration: 0.04 }, 0.66)
        .to(faceB, { rotationY: 46, duration: 0.12, ease: "power1.in" }, 0.7)
        .to(flash, { opacity: 1, scaleY: 1, duration: 0.03, ease: "power2.out" }, 0.79)
        .to(flash, { opacity: 0, scaleY: 0.3, duration: 0.05 }, 0.83)
        .to(faceB, { opacity: 0, duration: 0.02 }, 0.805)
        .set(faceA, { rotationY: 46 }, 0.805)
        .to(faceA, { opacity: 1, duration: 0.02 }, 0.815)
        .to(faceA, { rotationY: 0, duration: 0.1, ease: "power1.out" }, 0.83)
        .to(card, { scale: 0.96, duration: 0.5, ease: "power1.out" }, 0.4)
        .to(shadow, { scaleX: 0.7, opacity: 0.4, duration: 0.14 }, 0.8)
        .to(hint, { opacity: 0, duration: 0.08 }, 0.78)
        .to(finale, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.9);

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });

    // Mobile — no pin, simple in-view fade of callouts + finale (avoids
    // the visible "break" that pinned scrubs cause on mobile Safari as the
    // address bar resizes 100svh mid-scroll).
    mm.add("(max-width: 767px)", () => {
      const pin = pinRef.current;
      if (!pin) return;

      const callL = pin.querySelector<HTMLElement>("[data-call-l]");
      const callR = pin.querySelector<HTMLElement>("[data-call-r]");
      const lineL = pin.querySelector<HTMLElement>("[data-line-l]");
      const lineR = pin.querySelector<HTMLElement>("[data-line-r]");
      const finale = pin.querySelector<HTMLElement>("[data-finale]");
      const hint = pin.querySelector<HTMLElement>("[data-hint]");

      gsap.set([callL, callR, finale], { opacity: 0, y: 12 });
      gsap.set([lineL, lineR], { scaleX: 0 });
      gsap.set(lineL, { transformOrigin: "100% 50%" });
      gsap.set(lineR, { transformOrigin: "0% 50%" });
      gsap.set(hint, { opacity: 0 });

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            gsap.to([callL, callR], { opacity: 1, y: 0, duration: 0.6, stagger: 0.15, ease: "power2.out" });
            gsap.to([lineL, lineR], { scaleX: 1, duration: 0.5, stagger: 0.15, ease: "power2.out", delay: 0.1 });
            gsap.to(finale, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", delay: 0.25 });
            io.disconnect();
          });
        },
        { threshold: 0.25 }
      );
      io.observe(pin);

      return () => io.disconnect();
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
    <section id={idAttr} className="relative bg-[#FBF3EC] text-[#1A1614]">
      <div ref={rootRef}>
        <div
          ref={pinRef}
          className="relative flex h-[100svh] min-h-[560px] flex-col items-center justify-center overflow-hidden px-6"
          style={{ paddingTop: "clamp(32px, 5vh, 64px)", paddingBottom: "clamp(24px, 4vh, 56px)" }}
        >
          {/* quiet wash */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(62%_46%_at_50%_42%,rgba(255,224,205,0.45)_0%,transparent_66%)]" />

          <p className="relative z-20 mb-3 text-[10px] tracking-[0.5em] text-[#B0843A] md:mb-6 md:text-[11px]" style={jost}>
            THE ZIRCONE EDIT · DEMI-GOLD
          </p>

          {/* the ring — two photos turning */}
          <div className="relative my-1 md:my-4" style={{ perspective: "1200px" }}>
            <div ref={cardRef} className="relative aspect-square w-[min(52vw,220px)] will-change-transform md:w-[min(34vw,380px)]" style={{ transformStyle: "preserve-3d" }}>
              <img data-face-a src={ringFront} alt={solitaire.name} draggable={false} className="absolute inset-0 h-full w-full object-contain will-change-transform" />
              <img data-face-b src={ring34} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-contain will-change-transform" style={{ opacity: 0 }} />
            </div>
            {/* glint flash */}
            <div data-flash aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[86%] w-[3px] -translate-x-1/2 -translate-y-1/2"
              style={{ opacity: 0, background: "linear-gradient(180deg, transparent, #C99A4C 25%, #FFF8F5 50%, #C99A4C 75%, transparent)", boxShadow: "0 0 24px 6px rgba(255,246,222,0.8)" }} />
            {/* contact shadow */}
            <div data-shadow aria-hidden className="pointer-events-none absolute -bottom-4 left-1/2 h-3 w-[58%] -translate-x-1/2 rounded-full opacity-60 md:-bottom-6 md:h-4"
              style={{ background: "radial-gradient(ellipse, rgba(122,90,40,0.38) 0%, transparent 70%)", filter: "blur(4px)" }} />

            {/* callout — band (left) */}
            <div data-call-l className="absolute left-0 top-[64%] z-20 flex -translate-y-1/2 items-center md:left-[-38%] md:top-[62%] lg:left-[-56%]">
              <span className="whitespace-nowrap border border-[#C99A4C]/60 bg-[#FBF3EC]/95 px-1.5 py-1 text-[7.5px] tracking-[0.2em] text-[#9A7634] md:px-4 md:py-2 md:text-[10px]" style={jost}>
                18K GOLD COATED
              </span>
              <span data-line-l className="block h-px w-2 bg-[#C99A4C] md:w-14" aria-hidden />
              <span className="block h-1 w-1 rounded-full bg-[#C99A4C] md:h-1.5 md:w-1.5" aria-hidden />
            </div>

            {/* callout — stone (right) */}
            <div data-call-r className="absolute right-0 top-[32%] z-20 flex -translate-y-1/2 items-center md:right-[-38%] md:top-[38%] lg:right-[-56%]">
              <span className="block h-1 w-1 rounded-full bg-[#C99A4C] md:h-1.5 md:w-1.5" aria-hidden />
              <span data-line-r className="block h-px w-2 bg-[#C99A4C] md:w-14" aria-hidden />
              <span className="whitespace-nowrap border border-[#C99A4C]/60 bg-[#FBF3EC]/95 px-1.5 py-1 text-[7.5px] tracking-[0.2em] text-[#9A7634] md:px-4 md:py-2 md:text-[10px]" style={jost}>
                BRILLIANT-CUT ZIRCONE
              </span>
            </div>
          </div>

          {/* finale */}
          <div data-finale className="relative z-20 mt-4 text-center md:mt-8">
            <h2 className="text-[clamp(1.4rem,5.4vw,2.6rem)] leading-tight" style={velista}>{solitaire.name}</h2>
            <p className="mt-1 text-[12px] italic text-[#1A1614]/55 md:text-[13px]" style={editorial}>{solitaire.materials}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 md:mt-4 md:gap-4">
              <span className="text-[15px] tracking-wide md:text-[16px]" style={jost}>{solitaire.priceLabel}</span>
              <button onClick={() => setQv(solitaire)} className="border border-[#1A1614] px-6 py-2.5 text-[10px] tracking-[0.3em] transition-colors duration-300 hover:bg-[#1A1614] hover:text-[#FBF3EC] md:px-7" style={jost}>
                ENQUIRE
              </button>
              {showViewAll && (
                <Link to="/jewellery" className="border-b border-[#B0843A] pb-0.5 text-[10px] tracking-[0.25em] text-[#9A7634]" style={jost}>
                  VIEW ALL →
                </Link>
              )}
            </div>
          </div>

          <span data-hint className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.4em] text-[#1A1614]/35 md:bottom-5" style={jost}>SCROLL — IT TURNS</span>
        </div>
      </div>
      <JewelQuickView piece={qv} open={!!qv} onOpenChange={(o) => { if (!o) setQv(null); }} />
    </section>
  );
};

export default ZirconeTurn;
