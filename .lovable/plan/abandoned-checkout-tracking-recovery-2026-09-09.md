# Abandoned Checkout Tracking & Recovery

## Goal
Track shoppers who add items and begin checkout but do not complete payment, then recover them through WhatsApp/email nudges with their cart pre-loaded.

## Current state
- Cart is created via Shopify Storefront API and stored in `localStorage` with `cartId`, `checkoutUrl`, and items.
- `member_orders` table already exists and records `checkout_started` rows when users open checkout.
- Meta Pixel fires `AddToCart` and `InitiateCheckout` events.
- No webhook or polling exists today to know whether a checkout became an order, so abandoned carts are not flagged automatically.

## Proposed implementation

### 1. Capture checkout intent in the database
- When a shopper clicks **Secure Checkout** and `openCheckout` runs, write a row to `member_orders` with:
  - `cart_id` (Shopify cart GID)
  - `checkout_url`
  - `email` and `phone` if the user is signed in or has provided them
  - `items`, `item_count`, `total`, `currency`
  - `status = 'checkout_started'`
  - `source`, `utm_params`, and `created_at`
- Add an `abandoned_cart_sessions` table for anonymous/guest carts with the same fields plus a session fingerprint so we can still recover by email/phone later.

### 2. Detect abandonment vs completion
- **Primary method:** Shopify webhook `orders/create` and `orders/paid`. When an order is created, match it by cart token or customer email/phone and update the row status to `ordered`.
- **Fallback method:** A scheduled Supabase Edge Function that polls the Shopify Admin API every 15–30 minutes for recent checkouts and marks completed ones.
- **Client-side fallback:** On page load, if the user returns with a `?completed_checkout=...` param or after `document.visibilitychange`, sync cart status and mark completed if the cart is empty.

### 3. Define "abandoned"
- A checkout is abandoned when:
  - Status is still `checkout_started` after 30 minutes, and
  - No matching `orders/create` webhook was received, and
  - The cart still has items.
- Add a computed `is_abandoned` flag or status value `abandoned`.

### 4. Recovery messaging
- **WhatsApp (primary channel for Naira):** Send a personalized WhatsApp message 30–60 minutes after abandonment with the cart items, total, and a direct checkout link. Include a small incentive when appropriate (e.g., the existing `NAIRA10` code).
- **Email fallback:** If email is known and WhatsApp is not, send a branded abandoned-cart email with product images and checkout CTA.
- **Frequency guard:** Send only one recovery message per cart; stop if the user completes checkout or replies STOP.

### 5. Admin / member view
- Add an "Abandoned Carts" panel in the members portal (`/account`) for admins only, listing:
  - Cart ID, items, total, started time, recovery sent/not sent, status.
  - One-click "Send WhatsApp reminder" button.

### 6. Privacy & compliance
- Capture email/phone only when the shopper has explicitly provided it (signed-in account, Inner Circle form, or checkout itself).
- Store consent source and timestamp.
- Honor opt-outs immediately.
- Do not send recovery messages to users who only browsed without initiating checkout.

## Tables to create / alter
- `abandoned_cart_sessions` (new)
- `member_orders` (alter): add `cart_id`, `checkout_token`, `recovery_sent_at`, `recovered_at`, `source`, `utm_params`.

## New backend pieces
- Supabase Edge Function `shopify-webhook-handler` to receive `orders/create` and `orders/paid`.
- Supabase Edge Function `abandoned-cart-recovery` (scheduled or invoked) to send WhatsApp messages via a messaging provider.

## Frontend changes
- `CartContext.tsx`: call the capture endpoint when checkout is initiated.
- `Account.tsx`: add admin Abandoned Carts panel.
- Optional: a small "We saved your cart" banner when a returning visitor has an abandoned cart.

## Success metrics
- Abandoned-cart capture rate (% of initiated checkouts written to DB).
- Recovery send rate and click-through rate on checkout links.
- Recovered revenue (orders whose `recovered_at` is set after a recovery message).

## Open questions
1. Do you want recovery via WhatsApp Business API (requires Meta business verification) or via a manual/shareable WhatsApp link that opens on your phone?
2. Should recovery messages include an extra discount (e.g., `NAIRA10` or a new `COMEBACK10`) or just remind shoppers of their cart?
3. Do you want real-time Shopify webhooks, or is polling the Shopify Admin API every 30 minutes acceptable to start?
