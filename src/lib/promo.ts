/* Welcome-offer promo code handling.
   The code is captured through the welcome popup and auto-applied to the
   Shopify checkout URL via the ?discount= parameter. */

export const WELCOME_PROMO_CODE = "NAIRA10";
export const WELCOME_PROMO_LABEL = "10% off your first order";

/** Codes the cart promo field accepts; Shopify still applies the real discount. */
export const ACCEPTED_PROMO_CODES = [WELCOME_PROMO_CODE, "FRIENDSANDFAMILY"];

const CODE_KEY = "naira-promo-code";
const SEEN_KEY = "naira-promo-popup-seen";
const LEAD_KEY = "naira-promo-lead";

export const PROMO_EVENT = "naira-promo-changed";

const emit = () => {
  try {
    window.dispatchEvent(new CustomEvent(PROMO_EVENT));
  } catch {
    /* noop */
  }
};

export const getPromoCode = (): string | null => {
  try {
    return localStorage.getItem(CODE_KEY);
  } catch {
    return null;
  }
};

export const setPromoCode = (code: string) => {
  try {
    localStorage.setItem(CODE_KEY, code.trim().toUpperCase());
  } catch {
    /* noop */
  }
  emit();
};

export const clearPromoCode = () => {
  try {
    localStorage.removeItem(CODE_KEY);
  } catch {
    /* noop */
  }
  emit();
};

export const hasSeenPromoPopup = (): boolean => {
  try {
    return localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    return true;
  }
};

export const markPromoPopupSeen = () => {
  try {
    localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* noop */
  }
};

export const savePromoLead = (lead: { channel: "email" | "whatsapp"; value: string }) => {
  try {
    localStorage.setItem(LEAD_KEY, JSON.stringify({ ...lead, at: new Date().toISOString() }));
  } catch {
    /* noop */
  }
};

/** Appends the stored discount code to a Shopify checkout URL. */
export const applyPromoToCheckoutUrl = (url: string): string => {
  const code = getPromoCode();
  if (!code) return url;
  try {
    const next = new URL(url);
    next.searchParams.set("discount", code);
    return next.toString();
  } catch {
    return url;
  }
};
