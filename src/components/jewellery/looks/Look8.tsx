import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 8 — MARBLE PLINTHS (Bulgari museum gallery)
   Veined white marble hall; each piece stands on a carved stone plinth
   with an engraved brass label. Hover lifts the piece off its plinth
   and turns it to the 3/4 angle. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const marbleBg = `
  radial-gradient(90% 60% at 20% 10%, rgba(110,106,99,0.08) 0%, transparent 55%),
  radial-gradient(70% 50% at 85% 80%, rgba(110,106,99,0.10) 0%, transparent 55%),
  linear-gradient(170deg, #F6F4F0 0%, #EFECE6 100%)`;

const plinthHeights = ["lg:h-40", "lg:h-24", "lg:h-32", "lg:h-20", "lg:h-36"];

const Look8 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden py-24 text-[#3B3833] lg:py-32" style={{ background: marbleBg }}>
      <style>{`
        .v8-vein{position:absolute;inset:0;pointer-events:none;opacity:.5;
          background:
            linear-gradient(112deg, transparent 46%, rgba(110,106,99,.10) 47%, transparent 49%),
            linear-gradient(96deg, transparent 71%, rgba(110,106,99,.08) 72%, transparent 74%),
            linear-gradient(128deg, transparent 22%, rgba(201,154,76,.10) 23%, transparent 25%);}
        .v8-reveal{opacity:0;transform:translateY(40px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i)*.11s);}
        .is-revealed .v8-reveal{opacity:1;transform:none;}
        .v8-head{opacity:0;transform:translateY(22px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v8-head{opacity:1;transform:none;}
        .v8-art{transition:transform .55s cubic-bezier(.16,1,.3,1),box-shadow .55s ease;box-shadow:0 22px 34px -20px rgba(59,56,51,.5);}
        .v8-btn:hover .v8-art,.v8-btn:focus-visible .v8-art{transform:translateY(-14px);box-shadow:0 40px 54px -24px rgba(59,56,51,.55);}
        .v8-34{opacity:0;transition:opacity .55s ease;}
        .v8-btn:hover .v8-34,.v8-btn:focus-visible .v8-34{opacity:1;}
        .v8-front{transition:opacity .55s ease;}
        .v8-btn:hover .v8-front,.v8-btn:focus-visible .v8-front{opacity:0;}
        .v8-plinth{background:linear-gradient(180deg,#E9E5DE 0%,#D8D3C9 100%);box-shadow:0 2px 0 rgba(255,255,255,.8) inset,0 -6px 12px rgba(59,56,51,.12) inset,0 18px 30px -18px rgba(59,56,51,.4);}
        .v8-brass{background:linear-gradient(140deg,#D9B87A,#B0843A 55%,#C99A4C);box-shadow:0 1px 2px rgba(59,56,51,.35);}
        @media (prefers-reduced-motion: reduce){.v8-reveal,.v8-head{opacity:1!important;transform:none!important;}.v8-btn:hover .v8-art{transform:none;}}
      `}</style>

      <div className="v8-vein" aria-hidden />

      <div className="v8-head relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#B0843A]" style={jost}>GALLERY III · DEMI-GOLD</p>
        <h2 className="text-[clamp(2.4rem,7vw,5rem)] leading-[0.95]" style={velista} aria-label="Carved in light, set in stone.">
          <SplitText text="Set in stone," className="block" step={0.04} />
          <SplitText text="cast in gold." as="div" className="block italic text-[#B0843A]" style={editorial} delay={0.35} step={0.045} />
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#3B3833]/60" style={editorial}>
          A marble hall of five. Each piece stands on its own plinth — lift one to look closer.
        </p>
      </div>

      <div className="relative mx-auto mt-16 grid max-w-6xl grid-cols-2 items-end gap-6 px-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-7">
        {jewellery.map((p, i) => (
          <div key={p.handle} className="v8-reveal flex flex-col items-center" style={{ ["--i" as string]: i }}>
            <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v8-btn flex w-full flex-col items-center">
              {/* artwork */}
              <div className="v8-art relative z-10 aspect-square w-[86%] overflow-hidden bg-[#F4EBE2]">
                <img src={p.image} alt={p.name} loading="lazy" className="v8-front absolute inset-0 h-full w-full object-cover" />
                {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v8-34 absolute inset-0 h-full w-full object-cover" />}
              </div>
              {/* plinth */}
              <div className={`v8-plinth -mt-1 h-16 w-full ${plinthHeights[i]}`}>
                <div className="mx-auto mt-4 w-[72%]">
                  <div className="v8-brass px-2 py-1.5 text-center">
                    <p className="text-[10px] leading-tight text-[#2E2415]" style={jost}>{p.name.toUpperCase()}</p>
                    <p className="text-[9px] text-[#2E2415]/75" style={jost}>{p.priceLabel} · {p.tag ?? "COLL. 2026"}</p>
                  </div>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="relative mt-16 flex justify-center">
        <Link to="/jewellery" data-magnetic className="group relative inline-flex items-center gap-3 overflow-hidden border border-[#3B3833]/50 px-10 py-4 text-[12px] tracking-[0.32em] text-[#3B3833] transition-colors duration-500 hover:text-[#F6F4F0]" style={jost}>
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#3B3833] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">TOUR THE GALLERY</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look8;
