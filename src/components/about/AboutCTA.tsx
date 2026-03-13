import { Link } from "react-router-dom";

const AboutCTA = () => (
  <section
    className="w-full py-[60px] md:py-[80px] lg:py-[120px]"
    style={{ backgroundColor: "hsl(30 25% 96%)" }}
  >
    <div className="max-w-[1200px] mx-auto px-6 md:px-10 lg:px-20 text-center">
      <p
        className="text-[11px] md:text-[12px] font-medium uppercase tracking-[0.2em] mb-4"
        style={{ color: "hsl(160 15% 45%)" }}
      >
        EXPLORE NAIRA
      </p>
      <h2
        className="font-cormorant text-[28px] md:text-[36px] lg:text-[46px] font-medium leading-tight mb-6"
        style={{ color: "hsl(0 0% 15%)" }}
      >
        Discover the{" "}
        <span className="italic" style={{ color: "hsl(16 50% 72%)" }}>
          Collection
        </span>
      </h2>
      <p
        className="font-cormorant text-[15px] md:text-[16px] leading-[1.8] max-w-[480px] mx-auto mb-10"
        style={{ color: "hsl(0 0% 48%)" }}
      >
        From bridal ensembles to modern fusion wear, explore pieces crafted with
        love, heritage, and your story in mind.
      </p>
      <Link
        to="/shop"
        className="inline-flex items-center font-cormorant text-[13px] md:text-[14px] font-medium uppercase tracking-[0.1em] px-12 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
        style={{
          backgroundColor: "hsl(143 14% 63%)",
          color: "hsl(0 0% 100%)",
        }}
      >
        View the Collection
      </Link>
    </div>
  </section>
);

export default AboutCTA;
