/**
 * Runnable check for the two pieces of pure logic behind the portal panels:
 * the 3-for-20 arithmetic, and the order status → journey-step mapping.
 *
 *   npx tsx src/components/members/portal/__checks__/offers.check.ts
 *
 * Plain assert, no framework. Relative imports so tsx needs no path config.
 */
import assert from "node:assert/strict";
import { OFFER_MIN_PIECES, OFFER_RATE, formatINR, formatMoney, quoteThreeForTwenty } from "../offers";
import { ORDER_STAGES, orderProgress } from "../orderStages";

/* ── the offer: below three, nothing comes off ─────────────────────────── */

const empty = quoteThreeForTwenty([]);
assert.equal(empty.count, 0);
assert.equal(empty.subtotal, 0);
assert.equal(empty.discount, 0);
assert.equal(empty.total, 0);
assert.equal(empty.qualifies, false);
assert.equal(empty.needed, 3);

const one = quoteThreeForTwenty([1499]);
assert.equal(one.qualifies, false);
assert.equal(one.discount, 0);
assert.equal(one.total, 1499, "one piece pays full price");
assert.equal(one.needed, 2);

const two = quoteThreeForTwenty([1499, 2299]);
assert.equal(two.qualifies, false);
assert.equal(two.discount, 0);
assert.equal(two.subtotal, 3798);
assert.equal(two.total, 3798, "two pieces pay full price");
assert.equal(two.needed, 1);

/* ── exactly three: 20% off the set ────────────────────────────────────── */

const three = quoteThreeForTwenty([1499, 1499, 1499]);
assert.equal(three.qualifies, true);
assert.equal(three.needed, 0);
assert.equal(three.subtotal, 4497);
assert.equal(three.discount, 899.4, "20% of 4497 is 899.40");
assert.equal(three.total, 3597.6);
assert.equal(three.subtotal - three.discount, three.total);

const mixed = quoteThreeForTwenty([1499, 2299, 3499]);
assert.equal(mixed.subtotal, 7297);
assert.equal(mixed.discount, 1459.4);
assert.equal(mixed.total, 5837.6);

/* ── four and up: EVERY piece is discounted, not the first three ───────── */

const four = quoteThreeForTwenty([1000, 1000, 1000, 1000]);
assert.equal(four.qualifies, true);
assert.equal(four.needed, 0);
assert.equal(four.subtotal, 4000);
assert.equal(four.discount, 800, "all four are discounted: 20% of 4000, not 20% of 3000");
assert.equal(four.total, 3200);
assert.notEqual(four.discount, 600, "the offer is not 'groups of three, remainder full price'");

const five = quoteThreeForTwenty([1000, 1000, 1000, 1000, 1000]);
assert.equal(five.discount, 1000);
assert.equal(five.total, 4000);

// The rate applies flat above the minimum: doubling the set doubles the saving.
assert.equal(quoteThreeForTwenty(Array(8).fill(500)).discount, 800);

/* ── rounding, to the paisa ────────────────────────────────────────────── */

// 3003 paise × 0.2 = 600.6 paise → 601 paise. Half-up, never a fraction left over.
const odd = quoteThreeForTwenty([10.01, 10.01, 10.01]);
assert.equal(odd.subtotal, 30.03);
assert.equal(odd.discount, 6.01);
assert.equal(odd.total, 24.02);
assert.equal(Math.round(odd.total * 100), 2402, "the total is a whole number of paise");

// 1 paisa short of rounding up: 3002 × 0.2 = 600.4 → 600.
const odd2 = quoteThreeForTwenty([10.01, 10.01, 10.0]);
assert.equal(odd2.discount, 6.0);
assert.equal(odd2.total, 24.02);

// Float rupee maths would drift here; paise maths does not.
const drift = quoteThreeForTwenty([0.1, 0.2, 0.3]);
assert.equal(drift.subtotal, 0.6);
assert.equal(drift.discount, 0.12);
assert.equal(drift.total, 0.48);

// Every quote settles on a whole number of paise.
for (const prices of [[999.99, 1, 0.01], [1333.33, 1333.33, 1333.34], [7, 7, 7, 7]]) {
  const q = quoteThreeForTwenty(prices);
  for (const value of [q.subtotal, q.discount, q.total]) {
    assert.equal(Math.round(value * 100) % 1, 0);
    assert.ok(Number.isInteger(Math.round(value * 100)));
  }
  assert.equal(Math.round(q.total * 100), Math.round(q.subtotal * 100) - Math.round(q.discount * 100));
}

assert.equal(OFFER_MIN_PIECES, 3);
assert.equal(OFFER_RATE, 0.2);

/* ── INR formatting: Indian digit grouping, paise only when there are any ─ */

assert.equal(formatINR(1499), "₹1,499");
assert.equal(formatINR(0), "₹0");
assert.equal(formatINR(999), "₹999");
assert.equal(formatINR(1000), "₹1,000");
assert.equal(formatINR(99999), "₹99,999");
assert.equal(formatINR(100000), "₹1,00,000", "lakh grouping, not ₹100,000");
assert.equal(formatINR(1234567), "₹12,34,567", "crore grouping");
assert.equal(formatINR(3597.6), "₹3,597.60", "paise are shown to two places");
assert.equal(formatINR(899.4), "₹899.40");
assert.equal(formatINR(24.02), "₹24.02");
assert.equal(formatINR(1499.0), "₹1,499", "a whole rupee price is not dressed up as ₹1,499.00");

assert.equal(formatMoney(1499, "INR"), "₹1,499");
assert.equal(formatMoney(1499, ""), "₹1,499", "a missing currency is treated as INR");
assert.equal(formatMoney(1499, "USD"), "USD 1,499.00", "a non-INR row never gets a ₹ sign");

/* ── status → journey step ─────────────────────────────────────────────── */

// The only value that actually occurs in member_orders today.
const started = orderProgress("checkout_started");
assert.equal(started.stage, 0);
assert.equal(started.label, "Placed");
assert.equal(started.known, true);
assert.equal(started.closed, false);
assert.equal(started.unfinished, true, "an unpaid checkout can still be resumed");

for (const [status, stage] of [
  ["checkout_started", 0], ["pending", 0], ["paid", 0], ["confirmed", 0],
  ["processing", 1], ["in_production", 1], ["packed", 1],
  ["shipped", 2], ["fulfilled", 2], ["out_for_delivery", 2],
  ["delivered", 3], ["completed", 3],
] as const) {
  assert.equal(orderProgress(status).stage, stage, `${status} should sit at step ${stage}`);
  assert.equal(orderProgress(status).known, true, `${status} should be recognised`);
}

// Free text, so the separators and case in the column cannot be relied on.
for (const variant of ["Out For Delivery", "out-for-delivery", "OUT_FOR_DELIVERY", "  out for delivery  "]) {
  assert.equal(orderProgress(variant).stage, 2, `${variant} should normalise to step 2`);
}

// A stopped order never creeps towards "Yours".
for (const status of ["cancelled", "canceled", "refunded", "expired"]) {
  const p = orderProgress(status);
  assert.equal(p.closed, true);
  assert.equal(p.known, true);
  assert.equal(p.unfinished, false, "a stopped order must not offer a resume link");
  assert.equal(p.stage, 0);
}

// An unknown string must land on a sensible step, never blank and never crash.
for (const status of ["", "wibble", "on the moon", "42", "status_we_have_never_seen"]) {
  const p = orderProgress(status);
  assert.ok(p.stage >= 0 && p.stage <= 3, "stage stays inside the journey");
  assert.equal(p.stage, 0, "an unrecognised status falls back to Placed — the order does exist");
  assert.equal(p.label, "Placed");
  assert.equal(p.known, false, "and is flagged as unrecognised so the raw value can be surfaced");
  assert.equal(p.closed, false);
  assert.equal(p.unfinished, false, "we do not promise a resume link for a status we cannot read");
  assert.ok(p.note.length > 0, "there is always something to say");
}

// Nulls and non-strings arrive from jsonb-shaped data more often than they should.
for (const bad of [null, undefined, 0, {}]) {
  const p = orderProgress(bad as unknown as string);
  assert.equal(p.stage, 0);
  assert.ok(p.label);
}

assert.equal(ORDER_STAGES.length, 4);
assert.deepEqual(
  ORDER_STAGES.map((s) => s.label),
  ["Placed", "Being made", "On its way", "Yours"],
);

console.log("offers.check.ts — all assertions passed");
