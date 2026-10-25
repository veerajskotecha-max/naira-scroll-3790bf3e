import { useCallback, useRef, useState } from "react";
import HeroSection from "./HeroSection";
import TrustStrip from "./TrustStrip";
import NewArrivals from "./NewArrivals";
import handcraftedFloralPattern from "@/assets/background_image_flora.webp";

const HeroScrollyWrapper = ({ beforeArrivals }: { beforeArrivals?: React.ReactNode }) => {
  const containerRef       = useRef<HTMLDivElement>(null);
  const arrivalsWrapperRef = useRef<HTMLDivElement>(null);
  const arrivalsContentRef = useRef<HTMLDivElement>(null);

  const [, setProductsReady] = useState(false);

  const handleProductsReady = useCallback((ready: boolean) => {
    setProductsReady(ready);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full flex flex-col overflow-x-hidden">
      <HeroSection />

      <TrustStrip />

      {beforeArrivals}


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
        {/* The big NAIRA logo that sat behind the cards is gone (owner, 25 Oct
            2026): it showed through between the product names. */}
        <NewArrivals contentRef={arrivalsContentRef} onProductsReady={handleProductsReady} />
      </div>
    </div>
  );
};

export default HeroScrollyWrapper;
