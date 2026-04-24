import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import defaultHeroImage from "@/assets/hero-model-2.png";
import floralPattern from "@/assets/floral-pattern-bg.webp";

export interface ShopHeroProps {
  eyebrow?: string;
  title?: string;
  titleAccent?: string; // italic accent appended to title
  description?: string;
  badge?: string; // small tag, e.g. "10% OFF"
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  image?: string;
  imageAlt?: string;
  /** subtle solid background color (HSL string) */
  background?: string;
}

const ShopHero = ({
  eyebrow = "New Arrivals",
  title = "The Festive",
  titleAccent = "Edit",
  description = "Curated silhouettes crafted for the season — handwoven textures, refined embroidery, contemporary drape.",
  badge,
  primaryCta = { label: "Shop Now", to: "/shop" },
  secondaryCta,
  image = defaultHeroImage,
  imageAlt = "Naira featured collection",
  background = "hsl(33 30% 92%)",
}: ShopHeroProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  // Subtle parallax on background layers
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, hsl(33 40% 95%) 0%, ${background} 55%, hsl(16 35% 86%) 100%)`,
      }}
      aria-label="Shop hero"
    >
      {/* Layered floral pattern (very subtle) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${floralPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.06,
          mixBlendMode: "multiply",
          transform: `translateY(${scrollY * 0.08}px)`,
          willChange: "transform",
        }}
      />

      {/* Soft warm glow accent */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "10%",
          right: "8%",
          width: "520px",
          height: "520px",
          background:
            "radial-gradient(circle, hsla(16, 60%, 80%, 0.45) 0%, hsla(16, 60%, 80%, 0) 70%)",
          filter: "blur(20px)",
          transform: `translateY(${scrollY * -0.04}px)`,
          willChange: "transform",
        }}
      />

      <div
        ref={ref}
        className="relative max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 items-stretch"
      >
        {/* ── Content side ── */}
        <div
          className={`order-2 lg:order-1 flex flex-col justify-center px-6 md:px-10 lg:px-16 py-10 md:py-14 lg:py-16 text-center lg:text-left transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div className="flex items-center gap-3 justify-center lg:justify-start mb-4">
            <span
              className="font-sans text-[11px] md:text-[12px] font-medium uppercase tracking-[0.22em]"
              style={{ color: "hsl(186 35% 28%)" }}
            >
              {eyebrow}
            </span>
            {badge && (
              <span
                className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] px-2.5 py-1"
                style={{
                  backgroundColor: "hsl(186 35% 28%)",
                  color: "hsl(0 0% 100%)",
                }}
              >
                {badge}
              </span>
            )}
          </div>

          <h1
            className="font-cormorant font-medium leading-[1.05] mb-5 md:mb-6 text-[36px] md:text-[52px] lg:text-[64px]"
            style={{ color: "hsl(0 0% 15%)" }}
          >
            {title}
            {titleAccent && (
              <>
                {" "}
                <em className="italic font-normal" style={{ color: "hsl(186 35% 28%)" }}>
                  {titleAccent}
                </em>
              </>
            )}
          </h1>

          {description && (
            <p
              className="font-cormorant text-[15px] md:text-[17px] lg:text-[18px] leading-[1.65] max-w-[460px] mx-auto lg:mx-0 mb-7 md:mb-8"
              style={{ color: "hsl(0 0% 38%)" }}
            >
              {description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-center lg:justify-start">
            <Link
              to={primaryCta.to}
              className="font-sans text-[12px] md:text-[13px] font-medium uppercase tracking-[0.16em] px-8 md:px-10 py-3.5 md:py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                backgroundColor: "hsl(0 0% 12%)",
                color: "hsl(0 0% 100%)",
              }}
            >
              {primaryCta.label}
            </Link>
            {secondaryCta && (
              <Link
                to={secondaryCta.to}
                className="font-sans text-[12px] md:text-[13px] font-medium uppercase tracking-[0.16em] px-7 md:px-8 py-3.5 md:py-4 transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  border: "1px solid hsl(0 0% 18%)",
                  color: "hsl(0 0% 15%)",
                  backgroundColor: "transparent",
                }}
              >
                {secondaryCta.label}
              </Link>
            )}
          </div>
        </div>

        {/* ── Image side ── */}
        <div
          className={`order-1 lg:order-2 relative transition-all duration-1000 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
          }`}
        >
          <div className="relative w-full h-[360px] md:h-[480px] lg:h-[560px] group">
            {/* Radial glow behind subject */}
            <div
              aria-hidden="true"
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse 55% 70% at 50% 45%, hsla(33, 50%, 92%, 0.85) 0%, hsla(33, 50%, 92%, 0) 70%)",
              }}
            />
            <img
              src={image}
              alt={imageAlt}
              className={`relative w-full h-full object-cover transition-transform ease-out group-hover:scale-[1.03] ${
                visible ? "scale-100" : "scale-[1.02]"
              }`}
              style={{
                objectPosition: "center top",
                filter: "drop-shadow(0 24px 30px hsla(20, 30%, 25%, 0.18))",
                transitionDuration: "1400ms",
              }}
              loading="eager"
            />
            {/* Grounding shadow under model */}
            <div
              aria-hidden="true"
              className="absolute left-1/2 -translate-x-1/2 pointer-events-none"
              style={{
                bottom: "4%",
                width: "62%",
                height: "28px",
                background:
                  "radial-gradient(ellipse at center, hsla(20, 30%, 18%, 0.28) 0%, hsla(20, 30%, 18%, 0) 70%)",
                filter: "blur(6px)",
              }}
            />
            {/* Mobile contrast overlay */}
            <div
              className="absolute inset-0 lg:hidden pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.16) 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShopHero;
