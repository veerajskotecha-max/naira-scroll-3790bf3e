import { useCallback, useRef, useState } from "react";
import HeroSection from "./HeroSection";
import TrustStrip from "./TrustStrip";
import NewArrivals from "./NewArrivals";
import handcraftedFloralPattern from "@/assets/background_image_flora.webp";
import nairaLogo from "@/assets/naira-logo.webp";

const HeroScrollyWrapper = () => {
  const containerRef       = useRef<HTMLDivElement>(null);
  const arrivalsWrapperRef = useRef<HTMLDivElement>(null);
  const arrivalsContentRef = useRef<HTMLDivElement>(null);
  const logoRevealRef      = useRef<HTMLDivElement>(null);

  const [, setProductsReady] = useState(false);

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
          style={{ opacity: 0.95, zIndex: 2 }}
        >
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
