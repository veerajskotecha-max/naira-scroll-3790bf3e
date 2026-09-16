# Refine the PDP FOMO notice and mobile cart

## Changes
- Restore the purchase notice only on jewellery product pages, never over the cart or product dialogs.
- Place it above the mobile sticky purchase bar and at the lower-left on desktop, with a smaller editorial treatment.
- Show it for exactly 2.3 seconds, then remove it immediately; keep the existing first delay, one-minute gap, and dismissal snooze.
- Simplify the mobile cart by removing the duplicate shipping banner and reducing repeated payment/trust copy.
- Keep the product, quantity, delivery date, price breakdown, promo entry, and checkout action clearly visible.

## Verification
- Check a jewellery product and populated cart at 393px width.
- Confirm the notice does not cover the sticky purchase bar or cart and vanishes after 2.3 seconds.
- Confirm no horizontal overflow and a clean build.
