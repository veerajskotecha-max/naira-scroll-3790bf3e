# Repair the mobile bag for 2–3 items

## Goal
Make the mobile bag clean, readable, and fully usable on short iPhone screens, especially inside Instagram’s browser, without changing discount, shipping, cart, or checkout logic.

## What will change

1. **Rebuild the mobile height structure**
   - Keep the bag within the visible browser area and safe-area insets.
   - Replace the current fixed 34% product-list limit with a flexible layout that gives products the remaining space.
   - Prevent the offer panel, products, and payment summary from overlapping or appearing clipped.

2. **Make the offer compact after it is earned**
   - Preserve the Naira Pairing Offer, both discount milestones, and all existing rates.
   - Reduce its vertical footprint for a 2- or 3-piece bag while keeping the earned saving immediately clear.
   - Keep the current sharp-cornered, gold-and-ivory editorial styling.

3. **Refine the product rows for mobile**
   - Tighten image, title, price, quantity, and remove-control spacing without reducing tap targets.
   - Ensure two and three products scroll smoothly as one dedicated list.
   - Keep long product names and options from pushing controls out of alignment.

4. **Create a stable payment summary**
   - Keep delivery, promo code, subtotal, shipping, discount, total, Secure Checkout, and reassurance visible in a deliberate compact hierarchy.
   - Remove redundant visual weight and spacing rather than removing information.
   - Keep the checkout action easy to reach and clear of Instagram/iPhone browser controls.

5. **Verify the real mobile states**
   - Test empty, one-item, two-item, and three-item bags at the current 393×626 viewport and a taller iPhone viewport.
   - Check quantity changes, removal, promo expansion, earned BUY2/BUY3 display, scrolling, keyboard/safe-area behavior, and checkout-button availability.
   - Verify both standard Safari-style and Instagram in-app mobile browser conditions, with no horizontal overflow.

## Technical boundaries
- Changes will be limited to the bag’s presentation and responsive layout.
- Shopify synchronization, the one-code discount resolver, ₹150 insured shipping, delivery calculation, tracking, and the active checkout handoff remain unchanged.
- Existing semantic design tokens and 0px radius rules will be retained.
- Add focused layout tests where practical, then run the relevant tests, type check, production build, and browser screenshots.
