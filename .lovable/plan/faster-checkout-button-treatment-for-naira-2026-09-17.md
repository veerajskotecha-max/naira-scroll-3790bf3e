# Faster-checkout button treatment for Naira

## What the live comparison showed

- Project Shades uses a plain black **ADD TO BAG** button on the product page and a plain green **Checkout** button in the bag. There is no Fastrr or Shiprocket badge beside either button.
- Following Project Shades through checkout opens an embedded checkout branded **Powered by GoKwik**, not Fastrr. Their pages load Fastrr files, but their visible checkout belongs to another provider, so it is not a reliable design reference for a Fastrr badge.
- Shiprocket describes Fastrr as a one-click checkout with phone login, address pre-fill, multiple payment methods and estimated delivery information. Those benefits support concise reassurance near the action, but not a large third-party logo inside a luxury jewellery button.
- Naira currently has several purchase-button versions across the jewellery page, sticky bar, general product page and bag. They share the same checkout behaviour but not one consistent visual treatment.
- The current live hand-off still falls back to Shopify because Shiprocket returns a 402 account-activation response. A badge that promises “Fastrr checkout” everywhere would therefore be misleading until Shiprocket activates the account.

## Recommended direction

Keep Naira as the visible brand and sell the benefit, not the checkout vendor:

1. **Product page primary action**
   - Keep the gold **SHOP NOW** / **PRE-ORDER NOW** button.
   - Add one restrained line immediately below it: **Faster one-click checkout · COD & prepaid** with a small lightning and shield mark.
   - Do not place the Fastrr logo inside the button. It would make a high-value jewellery purchase look like a payment advertisement.

2. **Sticky mobile purchase bar**
   - Keep the same button label and current gold/ink hierarchy.
   - Add a compact **ONE-CLICK CHECKOUT** micro-label above the Shop Now text, only if it remains legible at the current height; otherwise keep the reassurance line outside the bar.

3. **Bag checkout**
   - Rename **Secure Checkout** to **Checkout Faster** only after the Fastrr account is active and the complete checkout succeeds.
   - Place a quiet subline below: **Address pre-fill · UPI · Cards · COD**.
   - Add **Powered by Fastrr by Shiprocket** below the button only if Shiprocket provides an approved logo/wordmark and requires or permits merchant-facing co-branding.

4. **Safety and truthfulness**
   - The messaging will follow the active provider. If Fastrr is unavailable or the shop is set to Shopify checkout, show neutral **Secure checkout** wording rather than a Fastrr claim.
   - Keep the existing automatic Shopify fallback.
   - Do not copy Project Shades’ GoKwik badge or green checkout styling.

## Technical details

- Create one small checkout-benefit treatment and reuse it beside the jewellery PDP actions, mobile sticky action and bag checkout rather than duplicating markup.
- Read the same provider state used by the checkout hand-off so visible claims cannot drift from actual behaviour.
- Use Naira’s existing ink, gold, ivory and label typography tokens; maintain 0px corners and minimum 44px tap targets.
- Preserve sold-out and preorder labels, loading/disabled states, Meta InitiateCheckout, Clarity tracking, promo handling and Shopify fallback.
- Do not add a new third-party script or logo asset unless Shiprocket supplies an approved asset.

## Verification

- First obtain Shiprocket activation so checkout initiation no longer returns 402.
- Test mobile product page, sticky bar and bag at Naira’s common narrow width.
- Complete one prepaid and one COD checkout; confirm the correct item, size, discount, ₹150 shipping and Shopify order.
- Deliberately block the Fastrr script and confirm the button falls back to Shopify while no Fastrr-specific promise remains visible.
