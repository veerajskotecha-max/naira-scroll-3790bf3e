import HeroSection from "@/components/HeroSection";
import NewArrivals from "@/components/NewArrivals";
import CampaignFilm from "@/components/CampaignFilm";
import MostLoved from "@/components/MostLoved";

const Index = () => {
  return (
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      <HeroSection />
      <NewArrivals />
      <CampaignFilm />
      <MostLoved />
    </div>
  );
};

export default Index;
