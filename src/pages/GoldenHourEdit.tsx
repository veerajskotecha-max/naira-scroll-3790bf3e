import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import JewelCard from "@/components/jewellery/JewelCard";
import Reveal from "@/components/wow/Reveal";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { resolveEdit } from "@/data/adsEdit";
import { SITE_URL } from "@/data/seoContent";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

/* The Golden Hour — a private edit used only in paid campaigns.
   Deliberately absent from the menus, the footer and the sitemap, and
   marked noindex: the only way in is the ad link. */
const GoldenHourEdit = () => {
  const { jewellery } = useLiveJewellery();
  const pieces = resolveEdit(jewellery);
  const url = `${SITE_URL}/the-golden-hour`;

  return (
    <>
      <PageSEO
        title="The Golden Hour | A Private Edit"
        description="Ten pieces from the Naira Flore atelier, chosen for the golden hour. 18K gold tone, waterproof and anti-tarnish, shipped insured in 3–5 working days."
        canonical={url}
        image={pieces[0]?.image}
        noindex
      />

      <div className="bg-[#FBF3EC] pt-[94px] text-[#1A1614] md:pt-[100px] lg:pt-[116px]">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Reveal as="header" className="relative border-b border-[#1A1614]/10 pb-10 pt-12 text-center">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-8 left-1/2 h-[260px] w-[120%] -translate-x-1/2 [background:radial-gradient(50%_60%_at_50%_30%,rgba(255,224,205,0.5)_0%,transparent_70%)]"
            />
            <p className="relative text-[10px] tracking-[0.4em] text-[#9A7634]" style={jost}>
              A PRIVATE EDIT
            </p>
            <h1 className="relative mt-4 text-[36px] leading-[1.05] md:text-[58px]" style={velista}>
              The Golden Hour
            </h1>
            <p
              className="relative mx-auto mt-6 max-w-2xl text-[15px] leading-[1.85] text-[#1A1614]/70 md:text-[17px]"
              style={editorial}
            >
              Ten pieces we keep aside for the last warm light of the day — hoops, chains and
              stone-set rings in 18K gold tone. Waterproof, anti-tarnish, and carried with a
              two-year plating assurance.
            </p>
            <p className="relative mt-5 text-[10px] tracking-[0.3em] text-[#1A1614]/45" style={jost}>
              INSURED DELIVERY IN 3–5 WORKING DAYS · 7-DAY RETURNS
            </p>
          </Reveal>

          <section aria-label="The Golden Hour edit" className="grid grid-cols-2 gap-4 pt-10 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {pieces.map((piece, i) => (
              <Reveal key={piece.handle} delay={(i % 3) * 70}>
                <JewelCard piece={piece} index={i} />
              </Reveal>
            ))}
          </section>

          <div className="border-t border-[#1A1614]/10 py-14 text-center md:py-20">
            <p className="text-[15px] leading-[1.85] text-[#1A1614]/65 md:text-[17px]" style={editorial}>
              Looking for something else from the atelier?
            </p>
            <Link
              to="/jewellery"
              className="mt-6 inline-block border border-[#1A1614]/25 px-8 py-3 text-[10px] tracking-[0.3em] transition-colors hover:bg-[#1A1614] hover:text-[#FBF3EC]"
              style={jost}
            >
              VIEW ALL JEWELLERY
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default GoldenHourEdit;
