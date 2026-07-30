import PageSEO from "@/components/PageSEO";
import AboutHero from "@/components/about/AboutHero";
import AboutTimeline from "@/components/about/AboutTimeline";
import AboutEthos from "@/components/about/AboutEthos";
import AboutPersonalised from "@/components/about/AboutPersonalised";
import AboutHandcrafted from "@/components/about/AboutHandcrafted";
import AboutFloral from "@/components/about/AboutFloral";
import AboutCTA from "@/components/about/AboutCTA";
import Footer from "@/components/Footer";

const AboutUs = () => (
  <>
    <PageSEO
      title="About Naira Flore | A Nashik Atelier for Handmade Fashion"
      description="From B2B roots to a made-to-measure label: the story of Naira Flore, the Nashik atelier behind our Indo-Western wear and demi-fine zircone jewellery."
      canonical="https://nairaflore.com/about"
    />
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
  </>
);

export default AboutUs;
