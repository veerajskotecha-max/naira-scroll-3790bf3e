import { useEffect, useRef } from "react";
import HeroScrollyWrapper from "@/components/HeroScrollyWrapper";

import CustomisationSteps from "@/components/CustomisationSteps";
import BrandEthos from "@/components/BrandEthos";
import Craftsmanship from "@/components/Craftsmanship";
import Testimonials from "@/components/Testimonials";
import CampaignFilm from "@/components/CampaignFilm";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import FounderStoryTeaser from "@/components/FounderStoryTeaser";

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
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <PageSEO
        title="Naira Flore — Handcrafted Indo-Western Fashion"
        description="Discover handmade embroidered sarees, lehengas & anarkalis by Naira Flore. Premium Indo-Western fusion wear crafted for the modern woman. Free shipping above ₹2,999."
        canonical="https://nairaflore.com/"
      />
      <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
        <HeroScrollyWrapper />
        
        {/* section-reveal + is-visible toggled by IntersectionObserver above */}
        <div ref={revealRef} className="section-reveal">
          <CustomisationSteps />
        </div>
        <BrandEthos />
        <Craftsmanship />
        <FounderStoryTeaser />
        <Testimonials />
        <CampaignFilm />
        <Footer />
      </div>
    </>
  );
};

export default Index;
