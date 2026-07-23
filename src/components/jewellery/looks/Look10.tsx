import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* LOOK 10 — IVORY COUTURE (Toteme / The Row, awwwards-refined)
   The quietest and most exact: warm ivory, generous whitespace, a
   centered hero piece flanked by four, hairline gold rules, one
   restrained signature motion — lift + turn to 3/4. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

// hero (chandbali) in the middle, others flanking
const order = ["the-cascade", "the-halo", "the-braided-hoop", "the-vine", "the-studs"];
const pieces = order.map((h) => jewellery.find((j) => j.handle === h)!).filter(Boolean);

const Look10 = () => {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } }, { threshold: 0.14 });
    io.observe(el); return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} id="jewellery" className="relative overflow-hidden bg-[#FBF3EC] py-24 text-[#1A1614] lg:py-36">
      <style>{`
        .v10-reveal{opacity:0;transform:translateY(36px);transition:opacity 1.1s cubic-bezier(.16,1,.3,1),transform 1.1s cubic-bezier(.16,1,.3,1);transition-delay:calc(var(--i)*.12s);}
        .is-revealed .v10-reveal{opacity:1;transform:none;}
        .v10-head{opacity:0;transform:translateY(20px);transition:opacity 1.1s ease,transform 1.1s cubic-bezier(.16,1,.3,1);}
        .is-revealed .v10-head{opacity:1;transform:none;}
        .v10-rule{transition:width 1.2s cubic-bezier(.16,1,.3,1) .5s;}
        .is-revealed .v10-rule{width:220px;}
        .v10-img{transition:transform .6s cubic-bezier(.16,1,.3,1),box-shadow .6s ease;box-shadow:0 18px 40px -26px rgba(122,90,40,.5);}
        .v10-btn:hover .v10-img,.v10-btn:focus-visible .v10-img{transform:translateY(-10px);box-shadow:0 34px 54px -28px rgba(122,90,40,.6);}
        .v10-34{opacity:0;transition:opacity .6s ease;}
        .v10-btn:hover .v10-34,.v10-btn:focus-visible .v10-34{opacity:1;}
        .v10-front{transition:opacity .6s ease;}
        .v10-btn:hover .v10-front,.v10-btn:focus-visible .v10-front{opacity:0;}
        .v10-underline{transition:width .5s cubic-bezier(.16,1,.3,1);}
        .v10-btn:hover .v10-underline,.v10-btn:focus-visible .v10-underline{width:44px;}
        @media (prefers-reduced-motion: reduce){.v10-reveal,.v10-head{opacity:1!important;transform:none!important;}.v10-btn:hover .v10-img{transform:none;}}
      `}</style>

      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_45%_at_50%_0%,rgba(255,189,168,0.14)_0%,transparent_60%)]" />

      <div className="v10-head relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-6 text-[11px] tracking-[0.55em] text-[#B0843A]" style={jost}>NAIRA FLORE · DEMI-GOLD</p>
        <h2 className="text-[clamp(2.4rem,6.5vw,4.8rem)] leading-[1.02]" style={velista} aria-label="Five pieces. One quiet hand.">
          <SplitText text="Five pieces." className="block" step={0.04} />
          <SplitText text="One quiet hand." as="div" className="block italic text-[#B0843A]" style={editorial} delay={0.4} step={0.04} />
        </h2>
        <span className="v10-rule mx-auto mt-9 block h-px w-0 bg-gradient-to-r from-transparent via-[#C99A4C] to-transparent" />
      </div>

      <div className="relative mx-auto mt-16 grid max-w-6xl grid-cols-2 items-end gap-x-6 gap-y-12 px-6 sm:grid-cols-3 lg:mt-20 lg:grid-cols-5 lg:gap-x-8">
        {pieces.map((p, i) => {
          const hero = i === 2;
          return (
            <div key={p.handle} className={`v10-reveal ${hero ? "order-first col-span-2 sm:order-none sm:col-span-1" : ""}`} style={{ ["--i" as string]: i }}>
              <button type="button" onClick={() => setActive(p)} aria-label={`${p.name}, ${p.priceLabel}`} className="v10-btn block w-full">
                <div className={`v10-img relative overflow-hidden bg-[#F4EBE2] ${hero ? "aspect-[4/5]" : "aspect-square"}`}>
                  <img src={p.image} alt={p.name} loading="lazy" className="v10-front absolute inset-0 h-full w-full object-cover" />
                  {p.gallery?.[1] && <img src={p.gallery[1]} alt="" aria-hidden loading="lazy" className="v10-34 absolute inset-0 h-full w-full object-cover" />}
                  {p.tag && <span className="absolute left-3 top-3 border border-[#C99A4C]/45 bg-[#FBF3EC]/85 px-2 py-0.5 text-[8px] tracking-[0.28em] text-[#9A7634]" style={jost}>{p.tag}</span>}
                </div>
                <div className="mt-4 text-center">
                  <h3 className={`leading-tight ${hero ? "text-[22px]" : "text-[17px]"}`} style={velista}>{p.name}</h3>
                  <p className="mt-1 text-[12px] italic text-[#1A1614]/50" style={editorial}>{p.category === "Rings" ? "ring" : "earrings"} · 18k demi-gold</p>
                  <p className="mt-1.5 text-[13px] tracking-wide text-[#1A1614]/85" style={jost}>{p.priceLabel}</p>
                  <span className="v10-underline mx-auto mt-2 block h-px w-0 bg-[#C99A4C]" />
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="relative mt-20 flex flex-col items-center gap-3">
        <Link to="/jewellery" data-magnetic className="group relative inline-flex items-center gap-3 overflow-hidden border border-[#1A1614] px-11 py-4 text-[12px] tracking-[0.34em] text-[#1A1614] transition-colors duration-500 hover:text-[#FBF3EC]" style={jost}>
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#1A1614] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">VIEW THE COLLECTION</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
        <p className="text-[11px] tracking-[0.2em] text-[#1A1614]/40" style={jost}>PRESSED &amp; PLATED TO ORDER</p>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Look10;
