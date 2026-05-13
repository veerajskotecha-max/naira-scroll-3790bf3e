import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import HeroPetals from "./HeroPetals";

// ─── Lerp helper ───────────────────────────────────────────────
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

// ─── Headline words — each is a "mask reveal" unit ─────────────
const HEADLINE = [
  { text: "Where",        italic: false, delay: 80  },
  { text: "Tradition",    italic: false, delay: 180 },
  { text: "Meets",        italic: false, delay: 270 },
  { text: "Contemporary", italic: true,  delay: 370 },
  { text: "style",        italic: false, delay: 480 },
];

const MaskWord = ({
  text, italic, delay, revealed,
}: { text: string; italic: boolean; delay: number; revealed: boolean }) => (
  <span
    className="block overflow-hidden leading-none"
    style={{ paddingBottom: "0.08em", marginBottom: "-0.08em" }}
  >
    <span
      className="block"
      style={{
        transform: revealed ? "translateY(0)" : "translateY(110%)",
        transition: `transform ${italic ? "0.85s" : "0.75s"} ${
          italic
            ? "cubic-bezier(0.34, 1.56, 0.64, 1)"
            : "cubic-bezier(0.16, 1, 0.3, 1)"
        }`,
        transitionDelay: `${delay}ms`,
      }}
    >
      {italic ? <em className="italic font-normal">{text}</em> : text}
    </span>
  </span>
);

const HeroSection = () => {
  const [mounted, setMounted] = useState(false);

  const sectionRef   = useRef<HTMLElement>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);

  const glowRef     = useRef<HTMLDivElement>(null);
  const mouse       = useRef({ x: -999, y: -999 });
  const pos         = useRef({ x: -999, y: -999 });
  const glowVisible = useRef(false);
  const rafId       = useRef<number>(0);

  // Smoothed scroll progress for petals (0..1 across hero section)
  const petalProgress = useRef(0);
  const [vh, setVh] = useState(typeof window !== "undefined" ? window.innerHeight : 800);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  // Parallax + petal scroll progress (single RAF)
  useEffect(() => {
    let ticking = false;
    let sectionHeight = sectionRef.current?.offsetHeight ?? 0;
    // Extend the petal progress only to the start of New Arrivals, then stop.
    const extraRange = () => (window.innerWidth >= 1024 ? 220 : 110);

    const measure = () => {
      sectionHeight = sectionRef.current?.offsetHeight ?? 0;
      setVh(window.innerHeight);
    };

    let raf = 0;
    const lerpLoop = () => {
      const total = Math.max(sectionHeight + extraRange(), 1);
      if (window.scrollY >= total) {
        petalProgress.current = 1.25;
      } else {
        const target = clamp(window.scrollY / total);
        const current = petalProgress.current > 1 ? target : petalProgress.current;
        petalProgress.current = current + (target - current) * 0.1;
      }
      raf = requestAnimationFrame(lerpLoop);
    };
    raf = requestAnimationFrame(lerpLoop);

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        if (scrollY > sectionHeight) { ticking = false; return; }
        if (watermarkRef.current) {
          watermarkRef.current.style.transform = `translateY(${scrollY * 0.25}px)`;
        }
        if (textLayerRef.current) {
          textLayerRef.current.style.transform = `translateY(${scrollY * -0.06}px)`;
        }
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Cursor glow
  useEffect(() => {
    const prefersCoarse = window.matchMedia("(pointer: coarse)").matches;
    if (prefersCoarse) return;

    const section = sectionRef.current;
    const glow    = glowRef.current;
    if (!section || !glow) return;

    let rect = section.getBoundingClientRect();
    const remeasure = () => { rect = section.getBoundingClientRect(); };

    const loop = () => {
      pos.current.x = lerp(pos.current.x, mouse.current.x, 0.075);
      pos.current.y = lerp(pos.current.y, mouse.current.y, 0.075);
      glow.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      rafId.current = requestAnimationFrame(loop);
    };
    rafId.current = requestAnimationFrame(loop);

    const onMouseMove = (e: MouseEvent) => {
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
    window.addEventListener("scroll", remeasure, { passive: true });
    window.addEventListener("resize", remeasure, { passive: true });
    return () => {
      cancelAnimationFrame(rafId.current);
      section.removeEventListener("mousemove", onMouseMove);
      section.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", remeasure);
      window.removeEventListener("resize", remeasure);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "#E5B9A4",
        minHeight: "min(890px, 90vh)",
      }}
    >
      {/* Cursor glow */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute top-0 left-0 pointer-events-none select-none"
        style={{
          width: 300, height: 300, borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255,195,140,0.55) 0%, rgba(229,155,100,0.28) 45%, transparent 72%)",
          filter: "blur(18px)",
          opacity: 0,
          transition: "opacity 0.5s ease",
          willChange: "transform",
          zIndex: 5,
        }}
      />

      {/* Watermark NAIRA */}
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

      {/* Petals overlay — scoped inside hero, falls as user scrolls */}
      <HeroPetals progressRef={petalProgress} vh={vh} />

      <div
        className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center lg:items-end px-6 md:px-10 lg:px-14 xl:px-16"
        style={{ minHeight: "min(890px, 90vh)" }}
      >
        <div
          ref={textLayerRef}
          className="flex-1 z-50 order-1 max-w-[420px] lg:max-w-[440px] relative"
          style={{ willChange: "transform" }}
        >
          <div className="flex flex-col justify-center lg:justify-end pt-4 pb-0 lg:pt-0 lg:pb-24 text-center lg:text-left">
            <h1
              className="font-cormorant text-[34px] md:text-[48px] lg:text-[58px] xl:text-[62px] font-medium mb-3 md:mb-6 text-center lg:text-left"
              style={{ color: "#3D2B1F", lineHeight: 1.18 }}
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

            <p
              className="font-cormorant text-[14px] md:text-[16px] lg:text-[17px] leading-[1.6] mb-5 md:mb-10"
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

        {/* Spacer — actual model rendered by HeroScrollyWrapper */}
        <div className="flex-shrink-0 order-2 self-end" aria-hidden="true">
          <div className="h-[330px] md:h-[460px] lg:h-[590px] xl:h-[690px] w-[140px] md:w-[210px] lg:w-[290px] xl:w-[360px]" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
