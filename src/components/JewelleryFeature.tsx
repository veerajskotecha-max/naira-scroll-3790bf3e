import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import { jewellery } from "@/data/jewellery";

/* ───────────────────────────────────────────────────────────────
   JEWELLERY FEATURE — "Naira, now in gold."
   A cinematic, mouse-reactive parallax diorama announcing the demi-gold
   line on the home page. The pieces float as gold-rimmed medallions at
   different depths and drift toward the cursor; a gold halo turns behind
   a kinetic headline. Pure CSS/JS (no GSAP), reduced-motion safe.
   ─────────────────────────────────────────────────────────────── */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const byHandle = (h: string) => jewellery.find((j) => j.handle === h)!;

// position + depth + size for each floating medallion
const medallions = [
  { piece: byHandle("the-halo"), cls: "left-[4%] top-[16%] lg:left-[8%] lg:top-[14%]", size: "h-28 w-28 lg:h-44 lg:w-44", depth: 2.4, delay: "0s" },
  { piece: byHandle("the-braided-hoop"),    cls: "right-[5%] top-[12%] lg:right-[9%] lg:top-[10%]", size: "h-24 w-24 lg:h-40 lg:w-40", depth: 3.1, delay: "1.1s" },
  { piece: byHandle("the-cascade"),  cls: "left-[7%] bottom-[12%] lg:left-[12%] lg:bottom-[14%]", size: "h-24 w-24 lg:h-36 lg:w-36", depth: 1.7, delay: "0.5s" },
  { piece: byHandle("the-studs"),          cls: "right-[6%] bottom-[14%] lg:right-[13%] lg:bottom-[16%]", size: "h-20 w-20 lg:h-32 lg:w-32", depth: 2.0, delay: "1.6s" },
  { piece: byHandle("the-vine"),       cls: "left-1/2 top-[6%] hidden -translate-x-1/2 lg:block", size: "lg:h-28 lg:w-28", depth: 3.6, delay: "0.8s" },
];

const JewelleryFeature = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const sec = sectionRef.current;
    if (!sec) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = sec.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        sec.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
          const d = parseFloat(el.dataset.depth || "1");
          el.style.setProperty("--px", `${nx * d * -16}px`);
          el.style.setProperty("--py", `${ny * d * -16}px`);
        });
      });
    };
    const onLeave = () => {
      sec.querySelectorAll<HTMLElement>("[data-depth]").forEach((el) => {
        el.style.setProperty("--px", "0px");
        el.style.setProperty("--py", "0px");
      });
    };
    sec.addEventListener("mousemove", onMove);
    sec.addEventListener("mouseleave", onLeave);
    return () => { cancelAnimationFrame(raf); sec.removeEventListener("mousemove", onMove); sec.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[86vh] items-center justify-center overflow-hidden bg-[#FBF1E9] px-6 py-24"
      id="jewellery-feature"
    >
      <style>{`
        @keyframes jf-spin   { to { transform: rotate(360deg); } }
        @keyframes jf-spin-r { to { transform: rotate(-360deg); } }
        @keyframes jf-float  { 0%,100% { transform: translateY(0) rotate(var(--r,0deg)); } 50% { transform: translateY(-16px) rotate(var(--r,0deg)); } }
        @keyframes jf-twinkle{ 0%,100% { opacity: 0; transform: scale(.4); } 50% { opacity: 1; transform: scale(1); } }
        .jf-halo   { animation: jf-spin 80s linear infinite; }
        .jf-halo-2 { animation: jf-spin-r 60s linear infinite; }
        .jf-medallion { transform: translate(var(--px,0),var(--py,0)); transition: transform .4s cubic-bezier(.16,1,.3,1); }
        .jf-float { animation: jf-float 7s ease-in-out infinite; }
        .jf-medallion:hover .jf-disc { transform: scale(1.08); box-shadow: 0 0 0 2px #C99A4C, 0 24px 48px -18px rgba(122,90,40,.6); }
        .jf-disc { transition: transform .6s cubic-bezier(.16,1,.3,1), box-shadow .6s ease; }
        .jf-tw { animation: jf-twinkle 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .jf-halo,.jf-halo-2,.jf-float,.jf-tw { animation: none !important; }
        }
      `}</style>

      {/* warm wash */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_50%_40%,rgba(255,224,205,0.5)_0%,transparent_60%),radial-gradient(50%_40%_at_15%_90%,rgba(153,180,175,0.22)_0%,transparent_60%),radial-gradient(50%_40%_at_85%_10%,rgba(255,189,168,0.28)_0%,transparent_60%)]" />

      {/* soft gold glow + a clean slowly-turning ring behind the headline */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="h-[600px] w-[600px] rounded-full opacity-90 [background:radial-gradient(circle,rgba(255,224,205,0.65)_0%,rgba(232,197,126,0.22)_42%,transparent_70%)] blur-[60px] md:h-[880px] md:w-[880px]" />
        <div className="jf-halo-2 absolute inset-0 m-auto h-[440px] w-[440px] rounded-full border border-[#C99A4C]/20 md:h-[620px] md:w-[620px]" />
        <div className="jf-halo absolute inset-0 m-auto h-[360px] w-[360px] rounded-full border border-dashed border-[#C99A4C]/15 md:h-[500px] md:w-[500px]" />
      </div>

      {/* floating gold-rimmed medallions */}
      {medallions.map((m, i) => (
        <div key={m.piece.handle} data-depth={m.depth} className={`jf-medallion pointer-events-auto absolute ${m.cls}`}>
          <Link to="/jewellery" className="jf-float group block" style={{ animationDelay: m.delay }} aria-label={`${m.piece.name} — view jewellery`}>
            <span className={`jf-disc relative block ${m.size} overflow-hidden rounded-full bg-[#F4EBE2] shadow-[0_0_0_1px_rgba(201,154,76,0.5),0_18px_40px_-18px_rgba(122,90,40,0.55)]`}>
              <img src={m.piece.image} alt={m.piece.name} loading="lazy" className="h-full w-full scale-[1.35] object-cover" />
              {m.piece.gallery?.[1] && (
                <img src={m.piece.gallery[1]} alt="" aria-hidden loading="lazy" className="absolute inset-0 h-full w-full scale-[1.35] object-cover opacity-0 transition-opacity duration-700 ease-out group-hover:opacity-100" />
              )}
            </span>
          </Link>
          <svg className="jf-tw absolute -right-2 -top-2 h-5 w-5" viewBox="0 0 20 20" style={{ animationDelay: `${0.4 * i}s` }}>
            <path d="M10 1 Q11 9 19 10 Q11 11 10 19 Q9 11 1 10 Q9 9 10 1 Z" fill="#C99A4C" />
          </svg>
        </div>
      ))}

      {/* centre headline */}
      <div className="relative z-10 max-w-xl text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#B0843A]" style={jost}>VOLUME ONE · DEMI-GOLD</p>
        <h2 className="text-[clamp(2.8rem,8vw,6rem)] leading-[0.9]" style={velista} aria-label="Naira, now in gold.">
          <SplitText text="Naira," className="block" step={0.05} />
          <SplitText text="now in gold." as="div" className="block italic text-[#B0843A]" style={editorial} delay={0.4} step={0.045} />
        </h2>
        <p className="mx-auto mt-6 max-w-sm text-[15px] leading-relaxed text-[#1A1614]/65" style={editorial}>
          The atelier&rsquo;s first jewellery — pressed flowers cast in 18k gold-plate.
          Rings &amp; earrings, made to order.
        </p>
        <Link
          to="/jewellery"
          className="group relative mt-8 inline-flex items-center gap-3 overflow-hidden border border-[#1A1614] px-9 py-4 text-[12px] tracking-[0.32em] text-[#1A1614] transition-colors duration-500 hover:text-[#FBF1E9]"
          style={jost}
        >
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#1A1614] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">EXPLORE THE JEWELLERY</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
};

export default JewelleryFeature;
