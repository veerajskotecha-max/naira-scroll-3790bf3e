# Shiprocket Fastrr one-click checkout — plan

The document you shared is Shiprocket's Fastrr checkout, not Razorpay. It is a different route to the same goal: a one-tap checkout with address pre-fill and cash on delivery, sitting on top of your Shopify store. Good news for us — unlike Razorpay Magic Checkout, this one is *built* for a custom front end like yours. That is exactly what the "headless" URL in their example is.

## How it would work on your shop

Today: shopper taps Secure Checkout, we build the bag in Shopify, and we send them to Shopify's own checkout page on payments.nairaflore.com.

With Fastrr: shopper taps Secure Checkout, we hand the bag straight to Fastrr's checkout page instead. Fastrr recognises returning shoppers, fills their address, offers cash on delivery and UPI, and pushes the finished order back into Shopify. Shopify still owns products, stock and orders — nothing about the catalogue changes.

The script they gave is the mobile-app version. The same product also has a web version; the plan below assumes the web flow with the mobile script as the fallback if their team confirms it is the one to use for our site. I'll confirm that with Shiprocket before wiring anything live.

## What gets built

1. **A checkout provider switch.** One setting picks Shopify checkout (today) or Fastrr. Off by default, so nothing changes until you flip it. This also gives us a one-second rollback if anything misbehaves on a live order.
2. **Bag translation.** Our bag already stores everything Fastrr's list needs — product id, variant id, title, variant title, quantity, price and image. We map our items into their shape, including our promo code as `couponCode`, our saved visitor and click ids as `cartAttributes`, and the stored UTM values as `utmParams`, so attribution survives the hand-off.
3. **Hand-off.** We load their script, call their method to get the checkout link, and send the shopper there in the same tab — same behaviour as today, so the back button keeps working.
4. **Tracking parity.** The Meta Pixel InitiateCheckout event and the Clarity "reached checkout" tag fire exactly as they do now, before the hand-off. Nothing is lost.
5. **Safety net.** If their script fails to load or returns no link, we silently fall back to the existing Shopify checkout rather than showing a dead button.
6. **Test pass.** One prepaid order and one cash-on-delivery order, on mobile, checking that the order lands in Shopify with the right items, size, price, promo discount and the ₹150 shipping rule.

## Things to settle before building

- **Which flow.** The document is titled "mobile app integration for webview". Our site is a website, not an app — I'll ask Shiprocket to confirm the correct web integration for a headless storefront, and use the mobile script only if they say so.
- **Price units.** Their example shows `price: 50000` for what looks like ₹500, i.e. paise. We store rupees. I'll confirm the unit with them — getting this wrong by 100× is the single most dangerous detail here.
- **Login script.** The second half of your document (client key and secret for the login webview) is only for an app's login screen. We don't need it for the website. If we ever do, the secret must be saved in the secure store, never pasted in chat.
- **Razorpay vs Fastrr.** These overlap. Fastrr is the checkout page; Razorpay can be one of the payment methods inside it. You don't have to choose both — tell me which one you want to lead with and I'll shelve the other.

## Technical notes

- New `src/lib/fastrr.ts`: loads `https://fastrr-boost-ui.pickrr.com/assets/js/channels/mobileApp.js` once on demand, exposes `getFastrrCheckoutUrl(items, { couponCode, utmParams, cartAttributes, domain })`, typed against `window.getOneClickCheckoutUrl`, returning `null` on any failure.
- `openCheckout` in `src/contexts/CartContext.tsx` gains a provider branch before `window.location.assign(target)`: build the Fastrr URL, use it when present, otherwise keep the existing Shopify `target`. Pixel, Clarity and `updateCartTrackingAttributes` calls stay above the branch untouched.
- Item mapping from `CartItem`: `productId`/`variantId` via the existing `shopifyNumericId` helper, `title` from `name`, `variantTitle` from `variantTitle ?? size`, `image`, `quantity`, and `price` in whichever unit Shiprocket confirms.
- Domain and provider flag read from env (`VITE_CHECKOUT_PROVIDER`, `VITE_FASTRR_DOMAIN` defaulting to `nc5eti-gp.myshopify.com`), alongside the existing `VITE_CHECKOUT_DOMAIN`.
- Script tag is not added to `index.html` — loading it lazily at checkout time keeps page weight unchanged, which matters given the recent weight work.
