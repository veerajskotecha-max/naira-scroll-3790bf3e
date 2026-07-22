import { Link } from "react-router-dom";
import { jewellery } from "@/data/jewellery";
import zirconeSolitaire from "@/assets/jewellery/zircone-solitaire.jpg";
import chandbali from "@/assets/jewellery/chandbali.jpg";

/* Categories strip — follows the ZirconeTurn on the home page.
   Two quiet category cards (Rings / Earrings) with live piece counts,
   hover zoom + gold frame, linking into the collection. */

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const cats = [
  { label: "Rings", img: zirconeSolitaire, count: jewellery.filter((j) => j.category === "Rings").length, note: "solitaires & signets" },
  { label: "Earrings", img: chandbali, count: jewellery.filter((j) => j.category === "Earrings").length, note: "studs, drops & chandbali" },
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-7">
        {cats.map((c) => (
          <Link key={c.label} to="/jewellery" className="group relative block overflow-hidden bg-[#F4EBE2] shadow-[0_20px_44px_-28px_rgba(122,90,40,0.55)] transition-transform duration-200 active:scale-[0.98]">
            <img src={c.img} alt={`${c.label} — Naira Flore demi-gold`} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06] sm:aspect-[5/4]" />
            <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1614]/45 via-transparent to-transparent" />
            <span className="pointer-events-none absolute inset-0 border border-[#C99A4C]/0 transition-colors duration-500 group-hover:border-[#C99A4C]/70" />
            <span className="absolute bottom-5 left-5">
              <span className="block text-[26px] leading-tight text-[#FBF3EC] md:text-[30px]" style={velista}>{c.label}</span>
              <span className="mt-0.5 block text-[11px] italic text-[#FBF3EC]/80" style={editorial}>{c.note}</span>
            </span>
            <span className="absolute bottom-5 right-5 border border-[#FBF3EC]/50 px-3 py-1.5 text-[9px] tracking-[0.3em] text-[#FBF3EC] transition-colors duration-300 group-hover:bg-[#FBF3EC] group-hover:text-[#1A1614]" style={jost}>
              {c.count} PIECES →
            </span>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default JewelleryCategories;
