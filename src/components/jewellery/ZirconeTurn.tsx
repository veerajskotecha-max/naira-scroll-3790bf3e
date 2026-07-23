import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import ringFront from "@/assets/jewellery/ring-cut-front.png";

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────────────────────────────────────────
   ZIRCONE TURN — a single ring photo turning on scroll.
   One background-removed image on a 3D card; scroll turns it right,
   then back to centre, then left, then home. Callouts appear
   in sync at the two rest points (band + stone). Smooth, no photo
   swaps, no flash — the motion is one continuous rock.
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

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const root = rootRef.current, pin = pinRef.current, card = cardRef.current;
      if (!root || !pin || !card) return;

      const face = pin.querySelector<HTMLElement>("[data-face]");
      const callL = pin.querySelector<HTMLElement>("[data-call-l]");
      const callR = pin.querySelector<HTMLElement>("[data-call-r]");
      const lineL = pin.querySelector<HTMLElement>("[data-line-l]");
      const lineR = pin.querySelector<HTMLElement>("[data-line-r]");
      const shadow = pin.querySelector<HTMLElement>("[data-shadow]");
      const hint = pin.querySelector<HTMLElement>("[data-hint]");

      gsap.set([callL, callR], { opacity: 0, y: 8 });
      gsap.set([lineL, lineR], { scaleX: 0 });
      gsap.set(lineL, { transformOrigin: "100% 50%" });
      gsap.set(lineR, { transformOrigin: "0% 50%" });
      gsap.set(face, { rotationY: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=140%",
          scrub: 1,
          pin: pin,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
        defaults: { ease: "none" },
      });

      tl
        // 0 → 0.30 — ring turns right, band callout comes in mid-turn and lingers
        .to(face,  { rotationY: 32,  duration: 0.30, ease: "sine.inOut" }, 0.00)
        .to(callL, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.08)
        .to(lineL, { scaleX: 1,       duration: 0.06, ease: "power2.out" }, 0.10)

        // 0.30 → 0.55 — comes back through centre, band callout fades out
        .to(face,  { rotationY: 0,   duration: 0.25, ease: "sine.inOut" }, 0.30)
        .to([callL, lineL], { opacity: 0, duration: 0.06 }, 0.32)

        // 0.55 → 0.85 — turns left, stone callout comes in mid-turn and lingers
        .to(face,  { rotationY: -32, duration: 0.30, ease: "sine.inOut" }, 0.55)
        .to(callR, { opacity: 1, y: 0, duration: 0.06, ease: "power2.out" }, 0.63)
        .to(lineR, { scaleX: 1,       duration: 0.06, ease: "power2.out" }, 0.65)

        // 0.85 → 1.0 — settles back to centre, callout fades, contact shadow tightens
        .to(face,  { rotationY: 0,   duration: 0.15, ease: "sine.out" }, 0.85)
        .to([callR, lineR], { opacity: 0, duration: 0.06 }, 0.88)
        .to(shadow, { scaleX: 0.85, opacity: 0.5, duration: 0.20 }, 0.80)
        .to(hint,   { opacity: 0, duration: 0.10 }, 0.10);

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });

    mm.add("(prefers-reduced-motion: reduce)", () => {
      const pin = pinRef.current;
      if (!pin) return;
      pin.querySelectorAll<HTMLElement>("[data-call-l],[data-call-r]").forEach((el) => {
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
          style={{ paddingTop: "clamp(40px, 6vh, 72px)", paddingBottom: "clamp(28px, 4vh, 56px)" }}
        >
          {/* quiet wash */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(62%_46%_at_50%_42%,rgba(255,224,205,0.45)_0%,transparent_66%)]" />

          {/* eyebrow */}
          <p className="relative z-20 text-[10px] tracking-[0.5em] text-[#B0843A] md:text-[11px]" style={jost}>
            THE ZIRCONE EDIT · DEMI-GOLD
          </p>

          {/* the ring — centred in remaining space */}
          <div className="relative z-10 mt-4 flex items-center justify-center md:mt-6">
            <div className="relative" style={{ perspective: "1200px" }}>
              <div
                ref={cardRef}
                className="relative aspect-square w-[min(58vw,240px)] will-change-transform md:w-[min(34vw,360px)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <img
                  data-face
                  src={ringFront}
                  alt={solitaire.name}
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-contain will-change-transform"
                />
              </div>

              {/* contact shadow */}
              <div
                data-shadow
                aria-hidden
                className="pointer-events-none absolute -bottom-5 left-1/2 h-4 w-[58%] -translate-x-1/2 rounded-full opacity-70"
                style={{ background: "radial-gradient(ellipse, rgba(122,90,40,0.38) 0%, transparent 70%)", filter: "blur(4px)" }}
              />

              {/* callout — band (left) */}
              <div
                data-call-l
                className="absolute left-0 top-[62%] z-20 flex -translate-y-1/2 items-center md:left-[-38%] md:top-[60%] lg:left-[-56%]"
              >
                <span
                  className="whitespace-nowrap border border-[#C99A4C]/60 bg-[#FBF3EC]/95 px-1.5 py-1 text-[7.5px] tracking-[0.2em] text-[#9A7634] md:px-4 md:py-2 md:text-[10px]"
                  style={jost}
                >
                  18K GOLD COATED
                </span>
                <span data-line-l className="block h-px w-2 bg-[#C99A4C] md:w-14" aria-hidden />
                <span className="block h-1 w-1 rounded-full bg-[#C99A4C] md:h-1.5 md:w-1.5" aria-hidden />
              </div>

              {/* callout — stone (right) */}
              <div
                data-call-r
                className="absolute right-0 top-[34%] z-20 flex -translate-y-1/2 items-center md:right-[-38%] md:top-[40%] lg:right-[-56%]"
              >
                <span className="block h-1 w-1 rounded-full bg-[#C99A4C] md:h-1.5 md:w-1.5" aria-hidden />
                <span data-line-r className="block h-px w-2 bg-[#C99A4C] md:w-14" aria-hidden />
                <span
                  className="whitespace-nowrap border border-[#C99A4C]/60 bg-[#FBF3EC]/95 px-1.5 py-1 text-[7.5px] tracking-[0.2em] text-[#9A7634] md:px-4 md:py-2 md:text-[10px]"
                  style={jost}
                >
                  BRILLIANT-CUT ZIRCONE
                </span>
              </div>
            </div>
          </div>

          {/* finale — always visible, sits below the ring */}
          <div className="relative z-20 mt-6 text-center md:mt-8">
            <h2 className="text-[clamp(1.5rem,5.6vw,2.6rem)] leading-tight" style={velista}>{solitaire.name}</h2>
            <p className="mt-1.5 text-[12px] italic text-[#1A1614]/60 md:text-[13px]" style={editorial}>{solitaire.materials}</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 md:mt-5 md:gap-4">
              <span className="text-[15px] tracking-wide md:text-[16px]" style={jost}>{solitaire.priceLabel}</span>
              <button
                onClick={() => setQv(solitaire)}
                className="border border-[#1A1614] px-6 py-2.5 text-[10px] tracking-[0.3em] transition-colors duration-300 hover:bg-[#1A1614] hover:text-[#FBF3EC] md:px-7"
                style={jost}
              >
                ENQUIRE
              </button>
              {showViewAll && (
                <Link
                  to="/jewellery"
                  className="border-b border-[#B0843A] pb-0.5 text-[10px] tracking-[0.25em] text-[#9A7634]"
                  style={jost}
                >
                  VIEW ALL →
                </Link>
              )}
            </div>
          </div>

          <span
            data-hint
            className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.4em] text-[#1A1614]/35 md:bottom-4"
            style={jost}
          >
            SCROLL — IT TURNS
          </span>
        </div>
      </div>
      <JewelQuickView piece={qv} open={!!qv} onOpenChange={(o) => { if (!o) setQv(null); }} />
    </section>
  );
};

export default ZirconeTurn;
