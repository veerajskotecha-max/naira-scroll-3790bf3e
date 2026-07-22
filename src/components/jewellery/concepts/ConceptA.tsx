import { useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import SpinStage from "@/components/jewellery/SpinStage";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import modelIvory from "@/assets/jewellery/model-ivory.jpg";

/* CONCEPT A — THE IVORY ATELIER
   Brand-light and exact: on-model campaign portrait on the left, a big
   tactile drag-to-spin stage on the right with a five-piece selector.
   Quiet gold, generous whitespace, Toteme-grade restraint. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const ConceptA = () => {
  const [idx, setIdx] = useState(0);
  const [qv, setQv] = useState<JewelPiece | null>(null);
  const piece = jewellery[idx];

  return (
    <section id="jewellery" className="relative overflow-hidden bg-[#FBF3EC] py-20 text-[#1A1614] lg:py-28">
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_45%_at_80%_0%,rgba(255,189,168,0.16)_0%,transparent_60%)]" />
      <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 lg:grid-cols-2 lg:gap-14">
        {/* model */}
        <div className="relative order-2 lg:order-1">
          <img src={modelIvory} alt="Chandbali Florale worn — Naira Flore demi-gold campaign" className="w-full object-cover shadow-[0_30px_60px_-30px_rgba(122,90,40,0.5)]" />
          <span className="absolute bottom-4 left-4 bg-[#FBF3EC]/90 px-3 py-1.5 text-[9px] tracking-[0.3em] text-[#9A7634]" style={jost}>WORN · CHANDBALI FLORALE</span>
        </div>

        {/* spin console */}
        <div className="order-1 flex flex-col items-center text-center lg:order-2">
          <p className="mb-4 text-[11px] tracking-[0.5em] text-[#B0843A]" style={jost}>NAIRA FLORE · DEMI-GOLD</p>
          <h2 className="text-[clamp(2.2rem,5.5vw,3.8rem)] leading-[1.0]" style={velista} aria-label="Turn it in your hand.">
            <SplitText text="Turn it" className="block" step={0.04} />
            <SplitText text="in your hand." as="div" className="block italic text-[#B0843A]" style={editorial} delay={0.35} step={0.04} />
          </h2>

          <div className="mt-8 w-full max-w-[380px]">
            <div className="bg-[#F4EBE2] p-3 shadow-[0_24px_50px_-30px_rgba(122,90,40,0.55)]">
              <SpinStage key={piece.handle} piece={piece} onTap={() => setQv(piece)} className="aspect-square w-full overflow-hidden" />
            </div>
            {/* selector */}
            <div className="mt-4 flex justify-center gap-2.5">
              {jewellery.map((p, i) => (
                <button key={p.handle} onClick={() => setIdx(i)} aria-label={p.name}
                  className={`h-14 w-14 overflow-hidden border transition-all duration-300 ${i === idx ? "border-[#B0843A] opacity-100" : "border-transparent opacity-55 hover:opacity-90"}`}>
                  <img src={p.image} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <h3 className="mt-6 text-[26px]" style={velista}>{piece.name}</h3>
          <p className="mt-1 text-[13px] italic text-[#1A1614]/55" style={editorial}>{piece.materials}</p>
          <p className="mt-2 text-[15px] tracking-wide" style={jost}>{piece.priceLabel}</p>
          <div className="mt-6 flex items-center gap-4">
            <button onClick={() => setQv(piece)} className="group relative inline-flex items-center gap-2 overflow-hidden border border-[#1A1614] px-8 py-3.5 text-[11px] tracking-[0.3em] text-[#1A1614] transition-colors duration-500 hover:text-[#FBF3EC]" style={jost}>
              <span className="absolute inset-0 origin-left scale-x-0 bg-[#1A1614] transition-transform duration-500 ease-out group-hover:scale-x-100" />
              <span className="relative">ENQUIRE TO ORDER</span>
            </button>
            <Link to="/jewellery" className="border-b border-[#B0843A] pb-0.5 text-[11px] tracking-[0.25em] text-[#9A7634]" style={jost}>VIEW ALL →</Link>
          </div>
        </div>
      </div>
      <JewelQuickView piece={qv} open={!!qv} onOpenChange={(o) => { if (!o) setQv(null); }} />
    </section>
  );
};

export default ConceptA;
