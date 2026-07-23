import { useMemo, useState } from "react";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import JewelCard from "@/components/jewellery/JewelCard";
import ZirconeTurn from "@/components/jewellery/ZirconeTurn";
import { jewellery, type JewelCategory } from "@/data/jewellery";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const filters: Array<"All" | JewelCategory> = ["All", "Rings", "Bracelets", "Earrings", "Necklaces"];

const Jewellery = () => {
  const [active, setActive] = useState<"All" | JewelCategory>("All");
  const pieces = useMemo(
    () => (active === "All" ? jewellery : jewellery.filter((p) => p.category === active)),
    [active]
  );

  return (
    <>
      <PageSEO
        title="The Demi-Gold Jewellery Atelier — Naira Flore"
        description="Pressed-flower rings & earrings in 18k gold-plated demi-fine. Cast from real blooms, made to order by Naira Flore."
        canonical="https://nairaflore.com/jewellery"
      />
      <div className="bg-[#FBF3EC] pt-[94px] text-[#1A1614] md:pt-[100px] lg:pt-[116px]">
        {/* hero — the clean scroll-turned solitaire */}
        <ZirconeTurn showViewAll={false} />

        {/* filter */}
        <div className="sticky top-[94px] z-20 flex justify-center gap-2 bg-[#FBF3EC]/85 py-5 backdrop-blur md:top-[100px] lg:top-[116px]">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActive(f)}
              className={`border px-6 py-2.5 text-[11px] tracking-[0.3em] transition-colors duration-300 ${
                active === f ? "border-[#1A1614] bg-[#1A1614] text-[#FBF3EC]" : "border-[#1A1614]/25 text-[#1A1614]/70 hover:border-[#1A1614]/60"
              }`}
              style={jost}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {/* grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-24 pt-10 sm:gap-6 sm:px-6 lg:grid-cols-3 lg:gap-8">
          {pieces.map((piece, i) => (
            <JewelCard key={piece.handle} piece={piece} index={i} />
          ))}
        </div>

        {/* care / made-to-order note */}
        <div className="mx-auto max-w-2xl border-t border-[#1A1614]/12 px-6 py-16 text-center">
          <p className="text-[11px] tracking-[0.4em] text-[#B0843A]" style={jost}>MADE TO ORDER</p>
          <p className="mx-auto mt-4 max-w-md text-[16px] leading-relaxed text-[#1A1614]/70" style={editorial}>
            Each piece is plated and finished to order over 2–3 weeks. Enquire on
            WhatsApp and our atelier will confirm sizing, finish, and delivery.
          </p>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Jewellery;
