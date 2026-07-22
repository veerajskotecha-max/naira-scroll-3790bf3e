import { useEffect, useRef } from "react";
import ringFront from "@/assets/jewellery/ring-cut-front.png";

/* VARIATION 1 — LIVING FIRE
   The stone is the star: slow rotating light-caustic rays radiate from
   the diamond, prism twinkles fire on beat, and a specular highlight
   tracks the cursor across the ring so the facets catch the light as
   you move. The ring floats. (Autoplays for review.) */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const RingLivingFire = () => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const specRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current, spec = specRef.current;
    if (!wrap || !spec) return;
    if (!matchMedia("(pointer:fine)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * 100;
      const y = ((e.clientY - r.top) / r.height) * 100;
      spec.style.opacity = "1";
      spec.style.background = `radial-gradient(220px circle at ${x}% ${y}%, rgba(255,255,255,.8), rgba(255,246,222,.2) 30%, transparent 60%)`;
    };
    const out = () => (spec.style.opacity = "0");
    wrap.addEventListener("mousemove", onMove);
    wrap.addEventListener("mouseleave", out);
    return () => { wrap.removeEventListener("mousemove", onMove); wrap.removeEventListener("mouseleave", out); };
  }, []);

  return (
    <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-[#FBF3EC] px-6 py-20 text-[#1A1614]">
      <style>{`
        @keyframes lf-spin { to { transform: rotate(360deg); } }
        @keyframes lf-spin-r { to { transform: rotate(-360deg); } }
        @keyframes lf-float { 0%,100% { transform: translateY(0) rotate(-3deg);} 50% { transform: translateY(-12px) rotate(3deg);} }
        @keyframes lf-tw { 0%,100% { opacity:0; transform:scale(.3);} 50% { opacity:1; transform:scale(1);} }
        .lf-rays { animation: lf-spin 26s linear infinite; }
        .lf-rays2 { animation: lf-spin-r 40s linear infinite; }
        .lf-ring { animation: lf-float 6s ease-in-out infinite; }
        .lf-tw { animation: lf-tw 2.4s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce){ .lf-rays,.lf-rays2,.lf-ring,.lf-tw{ animation:none; } }
      `}</style>

      <p className="mb-4 text-[10px] tracking-[0.5em] text-[#B0843A]" style={jost}>THE ZIRCONE EDIT · DEMI-GOLD</p>
      <h2 className="mb-2 text-center text-[clamp(1.8rem,5vw,3rem)] leading-tight" style={velista}>
        A diamond&rsquo;s <span className="italic text-[#B0843A]" style={editorial}>fire.</span>
      </h2>

      <div ref={wrapRef} className="relative mt-6 h-[min(78vw,340px)] w-[min(78vw,340px)]" style={{ perspective: "1000px" }}>
        {/* caustic rays from the stone */}
        <div className="lf-rays pointer-events-none absolute left-1/2 top-[42%] h-[130%] w-[130%] -translate-x-1/2 -translate-y-1/2 opacity-70 mix-blend-screen"
          style={{ background: "conic-gradient(from 0deg, transparent, rgba(255,246,222,.55) 4%, transparent 8%, transparent 20%, rgba(201,154,76,.35) 24%, transparent 28%, transparent 46%, rgba(255,246,222,.5) 50%, transparent 54%, transparent 72%, rgba(255,189,168,.3) 76%, transparent 80%)", filter: "blur(1px)", borderRadius: "50%", WebkitMaskImage: "radial-gradient(circle, #000 8%, transparent 62%)", maskImage: "radial-gradient(circle, #000 8%, transparent 62%)" }} aria-hidden />
        <div className="lf-rays2 pointer-events-none absolute left-1/2 top-[42%] h-[100%] w-[100%] -translate-x-1/2 -translate-y-1/2 opacity-50 mix-blend-screen"
          style={{ background: "conic-gradient(from 30deg, transparent, rgba(255,255,255,.6) 3%, transparent 6%, transparent 30%, rgba(255,246,222,.4) 34%, transparent 38%, transparent 66%, rgba(255,255,255,.5) 70%, transparent 74%)", filter: "blur(1px)", borderRadius: "50%", WebkitMaskImage: "radial-gradient(circle, #000 6%, transparent 55%)", maskImage: "radial-gradient(circle, #000 6%, transparent 55%)" }} aria-hidden />
        {/* soft glow */}
        <div className="pointer-events-none absolute inset-[6%] rounded-full [background:radial-gradient(circle,rgba(201,154,76,.24)_0%,transparent_60%)]" aria-hidden />

        <img src={ringFront} alt="The Zircone Solitaire" className="lf-ring relative z-10 h-full w-full object-contain" draggable={false} />
        {/* cursor specular */}
        <div ref={specRef} className="pointer-events-none absolute inset-0 z-20 opacity-0 mix-blend-screen transition-opacity duration-200" aria-hidden />
        {/* prism twinkles on the stone */}
        <svg className="lf-tw absolute left-[44%] top-[30%] z-20" width="22" height="22" viewBox="0 0 20 20"><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="#FFF6DE" /></svg>
        <svg className="lf-tw absolute left-[54%] top-[38%] z-20" width="13" height="13" viewBox="0 0 20 20" style={{ animationDelay: "1s" }}><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="#C99A4C" /></svg>
        <svg className="lf-tw absolute left-[40%] top-[40%] z-20" width="10" height="10" viewBox="0 0 20 20" style={{ animationDelay: "1.7s" }}><path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="#FFBDA8" /></svg>
      </div>

      <p className="mt-8 text-[13px] tracking-wide text-[#1A1614]/70" style={jost}>The Zircone Solitaire · Pre-order open</p>
    </section>
  );
};

export default RingLivingFire;
