/* Deterministic, per-product social proof figures.
   The same handle always yields the same rating and review count, so the
   PDP summary stays stable across renders and sessions. */

const hash = (value: string) => {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
};

export const getProductRating = (handle?: string | null) => {
  const seed = hash(handle || "naira-flore");
  const ratingSteps = [4.6, 4.7, 4.8, 4.9];
  const rating = ratingSteps[seed % ratingSteps.length];
  const count = 24 + ((seed >> 3) % 118);
  return { rating, count };
};
