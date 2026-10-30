import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import ComingSoon from "@/pages/ComingSoon";
import PageSEO from "@/components/PageSEO";
import { shopifyForwardTarget } from "@/lib/shopifyForward";
import { reportShopperPerformance } from "@/lib/shopperPerformance";

/**
 * The unmatched-route handler.
 *
 * Almost everything that lands here is genuinely missing and gets the Coming
 * Soon page as before. The exception is Shopify's own customer pages — order
 * status above all — which arrive on this domain because it is the store's
 * primary one. Those are forwarded to Shopify, query string and all (the
 * `key` on an order link is what proves the customer may see it).
 */
const CatchAll = () => {
  const { pathname, search } = useLocation();
  const target = shopifyForwardTarget(pathname, search);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!target) reportShopperPerformance("unknown_page");
  }, [target, pathname]);

  useEffect(() => {
    if (!target) return;
    // replace, not assign: Back must not return to a URL that only bounces again.
    window.location.replace(target);
    const t = window.setTimeout(() => setSlow(true), 3000);
    return () => window.clearTimeout(t);
  }, [target]);

  if (!target) return <ComingSoon />;

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[var(--nf-surface)] px-6 text-center">
      {/* The host answers every address with the homepage's file, canonical and
          "index" included; like Coming Soon, this state must replace them. */}
      <PageSEO title="Opening your order" description="Taking you to your Naira Flore order." noindex />
      <p className="font-cormorant text-[24px] text-[var(--nf-text)]">Opening your order…</p>
      {slow && (
        <a
          href={target}
          className="mt-5 inline-flex min-h-[48px] items-center bg-[var(--nf-accent-strong)] px-8 text-[12px] uppercase tracking-[var(--nf-track-16)] text-[var(--nf-text-inverse)]"
        >
          View your order
        </a>
      )}
    </main>
  );
};

export default CatchAll;
