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

  return rows.map((r) => ({
    ...r,
    videoUrl: urls.get(r.video_path) ?? "",
    posterUrl: r.poster_path ? (urls.get(r.poster_path) ?? null) : null,
    products: ((r.reel_products ?? []) as ReelProduct[]).sort((a, b) => a.position - b.position),
  }));
};

/**
 * Reels are only fetched once `enabled` flips true (i.e. the shopper has
 * scrolled far enough) so the product page never pays for them on first paint.
 */
export const useReels = (enabled: boolean) =>
  useQuery({
    queryKey: ["reels"],
    queryFn: fetchReels,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
