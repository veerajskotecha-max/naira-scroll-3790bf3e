import { useEffect, useState } from "react";
import { getSupabase } from "@/integrations/supabase/lazy";

/*
  The product page's reviews: only what shoppers wrote and the team approved
  (Supabase `customer_reviews`, approved = true, this piece's name). Nothing
  bundled, nothing generated. The page used to show "4.9 · 51 reviews" on
  every piece from authored text (data/productReviews.ts, data/reviewWall.ts);
  India's dark-pattern guidelines (CCPA, 2023) and BIS IS 19000:2022 treat
  that as false popularity, and the rating sat on every first screen.

  So the rating and its count appear only once real reviews exist, and are
  worked out from them. The client loads after first paint (it is 57 KB),
  and a pre-built page or an automated capture asks for nothing.
*/

export type ApprovedReview = {
  name: string;
  rating: number;
  text: string;
  images: string[];
  date: string;
};

export type ApprovedReviews = {
  reviews: ApprovedReview[];
  /** The average to one decimal, or null with no reviews. */
  rating: number | null;
  count: number;
  loaded: boolean;
};

const EMPTY: ApprovedReviews = { reviews: [], rating: null, count: 0, loaded: false };

export const summarise = (reviews: ApprovedReview[]): Omit<ApprovedReviews, "loaded"> => {
  const count = reviews.length;
  const rating = count ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : null;
  return { reviews, rating, count };
};

export const useApprovedReviews = (productName?: string): ApprovedReviews => {
  const [state, setState] = useState<ApprovedReviews>(EMPTY);
  useEffect(() => {
    setState(EMPTY);
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
        const reviews: ApprovedReview[] = (data ?? []).map((r) => ({
          name: r.name,
          rating: r.rating,
          text: r.text,
          images: r.images ?? [],
          date: new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        }));
        setState({ ...summarise(reviews), loaded: true });
      } catch {
        if (!cancelled) setState({ ...EMPTY, loaded: true });
      }
    };
    /* After the first screen has settled, like the reels list. */
    const timer = window.setTimeout(load, 1500);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [productName]);
  return state;
};
