/*
  Tier thresholds — the one piece of the portal with real arithmetic in it.
  Run: npx tsx src/components/members/portal/__checks__/tier.check.ts
*/

import assert from "node:assert/strict";
import { TIERS, lifetimeSpend, standing } from "../tiers";

const tierAt = (spend: number) => standing(spend).tier.name;

/* The ladder itself, so a reordered or renamed rung fails here first. */
assert.deepEqual(
  TIERS.map((t) => [t.name, t.min]),
  [
    ["Petal", 0],
    ["Bud", 5000],
    ["Bloom", 15000],
    ["Rare Bloom", 40000],
  ],
);

/* A brand-new member. */
const fresh = standing(0);
assert.equal(fresh.tier.name, "Petal");
assert.equal(fresh.next?.name, "Bud");
assert.equal(fresh.toNext, 5000);
assert.equal(fresh.fraction, 0);

/* Every boundary: one paisa under, exactly on, one paisa over. */
assert.equal(tierAt(4999.99), "Petal");
assert.equal(tierAt(5000), "Bud");
assert.equal(tierAt(5000.01), "Bud");

assert.equal(tierAt(14999.99), "Bud");
assert.equal(tierAt(15000), "Bloom");
assert.equal(tierAt(15000.01), "Bloom");

assert.equal(tierAt(39999.99), "Bloom");
assert.equal(tierAt(40000), "Rare Bloom");
assert.equal(tierAt(40000.01), "Rare Bloom");

/* A paisa short is still short, and the ask rounds up rather than promising
   a member they are closer than they are. */
assert.equal(standing(4999.99).toNext, 1);
assert.equal(standing(14999.5).toNext, 1);

/* Mid-band progress is honest about the band it is in, not the whole ladder. */
assert.equal(standing(10000).fraction, 0.5);
assert.equal(standing(5000).fraction, 0);

/* The top tier says it is the top rather than inventing another. */
const top = standing(40000);
assert.equal(top.next, null);
assert.equal(top.toNext, 0);
assert.equal(top.fraction, 1);
assert.equal(standing(250000).tier.name, "Rare Bloom");

/* Nonsense in, ₹0 out — never a crash and never a free promotion. */
assert.equal(tierAt(-5000), "Petal");
assert.equal(tierAt(Number.NaN), "Petal");

/* Lifetime spend: sums real orders, ignores what was never a sale. */
assert.equal(
  lifetimeSpend([
    { total: 2499.5, status: "checkout_started" },
    { total: "2500.5", status: "paid" },
    { total: 9000, status: "refunded" },
    { total: 9000, status: "Cancelled" },
    { total: null, status: "paid" },
  ]),
  5000,
);
assert.equal(lifetimeSpend([]), 0);
assert.equal(standing(lifetimeSpend([{ total: 2499.5 }, { total: 2500.5 }])).tier.name, "Bud");

console.log("tier thresholds: ok");
