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
  // Desktop absolute positioning (% based) for an asymmetric collage
  desktop: {
    top: string;
    left: string;
    width: string;
    height: string;
    rotate?: string;
    z: number;
    parallax: number; // px shift per scroll factor
  };
  quote?: string;
  quoteOffset?: { top: string; left?: string; right?: string; rotate?: string };
};

const tiles: Tile[] = [
  // Left tall portrait — anchor
  {
    src: bride1,
    outfit: "Ivory Zardozi Lehenga",
    by: "Ananya · Mumbai",
    desktop: { top: "4%", left: "2%", width: "26%", height: "78%", rotate: "-1.2deg", z: 20, parallax: -18 },
    quote: "Perfect fit.",
    quoteOffset: { top: "-3%", left: "1%", rotate: "-4deg" },
  },
  // Upper-mid landscape, slightly behind
  {
    src: festive1,
    outfit: "Blush Anarkali",
    by: "Priya · London",
    desktop: { top: "2%", left: "31%", width: "28%", height: "44%", rotate: "0.8deg", z: 10, parallax: -8 },
  },
  // Right tall portrait — anchor
  {
    src: fusion1,
    outfit: "Sage Drape Saree",
    by: "Sarah · Dubai",
    desktop: { top: "8%", left: "73%", width: "25%", height: "74%", rotate: "1.4deg", z: 20, parallax: -22 },
    quote: "Exactly how I imagined.",
    quoteOffset: { top: "-2%", right: "1%", rotate: "3deg" },
  },
  // Lower-mid landscape — overlaps center
  {
    src: festive2,
    outfit: "Festive Edit",
    by: "Meera · Pune",
    desktop: { top: "52%", left: "34%", width: "26%", height: "42%", rotate: "-0.6deg", z: 15, parallax: -12 },
  },
  // Lower-left small accent
  {
    src: bride2,
    outfit: "Bridal Couture",
    by: "Riya · Delhi",
    desktop: { top: "78%", left: "12%", width: "16%", height: "18%", rotate: "-2.4deg", z: 25, parallax: -28 },
    quote: "Felt like art.",
    quoteOffset: { top: "108%", left: "1%", rotate: "-2deg" },
  },
  // Upper-right small accent (offset above the tall right)
  {
    src: fusion2,
    outfit: "Modern Fusion",
    by: "Tanvi · Bangalore",
    desktop: { top: "62%", left: "62%", width: "14%", height: "20%", rotate: "2deg", z: 25, parallax: -30 },
  },
];

const Testimonials = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const collageRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

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

  // Parallax — track section position relative to viewport
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        if (sectionRef.current) {
          const rect = sectionRef.current.getBoundingClientRect();
          // Normalized progress: -1 (above) → 0 (centered) → 1 (below)
          const progress =
            (window.innerHeight / 2 - (rect.top + rect.height / 2)) /
            (window.innerHeight / 2 + rect.height / 2);
          setScrollY(Math.max(-1, Math.min(1, progress)));
        }
        raf = 0;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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

        {/* Mobile / tablet: clean 2-column staggered grid */}
        <div className="lg:hidden">
          {/* Center text on top */}
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

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {tiles.map((tile, i) => (
              <div
                key={i}
                className={`group relative overflow-hidden transition-all ease-out ${
                  i % 3 === 0 ? "row-span-2 aspect-[3/5]" : "aspect-[4/5]"
                } ${
                  i % 2 === 1 ? "translate-y-4 md:translate-y-6" : ""
                } ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{
                  transitionDuration: "0.7s",
                  transitionDelay: visible ? `${i * 0.07 + 0.1}s` : "0s",
                  boxShadow: "0 6px 22px -10px hsla(0,0%,0%,0.18)",
                }}
              >
                <img
                  src={tile.src}
                  alt={tile.outfit}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.05] group-active:scale-[1.05]"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to top, hsla(0,0%,0%,0.55), transparent 60%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 group-active:opacity-100 group-active:translate-y-0 transition-all duration-300">
                  <p
                    className="font-cormorant text-[15px] italic leading-tight"
                    style={{ color: "hsl(0 0% 100%)" }}
                  >
                    {tile.outfit}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.15em] mt-1"
                    style={{ color: "hsla(0,0%,100%,0.85)" }}
                  >
                    View Story
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop: asymmetric absolutely-positioned collage */}
        <div
          ref={collageRef}
          className="hidden lg:block relative w-full"
          style={{ height: "640px" }}
        >
          {tiles.map((tile, i) => {
            const d = tile.desktop;
            return (
              <div
                key={i}
                className={`group absolute overflow-hidden transition-all ease-out ${
                  visible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
                style={{
                  top: d.top,
                  left: d.left,
                  width: d.width,
                  height: d.height,
                  zIndex: d.z,
                  transform: `translateY(${scrollY * d.parallax}px) rotate(${
                    d.rotate || "0deg"
                  })`,
                  transitionDuration: "0.9s",
                  transitionDelay: visible ? `${i * 0.09 + 0.15}s` : "0s",
                  boxShadow:
                    d.z >= 20
                      ? "0 20px 50px -18px hsla(20,15%,15%,0.3), 0 6px 18px -8px hsla(20,15%,15%,0.18)"
                      : "0 12px 32px -14px hsla(20,15%,15%,0.22)",
                }}
              >
                <img
                  src={tile.src}
                  alt={tile.outfit}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-[700ms] ease-out group-hover:scale-[1.05]"
                />
                {/* Hover overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to top, hsla(0,0%,0%,0.6) 0%, hsla(0,0%,0%,0.1) 55%, transparent 100%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <p
                    className="font-cormorant text-[17px] italic leading-tight"
                    style={{ color: "hsl(0 0% 100%)" }}
                  >
                    {tile.outfit}
                  </p>
                  <p
                    className="text-[10px] uppercase tracking-[0.18em] mt-1"
                    style={{ color: "hsla(0,0%,100%,0.85)" }}
                  >
                    {tile.by} · View Story
                  </p>
                </div>
              </div>
            );
          })}

          {/* Floating editorial quotes (no boxes) */}
          {tiles.map(
            (tile, i) =>
              tile.quote &&
              tile.quoteOffset && (
                <span
                  key={`q-${i}`}
                  className={`absolute font-cormorant italic text-[16px] xl:text-[18px] pointer-events-none transition-all ease-out ${
                    visible ? "opacity-100" : "opacity-0"
                  }`}
                  style={{
                    top: tile.quoteOffset.top,
                    left: tile.quoteOffset.left,
                    right: tile.quoteOffset.right,
                    transform: `rotate(${tile.quoteOffset.rotate || "0deg"})`,
                    color: "hsl(186 35% 22%)",
                    textShadow: "0 1px 10px hsla(36,30%,96%,0.95)",
                    zIndex: 30,
                    transitionDuration: "0.8s",
                    transitionDelay: visible ? `${0.6 + i * 0.1}s` : "0s",
                  }}
                >
                  "{tile.quote}"
                </span>
              )
          )}

          {/* Center text — no box, slightly offset, soft radial glow behind */}
          <div
            className={`absolute z-40 text-center transition-all ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
            }`}
            style={{
              top: "38%",
              left: "50%",
              transform: `translate(-50%, -50%) translateY(${scrollY * -6}px)`,
              width: "min(420px, 38%)",
              transitionDuration: "0.9s",
              transitionDelay: "0.5s",
            }}
          >
            {/* Soft radial glow */}
            <div
              className="absolute inset-0 -m-10 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at center, hsla(36,30%,96%,0.85) 0%, hsla(36,30%,96%,0.55) 40%, transparent 75%)",
                filter: "blur(8px)",
              }}
            />
            <div className="relative">
              <div
                className="w-10 h-px mx-auto mb-4"
                style={{ backgroundColor: "hsl(186 35% 28%)" }}
              />
              <h2
                className="font-cormorant text-[36px] xl:text-[46px] font-medium leading-[1.05] mb-3"
                style={{ color: "hsl(0 0% 16%)" }}
              >
                Loved by Women{" "}
                <span className="italic" style={{ color: "hsl(186 35% 28%)" }}>
                  Everywhere
                </span>
              </h2>
              <p
                className="font-cormorant text-[15px] xl:text-[16px] italic leading-relaxed"
                style={{ color: "hsl(0 0% 32%)" }}
              >
                Real women. Real stories. Each piece worn, lived, cherished.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
