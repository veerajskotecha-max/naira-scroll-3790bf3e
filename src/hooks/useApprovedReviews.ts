import { useEffect, useMemo, useState } from "react";
import { getSupabase } from "@/integrations/supabase/lazy";
import { orderedRealReviews } from "@/data/realReviews";

/*
  The product page's reviews: only what customers wrote. Reviews the team
  approved for this piece (Supabase `customer_reviews`, approved = true, this
  piece's name) lead, then the genuine customer reviews with their own
  photographs (data/realReviews.ts), the one about this kind of piece first.

  The page used to show "4.9 · 51 reviews" on every piece, built mostly from
  text written for the site (productReviews.ts, handed out by a hash of the
  product name, plus curated notes and one-liners). India's dark-pattern
  guidelines (CCPA, 2023) and BIS IS 19000:2022 treat that as fake reviews,
  and it sat on every first screen. The rating and count here are worked out
  from the reviews shown, so they move as real ones arrive.

  The real reviews are bundled, so the rating is there on first paint. The
  Supabase client loads after first paint (it is 57 KB); a pre-built page or
  an automated capture asks it for nothing.
*/

export type PageReview = {
  name: string;
  rating: number;
  text: string;
  images: string[];
  date: string;
};

export type PageReviews = {
  reviews: PageReview[];
  /** The average to one decimal, or null with no reviews. */
  rating: number | null;
  count: number;
  /** How many are about this piece (approved submissions for it). */
  ownCount: number;
  loaded: boolean;
};

export const summarise = (reviews: PageReview[]) => {
  const count = reviews.length;
  const rating = count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : null;
  return { reviews, rating, count };
};

const realFor = (productName?: string): PageReview[] =>
  orderedRealReviews(productName).map((r) => ({ name: r.name, rating: r.rating, text: r.text, images: r.images, date: r.date }));

export const useApprovedReviews = (productName?: string): PageReviews => {
  const real = useMemo(() => realFor(productName), [productName]);
  const [own, setOwn] = useState<{ reviews: PageReview[]; loaded: boolean }>({ reviews: [], loaded: false });
  useEffect(() => {
    setOwn({ reviews: [], loaded: false });
    if (!productName || (typeof navigator !== "undefined" && navigator.webdriver)) return;
    let cancelled = false;
    const load = async () => {
      try {
        const supabase = await getSupabase();
        const { data } = await supabase
          .from("customer_reviews")
          .select("name, rating, text, images, created_at")
          .eq("approved", true)
          .eq("product_name", productName)
          .order("created_at", { ascending: false })
          .limit(40);
        if (cancelled) return;
        setOwn({
          loaded: true,
          reviews: (data ?? []).map((r) => ({
            name: r.name,
            rating: r.rating,
            text: r.text,
            images: r.images ?? [],
            date: new Date(r.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
          })),
        });
      } catch {
        if (!cancelled) setOwn({ reviews: [], loaded: true });
      }
    };
    /* After the first screen has settled, like the reels list. */
    const timer = window.setTimeout(load, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [productName]);
  return useMemo(() => {
    const all = [...own.reviews, ...real];
    return { ...summarise(all), ownCount: own.reviews.length, loaded: own.loaded };
  }, [own, real]);
};
