import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";

const Path = z.string().max(300).regex(/^\/[a-zA-Z0-9/_-]*$/).refine(p => !/^\/(?:admin|auth|account|cart|checkouts|\.lovable|\d{6,})(?:\/|$)/.test(p));
const milliseconds = z.number().int().min(0).max(120000).nullable().optional();
const Event = z.object({
  id: z.string().uuid(), path: Path, landing_path: Path,
  device: z.enum(["mobile", "desktop"]), navigation: z.enum(["document", "client"]),
  campaign: z.string().max(100).regex(/^[a-zA-Z0-9 _.-]*$/),
  source: z.string().max(60).regex(/^[a-zA-Z0-9 _.-]*$/),
  kind: z.enum(["timing", "missing_product", "unknown_page", "product_load_error", "route_timeout"]),
  ready_ms: milliseconds, load_ms: milliseconds, lcp_ms: milliseconds,
}).strict().refine(e => e.kind !== "timing" || typeof e.ready_ms === "number");

Deno.serve(async req => {
  const reply = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json", "Cache-Control": "no-store" } });
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = Deno.env.get("SUPABASE_URL");
  const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) return reply({ error: "Unavailable" }, 503);
  const db = createClient(url, key);
  try {
    if (req.method === "GET") {
      const token = req.headers.get("Authorization")?.replace(/^Bearer /i, "");
      if (!token) return reply({ error: "Sign in required" }, 401);
      const { data: auth, error: authError } = await db.auth.getUser(token);
      if (authError || !auth.user) return reply({ error: "Sign in required" }, 401);
      const { data: role } = await db.from("user_roles").select("id").eq("user_id", auth.user.id).eq("role", "admin").maybeSingle();
      if (!role) return reply({ error: "Admin access required" }, 403);
      const days = z.coerce.number().int().min(1).max(30).safeParse(new URL(req.url).searchParams.get("days") ?? 7);
      if (!days.success) return reply({ error: "Invalid time range" }, 400);
      const { data, error } = await db.rpc("shopper_performance_report", { days: days.data });
      return error ? reply({ error: "Report unavailable" }, 500) : reply(data);
    }
    if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
    // Public, anonymous measurements are diagnostic signals, not verified sales analytics.
    if (!["https://nairaflore.com", "https://www.nairaflore.com"].includes(req.headers.get("origin") ?? "")) return reply({ error: "Origin not allowed" }, 403);
    const raw = await req.text();
    if (raw.length > 2048) return reply({ error: "Event too large" }, 413);
    const parsed = Event.safeParse(JSON.parse(raw));
    if (!parsed.success) return reply({ error: "Invalid event" }, 400);
    const { error } = await db.from("shopper_performance_events").upsert(parsed.data, { onConflict: "id", ignoreDuplicates: true });
    if (error) return reply({ error: "Event unavailable" }, 500);
    await db.from("shopper_performance_events").delete().lt("created_at", new Date(Date.now() - 30 * 86400000).toISOString());
    return reply({ accepted: true });
  } catch { return reply({ error: "Invalid request" }, 400); }
});