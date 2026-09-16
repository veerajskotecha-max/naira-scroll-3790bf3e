# Razorpay Magic Checkout — research summary (no code changes)

You asked for research only, so nothing here changes the site. This is the written comparison and the steps for each route.

## How your shop is wired today

Your site is a custom-built storefront. Shopify holds the products, carts and orders. When a shopper taps "Secure Checkout", the bag is created through Shopify and the shopper is sent to Shopify's own checkout page on payments.nairaflore.com, where payment happens. Razorpay is not involved anywhere yet.

That matters, because Magic Checkout attaches itself to the checkout step — and your checkout step lives on Shopify, not on your own pages.

## Route A — Install Razorpay's Shopify app (recommended first step)

Razorpay publishes "Razorpay COD & Magic Checkout" on the Shopify App Store. It is an embedded checkout that works inside Shopify's native checkout: a panel opens, the shopper's delivery address is pre-filled from Razorpay's saved-address network, new shoppers do a quick OTP login, coupons carry over, and there are built-in cash-on-delivery controls (on/off, restricted by shipping method). It installs from the Shopify admin with no developer work.

Steps:
1. In the Shopify admin, install "Razorpay COD & Magic Checkout".
2. Connect it to your Razorpay account (test mode first, then live) using the keys you already have.
3. Add Razorpay as the payment provider in Shopify payment settings.
4. Set the COD rules: which pin codes, which shipping methods, any order-value cap.
5. Place a test order in Razorpay test mode: one prepaid (UPI), one COD.
6. Switch to live keys and place one small real order to confirm money settles and the Shopify order is created.

What to watch out for:
- Razorpay's fast panel is designed to trigger from the Shopify-hosted storefront. On a custom-built front end like ours, the panel may only appear once the shopper reaches the Shopify checkout page rather than on our product pages. This is the one point worth confirming with Razorpay support before you commit — ask them directly whether Magic Checkout supports a headless storefront using the Storefront API cart.
- The app's public rating is low (2.6 from 31 reviews), so treat the test orders in step 5 as mandatory, not optional.
- Orders placed through third-party checkout overlays often do not carry Shopify's cart/checkout tokens, which breaks revenue attribution for other Shopify apps that rely on them. Meta Pixel tracking on our side is unaffected because we fire our own events before hand-off, but the purchase event on Shopify's side needs re-checking.

## Route B — Build Magic Checkout into our own pages

We would show a Razorpay checkout on our product and cart pages, take payment, and then create the order in Shopify after payment succeeds.

What it needs:
- A server piece (a backend function) that creates a Razorpay order, verifies the payment signature, then creates the matching Shopify order. Keys stay on the server; only the publishable key touches the browser.
- Our own coupon, shipping-charge and stock logic, because Shopify's checkout no longer runs.
- A webhook to handle payments that complete after the shopper closes the tab, plus refund handling.
- COD handling built by us (Shopify order created as unpaid).

Trade-offs:
- Full control over look and flow, one-tap COD on the product page itself.
- Shopify's terms restrict replacing its checkout and creating those orders through the API without written authorisation, so this route needs sign-off from both Razorpay and Shopify before building.
- It is materially more work than Route A and adds a payment-critical path we own and must maintain.

## Recommendation

Start with Route A and ask Razorpay support the headless question first. If they confirm Magic Checkout cannot drive a custom front end, then Route B becomes the only way to get one-click COD on our own pages — and at that point we should scope it properly as its own build.

## What I need from you to move forward

- Confirmation from Razorpay support on headless support (I can draft the message to send them).
- Your test key id and secret, saved securely — not pasted in chat — when we get to building anything.
