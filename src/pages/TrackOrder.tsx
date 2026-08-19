import { useState } from "react";
import Footer from "@/components/Footer";
import PageSEO, { breadcrumbLd } from "@/components/PageSEO";
import { SITE_URL } from "@/data/siteMeta";
import { WHATSAPP_NUMBER } from "@/data/jewellery";
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "var(--nf-font-editorial)" } as const;
const jost = { fontFamily: "var(--nf-font-label)" } as const;

/**
 * Order tracking. Orders live in Shopify, and its hosted order-status page is
 * the only authoritative source, so this page hands the shopper straight to
 * their Shopify order lookup or to the atelier on WhatsApp.
 */
const TrackOrder = () => {
  const [orderNo, setOrderNo] = useState("");
  const [email, setEmail] = useState("");

  const lookup = (e: React.FormEvent) => {
    e.preventDefault();
    window.open(`https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/account/login`, "_blank", "noopener");
  };

  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore, could you share the status of my order${orderNo ? ` ${orderNo}` : ""}?`
  )}`;

  return (
    <>
      <PageSEO
        title="Track Your Order | Naira Flore"
        description="Track a Naira Flore order. Look up your order status with your order number and email, or message the atelier on WhatsApp for an update."
        canonical={`${SITE_URL}/track-order`}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Track Order", url: `${SITE_URL}/track-order` },
          ]),
        ]}
      />
      <div className="bg-nf-ivory pt-[94px] text-nf-ink md:pt-[100px] lg:pt-[116px]">
        <div className="mx-auto max-w-[760px] px-5 pb-20 pt-10 sm:px-6 md:pt-14">
          <p className="text-[10px] tracking-nf-40 text-nf-gold-shadow" style={jost}>
            ORDER SUPPORT
          </p>
          <h1 className="mt-3 text-[32px] leading-[1.05] md:text-[46px]" style={velista}>
            Track your order
          </h1>
          <p className="mt-4 text-[14px] leading-[1.85] text-nf-ink/65 md:text-[15.5px]" style={editorial}>
            Every dispatch confirmation carries a tracking link. Enter your order number below to open your order status,
            or message us and we will check it for you.
          </p>

          <form onSubmit={lookup} className="mt-8 space-y-4 border border-nf-ink/12 p-6">
            <label className="block">
              <span className="text-[9.5px] tracking-nf-24 text-nf-ink/50" style={jost}>
                ORDER NUMBER
              </span>
              <input
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="#1024"
                className="mt-2 min-h-[46px] w-full border border-nf-ink/20 bg-transparent px-3 text-[14px] focus:border-nf-ink focus:outline-none"
              />
            </label>
            <label className="block">
              <span className="text-[9.5px] tracking-nf-24 text-nf-ink/50" style={jost}>
                EMAIL USED AT CHECKOUT
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="mt-2 min-h-[46px] w-full border border-nf-ink/20 bg-transparent px-3 text-[14px] focus:border-nf-ink focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="press-scale min-h-[48px] w-full border border-nf-ink bg-nf-ink px-6 text-[10.5px] tracking-nf-28 text-nf-ivory transition-opacity hover:opacity-90"
              style={jost}
            >
              OPEN ORDER STATUS
            </button>
            <p className="text-[12px] leading-[1.7] text-nf-ink/50" style={editorial}>
              Order status is served securely by our checkout provider, so this opens in a new tab.
            </p>
          </form>

          <div className="mt-8 border border-nf-ink/12 p-6">
            <h2 className="text-[20px] leading-tight md:text-[24px]" style={velista}>
              Prefer to ask us?
            </h2>
            <p className="mt-2 text-[14px] leading-[1.8] text-nf-ink/60" style={editorial}>
              Send your order number on WhatsApp and we will reply with the current status.
            </p>
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="press-scale mt-5 inline-flex min-h-[46px] items-center border border-nf-ink px-6 text-[10.5px] tracking-nf-26 text-nf-ink transition-colors hover:bg-nf-ink hover:text-nf-ivory"
              style={jost}
            >
              MESSAGE THE ATELIER
            </a>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default TrackOrder;
