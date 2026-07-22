import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 7 — LIQUID CHROME (Rimowa / Apple product design)
   Cool silver gradient world, brushed-metal tiles, a moving specular
   sweep, metallic gradient type. Hover = chrome ripple + 3/4 turn. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const Look7 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.12 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden py-24 text-[#20242A] lg:py-32"
      style={{ background: "linear-gradient(160deg, #EEF1F4 0%, #DDE3E8 45%, #C6CDD4 100%)" }}>
      <style>{`
        @keyframes v7-sheen{0%{background-position:-180% 0;}100%{background-position:280% 0;}}
        .v7-reveal{opacity:0;transform:translateY(34px);transition:opacity .8s ease,transform .8s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i)*.09s);}
        .is-revealed .v7-reveal{opacity:1;transform:none;}
        .v7-head{opacity:0;transform:translateY(20px);transition:opacity 1s ease,transform 1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v7-head{opacity:1;transform:none;}
        .v7-chrome-text{background:linear-gradient(100deg,#5B646E 0%,#B9C2CC 28%,#F5F8FB 50%,#8A939E 72%,#3E454E 100%);-webkit-background-clip:text;background-clip:text;color:transparent;}
        .v7-tile{background:linear-gradient(145deg,#F2F5F8,#D5DBE1);box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 -1px 0 rgba(32,36,42,.14) inset,0 20px 40px -22px rgba(32,36,42,.5);transition:transform .5s cubic-bezier(.16,1,.3,1),box-shadow .5s ease;}
        .v7-btn:hover .v7-tile,.v7-btn:focus-visible .v7-tile{transform:translateY(-7px);box-shadow:0 1px 0 rgba(255,255,255,.95) inset,0 -1px 0 rgba(32,36,42,.14) inset,0 30px 54px -22px rgba(32,36,42,.6);}
        .v7-sweep{background:linear-gradient(110deg,transparent 38%,rgba(255,255,255,.85) 50%,transparent 62%);background-size:220% 100%;animation:v7-sheen 4.5s ease-in-out infinite;mix-blend-mode:screen;}
        .v7-34{opacity:0;transition:opacity .5s ease;}
        .v7-btn:hover .v7-34,.v7-btn:focus-visible .v7-34{opacity:1;}
        .v7-front{transition:opacity .5s ease;}
        .v7-btn:hover .v7-front,.v7-btn:focus-visible .v7-front{opacity:0;}
        @media (prefers-reduced-motion: reduce){.v7-reveal,.v7-head{opacity:1!important;transform:none!important;}.v7-sweep{animation:none;}.v7-btn:hover .v7-tile{transform:none;}}
      `}</style>

      <div className="v7-head relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#5B646E]" style={jost}>PRECISION LINE · DEMI-GOLD</p>
        <h2 className="text-[clamp(2.6rem,7.5vw,5.4rem)] leading-[0.92]" style={velista} aria-label="Engineered to bloom.">
          <span className="v7-chrome-text block" style={velista}>Engineered</span>
          <SplitText text="to bloom." as="div" className="block italic text-[#20242A]" style={editorial} delay={0.3} step={0.05} />
        </h2>
        <p className="mx-auto mt-6 max-w-md text-[15px] leading-relaxed text-[#20242A]/60" style={editorial}>
          Five demi-gold instruments, machined soft. Calibrated to catch the light.
        </p>
      </div>

      <div className="relative mx-auto mt-16 grid max-w-6xl grid-cols-2 gap-5 px-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-6">
        {jewellery.map((p, i) => (
          <div key={p.handle} className="v7-reveal" style={{ ["--i" as string]: i }}>
            <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v7-btn block w-full">
              <div className="v7-tile relative overflow-hidden p-2.5" style={{ borderRadius: "18px" }}>
                <div className="relative aspect-square overflow-hidden" style={{ borderRadius: "12px" }}>
                  <img src={p.image} alt={p.name} loading="lazy" className="v7-front absolute inset-0 h-full w-full object-cover" />
                  {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v7-34 absolute inset-0 h-full w-full object-cover" />}
                  <span className="v7-sweep pointer-events-none absolute inset-0" aria-hidden />
                </div>
                <div className="flex items-center justify-between px-1.5 pb-1 pt-2.5">
                  <span className="text-[10px] tracking-[0.2em] text-[#5B646E]" style={jost}>N-{String(i + 1).padStart(2, "0")}</span>
                  {p.tag && <span className="text-[9px] tracking-[0.2em] text-[#20242A]/50" style={jost}>{p.tag}</span>}
                </div>
              </div>
              <h3 className="mt-3 text-center text-[17px] leading-tight" style={velista}>{p.name}</h3>
              <p className="mt-1 text-center text-[13px] text-[#5B646E]" style={jost}>{p.priceLabel}</p>
            </button>
          </div>
        ))}
      </div>

      <div className="relative mt-14 flex justify-center">
        <Link to="/jewellery" data-magnetic className="inline-flex items-center gap-3 px-10 py-4 text-[12px] tracking-[0.3em] text-[#F5F8FB] transition-transform duration-300 hover:scale-[1.03]" style={{ ...jost, background: "linear-gradient(145deg,#3E454E,#20242A)", borderRadius: "999px", boxShadow: "0 1px 0 rgba(255,255,255,.25) inset, 0 14px 30px -12px rgba(32,36,42,.6)" }}>
          EXPLORE THE LINE <span>→</span>
        </Link>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look7;
