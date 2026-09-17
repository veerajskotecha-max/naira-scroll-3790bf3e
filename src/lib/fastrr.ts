/*
  Shiprocket Fastrr one-click checkout — "Custom frontend + Shopify backend"
  integration, exactly as documented by Shiprocket:

    <input type="hidden" value="<seller-domain>" id="sellerDomain"/>
    <script src=".../channels/shopify.js" defer></script>
    <link rel="stylesheet" href=".../styles/shopify.css">

    shiprocketCheckoutEvents.buyDirect({ type, products, couponCode,
                                         utmParams, cartAttributes })

  Note what this flow does NOT send: prices. Fastrr resolves the line items from
  Shopify by variant id, so Shopify remains the single source of truth for
  price, stock and discounts (the earlier mobile-app script needed a price and
  carried a 100x unit risk — that is gone).

  Everything here is best-effort. If the script is blocked, slow, or the
  checkout is reported down, the caller keeps the existing Shopify checkout URL
  — a checkout button must never dead-end on a third-party script.
*/
import type { CartItem } from "@/contexts/CartContext";
import { shopifyNumericId, CURRENCY } from "@/lib/pixel";
import { getFbBrowserId, getFbClickId, getVisitorId } from "@/lib/visitorId";

const SCRIPT_SRC = "https://fastrr-boost-ui.pickrr.com/assets/js/channels/shopify.js";
const STYLE_HREF = "https://fastrr-boost-ui.pickrr.com/assets/styles/shopify.css";
const SCRIPT_TIMEOUT_MS = 6000;

/* Set VITE_CHECKOUT_PROVIDER=shopify to fall back to Shopify's own checkout. */
export const CHECKOUT_PROVIDER =
  ((import.meta.env.VITE_CHECKOUT_PROVIDER ?? "") as string).toString().trim().toLowerCase() || "fastrr";

export const isFastrrEnabled = () => CHECKOUT_PROVIDER === "fastrr";

/* Merchant-facing co-branding is a separate switch from the integration.
   Keep it off until Shiprocket activation is confirmed end to end; the checkout
   can currently fall back to Shopify, where a Fastrr promise would be untrue. */
export const isFastrrBrandingEnabled = () =>
  isFastrrEnabled() &&
  ((import.meta.env.VITE_FASTRR_BRANDING_ENABLED ?? "") as string).toString().trim().toLowerCase() === "true";

/*
  The domain Fastrr has our configuration saved against.

  This is NOT the Shopify permanent domain, which is the intuitive guess and is
  what this used to send. Fastrr's seller lookup is keyed on the storefront
  domain, and querying their own seller-config API settles it:

    nc5eti-gp.myshopify.com   402  "Seller not found or inactive"
    nairaflore.com            201  active
    www.nairaflore.com        402
    payments.nairaflore.com   402

  With the wrong value their script still loads and the checkout UI still
  mounts — it then fails seller lookup, reports
  NATIVE_REDIRECT_THRESHOLD_BREACHED and redirects to the fallback, so the
  symptom is a silent bounce to Shopify checkout rather than an error. Note it
  is the apex domain: the www host is a separate, inactive record.
*/
export const FASTRR_DOMAIN =
  ((import.meta.env.VITE_FASTRR_DOMAIN ?? "") as string).toString().trim() || "nairaflore.com";

export interface FastrrProduct {
  variantId: string;
  quantity: number;
}

type BuyDirectPayload = {
  type: "cart" | "product";
  products: FastrrProduct[];
  couponCode?: string;
  utmParams?: string;
  cartAttributes?: Record<string, string>;
  /* Undocumented but read by their script: where to send the shopper if
     initiation fails. We pass Shopify's checkout URL. */
  fallbackUrl?: string;
};

declare global {
  interface Window {
    shiprocketCheckoutEvents?: {
      buyDirect?: (payload: BuyDirectPayload) => void;
    };
  }
}

let scriptPromise: Promise<boolean> | null = null;

/* The script reads the seller domain from a hidden input in the document, so it
   must exist before the script runs. */
const ensureSellerDomainInput = () => {
  if (typeof document === "undefined") return;
  let input = document.getElementById("sellerDomain") as HTMLInputElement | null;
  if (!input) {
    input = document.createElement("input");
    input.type = "hidden";
    input.id = "sellerDomain";
    document.body.appendChild(input);
  }
  input.value = FASTRR_DOMAIN;
};

const ensureStylesheet = () => {
  if (typeof document === "undefined") return;
  if (document.querySelector(`link[href="${STYLE_HREF}"]`)) return;
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = STYLE_HREF;
  document.head.appendChild(link);
};

const isReady = () => typeof window !== "undefined" && typeof window.shiprocketCheckoutEvents?.buyDirect === "function";

const loadFastrrScript = (): Promise<boolean> => {
  if (typeof window === "undefined" || typeof document === "undefined") return Promise.resolve(false);
  if (isReady()) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  ensureSellerDomainInput();
  ensureStylesheet();

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
    script.addEventListener("load", () => finish(isReady()));
    script.addEventListener("error", () => finish(false));

    if (!existing) {
      script.src = SCRIPT_SRC;
      script.defer = true;
      document.head.appendChild(script);
    }

    /* Never hold the shopper behind a stalled third-party script. */
    window.setTimeout(() => finish(isReady()), SCRIPT_TIMEOUT_MS);
  });

  return scriptPromise;
};

/** Pre-warm the script so the checkout tap itself stays instant. */
export const primeFastrr = () => {
  if (!isFastrrEnabled()) return;
  void loadFastrrScript();
};

export const toFastrrProducts = (items: CartItem[]): FastrrProduct[] =>
  items
    .map((item) => {
      const variantId = shopifyNumericId(item.variantId) ?? item.variantId;
      if (!variantId) return null;
      return { variantId: String(variantId), quantity: item.quantity } satisfies FastrrProduct;
    })
    .filter((product): product is FastrrProduct => product !== null);

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
 * Opens Fastrr's checkout for the given bag.
 * Returns false on any failure so the caller can fall back to Shopify checkout.
 */
export const startFastrrCheckout = async (
  items: CartItem[],
  options: { couponCode?: string | null; fallbackUrl?: string } = {}
): Promise<boolean> => {
  if (!isFastrrEnabled()) return false;
  const products = toFastrrProducts(items);
  if (!products.length) return false;

  try {
    const ready = await loadFastrrScript();
    if (!ready || typeof window.shiprocketCheckoutEvents?.buyDirect !== "function") return false;

    ensureSellerDomainInput();

    const utmParams = currentUtmParams();
    const payload: BuyDirectPayload = {
      type: "cart",
      products,
      cartAttributes: fastrrCartAttributes(),
      ...(utmParams ? { utmParams } : {}),
      ...(options.couponCode ? { couponCode: options.couponCode } : {}),
      ...(options.fallbackUrl ? { fallbackUrl: options.fallbackUrl } : {}),
    };

    window.shiprocketCheckoutEvents.buyDirect(payload);
    return true;
  } catch (error) {
    console.error("Fastrr checkout could not be started", error);
    return false;
  }
};
