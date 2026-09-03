/**
 * member_orders.status → the four-step journey the vine draws.
 *
 * WHAT ACTUALLY OCCURS TODAY: exactly one value, `checkout_started`. It is the
 * column default, and nothing in this codebase ever sets or updates `status` —
 * the single writer is src/components/CartDrawer.tsx, which inserts a row
 * without a status when a signed-in member hands over to Shopify. There is no
 * webhook or edge function that advances it. So every stored row is stage 0,
 * and stage 0 must be honest: the member began a checkout, which is not the
 * same as having paid.
 *
 * The rest of the table is forward cover for the values a Shopify order webhook
 * would bring (financial_status / fulfillment_status) plus the plain-English
 * words a human would type into the column by hand. Anything unrecognised falls
 * to "Placed" — the order row exists, so it was at least started — and the raw
 * string is surfaced in the UI rather than swallowed.
 */

export type StageIndex = 0 | 1 | 2 | 3;

export const ORDER_STAGES = [
  { key: "placed", label: "Placed" },
  { key: "made", label: "Being made" },
  { key: "away", label: "On its way" },
  { key: "yours", label: "Yours" },
] as const;

const AT_STAGE: Record<StageIndex, string[]> = {
  0: [
    "checkout started", "checkout", "started", "pending", "payment pending", "unpaid",
    "created", "new", "abandoned", "placed", "order placed", "authorized", "partially paid",
    "paid", "confirmed",
  ],
  1: [
    "being made", "in production", "production", "processing", "preparing",
    "in progress", "making", "packing", "packed", "ready to ship", "ready",
  ],
  2: [
    "on its way", "shipped", "fulfilled", "partially fulfilled", "dispatched",
    "in transit", "transit", "out for delivery", "shipping", "with courier",
  ],
  3: ["yours", "delivered", "completed", "complete", "received", "collected", "closed"],
};

/** The journey stopped — no vine should be drawn creeping towards "Yours". */
const CLOSED = [
  "cancelled", "canceled", "refunded", "partially refunded", "returned",
  "failed", "declined", "voided", "expired", "chargeback",
];

/** Payment never landed, so the checkout can still be picked back up. */
const UNFINISHED = [
  "checkout started", "checkout", "started", "pending", "payment pending",
  "unpaid", "abandoned", "created", "new",
];

export type OrderProgress = {
  stage: StageIndex;
  /** "Placed", "Being made", … — the step the vine has reached. */
  label: string;
  /** One honest sentence about where the order actually is. */
  note: string;
  /** Cancelled, refunded, expired: the journey ended early. */
  closed: boolean;
  /** False when the stored string is not one we recognise. */
  known: boolean;
  /** Unpaid, so a checkout_url is worth offering. */
  unfinished: boolean;
};

/** Lowercase, and treat _ - . / and runs of spaces as one separator. */
const normalise = (status: string): string =>
  String(status ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const orderProgress = (status: string): OrderProgress => {
  const value = normalise(status);
  const closed = CLOSED.includes(value);
  const unfinished = !closed && UNFINISHED.includes(value);

  const found = ([3, 2, 1, 0] as StageIndex[]).find((s) => AT_STAGE[s].includes(value));
  const known = closed || found !== undefined;
  const stage: StageIndex = closed ? 0 : (found ?? 0);

  return {
    stage,
    label: ORDER_STAGES[stage].label,
    note: closed
      ? "This order was stopped. Nothing further is on its way."
      : unfinished
        ? "Checkout was started. We'll confirm the moment payment lands."
        : known
          ? [
              "We have your order and it is with the atelier.",
              "Your pieces are being prepared by hand.",
              "It has left us and is on its way to you.",
              "Delivered. We hope you wear it often.",
            ][stage]
          : "We have your order. We'll update this the moment it moves.",
    closed,
    known,
    unfinished,
  };
};
