import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/about-crafting.webp";
import heroBg from "@/assets/about-hero-bg.webp";

const AboutHero = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      className="about-hero-viewport relative w-full overflow-hidden flex items-center justify-center"
      style={{
        height: "calc(100dvh - 98px)",
        minHeight: "calc(100dvh - 98px)",
      }}
    >
      <style>{`
        @media (min-width: 768px) {
          .about-hero-viewport { height: calc(100dvh - 108px) !important; min-height: calc(100dvh - 108px) !important; }
        }
        @media (min-width: 1024px) {
          .about-hero-viewport { height: calc(100dvh - 120px) !important; min-height: calc(100dvh - 120px) !important; }
        }
      `}</style>
      {/* Background image */}
      <div
        className="absolute inset-0 pointer-events-none bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroBg})`,
        }}
      />

      <div
        ref={ref}
        className="relative z-10 w-full max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20 flex items-center justify-center"
      >
        <div className="flex w-full flex-col lg:flex-row items-center justify-center gap-6 md:gap-8 lg:gap-16">
          {/* Left — Text */}
          <div className="lg:w-[50%] text-center lg:text-left">
            <p
              className={`text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em] mb-4 transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ color: "hsl(160 15% 45%)" }}
            >
              ABOUT NAIRA
            </p>

            <h1
              className={`font-cormorant text-[30px] md:text-[40px] lg:text-[52px] font-medium leading-[1.15] mb-6 transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{
                color: "hsl(0 0% 15%)",
                transitionDelay: visible ? "0.1s" : "0s",
              }}
            >
              Where Tradition Meets{" "}
              <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
                Modern Elegance
              </span>
            </h1>

            <p
              className={`font-cormorant text-[15px] md:text-[16px] lg:text-[17px] leading-[1.65] md:leading-[1.8] max-w-[480px] mx-auto lg:mx-0 mb-6 md:mb-8 transition-all duration-700 ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{
                color: "hsl(0 0% 45%)",
                transitionDelay: visible ? "0.2s" : "0s",
              }}
            >
              Naira is a couture label built on heritage craft and personal stories. Every outfit we create is a conversation between artisan hands and your unique story — from bridal dreams to celebration-ready silhouettes.
            </p>

            <Link
              to="/shop"
              className={`inline-flex items-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-10 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{
                backgroundColor: "hsl(143 14% 63%)",
                color: "hsl(0 0% 100%)",
                transitionDelay: visible ? "0.3s" : "0s",
              }}
            >
              Explore the Craft
            </Link>
          </div>

          {/* Right — Image */}
          <div
            className={`lg:w-[50%] transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: visible ? "0.2s" : "0s" }}
          >
            <div
              className="rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 8px 40px -8px hsla(0,0%,0%,0.15)" }}
            >
              <img
                src={heroImage}
                alt="Naira atelier — artisan working on embroidered fabric"
                className="w-full max-h-[24dvh] md:max-h-[32dvh] lg:max-h-[62dvh] aspect-[4/3] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHero;
