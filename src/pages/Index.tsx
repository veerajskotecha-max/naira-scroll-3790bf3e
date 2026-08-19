import { useEffect, useRef } from "react";
import HeroScrollyWrapper from "@/components/HeroScrollyWrapper";
import { armRevealFallback, isInViewport } from "@/lib/revealFallback";

import CustomisationSteps from "@/components/CustomisationSteps";
import BrandEthos from "@/components/BrandEthos";
import Craftsmanship from "@/components/Craftsmanship";
import Testimonials from "@/components/Testimonials";
import CampaignFilm from "@/components/CampaignFilm";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { organizationLd } from "@/data/siteMeta";
import FounderStoryTeaser from "@/components/FounderStoryTeaser";
import ZirconeTurn from "@/components/jewellery/ZirconeTurn";
import JewelleryCategories from "@/components/jewellery/JewelleryCategories";

import RingAtelierBackdrop from "@/components/jewellery/RingAtelierBackdrop";


const Index = () => {
  const revealRef = useRef<HTMLDivElement>(null);

  // Trigger .is-visible once the section enters the viewport after the GSAP
  // pin releases. IntersectionObserver fires only when the element is
  // genuinely on-screen — it doesn't fight the GSAP pin spacer.
  useEffect(() => {
    const el = revealRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect(); // fire once only
        }
      },
      { threshold: 0.01 } // trigger earlier to ensure it fires on mobile
    );
    observer.observe(el);
    const disposeFallback = armRevealFallback(() => {
      if (isInViewport(el)) el.classList.add("is-visible");
    });
    return () => { observer.disconnect(); disposeFallback(); };
  }, []);

  return (
    <>
      <PageSEO
        title="Naira Flore | Handcrafted Indo-Western Fashion"
        description="Discover handmade embroidered sarees, lehengas & anarkalis by Naira Flore. Premium Indo-Western fusion wear crafted for the modern woman. Free shipping above ₹2,999."
        canonical="https://nairaflore.com/"
        jsonLd={organizationLd as unknown as Record<string, unknown>}
      />
      <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
        <HeroScrollyWrapper
          beforeArrivals={
            <>
              <div className="relative isolate overflow-hidden bg-[#FBF3EC] [&_section]:!bg-transparent">
                <div className="pointer-events-none absolute inset-0 z-0">
                  <RingAtelierBackdrop variant="section" />
                </div>
                <div className="relative z-[1]">
                  <ZirconeTurn idAttr="jewellery" inheritBackdrop />
                  <div className="section-reveal is-visible">
                    <JewelleryCategories />
                  </div>
                </div>
              </div>
            </>
          }
        />

        {/* pressed-flower wash continues from the hero all the way down to The Flore Edit */}
        <div className="relative isolate overflow-hidden bg-[#FBF3EC] [&_section]:!bg-transparent">
          <div className="pointer-events-none absolute inset-0 z-0">
            <RingAtelierBackdrop variant="section" />
          </div>
          <div className="relative z-[1]">
            <div ref={revealRef} className="section-reveal">
              <CustomisationSteps />
            </div>
            <BrandEthos />
            <Craftsmanship />
            <FounderStoryTeaser />
          </div>
        </div>

        <Testimonials />
        <CampaignFilm />
        <Footer />
      </div>
    </>
  );
};

export default Index;
