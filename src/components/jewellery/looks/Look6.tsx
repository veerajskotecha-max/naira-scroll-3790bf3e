import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 6 — BRUTALIST CONCRETE (Off-White / Balenciaga)
   Raw concrete grey, hard visible grid, monospaced tabular spec labels,
   quotation-mark tags, blunt captions. Hover snaps to 3/4 with a hard cut. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const mono = { fontFamily: "'Courier New', Courier, monospace" } as const;

const Look6 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden bg-[#C9C6BE] py-20 text-[#161616] lg:py-28">
      <style>{`
        .v6-reveal{opacity:0;transition:opacity .5s steps(3);transition-delay:calc(var(--i)*.07s);}
        .is-revealed .v6-reveal{opacity:1;}
        .v6-cell{border:1px solid #161616;background:#D4D1C9;transition:background-color .15s steps(2);}
        .v6-cell:hover,.v6-cell:focus-visible{background:#E8E5DD;}
        .v6-34{opacity:0;}
        .v6-cell:hover .v6-34,.v6-cell:focus-visible .v6-34{opacity:1;transition:opacity .1s steps(1);}
        .v6-cell:hover .v6-front,.v6-cell:focus-visible .v6-front{opacity:0;transition:opacity .1s steps(1);}
        .v6-strike{position:relative;}
        .v6-strike::after{content:"";position:absolute;left:0;right:0;top:52%;height:2px;background:#D8452B;transform:scaleX(0);transform-origin:left;transition:transform .25s steps(4);}
        .v6-cell:hover .v6-strike::after{transform:scaleX(1);}
        @media (prefers-reduced-motion: reduce){.v6-reveal{opacity:1!important;}}
      `}</style>

      {/* hard grid lines */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden
        style={{ backgroundImage: "linear-gradient(#161616 1px, transparent 1px), linear-gradient(90deg, #161616 1px, transparent 1px)", backgroundSize: "72px 72px" }} />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b-4 border-[#161616] pb-5">
          <div>
            <p className="text-[12px] font-bold tracking-[0.2em]" style={mono}>"JEWELLERY" — SECTION 07</p>
            <h2 className="mt-2 text-[clamp(2.6rem,8vw,5.6rem)] font-bold uppercase leading-[0.86] tracking-tight" style={{ fontFamily: "Arial Black, Arial, sans-serif" }}>
              DEMI-GOLD<br /><span className="text-[#D8452B]">c/o NAIRA FLORE</span>
            </h2>
          </div>
          <p className="max-w-[240px] text-[11px] leading-relaxed" style={mono}>
            18K GOLD-PLATED. PRESSED FLOWERS. FIVE UNITS. MADE TO ORDER. NASHIK, IN.
          </p>
        </div>

        <div className="mt-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {jewellery.map((p, i) => (
            <div key={p.handle} className="v6-reveal" style={{ ["--i" as string]: i }}>
              <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v6-cell block w-full -ml-px -mt-px text-left">
                <div className="border-b border-[#161616] p-2">
                  <p className="text-[10px] font-bold" style={mono}>UNIT {String(i + 1).padStart(2, "0")}/05 {p.tag ? `— "${p.tag}"` : ""}</p>
                </div>
                <div className="relative aspect-square overflow-hidden border-b border-[#161616]">
                  <img src={p.image} alt={p.name} loading="lazy" className="v6-front absolute inset-0 h-full w-full object-cover" />
                  {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v6-34 absolute inset-0 h-full w-full object-cover" />}
                  <span className="absolute bottom-1 right-2 text-[9px] font-bold" style={mono}>FIG. {i + 1}A</span>
                </div>
                <div className="p-3">
                  <h3 className="text-[19px] leading-tight" style={velista}>{p.name}</h3>
                  <p className="v6-strike mt-1 inline-block text-[11px]" style={mono}>{p.materials.toUpperCase().slice(0, 30)}</p>
                  <p className="mt-2 text-[15px] font-bold" style={mono}>{p.priceLabel}</p>
                </div>
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between border-t-4 border-[#161616] pt-5">
          <p className="text-[11px] font-bold" style={mono}>EDITION 2026. ALL RIGHTS PRESSED.</p>
          <Link to="/jewellery" className="bg-[#161616] px-8 py-3 text-[12px] font-bold tracking-[0.2em] text-[#C9C6BE] transition-colors hover:bg-[#D8452B]" style={mono}>
            VIEW "ALL UNITS" →
          </Link>
        </div>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look6;
