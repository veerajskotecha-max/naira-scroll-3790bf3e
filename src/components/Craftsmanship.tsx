import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import craftsmanshipMain from "@/assets/craftsmanship-main.jpg";
import craftsmanshipOverlay from "@/assets/craftsmanship-overlay.jpg";

const Craftsmanship = () => {
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
      className="w-full py-[70px] md:py-[90px] lg:py-[120px]"
      style={{ backgroundColor: "hsl(0 0% 100%)" }}
    >
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-10 lg:gap-16 xl:gap-20 items-center">
          {/* Left – Images */}
          <div
            className={`relative transition-all ease-out ${
              visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            }`}
            style={{ transitionDuration: "0.6s" }}
          >
            {/* Main image */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                aspectRatio: "4/5",
                boxShadow: "0 12px 40px -10px hsla(0,0%,0%,0.15)",
              }}
            >
              <img
                src={craftsmanshipMain}
                alt="Hand embroidery craftsmanship"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            {/* Overlapping smaller image */}
            <div
              className={`absolute -bottom-6 -right-4 md:-bottom-8 md:-right-6 lg:-bottom-10 lg:-right-8 w-[40%] md:w-[38%] rounded-xl overflow-hidden transition-all ease-out ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDuration: "0.6s",
                transitionDelay: visible ? "0.25s" : "0s",
                boxShadow: "0 8px 30px -6px hsla(0,0%,0%,0.2)",
                border: "4px solid hsl(0 0% 100%)",
              }}
            >
              <img
                src={craftsmanshipOverlay}
                alt="Colorful fabrics and garments"
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
            </div>
          </div>

          {/* Right – Content */}
          <div className="flex flex-col mt-10 lg:mt-0">
            <div
              className={`transition-all ease-out ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{
                transitionDuration: "0.6s",
                transitionDelay: visible ? "0.15s" : "0s",
              }}
            >
              <h2
                className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-[1.15]"
                style={{ color: "hsl(0 0% 18%)" }}
              >
                Crafting Elegance
                <br />
                <span
                  className="italic"
                  style={{ color: "hsl(16 62% 72%)" }}
                >
                  Since 2026
                </span>
              </h2>
            </div>

            <div
              className={`transition-all ease-out ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-5"
              }`}
              style={{
                transitionDuration: "0.6s",
                transitionDelay: visible ? "0.3s" : "0s",
              }}
            >
              <p
                className="font-cormorant text-[14px] md:text-[15px] lg:text-[16px] leading-relaxed mt-6 max-w-[460px]"
                style={{ color: "hsl(0 0% 42%)" }}
              >
                NAIRA was born from a desire to bridge the gap between
                traditional Indian craftsmanship and modern global fashion. We
                believe that heritage is not just about the past—it's about how
                we carry it forward.
              </p>
              <p
                className="font-cormorant text-[14px] md:text-[15px] lg:text-[16px] leading-relaxed mt-4 max-w-[460px]"
                style={{ color: "hsl(0 0% 42%)" }}
              >
                Every piece in our collection tells a story of intricate
                details, luxurious fabrics, and silhouettes designed to empower
                the contemporary woman.
              </p>
            </div>

            <div
              className={`mt-8 transition-all ease-out ${
                visible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDuration: "0.6s",
                transitionDelay: visible ? "0.45s" : "0s",
              }}
            >
              <Link
                to="/about"
                className="inline-flex items-center font-cormorant text-[14px] font-medium uppercase tracking-[0.08em] px-8 py-3 rounded-md border transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  borderColor: "hsl(0 0% 25%)",
                  color: "hsl(0 0% 20%)",
                  backgroundColor: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "hsl(0 0% 15%)";
                  e.currentTarget.style.color = "hsl(0 0% 100%)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "hsl(0 0% 20%)";
                }}
              >
                READ OUR STORY
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Craftsmanship;
