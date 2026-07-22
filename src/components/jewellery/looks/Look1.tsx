import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 1 — EMERALD BOUTIQUE VITRINE (Cartier counter)
   Deep emerald velvet + warm gold. The 5 pieces sit on ivory plinth-tiles
   in softly-lit recessed niches behind gold mullions; hover raises a gold
   spotlight and turns the piece to its 3/4 angle under glass. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const Look1 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.14 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden py-24 text-[#F4E9DD] lg:py-32"
      style={{ background: "radial-gradient(120% 80% at 50% -10%, #16553F 0%, #0E3B2E 55%, #0A2C22 100%)" }}>
      <style>{`
        .v1-reveal{opacity:0;transform:translateY(46px);filter:blur(6px);transition:opacity 1s cubic-bezier(.16,1,.3,1),transform 1s cubic-bezier(.16,1,.3,1),filter 1s ease;transition-delay:calc(var(--i)*.1s);}
        .is-revealed .v1-reveal{opacity:1;transform:none;filter:blur(0);}
        .v1-head{opacity:0;transform:translateY(22px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v1-head{opacity:1;transform:none;}
        .v1-rule{transition:width 1.1s cubic-bezier(.16,1,.3,1) .5s;}
        .is-revealed .v1-rule{width:170px;}
        .v1-niche{background:linear-gradient(180deg,#0C3325,#0A2A20);box-shadow:inset 0 2px 20px rgba(0,0,0,.55),inset 0 0 0 1px rgba(232,197,126,.28);}
        .v1-spot{background:radial-gradient(70% 55% at 50% 0%,rgba(232,197,126,.32),transparent 70%);opacity:.5;transition:opacity .5s ease;}
        .v1-niche-btn:hover .v1-spot,.v1-niche-btn:focus-visible .v1-spot{opacity:1;}
        .v1-tile{background:#F4EBE2;box-shadow:0 14px 30px -14px rgba(0,0,0,.7);}
        .v1-glass{background:linear-gradient(135deg,rgba(255,255,255,.28),rgba(255,255,255,0) 46%);}
        .v1-34{opacity:0;transition:opacity .6s ease;}
        .v1-niche-btn:hover .v1-34,.v1-niche-btn:focus-visible .v1-34{opacity:1;}
        .v1-niche-btn:hover .v1-front,.v1-niche-btn:focus-visible .v1-front{opacity:0;}
        .v1-front{transition:opacity .6s ease;}
        .v1-niche-btn{transition:transform .5s cubic-bezier(.16,1,.3,1);}
        .v1-niche-btn:hover{transform:translateY(-6px);}
        @media (prefers-reduced-motion: reduce){.v1-reveal,.v1-head{opacity:1!important;transform:none!important;filter:none!important;}.v1-niche-btn:hover{transform:none;}}
      `}</style>

      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E8C57E]/60 to-transparent" />

      <div className="v1-head relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#E8C57E]" style={jost}>THE VITRINE · DEMI-GOLD</p>
        <h2 className="text-[clamp(2.4rem,7vw,5rem)] leading-[0.95]" style={velista} aria-label="Under glass, in gold.">
          <SplitText text="Under glass," className="block" step={0.035} />
          <SplitText text="in gold." as="div" className="block italic text-[#E8C57E]" style={editorial} delay={0.4} step={0.05} />
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#F4E9DD]/70" style={editorial}>
          Five demi-gold pieces, set in the counter light. Lean in to turn each one.
        </p>
        <span className="v1-rule mx-auto mt-7 block h-px w-0 bg-gradient-to-r from-transparent via-[#E8C57E] to-transparent" />
      </div>

      <div className="relative mx-auto mt-14 grid max-w-6xl grid-cols-2 gap-4 px-6 sm:grid-cols-3 lg:mt-16 lg:grid-cols-5 lg:gap-3">
        {jewellery.map((p, i) => (
          <div key={p.handle} className="v1-reveal" style={{ ["--i" as string]: i }}>
            <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v1-niche-btn block w-full text-left">
              <div className="v1-niche relative p-3">
                <span className="v1-spot pointer-events-none absolute inset-0" aria-hidden />
                <div className="v1-tile relative aspect-square overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="v1-front absolute inset-0 h-full w-full object-cover" />
                  {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v1-34 absolute inset-0 h-full w-full object-cover" />}
                  <span className="v1-glass pointer-events-none absolute inset-0" aria-hidden />
                  {p.tag && <span className="absolute left-2 top-2 bg-[#0E3B2E]/80 px-2 py-0.5 text-[8px] tracking-[0.25em] text-[#E8C57E]" style={jost}>{p.tag}</span>}
                </div>
                <div className="mt-3 text-center">
                  <h3 className="text-[15px] leading-tight text-[#F4E9DD]" style={velista}>{p.name}</h3>
                  <p className="mt-1 text-[12px] text-[#E8C57E]" style={jost}>{p.priceLabel}</p>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="relative mt-14 flex justify-center">
        <Link to="/jewellery" data-magnetic className="group relative inline-flex items-center gap-3 overflow-hidden border border-[#E8C57E]/60 px-9 py-4 text-[12px] tracking-[0.32em] text-[#E8C57E] transition-colors duration-500 hover:text-[#0E3B2E]" style={jost}>
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#E8C57E] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">ENTER THE VITRINE</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look1;
