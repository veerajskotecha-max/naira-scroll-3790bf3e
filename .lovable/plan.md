# Razorpay Magic Checkout — research summary (no code changes)

You asked for research only, so nothing here changes the site. This is the written comparison, the steps for each route, and what your Razorpay screen is telling you.

## Your Razorpay screen — what it means

Your dashboard shows both www.nairaflore.com and the nc5eti-gp.myshopify.com address verified and approved, a live key generated (rzp_live_TcpkUMV2jknBwb), Test Mode switched off, and a "Integration guide for Shopify" link chosen as your integration path. So Razorpay's side is ready; nothing is connected to your shop yet.

Two things to be careful about:
- The key id in your screenshot is public-safe on its own, but the secret that came with it is not. Never paste the secret in chat or in a screenshot. If you think the secret was shown anywhere, press "Regenerate Key" and start fresh.
- Test Mode is off, so any payment you make now with these keys is real money. Generate test keys and try those first.

## How your shop is wired today

Your site is a custom-built storefront (a "headless" setup). Shopify holds the products, carts and orders. When a shopper taps "Secure Checkout", the bag is created through Shopify and the shopper is sent to Shopify's own checkout page on payments.nairaflore.com, where payment happens. Razorpay is not involved anywhere yet. This split — your own front end, Shopify's checkout — is the whole reason Magic Checkout needs care here.

Nothing about adding Razorpay breaks the site by itself, as long as we go through Shopify's own payment settings rather than replacing the checkout ourselves.

## Route A — Install Razorpay's Shopify app (recommended first step)

Razorpay publishes "Razorpay COD & Magic Checkout" on the Shopify App Store. It is described as an embedded checkout that works inside Shopify's native checkout: a panel opens, the delivery address is pre-filled from Razorpay's saved-address network, new shoppers do a quick OTP login, coupons carry over, and there are built-in cash-on-delivery controls (on/off, restricted by shipping method). It installs from the Shopify admin with no developer work.

Steps:
1. In the Shopify admin, install "Razorpay COD & Magic Checkout".
2. Connect it to your Razorpay account — test keys first.
3. Add Razorpay as the payment provider in Shopify payment settings.
4. Set the COD rules: which pin codes, which shipping methods, any order-value cap.
5. Place a test order in test mode: one prepaid (UPI), one COD.
6. Switch to the live key and place one small real order to confirm money settles and the Shopify order appears.

What to watch out for:
- Razorpay's fast panel is built to trigger from a Shopify-hosted theme. On a custom front end like ours it will most likely only appear once the shopper reaches the Shopify checkout page, not on our own product pages. Confirm this with Razorpay support before committing — ask them plainly whether Magic Checkout supports a headless storefront that uses the Storefront API cart.
- The app's public rating is low (2.6 from 31 reviews), so the test orders in step 5 are mandatory, not optional.
- Orders placed through third-party checkout panels often don't carry Shopify's cart/checkout tokens, which breaks revenue reporting for other Shopify apps that rely on them. Our own Meta Pixel events fire before hand-off so they're unaffected, but Shopify-side purchase reporting needs re-checking.

## Route B — Build Magic Checkout into our own pages

We would show a Razorpay checkout on our product and cart pages, take payment, then create the order in Shopify after payment succeeds.

What it needs:
- A backend piece that creates a Razorpay order, verifies the payment signature, then creates the matching Shopify order. The secret key stays on the server; only the key id touches the browser.
- Our own coupon, shipping-charge and stock logic, because Shopify's checkout no longer runs.
- A webhook for payments that complete after the shopper closes the tab, plus refunds.
- COD handled by us (Shopify order created as unpaid).

Trade-offs:
- Full control, one-tap COD right on the product page.
- Shopify's terms restrict replacing its checkout and creating those orders via API without written authorisation, so this needs sign-off from both Razorpay and Shopify first.
- Materially more work than Route A, and it puts a payment-critical path under our maintenance.

## Recommendation

Start with Route A, and get the headless answer from Razorpay support before you install anything live. If they confirm Magic Checkout can't drive a custom front end, Route B becomes the only way to get one-click COD on our own pages — and that should be scoped as its own build.

## What I need from you to move forward

- Razorpay support's answer on headless support (I can draft that message for you).
- Test key id and secret, saved securely through the secure form — never pasted in chat — when we start building anything.
