# Switching the checkout to Razorpay

## Short answer first

No — Razorpay does **not** work the same way Fastrr does.

Fastrr gives us a ready-made checkout **page**: we hand it the bag, it gives back a link, we send the shopper there. That is why it slotted into the existing button in a day.

Razorpay is a **payment box**, not a checkout page. It collects the money, but it does not know your products, shipping rule, discount codes, or how to create the order in Shopify. So there is no equivalent "give me a checkout link" call.

That leaves two genuinely different routes.

## Route A — Razorpay inside Shopify's own checkout (recommended)

The shopper taps Secure Checkout, lands on Shopify's checkout page (payments.nairaflore.com, exactly as before Fastrr), and pays by UPI / card / netbanking through Razorpay. Cash on delivery and Magic Checkout's saved-address one-tap flow come from Razorpay's Shopify app.

- **Site code changes: almost none.** Turn the Fastrr switch back off and the button returns to Shopify's checkout on its own.
- **Where your keys go:** your Shopify admin, not this site. Settings → Payments → Razorpay. Your key id and secret are entered there once.
- **What you install:** Razorpay's "COD & Magic Checkout" app from the Shopify app store, connected with test keys first.
- **What stays intact:** discount codes, the ₹150 shipping rule, stock, order emails, refunds — all still Shopify's, so nothing can silently break.
- **Cost of this route:** the one-click experience begins on Shopify's checkout page, not on your product page. Slightly longer than Fastrr.

## Route B — Razorpay on our own pages

We show the Razorpay payment box on your own cart/product page, take the money, then create the matching Shopify order afterwards.

- Needs a server piece of our own: creates the Razorpay order, verifies the payment signature, creates the Shopify order, handles payments that complete after the shopper closes the tab, and handles refunds. Your secret key lives there, never in the browser.
- We would also have to re-implement discount codes, the ₹150 shipping rule, stock checks and address capture ourselves, because Shopify's checkout no longer runs.
- Shopify's terms restrict replacing its checkout and creating orders by API without written permission. This needs sign-off before building.
- Risk: this is the money path, owned by us. Materially more work and more ways to lose an order.

## Recommendation

Go with Route A. It is the route Razorpay's own dashboard pointed you at ("Integration guide for Shopify"), it is what your verified domains were approved for, and it gets Magic Checkout's saved-address one-tap and COD without us owning the payment path.

Only go to Route B if, after testing, you decide the checkout must live on your own product page and Shopify agrees in writing.

## What I will do once you confirm Route A

1. Switch the checkout provider back to Shopify so Secure Checkout goes to payments.nairaflore.com again. Fastrr stays in the code, switched off, so we can flip back in one line if Razorpay disappoints.
2. Re-check the hand-off: discount code carried in the link, ₹150 shipping, Meta Pixel InitiateCheckout and the Clarity "reached checkout" tag firing before the jump, the floral transition screen.
3. Walk you through the Shopify admin steps: install the Razorpay app, connect **test** keys, add Razorpay as a payment provider, set the COD rules (pin codes, order-value cap), then switch to live keys.
4. Confirm the Shopify-side purchase tracking still records the order after Razorpay's overlay, since third-party checkout overlays sometimes hide Shopify's checkout token.
5. You place two small real orders — one UPI, one cash on delivery — and we check each lands in Shopify with the right item, size, price, discount and ₹150 shipping.

## Before anything goes live

- **Regenerate the Razorpay key.** The secret was pasted into chat, so treat it as compromised. Generate a fresh pair in the dashboard and enter it only in Shopify admin — never in chat, a screenshot, or this site's code.
- **Test Mode is currently off** in your Razorpay dashboard, so any payment made now is real money. Generate test keys and use those first.

## Technical notes

- `VITE_CHECKOUT_PROVIDER` returns to its default (unset) so `isFastrrEnabled()` is false; `openCheckout` in `src/contexts/CartContext.tsx` then keeps using `window.location.assign(target)` with the Shopify checkout URL and the promo query string.
- `src/lib/fastrr.ts` is left untouched and dormant — no script is fetched when the provider is off, so page weight is unaffected.
- Route A adds no Razorpay key, SDK or script to this codebase. Route B would add a Supabase edge function (`razorpay-order`, `razorpay-webhook`) plus `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` in the secret store — not part of this plan.
