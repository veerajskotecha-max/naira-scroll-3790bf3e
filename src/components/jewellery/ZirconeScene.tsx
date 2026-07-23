import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JewelQuickView from "@/components/jewellery/JewelQuickView";
import { jewellery, type JewelPiece } from "@/data/jewellery";
import modelIvory from "@/assets/jewellery/model-ivory.jpg";

gsap.registerPlugin(ScrollTrigger);

/* ───────────────────────────────────────────────────────────────
   THE ZIRCONE SCENE — scroll-turned solitaire (mobile-first)
   Concept A's ivory/gold world with cinematic motion: the section pins
   and, as you scroll, the Zircone Solitaire physically TURNS (its two
   real angles ride the front/back of a 3D card), zircon fire sparkles
   at beats, and headline lines land in sequence:
     "Cut like a diamond." → "Priced like a flower." → the reveal.
   The pin releases into a swipeable rail of all pieces (snap-scroll on
   mobile, grid + hover-turn on desktop) and an on-model closing moment.
   Reduced-motion: no pin — a calm static composition.
   ─────────────────────────────────────────────────────────────── */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const solitaire = jewellery.find((j) => j.handle === "the-vow")!;

/* 4-point zircon fire star */
const Star = ({ className = "", size = 18 }: { className?: string; size?: number }) => (
  <svg className={`zs-star pointer-events-none absolute ${className}`} width={size} height={size} viewBox="0 0 20 20" aria-hidden>
    <path d="M10 0 Q11 8.5 20 10 Q11 11.5 10 20 Q9 11.5 0 10 Q9 8.5 10 0 Z" fill="#C99A4C" />
  </svg>
);

/* rail card: hover-turn on desktop, one-shot "greet turn" on mobile via IO */
const RailCard = ({ piece, onOpen }: { piece: JewelPiece; onOpen: () => void }) => {
  const imgs = piece.gallery && piece.gallery.length > 1 ? piece.gallery : [piece.image, piece.image];
  const zircone = piece.handle.startsWith("zircone");
  return (
    <button
      type="button"
      onClick={onOpen}
      data-greet
      className="zs-card group relative w-[72vw] shrink-0 snap-center text-left transition-transform duration-200 active:scale-[0.97] sm:w-[44vw] lg:w-auto"
      aria-label={`${piece.name}, ${piece.priceLabel}`}
    >
      <div className="relative overflow-hidden bg-[#F4EBE2] shadow-[0_18px_38px_-24px_rgba(122,90,40,0.55)]">
        <img src={imgs[0]} alt={piece.name} loading="lazy" draggable={false} className="zs-card-front aspect-square w-full object-cover transition-opacity duration-500" />
        <img src={imgs[1]} alt="" aria-hidden loading="lazy" draggable={false} className="zs-card-back absolute inset-0 aspect-square w-full object-cover opacity-0 transition-opacity duration-500" />
        {zircone && (
          <>
            <Star className="left-[18%] top-[20%] zs-idle" size={14} />
            <Star className="right-[22%] top-[38%] zs-idle" size={10} />
            <Star className="left-[30%] bottom-[24%] zs-idle" size={12} />
          </>
        )}
        {piece.tag && (
          <span className="absolute left-3 top-3 border border-[#C99A4C]/50 bg-[#FBF3EC]/90 px-2 py-0.5 text-[8px] tracking-[0.28em] text-[#9A7634]" style={jost}>{piece.tag}</span>
        )}
        <span className="pointer-events-none absolute inset-0 border border-[#C99A4C]/0 transition-colors duration-500 group-hover:border-[#C99A4C]/60" />
      </div>
      <div className="pt-3 text-center">
        <h3 className="text-[17px] leading-tight text-[#1A1614]" style={velista}>{piece.name}</h3>
        <p className="mt-0.5 text-[12px] tracking-wide text-[#9A7634]" style={jost}>{piece.priceLabel}</p>
      </div>
    </button>
  );
};

const ZirconeScene = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [qv, setQv] = useState<JewelPiece | null>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const root = rootRef.current, pin = pinRef.current, card = cardRef.current;
      if (!root || !pin || !card) return;

      const lines = pin.querySelectorAll<HTMLElement>("[data-line]");
      const stars = pin.querySelectorAll<HTMLElement>(".zs-beat");
      const finale = pin.querySelector<HTMLElement>("[data-finale]");
      const glow = pin.querySelector<HTMLElement>("[data-glow]");
      const sliver = pin.querySelector<HTMLElement>("[data-sliver]");
      const shadow = pin.querySelector<HTMLElement>("[data-shadow]");

      gsap.set(lines, { opacity: 0, y: 34, filter: "blur(8px)" });
      gsap.set(stars, { scale: 0, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(finale, { opacity: 0, y: 26 });
      gsap.set(glow, { opacity: 0 });
      gsap.set(sliver, { opacity: 0, scaleY: 0.2, transformOrigin: "50% 50%" });
      gsap.set(card, { scale: 1.35 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "+=230%",
          scrub: 0.7,
          pin: pin,
          anticipatePin: 1,
        },
        defaults: { ease: "none" },
      });

      tl
        // Act 1 — line 1 lands; the huge ring starts to turn and shrink
        .to(lines[0], { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.07, ease: "power2.out" }, 0.02)
        .to(card, { rotationY: 180, duration: 0.3 }, 0.05)
        .to(card, { scale: 1.08, duration: 0.3, ease: "power1.out" }, 0.05)
        .to(shadow, { scaleX: 0.82, opacity: 0.55, duration: 0.3 }, 0.05)
        // edge-on at ~90° → THE GLINT SLIVER (blade of light hides the card edge)
        .to(sliver, { opacity: 1, scaleY: 1, duration: 0.025, ease: "power2.out" }, 0.185)
        .to(sliver, { opacity: 0, scaleY: 0.25, duration: 0.03 }, 0.215)
        .to(stars[0], { scale: 1, opacity: 1, duration: 0.03, ease: "back.out(2)" }, 0.19)
        .to(stars[0], { scale: 0.2, opacity: 0, duration: 0.05 }, 0.24)
        .to(stars[1], { scale: 1, opacity: 1, duration: 0.03, ease: "back.out(2)" }, 0.21)
        .to(stars[1], { scale: 0.2, opacity: 0, duration: 0.05 }, 0.26)
        // Act 2 — swap lines, second half-turn
        .to(lines[0], { opacity: 0, y: -26, filter: "blur(6px)", duration: 0.05, ease: "power2.in" }, 0.3)
        .to(lines[1], { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.07, ease: "power2.out" }, 0.34)
        .to(card, { rotationY: 360, duration: 0.32 }, 0.38)
        .to(card, { scale: 1.0, duration: 0.32, ease: "power1.out" }, 0.38)
        // second edge-on at ~270° → sliver again
        .to(sliver, { opacity: 1, scaleY: 1, duration: 0.025, ease: "power2.out" }, 0.525)
        .to(sliver, { opacity: 0, scaleY: 0.25, duration: 0.03 }, 0.555)
        .to(stars[2], { scale: 1, opacity: 1, duration: 0.03, ease: "back.out(2)" }, 0.53)
        .to(stars[2], { scale: 0.2, opacity: 0, duration: 0.05 }, 0.58)
        .to(stars[3], { scale: 1, opacity: 1, duration: 0.03, ease: "back.out(2)" }, 0.55)
        .to(stars[3], { scale: 0.2, opacity: 0, duration: 0.05 }, 0.6)
        // Act 3 — reveal: line 2 out, ring docks, price card blooms in
        .to(lines[1], { opacity: 0, y: -26, filter: "blur(6px)", duration: 0.05, ease: "power2.in" }, 0.66)
        .to(card, { scale: 0.88, y: -14, duration: 0.2, ease: "power1.out" }, 0.68)
        .to(shadow, { scaleX: 0.6, opacity: 0.35, duration: 0.2 }, 0.68)
        .to(glow, { opacity: 1, duration: 0.12 }, 0.7)
        .to(finale, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, 0.72)
        .to(stars[4], { scale: 1, opacity: 1, duration: 0.03, ease: "back.out(2)" }, 0.76)
        .to(stars[4], { scale: 0.3, opacity: 0, duration: 0.06 }, 0.86);

      return () => { tl.scrollTrigger?.kill(); tl.kill(); };
    });

    // Reduced motion: everything visible, no pin.
    mm.add("(prefers-reduced-motion: reduce)", () => {
      const pin = pinRef.current;
      if (!pin) return;
      pin.querySelectorAll<HTMLElement>("[data-line],[data-finale]").forEach((el, i) => {
        el.style.opacity = i === 0 || el.hasAttribute("data-finale") ? "1" : "0";
        el.style.transform = "none";
        el.style.filter = "none";
      });
    });

    return () => mm.revert();
  }, { scope: rootRef });

  // mobile "greet turn": cards flash their 3/4 angle once when entering view (no hover on touch)
  useGSAP(() => {
    if (window.matchMedia("(hover: hover)").matches) return; // desktop uses hover instead
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cards = rootRef.current?.querySelectorAll<HTMLElement>("[data-greet]");
    if (!cards?.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        io.unobserve(el);
        const front = el.querySelector<HTMLElement>(".zs-card-front");
        const back = el.querySelector<HTMLElement>(".zs-card-back");
        if (!front || !back) return;
        setTimeout(() => {
          back.style.opacity = "1"; front.style.opacity = "0";
          setTimeout(() => { back.style.opacity = "0"; front.style.opacity = "1"; }, 1000);
        }, 350);
      });
    }, { threshold: 0.6 });
    cards.forEach((c) => io.observe(c));
    return () => io.disconnect();
  }, { scope: rootRef });

  const imgs = solitaire.gallery!;

  return (
    <section id="jewellery" className="relative bg-[#FBF3EC] text-[#1A1614]">
      <style>{`
        @keyframes zs-twinkle { 0%,100% { opacity:.15; transform:scale(.5) rotate(0deg);} 50% { opacity:.9; transform:scale(1) rotate(24deg);} }
        .zs-idle { animation: zs-twinkle 2.8s ease-in-out infinite; }
        .zs-idle:nth-child(odd) { animation-delay: 1.1s; }
        .zs-rail::-webkit-scrollbar { display: none; }
        .zs-rail { scrollbar-width: none; }
        @media (hover: hover) {
          .zs-card:hover .zs-card-back { opacity: 1; }
          .zs-card:hover .zs-card-front { opacity: 0; }
        }
        @media (prefers-reduced-motion: reduce) { .zs-idle { animation: none; } }
      `}</style>

      {/* ── pinned scroll scene ── */}
      <div ref={rootRef}>
        <div ref={pinRef} className="relative flex h-[100svh] flex-col items-center justify-center overflow-hidden px-6">
          {/* soft wash */}
          <div className="pointer-events-none absolute inset-0 [background:radial-gradient(70%_50%_at_50%_38%,rgba(255,224,205,0.5)_0%,transparent_65%)]" />
          <p className="relative z-20 mb-6 text-[10px] tracking-[0.5em] text-[#B0843A] md:text-[11px]" style={jost}>
            NAIRA FLORE · THE ZIRCONE EDIT
          </p>

          {/* turning solitaire */}
          <div className="relative" style={{ perspective: "1100px" }}>
            <div data-glow className="pointer-events-none absolute inset-[-18%] rounded-full [background:radial-gradient(circle,rgba(201,154,76,0.28)_0%,transparent_65%)]" aria-hidden />
            <div ref={cardRef} className="relative aspect-square w-[min(70vw,340px)] will-change-transform md:w-[min(38vw,400px)]" style={{ transformStyle: "preserve-3d" }}>
              <img src={imgs[0]} alt={solitaire.name} draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ backfaceVisibility: "hidden" }} />
              <img src={imgs[1]} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
            </div>
            {/* glint sliver — the blade of light at the edge-on moments */}
            <div
              data-sliver
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-1/2 h-[92%] w-[3px] -translate-x-1/2 -translate-y-1/2"
              style={{ background: "linear-gradient(180deg, transparent, #C99A4C 25%, #FFF8F5 50%, #C99A4C 75%, transparent)", boxShadow: "0 0 26px 6px rgba(255,246,222,0.75)" }}
            />
            {/* contact shadow */}
            <div
              data-shadow
              aria-hidden
              className="pointer-events-none absolute -bottom-5 left-1/2 h-5 w-[70%] -translate-x-1/2 rounded-full opacity-70"
              style={{ background: "radial-gradient(ellipse, rgba(122,90,40,0.4) 0%, transparent 70%)", filter: "blur(4px)" }}
            />
            {/* fire beats */}
            <Star className="zs-beat -left-3 top-6" size={26} />
            <Star className="zs-beat -right-2 top-16" size={20} />
            <Star className="zs-beat -left-5 bottom-14" size={22} />
            <Star className="zs-beat -right-4 bottom-6" size={28} />
            <Star className="zs-beat left-1/2 -top-6 -translate-x-1/2" size={24} />
          </div>

          {/* headline beats (stacked, swapped by timeline) */}
          <div className="relative mt-8 h-[92px] w-full max-w-xl text-center md:h-[110px]">
            <h2 data-line className="absolute inset-x-0 top-0 text-[clamp(2rem,8vw,3.6rem)] leading-[1.02]" style={velista}>
              Cut like <span className="italic text-[#B0843A]" style={editorial}>a diamond.</span>
            </h2>
            <h2 data-line className="absolute inset-x-0 top-0 text-[clamp(2rem,8vw,3.6rem)] leading-[1.02]" style={velista}>
              Priced like <span className="italic text-[#B0843A]" style={editorial}>a flower.</span>
            </h2>
            <div data-finale className="absolute inset-x-0 top-0">
              <h2 className="text-[clamp(1.6rem,6vw,2.6rem)] leading-tight" style={velista}>{solitaire.name}</h2>
              <p className="mt-1 text-[13px] italic text-[#1A1614]/55" style={editorial}>{solitaire.materials}</p>
              <div className="mt-3 flex items-center justify-center gap-4">
                <span className="text-[16px] tracking-wide" style={jost}>{solitaire.priceLabel}</span>
                <button onClick={() => setQv(solitaire)} className="border border-[#1A1614] px-6 py-2.5 text-[10px] tracking-[0.3em] transition-colors duration-300 hover:bg-[#1A1614] hover:text-[#FBF3EC]" style={jost}>
                  ENQUIRE
                </button>
              </div>
            </div>
          </div>

          <span className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 text-[9px] tracking-[0.4em] text-[#1A1614]/35" style={jost}>SCROLL TO TURN</span>
        </div>
      </div>

      {/* ── the edit rail ── */}
      <div className="relative pb-6 pt-14 lg:pt-20">
        <div className="mb-8 px-6 text-center">
          <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>THE EDIT · SEVEN PIECES</p>
          <h3 className="mt-2 text-[clamp(1.8rem,5.5vw,3rem)]" style={velista}>
            Zircones &amp; <span className="italic text-[#B0843A]" style={editorial}>pressed flowers.</span>
          </h3>
        </div>
        <div className="zs-rail flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 lg:grid lg:max-w-6xl lg:snap-none lg:grid-cols-4 lg:gap-7 lg:overflow-visible lg:px-6 xl:mx-auto">
          {jewellery.map((p) => (
            <RailCard key={p.handle} piece={p} onOpen={() => setQv(p)} />
          ))}
          <Link to="/jewellery" className="group flex w-[72vw] shrink-0 snap-center flex-col items-center justify-center gap-3 border border-[#1A1614]/25 bg-[#F4EBE2]/50 text-center transition-colors duration-300 hover:border-[#1A1614] sm:w-[44vw] lg:w-auto lg:min-h-[280px]">
            <span className="text-[22px]" style={velista}>The full edit</span>
            <span className="text-[10px] tracking-[0.3em] text-[#9A7634] transition-transform duration-300 group-hover:translate-x-1" style={jost}>VIEW ALL →</span>
          </Link>
        </div>
      </div>

      {/* ── on-model close ── */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 pb-20 pt-10 lg:grid-cols-2 lg:gap-14 lg:pb-28">
        <div className="relative">
          <img src={modelIvory} alt="Chandbali Florale worn — Naira Flore campaign" loading="lazy" className="w-full object-cover shadow-[0_30px_60px_-30px_rgba(122,90,40,0.5)]" />
          <span className="absolute bottom-4 left-4 bg-[#FBF3EC]/90 px-3 py-1.5 text-[9px] tracking-[0.3em] text-[#9A7634]" style={jost}>WORN · CHANDBALI FLORALE</span>
        </div>
        <div className="text-center lg:text-left">
          <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>MADE TO ORDER</p>
          <h3 className="mt-3 text-[clamp(1.8rem,5vw,2.8rem)] leading-tight" style={velista}>
            Worn every day.
            <span className="block italic text-[#B0843A]" style={editorial}>Kept forever.</span>
          </h3>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-[#1A1614]/65 lg:mx-0" style={editorial}>
            Every piece is plated and finished to order in 2–3 weeks — brilliant
            white zircones and pressed flowers, set in 18k demi-gold.
          </p>
          <Link to="/jewellery" className="group relative mt-7 inline-flex items-center gap-3 overflow-hidden border border-[#1A1614] px-9 py-4 text-[11px] tracking-[0.32em] text-[#1A1614] transition-colors duration-500 hover:text-[#FBF3EC]" style={jost}>
            <span className="absolute inset-0 origin-left scale-x-0 bg-[#1A1614] transition-transform duration-500 ease-out group-hover:scale-x-100" />
            <span className="relative">EXPLORE THE COLLECTION</span>
            <span className="relative transition-transform duration-500 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>

      <JewelQuickView piece={qv} open={!!qv} onOpenChange={(o) => { if (!o) setQv(null); }} />
    </section>
  );
};

export default ZirconeScene;
