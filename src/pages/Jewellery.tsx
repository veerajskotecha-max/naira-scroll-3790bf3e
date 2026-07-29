import { useMemo, useState } from "react";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import JewelCard from "@/components/jewellery/JewelCard";
import ZirconeTurn from "@/components/jewellery/ZirconeTurn";
import { jewellery, type JewelCategory } from "@/data/jewellery";
import { allLandings as categoryLandings, SITE_URL } from "@/data/seoContent";
import { breadcrumbLd, faqLd } from "@/components/PageSEO";
import { Link } from "react-router-dom";

const hubFaqs = [
  {
    q: "What is demi-fine jewellery?",
    a: "Demi-fine jewellery sits between costume and solid gold: real construction, prong-set stones, soldered joins, a thick 18K gold or rhodium finish over a hypoallergenic base, with lab-grown zircone in place of diamonds.",
  },
  {
    q: "Does Naira Flore jewellery tarnish?",
    a: "Every piece is anti-tarnish sealed over an 18K gold or rhodium finish and built on a nickel-free base, so it will not green or dull under everyday wear in Indian humidity.",
  },
  {
    q: "Is the jewellery waterproof?",
    a: "It is waterproof-sealed for incidental contact such as rain or washing hands. Remove pieces before swimming, as chlorine and salt water degrade any plated finish over time.",
  },
  {
    q: "What ring sizes do you make?",
    a: "US 5 (4.9 cm), US 6 (5.2 cm), US 7 (5.4 cm) and US 8 (5.7 cm) inner circumference. Message the atelier on WhatsApp if you are between sizes.",
  },
];

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
        title="Demi-Fine Jewellery Online India, Anti-Tarnish 18K Gold Finish"
        description="Shop demi-fine jewellery by Naira Flore: hand-set brilliant-cut zircone rings, earrings, bracelets and necklaces in an anti-tarnish 18K gold finish over a nickel-free base. Made in small batches in Nashik."
        canonical={`${SITE_URL}/jewellery`}
        image={jewellery[0]?.image}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Jewellery", url: `${SITE_URL}/jewellery` },
          ]),
          faqLd(hubFaqs),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Demi-Fine Jewellery, The Gilded Hour",
            url: `${SITE_URL}/jewellery`,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: jewellery.length,
              itemListElement: jewellery.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.name,
                url: `${SITE_URL}/jewellery/${p.handle}`,
              })),
            },
          },
        ]}
      />
      <div className="bg-[#FBF3EC] pt-[94px] text-[#1A1614] md:pt-[100px] lg:pt-[116px]">
        {/* hero, the clean scroll-turned solitaire */}
        <ZirconeTurn showViewAll={false} />

        {/* indexable header */}
        <header className="mx-auto max-w-6xl px-4 pb-2 pt-6 sm:px-6 md:pt-10">
          <p className="text-[10px] tracking-[0.4em] text-[#9A7634]" style={jost}>THE GILDED HOUR</p>
          <h1 className="mt-3 text-[30px] leading-[1.05] md:text-[48px]" style={velista}>
            Demi-Fine Jewellery
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-[1.8] text-[#1A1614]/60 md:text-[16px]" style={editorial}>
            Hand-set zircone in an 18K gold finish. Made to order in Nashik.
          </p>
        </header>

        {/* filter */}
        <div className="sticky top-[94px] z-20 bg-[#FBF3EC]/85 py-4 backdrop-blur md:top-[100px] md:py-5 lg:top-[116px]">
          <div className="mx-auto flex max-w-6xl flex-nowrap items-center justify-center gap-1 px-2 sm:gap-2 sm:px-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActive(f)}
                className={`shrink-0 border px-2 py-1.5 text-[8.5px] tracking-[0.15em] transition-colors duration-300 sm:px-5 sm:py-2.5 sm:text-[11px] sm:tracking-[0.3em] ${
                  active === f ? "border-[#1A1614] bg-[#1A1614] text-[#FBF3EC]" : "border-[#1A1614]/25 text-[#1A1614]/70 hover:border-[#1A1614]/60"
                }`}
                style={jost}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
        </div>



        {/* grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-24 pt-10 sm:gap-6 sm:px-6 lg:grid-cols-3 lg:gap-8">
          {pieces.map((piece, i) => (
            <JewelCard key={piece.handle} piece={piece} index={i} />
          ))}
        </div>




        {/* collections, internal linking (collapsed, still in the DOM for crawlers) */}
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <details className="group border-t border-[#1A1614]/10 pt-6">
            <summary className="cursor-pointer list-none text-[11px] tracking-[0.28em] text-[#1A1614]/55 transition-colors hover:text-[#1A1614]" style={jost}>
              SHOP BY COLLECTION
            </summary>
            <nav aria-label="Jewellery collections" className="mt-5 flex flex-wrap gap-2.5">
              {categoryLandings.map((c) => (
                <Link
                  key={c.slug}
                  to={`/jewellery/collections/${c.slug}`}
                  className="border border-[#1A1614]/20 px-3.5 py-2 text-[9.5px] tracking-[0.2em] text-[#1A1614]/60 transition-colors hover:border-[#1A1614] hover:text-[#1A1614]"
                  style={jost}
                >
                  {(c.crumb ?? c.category ?? c.h1).toUpperCase()}
                </Link>
              ))}
            </nav>
          </details>
        </section>

        {/* faq, collapsed by default so the page stays quiet */}
        <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <details className="border-t border-[#1A1614]/10 pt-6">
            <summary className="cursor-pointer list-none text-[11px] tracking-[0.28em] text-[#1A1614]/55 transition-colors hover:text-[#1A1614]" style={jost}>
              GOOD TO KNOW
            </summary>
            <dl className="mt-6 max-w-3xl space-y-6">
              {hubFaqs.map((f) => (
                <div key={f.q}>
                  <dt className="text-[14px] tracking-[0.04em] md:text-[16px]" style={jost}>{f.q}</dt>
                  <dd className="mt-2 text-[14px] leading-[1.85] text-[#1A1614]/65 md:text-[15px]" style={editorial}>{f.a}</dd>
                </div>
              ))}
            </dl>
          </details>
        </section>

        <Footer />
      </div>
    </>
  );
};

export default Jewellery;
