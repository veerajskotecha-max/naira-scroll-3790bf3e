import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import floralPattern from "@/assets/floral-pattern-bg.webp";

export interface ShopHeroProps {
  eyebrow?: string;
  title?: string;
  titleAccent?: string;
  description?: string;
  badge?: string;
  primaryCta?: { label: string; to: string };
  secondaryCta?: { label: string; to: string };
  /** kept for backwards compatibility — no longer rendered */
  image?: string;
  imageAlt?: string;
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
        // Sage → soft beige gradient (Naira palette)
        background:
          "linear-gradient(135deg, hsl(140 14% 84%) 0%, hsl(36 30% 92%) 50%, hsl(20 35% 90%) 100%)",
      }}
      aria-label="Shop hero"
    >
      {/* Subtle floral pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url(${floralPattern})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.07,
          mixBlendMode: "multiply",
          transform: `translateY(${scrollY * 0.06}px)`,
          willChange: "transform",
        }}
      />

      {/* Soft warm glow — top right */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          top: "-10%",
          right: "-5%",
          width: "640px",
          height: "640px",
          background:
            "radial-gradient(circle, hsla(20, 50%, 82%, 0.55) 0%, hsla(20, 50%, 82%, 0) 70%)",
          filter: "blur(20px)",
          transform: `translateY(${scrollY * -0.04}px)`,
          willChange: "transform",
        }}
      />

      {/* Soft sage glow — bottom left */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none"
        style={{
          bottom: "-15%",
          left: "-8%",
          width: "560px",
          height: "560px",
          background:
            "radial-gradient(circle, hsla(140, 18%, 75%, 0.55) 0%, hsla(140, 18%, 75%, 0) 70%)",
          filter: "blur(20px)",
          transform: `translateY(${scrollY * -0.03}px)`,
          willChange: "transform",
        }}
      />

      {/* Decorative hairline accents */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 top-0 h-px w-24 md:w-32"
        style={{ backgroundColor: "hsl(186 30% 30% / 0.25)" }}
      />

      <div
        ref={ref}
        className={`relative max-w-[860px] mx-auto px-6 md:px-10 py-16 md:py-24 lg:py-28 text-center transition-all duration-700 ease-out ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Eyebrow + badge */}
        <div className="flex items-center gap-3 justify-center mb-5">
          <span className="h-px w-8" style={{ backgroundColor: "hsl(186 35% 28% / 0.4)" }} />
          <span
            className="font-sans text-[11px] md:text-[12px] font-medium uppercase tracking-[0.28em]"
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
          <span className="h-px w-8" style={{ backgroundColor: "hsl(186 35% 28% / 0.4)" }} />
        </div>

        {/* Heading */}
        <h1
          className="font-cormorant font-medium leading-[1.05] mb-6 md:mb-7 text-[40px] md:text-[60px] lg:text-[76px]"
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
            className="font-cormorant text-[16px] md:text-[18px] lg:text-[19px] leading-[1.65] max-w-[560px] mx-auto mb-9 md:mb-10"
            style={{ color: "hsl(0 0% 35%)" }}
          >
            {description}
          </p>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-3 md:gap-4 justify-center">
          <Link
            to={primaryCta.to}
            className="font-sans text-[12px] md:text-[13px] font-medium uppercase tracking-[0.18em] px-9 md:px-11 py-3.5 md:py-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
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
              className="font-sans text-[12px] md:text-[13px] font-medium uppercase tracking-[0.18em] px-8 md:px-10 py-3.5 md:py-4 transition-all duration-300 hover:-translate-y-0.5"
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

      {/* Bottom hairline */}
      <div
        aria-hidden="true"
        className="absolute left-1/2 -translate-x-1/2 bottom-0 h-px w-24 md:w-32"
        style={{ backgroundColor: "hsl(186 30% 30% / 0.25)" }}
      />
    </section>
  );
};

export default ShopHero;
