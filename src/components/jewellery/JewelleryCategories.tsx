import { Link } from "react-router-dom";
import { jewellery } from "@/data/jewellery";

/* Categories strip — follows the ZirconeTurn on the home page.
   Four quiet category cards (Rings / Bracelets / Earrings / Necklaces)
   with live piece counts, hover zoom + gold frame, linking into the
   collection. Imagery is pulled straight from the live catalogue —
   the on-model ("worn") shot of a hero piece per category. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

/** Hero piece per category — on-model shot preferred, product shot as fallback. */
const heroHandles: Record<string, string> = {
  Rings: "cushion-halo-ring",
  Bracelets: "riviere-of-light-bracelet",
  Earrings: "molten-bloom-hoops",
  Necklaces: "dewdrop-bezel-necklace",
};

const categoryImage = (category: string) => {
  const hero = jewellery.find((j) => j.handle === heroHandles[category]);
  const piece = hero ?? jewellery.find((j) => j.category === category);
  const worn = piece?.gallery?.find((u) => /_2_worn/i.test(u));
  return worn ?? piece?.image ?? "";
};

const cats = [
  { label: "Rings", img: categoryImage("Rings"), count: jewellery.filter((j) => j.category === "Rings").length, note: "solitaires, halo & stack" },
  { label: "Bracelets", img: categoryImage("Bracelets"), count: jewellery.filter((j) => j.category === "Bracelets").length, note: "tennis, bow & baroque pearl" },
  { label: "Earrings", img: categoryImage("Earrings"), count: jewellery.filter((j) => j.category === "Earrings").length, note: "hoops & the studs, three ways" },
  { label: "Necklaces", img: categoryImage("Necklaces"), count: jewellery.filter((j) => j.category === "Necklaces").length, note: "lariats, chains & a cascade" },
];




const JewelleryCategories = () => (
  <section className="bg-[#FBF3EC] pb-20 pt-4 text-[#1A1614] lg:pb-28">
    <div className="mx-auto max-w-6xl px-6">
      <div className="mb-8 text-center">
        <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>SHOP BY CATEGORY</p>
        <h3 className="mt-2 text-[clamp(1.7rem,5vw,2.8rem)]" style={velista}>
          The <span className="italic text-[#B0843A]" style={editorial}>edit.</span>
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {cats.map((c) => (
          <Link key={c.label} to={`/jewellery?category=${c.label}`} className="group relative block overflow-hidden bg-[#F4EBE2] shadow-[0_20px_44px_-28px_rgba(122,90,40,0.55)] transition-transform duration-200 active:scale-[0.98]">
            {/* portrait crop matches the source ratio, so the piece on the model is never cut away */}
            <div className="relative overflow-hidden">
              <img src={c.img} alt={`${c.label}, Naira Flore demi-gold`} loading="lazy" className="aspect-[3/4] w-full object-cover object-top transition-transform duration-1200 ease-out group-hover:scale-[1.05]" />
              <span className="pointer-events-none absolute inset-0 border border-[#C99A4C]/0 transition-colors duration-500 group-hover:border-[#C99A4C]/70" />
            </div>
            <span className="block bg-[#FFFBF7] px-3 py-3 md:px-4 md:py-4">
              <span className="block text-[20px] leading-tight text-[#1A1614] md:text-[24px]" style={velista}>{c.label}</span>
              <span className="mt-0.5 block text-[11px] italic text-[#6C6259]" style={editorial}>{c.note}</span>
              <span className="mt-2.5 inline-block border border-[#1A1614]/25 px-2.5 py-1 text-[9px] tracking-[0.28em] text-[#1A1614] transition-colors duration-300 group-hover:border-[#B0843A] group-hover:bg-[#B0843A] group-hover:text-[#FFFBF7] md:px-3 md:py-1.5" style={jost}>
                {c.count} PIECES →
              </span>
            </span>
          </Link>
        ))}
      </div>

    </div>
  </section>
);

export default JewelleryCategories;
