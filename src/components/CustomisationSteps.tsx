import { useEffect, useRef, useState } from "react";

import { MessageSquare, Palette, SlidersHorizontal, Phone, Package } from "lucide-react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    icon: MessageSquare,
    title: "Share Your Vision",
    description: "Share your dream look with us on WhatsApp.",
  },
  {
    icon: Palette,
    title: "Curated Design Options",
    description: "Receive curated design, colour, and fabric options, handpicked for you.",
  },
  {
    icon: SlidersHorizontal,
    title: "Finalise Your Style",
    description: "Choose your fabric and silhouette, then share your measurements.",
  },
  {
    icon: Phone,
    title: "Personal Consultation",
    description: "A personal consultation call to refine every last detail.",
  },
  {
    icon: Package,
    title: "Delivered to You",
    description: "Your customized outfit, delivered to your doorstep.",
  },
];

const CustomisationSteps = () => {
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
      className="relative w-full overflow-hidden py-[70px] md:py-[90px] lg:py-[120px]"
      style={{ backgroundColor: "hsl(30 25% 96%)" }}
    >



      <div ref={ref} className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Heading */}
        <div
          className={`text-center mb-10 md:mb-14 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
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
            Customize Your Dress
          </h2>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5 md:gap-6">
          {featureCards.map((card, i) => (
            <div
              key={i}
              className={`flex flex-col items-center text-center px-6 py-8 transition-all ease-out cursor-pointer hover:-translate-y-1 hover:shadow-lg ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                backgroundColor: "hsl(0 0% 100%)",
                boxShadow: "0 2px 12px -4px hsla(0,0%,0%,0.08)",
                transitionDuration: "0.5s",
                transitionDelay: visible ? `${i * 0.12 + 0.15}s` : "0s",
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center mb-3"
                style={{ borderRadius: '50%', backgroundColor: "hsl(20 40% 95%)" }}
              >
                <card.icon size={18} style={{ color: "hsl(16 40% 55%)" }} />
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

        {/* CTA */}
        <div
          className={`flex justify-center mt-12 md:mt-16 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{
            transitionDuration: "0.6s",
            transitionDelay: visible ? "0.8s" : "0s",
          }}
        >
          <Link
            to="/customize"
            className="inline-flex items-center font-cormorant text-[14px] font-medium uppercase tracking-[0.08em] px-10 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
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
            BEGIN MY CUSTOM ORDER
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CustomisationSteps;
