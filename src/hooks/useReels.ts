import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReelProduct {
  id: string;
  handle: string;
  title: string;
  price_label: string | null;
  image_url: string | null;
  variant_id: string | null;
  position: number;
}

export interface Reel {
  id: string;
  title: string | null;
  caption: string | null;
  video_path: string;
  poster_path: string | null;
  sort_order: number;
  published: boolean;
  videoUrl: string;
  posterUrl: string | null;
  products: ReelProduct[];
}

const SIGN_TTL = 60 * 60 * 6; // 6h — long enough for a browsing session
const CACHE_KEY = "naira:reels:v1";
const CACHE_MS = 1000 * 60 * 60 * 2; // re-sign well before the URLs expire

/** Session cache so a second product page opens the reels instantly, with no round-trip. */
const readCache = (): Reel[] | undefined => {
  if (typeof sessionStorage === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { at: number; reels: Reel[] };
    if (Date.now() - parsed.at > CACHE_MS) return undefined;
    return parsed.reels;
  } catch {
    return undefined;
  }
};

const writeCache = (reels: Reel[]) => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), reels }));
  } catch {
    /* quota — cache is optional */
  }
};

const signAll = async (paths: string[]) => {
  const map = new Map<string, string>();
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (!unique.length) return map;
  const { data } = await supabase.storage.from("reels").createSignedUrls(unique, SIGN_TTL);
  data?.forEach((row) => {
    if (row.path && row.signedUrl) map.set(row.path, row.signedUrl);
  });
  return map;
};

export const fetchReels = async (): Promise<Reel[]> => {
  const { data, error } = await supabase
    .from("reels")
    .select("id,title,caption,video_path,poster_path,sort_order,published,reel_products(id,handle,title,price_label,image_url,variant_id,position)")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  const rows = data ?? [];

  const urls = await signAll(
    rows.flatMap((r) => [r.video_path, r.poster_path].filter(Boolean) as string[]),
  );

  const reels = rows.map((r) => ({
    ...r,
    videoUrl: urls.get(r.video_path) ?? "",
    posterUrl: r.poster_path ? (urls.get(r.poster_path) ?? null) : null,
    products: ((r.reel_products ?? []) as ReelProduct[]).sort((a, b) => a.position - b.position),
  }));

  writeCache(reels);
  return reels;
};

/**
 * Reels are only fetched once `enabled` flips true (i.e. the shopper has
 * scrolled far enough) so the product page never pays for them on first paint.
 * A session cache seeds the query so repeat views render with zero latency.
 */
export const useReels = (enabled: boolean) =>
  useQuery({
    queryKey: ["reels"],
    queryFn: fetchReels,
    enabled,
    initialData: readCache,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

