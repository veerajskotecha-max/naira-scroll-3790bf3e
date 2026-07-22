import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 5 — TERRACOTTA ARCHES (Loewe / Aesop Mediterranean)
   Sun-baked terracotta plaster, tall arch-framed niches in cream,
   earthy architectural calm. Hover warms the niche and turns the
   piece to its 3/4 angle. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const Look5 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden py-24 text-[#3A2016] lg:py-32"
      style={{ background: "linear-gradient(180deg, #C4623C 0%, #B85A38 60%, #A94F30 100%)" }}>
      <style>{`
        .v5-reveal{opacity:0;transform:translateY(44px);transition:opacity .9s ease,transform .9s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i)*.1s);}
        .is-revealed .v5-reveal{opacity:1;transform:none;}
        .v5-head{opacity:0;transform:translateY(22px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v5-head{opacity:1;transform:none;}
        .v5-arch{border-radius:999px 999px 0 0;background:linear-gradient(180deg,#F3E4CE,#EDDABF);box-shadow:inset 0 3px 14px rgba(58,32,22,.28),0 16px 34px -18px rgba(58,32,22,.55);transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s ease;}
        .v5-btn:hover .v5-arch,.v5-btn:focus-visible .v5-arch{transform:translateY(-8px);box-shadow:inset 0 3px 14px rgba(58,32,22,.2),0 26px 46px -20px rgba(58,32,22,.65);}
        .v5-img-wrap{border-radius:999px 999px 0 0;}
        .v5-34{opacity:0;transition:opacity .55s ease;}
        .v5-btn:hover .v5-34,.v5-btn:focus-visible .v5-34{opacity:1;}
        .v5-front{transition:opacity .55s ease;}
        .v5-btn:hover .v5-front,.v5-btn:focus-visible .v5-front{opacity:0;}
        .v5-warm{background:radial-gradient(80% 60% at 50% 100%,rgba(196,98,60,.28),transparent 70%);opacity:0;transition:opacity .5s ease;}
        .v5-btn:hover .v5-warm,.v5-btn:focus-visible .v5-warm{opacity:1;}
        /* plaster texture */
        .v5-plaster{background-image:radial-gradient(rgba(58,32,22,.05) 1px,transparent 1px);background-size:9px 9px;}
        @media (prefers-reduced-motion: reduce){.v5-reveal,.v5-head{opacity:1!important;transform:none!important;}.v5-btn:hover .v5-arch{transform:none;}}
      `}</style>

      <div className="v5-plaster pointer-events-none absolute inset-0 opacity-60" aria-hidden />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#F3E4CE]/50 to-transparent" />

      <div className="v5-head relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#F3E4CE]" style={jost}>THE COURTYARD · DEMI-GOLD</p>
        <h2 className="text-[clamp(2.4rem,7vw,5rem)] leading-[0.95] text-[#FBF3EC]" style={velista} aria-label="Gold, at golden hour.">
          <SplitText text="Gold, at" className="block" step={0.04} />
          <SplitText text="golden hour." as="div" className="block italic text-[#F8D9A8]" style={editorial} delay={0.35} step={0.045} />
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#FBF3EC]/80" style={editorial}>
          Five pieces set into sun-warmed plaster arches. Step close to turn each one.
        </p>
      </div>

      <div className="relative mx-auto mt-16 grid max-w-6xl grid-cols-2 items-end gap-4 px-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-5">
        {jewellery.map((p, i) => (
          <div key={p.handle} className={`v5-reveal ${i % 2 === 1 ? "lg:mb-10" : ""}`} style={{ ["--i" as string]: i }}>
            <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v5-btn block w-full">
              <div className="v5-arch relative p-2.5 pb-0">
                <div className="v5-img-wrap relative aspect-[3/4] overflow-hidden">
                  <img src={p.image} alt={p.name} loading="lazy" className="v5-front absolute inset-0 h-full w-full object-cover" />
                  {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v5-34 absolute inset-0 h-full w-full object-cover" />}
                  <span className="v5-warm pointer-events-none absolute inset-0" aria-hidden />
                  {p.tag && <span className="absolute left-1/2 top-3 -translate-x-1/2 bg-[#3A2016]/80 px-2 py-0.5 text-[8px] tracking-[0.25em] text-[#F3E4CE]" style={jost}>{p.tag}</span>}
                </div>
              </div>
              <div className="mt-3 text-center">
                <h3 className="text-[16px] leading-tight text-[#FBF3EC]" style={velista}>{p.name}</h3>
                <p className="mt-1 text-[12px] tracking-wide text-[#F8D9A8]" style={jost}>{p.priceLabel}</p>
              </div>
            </button>
          </div>
        ))}
      </div>

      <div className="relative mt-14 flex justify-center">
        <Link to="/jewellery" data-magnetic className="group relative inline-flex items-center gap-3 overflow-hidden border border-[#F3E4CE]/70 px-9 py-4 text-[12px] tracking-[0.32em] text-[#F3E4CE] transition-colors duration-500 hover:text-[#A94F30]" style={jost}>
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#F3E4CE] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">WALK THE COURTYARD</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look5;
