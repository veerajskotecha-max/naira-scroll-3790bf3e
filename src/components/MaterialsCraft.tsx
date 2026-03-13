import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    title: "Premium Silk",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2" />
        <path d="M8 12c0-2.2 1.8-4 4-4" />
        <path d="M16 12c0 2.2-1.8 4-4 4" />
        <line x1="12" y1="2" x2="12" y2="8" />
        <line x1="12" y1="16" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Handcrafted Embroidery",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2l6 6-10 10H4.5v-6l10-10z" />
        <path d="M8 16l-3 3" />
        <path d="M16 8l-2-2" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Tailored Finish",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
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
      className="py-20 md:py-28 transition-all duration-700"
      style={{
        backgroundColor: "hsl(24 60% 95%)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
      }}
    >
      <div className="max-w-[1100px] mx-auto px-4 text-center">
        {/* Label */}
        <p
          className="text-[11px] uppercase tracking-[0.2em] font-medium mb-4"
          style={{ color: "hsl(186 35% 28%)" }}
        >
          The Naira Craft
        </p>

        {/* Decorative divider */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-[1px]" style={{ backgroundColor: "hsl(186 35% 28% / 0.3)" }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: "hsl(186 35% 28%)" }} />
          <div className="w-12 h-[1px]" style={{ backgroundColor: "hsl(186 35% 28% / 0.3)" }} />
        </div>

        {/* Heading */}
        <h2
          className="font-cormorant text-[28px] md:text-[36px] font-semibold mb-16"
          style={{ color: "hsl(0 0% 15%)" }}
        >
          Materials That Define the Piece
        </h2>

        {/* Steps */}
        <div className="relative flex flex-col md:flex-row items-center md:items-start justify-center gap-14 md:gap-8 lg:gap-16">
          {/* Dotted connector line (desktop) */}
          <div
            className="hidden md:block absolute top-[52px] left-1/2 -translate-x-1/2"
            style={{
              width: "60%",
              height: "1px",
              borderTop: "2px dotted hsl(186 35% 28% / 0.25)",
            }}
          />

          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex flex-col items-center relative z-10 transition-all duration-500"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(16px)",
                transitionDelay: `${i * 0.15 + 0.3}s`,
              }}
            >
              {/* Icon badge */}
              <div
                className="w-[104px] h-[104px] rounded-full flex items-center justify-center mb-5 transition-transform duration-300 hover:scale-105"
                style={{
                  backgroundColor: "hsl(0 0% 100%)",
                  boxShadow: "0 4px 20px hsl(0 0% 0% / 0.06)",
                  color: "hsl(186 35% 28%)",
                }}
              >
                {step.icon}
              </div>

              {/* Number */}
              <span
                className="text-[12px] uppercase tracking-[0.15em] font-medium mb-2"
                style={{ color: "hsl(186 35% 28%)" }}
              >
                {step.number}
              </span>

              {/* Title */}
              <h3
                className="font-cormorant text-[17px] md:text-[18px] font-semibold"
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
