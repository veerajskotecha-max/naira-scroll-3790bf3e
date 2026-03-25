import { Link } from "react-router-dom";
import heroImage from "@/assets/customize-hero.jpg";
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

      {/* ═══════════ SECTION 2 — Process Steps (clean, no pattern) ═══════════ */}
      <section
        className="relative w-full overflow-hidden py-[60px] md:py-[80px] lg:py-[120px]"
        style={{ backgroundColor: "hsl(30 20% 95%)" }}
      >
        <div className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
          <div className="text-center mb-12 md:mb-16">
            <p
              className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
              style={{ color: "hsl(160 15% 45%)" }}
            >
              HOW IT WORKS
            </p>
            <h2
              className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight"
              style={{ color: "hsl(0 0% 18%)" }}
            >
              Your Journey to Custom{" "}
              <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
                Perfection
              </span>
            </h2>
            <div className="flex items-center justify-center gap-3 mt-5">
              <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
              <div className="w-2 h-2" style={{ backgroundColor: "hsl(160 15% 55%)" }} />
              <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
            </div>
          </div>

          <div
            ref={stepsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
          >
            {steps.map((step, i) => (
              <div
                key={i}
                data-step-card
                className="flex flex-col items-center text-center px-6 py-9 transition-all ease-out"
                style={{
                  backgroundColor: "hsl(30 25% 96%)",
                  boxShadow: "0 2px 14px -4px hsla(0,0%,0%,0.07)",
                  border: "1px solid hsl(30 15% 90%)",
                  opacity: visibleCards[i] ? 1 : 0,
                  transform: visibleCards[i] ? "translateY(0)" : "translateY(24px)",
                  transitionDuration: "0.6s",
                  transitionDelay: visibleCards[i] ? `${i * 0.12}s` : "0s",
                }}
              >
                <div
                  className="w-11 h-11 flex items-center justify-center mb-4"
                  style={{ borderRadius: '50%', backgroundColor: "hsl(160 12% 91%)" }}
                >
                  <step.icon size={18} style={{ color: "hsl(160 15% 42%)" }} />
                </div>
                <span
                  className="font-cormorant text-[12px] font-semibold tracking-[0.1em] mb-1"
                  style={{ color: "hsl(160 15% 55%)" }}
                >
                  STEP {step.number}
                </span>
                <h3
                  className="font-cormorant text-[18px] md:text-[19px] font-semibold mb-2"
                  style={{ color: "hsl(0 0% 18%)" }}
                >
                  {step.title}
                </h3>
                <p
                  className="font-cormorant text-[13px] md:text-[14px] leading-relaxed max-w-[260px]"
                  style={{ color: "hsl(0 0% 48%)" }}
                >
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* CTA below steps */}
          <div className="text-center mt-14 md:mt-20">
            <h3
              className="font-cormorant text-[24px] md:text-[30px] lg:text-[38px] font-medium leading-tight mb-3"
              style={{ color: "hsl(0 0% 18%)" }}
            >
              Start Your Custom Journey
            </h3>
            <p
              className="font-cormorant text-[14px] md:text-[16px] leading-relaxed max-w-[440px] mx-auto mb-8"
              style={{ color: "hsl(0 0% 48%)" }}
            >
              Share your idea with us or explore our ready-to-wear collection.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="https://wa.me/919876543210?text=Hi%2C%20I%20want%20to%20create%20a%20custom%20outfit"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: "hsl(143 14% 50%)",
                  color: "hsl(0 0% 100%)",
                  boxShadow: "0 4px 16px -4px hsla(143,14%,50%,0.35)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "hsl(143 14% 42%)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "hsl(143 14% 50%)")}
              >
                Chat on WhatsApp
              </a>
              <Link
                to="/shop"
                className="w-full sm:w-auto inline-flex items-center justify-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  border: "1.5px solid hsl(0 0% 30%)",
                  color: "hsl(0 0% 22%)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "hsl(0 0% 18%)";
                  e.currentTarget.style.color = "hsl(0 0% 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "hsl(0 0% 22%)";
                }}
              >
                Explore Collection
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Customer Stories (floral bg, handled inside component) */}
      <CustomizationStories />

      {/* Section 4 — FAQ (plain bg, handled inside component) */}
      <CustomFAQ />

      <Footer />
    </div>
  );
};

export default MadeForYou;
