import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import PageSEO, { breadcrumbLd } from "@/components/PageSEO";
import { allArticles as journal, SITE_URL } from "@/data/seoContent";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const Journal = () => (
  <>
    <PageSEO
      title="The Journal — Jewellery Care, Sizing & Styling Guides"
      description="Practical guides from the Naira Flore atelier: ring sizing for India, caring for gold plated jewellery, zirconia versus diamond, and styling Indo-Western outfits."
      canonical={`${SITE_URL}/journal`}
      jsonLd={[
        breadcrumbLd([
          { name: "Home", url: `${SITE_URL}/` },
          { name: "Journal", url: `${SITE_URL}/journal` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "The Naira Flore Journal",
          url: `${SITE_URL}/journal`,
          blogPost: journal.map((a) => ({
            "@type": "BlogPosting",
            headline: a.title,
            datePublished: a.published,
            url: `${SITE_URL}/journal/${a.slug}`,
          })),
        },
      ]}
    />

    <div className="bg-[#FBF3EC] pt-[94px] text-[#1A1614] md:pt-[100px] lg:pt-[116px]">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <header className="border-b border-[#1A1614]/10 py-12 md:py-16">
          <p className="text-[10px] tracking-[0.4em] text-[#9A7634]" style={jost}>NAIRA FLORE · THE JOURNAL</p>
          <h1 className="mt-4 text-[34px] leading-[1.05] md:text-[54px]" style={velista}>
            Guides from the atelier
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-[1.85] text-[#1A1614]/70 md:text-[17px]" style={editorial}>
            How to size a ring at home, how to keep a gold finish from failing, what zirconia actually
            is, and how to put an Indo-Western look together. Written by the people who make the pieces.
          </p>
        </header>

        <ul className="divide-y divide-[#1A1614]/10 pb-20">
          {journal.map((a) => (
            <li key={a.slug} className="py-8 md:py-10">
              <article>
                <p className="text-[10px] tracking-[0.24em] text-[#1A1614]/40" style={jost}>
                  {new Date(a.published).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  <span className="px-2">·</span>
                  {a.readTime}
                </p>
                <h2 className="mt-3 text-[24px] leading-[1.2] md:text-[32px]" style={velista}>
                  <Link to={`/journal/${a.slug}`} className="transition-opacity hover:opacity-70">{a.title}</Link>
                </h2>
                <p className="mt-3 text-[15px] leading-[1.8] text-[#1A1614]/65" style={editorial}>{a.excerpt}</p>
                <Link
                  to={`/journal/${a.slug}`}
                  className="mt-4 inline-block border-b border-[#1A1614]/40 pb-1 text-[10px] tracking-[0.24em] text-[#1A1614]/70 hover:border-[#1A1614] hover:text-[#1A1614]"
                  style={jost}
                >
                  READ THE GUIDE
                </Link>
              </article>
            </li>
          ))}
        </ul>
      </div>
      <Footer />
    </div>
  </>
);

export default Journal;
