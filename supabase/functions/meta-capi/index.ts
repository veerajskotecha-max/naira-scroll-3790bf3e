/**
 * Meta Conversions API relay.
 *
 * The browser pixel is dropped by ad blockers and iOS often enough that Meta
 * sees product views and add-to-carts with almost no customer detail attached.
 * This function sends the same events server-side, carrying what the browser
 * cannot: the shopper's network address, device string, country and the page
 * they were on. Both copies share `event_id`, so Meta counts them once.
 *
 * It never receives a raw email: the browser hashes it before sending.
 */
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const PIXEL_ID = "1232524215695667";
const GRAPH = `https://graph.facebook.com/v21.0/${PIXEL_ID}/events`;

const sha256Hex = async (value: string) => {
  const bytes = new TextEncoder().encode(value.trim().toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const hex64 = z.string().regex(/^[a-f0-9]{64}$/);

const BodySchema = z.object({
  event_name: z.string().min(1).max(60),
  event_id: z.string().min(1).max(120),
  event_source_url: z.string().url().max(2000).optional(),
  custom_data: z.record(z.unknown()).optional(),
  user_data: z
    .object({
      external_id: z.string().max(200).optional(),
      fbc: z.string().max(400).optional(),
      fbp: z.string().max(400).optional(),
      em: hex64.optional(),
    })
    .optional(),
  test_event_code: z.string().max(60).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const token = Deno.env.get("META_CAPI_ACCESS_TOKEN");
  if (!token) {
    // Not configured yet — never surface an error to the shop.
    return new Response(JSON.stringify({ skipped: "not_configured" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }

  const parsed = BodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
  const body = parsed.data;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("cf-connecting-ip") ||
    undefined;
  const country = req.headers.get("cf-ipcountry")?.toLowerCase();

  const user_data: Record<string, unknown> = {
    client_user_agent: req.headers.get("user-agent") ?? undefined,
    client_ip_address: ip,
    external_id: body.user_data?.external_id ? [await sha256Hex(body.user_data.external_id)] : undefined,
    fbc: body.user_data?.fbc,
    fbp: body.user_data?.fbp,
    em: body.user_data?.em ? [body.user_data.em] : undefined,
    country: country && country !== "xx" ? [await sha256Hex(country)] : undefined,
  };
  for (const key of Object.keys(user_data)) if (user_data[key] === undefined) delete user_data[key];

  const payload = {
    data: [
      {
        event_name: body.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: body.event_id,
        event_source_url: body.event_source_url,
        action_source: "website",
        user_data,
        custom_data: body.custom_data ?? {},
      },
    ],
    ...(body.test_event_code ? { test_event_code: body.test_event_code } : {}),
  };

  try {
    const res = await fetch(`${GRAPH}?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await res.json().catch(() => ({}));
    if (!res.ok) console.error("meta-capi rejected", res.status, JSON.stringify(result));
    return new Response(JSON.stringify({ ok: res.ok, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("meta-capi failed", err);
    return new Response(JSON.stringify({ ok: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});
