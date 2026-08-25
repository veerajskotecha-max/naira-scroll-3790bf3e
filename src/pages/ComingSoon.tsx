import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Home, ShoppingBag } from "lucide-react";
import PageSEO from "@/components/PageSEO";
import Footer from "@/components/Footer";

/* Coming Soon — the catch-all page.
   Replaces the old hard 404: any unknown or retired URL now lands on a
   quiet brand page that reads as "in the making" rather than "broken",
   with clear routes back into the collection. Kept noindex so search
   engines never index a placeholder. */

const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

interface ComingSoonProps {
  /** Overrides for pages that render this inline (e.g. a retired product). */
  eyebrow?: string;
  heading?: string;
  body?: string;
  /** Where the primary CTA points. Defaults to the jewellery listing. */
  primaryTo?: string;
  primaryLabel?: string;
}

const ComingSoon = ({
  eyebrow = "In the making",
  heading = "Coming soon",
  body = "This page is being finished in the atelier. In the meantime, the full collection is live and shipping in 3–5 working days.",
  primaryTo = "/jewellery",
  primaryLabel = "Explore the collection",
}: ComingSoonProps) => {
  const { pathname } = useLocation();

  useEffect(() => {
    document.title = "Coming Soon | Naira Flore";
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-[#FBF3EC] text-[#1A1614]">
      <PageSEO title="Coming Soon" description="This page is on its way. Explore the live Naira Flore collection in the meantime." noindex />

      <main className="flex flex-1 items-center justify-center px-6 pb-24 pt-32">
        <div className="w-full max-w-[560px] animate-fade-in text-center">
          <p className="text-[10px] tracking-[0.45em] text-[#B0843A]" style={jost}>
            {eyebrow.toUpperCase()}
          </p>

          <h1 className="font-cormorant mt-4 text-[clamp(2.2rem,7vw,3.4rem)] font-normal leading-[1.05]">
            {heading}
          </h1>

          <div className="my-7 flex items-center justify-center gap-3">
            <span className="block h-px w-14 bg-[#1A1614]/15" />
            <span className="text-[13px] italic text-[#B0843A]" style={editorial}>✦</span>
            <span className="block h-px w-14 bg-[#1A1614]/15" />
          </div>

          <p className="mx-auto max-w-[420px] text-[15px] leading-relaxed text-[#1A1614]/65" style={editorial}>
            {body}
          </p>

          <div className="mt-9 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
            <Link
              to={primaryTo}
              className="inline-flex items-center justify-center gap-2 bg-[#1A1614] px-8 py-3.5 text-[11px] tracking-[0.22em] text-[#FBF3EC] transition-colors duration-300 hover:bg-[#B0843A]"
              style={jost}
            >
              {primaryLabel.toUpperCase()}
              <ArrowRight size={13} />
            </Link>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center gap-2 border border-[#1A1614]/25 px-8 py-3.5 text-[11px] tracking-[0.22em] text-[#1A1614] transition-colors duration-300 hover:border-[#1A1614] hover:bg-[#1A1614] hover:text-[#FBF3EC]"
              style={jost}
            >
              <ShoppingBag size={13} />
              SHOP ALL
            </Link>
          </div>

          <Link
            to="/"
            className="mt-7 inline-flex items-center gap-1.5 text-[13px] italic text-[#1A1614]/55 underline underline-offset-4 transition-opacity duration-200 hover:opacity-70"
            style={editorial}
          >
            <Home size={13} />
            Back to home
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComingSoon;
