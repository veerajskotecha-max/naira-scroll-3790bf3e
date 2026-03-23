import { useEffect, useRef, useState } from "react";
import craftingImg from "@/assets/about-crafting.webp";

const AboutHandcrafted = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
      },
      { threshold: 0.15 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="about-handcrafted"
      className="relative w-full overflow-hidden py-[60px] md:py-[80px] lg:py-[120px]"
      style={{ backgroundColor: "hsl(30 25% 96%)" }}
    >
      <div
        ref={ref}
        className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20"
      >
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-20">
          {/* Left — Image */}
          <div
            className={`w-full lg:w-[55%] transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
          >
            <div
              className="rounded-xl overflow-hidden"
              style={{
                boxShadow: "0 8px 36px -8px hsla(0,0%,0%,0.15)",
              }}
            >
              <img
                src={craftingImg}
                alt="Artisan hand-embroidering fabric"
                className="w-full aspect-[4/5] object-cover object-center"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right — Text */}
          <div
            className={`w-full lg:w-[45%] text-center lg:text-left transition-all duration-700 ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDelay: visible ? "0.15s" : "0s" }}
          >
            <p
              className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
              style={{ color: "hsl(160 15% 45%)" }}
            >
              HANDCRAFTED
            </p>
            <h2
              className="font-cormorant text-[28px] md:text-[36px] lg:text-[44px] font-medium leading-tight mb-5"
              style={{ color: "hsl(0 0% 15%)" }}
            >
              Made by{" "}
              <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
                Artisan Hands
              </span>
            </h2>
            <p
              className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[440px] mx-auto lg:mx-0"
              style={{ color: "hsl(0 0% 48%)" }}
            >
              Each garment passes through the hands of skilled artisans who
              practise embroidery techniques passed down through generations.
              From zardosi to delicate thread work, every stitch is placed with
              intention — transforming fabric into heirloom-worthy art.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutHandcrafted;
