import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import heroModel1 from "@/assets/hero-model.png";
import heroModel2 from "@/assets/hero-model-2.png";
import heroModel3 from "@/assets/hero-model-3.png";
import featured1 from "@/assets/featured-1.jpg";
import featured2 from "@/assets/featured-2.jpg";
import featured3 from "@/assets/featured-3.jpg";
import featured4 from "@/assets/featured-4.jpg";
import featured5 from "@/assets/featured-5.jpg";
import featured6 from "@/assets/featured-6.jpg";

const slides = [
  { hero: heroModel1, thumbs: [featured1, featured2] },
  { hero: heroModel2, thumbs: [featured3, featured4] },
  { hero: heroModel3, thumbs: [featured5, featured6] },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger entrance animations
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  // Auto-rotate every 4.5s
  useEffect(() => {
    const interval = setInterval(next, 4500);
    return () => clearInterval(interval);
  }, [next]);

  const slide = slides[current];

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: "#E5B9A4",
        minHeight: "min(890px, 90vh)",
      }}
    >
      {/* Background watermark NAIRA text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span
          className="font-cormorant font-semibold uppercase"
          style={{
            fontSize: "clamp(140px, 20vw, 380px)",
            color: "#8B5E3C",
            opacity: 0.06,
            letterSpacing: "0.05em",
          }}
        >
          NAIRA
        </span>
      </div>

      {/* Main content grid */}
      <div
        className="relative z-10 max-w-[1440px] mx-auto flex flex-col lg:flex-row items-center lg:items-end px-6 md:px-10 lg:px-14 xl:px-16"
        style={{ minHeight: "min(890px, 90vh)" }}
      >
        {/* LEFT — Text content block */}
        <div
          className={`flex flex-col justify-center lg:justify-end pb-10 md:pb-14 lg:pb-24 flex-1 z-20 order-2 lg:order-1 max-w-[420px] lg:max-w-[440px] text-center lg:text-left transition-all duration-700 ease-out ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <h1
            className="font-cormorant text-[34px] md:text-[48px] lg:text-[58px] xl:text-[62px] font-medium leading-[1.12] mb-5 md:mb-6"
            style={{ color: "#3D2B1F" }}
          >
            Where
            <br />
            Tradition
            <br />
            Meets
            <br />
            <em className="italic font-normal">Contemporary</em>
            <br />
            style
          </h1>

          <p
            className="font-cormorant text-[14px] md:text-[16px] lg:text-[17px] leading-[1.6] mb-8 md:mb-10"
            style={{ color: "rgba(61, 43, 31, 0.7)" }}
          >
            Discover the finest Indo-Western fusion wear,
            <br className="hidden md:block" />
            crafted for the modern woman.
          </p>

          <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
            <Link
              to="/shop"
              className="font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.14em] px-7 md:px-8 py-3.5 md:py-[14px] rounded-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: "#4A2F22",
                color: "#FFFFFF",
              }}
            >
              SHOP COLLECTION
            </Link>
          </div>
        </div>

        {/* CENTER — Primary model image */}
        <div
          className={`flex-shrink-0 z-10 order-1 lg:order-2 flex items-end justify-center self-end relative transition-all duration-800 ease-out ${
            mounted ? "opacity-100" : "opacity-0"
          }`}
          style={{ transitionDuration: "0.8s" }}
        >
          {/* Model images — stacked with fade */}
          <div className="relative">
            {slides.map((s, i) => (
              <img
                key={i}
                src={s.hero}
                alt={`NAIRA fashion model ${i + 1}`}
                className={`${
                  i === 0 ? "relative" : "absolute inset-0"
                } h-[360px] md:h-[500px] lg:h-[650px] xl:h-[750px] w-auto object-contain object-bottom transition-opacity duration-500 ease-in-out`}
                style={{
                  opacity: current === i ? 1 : 0,
                  filter: "drop-shadow(0 8px 30px rgba(74,47,34,0.12))",
                }}
                loading={i === 0 ? "eager" : "lazy"}
              />
            ))}
          </div>
        </div>

        {/* RIGHT BOTTOM — Featured collection previews (desktop) */}
        <div
          className={`hidden lg:flex flex-col items-end justify-end pb-20 xl:pb-24 flex-1 z-20 order-3 transition-all duration-700 ease-out ${
            mounted
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDelay: "0.3s" }}
        >
          <div className="flex items-center gap-2 mb-4">
            <span
              className="w-[5px] h-[5px] rounded-full"
              style={{ backgroundColor: "#4A2F22" }}
            />
            <span
              className="font-cormorant text-[11px] xl:text-[12px] font-medium uppercase tracking-[0.18em]"
              style={{ color: "#4A2F22" }}
            >
              FEATURED COLLECTION
            </span>
          </div>

          {/* Rotating thumbnails */}
          <div className="flex gap-3">
            {[0, 1].map((thumbIdx) => (
              <div
                key={thumbIdx}
                className="w-[90px] h-[120px] xl:w-[100px] xl:h-[135px] rounded-full overflow-hidden relative"
                style={{
                  border: "1px solid rgba(74,47,34,0.12)",
                }}
              >
                {slides.map((s, slideIdx) => (
                  <img
                    key={slideIdx}
                    src={s.thumbs[thumbIdx]}
                    alt={`Featured item ${slideIdx * 2 + thumbIdx + 1}`}
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                    style={{ opacity: current === slideIdx ? 1 : 0 }}
                    loading="lazy"
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Slide indicators */}
          <div className="flex gap-1.5 mt-4">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor:
                    current === i
                      ? "#4A2F22"
                      : "rgba(74,47,34,0.25)",
                  transform: current === i ? "scale(1.3)" : "scale(1)",
                }}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE — Featured collection below model */}
      <div
        className="lg:hidden flex flex-col items-center pb-10 px-6 relative z-10"
      >
        <div className="flex items-center gap-2 mb-4">
          <span
            className="w-[5px] h-[5px] rounded-full"
            style={{ backgroundColor: "#4A2F22" }}
          />
          <span
            className="font-cormorant text-[11px] font-medium uppercase tracking-[0.18em]"
            style={{ color: "#4A2F22" }}
          >
            FEATURED COLLECTION
          </span>
        </div>
        <div className="flex gap-3">
          {[0, 1].map((thumbIdx) => (
            <div
              key={thumbIdx}
              className="w-[80px] h-[105px] md:w-[90px] md:h-[120px] rounded-full overflow-hidden relative"
              style={{
                border: "1px solid rgba(74,47,34,0.12)",
              }}
            >
              {slides.map((s, slideIdx) => (
                <img
                  key={slideIdx}
                  src={s.thumbs[thumbIdx]}
                  alt={`Featured item ${slideIdx * 2 + thumbIdx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out"
                  style={{ opacity: current === slideIdx ? 1 : 0 }}
                  loading="lazy"
                />
              ))}
            </div>
          ))}
        </div>
        {/* Mobile slide indicators */}
        <div className="flex gap-1.5 mt-4">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
              style={{
                backgroundColor:
                  current === i ? "#4A2F22" : "rgba(74,47,34,0.25)",
                transform: current === i ? "scale(1.3)" : "scale(1)",
              }}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
