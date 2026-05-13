import { useCallback, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "./HeroSection";
import TrustStrip from "./TrustStrip";
import NewArrivals from "./NewArrivals";
import heroModel1 from "@/assets/naira-hero-model-optimized.png";
import handcraftedFloralPattern from "@/assets/background_image_flora.webp";
import nairaLogo from "@/assets/naira-logo.webp";

gsap.registerPlugin(ScrollTrigger);

const HeroScrollyWrapper = () => {
  const containerRef       = useRef<HTMLDivElement>(null);
  const modelRef           = useRef<HTMLDivElement>(null);
  const arrivalsWrapperRef = useRef<HTMLDivElement>(null);
  const arrivalsContentRef = useRef<HTMLDivElement>(null);
  const transitionBgRef    = useRef<HTMLDivElement>(null);
  const logoRevealRef      = useRef<HTMLDivElement>(null);

  const [productsReady, setProductsReady] = useState(false);
  const heroSectionRef = useRef<HTMLDivElement>(null);

  const isAnimating = useRef(false);

  // Float the model with the viewport while the hero is in view, then lock her
  // to the hero's bottom edge (the white TrustStrip line) so she scrolls away
  // with the page instead of drifting into the collection.
  useEffect(() => {
    const onScroll = () => {
      const hero = heroSectionRef.current;
      const layer = modelRef.current;
      if (!hero || !layer) return;
      const heroRect = hero.getBoundingClientRect();
      const vh = window.innerHeight;
      // How far the hero's bottom sits above the viewport bottom (>=0 once it crosses).
      const overshoot = Math.max(0, vh - heroRect.bottom);
      // Hide once the hero is fully scrolled past.
      const hidden = heroRect.bottom <= 0;
      layer.style.transform = `translate3d(0, ${-overshoot}px, 0)`;
      layer.style.opacity = hidden ? "0" : "1";
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useGSAP(() => {
    const mm = gsap.matchMedia();

    // ── DESKTOP ────────────────────────────────────────────────
    mm.add("(min-width: 1024px)", () => {
      const content = arrivalsContentRef.current;
      if (!content) return;

      if (!productsReady) return;

      const productsGrid = content.querySelector("[data-arrivals-products]");
      const cards      = Array.from(content.querySelectorAll("[data-product-card]"));
      const leftCards  = cards.slice(0, 2);   // Midnight Saree, Ivory Anarkali → slide left
      const rightCards = cards.slice(2, 4);   // Terracotta, Lavender → slide right
      const heading    = content.querySelector("[data-arrivals-heading]");
      const logoReveal = logoRevealRef.current;

      // ── PRE-SET starting states so scrub can interpolate correctly ──
      if (heading) gsap.set(heading, { opacity: 0, y: -16 });
      gsap.set(productsGrid, { opacity: 1 });
      gsap.set(leftCards,  { x: "28vw",  opacity: 0, scale: 0.85 });
      gsap.set(rightCards, { x: "-28vw", opacity: 0, scale: 0.85 });
      gsap.set(logoReveal, { opacity: 0, y: 36, scale: 0.92, clipPath: "inset(0 50% 0 50%)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: arrivalsWrapperRef.current,
          start: "top top",
          end: "+=700",
          scrub: 1,
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
        // 1. Logo reveals
        .to(logoReveal, {
          opacity: 0.95,
          y: 0,
          scale: 1,
          clipPath: "inset(0 0% 0 0%)",
          duration: 1.25,
          ease: "power3.out",
        }, 0)
        .to({}, { duration: 0.45 })
        .to(logoReveal, {
          opacity: 0.85,
          y: -12,
          duration: 0.7,
          ease: "power2.out",
        })
        // 2. Heading drops in
        .to(heading || {}, {
          opacity: 1, y: 0,
          duration: 0.75, ease: "power2.out",
        }, "+=0.2")
        // 3. Cards slide in from both sides
        .to(leftCards, {
          x: 0, opacity: 1, scale: 1,
          duration: 1.5, ease: "power2.out",
          stagger: 0.15,
        }, "+=0.35")
        .to(rightCards, {
          x: 0, opacity: 1, scale: 1,
          duration: 1.5, ease: "power2.out",
          stagger: 0.15,
        }, "<")
        .to({}, { duration: 0.6 });

      return () => gsap.set([heading, productsGrid, ...leftCards, ...rightCards, logoReveal], { clearProps: "all" });
    });

    // ── MOBILE ─────────────────────────────────────────────────
    mm.add("(max-width: 1023px)", () => {
      const content = arrivalsContentRef.current;
      if (!content) return;

      if (!productsReady) return;

      const productsGrid = content.querySelector("[data-arrivals-products]");
      const cards   = Array.from(content.querySelectorAll("[data-product-card]"));
      const heading = content.querySelector("[data-arrivals-heading]");
      const logoReveal = logoRevealRef.current;

      if (heading) gsap.set(heading, { opacity: 0, y: -10 });
      gsap.set(productsGrid, { opacity: 1 });
      gsap.set(cards, { y: "20vh", opacity: 0 });
      gsap.set(logoReveal, { opacity: 0, y: 26, scale: 0.94, clipPath: "inset(0 50% 0 50%)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: arrivalsWrapperRef.current,
          start: "top top",
          end: "+=320",          // tight on mobile — straight into the collection
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
        .to(logoReveal, {
          opacity: 0.9,
          y: 0,
          scale: 1,
          clipPath: "inset(0 0% 0 0%)",
          duration: 0.75,
          ease: "power3.out",
        }, 0)
        .to({}, { duration: 0.18 })
        .to(logoReveal, { opacity: 0.8, y: -8, duration: 0.4, ease: "power2.out" })
        .to(heading || {}, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" }, "+=0.12")
        .to(cards, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.08 }, "+=0.18")
        .to({}, { duration: 0.3 });

      return () => gsap.set([heading, productsGrid, ...cards, logoReveal], { clearProps: "all" });
    });

    return () => mm.revert();
  }, { scope: containerRef, dependencies: [productsReady] });

  const handleProductsReady = useCallback((ready: boolean) => {
    setProductsReady(ready);
  }, []);


  return (
    <div ref={containerRef} className="relative w-full flex flex-col overflow-x-hidden">
      <style>{`
        .hero-model-layer { position: fixed; top: 98px; bottom: 0; opacity: 1; transform: none; }
        @media (min-width: 768px)  { .hero-model-layer { top: 108px; } }
        @media (min-width: 1024px) { .hero-model-layer { top: 120px; } }
        /* Model: smaller, anchored at bottom so she starts below the SHOP COLLECTION button.
           On short viewports she shrinks aggressively so she never overlaps the headline / CTA. */
        .hero-model-img {
          max-width: 64vw;
          height: 34vh;
          max-height: 275px;
        }
        @media (min-height: 700px) {
          .hero-model-img { max-width: 72vw; height: 36vh; max-height: 320px; }
        }
        @media (min-width: 768px)  {
          .hero-model-img { max-width: 44vw; height: min(500px, calc(100% - 10vh)); max-height: none; }
        }
        @media (min-width: 1024px) { .hero-model-img { max-width: 38vw; } }
      `}</style>

      <div
        ref={modelRef}
        className="hero-model-layer left-0 w-full z-40 pointer-events-none flex items-end justify-center"
        style={{
          bottom: 0,
          willChange: "transform, opacity",
          opacity: 1,
          transition: "opacity 0.4s ease",
        }}
        aria-hidden="true"
      >
        <img
          src={heroModel1}
          alt=""
          className="hero-model-img absolute bottom-0 md:bottom-[4vh] w-auto object-contain object-bottom"
          style={{ filter: "drop-shadow(0 18px 22px rgba(74, 58, 45, 0.20))" }}
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
      </div>

      <div ref={heroSectionRef}>
        <HeroSection />
      </div>

      <TrustStrip />

      <div
        ref={arrivalsWrapperRef}
        className="relative z-10"
        style={{ backgroundColor: "hsl(33 30% 85%)" }}
      >
        <div
          ref={transitionBgRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: `url(${handcraftedFloralPattern})`,
            backgroundSize: "600px",
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
            opacity: 0.5,
            zIndex: 0,
          }}
        />
        <div
          ref={logoRevealRef}
          aria-hidden="true"
          className="absolute inset-x-0 top-[38vh] md:top-[34vh] lg:top-[30vh] pointer-events-none select-none flex justify-center"
          style={{
            opacity: 0,
            zIndex: 2,
            willChange: "opacity, transform, clip-path",
          }}
        >
          {/*
            WebP canvas is 1920x1080 with the wordmark occupying a 788x178 region
            centered inside it. The SVG it replaces was tightly cropped to the
            wordmark, so to keep the rendered NAIRA wordmark visually identical
            in size and position, we clip to the wordmark's aspect ratio
            (788 / 178 ≈ 4.427) at the original responsive widths and overscale
            the underlying image by 1920/788 ≈ 2.437× so its inner wordmark
            lands at the same on-screen size as before.
          */}
          <div
            className="relative w-[82vw] max-w-[520px] md:max-w-[760px] lg:max-w-[980px] overflow-hidden"
            style={{ aspectRatio: "788 / 178" }}
          >
            <img
              src={nairaLogo}
              alt=""
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-none"
              style={{
                width: "243.7%",
                height: "auto",
                objectFit: "contain",
                filter: "sepia(0.15) saturate(0.85)",
              }}
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
        <NewArrivals contentRef={arrivalsContentRef} onProductsReady={handleProductsReady} />
      </div>
    </div>
  );
};

export default HeroScrollyWrapper;
