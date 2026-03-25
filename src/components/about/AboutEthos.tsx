import { useEffect, useRef, useState } from "react";
import { Pencil, Scissors, Flower2 } from "lucide-react";

const pillars = [
  {
    icon: Pencil,
    title: "Personalised",
    label: "Designed around your story",
    targetId: "about-personalised",
  },
  {
    icon: Scissors,
    title: "Handcrafted",
    label: "Made by artisan hands",
    targetId: "about-handcrafted",
  },
  {
    icon: Flower2,
    title: "Floral Inspired",
    label: "Rooted in nature's beauty",
    targetId: "about-floral",
  },
];

const AboutEthos = () => {
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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      className="relative w-full overflow-hidden py-[60px] md:py-[80px] lg:py-[120px]"
      style={{ backgroundColor: "hsl(30 25% 96%)" }}
    >
      <div ref={ref} className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20">
        {/* Section heading */}
        <div className="text-center mb-12 md:mb-16">
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.15em] mb-3"
            style={{ color: "hsl(160 15% 45%)" }}
          >
            BRAND ETHOS
          </p>
          <h2
            className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight"
            style={{ color: "hsl(0 0% 18%)" }}
          >
            What Defines{" "}
            <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
              Naira
            </span>
          </h2>
          <div className="flex items-center justify-center gap-3 mt-5">
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "hsl(160 15% 55%)" }} />
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: "hsl(160 12% 72%)" }} />
          </div>
        </div>

        {/* Pillars — horizontal scroll on mobile, row on desktop */}
        <div className="flex gap-6 md:gap-8 overflow-x-auto scrollbar-hide snap-x snap-mandatory md:overflow-visible md:justify-center">
          {pillars.map((pillar, i) => (
            <button
              key={i}
              onClick={() => scrollTo(pillar.targetId)}
              className={`snap-center shrink-0 w-[72%] md:w-auto md:flex-1 max-w-[320px] flex flex-col items-center text-center px-8 py-10 rounded-xl cursor-pointer group transition-all duration-500 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{
                backgroundColor: "hsl(0 0% 100%)",
                boxShadow: "0 2px 16px -4px hsla(0,0%,0%,0.07)",
                border: "1px solid hsl(0 0% 93%)",
                transitionDelay: visible ? `${i * 0.12}s` : "0s",
              }}
            >
              <div
                className="w-11 h-11 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{ borderRadius: '50%', backgroundColor: "hsl(160 12% 91%)" }}
              >
                <pillar.icon size={18} style={{ color: "hsl(160 15% 42%)" }} />
              </div>
              <h3
                className="font-cormorant text-[20px] md:text-[22px] font-semibold mb-2"
                style={{ color: "hsl(0 0% 15%)" }}
              >
                {pillar.title}
              </h3>
              <p
                className="font-cormorant text-[13px] md:text-[14px] leading-relaxed"
                style={{ color: "hsl(0 0% 50%)" }}
              >
                {pillar.label}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutEthos;
