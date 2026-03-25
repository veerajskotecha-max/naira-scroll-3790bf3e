import HeroSection from "@/components/HeroSection";
import TrustStrip from "@/components/TrustStrip";
import NewArrivals from "@/components/NewArrivals";
import CampaignFilm from "@/components/CampaignFilm";
import MostLoved from "@/components/MostLoved";
import Craftsmanship from "@/components/Craftsmanship";
import CoutureExperience from "@/components/CoutureExperience";
import Testimonials from "@/components/Testimonials";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      <HeroSection />
      <TrustStrip />
      <NewArrivals />
      <CampaignFilm />
      <MostLoved />
      <Craftsmanship />
      <CoutureExperience />
      <Testimonials />
      <Footer />
    </div>
  );
};

export default Index;
