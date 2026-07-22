import ringFront from "@/assets/jewellery/ring-cut-front.png";
import heroSilk from "@/assets/jewellery/zircone-hero.jpg";

/* VARIATION 3 — CINEMATIC MACRO
   Film-launch energy: a slow macro push on the silk hero, an oversized
   kinetic wordmark, the cut ring pulling focus in front, and a lens-
   flare streak that sweeps across on beat. (Autoplays for review.) */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const RingCinematic = () => (
  <section className="relative flex min-h-[86vh] items-center justify-center overflow-hidden bg-[#EFE3D6] px-6 py-20 text-[#1A1614]">
    <style>{`
      @keyframes cn-push { 0%,100% { transform: scale(1.05);} 50% { transform: scale(1.14);} }
      @keyframes cn-flare { 0% { transform: translateX(-60%) rotate(18deg); opacity:0;} 12% { opacity:.9;} 40%,100% { transform: translateX(220%) rotate(18deg); opacity:0;} }
      @keyframes cn-float { 0%,100% { transform: translateY(0) rotate(-4deg);} 50% { transform: translateY(-14px) rotate(4deg);} }
      .cn-bg { animation: cn-push 16s ease-in-out infinite; }
      .cn-flare { animation: cn-flare 6s ease-in-out infinite; }
      .cn-ring { animation: cn-float 7s ease-in-out infinite; }
      @media (prefers-reduced-motion: reduce){ .cn-bg,.cn-flare,.cn-ring{ animation:none; } }
    `}</style>

    {/* macro silk backdrop */}
    <img src={heroSilk} alt="" aria-hidden className="cn-bg pointer-events-none absolute inset-0 h-full w-full object-cover opacity-90" />
    <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_60%_at_30%_50%,transparent,rgba(239,227,214,.7))]" />
    {/* lens-flare streak */}
    <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-24 mix-blend-screen" aria-hidden>
      <div className="cn-flare h-full w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,246,222,.9) 45%, rgba(255,255,255,1) 50%, rgba(255,246,222,.9) 55%, transparent)", filter: "blur(2px)" }} />
    </div>

    <div className="relative z-10 grid w-full max-w-5xl grid-cols-1 items-center gap-6 lg:grid-cols-2">
      {/* kinetic wordmark */}
      <div className="text-center lg:text-left">
        <p className="mb-4 text-[10px] tracking-[0.5em] text-[#9A7634]" style={jost}>THE ZIRCONE EDIT · DEMI-GOLD</p>
        <h2 className="text-[clamp(3rem,12vw,7rem)] font-medium leading-[0.82]" style={velista}>
          Brilliant.
          <span className="block italic text-[#B0843A]" style={editorial}>Cut.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-xs text-[14px] leading-relaxed text-[#1A1614]/70 lg:mx-0" style={editorial}>
          One brilliant-cut white zircone, four gold claws. Cut like a diamond, priced like a flower.
        </p>
        <span className="mt-6 inline-block text-[13px] tracking-wide text-[#1A1614]" style={jost}>The Zircone Solitaire · Pre-order open</span>
      </div>
      {/* ring pulling focus */}
      <div className="relative mx-auto w-[min(64vw,320px)]">
        <div className="pointer-events-none absolute inset-[-8%] rounded-full [background:radial-gradient(circle,rgba(255,255,255,.5)_0%,transparent_62%)]" aria-hidden />
        <img src={ringFront} alt="The Zircone Solitaire" className="cn-ring relative z-10 h-full w-full object-contain drop-shadow-[0_30px_50px_rgba(122,90,40,.4)]" draggable={false} />
      </div>
    </div>
  </section>
);

export default RingCinematic;
