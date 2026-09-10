# Razorpay Magic Checkout — what's needed and what changes here

## Answer to the question first

The text you pasted is only Razorpay's documentation index. It contains **no keys, no account ID, no credentials** — so nothing can be connected from it. Nothing in the project's stored keys today is Razorpay-related either (only Shopify ones).

The good news: because your checkout runs on Shopify, Magic Checkout is installed **on Shopify**, not coded into this website. That means very little work here, and no Razorpay API keys need to be stored in this project at all.

## How it will work

Today: cart on nairaflore.com → hand-off to the Shopify checkout on payments.nairaflore.com.

After: exactly the same hand-off, except Shopify shows Razorpay Magic Checkout (phone number, saved addresses, one-tap COD/UPI) instead of the standard form.

## Steps

### 1. Setup you do in Razorpay + Shopify (no code)
- In the Razorpay dashboard, confirm Magic Checkout is enabled for the account and that the account is live (not test).
- Install the "Razorpay Magic Checkout" app from the Shopify App Store onto the Naira store and connect it to the Razorpay account.
- In the app settings, turn Magic Checkout on for the storefront, and set COD rules if you want cash on delivery.
- In Shopify Settings → Payments, make Razorpay the active provider so card/UPI/netbanking route through it.

### 2. Settings that must match what the site already promises
- **Shipping ₹150** — the cart currently shows a flat ₹150 shipping line. This must be set as a Shopify shipping rate so the amount charged matches what the cart shows. If it is not set in Shopify today, the customer is charged less than shown.
- **Discount codes** (NAIRA10, FRIENDSANDFAMILY) — Magic Checkout has its own coupon panel. Needs a test that a code applied in our cart drawer still carries through.
- **Serviceability** — the site's pin-code checker and the "3–5 working days" promise should line up with the delivery rules configured in the Razorpay app.

### 3. Small checks in this website's code
- The checkout hand-off already sends shoppers to `payments.nairaflore.com`; confirm that stays the domain the Razorpay app serves checkout on. If Razorpay serves it elsewhere, one line changes.
- The branded "secure checkout" loading screen stays as is — it just lands on the Razorpay-powered page instead.
- No Razorpay keys, no new backend function, no webhook needed for this route: Shopify remains the system of record for orders.

### 4. Verification before going live
- One real low-value order end to end: cart → checkout → UPI payment → order appears in Shopify admin.
- One COD order if COD is switched on.
- Confirm shipping ₹150 and a discount code both appear correctly on the Razorpay checkout total.
- Confirm the purchase still fires the Meta Pixel purchase event.

## What I need from you to proceed
Nothing secret. Once the Razorpay app is installed on Shopify and switched on, tell me and I'll verify the hand-off, the ₹150 shipping match and the discount pass-through, and fix anything that breaks.

## If you ever want the other route
Building Razorpay Magic Checkout directly into this site (bypassing Shopify checkout) would need a Razorpay key ID + key secret stored securely, a backend order-creation and signature-verification function, webhooks, and our own handling of stock, refunds and order records. Much larger build, and orders would no longer flow into Shopify automatically. Not recommended while Shopify runs the store.
