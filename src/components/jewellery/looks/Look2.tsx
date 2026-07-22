import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 2 — BLUSH MAXIMALIST (Mejuri / Glossier)
   Loud rose world, oversized type, big circular pill-tiles that pop and
   turn to 3/4 on hover. Confident modern-DTC energy. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const offsets = ["lg:mt-0", "lg:mt-14", "lg:mt-4", "lg:mt-16", "lg:mt-2"];

const Look2 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden py-24 text-[#3A0E1B] lg:py-32"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #FFE3EA 0%, #FFC6D3 55%, #FFB0C2 100%)" }}>
      <style>{`
        .v2-reveal{opacity:0;transform:translateY(48px) scale(.9);transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.34,1.56,.64,1);transition-delay:calc(var(--i)*.09s);}
        .is-revealed .v2-reveal{opacity:1;transform:none;}
        .v2-head{opacity:0;transform:translateY(24px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v2-head{opacity:1;transform:none;}
        .v2-disc{transition:transform .5s cubic-bezier(.34,1.56,.64,1),box-shadow .5s ease;box-shadow:0 18px 40px -16px rgba(226,62,107,.45);}
        .v2-btn:hover .v2-disc,.v2-btn:focus-visible .v2-disc{transform:scale(1.06) rotate(-3deg);box-shadow:0 26px 54px -18px rgba(226,62,107,.6);}
        .v2-34{opacity:0;transition:opacity .55s ease;}
        .v2-btn:hover .v2-34,.v2-btn:focus-visible .v2-34{opacity:1;}
        .v2-front{transition:opacity .55s ease;}
        .v2-btn:hover .v2-front,.v2-btn:focus-visible .v2-front{opacity:0;}
        @media (prefers-reduced-motion: reduce){.v2-reveal,.v2-head{opacity:1!important;transform:none!important;}.v2-btn:hover .v2-disc{transform:none;}}
      `}</style>

      <div className="v2-head relative mx-auto max-w-4xl px-6 text-center">
        <p className="mb-4 inline-block bg-[#E23E6B] px-4 py-1.5 text-[11px] tracking-[0.3em] text-[#FFE3EA]" style={jost}>NEW DROP · DEMI-GOLD</p>
        <h2 className="text-[clamp(3rem,10vw,7rem)] font-medium leading-[0.85]" style={velista} aria-label="Pretty. Precious.">
          <SplitText text="Pretty." className="block" step={0.05} />
          <SplitText text="Precious." as="div" className="block italic text-[#E23E6B]" style={editorial} delay={0.35} step={0.05} />
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[16px] leading-relaxed text-[#3A0E1B]/70" style={editorial}>
          Gold-plated, flower-pressed, and made to be worn every single day. Tap to shop.
        </p>
      </div>

      <div className="relative mx-auto mt-16 flex max-w-6xl flex-wrap items-start justify-center gap-x-6 gap-y-10 px-6">
        {jewellery.map((p, i) => (
          <div key={p.handle} className={`v2-reveal ${offsets[i % offsets.length]} w-[44%] sm:w-[30%] lg:w-[17%]`} style={{ ["--i" as string]: i }}>
            <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v2-btn block w-full">
              <div className="v2-disc relative mx-auto aspect-square w-full overflow-hidden bg-[#FFF3F6]" style={{ borderRadius: "50%", border: "3px solid #E23E6B" }}>
                <img src={p.image} alt={p.name} loading="lazy" className="v2-front absolute inset-0 h-full w-full scale-[1.05] object-cover" />
                {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v2-34 absolute inset-0 h-full w-full scale-[1.05] object-cover" />}
              </div>
              {p.tag && <span className="mx-auto mt-3 block w-fit bg-[#3A0E1B] px-2.5 py-1 text-[8px] tracking-[0.25em] text-[#FFE3EA]" style={jost}>{p.tag}</span>}
              <h3 className="mt-3 text-center text-[19px] leading-tight text-[#3A0E1B]" style={velista}>{p.name}</h3>
              <p className="mt-1 text-center text-[16px] font-medium text-[#E23E6B]" style={jost}>{p.priceLabel}</p>
            </button>
          </div>
        ))}
      </div>

      <div className="relative mt-16 flex justify-center">
        <Link to="/jewellery" data-magnetic className="inline-flex items-center gap-3 bg-[#E23E6B] px-10 py-4 text-[12px] tracking-[0.3em] text-[#FFE3EA] transition-transform duration-300 hover:scale-105" style={jost}>
          SHOP ALL SPARKLE <span>→</span>
        </Link>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look2;
