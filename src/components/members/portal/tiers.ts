/*
  Inner Circle tiers, derived from real lifetime spend on member_orders.

  Thresholds are written in *pieces*, not in aspirational round numbers.
  Naira Flore pieces run roughly ₹1,000–₹4,000, so ~₹2,500 is one piece:

    Petal       ₹0        a first piece, or none yet
    Bud         ₹5,000    about two pieces — someone who came back
    Bloom       ₹15,000   about six — a collection, not a purchase
    Rare Bloom  ₹40,000   about sixteen — the shortest list in the house

  Each step is roughly 3x the last, so the ladder stays climbable at the
  bottom and stays rare at the top. There is nothing above Rare Bloom and the
  UI says so rather than dangling an invented rung.
*/

export type Tier = {
  name: string;
  /** Inclusive lifetime-spend floor, in rupees. */
  min: number;
  /** One line of what the tier actually gets. */
  perk: string;
};

export const TIERS: Tier[] = [
  { name: "Petal", min: 0, perk: "Member pricing on every piece, always." },
  { name: "Bud", min: 5_000, perk: "Early access to each new piece, a day before the shop." },
  { name: "Bloom", min: 15_000, perk: "Private previews, and first refusal on one-of-one pieces." },
  { name: "Rare Bloom", min: 40_000, perk: "The atelier's own list: bespoke commissions, and a piece held at every drop." },
];

/*
  Rows land in member_orders at checkout handoff, so 'checkout_started' is the
  only status the app writes today. Counting it means a member sees the tier
  their orders imply; the statuses below are the ones that plainly are not a
  sale, and they never count.

  ponytail: intent-based spend. When a fulfilment webhook starts writing real
  statuses, flip this to an allowlist of paid/fulfilled and nothing else moves.
*/
const NOT_A_SALE = new Set(["cancelled", "canceled", "refunded", "failed", "abandoned"]);

/** Lifetime spend across a member's orders, rounded to the paisa. */
export const lifetimeSpend = (orders: { total: number | string | null; status?: string | null }[]) => {
  const sum = orders.reduce((acc, o) => {
    if (NOT_A_SALE.has((o.status ?? "").toLowerCase())) return acc;
    const value = Number(o.total);
    return Number.isFinite(value) && value > 0 ? acc + value : acc;
  }, 0);
  return Math.round(sum * 100) / 100;
};

export type TierStanding = {
  tier: Tier;
  /** The next rung, or null at the top of the garden. */
  next: Tier | null;
  /** Rupees still to spend to reach `next`, rounded up. 0 at the top. */
  toNext: number;
  /** Progress through the current band, 0–1. 1 at the top. */
  fraction: number;
};

/** Where a member stands. Anything not a positive number reads as ₹0. */
export const standing = (spend: number): TierStanding => {
  const safe = Number.isFinite(spend) && spend > 0 ? spend : 0;
  let index = 0;
  for (let i = TIERS.length - 1; i >= 0; i -= 1) {
    if (safe >= TIERS[i].min) {
      index = i;
      break;
    }
  }
  const tier = TIERS[index];
  const next = TIERS[index + 1] ?? null;
  if (!next) return { tier, next: null, toNext: 0, fraction: 1 };
  const span = next.min - tier.min;
  return {
    tier,
    next,
    toNext: Math.ceil(next.min - safe),
    fraction: Math.min(1, Math.max(0, (safe - tier.min) / span)),
  };
};

/** ₹1,234 — whole rupees, Indian grouping. Paisa never earned a line of copy. */
export const rupees = (amount: number) => `₹${Math.round(amount).toLocaleString("en-IN")}`;
