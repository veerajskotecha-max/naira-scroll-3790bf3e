import { useEffect, useRef, useState } from "react";
import floralPatternBg from "@/assets/floral-pattern-bg.webp";
import { Sparkles, Palette, Gift, Search, MessageSquare, Scissors, Package } from "lucide-react";
import { Link } from "react-router-dom";


const steps = [
  {
    icon: Sparkles,
    number: "01",
    title: "Share Your Vision",
    description:
      "Tell us about your occasion, your colors, your dreams. Every detail matters.",
  },
  {
    icon: Palette,
    number: "02",
    title: "Artisan Collaboration",
    description:
      "Our designers sketch your piece. Our artisans bring it to life, stitch by stitch.",
  },
  {
    icon: Gift,
    number: "03",
    title: "Unveiled, Just for You",
    description:
      "Your one-of-a-kind piece arrives — crafted, wrapped, and ready for your moment.",
  },
];

const featureCards = [
  {
    icon: Search,
    title: "Explore Styles",
    description: "Browse our collections and pick what you love.",
  },
  {
    icon: MessageSquare,
    title: "Share Your Preferences",
    description: "Tell us your measurements and ideas.",
  },
  {
    icon: Scissors,
    title: "We Craft Your Piece",
    description: "Our artisans design your custom outfit.",
  },
  {
    icon: Package,
    title: "Delivered to You",
    description: "Receive something made just for you.",
  },
];

const CoutureExperience = () => {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [topVisible, setTopVisible] = useState(false);
  const [bottomVisible, setBottomVisible] = useState(false);

  useEffect(() => {
    const obs1 = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setTopVisible(true); obs1.disconnect(); } },
      { threshold: 0.1 }
    );
    const obs2 = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setBottomVisible(true); obs2.disconnect(); } },
      { threshold: 0.1 }
    );
    if (topRef.current) obs1.observe(topRef.current);
    if (bottomRef.current) obs2.observe(bottomRef.current);
    return () => { obs1.disconnect(); obs2.disconnect(); };
  }, []);

  return (
    <>
      {/* Top Section – Couture Process */}
      <section
        className="w-full py-[70px] md:py-[90px] lg:py-[120px]"
        style={{ backgroundColor: "hsl(20 40% 93%)" }}
      >
        <div ref={topRef} className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
          {/* Label */}
          <div
            className={`text-center transition-all ease-out ${
              topVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDuration: "0.6s" }}
          >
            <p
              className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
              style={{ color: "hsl(16 30% 55%)" }}
            >
              MADE FOR YOU
            </p>
            <h2
              className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight"
              style={{ color: "hsl(0 0% 18%)" }}
            >
              Your Personal Couture Experience
            </h2>

            {/* Decorative divider */}
            <div className="flex items-center justify-center gap-3 mt-5 mb-12 md:mb-16">
              <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(16 30% 70%)" }} />
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: "hsl(16 40% 68%)" }}
              />
              <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(16 30% 70%)" }} />
            </div>
          </div>

          {/* Steps */}
          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 lg:gap-12 max-w-[960px] mx-auto">
            {/* Dotted connector line (desktop only) */}
            <div
              className="hidden md:block absolute top-[48px] left-[20%] right-[20%] h-px z-0"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(to right, hsl(16 30% 72%), hsl(16 30% 72%) 6px, transparent 6px, transparent 14px)",
              }}
            />

            {steps.map((step, i) => (
              <div
                key={i}
                className={`relative z-10 flex flex-col items-center text-center transition-all ease-out ${
                  topVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDuration: "0.6s",
                  transitionDelay: topVisible ? `${i * 0.15 + 0.2}s` : "0s",
                }}
              >
                {/* Icon circle */}
                <div
                  className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] flex items-center justify-center mb-4"
                  style={{
                    borderRadius: '50%',
                    backgroundColor: "hsl(0 0% 98%)",
                    boxShadow: "0 2px 12px -4px hsla(0,0%,0%,0.06)",
                  }}
                >
                  <step.icon size={22} style={{ color: "hsl(16 40% 62%)" }} />
                </div>
                <span
                  className="font-cormorant text-[13px] font-semibold tracking-[0.08em] mb-1.5"
                  style={{ color: "hsl(16 40% 62%)" }}
                >
                  {step.number}
                </span>
                <h3
                  className="font-cormorant text-[18px] md:text-[20px] font-semibold mb-2"
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

          {/* CTA */}
          <div
            className={`flex justify-center mt-12 md:mt-16 transition-all ease-out ${
              topVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{
              transitionDuration: "0.6s",
              transitionDelay: topVisible ? "0.7s" : "0s",
            }}
          >
            <Link
              to="/made-for-you"
              className="inline-flex items-center font-cormorant text-[14px] font-medium uppercase tracking-[0.08em] px-10 py-3.5 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: "hsl(20 18% 28%)",
                color: "hsl(0 0% 100%)",
                boxShadow: "0 4px 16px -4px hsla(20,18%,28%,0.35)",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "hsl(20 18% 22%)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "hsl(20 18% 28%)")
              }
            >
              BEGIN YOUR JOURNEY
            </Link>
          </div>
        </div>

      </section>

      {/* Bottom Section – Customisation Steps */}
      <section
        className="relative w-full overflow-hidden pb-[70px] md:pb-[90px] lg:pb-[120px] pt-6 md:pt-10"
        style={{ backgroundColor: "hsl(30 20% 92%)" }}
      >
        {/* Full background pattern */}
        <div
          className="absolute inset-0 pointer-events-none select-none"
          style={{
            backgroundImage: `url(${floralPatternBg})`,
            backgroundSize: "600px",
            backgroundPosition: "center",
            backgroundRepeat: "repeat",
            opacity: 0.09,
          }}
        />

        <div ref={bottomRef} className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
          {/* Heading */}
          <div
            className={`text-center mb-10 md:mb-14 transition-all ease-out ${
              bottomVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
            style={{ transitionDuration: "0.6s" }}
          >
            <p
              className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
              style={{ color: "hsl(16 30% 55%)" }}
            >
              STEPS TO EASY CUSTOMISATION
            </p>
            <h2
              className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight"
              style={{ color: "hsl(0 0% 18%)" }}
            >
              Tailoring Products to Suit
              <br />
              <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
                Your Preferences
              </span>
            </h2>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {featureCards.map((card, i) => (
              <div
                key={i}
                className={`flex flex-col items-center text-center rounded-xl px-6 py-8 transition-all ease-out cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                  bottomVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
                }`}
                style={{
                  backgroundColor: "hsl(0 0% 100%)",
                  boxShadow: "0 2px 12px -4px hsla(0,0%,0%,0.08)",
                  transitionDuration: "0.5s",
                  transitionDelay: bottomVisible ? `${i * 0.12 + 0.15}s` : "0s",
                }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                  style={{ backgroundColor: "hsl(20 40% 93%)" }}
                >
                  <card.icon size={22} style={{ color: "hsl(16 40% 55%)" }} />
                </div>
                <h3
                  className="font-cormorant text-[17px] md:text-[18px] font-semibold mb-2"
                  style={{ color: "hsl(0 0% 18%)" }}
                >
                  {card.title}
                </h3>
                <p
                  className="font-cormorant text-[13px] md:text-[14px] leading-relaxed"
                  style={{ color: "hsl(0 0% 48%)" }}
                >
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default CoutureExperience;
