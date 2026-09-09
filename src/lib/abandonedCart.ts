/**
 * Abandoned-checkout tracking helpers.
 *
 * Captures checkout intent in Supabase so we can identify carts that were
 * started but never completed, then follow up with recovery messages.
 */

import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/contexts/CartContext";

export type AbandonedCartPayload = {
  cartId?: string | null;
  checkoutUrl?: string | null;
  items: CartItem[];
  userId?: string | null;
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  source?: string;
  utmParams?: Record<string, string>;
  sessionFingerprint?: string;
};

function getUtmParams(): Record<string, string> {
  const params: Record<string, string> = {};
  try {
    const search = new URLSearchParams(window.location.search);
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
      const value = search.get(key);
      if (value) params[key] = value;
    });
  } catch {
    /* ignore */
  }
  return params;
}

function fingerprintSession(): string {
  try {
    const raw = navigator.userAgent + (navigator.language || "") + (screen.width ?? 0) + (screen.height ?? 0);
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  } catch {
    return "unknown";
  }
}

/**
 * Records a checkout-start event in the database. Non-blocking: checkout must
 * never fail because of a tracking write.
 */
export async function captureCheckoutStart(payload: AbandonedCartPayload): Promise<void> {
  try {
    const items = payload.items.map((item) => ({
      id: item.id,
      name: item.name,
      variantId: item.variantId,
      variantTitle: item.variantTitle,
      price: item.price,
      quantity: item.quantity,
      size: item.size,
      image: item.image,
    }));

    const total = items.reduce((sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 1), 0);

    await supabase.from("abandoned_cart_sessions").insert({
      cart_id: payload.cartId ?? null,
      checkout_token: payload.checkoutUrl ? extractCheckoutToken(payload.checkoutUrl) : null,
      checkout_url: payload.checkoutUrl ?? null,
      user_id: payload.userId ?? null,
      email: payload.email?.trim() || null,
      phone: payload.phone?.trim() || null,
      full_name: payload.fullName?.trim() || null,
      items,
      item_count: items.reduce((sum, item) => sum + (item.quantity ?? 1), 0),
      total,
      currency: items[0]?.price ? "INR" : "INR",
      status: "checkout_started",
      source: payload.source?.trim() || "website",
      utm_params: { ...getUtmParams(), ...(payload.utmParams || {}) },
      session_fingerprint: payload.sessionFingerprint || fingerprintSession(),
    });
  } catch (error) {
    console.error("Failed to capture checkout start:", error);
  }
}

function extractCheckoutToken(url: string): string | null {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/checkouts\/cn\/([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

/**
 * Marks an abandoned cart session as recovered/completed when we learn that
 * the shopper finished checkout.
 */
export async function markCheckoutCompleted(checkoutToken: string): Promise<void> {
  try {
    await supabase
      .from("abandoned_cart_sessions")
      .update({
        status: "ordered",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("checkout_token", checkoutToken);
  } catch (error) {
    console.error("Failed to mark checkout completed:", error);
  }
}
