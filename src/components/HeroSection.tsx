import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import heroModel1 from "@/assets/naira-final-hero-1.png";
import heroModel2 from "@/assets/naira-final-hero-2.png";
import heroModel3 from "@/assets/naira-final-hero-3.png";

// The 3 hero models — used as both the main carousel and the featured collection previews
const HERO_MODELS = [heroModel1, heroModel2, heroModel3];

// ─── Lerp helper ───────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// ─── Headline words — each is a "mask reveal" unit ─────────────
// italic=true → rendered as <em> with extra easing
// delay → ms offset from when mount fires
const HEADLINE = [
  { text: "Where",        italic: false, delay: 80  },
  { text: "Tradition",    italic: false, delay: 180 },
  { text: "Meets",        italic: false, delay: 270 },
  { text: "Contemporary", italic: true,  delay: 370 }, // hero word — special easing
  { text: "style",        italic: false, delay: 480 },
];

// ─── MaskWord — clips + slides each word up into view ──────────
const MaskWord = ({
  text,
  italic,
  delay,
  revealed,
}: {
  text: string;
  italic: boolean;
  delay: number;
  revealed: boolean;
}) => (
  // Outer: overflow:hidden acts as the "mask" — text below baseline is invisible
  <span
    className="block overflow-hidden leading-none"
    // Extra padding-bottom prevents descenders (g, y, j) from being clipped
    style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
  >
    {/* Inner: slides from translateY(110%) → translateY(0) */}
    <span
      className="block"
      style={{
        transform: revealed ? "translateY(0)" : "translateY(110%)",
        // Standard words: expo-out spring — fast arrival, feathers at top
        // Contemporary: back-out spring — slight overshoot for drama
        transition: `transform ${italic ? "0.85s" : "0.75s"} ${
          italic
            ? "cubic-bezier(0.34, 1.56, 0.64, 1)"  // back-out: slight bounce
            : "cubic-bezier(0.16, 1, 0.3, 1)"       // expo-out: ultra-smooth
        }`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {italic ? (
        <em className="italic font-normal">{text}</em>
      ) : (
        text
      )}
    </span>
  </span>
);

const HeroSection = ({
  current,
  setCurrent,
}: {
  current: number;
  setCurrent: (idx: number) => void;
}) => {
  const [mounted, setMounted] = useState(false);

  // Parallax refs
  const sectionRef   = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  // Cursor glow refs
  const glowRef     = useRef<HTMLDivElement>(null);
  const mouse       = useRef({ x: -999, y: -999 });
  const pos         = useRef({ x: -999, y: -999 });
  const glowVisible = useRef(false);
  const rafId       = useRef<number>(0);

  // Touch swipe refs — for mobile carousel navigation
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // ── Mount: triggers the kinetic reveal cascade ──────────────────
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  // ── EFFECT 2: Parallax depth layers ────────────────────────────
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const section = sectionRef.current;
        if (!section) { ticking = false; return; }

        const scrollY  = window.scrollY;
        const sectionH = section.offsetHeight;

        // Only apply within the hero's own height
        if (scrollY > sectionH) { ticking = false; return; }

        // Watermark drifts UP slowly — 0.25× → feels far-away / deep
        if (watermarkRef.current) {
          watermarkRef.current.style.transform = `translateY(${scrollY * 0.25}px)`;
        }
        // Text panel drifts UP slightly faster → feels closer / foreground
        if (textLayerRef.current) {
          textLayerRef.current.style.transform = `translateY(${scrollY * -0.06}px)`;
        }

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── EFFECT 3: Cursor glow with spring lag ───────────────────────
  useEffect(() => {
    const prefersCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersCoarse) return;

    const section = sectionRef.current;
    const glow    = glowRef.current;
    if (!section || !glow) return;

    const loop = () => {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.075);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.075);
      glow.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mouse.current.x = e.clientX - rect.left - 150;
      mouse.current.y = e.clientY - rect.top  - 150;

      if (!glowVisible.current) {
        glowVisible.current = true;
        glow.style.opacity = "1";
        pos.current.x = mouse.current.x;
        pos.current.y = mouse.current.y;
      }
    };

    const onMouseLeave = () => {
      glowVisible.current = false;
      glow.style.opacity = "0";
    };

    section.addEventListener("mousemove", onMouseMove);
    section.addEventListener("mouseleave", onMouseLeave);

    return () => {
      cancelAnimationFrame(rafId.current);
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // ── Touch swipe handlers (mobile carousel) ─────────────────────
  // Only fires when horizontal swipe dominates vertical — safe from scroll interference
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    const dy = touchStartY.current - e.changedTouches[0].clientY;
    // Only register as horizontal swipe if dx is dominant (not a scroll gesture)
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      if (dx > 0) {
        setCurrent((current + 1) % HERO_MODELS.length);
      } else {
        setCurrent((current - 1 + HERO_MODELS.length) % HERO_MODELS.length);
      }
    }
  };

  const previewIndices = HERO_MODELS.map((_, i) => i).filter((i) => i !== current);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        backgroundColor: "#E5B9A4",
        minHeight: "min(890px, 90vh)",
      }}
    >
      {/* ── CURSOR GLOW ─────────────────────────────────────────── */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none select-none"
        style={{
          width: 300,
          height: 300,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,195,140,0.55) 0%, rgba(229,155,100,0.28) 45%, transparent 72%)",
          filter: "blur(18px)",
          opacity: 0,
          transition: "opacity 0.5s ease",
          willChange: "transform",
          zIndex: 5,
        }}
      />

      {/* ── WATERMARK — parallax layer (0.25× scroll) ─────────────── */}
      <div
        ref={watermarkRef}
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ willChange: "transform", zIndex: 1 }}
        aria-hidden="true"
      >
        <span
          className="font-cormorant font-semibold uppercase"
          style={{
            fontSize: "clamp(140px, 20vw, 380px)",
            color: "#8B5E3C",
            opacity: 0.06,
            letterSpacing: "0.05em",
          }}
        >
          NAIRA
        </span>
      </div>

      {/* Main content grid */}
      <div
        className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center lg:items-end px-6 md:px-10 lg:px-14 xl:px-16"
        style={{ minHeight: "min(890px, 90vh)" }}
      >
        {/* LEFT — Parallax wrapper (foreground layer, -0.06× scroll) */}
        <div
          ref={textLayerRef}
          className="flex-1 z-20 order-1 max-w-[420px] lg:max-w-[440px]"
          style={{ willChange: "transform" }}
        >
          <div className="flex flex-col justify-center lg:justify-end pt-8 pb-4 lg:pt-0 pb-10 md:pb-14 lg:pb-24 text-center lg:text-left">

            {/* ── KINETIC HEADLINE ──────────────────────────────────
                Each word is a MaskWord: slides up from below an
                overflow:hidden clip in sequence.
                Line-height is set on the <h1> so each MaskWord block
                has the correct spacing. The block display of MaskWord
                means each word sits on its own line, matching the
                original layout exactly.
            ───────────────────────────────────────────────────── */}
            <h1
              className="font-cormorant text-[34px] md:text-[48px] lg:text-[58px] xl:text-[62px] font-medium mb-5 md:mb-6 text-center lg:text-left"
              style={{
                color: "#3D2B1F",
                lineHeight: 1.18,
              }}
            >
              {HEADLINE.map((word) => (
                <MaskWord
                  key={word.text}
                  text={word.text}
                  italic={word.italic}
                  delay={word.delay}
                  revealed={mounted}
                />
              ))}
            </h1>

            {/* ── SUBTITLE — fades in after all words have appeared */}
            <p
              className="font-cormorant text-[14px] md:text-[16px] lg:text-[17px] leading-[1.6] mb-8 md:mb-10"
              style={{
                color: "rgba(61, 43, 31, 0.7)",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: "opacity 0.7s ease, transform 0.7s ease",
                transitionDelay: "640ms",
              }}
            >
              Discover the finest Indo-Western fusion wear,
              <br className="hidden md:block" />
              crafted for the modern woman.
            </p>

            {/* ── CTA — slides up last, after subtitle */}
            <div
              className="flex flex-wrap gap-4 justify-center lg:justify-start"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 0.65s ease, transform 0.65s ease",
                transitionDelay: "800ms",
              }}
            >
              <Link
                to="/shop"
                className="font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.14em] px-7 md:px-8 py-3.5 md:py-[14px] rounded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: "#4A2F22", color: "#FFFFFF" }}
              >
                SHOP COLLECTION
              </Link>
            </div>

          </div>
        </div>

        {/* CENTER SPACER — actual model rendered by HeroScrollyWrapper */}
        <div className="flex-shrink-0 order-2 self-end" aria-hidden="true">
          <div className="h-[330px] md:h-[460px] lg:h-[590px] xl:h-[690px] w-[140px] md:w-[210px] lg:w-[290px] xl:w-[360px]" />
        </div>

        {/* RIGHT BOTTOM — Featured collection (desktop only) */}
        <div
          className="hidden lg:flex flex-col items-end justify-end pb-20 xl:pb-24 flex-1 z-20 order-3"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
            transitionDelay: "700ms",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ backgroundColor: "#4A2F22" }}
            />
            <span
              className="font-cormorant text-[11px] xl:text-[12px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "#4A2F22" }}
            >
              FEATURED COLLECTION
            </span>
          </div>

          <div className="flex gap-3">
            {previewIndices.map((modelIdx) => (
              <button
                key={modelIdx}
                onClick={() => setCurrent(modelIdx)}
                className="w-[90px] h-[120px] xl:w-[100px] xl:h-[135px] rounded-full overflow-hidden relative transition-all duration-300 hover:scale-105"
                style={{
                  border: "2px solid rgba(74,47,34,0.18)",
                  outline: "none",
                }}
                aria-label={`Switch to model ${modelIdx + 1}`}
              >
                <img
                  src={HERO_MODELS[modelIdx]}
                  alt={`Hero model ${modelIdx + 1}`}
                  className="w-full h-full object-cover object-top"
                />
              </button>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex items-center gap-0 mt-4">
            {HERO_MODELS.map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-center cursor-pointer"
                style={{ width: 28, height: 44 }}
                onClick={() => setCurrent(i)}
                role="button"
                aria-label={`Go to model ${i + 1}`}
              >
                <span
                  className="rounded-full transition-all duration-300 block"
                  style={{
                    width: 6,
                    height: 6,
                    backgroundColor: current === i ? "#4A2F22" : "rgba(74,47,34,0.25)",
                    transform: current === i ? "scale(1.4)" : "scale(1)",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE — Featured collection below hero */}
      <div className="lg:hidden flex flex-col items-center pb-10 px-6 relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-[5px] h-[5px] rounded-full"
            style={{ backgroundColor: "#4A2F22" }}
          />
          <span
            className="font-cormorant text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "#4A2F22" }}
          >
            FEATURED COLLECTION
          </span>
        </div>

        <div className="flex gap-3">
          {previewIndices.map((modelIdx) => (
            <button
              key={modelIdx}
              onClick={() => setCurrent(modelIdx)}
              className="w-[72px] h-[96px] md:w-[80px] md:h-[106px] rounded-full overflow-hidden relative transition-all duration-300 active:scale-95"
              style={{ border: "2px solid rgba(74,47,34,0.18)" }}
              aria-label={`Switch to model ${modelIdx + 1}`}
            >
              <img
                src={HERO_MODELS[modelIdx]}
                alt={`Hero model ${modelIdx + 1}`}
                className="w-full h-full object-cover object-top"
              />
            </button>
          ))}
        </div>

        {/* Mobile dot indicators */}
        <div className="flex items-center gap-0 mt-4">
          {HERO_MODELS.map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center cursor-pointer"
              style={{ width: 28, height: 44 }}
              onClick={() => setCurrent(i)}
              role="button"
              aria-label={`Go to model ${i + 1}`}
            >
              <span
                className="rounded-full transition-all duration-300 block"
                style={{
                  width: 6,
                  height: 6,
                  backgroundColor: current === i ? "#4A2F22" : "rgba(74,47,34,0.25)",
                  transform: current === i ? "scale(1.4)" : "scale(1)",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
