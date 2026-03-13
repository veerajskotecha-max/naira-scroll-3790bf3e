import { useEffect, useRef, useState } from "react";
import philosophyBg from "@/assets/philosophy-bg.webp";

const NairaPhilosophy = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-[80px] md:py-[120px] overflow-hidden"
      style={{ backgroundColor: "hsl(30 30% 97%)" }}
    >
      {/* Background texture */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${philosophyBg})`,
          opacity: 0.08,
        }}
      />
      {/* Light overlay for readability */}
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "hsl(30 30% 97% / 0.6)" }}
      />

      <div className="relative z-10 max-w-[1100px] mx-auto px-4">
        {/* Section label */}
        <div
          className="text-center mb-14 md:mb-20 transition-all duration-700"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <p
            className="text-[11px] uppercase tracking-[0.2em] font-medium mb-4"
            style={{ color: "hsl(186 35% 28%)" }}
          >
            The Naira Philosophy
          </p>
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-[1px]" style={{ backgroundColor: "hsl(36 50% 70%)" }} />
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(36 50% 65%)" }} />
            <div className="w-12 h-[1px]" style={{ backgroundColor: "hsl(36 50% 70%)" }} />
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16 lg:gap-20">
          {/* Left — Logo */}
          <div
            className="md:w-[38%] flex items-center justify-center transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "0.15s",
            }}
          >
            <h2
              className="font-cormorant font-bold text-center md:text-left select-none"
              style={{
                fontSize: "clamp(64px, 8vw, 110px)",
                color: "hsl(0 0% 10%)",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              NAIRA
            </h2>
          </div>

          {/* Right — Content */}
          <div
            className="md:w-[62%] text-center md:text-left transition-all duration-700"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(20px)",
              transitionDelay: "0.3s",
            }}
          >
            <h3
              className="font-cormorant text-[24px] md:text-[30px] lg:text-[34px] font-semibold leading-[1.4] mb-6"
              style={{ color: "hsl(0 0% 15%)" }}
            >
              Every piece begins with a{" "}
              <em style={{ color: "hsl(20 60% 70%)", fontStyle: "italic" }}>conversation</em> —
              <br className="hidden md:block" />
              your memories, your milestones, your moment.
            </h3>

            <p
              className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[520px] mx-auto md:mx-0"
              style={{ color: "hsl(0 0% 45%)" }}
            >
              At Naira, we believe that true luxury lies not in logos, but in the love woven into every stitch.
              Our artisans bring centuries-old embroidery traditions to life, creating garments that honor your heritage
              while celebrating your individuality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NairaPhilosophy;
