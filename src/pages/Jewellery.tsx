import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import JewelCard from "@/components/jewellery/JewelCard";
import ZirconeTurn from "@/components/jewellery/ZirconeTurn";
import RingAtelierBackdrop from "@/components/jewellery/RingAtelierBackdrop";
import JewelFilterBar, {
  applyJewelFilters,
  SORT_OPTIONS,
  type JewelFilters,
} from "@/components/jewellery/JewelFilterBar";
import { jewellery as staticJewellery, type JewelCategory } from "@/data/jewellery";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { allLandings as categoryLandings, SITE_URL } from "@/data/seoContent";
import { breadcrumbLd, faqLd } from "@/components/PageSEO";
import { Link, useSearchParams } from "react-router-dom";

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

/* NOTE, deliberate: --font-cormorant is defined nowhere, so the velista
   declaration is invalid at computed-value time and these headings inherit
   the app sans. That inherited look is the approved pixel output; do NOT
   swap it to var(--nf-font-display) without a reviewed visual pass.
   See docs/design-tokens.md, "The display-font landmine". */
const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "var(--nf-font-editorial)" } as const;
const jost = { fontFamily: "var(--nf-font-label)" } as const;

const filters: Array<"All" | JewelCategory> = ["All", "Rings", "Bracelets", "Earrings", "Necklaces"];

const Jewellery = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramCategory = searchParams.get("category");
  const initialCategory = (filters.find((f) => f.toLowerCase() === (paramCategory ?? "").toLowerCase()) ?? "All") as
    | "All"
    | JewelCategory;
  const [active, setActive] = useState<"All" | JewelCategory>(initialCategory);
  const gridRef = useRef<HTMLDivElement | null>(null);
  const didScrollToGrid = useRef(false);

  /* Deep links such as /jewellery?category=Rings (the home category cards)
     preselect the filter and drop the shopper straight onto the grid. */
  useEffect(() => {
    const match = filters.find((f) => f.toLowerCase() === (paramCategory ?? "").toLowerCase());
    if (match && match !== active) setActive(match);
    if (match && match !== "All" && !didScrollToGrid.current) {
      didScrollToGrid.current = true;
      window.setTimeout(() => gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 260);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramCategory]);

  const selectCategory = (next: "All" | JewelCategory) => {
    setActive(next);
    const params = new URLSearchParams(searchParams);
    if (next === "All") params.delete("category");
    else params.set("category", next);
    setSearchParams(params, { replace: true });
  };
  const { jewellery } = useLiveJewellery();

  /* Sort + filters live in the URL so a filtered edit is shareable, and are
     written with replace so the grid never jumps back to the top. */
  const activeFilters: JewelFilters = useMemo(() => {
    const sortParam = searchParams.get("sort");
    const max = searchParams.get("under");
    return {
      sort: (SORT_OPTIONS.find((o) => o.key === sortParam)?.key ?? "featured") as JewelFilters["sort"],
      maxPrice: max ? Number(max) : null,
      inStockOnly: searchParams.get("stock") === "in",
      tag: searchParams.get("tag"),
    };
  }, [searchParams]);

  const setFilters = (next: JewelFilters) => {
    const params = new URLSearchParams(searchParams);
    next.sort === "featured" ? params.delete("sort") : params.set("sort", next.sort);
    next.maxPrice == null ? params.delete("under") : params.set("under", String(next.maxPrice));
    next.inStockOnly ? params.set("stock", "in") : params.delete("stock");
    next.tag ? params.set("tag", next.tag) : params.delete("tag");
    setSearchParams(params, { replace: true });
  };

  const filterCounts = useMemo(
    () =>
      filters.reduce((acc, f) => {
        acc[f] = f === "All" ? jewellery.length : jewellery.filter((p) => p.category === f).length;
        return acc;
      }, {} as Record<"All" | JewelCategory, number>),
    [jewellery]
  );
  const inCategory = useMemo(
    () => (active === "All" ? jewellery : jewellery.filter((p) => p.category === active)),
    [active, jewellery]
  );
  const pieces = useMemo(() => applyJewelFilters(inCategory, activeFilters), [inCategory, activeFilters]);

  return (
    <>
      <PageSEO
        title="Demi-Fine Jewellery Online India, Anti-Tarnish 18K Gold Finish"
        description="Shop demi-fine jewellery by Naira Flore: brilliant-cut zircone rings, earrings, bracelets and necklaces in an anti-tarnish 18K gold finish over a nickel-free base. Made in small batches."
        canonical={`${SITE_URL}/jewellery`}
        image={staticJewellery[0]?.image}
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
      <div className="relative bg-nf-ivory pt-[94px] text-nf-ink md:pt-[100px] lg:pt-[116px]">
        {/* hero block — pressed-flower wash, 3D drift, touch blooms (hero + heading only) */}
        <div className="relative overflow-hidden bg-[#FBF3EC]">
          <div className="pointer-events-none absolute inset-0 z-0">
            <RingAtelierBackdrop variant="section" />
          </div>


          {/* hero, the clean scroll-turned solitaire */}
          <ZirconeTurn showViewAll={false} inheritBackdrop />

          {/* indexable header */}
          <header className="relative z-10 mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-6 md:pt-10">
            <p className="text-[10px] tracking-nf-40 text-nf-gold-shadow" style={jost}>THE GILDED HOUR</p>
            <h1 className="mt-3 text-[30px] leading-[1.05] md:text-[48px]" style={velista}>
              Demi-Fine Jewellery
            </h1>
            <p className="mt-3 max-w-xl text-[14px] leading-[1.8] text-nf-ink/60 md:text-[16px]" style={editorial}>
              Brilliant-cut zircone in an 18K gold finish.
            </p>
          </header>
        </div>

        {/* filter */}
        <div ref={gridRef} className="sticky top-[94px] z-20 bg-nf-ivory py-4 md:top-[100px] md:py-5 lg:top-[116px]">

          <div className="mx-auto flex max-w-6xl flex-nowrap items-center gap-2 overflow-x-auto scrollbar-hide px-4 sm:justify-center sm:overflow-visible sm:px-6">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => selectCategory(f)}
                aria-pressed={active === f}
                aria-label={`${f}, ${filterCounts[f]} ${filterCounts[f] === 1 ? "piece" : "pieces"}`}
                className={`press-scale shrink-0 inline-flex items-baseline gap-1.5 border px-4 min-h-[44px] text-[10px] tracking-nf-18 transition-colors duration-200 sm:px-5 sm:text-[11px] sm:tracking-nf-30 ${
                  active === f ? "border-nf-ink bg-nf-ink text-nf-ivory" : "border-nf-ink/25 text-nf-ink/70 hover:border-nf-ink/60"
                }`}
                style={jost}
              >
                <span className="self-center">{f.toUpperCase()}</span>
                <span
                  aria-hidden
                  className={`self-center text-[9px] tracking-nf-8 sm:text-[9.5px] ${active === f ? "text-nf-ivory/60" : "text-nf-ink/40"}`}
                >
                  {filterCounts[f]}
                </span>
              </button>
            ))}
          </div>
        </div>



        {/* grid */}
        {pieces.length === 0 ? (
          <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-24 pt-16 text-center">
            <h2 className="text-[26px] leading-[1.15] md:text-[32px]" style={velista}>
              Nothing in this edit yet
            </h2>
            <p className="mt-3 max-w-sm text-[14px] leading-[1.8] text-nf-ink/60" style={editorial}>
              New pieces join The Gilded Hour in small batches. The full collection is a step away.
            </p>
            <button
              onClick={() => selectCategory("All")}
              className="press-scale mt-7 border border-nf-ink px-7 min-h-[48px] text-[10.5px] tracking-nf-28 text-nf-ink transition-colors duration-200 hover:bg-nf-ink hover:text-nf-ivory"
              style={jost}
            >
              VIEW ALL PIECES
            </button>
          </div>
        ) : (
          <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 pb-24 pt-10 sm:gap-6 sm:px-6 lg:grid-cols-3 lg:gap-8">
            {pieces.map((piece, i) => (
              <JewelCard key={piece.handle} piece={piece} index={i} />
            ))}
          </div>
        )}




        {/* collections, internal linking (collapsed, still in the DOM for crawlers) */}
        <section className="mx-auto max-w-6xl px-4 pb-10 sm:px-6">
          <details className="group border-t border-nf-ink/10 pt-6">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-[11px] tracking-nf-28 text-nf-ink/55 transition-colors hover:text-nf-ink" style={jost}>
              SHOP BY COLLECTION
            </summary>
            <nav aria-label="Jewellery collections" className="mt-5 flex flex-wrap gap-2.5">
              {categoryLandings.map((c) => (
                <Link
                  key={c.slug}
                  to={`/jewellery/collections/${c.slug}`}
                  className="border border-nf-ink/20 px-3.5 py-2 text-[9.5px] tracking-nf-20 text-nf-ink/60 transition-colors hover:border-nf-ink hover:text-nf-ink"
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
          <details className="border-t border-nf-ink/10 pt-6">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center text-[11px] tracking-nf-28 text-nf-ink/55 transition-colors hover:text-nf-ink" style={jost}>
              GOOD TO KNOW
            </summary>
            <dl className="mt-6 max-w-3xl space-y-6">
              {hubFaqs.map((f) => (
                <div key={f.q}>
                  <dt className="text-[14px] tracking-nf-4 md:text-[16px]" style={jost}>{f.q}</dt>
                  <dd className="mt-2 text-[14px] leading-[1.85] text-nf-ink/65 md:text-[15px]" style={editorial}>{f.a}</dd>
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
