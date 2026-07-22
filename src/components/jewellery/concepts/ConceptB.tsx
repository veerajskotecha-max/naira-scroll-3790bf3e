import { useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import SpinStage from "@/components/jewellery/SpinStage";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import modelEmerald from "@/assets/jewellery/model-emerald.jpg";

/* CONCEPT B — THE EMERALD JEWEL BOX
   Deep emerald velvet night. The dramatic rim-lit campaign portrait on
   one side; a gold-mullioned, spot-lit vitrine holding the drag-to-spin
   stage on the other. Cartier-counter-at-midnight energy. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const ConceptB = () => {
  const [idx, setIdx] = useState(2); // open on the statement chandbali
  const [qv, setQv] = useState<JewelPiece | null>(null);
  const piece = jewellery[idx];

  return (
    <section id="jewellery" className="relative overflow-hidden py-20 text-[#F4E9DD] lg:py-28"
      style={{ background: "radial-gradient(120% 85% at 50% -10%, #16553F 0%, #0E3B2E 55%, #082820 100%)" }}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E8C57E]/60 to-transparent" />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-14">
        {/* vitrine spin console */}
        <div className="flex flex-col items-center text-center">
          <p className="mb-4 text-[11px] tracking-[0.5em] text-[#E8C57E]" style={jost}>THE JEWEL BOX · DEMI-GOLD</p>
          <h2 className="text-[clamp(2.2rem,5.5vw,3.8rem)] leading-[1.0]" style={velista} aria-label="Spin it toward the light.">
            <SplitText text="Spin it toward" className="block" step={0.035} />
            <SplitText text="the light." as="div" className="block italic text-[#E8C57E]" style={editorial} delay={0.35} step={0.05} />
          </h2>

          <div className="mt-8 w-full max-w-[380px]">
            {/* lit vitrine */}
            <div className="relative p-3" style={{ background: "linear-gradient(180deg,#0C3325,#0A2A20)", boxShadow: "inset 0 2px 24px rgba(0,0,0,.6), inset 0 0 0 1px rgba(232,197,126,.4)" }}>
              <span className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(75% 55% at 50% 0%, rgba(232,197,126,.30), transparent 70%)" }} aria-hidden />
              <div className="relative bg-[#F4EBE2]">
                <SpinStage key={piece.handle} piece={piece} onTap={() => setQv(piece)} className="aspect-square w-full overflow-hidden" chipBg="rgba(14,59,46,.85)" hintColor="#E8C57E" />
              </div>
            </div>
            {/* gold coin selector */}
            <div className="mt-5 flex justify-center gap-3">
              {jewellery.map((p, i) => (
                <button key={p.handle} onClick={() => setIdx(i)} aria-label={p.name}
                  className={`h-12 w-12 overflow-hidden rounded-full border-2 transition-all duration-300 ${i === idx ? "border-[#E8C57E] shadow-[0_0_18px_rgba(232,197,126,.5)]" : "border-[#E8C57E]/25 opacity-60 hover:opacity-100"}`}>
                  <img src={p.image} alt="" className="h-full w-full scale-[1.2] object-cover" />
                </button>
              ))}
            </div>
          </div>

          <h3 className="mt-6 text-[26px] text-[#F4E9DD]" style={velista}>{piece.name}</h3>
          <p className="mt-1 text-[13px] italic text-[#F4E9DD]/55" style={editorial}>{piece.materials}</p>
          <p className="mt-2 text-[15px] tracking-wide text-[#E8C57E]" style={jost}>{piece.priceLabel}</p>
          <div className="mt-6 flex items-center gap-4">
            <button onClick={() => setQv(piece)} className="group relative inline-flex items-center gap-2 overflow-hidden border border-[#E8C57E]/70 px-8 py-3.5 text-[11px] tracking-[0.3em] text-[#E8C57E] transition-colors duration-500 hover:text-[#0E3B2E]" style={jost}>
              <span className="absolute inset-0 origin-left scale-x-0 bg-[#E8C57E] transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <span className="relative">ENQUIRE TO ORDER</span>
            </button>
            <Link to="/jewellery" className="border-b border-[#E8C57E]/70 pb-0.5 text-[11px] tracking-[0.25em] text-[#E8C57E]" style={jost}>VIEW ALL →</Link>
          </div>
        </div>

        {/* model */}
        <div className="relative">
          <img src={modelEmerald} alt="Pressed Petal Drops worn — Naira Flore demi-gold campaign" className="w-full object-cover shadow-[0_36px_70px_-30px_rgba(0,0,0,0.8)]" style={{ outline: "1px solid rgba(232,197,126,.35)", outlineOffset: "10px" }} />
          <span className="absolute bottom-4 left-4 bg-[#082820]/85 px-3 py-1.5 text-[9px] tracking-[0.3em] text-[#E8C57E]" style={jost}>WORN · PRESSED PETAL DROPS</span>
        </div>
      </div>
      <JewelQuickView piece={qv} open={!!qv} onOpenChange={(o) => { if (!o) setQv(null); }} />
    </section>
  );
};

export default ConceptB;
