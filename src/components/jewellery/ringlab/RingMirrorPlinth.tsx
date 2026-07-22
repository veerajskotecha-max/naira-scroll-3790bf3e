import ringFront from "@/assets/jewellery/ring-cut-front.png";

/* VARIATION 2 — MIRROR PLINTH
   Boutique glass-shelf presentation: the ring stands on a polished
   surface with a soft mirrored reflection beneath it, and a bar of
   studio light sweeps horizontally across the scene on a slow loop.
   Reads as a lit display case. (Autoplays for review.) */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const RingMirrorPlinth = () => (
  <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-[#1A1614]"
    style={{ background: "linear-gradient(180deg, #FBF3EC 0%, #F4EBE2 58%, #E7DCCF 58.2%, #EFE6D9 100%)" }}>
    <style>{`
      @keyframes mp-sweep { 0% { transform: translateX(-120%) skewX(-14deg);} 60%,100% { transform: translateX(320%) skewX(-14deg);} }
      @keyframes mp-hover { 0%,100% { transform: translateY(0);} 50% { transform: translateY(-8px);} }
      .mp-sweep { animation: mp-sweep 5.5s cubic-bezier(.5,0,.2,1) infinite; }
      .mp-hover { animation: mp-hover 6s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce){ .mp-sweep,.mp-hover{ animation:none; } }
    `}</style>

    <p className="mb-4 text-[10px] tracking-[0.5em] text-[#B0843A]" style={jost}>THE ZIRCONE EDIT · DEMI-GOLD</p>
    <h2 className="mb-8 text-center text-[clamp(1.8rem,5vw,3rem)] leading-tight" style={velista}>
      Under <span className="italic text-[#B0843A]" style={editorial}>studio light.</span>
    </h2>

    <div className="relative w-[min(70vw,300px)]">
      {/* the ring, standing on the line */}
      <div className="mp-hover relative z-10">
        <img src={ringFront} alt="The Zircone Solitaire" className="h-full w-full object-contain" draggable={false} />
      </div>
      {/* mirrored reflection */}
      <div className="pointer-events-none absolute left-0 top-full w-full -scale-y-100" aria-hidden
        style={{ opacity: 0.28, WebkitMaskImage: "linear-gradient(to bottom, #000, transparent 62%)", maskImage: "linear-gradient(to bottom, #000, transparent 62%)", filter: "blur(1px)" }}>
        <img src={ringFront} alt="" className="h-full w-full object-contain" draggable={false} />
      </div>
      {/* contact glow on the shelf */}
      <div className="pointer-events-none absolute -bottom-2 left-1/2 h-6 w-[70%] -translate-x-1/2 rounded-full opacity-70" aria-hidden
        style={{ background: "radial-gradient(ellipse, rgba(122,90,40,.4) 0%, transparent 70%)", filter: "blur(6px)" }} />
      {/* sweeping light bar */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 mix-blend-screen" aria-hidden>
        <div className="mp-sweep h-full w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.85), transparent)" }} />
      </div>
    </div>

    <p className="relative z-10 mt-16 text-[13px] tracking-wide text-[#1A1614]/70" style={jost}>The Zircone Solitaire · Pre-order open</p>
  </section>
);

export default RingMirrorPlinth;
