import { Link } from "react-router-dom";
import Footer from "@/components/Footer";
import PageSEO, { breadcrumbLd } from "@/components/PageSEO";
import Reveal from "@/components/wow/Reveal";
import { allArticles as journal, SITE_URL } from "@/data/seoContent";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const Journal = () => (
  <>
    <PageSEO
      title="The Journal, Jewellery Care, Sizing & Styling Guides"
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
        <Reveal as="header" className="relative border-b border-[#1A1614]/10 py-12 md:py-16">
          {/* quiet blush wash behind the masthead */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-10 left-1/2 h-[280px] w-[130%] -translate-x-1/2 [background:radial-gradient(52%_60%_at_50%_30%,rgba(255,224,205,0.5)_0%,transparent_70%)]"
          />
          <p className="relative text-[10px] tracking-[0.4em] text-[#9A7634]" style={jost}>
            NAIRA FLORE · THE JOURNAL
          </p>
          <h1 className="relative mt-4 text-[34px] leading-[1.05] md:text-[54px]" style={velista}>
            Guides from the atelier
          </h1>
          <p className="relative mt-5 max-w-2xl text-[15px] leading-[1.85] text-[#1A1614]/70 md:text-[17px]" style={editorial}>
            How to size a ring at home, how to keep a gold finish from failing, what zirconia actually
            is, and how to put an Indo-Western look together. Written by the people who make the pieces.
          </p>
          <span aria-hidden className="journal-rule relative mt-8 block h-px w-full origin-left bg-gradient-to-r from-[#C99A4C] via-[#C99A4C]/40 to-transparent" />
          <style>{`
            @keyframes journal-rule-grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
            .journal-rule { animation: journal-rule-grow 1.1s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
            @media (prefers-reduced-motion: reduce) { .journal-rule { animation: none; } }
          `}</style>
        </Reveal>

        <ul className="divide-y divide-[#1A1614]/10 pb-20">
          {journal.map((a, i) => (
            <Reveal as="li" key={a.slug} delay={Math.min(i, 4) * 90}>
              <article className="group relative py-8 md:py-10">
                <Link
                  to={`/journal/${a.slug}`}
                  className="grid gap-x-8 gap-y-3 md:grid-cols-[64px_1fr_auto] md:items-baseline"
                >
                  {/* engraved index number */}
                  <span
                    aria-hidden
                    className="hidden text-[26px] leading-none text-[#C99A4C]/45 transition-colors duration-500 group-hover:text-[#C99A4C] md:block"
                    style={velista}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span className="block">
                    <span className="block text-[10px] tracking-[0.24em] text-[#1A1614]/40" style={jost}>
                      {new Date(a.published).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      <span className="px-2">·</span>
                      {a.readTime}
                    </span>
                    <span
                      className="mt-3 block text-[24px] leading-[1.2] transition-opacity duration-300 group-hover:opacity-70 md:text-[32px]"
                      style={velista}
                    >
                      {a.title}
                    </span>
                    <span className="mt-3 block text-[15px] leading-[1.8] text-[#1A1614]/65" style={editorial}>
                      {a.excerpt}
                    </span>
                    <span
                      className="mt-4 inline-block border-b border-[#1A1614]/40 pb-1 text-[10px] tracking-[0.24em] text-[#1A1614]/70 transition-colors duration-300 group-hover:border-[#1A1614] group-hover:text-[#1A1614]"
                      style={jost}
                    >
                      READ THE GUIDE
                    </span>
                  </span>

                  {/* drifting arrow */}
                  <span
                    aria-hidden
                    className="hidden self-center text-[20px] text-[#C99A4C]/0 transition-all duration-500 group-hover:translate-x-1 group-hover:text-[#C99A4C] md:block"
                  >
                    →
                  </span>
                </Link>
              </article>
            </Reveal>
          ))}
        </ul>
      </div>
      <Footer />
    </div>
  </>
);

export default Journal;
