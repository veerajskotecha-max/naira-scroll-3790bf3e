/*
  Where a bag stands on a buy-more ladder: which rung it sits on, which it
  has climbed past, which are still ahead. One rule for the product page's
  offer row and the bag's strip, so the two can never disagree.
*/
export type RungState = "ahead" | "current" | "passed";

/** One state per rung, in the ladder's own order (fewest pieces first). */
export const rungStates = (totalItems: number, minQuantities: readonly number[]): RungState[] => {
  let current = -1;
  minQuantities.forEach((min, index) => {
    if (totalItems >= min) current = index;
  });
  return minQuantities.map((_, index) => (index === current ? "current" : index < current ? "passed" : "ahead"));
};
