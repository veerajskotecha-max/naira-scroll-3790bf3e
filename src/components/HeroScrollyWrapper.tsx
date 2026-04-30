import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "./HeroSection";
import TrustStrip from "./TrustStrip";
import NewArrivals from "./NewArrivals";
import heroModel1 from "@/assets/naira-final-hero-1.png";
import handcraftedFloralPattern from "@/assets/background_image_flora.webp";
import nairaLogo from "@/assets/naira-logo.svg";

gsap.registerPlugin(ScrollTrigger);

const HeroScrollyWrapper = () => {
  const containerRef       = useRef<HTMLDivElement>(null);
  const modelRef           = useRef<HTMLDivElement>(null);
  const arrivalsWrapperRef = useRef<HTMLDivElement>(null);
  const arrivalsContentRef = useRef<HTMLDivElement>(null);
  const transitionBgRef    = useRef<HTMLDivElement>(null);
  const logoRevealRef      = useRef<HTMLDivElement>(null);

  const isAnimating = useRef(false);

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
      const transitionBg = transitionBgRef.current;
      const logoReveal = logoRevealRef.current;

      // ── PRE-SET starting states so scrub can interpolate correctly ──
      if (heading) gsap.set(heading, { opacity: 0, y: -16 });
      gsap.set(leftCards,  { x: "28vw",  opacity: 0, scale: 0.85 });
      gsap.set(rightCards, { x: "-28vw", opacity: 0, scale: 0.85 });
      gsap.set(transitionBg, { opacity: 0, y: 18, scale: 1.04 });
      gsap.set(logoReveal, { opacity: 0, y: 30, scale: 0.94, clipPath: "inset(0 50% 0 50%)" });

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
        // 1. Handcrafted transition atmosphere reveals as model travels down
        .to(transitionBg, {
          opacity: 0.48,
          y: 0,
          scale: 1,
          duration: 0.85,
          ease: "power2.out",
        }, 0)
        .to(logoReveal, {
          opacity: 0.18,
          y: 0,
          scale: 1,
          clipPath: "inset(0 0% 0 0%)",
          duration: 1.05,
          ease: "power3.out",
        }, 0.08)
        // 2. Model shrinks — feet stay grounded
        .to(modelRef.current, {
          scale: 0.72,
          transformOrigin: "bottom center",
          duration: 1.2,
          ease: "power3.inOut",
        }, 0)
        .to(logoReveal, {
          opacity: 0.07,
          y: -12,
          duration: 0.55,
          ease: "power2.out",
        }, "-=0.2")
        // 3. Heading drops in
        .to(heading || {}, {
          opacity: 1, y: 0,
          duration: 0.6, ease: "power2.out",
        }, "-=0.2")
        // 4. Left pair slides from centre → their grid position
        .to(leftCards, {
          x: 0, opacity: 1, scale: 1,
          duration: 1.5, ease: "power2.out",
          stagger: 0.15,
        }, "-=0.3")
        // 5. Right pair slides simultaneously the other way
        .to(rightCards, {
          x: 0, opacity: 1, scale: 1,
          duration: 1.5, ease: "power2.out",
          stagger: 0.15,
        }, "<")
        // 6. Hold — let scroll inertia exhale before the pin releases
        .to({}, { duration: 1.0 })
        // 7. Model exits stage right
        .to(modelRef.current, {
          x: "110vw", opacity: 0, rotation: 12,
          transformOrigin: "bottom center",
          duration: 1.2, ease: "power1.inOut",
        })
        // 8. Final breathe — pin sits still so scroll has time to decelerate naturally
        .to({}, { duration: 1.2 });

      return () => gsap.set([heading, ...leftCards, ...rightCards, transitionBg, logoReveal], { clearProps: "all" });
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
          end: "+=600",          // significantly reduced to feel fast and snappy on mobile
          scrub: 0.8,            // slightly tighter scrub
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
          scale: 0.75, transformOrigin: "bottom center",
          duration: 0.8, ease: "power2.inOut",
        })
        .to(heading || {}, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .to(cards, { y: 0, opacity: 1, duration: 1.0, ease: "power2.out", stagger: 0.1 }, "-=0.4")
        .to({}, { duration: 0.2 })
        .to(modelRef.current, {
          x: "110vw", opacity: 0, rotation: 8,
          transformOrigin: "bottom center",
          duration: 0.8, ease: "power1.inOut",
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
        .hero-model-img { 
          max-width: 85vw; 
          height: 40vh;
          max-height: 320px;
        }
        @media (min-width: 768px)  { 
          .hero-model-img { max-width: 55vw; height: min(590px, calc(100% - 6vh)); max-height: none; } 
        }
        @media (min-width: 1024px) { .hero-model-img { max-width: 48vw; } }
      `}</style>

      <div
        ref={modelRef}
        className="hero-model-layer left-0 w-full z-40 pointer-events-none flex items-end justify-center"
        style={{ bottom: 0, willChange: "transform, opacity" }}
        aria-hidden="true"
      >
        <img
          src={heroModel1}
          alt=""
          className="hero-model-img absolute bottom-0 md:bottom-[4vh] w-auto object-contain object-bottom transition-opacity duration-500 ease-in-out"
          style={{ filter: "drop-shadow(0 8px 30px rgba(74,47,34,0.12))" }}
          loading="eager"
        />
      </div>

      <div>
        <HeroSection />
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
