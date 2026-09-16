/*
  Shiprocket Fastrr one-click checkout (headless hand-off).

  Fastrr replaces the page the shopper pays on: instead of sending the bag to
  Shopify's own checkout, we hand the same lines to Fastrr, which pre-fills the
  address, offers COD/UPI, and writes the finished order back into Shopify.
  Shopify still owns products, stock and orders.

  Everything here is best-effort. If the script is blocked, slow, or returns
  nothing usable, the caller keeps the existing Shopify checkout URL — a
  checkout button must never be able to dead-end on a third-party script.
*/
import type { CartItem } from "@/contexts/CartContext";
import { shopifyNumericId, CURRENCY } from "@/lib/pixel";
import { getFbBrowserId, getFbClickId, getVisitorId } from "@/lib/visitorId";

const SCRIPT_SRC = "https://fastrr-boost-ui.pickrr.com/assets/js/channels/mobileApp.js";
const SCRIPT_TIMEOUT_MS = 6000;

/* Fastrr is the live checkout. Set VITE_CHECKOUT_PROVIDER=shopify to roll back
   to Shopify's own checkout page without a code change. */
export const CHECKOUT_PROVIDER =
  ((import.meta.env.VITE_CHECKOUT_PROVIDER ?? "") as string).toString().trim().toLowerCase() || "fastrr";

export const isFastrrEnabled = () => CHECKOUT_PROVIDER === "fastrr";

/* The Shopify permanent domain Fastrr is registered against — not the customer
   facing domain. */
export const FASTRR_DOMAIN =
  ((import.meta.env.VITE_FASTRR_DOMAIN ?? "") as string).toString().trim() || "nc5eti-gp.myshopify.com";

/*
  Fastrr's documented example sends `price: 50000` for a ₹500 item, i.e. the
  smallest currency unit. We store rupees. Getting this wrong is a 100x error on
  every order, so the multiplier is a single named constant that can be flipped
  to 1 the moment Shiprocket confirms the unit in writing.
*/
export const FASTRR_PRICE_MULTIPLIER = Number(import.meta.env.VITE_FASTRR_PRICE_MULTIPLIER ?? 100) || 100;

/* Key names are dictated by Fastrr's script: it reads item.id -> productId and
   item.variant_id -> variantId. Camel-cased keys are silently dropped. */
export interface FastrrItem {
  id: string;
  variant_id: string;
  quantity: number;
  title: string;
  price: number;
  image: string;
}

type FastrrPayload = {
  items: FastrrItem[];
  /* Shopify permanent domain -> sellerDomain */
  domain: string;
  /* Storefront origin -> domain */
  webUrl?: string;
  couponCode?: string;
  cartAttributes?: Record<string, string>;
  /* Base64-encodes cartAttributes; without it the object stringifies to
     "[object Object]" in the URL. */
  encodingRequired?: boolean;
};

declare global {
  interface Window {
    getOneClickCheckoutUrl?: (payload: FastrrPayload) => string | undefined;
  }
}

let scriptPromise: Promise<boolean> | null = null;

const loadFastrrScript = (): Promise<boolean> => {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.resolve(false);
  if (typeof window.getOneClickCheckoutUrl === "function") return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<boolean>((resolve) => {
    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      /* Allow a later checkout attempt to retry a failed load. */
      if (!ok) scriptPromise = null;
      resolve(ok);
    };

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
    const script = existing ?? document.createElement("script");
    script.addEventListener("load", () => finish(typeof window.getOneClickCheckoutUrl === "function"));
    script.addEventListener("error", () => finish(false));

    if (!existing) {
      script.src = SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    /* Never hold the shopper behind a stalled third-party script. */
    window.setTimeout(() => finish(typeof window.getOneClickCheckoutUrl === "function"), SCRIPT_TIMEOUT_MS);
  });

  return scriptPromise;
};

/** Pre-warm the script so the checkout tap itself stays instant. */
export const primeFastrr = () => {
  if (!isFastrrEnabled()) return;
  void loadFastrrScript();
};

export const toFastrrItems = (items: CartItem[]): FastrrItem[] =>
  items
    .map((item) => {
      const variantId = shopifyNumericId(item.variantId) ?? item.variantId;
      if (!variantId) return null;
      return {
        id: shopifyNumericId(item.id) ?? variantId,
        variant_id: variantId,
        quantity: item.quantity,
        title: item.variantTitle || item.size ? `${item.name} — ${item.variantTitle ?? item.size}` : item.name,
        price: Math.round(item.price * FASTRR_PRICE_MULTIPLIER),
        image: item.image,
      } satisfies FastrrItem;
    })
    .filter((item): item is FastrrItem => item !== null);

/* UTM values from the current URL, forwarded verbatim so Shopify's order sees
   the same campaign our own analytics recorded. */
export const currentUtmParams = (search = typeof window === "undefined" ? "" : window.location.search): string => {
  const params = new URLSearchParams(search);
  const pairs: string[] = [];
  for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    const value = params.get(key);
    if (value) pairs.push(`${key}=${encodeURIComponent(value)}`);
  }
  return pairs.join("&");
};

/* Opaque ids only — same values we already attach to the Shopify cart, so a
   Fastrr order can be joined back to the browsing session. No personal data. */
export const fastrrCartAttributes = (): Record<string, string> => {
  const attrs: Record<string, string> = {};
  const vid = getVisitorId();
  if (vid) attrs.naira_visitor_id = vid;
  const fbc = getFbClickId();
  if (fbc) attrs.fbc = fbc;
  const fbp = getFbBrowserId();
  if (fbp) attrs.fbp = fbp;
  attrs.currency = CURRENCY;
  return attrs;
};

/**
 * Builds the Fastrr checkout URL for the given bag.
 * Returns null on any failure so the caller can fall back to Shopify checkout.
 */
export const getFastrrCheckoutUrl = async (
  items: CartItem[],
  options: { couponCode?: string | null } = {}
): Promise<string | null> => {
  if (!isFastrrEnabled()) return null;
  const lines = toFastrrItems(items);
  if (!lines.length) return null;

  try {
    const ready = await loadFastrrScript();
    if (!ready || typeof window.getOneClickCheckoutUrl !== "function") return null;

    const utmParams = currentUtmParams();
    const payload: FastrrPayload = {
      items: lines,
      domain: FASTRR_DOMAIN,
      cartAttributes: fastrrCartAttributes(),
      ...(options.couponCode ? { couponCode: options.couponCode } : {}),
      ...(utmParams ? { utmParams } : {}),
    };

    const url = window.getOneClickCheckoutUrl(payload);
    return typeof url === "string" && url.startsWith("http") ? url : null;
  } catch (error) {
    console.error("Fastrr checkout URL could not be built", error);
    return null;
  }
};
