import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import brandFlower from "@/assets/lookbook/brand-flower.png";

/* LOOK 9 — BOTANICAL RIOT (Gucci / Zimmermann maximalism)
   Deep garden green crowded with blooming pressed-flower motifs; each
   piece hangs in an ornate double gold frame like a painting in an
   overgrown salon. Hover parts the foliage and turns the piece. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const flowers = [
  { l: "2%", t: "8%", w: 120, r: -20, o: 0.5 },
  { l: "88%", t: "5%", w: 150, r: 30, o: 0.45 },
  { l: "6%", t: "70%", w: 170, r: 12, o: 0.5 },
  { l: "84%", t: "66%", w: 130, r: -34, o: 0.42 },
  { l: "45%", t: "2%", w: 90, r: 60, o: 0.36 },
  { l: "30%", t: "84%", w: 110, r: -8, o: 0.4 },
  { l: "64%", t: "88%", w: 95, r: 40, o: 0.38 },
];

const Look9 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.1 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden py-24 text-[#F3ECDC] lg:py-32"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #2A4F36 0%, #1F3D2A 55%, #16301F 100%)" }}>
      <style>{`
        @keyframes v9-sway{0%,100%{transform:rotate(var(--r)) translateY(0);}50%{transform:rotate(calc(var(--r) + 5deg)) translateY(-10px);}}
        .v9-flower{animation:v9-sway 9s ease-in-out infinite;}
        .v9-reveal{opacity:0;transform:translateY(44px) scale(.94);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i)*.11s);}
        .is-revealed .v9-reveal{opacity:1;transform:none;}
        .v9-head{opacity:0;transform:translateY(24px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v9-head{opacity:1;transform:none;}
        .v9-frame{border:3px solid #C99A4C;outline:1px solid rgba(201,154,76,.55);outline-offset:5px;background:#F4EBE2;box-shadow:0 24px 44px -20px rgba(0,0,0,.65),0 0 0 8px rgba(22,48,31,.9);transition:transform .55s cubic-bezier(.16,1,.3,1),box-shadow .55s ease;}
        .v9-btn:hover .v9-frame,.v9-btn:focus-visible .v9-frame{transform:scale(1.05) rotate(0deg)!important;box-shadow:0 34px 60px -22px rgba(0,0,0,.75),0 0 44px rgba(201,154,76,.35),0 0 0 8px rgba(22,48,31,.9);}
        .v9-34{opacity:0;transition:opacity .55s ease;}
        .v9-btn:hover .v9-34,.v9-btn:focus-visible .v9-34{opacity:1;}
        .v9-front{transition:opacity .55s ease;}
        .v9-btn:hover .v9-front,.v9-btn:focus-visible .v9-front{opacity:0;}
        @media (prefers-reduced-motion: reduce){.v9-reveal,.v9-head{opacity:1!important;transform:none!important;}.v9-flower{animation:none;}.v9-btn:hover .v9-frame{transform:none!important;}}
      `}</style>

      {/* riot of pressed flowers */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {flowers.map((f, i) => (
          <img key={i} src={brandFlower} alt="" loading="lazy"
            className="v9-flower absolute"
            style={{ left: f.l, top: f.t, width: f.w, opacity: f.o, ["--r" as string]: `${f.r}deg`, animationDelay: `${i * 0.9}s`, filter: "sepia(.4) saturate(1.6) hue-rotate(-10deg)" }} />
        ))}
      </div>

      <div className="v9-head relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#E8C57E]" style={jost}>THE OVERGROWN SALON · DEMI-GOLD</p>
        <h2 className="text-[clamp(2.6rem,7.5vw,5.4rem)] leading-[0.92]" style={velista} aria-label="Let the garden in.">
          <SplitText text="Let the" className="block" step={0.05} />
          <SplitText text="garden in." as="div" className="block italic text-[#E8C57E]" style={editorial} delay={0.35} step={0.05} />
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#F3ECDC]/75" style={editorial}>
          Five gilded blooms hung like paintings in an overgrown salon. Part the leaves.
        </p>
      </div>

      <div className="relative mx-auto mt-16 flex max-w-6xl flex-wrap items-start justify-center gap-x-7 gap-y-12 px-6">
        {jewellery.map((p, i) => (
          <div key={p.handle} className={`v9-reveal w-[44%] sm:w-[28%] lg:w-[16.5%] ${i % 2 === 1 ? "lg:mt-12" : ""}`} style={{ ["--i" as string]: i }}>
            <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v9-btn block w-full">
              <div className="v9-frame relative aspect-[4/5] overflow-hidden" style={{ transform: `rotate(${[-2, 1.5, -1, 2, -1.5][i]}deg)` }}>
                <img src={p.image} alt={p.name} loading="lazy" className="v9-front absolute inset-0 h-full w-full object-cover" />
                {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v9-34 absolute inset-0 h-full w-full object-cover" />}
                {p.tag && <span className="absolute left-1/2 top-2 -translate-x-1/2 bg-[#16301F]/85 px-2 py-0.5 text-[8px] tracking-[0.25em] text-[#E8C57E]" style={jost}>{p.tag}</span>}
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-[17px] leading-tight text-[#F3ECDC]" style={velista}>{p.name}</h3>
                <p className="mt-1 text-[12px] tracking-wide text-[#E8C57E]" style={jost}>{p.priceLabel}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="relative mt-14 flex justify-center">
        <Link to="/jewellery" data-magnetic className="group relative inline-flex items-center gap-3 overflow-hidden border border-[#E8C57E]/70 px-9 py-4 text-[12px] tracking-[0.32em] text-[#E8C57E] transition-colors duration-500 hover:text-[#16301F]" style={jost}>
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#E8C57E] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">WANDER THE SALON</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look9;
