import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 4 — MIDNIGHT CONSTELLATION (Van Cleef celestial)
   Deep navy sky, gold constellation lines threading the pieces like
   stars in a chart, faint twinkles. Round gold-rimmed lockets that
   light and turn to 3/4 on hover. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const pos = [
  { x: "12%", y: "22%" },
  { x: "34%", y: "60%" },
  { x: "54%", y: "18%" },
  { x: "72%", y: "56%" },
  { x: "88%", y: "30%" },
];
const pts = [[13, 30], [35, 66], [55, 26], [73, 62], [89, 38]];
const twinkles = [[8, 60], [26, 18], [45, 78], [62, 40], [80, 14], [92, 66], [20, 44], [68, 84]];

const Look4 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.14 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden py-24 text-[#EAE6F2] lg:py-32"
      style={{ background: "radial-gradient(130% 90% at 50% 10%, #232C5C 0%, #141B44 50%, #0C1030 100%)" }}>
      <style>{`
        .v4-reveal{opacity:0;transform:translateY(30px) scale(.9);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i)*.12s);}
        .is-revealed .v4-reveal{opacity:1;transform:none;}
        .v4-head{opacity:0;transform:translateY(22px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v4-head{opacity:1;transform:none;}
        @keyframes v4-tw{0%,100%{opacity:.15;transform:scale(.5);}50%{opacity:1;transform:scale(1);}}
        .v4-star{animation:v4-tw 3.4s ease-in-out infinite;}
        .v4-line{stroke-dasharray:4 6;opacity:0;transition:opacity 1.2s ease .6s;}
        .is-revealed .v4-line{opacity:.45;}
        .v4-disc{transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s ease;box-shadow:0 0 0 1px rgba(232,197,126,.5),0 10px 30px -8px rgba(0,0,0,.6);}
        .v4-btn:hover .v4-disc,.v4-btn:focus-visible .v4-disc{transform:scale(1.09);box-shadow:0 0 0 2px #E8C57E,0 0 44px rgba(232,197,126,.55);}
        .v4-34{opacity:0;transition:opacity .55s ease;}
        .v4-btn:hover .v4-34,.v4-btn:focus-visible .v4-34{opacity:1;}
        .v4-front{transition:opacity .55s ease;}
        .v4-btn:hover .v4-front,.v4-btn:focus-visible .v4-front{opacity:0;}
        @media (prefers-reduced-motion: reduce){.v4-reveal,.v4-head{opacity:1!important;transform:none!important;}.v4-star{animation:none;}.v4-btn:hover .v4-disc{transform:none;}}
      `}</style>

      <div className="v4-head relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#E8C57E]" style={jost}>THE NIGHT EDIT · DEMI-GOLD</p>
        <h2 className="text-[clamp(2.4rem,7vw,5rem)] leading-[0.95]" style={velista} aria-label="Written in gold.">
          <SplitText text="Written" className="block" step={0.05} />
          <SplitText text="in gold." as="div" className="block italic text-[#E8C57E]" style={editorial} delay={0.35} step={0.05} />
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#EAE6F2]/70" style={editorial}>
          Five pieces, plotted like a constellation. Follow the gold to each one.
        </p>
      </div>

      {/* constellation field */}
      <div className="relative mx-auto mt-12 flex max-w-6xl flex-wrap items-start justify-center gap-x-8 gap-y-12 px-6 lg:mt-8 lg:block lg:h-[560px]">
        {/* lines + twinkles (lg only) */}
        <svg className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block" viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden>
          <polyline className="v4-line" points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="#E8C57E" strokeWidth="0.25" vectorEffect="non-scaling-stroke" />
        </svg>
        <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
          {twinkles.map(([x, y], i) => (
            <span key={i} className="v4-star absolute h-1 w-1 rounded-full bg-[#E8C57E]" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${i * 0.4}s` }} />
          ))}
        </div>

        {jewellery.map((p, i) => (
          <div key={p.handle} className="v4-reveal w-[42%] sm:w-[28%] lg:absolute lg:w-[15%] lg:-translate-x-1/2 lg:-translate-y-1/2"
            style={{ ["--i" as string]: i, left: pos[i].x, top: pos[i].y }}>
            <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v4-btn block w-full">
              <div className="v4-disc relative mx-auto aspect-square w-full overflow-hidden bg-[#F4EBE2]" style={{ borderRadius: "50%" }}>
                <img src={p.image} alt={p.name} loading="lazy" className="v4-front absolute inset-0 h-full w-full scale-[1.04] object-cover" />
                {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v4-34 absolute inset-0 h-full w-full scale-[1.04] object-cover" />}
              </div>
              <h3 className="mt-3 text-center text-[15px] leading-tight text-[#EAE6F2]" style={velista}>{p.name}</h3>
              <p className="mt-0.5 text-center text-[12px] text-[#E8C57E]" style={jost}>{p.priceLabel}</p>
            </button>
          </div>
        ))}
      </div>

      <div className="relative mt-8 flex justify-center lg:mt-4">
        <Link to="/jewellery" data-magnetic className="group relative inline-flex items-center gap-3 overflow-hidden border border-[#E8C57E]/60 px-9 py-4 text-[12px] tracking-[0.32em] text-[#E8C57E] transition-colors duration-500 hover:text-[#0C1030]" style={jost}>
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#E8C57E] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">CHART THE COLLECTION</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look4;
