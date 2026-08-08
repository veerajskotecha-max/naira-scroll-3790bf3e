import { useEffect } from "react";

/* ───────────────────────────────────────────────────────────────
   JUDGE.ME REVIEWS (platform-independent widget)
   Renders real, order-verified product reviews once the Judge.me app
   is installed on the Shopify store and platform-independent widgets
   are enabled (Judge.me admin: Settings > Advanced).

   To activate:
   1. Install Judge.me (free plan) from the Shopify App Store.
   2. Judge.me admin > Settings > Advanced > enable platform-independent
      widgets, and copy the store-specific script URL it shows.
   3. Set VITE_JUDGEME_SCRIPT_URL to that URL and redeploy.
   Until then this component renders nothing and ProductDetail keeps
   showing the curated testimonials block.
   ─────────────────────────────────────────────────────────────── */

export const JUDGEME_SCRIPT_URL =
  (import.meta.env.VITE_JUDGEME_SCRIPT_URL ?? "").toString().trim();

export const judgeMeEnabled = JUDGEME_SCRIPT_URL.length > 0;

let scriptInjected = false;

const JudgeMeReviews = ({
  productId,
  productTitle,
}: {
  /** Shopify product id — accepts the raw gid (gid://shopify/Product/123) or the number */
  productId: string;
  productTitle: string;
}) => {
  useEffect(() => {
    if (!judgeMeEnabled || scriptInjected) return;
    const s = document.createElement("script");
    s.src = JUDGEME_SCRIPT_URL;
    s.async = true;
    document.head.appendChild(s);
    scriptInjected = true;
  }, []);

  if (!judgeMeEnabled) return null;

  const numericId = productId.replace(/^gid:\/\/shopify\/Product\//, "");

  return (
    <section id="reviews" className="max-w-[1200px] mx-auto px-4 pb-20 scroll-mt-24">
      <h2
        className="font-cormorant text-[28px] md:text-[32px] font-semibold"
        style={{ color: "hsl(var(--foreground))" }}
      >
        Customer Reviews
      </h2>
      {/* Judge.me hydrates this div; legacy widget is the one supported in
          platform-independent mode */}
      <div
        className="jdgm-widget jdgm-review-widget jdgm-outside-widget mt-6"
        data-id={numericId}
        data-product-title={productTitle}
      />
    </section>
  );
};

export default JudgeMeReviews;
