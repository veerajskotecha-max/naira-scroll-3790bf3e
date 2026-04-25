import AboutHero from "@/components/about/AboutHero";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutEthos from "@/components/about/AboutEthos";
import AboutPersonalised from "@/components/about/AboutPersonalised";
import AboutHandcrafted from "@/components/about/AboutHandcrafted";
import AboutFloral from "@/components/about/AboutFloral";
import AboutCTA from "@/components/about/AboutCTA";
import Footer from "@/components/Footer";

const AboutUs = () => (
  <div className="pt-[98px] md:pt-[108px] lg:pt-[120px]">
    <AboutHero />
    <AboutTimeline />
    <AboutEthos />
    <AboutPersonalised />
    <AboutHandcrafted />
    <AboutFloral />
    <AboutCTA />
    <Footer />
  </div>
);

export default AboutUs;
