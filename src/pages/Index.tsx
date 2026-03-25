import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import NewArrivals from "@/components/NewArrivals";
import CustomisationSteps from "@/components/CustomisationSteps";
import BrandEthos from "@/components/BrandEthos";
import Craftsmanship from "@/components/Craftsmanship";
import Testimonials from "@/components/Testimonials";
import CampaignFilm from "@/components/CampaignFilm";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      <HeroSection />
      <TrustStrip />
      <NewArrivals />
      <CustomisationSteps />
      <BrandEthos />
      <Craftsmanship />
      <Testimonials />
      <CampaignFilm />
      <Footer />
    </div>
  );
};

export default Index;
