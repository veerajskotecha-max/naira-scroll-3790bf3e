import { useEffect, useRef, useState, type ReactNode } from "react";
import PremiumSilkIcon from "./icons/PremiumSilkIcon";
import EmbroideryIcon from "./icons/EmbroideryIcon";

const steps: { number: string; title: string; icon: ReactNode }[] = [
  {
    number: "01",
    title: "Premium Silk",
    icon: <PremiumSilkIcon size={20} />,
  },
  {
    number: "02",
    title: "Handcrafted Embroidery",
    icon: <EmbroideryIcon size={20} />,
  },
  {
    number: "03",
    title: "Tailored Finish",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="6" cy="6" r="3" />
        <path d="M8.12 8.12L12 12" />
        <path d="M20 4L8.12 15.88" />
        <circle cx="6" cy="18" r="3" />
        <path d="M14.8 14.8L20 20" />
      </svg>
    ),
  },
];

const MaterialsCraft = () => {
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
      className="py-8 md:py-10 transition-all duration-700"
      style={{
        backgroundColor: "hsl(24 60% 95%)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(12px)",
      }}
    >
      <div className="max-w-[800px] mx-auto px-4 text-center">
        <p
          className="text-[10px] uppercase tracking-[0.2em] font-medium mb-2"
          style={{ color: "hsl(186 35% 28%)" }}
        >
          The Naira Craft
        </p>

        <h2
          className="font-cormorant text-[22px] md:text-[26px] font-semibold mb-8"
          style={{ color: "hsl(0 0% 15%)" }}
        >
          Materials That Define the Piece
        </h2>

        <div className="flex flex-row items-start justify-center gap-10 md:gap-16">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex flex-col items-center transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(10px)",
                transitionDelay: `${i * 0.12 + 0.2}s`,
              }}
            >
              <div
                className="w-10 h-10 flex items-center justify-center mb-2"
                style={{
                  borderRadius: '50%',
                  backgroundColor: "hsl(0 0% 100% / 0.7)",
                  color: "hsl(186 35% 28%)",
                }}
              >
                {step.icon}
              </div>

              <span
                className="text-[10px] uppercase tracking-[0.12em] font-medium mb-1"
                style={{ color: "hsl(186 35% 28%)" }}
              >
                {step.number}
              </span>

              <h3
                className="font-cormorant text-[14px] md:text-[15px] font-semibold"
                style={{ color: "hsl(0 0% 20%)" }}
              >
                {step.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MaterialsCraft;
