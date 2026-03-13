import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
import CampaignFilm from "@/components/CampaignFilm";

const Index = () => {
  return (
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      <HeroSection />
      <NewArrivals />
      <CampaignFilm />
    </div>
  );
};

export default Index;
