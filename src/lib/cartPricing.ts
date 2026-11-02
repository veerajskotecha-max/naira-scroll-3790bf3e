import { discountedSubtotal, type ResolvedDiscount } from "./promo";

/** Allocate the bag's rounded goods total so individual lines never quote a different sum. */
export const discountedCartLines = (
  lines: ReadonlyArray<{ price: number; quantity: number }>,
  discount: ResolvedDiscount,
): Array<{ total: number; unit: number }> => {
  const exact = lines.map((line) => line.price * line.quantity * (1 - discount.rate));
  const totals = exact.map(Math.floor);
  const target = discountedSubtotal(lines.reduce((sum, line) => sum + line.price * line.quantity, 0), discount);
  const remainder = target - totals.reduce((sum, total) => sum + total, 0);
  const ranked = exact.map((value, index) => ({ index, fraction: value - totals[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (const { index } of ranked.slice(0, remainder)) totals[index] += 1;
  return totals.map((total, index) => ({ total, unit: lines[index].quantity > 0 ? total / lines[index].quantity : 0 }));
};