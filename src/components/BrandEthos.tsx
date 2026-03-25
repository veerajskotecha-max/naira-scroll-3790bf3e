import { useEffect, useRef, useState } from "react";
import { PenLine, Scissors, Flower } from "lucide-react";

const pillars = [
  { icon: PenLine, title: "Personalised" },
  { icon: Scissors, title: "Handcrafted" },
  { icon: Flower, title: "Floral-Inspired" },
];

const BrandEthos = () => {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.2 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="w-full py-8"
      style={{ backgroundColor: "hsl(30 25% 96%)" }}
    >
      <div className="max-w-[960px] mx-auto px-6 flex items-center justify-center gap-16 md:gap-24">
        {pillars.map((pillar, i) => (
          <div
            key={i}
            className={`flex flex-col items-center text-center transition-all duration-500 ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{ transitionDelay: visible ? `${i * 0.08}s` : "0s" }}
          >
            <pillar.icon
              size={28}
              strokeWidth={1.2}
              style={{ color: "hsl(160 15% 45%)" }}
              className="mb-2.5"
            />
            <h3
              className="font-cormorant text-[14px] md:text-[16px] font-medium uppercase tracking-[0.12em]"
              style={{ color: "hsl(0 0% 25%)" }}
            >
              {pillar.title}
            </h3>
          </div>
        ))}
      </div>
    </section>
  );
};

export default BrandEthos;
