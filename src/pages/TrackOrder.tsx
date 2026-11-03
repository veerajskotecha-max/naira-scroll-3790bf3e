import { useState } from "react";
import Footer from "@/components/Footer";
import PageSEO, { breadcrumbLd } from "@/components/PageSEO";
import { SITE_URL } from "@/data/siteMeta";
import { WHATSAPP_NUMBER } from "@/data/jewellery";
import { SHOPIFY_STORE_PERMANENT_DOMAIN } from "@/lib/shopify";

const velista = { fontFamily: "var(--font-cormorant), 'Velista', Georgia, serif" } as const;
const editorial = { fontFamily: "var(--nf-font-editorial)" } as const;
const jost = { fontFamily: "var(--nf-font-label)" } as const;

/** Shopify's customer sign-in: an emailed one-time code, then the shopper's orders. */
export const ORDER_LOOKUP_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/account/login`;

/**
 * Order tracking. Orders live in Shopify, and its customer account is the
 * only place a shopper can look one up without us: there is no public lookup
 * by order number and email, and Shiprocket's tracking page needs the AWB the
 * dispatch email already links. So the page offers what really works —
 * sign in to see your orders, or send us the order number on WhatsApp.
 *
 * It used to ask for an order number and email and then ignore both,
 * opening the same sign-in page even with the form empty.
 */
const TrackOrder = () => {
  const [orderNo, setOrderNo] = useState("");

  const whatsapp = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore, could you share the status of my order${orderNo ? ` ${orderNo}` : ""}?`
  )}`;

  return (
    <>
      <PageSEO
        title="Track Your Order | Naira Flore"
        description="Track a Naira Flore order. Sign in with the email you used at checkout to see its status, or message the atelier on WhatsApp for an update."
        canonical={`${SITE_URL}/track-order`}
        jsonLd={[
          breadcrumbLd([
            { name: "Home", url: `${SITE_URL}/` },
            { name: "Track Order", url: `${SITE_URL}/track-order` },
          ]),
        ]}
      />
      <div className="bg-nf-ivory pt-[107px] text-nf-ink md:pt-[114px] lg:pt-[132px]">
        <div className="mx-auto max-w-[760px] px-5 pb-20 pt-10 sm:px-6 md:pt-14">
          <p className="text-[10px] tracking-nf-40 text-nf-gold-shadow" style={jost}>
            ORDER SUPPORT
          </p>
          <h1 className="mt-3 text-[32px] leading-[1.05] md:text-[46px]" style={velista}>
            Track your order
          </h1>
          <p className="mt-4 text-[14px] leading-[1.85] text-nf-ink/65 md:text-[15.5px]" style={editorial}>
            Every dispatch confirmation carries a tracking link. To see an order&apos;s status here, sign in with the
            email you used at checkout, or message us your order number and we will check it for you.
          </p>

          <div className="mt-8 space-y-4 border border-nf-ink/12 p-6">
            <p className="text-[14px] leading-[1.8] text-nf-ink/70" style={editorial}>
              We email you a one-time code; your orders and their status are listed once you are in.
            </p>
            <a
              href={ORDER_LOOKUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="press-scale flex min-h-[48px] w-full items-center justify-center border border-nf-ink bg-nf-ink px-6 text-[10.5px] tracking-nf-28 text-nf-ivory transition-opacity hover:opacity-90"
              style={jost}
            >
              FIND MY ORDER
            </a>
            <p className="text-[12px] leading-[1.7] text-nf-ink/50" style={editorial}>
              Order status is served securely by our checkout provider, so this opens in a new tab.
            </p>
          </div>

          <div className="mt-8 border border-nf-ink/12 p-6">
            <h2 className="text-[20px] leading-tight md:text-[24px]" style={velista}>
              Prefer to ask us?
            </h2>
            <p className="mt-2 text-[14px] leading-[1.8] text-nf-ink/60" style={editorial}>
              Send your order number on WhatsApp and we will reply with the current status.
            </p>
            {/* The one place the order number is used: it goes into the message. */}
            <label className="mt-5 block">
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
