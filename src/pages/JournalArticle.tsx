import { Link, Navigate, useParams } from "react-router-dom";
import Footer from "@/components/Footer";
import PageSEO, { breadcrumbLd, faqLd } from "@/components/PageSEO";
import { articleBySlug, allArticles as journal, SITE_URL } from "@/data/seoContent";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

const JournalArticle = () => {
  const { slug } = useParams();
  const article = articleBySlug(slug);
  if (!article) return <Navigate to="/journal" replace />;

  const url = `${SITE_URL}/journal/${article.slug}`;
  const more = journal.filter((a) => a.slug !== article.slug).slice(0, 3);

  return (
    <>
      <PageSEO
        title={article.metaTitle}
        description={article.metaDescription}
        canonical={url}
        type="article"
        jsonLd={[
          breadcrumbLd([
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Journal", url: `${SITE_URL}/journal` },
            { name: article.title, url },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.metaDescription,
            datePublished: article.published,
            dateModified: article.published,
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: "Naira Flore" },
            publisher: { "@type": "Organization", name: "Naira Flore", url: SITE_URL },
          },
          ...(article.faqs ? [faqLd(article.faqs)] : []),
        ]}
      />

      <div className="bg-[#FBF3EC] pt-[94px] text-[#1A1614] md:pt-[100px] lg:pt-[116px]">
        <article className="mx-auto max-w-[760px] px-4 sm:px-6">
          <nav aria-label="Breadcrumb" className="pt-8 text-[10px] tracking-[0.24em] text-[#1A1614]/45" style={jost}>
            <Link to="/" className="hover:text-[#1A1614]">HOME</Link>
            <span className="px-2">/</span>
            <Link to="/journal" className="hover:text-[#1A1614]">JOURNAL</Link>
          </nav>

          <header className="border-b border-[#1A1614]/10 pb-8 pt-6">
            <p className="text-[10px] tracking-[0.24em] text-[#1A1614]/40" style={jost}>
              {new Date(article.published).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              <span className="px-2">·</span>
              {article.readTime}
            </p>
            <h1 className="mt-4 text-[30px] leading-[1.1] md:text-[46px]" style={velista}>{article.title}</h1>
            <p className="mt-5 text-[16px] leading-[1.85] text-[#1A1614]/75 md:text-[18px]" style={editorial}>{article.intro}</p>
          </header>

          <div className="py-10">
            {article.sections.map((s) => (
              <section key={s.h} className="mb-10">
                <h2 className="text-[22px] leading-[1.2] md:text-[30px]" style={velista}>{s.h}</h2>
                <div className="mt-4 space-y-4">
                  {s.p.map((p) => (
                    <p key={p} className="text-[15px] leading-[1.9] text-[#1A1614]/70 md:text-[16px]" style={editorial}>{p}</p>
                  ))}
                </div>
              </section>
            ))}

            {article.faqs && (
              <section className="border-t border-[#1A1614]/10 pt-10">
                <h2 className="text-[22px] md:text-[30px]" style={velista}>Frequently asked</h2>
                <dl className="mt-6 space-y-6">
                  {article.faqs.map((f) => (
                    <div key={f.q}>
                      <dt className="text-[15px] md:text-[16px]" style={jost}>{f.q}</dt>
                      <dd className="mt-2 text-[14px] leading-[1.85] text-[#1A1614]/65 md:text-[15px]" style={editorial}>{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <aside className="mt-12 border border-[#1A1614]/15 p-6 md:p-8">
              <p className="text-[10px] tracking-[0.32em] text-[#9A7634]" style={jost}>THE GILDED HOUR</p>
              <p className="mt-3 text-[16px] leading-[1.7] md:text-[18px]" style={editorial}>
                Hand-set zircone in an 18K gold finish, made to order at our Nashik atelier.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/jewellery/collections/rings" className="border border-[#1A1614] px-5 py-2.5 text-[10px] tracking-[0.24em]" style={jost}>SHOP RINGS</Link>
                <Link to="/jewellery" className="border border-[#1A1614]/25 px-5 py-2.5 text-[10px] tracking-[0.24em]" style={jost}>ALL JEWELLERY</Link>
              </div>
            </aside>

            <nav aria-label="More guides" className="mt-14 border-t border-[#1A1614]/10 pt-8">
              <h2 className="text-[10px] tracking-[0.32em] text-[#1A1614]/45" style={jost}>MORE FROM THE JOURNAL</h2>
              <ul className="mt-4 space-y-3">
                {more.map((a) => (
                  <li key={a.slug}>
                    <Link to={`/journal/${a.slug}`} className="text-[17px] leading-snug hover:opacity-70 md:text-[20px]" style={velista}>
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </article>
        <Footer />
      </div>
    </>
  );
};

export default JournalArticle;
