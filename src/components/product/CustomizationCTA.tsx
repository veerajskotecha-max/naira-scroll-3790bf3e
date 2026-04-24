import { Link } from "react-router-dom";
import floralPattern from "@/assets/background_image_flora.webp";

const CustomizationCTA = () => (
  <section
    className="relative w-full overflow-hidden py-[60px] md:py-[80px] lg:py-[110px]"
    style={{ backgroundColor: "hsl(30 25% 96%)" }}
    aria-labelledby="custom-cta-heading"
  >
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{
        backgroundImage: `url(${floralPattern})`,
        backgroundSize: "600px",
        backgroundPosition: "center",
        backgroundRepeat: "repeat",
        opacity: 0.5,
      }}
    />
    <div className="relative max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20 text-center">
      <p
        className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em] mb-4"
        style={{ color: "hsl(160 15% 45%)" }}
      >
        MADE TO ORDER
      </p>
      <h2
        id="custom-cta-heading"
        className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight mb-6"
        style={{ color: "hsl(0 0% 15%)" }}
      >
        Want Something{" "}
        <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
          Made Just for You?
        </span>
      </h2>
      <p
        className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[520px] mx-auto mb-10"
        style={{ color: "hsl(0 0% 48%)" }}
      >
        From bespoke silhouettes to handpicked fabrics and personalised embroidery —
        let our atelier craft a piece that's entirely yours.
      </p>
      <Link
        to="/customize"
        className="inline-flex items-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-12 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        style={{
          backgroundColor: "hsl(143 14% 63%)",
          color: "hsl(0 0% 100%)",
        }}
      >
        Start Customisation
      </Link>
    </div>
  </section>
);

export default CustomizationCTA;
