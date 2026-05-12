import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import HeroPetals from "./HeroPetals";
import nairaLogo from "@/assets/naira-logo.webp";

const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const clamp = (v: number, a = 0, b = 1) => Math.max(a, Math.min(b, v));

const HeroSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const bloomRef = useRef<HTMLDivElement>(null);

  // smoothed scroll progress 0..1 across the 320vh section
  const progressRef = useRef(0);
  const targetProgress = useRef(0);

  const [vh, setVh] = useState(
    typeof window !== "undefined" ? window.innerHeight : 800
  );

  useEffect(() => {
    const onResize = () => setVh(window.innerHeight);
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    let raf = 0;
    let cachedTotal = 0;
    let cachedTop = 0;
    let lastMeasure = 0;

    const tick = (now: number) => {
      const sec = sectionRef.current;
      if (sec) {
        // Re-measure layout-bound values at most every 250ms
        if (now - lastMeasure > 250 || cachedTotal === 0) {
          const rect = sec.getBoundingClientRect();
          cachedTop = rect.top + window.scrollY;
          cachedTotal = sec.offsetHeight - vh;
          lastMeasure = now;
        }
        const scrolled = clamp((window.scrollY - cachedTop) / Math.max(cachedTotal, 1));
        targetProgress.current = scrolled;
      }
      // lerp
      progressRef.current += (targetProgress.current - progressRef.current) * 0.085;
      const p = progressRef.current;

      // Headline fades up & out 30–65%
      if (headlineRef.current) {
        const t = clamp((p - 0.3) / 0.35);
        headlineRef.current.style.opacity = String(1 - easeOutExpo(t));
        headlineRef.current.style.transform = `translateY(${-t * 28}px)`;
      }

      // Wordmark fades in 30–65%, max 0.7
      if (wordmarkRef.current) {
        const t = clamp((p - 0.3) / 0.35);
        const op = easeOutExpo(t) * 0.7;
        wordmarkRef.current.style.opacity = String(op);
        wordmarkRef.current.style.transform = `translateY(-50%) scale(${0.96 + t * 0.04})`;
      }

      // Bloom 65–100%
      if (bloomRef.current) {
        const t = clamp((p - 0.65) / 0.35);
        bloomRef.current.style.opacity = String(easeOutExpo(t));
        bloomRef.current.style.transform = `translate(-50%,-50%) scale(${0.5 + easeOutCubic(t) * 0.7})`;
      }

      // Expose to global so HeroScrollyWrapper can drive the model breath/lift
      (window as unknown as { __heroProgress?: number }).__heroProgress = p;

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [vh]);

  return (
    <section
      ref={sectionRef}
      data-hero-pinned
      className="relative w-full"
      style={{
        height: "320vh",
        background:
          "linear-gradient(180deg, #FBF4EA 0%, #F5E9DA 55%, #EFDFCB 100%)",
      }}
    >
      <div
        className="sticky top-0 w-full overflow-hidden"
        style={{ height: "100vh" }}
      >
        {/* ── Film grain overlay ── */}
        <svg
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ mixBlendMode: "overlay", opacity: 0.045, zIndex: 50 }}
        >
          <filter id="hero-grain">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
            />
            <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0" />
          </filter>
          <rect width="100%" height="100%" filter="url(#hero-grain)" />
        </svg>

        {/* ── NAIRA wordmark behind shoulders ── */}
        <div
          ref={wordmarkRef}
          aria-hidden="true"
          className="absolute inset-x-0 flex justify-center pointer-events-none"
          style={{
            top: "55%",
            opacity: 0,
            transform: "translateY(-50%) scale(0.96)",
            willChange: "opacity, transform",
            zIndex: 2,
          }}
        >
          <div
            className="relative w-[92vw] max-w-[560px] md:max-w-[860px] lg:max-w-[1180px] overflow-hidden"
            style={{ aspectRatio: "788 / 178" }}
          >
            <img
              src={nairaLogo}
              alt=""
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none"
              style={{
                width: "243.7%",
                height: "auto",
                filter: "saturate(0.85) brightness(1.04)",
              }}
              loading="eager"
              decoding="async"
            />
            {/* Bloom inside the dot of the I */}
            <div
              ref={bloomRef}
              className="absolute rounded-full"
              style={{
                left: "50%",
                top: "26%",
                width: "5.2%",
                aspectRatio: "1",
                background:
                  "radial-gradient(circle, rgba(244,180,160,0.95) 0%, rgba(244,180,160,0.55) 38%, rgba(244,180,160,0) 75%)",
                opacity: 0,
                transform: "translate(-50%,-50%) scale(0.5)",
                willChange: "opacity, transform",
                filter: "blur(2px)",
              }}
            />
          </div>
        </div>

        {/* ── Headline content (top of stage) ── */}
        <div
          ref={headlineRef}
          className="absolute inset-x-0 flex flex-col items-center text-center px-6"
          style={{
            top: "9vh",
            zIndex: 10,
            willChange: "opacity, transform",
          }}
        >
          <p
            className="text-[10px] md:text-[12px] tracking-[0.36em] uppercase mb-3 md:mb-5"
            style={{ color: "#8B6F5A" }}
          >
            Spring Mahal
          </p>
          <h1
            className="font-cormorant font-medium leading-[1.04]"
            style={{
              color: "#3D2B1F",
              fontSize: "clamp(34px, 6vw, 68px)",
            }}
          >
            Where Tradition
            <br />
            <em className="italic font-normal" style={{ color: "#A06B52" }}>
              meets
            </em>
            <br />
            Contemporary
          </h1>
          <Link
            to="/shop"
            className="mt-6 md:mt-9 inline-flex items-center font-cormorant text-[12px] md:text-[13px] uppercase tracking-[0.2em] px-8 py-3 rounded-sm hover:-translate-y-0.5 transition-transform duration-300"
            style={{ background: "#3D2B1F", color: "#FBF4EA" }}
          >
            Shop Collection
          </Link>
        </div>

        {/* ── Petals layer ── */}
        <HeroPetals progressRef={progressRef} vh={vh} />
      </div>
    </section>
  );
};

export default HeroSection;
