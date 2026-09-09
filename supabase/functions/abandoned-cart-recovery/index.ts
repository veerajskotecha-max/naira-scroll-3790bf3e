/**
 * Abandoned-cart recovery job.
 *
 * Can be run on a schedule (pg_cron) or invoked manually from the admin panel.
 * Finds checkout-started sessions older than 30 minutes with no recovery sent,
 * marks them as abandoned, and returns a WhatsApp deep link for each so the
 * team can follow up. If a WhatsApp provider API key is configured, it sends
 * automatically instead.
 */

import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const WHATSAPP_NUMBER = Deno.env.get("WHATSAPP_BUSINESS_NUMBER") ?? "919561557935";
const WHATSAPP_API_KEY = Deno.env.get("WHATSAPP_API_KEY");
const WHATSAPP_API_URL = Deno.env.get("WHATSAPP_API_URL");

function formatCurrency(amount: number, currency = "INR"): string {
  try {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function buildWhatsAppMessage(session: Record<string, unknown>): { phone: string; text: string } {
  const items = (session.items as Array<Record<string, unknown>>) ?? [];
  const total = Number(session.total ?? 0);
  const currency = String(session.currency ?? "INR");
  const checkoutUrl = String(session.checkout_url ?? "");
  const name = String(session.full_name ?? session.email ?? "there").split(" ")[0];

  const itemLines = items
    .map((item) => {
      const qty = Number(item.quantity ?? 1);
      const title = String(item.name ?? "A piece");
      return qty > 1 ? `${title} (x${qty})` : title;
    })
    .join(", ");

  const text =
    `Hi ${name}, you left something beautiful behind. ✨\n\n` +
    `Items: ${itemLines}\n` +
    `Total: ${formatCurrency(total, currency)}\n\n` +
    `Complete your order here:\n${checkoutUrl}\n\n` +
    `Need help? Reply to this message or WhatsApp us on +91 9561557935.`;

  return { phone: String(session.phone ?? ""), text };
}

async function sendViaProvider(phone: string, text: string): Promise<{ ok: boolean; error?: string }> {
  if (!WHATSAPP_API_KEY || !WHATSAPP_API_URL) {
    return { ok: false, error: "No WhatsApp provider configured" };
  }

  try {
    const res = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${WHATSAPP_API_KEY}`,
      },
      body: JSON.stringify({ to: phone.startsWith("+") ? phone : `+${phone}`, body: text }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { ok: false, error: `Provider returned ${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

    const { data: sessions, error } = await supabase
      .from("abandoned_cart_sessions")
      .select("*")
      .eq("status", "checkout_started")
      .is("recovery_sent_at", null)
      .is("completed_at", null)
      .lt("created_at", thirtyMinutesAgo)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) throw error;

    const results = [];
    const now = new Date().toISOString();

    for (const session of sessions ?? []) {
      const { phone, text } = buildWhatsAppMessage(session);
      const waLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

      let sendResult = { ok: false, error: "No phone number on session" };
      if (phone && /^\+?\d{10,15}$/.test(phone)) {
        sendResult = await sendViaProvider(phone, text);
      }

      await supabase
        .from("abandoned_cart_sessions")
        .update({
          status: "abandoned",
          recovery_sent_at: now,
          updated_at: now,
        })
        .eq("id", session.id);

      results.push({
        id: session.id,
        phone,
        sent: sendResult.ok,
        error: sendResult.error,
        whatsappLink: waLink,
      });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Abandoned cart recovery error:", error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}
