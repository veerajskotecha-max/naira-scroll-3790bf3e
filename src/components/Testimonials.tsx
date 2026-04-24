import { useEffect, useRef, useState } from "react";
import bride1 from "@/assets/carousel-bride-1.jpg";
import bride2 from "@/assets/carousel-bride-2.jpg";
import festive1 from "@/assets/carousel-festive-1.jpg";
import festive2 from "@/assets/carousel-festive-2.jpg";
import fusion1 from "@/assets/carousel-fusion-1.jpg";
import fusion2 from "@/assets/carousel-fusion-2.jpg";

type Tile = {
  src: string;
  outfit: string;
  by: string;
  // Grid placement (desktop only) — 6-col grid, 6 rows of ~80px
  className: string;
  quote?: string; // floating editorial caption
  quotePos?: string; // absolute positioning classes for the caption
};

const tiles: Tile[] = [
  {
    src: bride1,
    outfit: "Ivory Zardozi Lehenga",
    by: "Ananya · Mumbai",
    className: "lg:col-span-2 lg:row-span-4",
    quote: "Perfect fit.",
    quotePos: "lg:top-6 lg:-left-2 lg:rotate-[-4deg]",
  },
  {
    src: festive1,
    outfit: "Blush Anarkali",
    by: "Priya · London",
    className: "lg:col-span-2 lg:row-span-3 lg:col-start-3",
  },
  {
    src: fusion1,
    outfit: "Sage Drape Saree",
    by: "Sarah · Dubai",
    className: "lg:col-span-2 lg:row-span-4 lg:col-start-5",
    quote: "Exactly how I imagined.",
    quotePos: "lg:top-10 lg:-right-2 lg:rotate-[3deg]",
  },
  {
    src: festive2,
    outfit: "Festive Edit",
    by: "Meera · Pune",
    className: "lg:col-span-2 lg:row-span-3 lg:col-start-3 lg:row-start-4",
  },
  {
    src: bride2,
    outfit: "Bridal Couture",
    by: "Riya · Delhi",
    className: "lg:col-span-2 lg:row-span-2 lg:col-start-1 lg:row-start-5",
    quote: "Felt like art.",
    quotePos: "lg:bottom-2 lg:left-4 lg:rotate-[-2deg]",
  },
  {
    src: fusion2,
    outfit: "Modern Fusion",
    by: "Tanvi · Bangalore",
    className: "lg:col-span-2 lg:row-span-2 lg:col-start-5 lg:row-start-5",
  },
];

const Testimonials = () => {
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
      className="w-full py-[70px] md:py-[90px] lg:py-[110px] overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, hsl(36 30% 96%) 0%, hsl(140 14% 92%) 100%)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        {/* Eyebrow */}
        <div
          className={`text-center mb-6 md:mb-8 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em]"
            style={{ color: "hsl(186 35% 28%)" }}
          >
            Worn by Her · Loved Forever
          </p>
        </div>

        {/* Collage */}
        <div className="relative">
          {/* Mobile / tablet: 2-col masonry-ish grid. Desktop: 6-col asymmetric grid */}
          <div className="grid grid-cols-2 lg:grid-cols-6 auto-rows-[110px] sm:auto-rows-[140px] lg:auto-rows-[80px] gap-3 md:gap-4 lg:gap-5">
            {tiles.map((tile, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden cursor-pointer transition-all ease-out ${
                  i === 1 ? "row-span-2" : ""
                } ${i === 4 ? "row-span-2" : ""} ${tile.className} ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDuration: "0.7s",
                  transitionDelay: visible ? `${i * 0.08 + 0.1}s` : "0s",
                  boxShadow: "0 6px 24px -10px hsla(0,0%,0%,0.18)",
                }}
              >
                <img
                  src={tile.src}
                  alt={tile.outfit}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.05]"
                />

                {/* Soft gradient on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to top, hsla(0,0%,0%,0.55) 0%, hsla(0,0%,0%,0.1) 50%, transparent 100%)",
                  }}
                />

                {/* Hover info panel */}
                <div className="absolute inset-x-0 bottom-0 p-3 md:p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p
                    className="font-cormorant text-[15px] md:text-[17px] italic leading-tight"
                    style={{ color: "hsl(0 0% 100%)" }}
                  >
                    {tile.outfit}
                  </p>
                  <p
                    className="text-[10px] md:text-[11px] uppercase tracking-[0.15em] mt-1"
                    style={{ color: "hsla(0,0%,100%,0.85)" }}
                  >
                    {tile.by} · View Story
                  </p>
                </div>

                {/* Floating editorial caption (desktop only) */}
                {tile.quote && (
                  <span
                    className={`hidden lg:block absolute font-cormorant italic text-[15px] xl:text-[17px] pointer-events-none z-20 ${tile.quotePos}`}
                    style={{
                      color: "hsl(186 35% 22%)",
                      textShadow: "0 1px 8px hsla(36,30%,96%,0.9)",
                    }}
                  >
                    "{tile.quote}"
                  </span>
                )}
              </div>
            ))}

            {/* Center overlay text — desktop: absolutely centered on grid */}
            <div
              className={`hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex-col items-center text-center px-8 py-7 max-w-[420px] transition-all ease-out ${
                visible
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              }`}
              style={{
                transitionDuration: "0.9s",
                transitionDelay: "0.5s",
                backgroundColor: "hsla(36, 30%, 96%, 0.82)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                boxShadow: "0 10px 40px -12px hsla(0,0%,0%,0.18)",
              }}
            >
              <div
                className="w-10 h-px mb-4"
                style={{ backgroundColor: "hsl(186 35% 28%)" }}
              />
              <h2
                className="font-cormorant text-[34px] xl:text-[44px] font-medium leading-[1.1] mb-3"
                style={{ color: "hsl(0 0% 16%)" }}
              >
                Loved by Women{" "}
                <span className="italic" style={{ color: "hsl(186 35% 28%)" }}>
                  Everywhere
                </span>
              </h2>
              <p
                className="font-cormorant text-[15px] xl:text-[16px] leading-relaxed"
                style={{ color: "hsl(0 0% 35%)" }}
              >
                Real women. Real stories. Each piece worn, lived, and cherished.
              </p>
            </div>
          </div>

          {/* Mobile/tablet center text block (separate, on top) */}
          <div
            className={`lg:hidden mt-8 text-center max-w-[480px] mx-auto transition-all ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDuration: "0.6s", transitionDelay: "0.3s" }}
          >
            <h2
              className="font-cormorant text-[28px] md:text-[36px] font-medium leading-[1.15] mb-3"
              style={{ color: "hsl(0 0% 16%)" }}
            >
              Loved by Women{" "}
              <span className="italic" style={{ color: "hsl(186 35% 28%)" }}>
                Everywhere
              </span>
            </h2>
            <p
              className="font-cormorant text-[15px] md:text-[16px] leading-relaxed italic"
              style={{ color: "hsl(0 0% 40%)" }}
            >
              "Perfect fit." · "Exactly how I imagined." · "Felt like art."
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
