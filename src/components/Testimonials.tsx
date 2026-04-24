import { useEffect, useRef, useState } from "react";
import bride1 from "@/assets/carousel-bride-1.jpg";
import bride2 from "@/assets/carousel-bride-2.jpg";
import festive1 from "@/assets/carousel-festive-1.jpg";
import festive2 from "@/assets/carousel-festive-2.jpg";
import fusion1 from "@/assets/carousel-fusion-1.jpg";
import fusion2 from "@/assets/carousel-fusion-2.jpg";
import centerNaira from "@/assets/testimonials-center-naira.webp";

type Tile = {
  src: string;
  outfit: string;
  by: string;
  area: string; // grid-area name
  quote?: string;
  quoteAlign?: "left" | "right";
};

/**
 * Grid layout (6 cols × 5 rows) — fixed, magazine-style
 *
 *   t1   t1   top  top  tr   tall
 *   t2   ctr  ctr  ctr  tr   tall
 *   t2   ctr  ctr  ctr  mr   tall
 *   bl   ctr  ctr  ctr  mr   tall
 *   bl   bot  bot  bot  bot  tall
 */
const tiles: Tile[] = [
  { src: bride1,   outfit: "Ivory Zardozi Lehenga", by: "Ananya · Mumbai",     area: "t1",  quote: "Perfect fit.",          quoteAlign: "left" },
  { src: festive1, outfit: "Blush Anarkali",        by: "Priya · London",      area: "top" },
  { src: fusion2,  outfit: "Modern Fusion",         by: "Tanvi · Bangalore",   area: "tr" },
  { src: bride1,   outfit: "Loved by Women",        by: "",                    area: "ctr" }, // center hero tile
  { src: festive2, outfit: "Festive Edit",          by: "Meera · Pune",        area: "t2" },
  { src: bride2,   outfit: "Bridal Couture",        by: "Riya · Delhi",        area: "mr",  quote: "Exactly how I imagined.", quoteAlign: "right" },
  { src: fusion1,  outfit: "Sage Drape Saree",      by: "Sarah · Dubai",       area: "tall" },
  { src: festive1, outfit: "Soft Pastel Drape",     by: "Naina · Jaipur",      area: "bl" },
  { src: festive2, outfit: "Evening Edit",          by: "Aanya · Hyderabad",   area: "bot", quote: "Felt like art.", quoteAlign: "left" },
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
      className="w-full py-[70px] md:py-[90px] lg:py-[110px]"
      style={{
        background:
          "linear-gradient(180deg, hsl(36 30% 96%) 0%, hsl(140 14% 92%) 100%)",
      }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-12">
        {/* Eyebrow */}
        <div
          className={`text-center mb-8 md:mb-10 transition-all ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transitionDuration: "0.6s" }}
        >
          <p
            className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.22em]"
            style={{ color: "hsl(186 35% 28%)" }}
          >
            Worn by Her · Loved Forever
          </p>
        </div>

        {/* MOBILE: center text + horizontal scroll */}
        <div className="lg:hidden">
          <div
            className={`text-center max-w-[480px] mx-auto mb-8 transition-all ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
            style={{ transitionDuration: "0.6s", transitionDelay: "0.2s" }}
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
              Real women. Real stories. Each piece worn, lived, cherished.
            </p>
          </div>

          {/* Tablet: 2-column grid; Mobile: horizontal scroll */}
          <div className="hidden md:grid md:grid-cols-2 gap-4">
            {tiles.filter((t) => t.area !== "ctr").slice(0, 6).map((tile, i) => (
              <CollageTile key={i} tile={tile} visible={visible} index={i} aspect="aspect-[4/5]" />
            ))}
          </div>
          <div className="flex md:hidden gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-5 px-5">
            {tiles.filter((t) => t.area !== "ctr").slice(0, 6).map((tile, i) => (
              <div key={i} className="snap-start shrink-0 w-[72%]">
                <CollageTile tile={tile} visible={visible} index={i} aspect="aspect-[4/5]" />
              </div>
            ))}
          </div>
        </div>

        {/* DESKTOP: structured magazine grid */}
        <div
          className="hidden lg:grid gap-3 xl:gap-4"
          style={{
            gridTemplateColumns: "1.1fr 1.1fr 1.1fr 1.1fr 1.1fr 1.3fr",
            gridTemplateRows: "repeat(5, 110px)",
            gridTemplateAreas: `
              "t1  t1  top top tr   tall"
              "t2  ctr ctr ctr tr   tall"
              "t2  ctr ctr ctr mr   tall"
              "bl  ctr ctr ctr mr   tall"
              "bl  bot bot bot bot  tall"
            `,
          }}
        >
          {tiles.map((tile, i) => {
            if (tile.area === "ctr") {
              return (
                <div
                  key={i}
                  className={`relative overflow-hidden transition-all ease-out ${
                    visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
                  }`}
                  style={{
                    gridArea: "ctr",
                    transitionDuration: "0.8s",
                    transitionDelay: visible ? "0.15s" : "0s",
                    borderRadius: "4px",
                    boxShadow: "0 14px 40px -18px hsla(20,15%,15%,0.28)",
                  }}
                >
                  <img
                    src={tile.src}
                    alt="Loved by women everywhere"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: "center 30%" }}
                  />
                  {/* Soft bottom-up gradient for text legibility */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, hsla(0,0%,0%,0.05) 0%, hsla(0,0%,0%,0.15) 45%, hsla(0,0%,0%,0.55) 100%)",
                    }}
                  />
                  {/* Center text overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-end text-center px-8 pb-10 xl:pb-12">
                    <div
                      className="w-10 h-px mb-4"
                      style={{ backgroundColor: "hsla(0,0%,100%,0.7)" }}
                    />
                    <h2
                      className="font-cormorant text-[34px] xl:text-[44px] font-medium leading-[1.05] mb-3"
                      style={{ color: "hsl(0 0% 100%)" }}
                    >
                      Loved by Women{" "}
                      <span className="italic">Everywhere</span>
                    </h2>
                    <p
                      className="font-cormorant text-[15px] xl:text-[16px] italic leading-relaxed max-w-[360px]"
                      style={{ color: "hsla(0,0%,100%,0.88)" }}
                    >
                      Real women. Real stories. Each piece worn, lived, cherished.
                    </p>
                  </div>
                </div>
              );
            }
            return (
              <CollageTile
                key={i}
                tile={tile}
                visible={visible}
                index={i}
                style={{ gridArea: tile.area }}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

const CollageTile = ({
  tile,
  visible,
  index,
  style,
  aspect,
}: {
  tile: Tile;
  visible: boolean;
  index: number;
  style?: React.CSSProperties;
  aspect?: string;
}) => {
  return (
    <div
      className={`group relative overflow-hidden transition-all ease-out ${aspect ?? ""} ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{
        ...style,
        transitionDuration: "0.7s",
        transitionDelay: visible ? `${index * 0.06 + 0.15}s` : "0s",
        borderRadius: "4px",
        boxShadow: "0 6px 20px -10px hsla(20,15%,15%,0.18)",
      }}
    >
      <img
        src={tile.src}
        alt={tile.outfit}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-[400ms] ease-out group-hover:scale-[1.04]"
      />
      {/* Hover overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background:
            "linear-gradient(to top, hsla(0,0%,0%,0.55), hsla(0,0%,0%,0.05) 60%, transparent 100%)",
        }}
      />
      <div className="absolute inset-x-0 bottom-0 p-3 xl:p-4 translate-y-1 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <p
          className="font-cormorant text-[14px] xl:text-[16px] italic leading-tight"
          style={{ color: "hsl(0 0% 100%)" }}
        >
          {tile.outfit}
        </p>
        <p
          className="text-[9px] xl:text-[10px] uppercase tracking-[0.18em] mt-1"
          style={{ color: "hsla(0,0%,100%,0.85)" }}
        >
          View Story
        </p>
      </div>

      {/* Subtle italic quote overlay (no box) */}
      {tile.quote && (
        <span
          className={`pointer-events-none absolute top-3 font-cormorant italic text-[13px] xl:text-[14px] ${
            tile.quoteAlign === "right" ? "right-3 text-right" : "left-3"
          }`}
          style={{
            color: "hsla(0,0%,100%,0.95)",
            textShadow: "0 1px 6px hsla(0,0%,0%,0.45)",
          }}
        >
          "{tile.quote}"
        </span>
      )}
    </div>
  );
};

export default Testimonials;
