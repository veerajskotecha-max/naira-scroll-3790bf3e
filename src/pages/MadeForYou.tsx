import { Link } from "react-router-dom";
import heroImage from "@/assets/customize-hero.jpg";
import floralPattern from "@/assets/background_image_flora.webp";
import ScrollSteps from "@/components/ScrollSteps";
import CustomizationStories from "@/components/CustomizationStories";
import Footer from "@/components/Footer";

const MadeForYou = () => {

  return (
    <div className="pt-[98px] md:pt-[108px] lg:pt-[120px]">
      {/* ═══════════ SECTION 1 — Hero Banner (floral bg) ═══════════ */}
      <section
        className="customize-hero-viewport relative w-full overflow-hidden flex items-center justify-center"
        style={{
          height: "calc(100dvh - 98px)",
          minHeight: "calc(100dvh - 98px)",
        }}
      >
        <style>{`
          @media (min-width: 768px) {
            .customize-hero-viewport { height: calc(100dvh - 108px) !important; min-height: calc(100dvh - 108px) !important; }
          }
          @media (min-width: 1024px) {
            .customize-hero-viewport { height: calc(100dvh - 120px) !important; min-height: calc(100dvh - 120px) !important; }
          }
          @media (max-width: 767px) {
            .mfy-hero-bg { background-position: center 60% !important; }
          }
        `}</style>
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

        <div className="relative z-10 flex h-full w-full items-center justify-center px-6 md:px-10 lg:px-20">
          <div
            className="max-w-[680px] text-center px-6 py-8 md:px-12 md:py-12 lg:px-16 lg:py-14"
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
            opacity: 0.5,
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
            style={{ color: "hsl(0 0% 10%)" }}
          >
            Start Your Custom{" "}
            <span className="italic" style={{ color: "hsl(16 45% 58%)" }}>
              Journey
            </span>
          </h2>
          <p
            className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[480px] mx-auto mb-6"
            style={{ color: "hsl(0 0% 22%)" }}
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

      {/* Section 5 — FAQ CTA */}
      <section
        className="w-full py-16 md:py-20 lg:py-24"
        style={{ backgroundColor: "hsl(30 25% 96%)" }}
      >
        <div className="max-w-[600px] mx-auto px-6 text-center">
          <h2
            className="font-cormorant text-[26px] md:text-[34px] lg:text-[42px] font-medium leading-tight mb-4"
            style={{ color: "hsl(0 0% 12%)" }}
          >
            Have Questions?
          </h2>
          <p
            className="font-cormorant text-[14px] md:text-[16px] leading-relaxed mb-8"
            style={{ color: "hsl(0 0% 40%)" }}
          >
            Find answers about customization, shipping, returns, and more in our comprehensive FAQ section.
          </p>
          <Link
            to="/faqs"
            className="inline-flex items-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            style={{
              backgroundColor: "hsl(0 0% 12%)",
              color: "hsl(0 0% 100%)",
            }}
          >
            View FAQs
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MadeForYou;
