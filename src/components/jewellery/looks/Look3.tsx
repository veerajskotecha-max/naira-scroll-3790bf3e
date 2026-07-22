import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 3 — EDITORIAL MONO + RED (COS / Celine)
   Off-white, ink, one vivid red. Giant index numerals, an editorial
   index-of-pieces. Hover swaps to 3/4 and flushes the row red. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const Look3 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden bg-[#F2F0EB] py-24 text-[#141414] lg:py-32">
      <style>{`
        .v3-reveal{opacity:0;transform:translateY(26px);transition:opacity .8s ease,transform .8s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i)*.08s);}
        .is-revealed .v3-reveal{opacity:1;transform:none;}
        .v3-head{opacity:0;transform:translateY(20px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v3-head{opacity:1;transform:none;}
        .v3-row{transition:background-color .4s ease;}
        .v3-row:hover,.v3-row:focus-visible{background:#EAE7E0;}
        .v3-num,.v3-name{transition:color .35s ease;}
        .v3-row:hover .v3-num,.v3-row:hover .v3-name,.v3-row:focus-visible .v3-num,.v3-row:focus-visible .v3-name{color:#D8452B;}
        .v3-34{opacity:0;transition:opacity .5s ease;}
        .v3-row:hover .v3-34,.v3-row:focus-visible .v3-34{opacity:1;}
        .v3-front{transition:opacity .5s ease;}
        .v3-row:hover .v3-front,.v3-row:focus-visible .v3-front{opacity:0;}
        .v3-go{opacity:0;transform:translateX(-6px);transition:opacity .35s ease,transform .35s ease;}
        .v3-row:hover .v3-go,.v3-row:focus-visible .v3-go{opacity:1;transform:none;}
        @media (prefers-reduced-motion: reduce){.v3-reveal,.v3-head{opacity:1!important;transform:none!important;}}
      `}</style>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-y-8 px-6 lg:grid-cols-12 lg:gap-x-10">
        {/* left rail headline */}
        <div className="v3-head lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
          <p className="mb-5 text-[11px] tracking-[0.4em] text-[#D8452B]" style={jost}>THE EDIT — N°01</p>
          <h2 className="text-[clamp(2.6rem,6vw,4.6rem)] leading-[0.95]" style={velista} aria-label="An index of gold.">
            <SplitText text="An index" className="block" step={0.04} />
            <SplitText text="of gold." as="div" className="block italic" style={editorial} delay={0.3} step={0.05} />
          </h2>
          <p className="mt-6 max-w-xs text-[15px] leading-relaxed text-[#141414]/60" style={editorial}>
            Five demi-gold pieces, filed and numbered. Hover to turn each in the hand.
          </p>
          <span className="mt-8 block h-px w-full bg-[#141414]/20" />
        </div>

        {/* index rows */}
        <div className="lg:col-span-8">
          <span className="block h-px w-full bg-[#141414]/15" />
          {jewellery.map((p, i) => (
            <div key={p.handle} className="v3-reveal" style={{ ["--i" as string]: i }}>
              <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`}
                className="v3-row group flex w-full items-center gap-5 px-3 py-5 text-left md:gap-8">
                <span className="v3-num w-14 shrink-0 text-[34px] leading-none text-[#141414]/30 md:text-[44px]" style={velista}>0{i + 1}</span>
                <div className="relative aspect-square w-20 shrink-0 overflow-hidden bg-[#E7E3DB] md:w-24">
                  <img src={p.image} alt={p.name} loading="lazy" className="v3-front absolute inset-0 h-full w-full object-cover" />
                  {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v3-34 absolute inset-0 h-full w-full object-cover" />}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="v3-name truncate text-[22px] leading-tight md:text-[26px]" style={velista}>{p.name}</h3>
                  <p className="mt-1 truncate text-[12px] italic text-[#141414]/50" style={editorial}>{p.materials}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="block text-[16px]" style={jost}>{p.priceLabel}</span>
                  <span className="v3-go mt-1 block text-[11px] tracking-[0.25em] text-[#D8452B]" style={jost}>VIEW →</span>
                </div>
              </button>
              <span className="block h-px w-full bg-[#141414]/15" />
            </div>
          ))}
          <div className="mt-10 flex justify-end">
            <Link to="/jewellery" data-magnetic className="group inline-flex items-center gap-3 text-[12px] tracking-[0.3em] text-[#141414]" style={jost}>
              <span className="border-b border-[#D8452B] pb-1 text-[#D8452B]">SEE THE FULL INDEX</span>
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look3;
