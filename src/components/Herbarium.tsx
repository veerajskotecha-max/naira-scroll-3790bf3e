import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SplitText from "@/components/wow/SplitText";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";

/* ───────────────────────────────────────────────────────────────
   THE PRESSED HERBARIUM — Naira Flore, Folio I
   The shoppable demi-gold section, reimagined as a botanist's specimen
   folio: each piece is mounted like a pressed flower under glass with a
   typeset herbarium label. Hover (or focus) lifts the specimen and TURNS
   it 180° to its true three-quarter view; one diagonal of light sweeps
   the whole folio with the cursor; a click scatters petals and opens the
   quick-view. Strictly light & archival — the metaphor IS the merchandise.
   ─────────────────────────────────────────────────────────────── */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

type Meta = { no: string; binomial: string; span: string; rot: string; hero?: boolean; note?: string };

const META: Record<string, Meta> = {
  "marigold-signet-ring": { no: "NF-01", binomial: "Tagetes aurea", span: "lg:col-span-5", rot: "-0.6deg", hero: true, note: "a single blush crystal, hand-set" },
  "chandbali-florale":    { no: "NF-05", binomial: "Luna filigrana", span: "lg:col-span-7", rot: "0.4deg" },
  "pressed-petal-drops":  { no: "NF-03", binomial: "Petala pressa",  span: "lg:col-span-4", rot: "0.5deg" },
  "sage-vine-band":       { no: "NF-02", binomial: "Vitis salvii",   span: "lg:col-span-4", rot: "-0.4deg" },
  "bloom-studs":          { no: "NF-04", binomial: "Flos octopetalus", span: "lg:col-span-4", rot: "0.3deg" },
};
const ORDER = ["marigold-signet-ring", "chandbali-florale", "pressed-petal-drops", "sage-vine-band", "bloom-studs"];
const specimens = ORDER.map((h) => ({ piece: jewellery.find((j) => j.handle === h)!, meta: META[h] })).filter((s) => s.piece);

/* ── one mounted specimen plate ───────────────────────────── */
const SpecimenPlate = ({
  piece, meta, index, onOpen,
}: { piece: JewelPiece; meta: Meta; index: number; onOpen: () => void }) => {
  const tiltRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [turned, setTurned] = useState(false);
  const gallery = piece.gallery && piece.gallery.length > 0 ? piece.gallery : [piece.image, piece.image];

  const fine = () => typeof window !== "undefined" && window.matchMedia("(pointer: fine)").matches && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lift = () => {
    setTurned(true);
    if (tiltRef.current && fine()) tiltRef.current.style.setProperty("--lift", "-10px");
  };
  const drop = () => {
    setTurned(false);
    if (tiltRef.current) { tiltRef.current.style.setProperty("--lift", "0px"); tiltRef.current.style.setProperty("--rx", "0deg"); }
  };
  const move = (e: React.MouseEvent) => {
    if (!fine() || !tiltRef.current) return;
    const r = tiltRef.current.getBoundingClientRect();
    const py = (e.clientY - r.top) / r.height - 0.5;
    tiltRef.current.style.setProperty("--rx", `${(-py * 5).toFixed(2)}deg`);
  };

  return (
    <div className={`hb-reveal ${meta.span}`} style={{ ["--i" as string]: index }}>
      <div className="hb-rot" style={{ ["--rot" as string]: meta.rot }}>
        <button
          type="button"
          onClick={onOpen}
          onMouseEnter={lift}
          onMouseLeave={drop}
          onMouseMove={move}
          onFocus={lift}
          onBlur={drop}
          aria-label={`${piece.name}, ${piece.priceLabel} — inspect`}
          className="hb-plate group relative block w-full text-left"
        >
          {/* mounting tape corners */}
          <span className="hb-tape hb-tape-tl" aria-hidden />
          <span className="hb-tape hb-tape-br" aria-hidden />
          {/* accession stamp */}
          <span className="absolute right-3 top-3 z-20 border border-[#C99A4C]/45 bg-[#FBF3EC]/80 px-2 py-1 text-[8px] tracking-[0.3em] text-[#9A7634]" style={jost}>
            {piece.tag ?? "FOLIO I"}
          </span>

          {/* specimen under glass */}
          <div className="hb-well relative overflow-hidden bg-[#F4EBE2]" style={{ perspective: "1200px" }}>
            {/* faint pressed-flower breath behind */}
            <span className="hb-breath pointer-events-none absolute inset-0 [background:radial-gradient(circle_at_50%_45%,rgba(153,180,175,0.10),transparent_62%)]" aria-hidden />
            <div ref={tiltRef} className="hb-tilt h-full w-full">
              <div ref={stageRef} className={`hb-stage h-full w-full ${turned ? "is-turned" : ""}`}>
                <span className="hb-face hb-front">
                  <img src={gallery[0]} alt={piece.name} loading="lazy" className="h-full w-full object-cover" />
                  <span className="hb-glass" aria-hidden />
                </span>
                <span className="hb-face hb-back">
                  <img src={gallery[1]} alt="" aria-hidden loading="lazy" className="h-full w-full object-cover" />
                </span>
              </div>
            </div>
            {/* caption */}
            <span className="absolute bottom-2 left-3 z-20 text-[9px] tracking-[0.3em] text-[#B0843A]" style={jost}>
              {turned ? "PLATE — THREE-QUARTER VIEW" : "PLATE — FRONT"}
            </span>
            {/* tap hint (coarse pointer only) */}
            <span className="hb-tap pointer-events-none absolute bottom-2 right-3 z-20 hidden text-[9px] tracking-[0.3em] text-[#1A1614]/45" style={jost}>TAP TO INSPECT</span>

            {/* hero marginalia annotation */}
            {meta.hero && meta.note && (
              <svg className="hb-annot pointer-events-none absolute -right-1 top-6 z-20 hidden h-24 w-40 overflow-visible lg:block" viewBox="0 0 160 96" aria-hidden>
                <path d="M30 70 C 70 64, 96 40, 120 26" fill="none" stroke="#B0843A" strokeWidth="1" pathLength={1} className="hb-annot-line" />
                <circle cx="30" cy="70" r="2" fill="#B0843A" />
              </svg>
            )}
          </div>

          {/* herbarium label */}
          <div className="px-1 pt-4">
            <span className="block h-px w-10 bg-[#C99A4C]/50" />
            <p className="mt-3 text-[9px] tracking-[0.34em] text-[#9A7634]" style={jost}>SPECIMEN NO. {meta.no}</p>
            <h3 className="mt-1 text-[22px] leading-tight text-[#1A1614]" style={velista}>{piece.name}</h3>
            <p className="mt-0.5 text-[13px] italic text-[#1A1614]/55" style={editorial}>{meta.binomial}</p>
            <p className="mt-2 text-[10px] leading-relaxed tracking-wide text-[#1A1614]/55" style={jost}>MATERIA · {piece.materials}</p>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-[15px] text-[#1A1614]" style={jost}>{piece.priceLabel}</span>
              <span className="text-[9px] tracking-[0.18em] text-[#1A1614]/40" style={jost}>COLL. 2026 · MADE TO ORDER</span>
            </div>
          </div>
        </button>
        {meta.hero && meta.note && (
          <p className="mt-2 hidden pl-1 text-[12px] italic text-[#1A1614]/50 lg:block" style={editorial}>“{meta.note}”</p>
        )}
      </div>
    </div>
  );
};

const Herbarium = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const wallRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<JewelPiece | null>(null);

  // reveal on scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("is-revealed"); io.disconnect(); } },
      { threshold: 0.16 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // single specular glass sweep across the whole folio, tracking cursor X
  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const onMove = (e: MouseEvent) => {
      const r = wall.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width;
      wall.style.setProperty("--sweep", `${(nx * 100).toFixed(1)}%`);
      wall.style.setProperty("--glass-op", "0.7");
    };
    const onLeave = () => wall.style.setProperty("--glass-op", "0.32");
    wall.addEventListener("mousemove", onMove);
    wall.addEventListener("mouseleave", onLeave);
    return () => { wall.removeEventListener("mousemove", onMove); wall.removeEventListener("mouseleave", onLeave); };
  }, []);

  return (
    <section ref={sectionRef} className="herbarium relative overflow-hidden bg-[#FBF3EC] py-20 text-[#1A1614] lg:py-36" id="jewellery">
      <style>{`
        @keyframes hb-breathe { 0%,100% { opacity: .5; } 50% { opacity: 1; } }
        @keyframes hb-grain-drift { 0%,100% { background-position: 0 0; } 50% { background-position: 2px 2px; } }

        .hb-reveal { opacity: 0; transform: translateY(40px) scale(.96); filter: blur(6px);
          transition: opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1), filter 1s ease;
          transition-delay: calc(var(--i) * .12s); }
        .is-revealed .hb-reveal { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        .hb-head { opacity: 0; transform: translateY(24px); transition: opacity 1s ease, transform 1s cubic-bezier(.16,1,.3,1); }
        .is-revealed .hb-head { opacity: 1; transform: translateY(0); }
        .hb-rule { transition: width 1.1s cubic-bezier(.16,1,.3,1) .5s; }
        .is-revealed .hb-rule { width: 180px; }

        .hb-rot { transform: rotate(0); transition: transform .5s cubic-bezier(.16,1,.3,1); }
        @media (min-width: 1024px) { .hb-rot { transform: rotate(var(--rot)); } }

        .hb-plate { background: #FBF3EC; padding: 14px; box-shadow: 0 1px 0 rgba(201,154,76,.18), 0 18px 40px -26px rgba(122,90,40,.5);
          outline: 1px solid rgba(26,22,20,.06); transition: box-shadow .5s ease; }
        .hb-plate:focus-visible { outline: 2px solid #99B4AF; outline-offset: 3px; }
        .hb-plate:hover { box-shadow: 0 1px 0 rgba(201,154,76,.3), 0 34px 56px -28px rgba(122,90,40,.55); }

        .hb-well { aspect-ratio: 1 / 1; }
        .hb-tilt { transform: translateY(var(--lift,0px)) rotateX(var(--rx,0deg)); transform-style: preserve-3d;
          transition: transform .5s cubic-bezier(.16,1,.3,1); will-change: transform; }
        .hb-stage { position: relative; transform-style: preserve-3d; transform: rotateY(0deg);
          transition: transform 1s cubic-bezier(.6,.01,.05,.95) .12s; }
        .hb-stage.is-turned { transform: rotateY(180deg); }
        .hb-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; display: block; }
        .hb-back { transform: rotateY(180deg); }
        .hb-glass { position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(135deg, rgba(255,255,255,.28) 0%, rgba(255,255,255,0) 42%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.4); }

        .hb-tape { position: absolute; z-index: 20; width: 46px; height: 18px; background: rgba(251,243,236,.62);
          box-shadow: 0 1px 3px rgba(122,90,40,.25); }
        .hb-tape-tl { top: -7px; left: 16px; transform: rotate(-7deg); }
        .hb-tape-br { bottom: 50px; right: 14px; transform: rotate(8deg); }

        .hb-breath { animation: hb-breathe 9s ease-in-out infinite; }
        .hb-annot-line { stroke-dasharray: 1; stroke-dashoffset: 1; }
        .is-revealed .hb-annot-line { transition: stroke-dashoffset .55s ease 1.1s; stroke-dashoffset: 0; }

        @media (hover: none) { .hb-tap { display: block; } }

        @media (prefers-reduced-motion: reduce) {
          .hb-reveal, .hb-head { opacity: 1 !important; transform: none !important; filter: none !important; }
          .hb-breath { animation: none; }
          .hb-stage { transition: opacity .4s ease; transform: none !important; }
          .hb-back { transform: none; opacity: 0; transition: opacity .4s ease; }
          .hb-stage.is-turned .hb-back { opacity: 1; }
          .hb-stage.is-turned .hb-front { opacity: 0; transition: opacity .4s ease; }
          .hb-annot-line { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* paper grain wash */}
      <div className="film-grain pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-multiply" aria-hidden />

      {/* header */}
      <div className="hb-head relative mx-auto max-w-3xl px-6 text-center">
        <p className="mb-5 text-[11px] tracking-[0.5em] text-[#B0843A]" style={jost}>FOLIO I · HERBARIUM OF DEMI-GOLD</p>
        <h2 className="mx-auto text-[clamp(2.4rem,7vw,5rem)] leading-[0.95]" style={velista} aria-label="An herbarium, set in gold.">
          <SplitText text="An herbarium," className="block" step={0.035} />
          <SplitText text="set in gold." as="div" className="block italic text-[#B0843A]" style={editorial} delay={0.4} step={0.04} />
        </h2>
        <p className="mx-auto mt-7 max-w-md text-[15px] leading-relaxed text-[#1A1614]/65" style={editorial}>
          Five pieces, pressed and plated by hand — catalogued like specimens,
          set in 18k demi-gold.
        </p>
        <span className="hb-rule mx-auto mt-8 block h-px w-0 bg-gradient-to-r from-transparent via-[#C99A4C] to-transparent" />
      </div>

      {/* specimen wall */}
      <div
        ref={wallRef}
        className="relative mx-auto mt-14 grid max-w-6xl grid-cols-1 gap-x-8 gap-y-12 px-6 md:grid-cols-2 lg:mt-20 lg:grid-cols-12 lg:gap-y-14"
        style={{ ["--glass-op" as string]: "0.32", ["--sweep" as string]: "50%" }}
      >
        {specimens.map(({ piece, meta }, i) => (
          <SpecimenPlate key={piece.handle} piece={piece} meta={meta} index={i} onOpen={() => setActive(piece)} />
        ))}
        {/* single living-glass specular sweep across the whole folio */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-30 hidden mix-blend-screen lg:block"
          style={{
            opacity: "var(--glass-op)",
            transition: "opacity .5s ease, background-position .3s ease-out",
            background: "linear-gradient(115deg, rgba(255,255,255,0) 42%, rgba(255,246,222,0.5) 50%, rgba(255,255,255,0) 58%)",
            backgroundSize: "260% 100%",
            backgroundPositionX: "var(--sweep)",
          }}
        />
      </div>

      {/* footer */}
      <div className="relative mt-16 flex flex-col items-center gap-4">
        <Link
          to="/jewellery"
          data-magnetic
          className="group relative inline-flex items-center gap-3 overflow-hidden border border-[#1A1614] px-10 py-4 text-[12px] tracking-[0.32em] text-[#1A1614] transition-colors duration-500 hover:text-[#FBF3EC]"
          style={jost}
        >
          <span className="absolute inset-0 origin-left scale-x-0 bg-[#1A1614] transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative">VIEW THE FULL FOLIO</span>
          <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
        </Link>
        <p className="text-[11px] tracking-[0.2em] text-[#1A1614]/40" style={jost}>PRESSED &amp; PLATED TO ORDER · NAIRA FLORE ATELIER</p>
      </div>

      <JewelQuickView piece={active} open={!!active} onOpenChange={(o) => { if (!o) setActive(null); }} />
    </section>
  );
};

export default Herbarium;
