import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import heroImage from "@/assets/customize-hero.jpg";
import floralPattern from "@/assets/background_image_flora.webp";
import HorizontalProcess from "@/components/HorizontalProcess";
import CustomizationStories from "@/components/CustomizationStories";
import Footer from "@/components/Footer";

const MadeForYou = () => {
  const [mounted, setMounted] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div className="pt-[94px] md:pt-[100px] lg:pt-[116px]">
      {/* ═══════════ SECTION 1 — Hero (fits viewport, animated florals) ═══════════ */}
      <section
        className="relative w-full overflow-hidden"
        style={{
          height: "calc(100vh - 100px)",
          minHeight: "520px",
          maxHeight: "780px",
        }}
      >
        {/* Background image with subtle parallax + slow zoom */}
        <div
          className="absolute inset-0 bg-cover will-change-transform"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundPosition: "center 35%",
            transform: `translate3d(0, ${scrollY * 0.15}px, 0) scale(${
              mounted ? 1.04 : 1.1
            })`,
            transition: "transform 2200ms ease-out",
            filter: "brightness(0.88) contrast(1.05)",
          }}
        />

        {/* Naira-palette gradient overlay (sage → blush → beige) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, hsla(140,14%,40%,0.35) 0%, hsla(20,30%,30%,0.25) 50%, hsla(36,25%,18%,0.45) 100%)",
          }}
        />

        {/* Floating floral pattern layer */}
        <div
          className="absolute inset-0 pointer-events-none mfy-floral-float"
          style={{
            backgroundImage: `url(${floralPattern})`,
            backgroundSize: "520px",
            backgroundRepeat: "repeat",
            opacity: 0.12,
            mixBlendMode: "overlay",
          }}
        />

        {/* Soft vignette for text readability */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 40%, hsla(0,0%,0%,0.35) 100%)",
          }}
        />

        <style>{`
          @keyframes mfyFloralFloat {
            0%,100% { transform: translate3d(0,0,0) scale(1); }
            50% { transform: translate3d(-12px,-18px,0) scale(1.02); }
          }
          .mfy-floral-float { animation: mfyFloralFloat 22s ease-in-out infinite; }
          @keyframes mfyFadeUp {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .mfy-fade-up { opacity: 0; animation: mfyFadeUp 0.9s ease-out forwards; }
        `}</style>

        {/* Content */}
        <div className="relative z-10 h-full flex items-center justify-center px-6 md:px-10 lg:px-20">
          <div className="max-w-[680px] text-center">
            <p
              className="mfy-fade-up text-[11px] md:text-[12px] font-medium uppercase tracking-[0.22em] mb-4"
              style={{ color: "hsl(30 30% 86%)", animationDelay: "0.1s" }}
            >
              CUSTOMIZE
            </p>
            <h1
              className="mfy-fade-up font-cormorant text-[32px] md:text-[46px] lg:text-[58px] font-medium leading-[1.12] mb-5"
              style={{ color: "hsl(0 0% 98%)", animationDelay: "0.25s" }}
            >
              Design Your Dream
              <br />
              Outfit With{" "}
              <span className="italic" style={{ color: "hsl(16 55% 78%)" }}>
                Naira
              </span>
            </h1>
            <p
              className="mfy-fade-up font-cormorant text-[14px] md:text-[16px] lg:text-[17px] leading-relaxed max-w-[480px] mx-auto mb-7"
              style={{ color: "hsl(0 0% 88%)", animationDelay: "0.4s" }}
            >
              Over 2,500+ custom pieces handcrafted for brides, celebrations,
              and once-in-a-lifetime moments.
            </p>
            <div
              className="mfy-fade-up flex flex-col sm:flex-row items-center justify-center gap-3"
              style={{ animationDelay: "0.55s" }}
            >
              <a
                href="https://wa.me/919561557935"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{
                  backgroundColor: "hsl(0 0% 100%)",
                  color: "hsl(0 0% 15%)",
                  boxShadow: "0 4px 20px -4px hsla(0,0%,0%,0.3)",
                }}
              >
                Get Customized Design
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ SECTION 2 — Horizontal scrollable process ═══════════ */}
      <HorizontalProcess />

      {/* ═══════════ SECTION 3 — Real Custom Stories (social proof) ═══════════ */}
      <CustomizationStories />

      {/* ═══════════ SECTION 4 — Final CTA (strong conversion) ═══════════ */}
      <section
        className="relative w-full overflow-hidden py-20 md:py-24 lg:py-28"
        style={{ backgroundColor: "hsl(30 25% 95%)" }}
      >
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: `url(${floralPattern})`,
            backgroundSize: "560px",
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
            opacity: 0.45,
          }}
        />
        {/* Soft gradient wash */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, hsla(30,30%,95%,0.4) 0%, hsla(20,35%,92%,0.6) 100%)",
          }}
        />

        <div className="relative z-10 max-w-[760px] mx-auto px-6 md:px-10 text-center">
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.18em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            GET STARTED
          </p>
          <h2
            className="font-cormorant text-[30px] md:text-[42px] lg:text-[52px] font-medium leading-tight mb-4"
            style={{ color: "hsl(0 0% 10%)" }}
          >
            Start Your Custom{" "}
            <span className="italic" style={{ color: "hsl(16 45% 58%)" }}>
              Journey
            </span>
          </h2>
          <p
            className="font-cormorant text-[15px] md:text-[17px] leading-[1.8] max-w-[520px] mx-auto mb-8"
            style={{ color: "hsl(0 0% 24%)" }}
          >
            Ready to bring your dream outfit to life? Chat with our design team
            and let's create something beautiful together — no commitment, just
            conversation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://wa.me/919561557935"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-12 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: "hsl(143 14% 53%)",
                color: "hsl(0 0% 100%)",
                boxShadow: "0 6px 22px -8px hsla(143,14%,40%,0.5)",
              }}
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
            <Link
              to="/faqs"
              className="inline-flex items-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-4 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                backgroundColor: "transparent",
                color: "hsl(0 0% 18%)",
                border: "1px solid hsl(0 0% 30%)",
              }}
            >
              View FAQs
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default MadeForYou;
