import { useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import SpinStage from "@/components/jewellery/SpinStage";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import modelTerracotta from "@/assets/jewellery/model-terracotta.jpg";

/* CONCEPT C — GOLDEN HOUR
   Sun-baked terracotta courtyard. The hand-with-marigold campaign shot
   inside a tall plaster arch; beside it the drag-to-spin stage inside its
   own arch niche. Loewe-Mediterranean warmth, everything glowing. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const ConceptC = () => {
  const [idx, setIdx] = useState(0);
  const [qv, setQv] = useState<JewelPiece | null>(null);
  const piece = jewellery[idx];

  return (
    <section id="jewellery" className="relative overflow-hidden py-20 text-[#3A2016] lg:py-28"
      style={{ background: "linear-gradient(180deg, #C4623C 0%, #B85A38 60%, #A94F30 100%)" }}>
      {/* plaster speckle */}
      <div className="pointer-events-none absolute inset-0 opacity-60" aria-hidden
        style={{ backgroundImage: "radial-gradient(rgba(58,32,22,.05) 1px, transparent 1px)", backgroundSize: "9px 9px" }} />

      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-end gap-10 px-6 lg:grid-cols-2 lg:gap-14">
        {/* model in arch */}
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden" style={{ borderRadius: "999px 999px 0 0", boxShadow: "0 30px 60px -28px rgba(58,32,22,.65), inset 0 0 0 6px #F3E4CE" }}>
            <img src={modelTerracotta} alt="Marigold Signet Ring worn — Naira Flore demi-gold campaign" className="w-full object-cover" />
          </div>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#3A2016]/85 px-3 py-1.5 text-[9px] tracking-[0.3em] text-[#F3E4CE]" style={jost}>WORN · MARIGOLD SIGNET</span>
        </div>

        {/* spin console in arch */}
        <div className="order-1 flex flex-col items-center pb-4 text-center lg:order-2">
          <p className="mb-4 text-[11px] tracking-[0.5em] text-[#F3E4CE]" style={jost}>THE COURTYARD · DEMI-GOLD</p>
          <h2 className="text-[clamp(2.2rem,5.5vw,3.8rem)] leading-[1.0] text-[#FBF3EC]" style={velista} aria-label="Gold, turned in the sun.">
            <SplitText text="Gold, turned" className="block" step={0.035} />
            <SplitText text="in the sun." as="div" className="block italic text-[#F8D9A8]" style={editorial} delay={0.35} step={0.05} />
          </h2>

          <div className="mt-8 w-full max-w-[360px]">
            <div className="overflow-hidden p-3 pb-0" style={{ borderRadius: "999px 999px 0 0", background: "linear-gradient(180deg,#F3E4CE,#EDDABF)", boxShadow: "inset 0 3px 16px rgba(58,32,22,.3), 0 24px 46px -22px rgba(58,32,22,.6)" }}>
              <div className="overflow-hidden" style={{ borderRadius: "999px 999px 0 0" }}>
                <SpinStage key={piece.handle} piece={piece} onTap={() => setQv(piece)} className="aspect-[4/5] w-full overflow-hidden" chipBg="rgba(58,32,22,.8)" hintColor="#F3E4CE" />
              </div>
            </div>
            {/* selector */}
            <div className="mt-4 flex justify-center gap-2.5">
              {jewellery.map((p, i) => (
                <button key={p.handle} onClick={() => setIdx(i)} aria-label={p.name}
                  className={`h-12 w-10 overflow-hidden border-2 transition-all duration-300 ${i === idx ? "border-[#F3E4CE]" : "border-[#F3E4CE]/30 opacity-60 hover:opacity-100"}`}
                  style={{ borderRadius: "999px 999px 0 0" }}>
                  <img src={p.image} alt="" className="h-full w-full scale-[1.25] object-cover" />
                </button>
              ))}
            </div>
          </div>

          <h3 className="mt-5 text-[26px] text-[#FBF3EC]" style={velista}>{piece.name}</h3>
          <p className="mt-1 text-[13px] italic text-[#FBF3EC]/70" style={editorial}>{piece.materials}</p>
          <p className="mt-2 text-[15px] tracking-wide text-[#F8D9A8]" style={jost}>{piece.priceLabel}</p>
          <div className="mt-6 flex items-center gap-4">
            <button onClick={() => setQv(piece)} className="group relative inline-flex items-center gap-2 overflow-hidden border border-[#F3E4CE]/80 px-8 py-3.5 text-[11px] tracking-[0.3em] text-[#F3E4CE] transition-colors duration-500 hover:text-[#A94F30]" style={jost}>
              <span className="absolute inset-0 origin-left scale-x-0 bg-[#F3E4CE] transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <span className="relative">ENQUIRE TO ORDER</span>
            </button>
            <Link to="/jewellery" className="border-b border-[#F3E4CE] pb-0.5 text-[11px] tracking-[0.25em] text-[#F3E4CE]" style={jost}>VIEW ALL →</Link>
          </div>
        </div>
      </div>
      <JewelQuickView piece={qv} open={!!qv} onOpenChange={(o) => { if (!o) setQv(null); }} />
    </section>
  );
};

export default ConceptC;
