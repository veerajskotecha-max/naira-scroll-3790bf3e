import { useCallback, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HeroSection from "./HeroSection";
import TrustStrip from "./TrustStrip";
import NewArrivals from "./NewArrivals";
import handcraftedFloralPattern from "@/assets/background_image_flora.webp";
import nairaLogo from "@/assets/naira-logo.webp";

gsap.registerPlugin(ScrollTrigger);

const HeroScrollyWrapper = () => {
  const containerRef       = useRef<HTMLDivElement>(null);
  const arrivalsWrapperRef = useRef<HTMLDivElement>(null);
  const arrivalsContentRef = useRef<HTMLDivElement>(null);
  const transitionBgRef    = useRef<HTMLDivElement>(null);
  const logoRevealRef      = useRef<HTMLDivElement>(null);

  const [productsReady, setProductsReady] = useState(false);

  const isAnimating = useRef(false);

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
      // Logo starts already mostly visible — no blank screen on entry.
      if (heading) gsap.set(heading, { opacity: 0, y: -16 });
      gsap.set(productsGrid, { opacity: 1 });
      gsap.set(leftCards,  { x: "28vw",  opacity: 0, scale: 0.85 });
      gsap.set(rightCards, { x: "-28vw", opacity: 0, scale: 0.85 });
      gsap.set(logoReveal, { opacity: 0.85, y: 8, scale: 0.98, clipPath: "inset(0 6% 0 6%)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: arrivalsWrapperRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          onEnter:     () => { isAnimating.current = true;  },
          onLeave:     () => { isAnimating.current = false; },
          onEnterBack: () => { isAnimating.current = true;  },
          onLeaveBack: () => { isAnimating.current = false; },
        },
      });

      tl
        // 1. Logo settles in
        .to(logoReveal, {
          opacity: 0.95, y: 0, scale: 1, clipPath: "inset(0 0% 0 0%)",
          duration: 0.6, ease: "power3.out",
        })
        // 1.5s breathing pause before the collection follows
        .to({}, { duration: 1.5 })
        // 2. Heading
        .to(heading || {}, {
          opacity: 1, y: 0, duration: 0.55, ease: "power2.out",
        })
        // 3. Cards — staggered one-by-one from both sides
        .to(leftCards, {
          x: 0, opacity: 1, scale: 1,
          duration: 0.75, ease: "power2.out", stagger: 0.14,
        }, "-=0.2")
        .to(rightCards, {
          x: 0, opacity: 1, scale: 1,
          duration: 0.75, ease: "power2.out", stagger: 0.14,
        }, "<0.2");

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
      gsap.set(logoReveal, { opacity: 0.85, y: 6, scale: 0.98, clipPath: "inset(0 6% 0 6%)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: arrivalsWrapperRef.current,
          start: "top 85%",
          toggleActions: "play none none reverse",
          onEnter:     () => { isAnimating.current = true;  },
          onLeave:     () => { isAnimating.current = false; },
          onEnterBack: () => { isAnimating.current = true;  },
          onLeaveBack: () => { isAnimating.current = false; },
        },
      });

      tl
        .to(logoReveal, {
          opacity: 0.9, y: 0, scale: 1, clipPath: "inset(0 0% 0 0%)",
          duration: 0.55, ease: "power3.out",
        })
        // 1.5s breathing pause before the collection follows
        .to({}, { duration: 1.5 })
        .to(heading || {}, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" })
        .to(cards, { y: 0, opacity: 1, duration: 0.65, ease: "power2.out", stagger: 0.16 }, "-=0.2");

      return () => gsap.set([heading, productsGrid, ...cards, logoReveal], { clearProps: "all" });
    });

    return () => mm.revert();
  }, { scope: containerRef, dependencies: [productsReady] });

  const handleProductsReady = useCallback((ready: boolean) => {
    setProductsReady(ready);
  }, []);


  return (
    <div ref={containerRef} className="relative w-full flex flex-col overflow-x-hidden">
      <HeroSection />

      <TrustStrip />

      <div
        ref={arrivalsWrapperRef}
        data-petals-end
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
