import { useEffect, useRef, useState } from "react";
import personalisedImg from "@/assets/about-personalised.jpg";
import floralPatternBg from "@/assets/floral-pattern-bg.webp";

const AboutPersonalised = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="about-personalised"
      className="relative w-full overflow-hidden py-[60px] md:py-[80px] lg:py-[120px]"
      style={{ backgroundColor: "hsl(0 0% 100%)" }}
    >
      {/* Subtle floral motif */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${floralPatternBg})`,
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          opacity: 0.04,
        }}
      />
      <div
        ref={ref}
        className="relative z-10 max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20"
      >
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          {/* Left — Text */}
          <div
            className={`lg:w-[50%] text-center lg:text-left transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <p
              className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
              style={{ color: "hsl(160 15% 45%)" }}
            >
              PERSONALISED
            </p>
            <h2
              className="font-cormorant text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-tight mb-5"
              style={{ color: "hsl(0 0% 15%)" }}
            >
              Designed Around{" "}
              <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
                You
              </span>
            </h2>
            <p
              className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[460px] mx-auto lg:mx-0"
              style={{ color: "hsl(0 0% 48%)" }}
            >
              Share a sketch, a Pinterest board, or simply describe your vision — our designers translate your ideas into bespoke garments that are uniquely yours. From fabric selection to final fitting, personalization is at the heart of everything we do.
            </p>
          </div>

          {/* Right — Image */}
          <div
            className={`lg:w-[50%] transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: visible ? "0.15s" : "0s" }}
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{ boxShadow: "0 6px 30px -8px hsla(0,0%,0%,0.12)" }}
            >
              <img
                src={personalisedImg}
                alt="Fashion design sketch of a bridal outfit"
                className="w-full aspect-[4/5] object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPersonalised;
