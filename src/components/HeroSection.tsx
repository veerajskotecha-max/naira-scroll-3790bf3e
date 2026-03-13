import { Link } from "react-router-dom";
import heroModel from "@/assets/hero-model.png";
import featured1 from "@/assets/featured-1.jpg";
import featured2 from "@/assets/featured-2.jpg";

const HeroSection = () => {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#F2C9B8", minHeight: "min(890px, 85vh)" }}
    >
      {/* Background watermark NAIRA text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span
          className="font-cormorant font-semibold uppercase tracking-[0.08em] opacity-[0.08]"
          style={{
            fontSize: "clamp(120px, 18vw, 320px)",
            color: "#8B5E3C",
            letterSpacing: "0.06em",
          }}
        >
          NAIRA
        </span>
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-[1400px] mx-auto h-full flex flex-col lg:flex-row items-end lg:items-end px-6 md:px-10 lg:px-16"
        style={{ minHeight: "min(890px, 85vh)" }}
      >
        {/* Left text content */}
        <div className="flex flex-col justify-end pb-16 md:pb-20 lg:pb-24 flex-1 z-20 order-2 lg:order-1">
          <h1 className="font-cormorant text-[28px] md:text-[36px] lg:text-[42px] font-medium leading-[1.15] mb-4"
            style={{ color: "#3D2B1F" }}
          >
            Where Tradition Meets
            <br />
            <em className="font-normal italic">Contemporary</em> style
          </h1>
          <p
            className="font-cormorant text-[14px] md:text-[16px] lg:text-[17px] leading-relaxed mb-8 max-w-[420px]"
            style={{ color: "rgba(61, 43, 31, 0.75)" }}
          >
            Discover the finest Indo-Western fusion wear,
            <br className="hidden md:block" />
            crafted for the modern woman.
          </p>
          <div className="flex flex-wrap gap-3 md:gap-4">
            <Link
              to="/shop"
              className="font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.14em] px-7 md:px-9 py-3 md:py-3.5 border transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: "#3D2B1F",
                color: "#FFFFFF",
                borderColor: "#3D2B1F",
              }}
            >
              SHOP COLLECTION
            </Link>
            <Link
              to="/craft"
              className="font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.14em] px-7 md:px-9 py-3 md:py-3.5 border transition-all duration-300 hover:opacity-80"
              style={{
                backgroundColor: "rgba(61, 43, 31, 0.08)",
                color: "#3D2B1F",
                borderColor: "rgba(61, 43, 31, 0.25)",
              }}
            >
              EXPLORE CRAFT
            </Link>
          </div>
        </div>

        {/* Center model image */}
        <div className="flex-shrink-0 z-10 order-1 lg:order-2 flex items-end justify-center self-end">
          <img
            src={heroModel}
            alt="NAIRA fashion model wearing Indo-Western fusion outfit"
            className="h-[380px] md:h-[520px] lg:h-[680px] xl:h-[780px] w-auto object-contain object-bottom"
            loading="eager"
          />
        </div>

        {/* Right featured collection */}
        <div className="hidden lg:flex flex-col items-end justify-end pb-20 flex-1 z-20 order-3">
          <div className="flex items-center gap-2 mb-5">
            <span
              className="w-[6px] h-[6px] rounded-full"
              style={{ backgroundColor: "#3D2B1F" }}
            />
            <span
              className="font-cormorant text-[12px] font-medium uppercase tracking-[0.16em]"
              style={{ color: "#3D2B1F" }}
            >
              FEATURED COLLECTION
            </span>
          </div>
          <div className="flex gap-3">
            <div
              className="w-[90px] h-[120px] xl:w-[100px] xl:h-[140px] rounded-full overflow-hidden border"
              style={{ borderColor: "rgba(61,43,31,0.12)" }}
            >
              <img
                src={featured1}
                alt="Featured collection item 1"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div
              className="w-[90px] h-[120px] xl:w-[100px] xl:h-[140px] rounded-full overflow-hidden border"
              style={{ borderColor: "rgba(61,43,31,0.12)" }}
            >
              <img
                src={featured2}
                alt="Featured collection item 2"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
