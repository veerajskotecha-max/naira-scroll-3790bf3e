import { Link, useParams, Navigate } from "react-router-dom";
import Footer from "@/components/Footer";
import PageSEO, { breadcrumbLd, faqLd } from "@/components/PageSEO";
import JewelCard from "@/components/jewellery/JewelCard";
import { jewellery } from "@/data/jewellery";
import { categoryBySlug, categoryLandings, SITE_URL } from "@/data/seoContent";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const JewelleryCategory = () => {
  const { slug } = useParams();
  const landing = categoryBySlug(slug);

  if (!landing) return <Navigate to="/jewellery" replace />;

  const label = landing.crumb ?? landing.category ?? "Collection";
  const pieces = landing.category
    ? jewellery.filter((p) => p.category === landing.category)
    : jewellery;
  const url = `${SITE_URL}/jewellery/collections/${landing.slug}`;

  return (
    <>
      <PageSEO
        title={landing.metaTitle}
        description={landing.metaDescription}
        canonical={url}
        image={pieces[0]?.image}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Jewellery", url: `${SITE_URL}/jewellery` },
            { name: label, url },
          ]),
          faqLd(landing.faqs),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: landing.h1,
            description: landing.metaDescription,
            url,
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: pieces.length,
              itemListElement: pieces.map((p, i) => ({
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* breadcrumb */}
          <nav aria-label="Breadcrumb" className="pt-8 text-[10px] tracking-[0.24em] text-[#1A1614]/45" style={jost}>
            <Link to="/" className="hover:text-[#1A1614]">HOME</Link>
            <span className="px-2">/</span>
            <Link to="/jewellery" className="hover:text-[#1A1614]">JEWELLERY</Link>
            <span className="px-2">/</span>
            <span className="text-[#1A1614]/80">{label.toUpperCase()}</span>
          </nav>

          {/* header */}
          <header className="border-b border-[#1A1614]/10 pb-10 pt-8">
            <p className="text-[10px] tracking-[0.4em] text-[#9A7634]" style={jost}>{landing.kicker}</p>
            <h1 className="mt-4 text-[34px] leading-[1.05] md:text-[54px]" style={velista}>{landing.h1}</h1>
            <div className="mt-6 max-w-3xl space-y-4">
              {landing.intro.map((p) => (
                <p key={p} className="text-[15px] leading-[1.85] text-[#1A1614]/70 md:text-[17px]" style={editorial}>{p}</p>
              ))}
            </div>
          </header>

          {/* grid */}
          <section aria-label={`${label} collection`} className="grid grid-cols-2 gap-4 pt-10 sm:gap-6 lg:grid-cols-3 lg:gap-8">
            {pieces.map((piece, i) => (
              <JewelCard key={piece.handle} piece={piece} index={i} />
            ))}
          </section>

          {/* why */}
          <section className="grid gap-8 border-t border-[#1A1614]/10 py-14 md:grid-cols-3 md:py-20">
            {landing.bullets.map((b) => (
              <div key={b.title}>
                <h2 className="text-[20px] md:text-[24px]" style={velista}>{b.title}</h2>
                <p className="mt-3 text-[14px] leading-[1.8] text-[#1A1614]/65 md:text-[15px]" style={editorial}>{b.body}</p>
              </div>
            ))}
          </section>

          {/* faq */}
          <section className="border-t border-[#1A1614]/10 py-14 md:py-20">
            <h2 className="text-[26px] md:text-[36px]" style={velista}>
              {label} — questions we get asked
            </h2>
            <dl className="mt-8 max-w-3xl space-y-7">
              {landing.faqs.map((f) => (
                <div key={f.q}>
                  <dt className="text-[15px] tracking-[0.04em] md:text-[17px]" style={jost}>{f.q}</dt>
                  <dd className="mt-2 text-[14px] leading-[1.85] text-[#1A1614]/65 md:text-[15px]" style={editorial}>{f.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* sibling links — internal linking for crawl depth */}
          <nav aria-label="Other jewellery collections" className="flex flex-wrap gap-3 border-t border-[#1A1614]/10 py-10">
            {categoryLandings
              .filter((c) => c.slug !== landing.slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  to={`/jewellery/collections/${c.slug}`}
                  className="border border-[#1A1614]/25 px-4 py-2.5 text-[10px] tracking-[0.24em] text-[#1A1614]/70 transition-colors hover:border-[#1A1614] hover:text-[#1A1614]"
                  style={jost}
                >
                  {c.h1.toUpperCase()}
                </Link>
              ))}
            <Link
              to="/jewellery"
              className="border border-[#1A1614]/25 px-4 py-2.5 text-[10px] tracking-[0.24em] text-[#1A1614]/70 transition-colors hover:border-[#1A1614] hover:text-[#1A1614]"
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
