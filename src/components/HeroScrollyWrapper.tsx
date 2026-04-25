import { useRef, useState, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "./HeroSection";
import TrustStrip from "./TrustStrip";
import NewArrivals from "./NewArrivals";

gsap.registerPlugin(ScrollTrigger);

import heroModel1 from "@/assets/hero-model.png";
import heroModel2 from "@/assets/hero-model-2.png";
import heroModel3 from "@/assets/hero-model-3.png";

export const SCROLL_SLIDES = [
  { hero: heroModel1 },
  { hero: heroModel2 },
  { hero: heroModel3 },
];

const HeroScrollyWrapper = () => {
  const containerRef       = useRef<HTMLDivElement>(null);
  const modelRef           = useRef<HTMLDivElement>(null);
  const arrivalsWrapperRef = useRef<HTMLDivElement>(null);
  const arrivalsContentRef = useRef<HTMLDivElement>(null);

  const [current, setCurrent]   = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const isAnimating             = useRef(false);

  const next = useCallback(() => {
    if (!isPaused && !isAnimating.current)
      setCurrent((prev) => (prev + 1) % SCROLL_SLIDES.length);
  }, [isPaused]);

  useEffect(() => {
    const id = setInterval(next, 4500);
    return () => clearInterval(id);
  }, [next]);

  useEffect(() => {
    const onScroll = () => setIsPaused(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // ── DESKTOP ────────────────────────────────────────────────
    mm.add("(min-width: 1024px)", () => {
      const content = arrivalsContentRef.current;
      if (!content) return;

      const cards      = Array.from(content.querySelectorAll("[data-product-card]"));
      const leftCards  = cards.slice(0, 2);   // Midnight Saree, Ivory Anarkali → slide left
      const rightCards = cards.slice(2, 4);   // Terracotta, Lavender → slide right
      const heading    = content.querySelector("[data-arrivals-heading]");

      // ── PRE-SET starting states so scrub can interpolate correctly ──
      if (heading) gsap.set(heading, { opacity: 0, y: -16 });
      gsap.set(leftCards,  { x: "28vw",  opacity: 0, scale: 0.85 });
      gsap.set(rightCards, { x: "-28vw", opacity: 0, scale: 0.85 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: arrivalsWrapperRef.current,
          start: "top top",
          end: "+=2400",
          scrub: 1.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onEnter:     () => { isAnimating.current = true;  },
          onLeave:     () => { isAnimating.current = false; },
          onEnterBack: () => { isAnimating.current = true;  },
          onLeaveBack: () => { isAnimating.current = false; },
        },
      });

      tl
        // 1. Model shrinks — feet stay grounded
        .to(modelRef.current, {
          scale: 0.72,
          transformOrigin: "bottom center",
          duration: 1.2,
          ease: "power3.inOut",
        })
        // 2. Heading drops in
        .to(heading || {}, {
          opacity: 1, y: 0,
          duration: 0.6, ease: "power2.out",
        }, "-=0.2")
        // 3. Left pair slides from centre → their grid position
        .to(leftCards, {
          x: 0, opacity: 1, scale: 1,
          duration: 1.5, ease: "power2.out",
          stagger: 0.15,
        }, "-=0.3")
        // 4. Right pair slides simultaneously the other way
        .to(rightCards, {
          x: 0, opacity: 1, scale: 1,
          duration: 1.5, ease: "power2.out",
          stagger: 0.15,
        }, "<")
        // 5. Hold — let scroll inertia exhale before the pin releases
        .to({}, { duration: 1.0 })
        // 6. Model exits stage right
        .to(modelRef.current, {
          x: "110vw", opacity: 0, rotation: 12,
          transformOrigin: "bottom center",
          duration: 1.2, ease: "power1.inOut",
        })
        // 7. Final breathe — pin sits still so scroll has time to decelerate naturally
        .to({}, { duration: 1.2 });

      return () => gsap.set([heading, ...leftCards, ...rightCards], { clearProps: "all" });
    });

    // ── MOBILE ─────────────────────────────────────────────────
    mm.add("(max-width: 1023px)", () => {
      const content = arrivalsContentRef.current;
      if (!content) return;

      const cards   = Array.from(content.querySelectorAll("[data-product-card]"));
      const heading = content.querySelector("[data-arrivals-heading]");

      if (heading) gsap.set(heading, { opacity: 0, y: -10 });
      gsap.set(cards, { y: "20vh", opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: arrivalsWrapperRef.current,
          start: "top top",
          end: "+=1200",          // reduced from 2000 — cuts mobile scroll dead-zone nearly in half
          scrub: 1.0,
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          onEnter:     () => { isAnimating.current = true;  },
          onLeave:     () => { isAnimating.current = false; },
          onEnterBack: () => { isAnimating.current = true;  },
          onLeaveBack: () => { isAnimating.current = false; },
        },
      });

      tl
        .to(modelRef.current, {
          scale: 0.65, transformOrigin: "bottom center",
          duration: 1, ease: "power1.inOut",
        })
        .to(heading || {}, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "-=0.2")
        .to(cards, { y: 0, opacity: 1, duration: 1.4, ease: "power2.out", stagger: 0.1 }, "-=0.3")
        .to({}, { duration: 0.4 })
        .to(modelRef.current, {
          x: "110vw", opacity: 0, rotation: 8,
          transformOrigin: "bottom center",
          duration: 1.0, ease: "power1.inOut",
        })
        // Brief final breathe before pin releases
        .to({}, { duration: 0.6 });

      return () => gsap.set([heading, ...cards], { clearProps: "all" });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="relative w-full flex flex-col overflow-x-hidden">
      <style>{`
        .hero-model-layer { position: fixed; top: 98px; }
        @media (min-width: 768px)  { .hero-model-layer { top: 108px; } }
        @media (min-width: 1024px) { .hero-model-layer { top: 120px; } }
        /* Model max-width: wider on small screens so it doesn't look clipped */
        .hero-model-img { max-width: 68vw; }
        @media (min-width: 768px)  { .hero-model-img { max-width: 55vw; } }
        @media (min-width: 1024px) { .hero-model-img { max-width: 48vw; } }
      `}</style>

      <div
        ref={modelRef}
        className="hero-model-layer left-0 w-full z-40 pointer-events-none flex items-end justify-center"
        style={{ bottom: 0, willChange: "transform, opacity" }}
        aria-hidden="true"
      >
        {SCROLL_SLIDES.map((s, i) => (
          <img
            key={i}
            src={s.hero}
            alt=""
            /* hero-model-img provides responsive max-width via the <style> block above */
            className="hero-model-img absolute bottom-[4vh] w-auto object-contain object-bottom transition-opacity duration-500 ease-in-out"
            style={{
              opacity: current === i ? 1 : 0,
              filter: "drop-shadow(0 8px 30px rgba(74,47,34,0.12))",
              /* Height constrained to available viewport — never overflows into header */
              height: "min(590px, calc(100% - 6vh))",
            }}
            loading={i === 0 ? "eager" : "lazy"}
          />
        ))}
      </div>

      <div>
        <HeroSection current={current} setCurrent={setCurrent} />
      </div>

      <TrustStrip />

      <div
        ref={arrivalsWrapperRef}
        className="relative z-10"
        style={{ backgroundColor: "hsl(33 30% 85%)" }}
      >
        <NewArrivals contentRef={arrivalsContentRef} />
      </div>
    </div>
  );
};

export default HeroScrollyWrapper;
