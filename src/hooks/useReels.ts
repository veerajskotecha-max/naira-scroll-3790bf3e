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
// Bump when media paths change so returning shoppers never keep a stale,
// lower-quality signed URL in session storage.
// v4 clears signed URLs cached before the seeded objects were corrected from
// application/octet-stream to video/mp4. iOS webviews otherwise keep retrying
// the stale response even though storage now has the right metadata.
const CACHE_KEY = "naira:reels:v4";
const CACHE_MS = 1000 * 60 * 60 * 2; // re-sign well before the URLs expire

/** Session cache so a second product page opens the reels instantly, with no round-trip. */
const readCache = (maxAge = CACHE_MS): Reel[] | undefined => {
  if (typeof sessionStorage === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as { at: number; reels: Reel[] };
    if (Date.now() - parsed.at > maxAge) return undefined;
    return parsed.reels;
  } catch {
    return undefined;
  }
};

/** Last known reels regardless of age — used so a failed refresh never
    collapses the Shop the Reel section on a product page. */
export const readStaleReelCache = (): Reel[] | undefined => readCache(Number.POSITIVE_INFINITY);

const writeCache = (reels: Reel[]) => {
  if (typeof sessionStorage === "undefined") return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), reels }));
  } catch {
    /* quota — cache is optional */
  }
};

/** Longest we will wait for storage to hand back signed URLs. */
const SIGN_TIMEOUT_MS = 8000;

/**
 * Signs the media paths — and never lets that step sink the section.
 *
 * Two deliberate guarantees here, both learned the hard way:
 *
 *  - It always RESOLVES. It used to await the storage call bare, so a request
 *    that hung (no timeout exists on the client) left the query pending for
 *    ever. `isLoading` never cleared, the section showed its placeholder with
 *    no error to retry from, and no amount of waiting or returning to the tab
 *    brought it back. That is the failure shoppers hit in the Instagram
 *    browser.
 *  - It never THROWS. A signing failure used to reject the whole fetch, taking
 *    the reels and their products with it — even though neither needs a signed
 *    URL. The covers are bundled and the product tiles come from the row.
 *
 * A reel whose video could not be signed simply renders as its cover with its
 * products, which is worth far more than an empty rail.
 */
const signAll = async (paths: string[]) => {
  const map = new Map<string, string>();
  const unique = Array.from(new Set(paths.filter(Boolean)));
  if (!unique.length) return map;
  try {
    const signing = supabase.storage.from("reels").createSignedUrls(unique, SIGN_TTL);
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), SIGN_TIMEOUT_MS));
    const result = await Promise.race([signing, timeout]);
    result?.data?.forEach((row) => {
      if (row.path && row.signedUrl) map.set(row.path, row.signedUrl);
    });
  } catch {
    /* Unsigned is survivable; empty is not. */
  }
  return map;
};

/** Longest we will wait for the reel rows themselves. */
const ROWS_TIMEOUT_MS = 10000;

/*
  Unlike signing, a missing row list leaves nothing to show — so this one
  REJECTS on timeout rather than resolving empty, which is what hands the query
  an error it can retry from instead of hanging pending for ever.
*/
const withDeadline = <T,>(work: PromiseLike<T>, ms: number, label: string): Promise<T> =>
  Promise.race([
    work,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms)),
  ]);

export const fetchReels = async (): Promise<Reel[]> => {
  const { data, error } = await withDeadline(
    supabase
    .from("reels")
    .select("id,title,caption,video_path,poster_path,sort_order,published,reel_products(id,handle,title,price_label,image_url,variant_id,position)")
    .eq("published", true)
      .order("sort_order", { ascending: true }),
    ROWS_TIMEOUT_MS,
    "reels",
  );

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
    initialData: () => readCache(),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    /* Coming back to the tab is the shopper's natural "try again", so it must
       actually retry. With this off, a single failed load stayed broken for the
       whole session however many times they switched away and back. */
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    // A flaky signed-URL round trip used to empty the section entirely.
    retry: 3,
    retryDelay: (attempt) => Math.min(1500 * 2 ** attempt, 8000),
  });

