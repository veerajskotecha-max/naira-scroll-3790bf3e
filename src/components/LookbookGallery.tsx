import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import look1 from "@/assets/lookbook/look-1.jpg";
import look2 from "@/assets/lookbook/look-2.jpg";
import look3 from "@/assets/lookbook/look-3.jpg";
import look4 from "@/assets/lookbook/look-4.jpg";
import look5 from "@/assets/lookbook/look-5.jpg";
import look6 from "@/assets/lookbook/look-6.jpg";
import brandFlower from "@/assets/lookbook/brand-flower.png";
import SplitText from "@/components/wow/SplitText";

/* ───────────────────────────────────────────────────────────────
   THE LOOKBOOK
   An editorial gallery of real Naira campaign photography. Each frame
   tilts in 3D toward the cursor with a glass sheen that follows the
   pointer, lifts on hover, and reveals its caption. Columns sit at
   staggered heights for a fashion-editorial rhythm. Cream-on-cream,
   fully inside the brand world. Source: brand Drive + deck.
   ─────────────────────────────────────────────────────────────── */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

type Frame = { img: string; name: string; tag: string; offset: string };

const frames: Frame[] = [
  { img: look2, name: "The Editor's Portrait", tag: "I · indigo & ivory", offset: "lg:mt-0" },
  { img: look4, name: "Marigold Hour", tag: "II · saffron silk", offset: "lg:mt-16" },
  { img: look6, name: "Mirror Garden", tag: "III · gold patchwork", offset: "lg:mt-6" },
  { img: look1, name: "Midnight Vine", tag: "IV · lehenga, in detail", offset: "lg:mt-0" },
  { img: look5, name: "Saffron Bloom", tag: "V · the full silhouette", offset: "lg:mt-16" },
  { img: look3, name: "Indigo Trellis", tag: "VI · hand-embroidered", offset: "lg:mt-6" },
];

const TiltFrame = ({ frame, index }: { frame: Frame; index: number }) => {
  const wrapRef = useRef<HTMLDivElement>(null);
  const sheenRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    const sheen = sheenRef.current;
    if (!el || !sheen) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateY(${px * 11}deg) rotateX(${-py * 11}deg) translateZ(14px) scale(1.035)`;
      sheen.style.opacity = "1";
      sheen.style.background = `radial-gradient(420px circle at ${(px + 0.5) * 100}% ${(py + 0.5) * 100}%, rgba(255,255,255,0.38), rgba(255,255,255,0) 55%)`;
    };
    const reset = () => {
      el.style.transform = "perspective(1000px) rotateY(0) rotateX(0) translateZ(0) scale(1)";
      sheen.style.opacity = "0";
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", reset);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", reset);
    };
  }, []);

  return (
    <div className={`lookbook-card ${frame.offset}`} style={{ ["--i" as string]: index }}>
      <div
        ref={wrapRef}
        data-magnetic
        className="group relative overflow-hidden bg-[#EDE2D8] shadow-[0_18px_40px_-18px_rgba(122,90,40,0.45)] transition-transform duration-500 ease-out [transform-style:preserve-3d] will-change-transform"
        style={{ transform: "perspective(1000px)" }}
      >
        <img
          src={frame.img}
          alt={`${frame.name} — Naira campaign`}
          loading="lazy"
          className="aspect-[3/4] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.08]"
        />
        {/* cursor-following glass sheen */}
        <div ref={sheenRef} aria-hidden className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300" />
        {/* caption */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-3 bg-gradient-to-t from-[#1A1614]/75 via-[#1A1614]/20 to-transparent p-5 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-[10px] tracking-[0.4em] text-[#FFD9C7]" style={jost}>{frame.tag.toUpperCase()}</p>
          <h3 className="mt-1 text-2xl text-[#FBF3EC]" style={velista}>{frame.name}</h3>
        </div>
        {/* thin gold frame on hover */}
        <span className="pointer-events-none absolute inset-0 border border-[#C99A4C]/0 transition-colors duration-500 group-hover:border-[#C99A4C]/60" />
      </div>
    </div>
  );
};

const LookbookGallery = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="lookbook relative overflow-hidden bg-[#FFF8F5] py-24 text-[#1A1614] lg:py-36" id="lookbook">
      <style>{`
        @keyframes lookbook-drift { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-26px) rotate(8deg); } }
        .lookbook-card { opacity: 0; transform: translateY(46px); filter: blur(8px);
          transition: opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1), filter 1s ease;
          transition-delay: calc(var(--i) * 0.1s); }
        .is-revealed .lookbook-card { opacity: 1; transform: translateY(0); filter: blur(0); }
        .lookbook-head { opacity: 0; transform: translateY(24px); transition: opacity 1s ease, transform 1s cubic-bezier(.16,1,.3,1); }
        .is-revealed .lookbook-head { opacity: 1; transform: translateY(0); }
        .lookbook-rule { transition: width 1.1s cubic-bezier(.16,1,.3,1) .4s; }
        .is-revealed .lookbook-rule { width: 200px; }
        .lookbook-flower { animation: lookbook-drift 14s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .lookbook-card,.lookbook-head { opacity: 1 !important; transform: none !important; filter: none !important; }
          .lookbook-flower { animation: none; }
        }
      `}</style>

      {/* soft washes + drifting brand flower */}
      <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_40%_at_10%_0%,rgba(153,180,175,0.16)_0%,transparent_55%),radial-gradient(55%_45%_at_100%_100%,rgba(255,189,168,0.18)_0%,transparent_55%)]" />
      <img src={brandFlower} alt="" aria-hidden className="lookbook-flower pointer-events-none absolute right-[4%] top-[12%] w-24 opacity-20 lg:w-36" />

      {/* header */}
      <div className="lookbook-head relative mx-auto max-w-6xl px-6 text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#B0843A]" style={jost}>
          THE LOOKBOOK · VOLUME ONE
        </p>
        <h2 className="mx-auto max-w-3xl text-[clamp(2.6rem,7vw,5.2rem)] leading-[0.95]" style={velista} aria-label="Worn in the long Indian afternoon.">
          <SplitText text="Worn in the long" className="block" step={0.03} />
          <SplitText text="Indian afternoon." as="div" className="block italic text-[#99B4AF]" style={editorial} delay={0.4} step={0.04} />
        </h2>
        <p className="mx-auto mt-7 max-w-md text-[15px] leading-relaxed text-[#1A1614]/65" style={editorial}>
          This season&rsquo;s campaign — indigo and saffron, hand-embroidered and
          worn slowly. Photographed for Naira Flore.
        </p>
        <span className="lookbook-rule mx-auto mt-8 block h-px w-0 bg-gradient-to-r from-transparent via-[#C99A4C] to-transparent" />
      </div>

      {/* gallery */}
      <div className="relative mx-auto mt-16 grid max-w-6xl grid-cols-1 gap-6 px-6 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3 lg:gap-7">
        {frames.map((f, i) => (
          <TiltFrame key={f.name} frame={f} index={i} />
        ))}
      </div>

      {/* CTA */}
      <div className="relative mt-20 flex justify-center">
        <Link
          to="/shop"
          data-magnetic="strong"
          className="group relative inline-flex items-center gap-3 border border-[#1A1614]/40 px-10 py-4 text-[12px] tracking-[0.35em] text-[#1A1614] transition-colors duration-500 hover:text-[#FFF8F5]"
          style={jost}
        >
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#1A1614] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">SHOP THE COLLECTION</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
      </div>
    </section>
  );
};

export default LookbookGallery;
