import { Link } from "react-router-dom";
import heroImage from "@/assets/customize-hero.jpg";
import floralPattern from "@/assets/background_image_flora.webp";
import ScrollSteps from "@/components/ScrollSteps";
import CustomizationStories from "@/components/CustomizationStories";
import CustomFAQ from "@/components/CustomFAQ";
import Footer from "@/components/Footer";

const MadeForYou = () => {

  return (
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      {/* ═══════════ SECTION 1 — Hero Banner (floral bg) ═══════════ */}
      <section className="relative w-full overflow-hidden">
        <div
          className="mfy-hero-bg absolute inset-0 bg-cover"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: "center 70%",
            filter: "brightness(0.9) contrast(1.05)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to bottom, hsla(0,0%,0%,0.25), hsla(0,0%,0%,0.3))",
          }}
        />

        <div className="relative z-10 flex items-start justify-center min-h-[70vh] md:min-h-[80vh] lg:min-h-[88vh] px-6 md:px-10 lg:px-20 pt-24 pb-20 md:pt-32 md:pb-28 lg:pt-36 lg:pb-36">
          {/* Responsive bg-position via inline style media query alternative */}
          <style>{`
            @media (max-width: 767px) {
              .mfy-hero-bg { background-position: center 60% !important; }
            }
          `}</style>
          <div
            className="max-w-[680px] text-center px-8 py-12 md:px-14 md:py-16 lg:px-20 lg:py-20"
            style={{
              backgroundColor: "hsla(0,0%,100%,0.08)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              border: "1px solid hsla(0,0%,100%,0.12)",
            }}
          >
            <p
              className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em] mb-4"
              style={{ color: "hsl(30 30% 82%)" }}
            >
              CUSTOMIZE
            </p>
            <h1
              className="font-cormorant text-[30px] md:text-[42px] lg:text-[54px] font-medium leading-[1.15] mb-5"
              style={{ color: "hsl(0 0% 98%)" }}
            >
              Design Your Dream
              <br />
              Outfit With{" "}
              <span className="italic" style={{ color: "hsl(16 50% 76%)" }}>
                Naira
              </span>
            </h1>
            <p
              className="font-cormorant text-[14px] md:text-[16px] lg:text-[17px] leading-relaxed max-w-[480px] mx-auto mb-8"
              style={{ color: "hsl(0 0% 82%)" }}
            >
              Over 2,500+ custom pieces handcrafted for brides, celebrations,
              and once-in-a-lifetime moments.
            </p>
            <Link
              to="/custom"
              className="inline-flex items-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: "hsl(0 0% 100%)",
                color: "hsl(0 0% 15%)",
                boxShadow: "0 4px 20px -4px hsla(0,0%,0%,0.25)",
              }}
            >
              Get Customized Design
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 2 — Scroll-driven Steps ═══════════ */}
      <ScrollSteps />

      {/* ═══════════ SECTION 3 — Start Your Custom Journey ═══════════ */}
      <section
        className="relative w-full overflow-hidden py-[32px] md:py-[44px] lg:py-[60px]"
        style={{ backgroundColor: "hsl(30 25% 96%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: `url(${floralPattern})`,
            backgroundSize: "600px",
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
            opacity: 0.22,
          }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20 text-center">
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-2"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            GET STARTED
          </p>
          <h2
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight mb-3"
            style={{ color: "hsl(0 0% 15%)" }}
          >
            Start Your Custom{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              Journey
            </span>
          </h2>
          <p
            className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[480px] mx-auto mb-6"
            style={{ color: "hsl(0 0% 48%)" }}
          >
            Ready to bring your dream outfit to life? Chat with our design team
            and let's create something beautiful together.
          </p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-12 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor: "hsl(143 14% 63%)",
              color: "hsl(0 0% 100%)",
            }}
          >
            Chat on WhatsApp
          </a>
        </div>
      </section>

      {/* Section 4 — Customer Stories */}
      <CustomizationStories />

      {/* Section 4 — FAQ (plain bg, handled inside component) */}
      <CustomFAQ />

      <Footer />
    </div>
  );
};

export default MadeForYou;
