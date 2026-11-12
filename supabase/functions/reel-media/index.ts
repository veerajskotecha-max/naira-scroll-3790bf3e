/**
 * Signs reel media for shoppers. Storage holds no public read rule, so a file
 * is reachable only through a short-lived link minted here, and only for the
 * video or cover of a reel that is published.
 */
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SIGN_TTL = 60 * 60 * 6;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  try {
    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: rows, error } = await admin
      .from("reels")
      .select("video_path,poster_path")
      .eq("published", true)
      .limit(100);
    if (error) throw error;
    const paths = Array.from(
      new Set((rows ?? []).flatMap((r) => [r.video_path, r.poster_path]).filter((p): p is string => !!p)),
    );
    if (!paths.length) return json({ urls: {} });
    const { data, error: signError } = await admin.storage.from("reels").createSignedUrls(paths, SIGN_TTL);
    if (signError) throw signError;
    const urls: Record<string, string> = {};
    data?.forEach((row) => {
      if (row.path && row.signedUrl) urls[row.path] = row.signedUrl;
    });
    return json({ urls });
  } catch (e) {
    console.error("reel-media", e);
    return json({ error: "Could not load reel media" }, 500);
  }
});
