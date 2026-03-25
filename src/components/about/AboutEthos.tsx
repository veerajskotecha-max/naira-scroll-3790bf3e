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
      className="relative w-full overflow-hidden py-8"
      style={{ backgroundColor: "hsl(30 25% 96%)" }}
    >


      <div ref={ref} className="relative max-w-[960px] mx-auto px-6">
        {/* Heading */}
        <p
          className="text-center text-[10px] font-medium uppercase tracking-[0.2em] mb-6"
          style={{ color: "hsl(160 15% 45%)" }}
        >
          Brand Ethos
        </p>

        {/* Pillars row */}
        <div className="flex items-center justify-center gap-12 md:gap-20">
          {pillars.map((pillar, i) => (
            <button
              key={i}
              onClick={() => scrollTo(pillar.targetId)}
              className={`flex flex-col items-center text-center cursor-pointer group transition-all duration-500 ease-out ${
                visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: visible ? `${i * 0.1}s` : "0s" }}
            >
              <div
                className="w-9 h-9 flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110"
                style={{ borderRadius: '50%', backgroundColor: "hsl(160 12% 93%)" }}
              >
                <pillar.icon size={15} style={{ color: "hsl(160 15% 45%)" }} strokeWidth={1.5} />
              </div>
              <h3
                className="font-cormorant text-[15px] md:text-[17px] font-medium tracking-[0.04em]"
                style={{ color: "hsl(0 0% 20%)" }}
              >
                {pillar.title}
              </h3>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutEthos;
