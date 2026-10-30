import { useEffect, useMemo } from "react";
import { reportShopperPerformance } from "@/lib/shopperPerformance";
import { Link, useParams, Navigate, useLocation } from "react-router-dom";
import Footer from "@/components/Footer";
import PageSEO, { breadcrumbLd, faqLd } from "@/components/PageSEO";
import JewelCard from "@/components/jewellery/JewelCard";
import Reveal from "@/components/wow/Reveal";
import RingAtelierBackdrop from "@/components/jewellery/RingAtelierBackdrop";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { cardKey, colourCards } from "@/lib/colourCards";
import { categoryBySlug, allLandings, categoryLandings as coreCategories, SITE_URL } from "@/data/seoContent";
import { WHATSAPP_NUMBER, type JewelPiece } from "@/data/jewellery";
import { collectionPieces, stockedLandings } from "@/lib/jewelleryCollections";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

/* Hero pieces for the paid-traffic landing: whatever the ad shows must be the
   first thing on the page. Matched on the live Shopify title, with the bundled
   handle as a fallback if the title is ever renamed. */
const PINNED: { match: string[]; handle: string }[] = [
  { match: ["prism riv", "prism"], handle: "prism-riviere-bracelet" },
  { match: ["heartbead", "heart bead"], handle: "cuban-pearl-bracelet" },
];

const pinRank = (p: JewelPiece) => {
  const name = p.name.toLowerCase();
  const i = PINNED.findIndex((x) => x.handle === p.handle || x.match.some((m) => name.includes(m)));
  return i === -1 ? PINNED.length : i;
};

/* Pinned first, then everything in stock, then sold-out pieces last so an ad
   click never opens on something that can't be bought today. */
const orderForLanding = (pieces: JewelPiece[]) =>
  [...pieces].sort((a, b) => {
    const soldA = a.availableForSale === false ? 1 : 0;
    const soldB = b.availableForSale === false ? 1 : 0;
    if (soldA !== soldB) return soldA - soldB;
    return pinRank(a) - pinRank(b);
  });

const PROOF = ["Anti-tarnish 18K finish", "7-day returns", "Insured delivery in 3–5 days"];

const JewelleryCategory = () => {
  const { slug } = useParams();
  const { search } = useLocation();
  const landing = categoryBySlug(slug);
  const { jewellery, isLive, isLoading } = useLiveJewellery();
  const [visibleCount, setVisibleCount] = useState(30);
  useEffect(() => setVisibleCount(30), [slug]);
  useEffect(() => {
    if (!landing) reportShopperPerformance("unknown_page");
  }, [landing, slug]);

  const label = landing?.crumb ?? landing?.category ?? "Collection";
  const inCategory = useMemo(
    () => landing ? collectionPieces(colourCards(jewellery), landing) : [],
    [jewellery, landing]
  );
  /* Each metal or stone of a piece is its own card (see colourCards). */
  const pieces = useMemo(() => orderForLanding(inCategory), [inCategory]);
  /* The count and the structured data name each product once, whatever its colours. */
  const products = useMemo(() => pieces.filter((p, i) => pieces.findIndex((q) => q.handle === p.handle) === i), [pieces]);
  const fromPrice = useMemo(
    () => (pieces.length ? Math.min(...pieces.map((p) => p.price)) : 0),
    [pieces]
  );
  /* Judged only once Shopify has answered: the bundled first paint knows 21
     pieces, and Charm Bracelets, Solitaire Rings and Rose Gold hold none of
     them. A landing Shopify leaves empty (Evil Eye) is a soft 404 whose copy
     describes pieces the shop does not have, so it says so, points to the
     whole collection and asks not to be indexed (see stockedLandings). */
  const empty = isLive && pieces.length === 0;
  const linked = useMemo(() => (isLive ? stockedLandings(jewellery, allLandings) : allLandings), [isLive, jewellery]);
  const linkedSlugs = useMemo(() => new Set(linked.map((c) => c.slug)), [linked]);

  /* Any other Shopify collection (sets, shop-all…) lands on the listing; the
     ad's ?fbclid=/utm_* go with it, or the pixel never sees the click. */
  if (!landing) return <Navigate to={{ pathname: "/jewellery", search }} replace />;

  const url = `${SITE_URL}/jewellery/collections/${landing.slug}`;
  /* A landing that repeats a broader landing's grid names that one, so
     search keeps one page per set of pieces (see canonicalSlug). */
  const canonical = landing.canonicalSlug ? `${SITE_URL}/jewellery/collections/${landing.canonicalSlug}` : url;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore, could you help me pick the right size in ${label.toLowerCase()}?`
  )}`;

  return (
    <>
      <PageSEO
        title={landing.metaTitle}
        description={empty ? `Nothing in ${landing.h1} right now. Browse the full Naira Petite demi-fine jewellery collection.` : landing.metaDescription}
        canonical={canonical}
        image={pieces[0]?.image}
        noindex={empty}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Jewellery", url: `${SITE_URL}/jewellery` },
            { name: label, url },
          ]),
          ...(empty ? [] : [faqLd(landing.faqs), {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: landing.h1,
            description: landing.metaDescription,
            url,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: products.length,
              itemListElement: products.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                name: p.name,
                url: `${SITE_URL}/jewellery/${p.handle}`,
              })),
            },
          }]),
        ]}
      />

      <div className="bg-[#FBF3EC] pt-[107px] text-[#1A1614] md:pt-[114px] lg:pt-[132px]">
        {/* hero — pressed-flower wash, one-line promise, straight into the grid */}
        <div className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 z-0">
            <RingAtelierBackdrop variant="section" />
          </div>
          <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
            <nav aria-label="Breadcrumb" className="flex items-center pt-3 text-[10px] tracking-[0.24em] text-[#1A1614]/45" style={jost}>
              <Link to="/" className="inline-flex min-h-[44px] items-center hover:text-[#1A1614]">HOME</Link>
              <span className="px-2">/</span>
              <Link to="/jewellery" className="inline-flex min-h-[44px] items-center hover:text-[#1A1614]">JEWELLERY</Link>
              <span className="px-2">/</span>
              <span className="text-[#1A1614]/80">{label.toUpperCase()}</span>
            </nav>

            <header className="pb-7 pt-6 md:pb-9 md:pt-8">
              <p className="text-[10px] tracking-[0.4em] text-[#9A7634]" style={jost}>{landing.kicker}</p>
              <h1 className="mt-3 text-[32px] leading-[1.04] md:text-[54px]" style={velista}>{landing.h1}</h1>
              {/* On a phone the opening copy and the proof chips pushed the
                  first product a full screen down; both stay for wider
                  screens and for crawlers, hidden only on mobile. */}
              {!empty && (
                <p className="mt-4 hidden max-w-xl text-[15px] leading-[1.7] text-[#1A1614]/70 sm:block md:text-[18px]" style={editorial}>
                  {landing.lead ?? landing.intro[0]}
                </p>
              )}

              {pieces.length > 0 && (
                <p className="mt-3 text-[10px] tracking-[0.24em] text-[#1A1614]/50" style={jost}>
                  {products.length} {products.length === 1 ? "PIECE" : "PIECES"}
                  {fromPrice ? ` · FROM ₹${fromPrice.toLocaleString("en-IN")}` : ""}
                </p>
              )}

              <ul className="mt-5 hidden flex-wrap gap-2 sm:flex">
                {PROOF.map((p) => (
                  <li
                    key={p}
                    className="border border-[#C99A4C]/35 bg-white/45 px-3 py-1.5 text-[9.5px] tracking-[0.18em] text-[#1A1614]/70 backdrop-blur-[2px]"
                    style={jost}
                  >
                    {p.toUpperCase()}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[10px] tracking-[0.18em] text-[#1A1614]/55 sm:hidden" style={jost}>
                ANTI-TARNISH 18K · 7-DAY RETURNS · INSURED DELIVERY
              </p>
            </header>
          </div>

        </div>

        {/* category bar — swipeable on mobile, lets ad traffic hop collections */}
        <nav
          aria-label="Shop jewellery by category"
          className="sticky top-[105px] z-20 border-y border-[#1A1614]/10 bg-[#FBF3EC]/95 backdrop-blur-sm md:top-[112px] lg:top-[130px]"
        >
          <div className="mx-auto flex max-w-6xl items-stretch gap-2 overflow-x-auto px-4 py-3 [-ms-overflow-style:none] [scrollbar-width:none] sm:px-6 sm:py-3.5 [&::-webkit-scrollbar]:hidden">
            {[
              { label: "SHOP ALL", to: "/jewellery", active: false },
              ...coreCategories.filter((c) => c.slug === landing.slug || linkedSlugs.has(c.slug)).map((c) => ({
                label: (c.crumb ?? c.category ?? c.h1).toUpperCase(),
                to: `/jewellery/collections/${c.slug}`,
                active: c.slug === landing.slug,
              })),
            ].map((c) =>
              c.active ? (
                <span
                  key={c.label}
                  aria-current="page"
                  className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap border border-[#1A1614] bg-[#1A1614] px-4 text-[10px] tracking-[0.22em] text-[#FBF3EC]"
                  style={jost}
                >
                  {c.label}
                </span>
              ) : (
                <Link
                  key={c.label}
                  to={c.to}
                  className="inline-flex min-h-[44px] shrink-0 items-center whitespace-nowrap border border-[#1A1614]/25 px-4 text-[10px] tracking-[0.22em] text-[#1A1614]/70 transition-colors hover:border-[#1A1614] hover:text-[#1A1614]"
                  style={jost}
                >
                  {c.label}
                </Link>
              )
            )}
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* grid — hero pieces first, sold out last */}
          <section
            aria-label={`${label} collection`}
            className="grid grid-cols-2 gap-4 pt-6 sm:gap-6 sm:pt-8 lg:grid-cols-3 lg:gap-8"
          >
            {pieces.slice(0, visibleCount).map((piece, i) => (
              <Reveal key={cardKey(piece)} delay={Math.min(i, 5) * 60}>
                <JewelCard piece={piece} index={i} />
              </Reveal>
            ))}
          </section>
          {pieces.length === 0 && !isLoading && (
            <div data-empty-collection className="py-12 text-center">
              <p className="text-nf-ink/65">Nothing in this collection right now. New pieces join Naira Petite regularly.</p>
              <Button asChild variant="outline" className="mt-5"><Link to="/jewellery">View all jewellery</Link></Button>
            </div>
          )}
          {visibleCount < pieces.length && (
            <div className="flex justify-center pt-8">
              <Button variant="outline" onClick={() => setVisibleCount((count) => count + 30)}>Show more ({pieces.length - visibleCount})</Button>
            </div>
          )}

          {/* An empty landing keeps none of the copy written for its pieces. */}
          {!empty && (
            <>
              {/* sizing help, right under the grid where the doubt appears */}
              <Reveal as="section" className="mt-12 border border-[#C99A4C]/30 bg-white/50 px-6 py-8 text-center md:mt-16">
                <h2 className="text-[22px] md:text-[28px]" style={velista}>Not sure of your size?</h2>
                <p className="mx-auto mt-2 max-w-md text-[14px] leading-[1.8] text-[#1A1614]/65 md:text-[15px]" style={editorial}>
                  Tell us your measurement on WhatsApp and we will help you get the fit right.
                </p>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex min-h-[46px] items-center border border-[#1A1614] px-7 text-[10px] tracking-[0.26em] text-[#1A1614] transition-colors hover:bg-[#1A1614] hover:text-[#FBF3EC]"
                  style={jost}
                >
                  ASK THE ATELIER
                </a>
              </Reveal>

              {/* the longer story, moved below the grid */}
              <section className="border-t border-[#1A1614]/10 pt-12 md:pt-16">
                <div className="max-w-3xl space-y-4">
                  {landing.intro.map((p) => (
                    <p key={p} className="text-[15px] leading-[1.85] text-[#1A1614]/70 md:text-[17px]" style={editorial}>{p}</p>
                  ))}
                </div>
              </section>

              {/* why */}
              <section className="grid gap-8 py-14 md:grid-cols-3 md:py-20">
                {landing.bullets.map((b, i) => (
                  <Reveal key={b.title} delay={i * 80}>
                    <span aria-hidden className="text-[24px] leading-none text-[#C99A4C]/50" style={velista}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-3 text-[20px] md:text-[24px]" style={velista}>{b.title}</h2>
                    <span aria-hidden className="mt-3 block h-px w-8 bg-[#C99A4C]/60" />
                    <p className="mt-3 text-[14px] leading-[1.8] text-[#1A1614]/65 md:text-[15px]" style={editorial}>{b.body}</p>
                  </Reveal>
                ))}
              </section>

              {/* faq */}
              <Reveal as="section" className="border-t border-[#1A1614]/10 py-14 md:py-20">
                <h2 className="text-[26px] md:text-[36px]" style={velista}>
                  Questions we get asked
                </h2>
                <dl className="mt-8 max-w-3xl space-y-7">
                  {landing.faqs.map((f) => (
                    <div key={f.q} className="border-l border-[#C99A4C]/30 pl-4 transition-colors duration-300 hover:border-[#C99A4C]">
                      <dt className="text-[15px] tracking-[0.04em] md:text-[17px]" style={jost}>{f.q}</dt>
                      <dd className="mt-2 text-[14px] leading-[1.85] text-[#1A1614]/65 md:text-[15px]" style={editorial}>{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            </>
          )}

          {/* sibling links, internal linking for crawl depth */}
          <nav aria-label="Other jewellery collections" className="flex flex-wrap gap-3 border-t border-[#1A1614]/10 py-10">
            {linked
              .filter((c) => c.slug !== landing.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/jewellery/collections/${c.slug}`}
                  className="inline-flex min-h-[44px] items-center border border-[#1A1614]/25 px-4 text-[10px] tracking-[0.24em] text-[#1A1614]/70 transition-colors hover:border-[#1A1614] hover:text-[#1A1614]"
                  style={jost}
                >
                  {(c.crumb ?? c.category ?? c.h1).toUpperCase()}
                </Link>
              ))}
            <Link
              to="/jewellery"
              className="inline-flex min-h-[44px] items-center border border-[#1A1614]/25 px-4 text-[10px] tracking-[0.24em] text-[#1A1614]/70 transition-colors hover:border-[#1A1614] hover:text-[#1A1614]"
              style={jost}
            >
              ALL JEWELLERY
            </Link>
          </nav>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default JewelleryCategory;
