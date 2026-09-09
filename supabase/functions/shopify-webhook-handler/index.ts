/**
 * Shopify webhook receiver.
 *
 * Listens for `orders/create` and `orders/paid` events, then marks any matching
 * abandoned-cart session or member order as completed so recovery messages stop.
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const WEBHOOK_SECRET = Deno.env.get("SHOPIFY_WEBHOOK_SECRET") ?? "";

async function verifyShopifyHmac(req: Request): Promise<boolean> {
  if (!WEBHOOK_SECRET) return true; // Not configured yet; accept for setup.
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  if (!hmacHeader) return false;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const body = await req.clone().text();
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(body));
  const computed = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return computed === hmacHeader;
}

function extractTokenFromCheckoutUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/checkouts\/cn\/([^/]+)/);
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

function extractCartTokenFromOrder(order: Record<string, unknown>): string | null {
  const cartToken = order.cart_token;
  if (typeof cartToken === "string" && cartToken) return cartToken;

  const note = String(order.note ?? "");
  const match = note.match(/cart_token[:=]\s*([a-zA-Z0-9_-]+)/i);
  return match?.[1] ?? null;
}

async function markCompleted(checkoutToken?: string | null, cartToken?: string | null, email?: string | null) {
  const now = new Date().toISOString();

  // Match by checkout token first (most reliable).
  if (checkoutToken) {
    await supabase
      .from("abandoned_cart_sessions")
      .update({ status: "ordered", completed_at: now, updated_at: now })
      .eq("checkout_token", checkoutToken);

    await supabase
      .from("member_orders")
      .update({ status: "ordered", completed_at: now, updated_at: now })
      .eq("checkout_token", checkoutToken);
  }

  // Fallback to cart token.
  if (cartToken) {
    await supabase
      .from("abandoned_cart_sessions")
      .update({ status: "ordered", completed_at: now, updated_at: now })
      .eq("cart_id", cartToken);

    await supabase
      .from("member_orders")
      .update({ status: "ordered", completed_at: now, updated_at: now })
      .eq("cart_id", cartToken);
  }

  // Fallback to email for signed-in users.
  if (email) {
    await supabase
      .from("abandoned_cart_sessions")
      .update({ status: "ordered", completed_at: now, updated_at: now })
      .eq("email", email)
      .is("completed_at", null);

    await supabase
      .from("member_orders")
      .update({ status: "ordered", completed_at: now, updated_at: now })
      .eq("email", email)
      .is("completed_at", null);
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const topic = req.headers.get("x-shopify-topic") ?? "";
  if (!["orders/create", "orders/paid"].includes(topic)) {
    return new Response(JSON.stringify({ received: true, ignored: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!(await verifyShopifyHmac(req))) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const order = (await req.json()) as Record<string, unknown>;
    const checkoutToken = extractTokenFromCheckoutUrl(order.checkout_url as string | null | undefined);
    const cartToken = extractCartTokenFromOrder(order);
    const email = (order.contact_email as string) || (order.email as string) || null;

    await markCompleted(checkoutToken, cartToken, email);

    return new Response(JSON.stringify({ received: true, matched: { checkoutToken, cartToken } }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
