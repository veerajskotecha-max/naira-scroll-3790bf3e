
# Mirror Palmonas PDP onto Naira Flore

Add every Palmonas element our PDP is missing, adapted to Naira's couture context and brand tokens (Velista serif, sage/teal palette, 0px radius). Nothing in Palmonas's aesthetic replaces ours — we borrow structure, not style.

## What gets added

### 1. Gallery — floating share button
- Small circular share FAB, bottom-right of the mobile gallery, mirrors Palmonas.
- Uses Web Share API on mobile, falls back to copy-link + toast.
- Edit: `src/components/product/ProductGallery.tsx`.

### 2. Trust-badge row (right below price)
- 3-icon horizontal strip, Naira equivalents of BIS / IGI / Lifetime Buyback:
  - Handcrafted in Nashik
  - GST-Invoiced Purchase
  - 48-hr Response Promise
- Same sage-tinted panel style already used in TrustStrip, but static (not marquee).
- Edit: `src/components/product/ProductDetails.tsx`.

### 3. Pincode / delivery ETA checker
- New component `src/components/product/PincodeChecker.tsx`.
- "Deliver To: ______ Check" input, 6-digit validation, then shows:
  - Green tick + "Delivery by <date>" (today + 5 business days for metros, +9 for others — simple heuristic; no external API).
  - COD availability line ("COD not available — prepaid only" since Naira is prepaid).
- Remembers last-used pincode in localStorage.
- Placed between trust-badge row and Size selector.

### 4. Tabbed spec block ("Details" / "Price Breakup")
- Replace the top of the accordion stack with a 2-tab switcher above the accordions.
- **Details tab** (default): the current 4 accordions (Product Information, Delivery Timelines, Disclaimer, Additional Information).
- **Price Breakup tab**: transparent table
  - Base Price — ₹X
  - GST (5% on apparel < ₹1000 else 12%) — auto-computed from variant price
  - Shipping — Free above ₹2,999 / else ₹150
  - Total — variant price (since our prices are tax-inclusive; note reads "Prices already include GST; breakup shown for transparency").
- Edit: `src/components/product/ProductDetails.tsx`; new sub-component `PriceBreakup.tsx`.

### 5. Header — search + account icons
- Add magnifying-glass icon that opens a search overlay filtering `/shop`.
- Add user icon linking to `/account` if signed in, else `/contact` (no auth yet — icon just links to Contact for now, placeholder).
- Edit: `src/components/Navbar.tsx`.
- Keep wishlist + cart untouched.

### 6. Footer — Popular Searches SEO keyword block
- Add a new section above the copyright row in `src/components/Footer.tsx`.
- Categories: Fusion Sarees · Co-ord Sets · Dresses · Festive Wear · Bridal · Reception Outfits · Cocktail Wear · Custom Made Outfits · Nashik Designer · Indo-Western Fashion.
- Each is a link into `/shop?filter=...` where applicable, else `/shop`.
- Small light-serif text, sage-on-off-white, matches footer color scheme.

### 7. Sticky bottom bar — Buy It Now variant
- Currently shows only "ADD TO CART" (teal). Add a second black "BUY IT NOW" button next to it, mirroring Palmonas's black CTA.
- Edit: `src/components/StickyAddToCart.tsx`.

### 8. Price treatment refinement
- Remove the decorative strikethrough flourish through the price digits — Palmonas shows a clean price. Keep "Taxes included" caption.
- Edit: `src/components/product/ProductDetails.tsx`.

## Files touched

- `src/components/Navbar.tsx` — add search + account icons.
- `src/components/product/ProductGallery.tsx` — share FAB.
- `src/components/product/ProductDetails.tsx` — trust row, pincode slot, tabs wrapper, cleaner price.
- `src/components/product/PincodeChecker.tsx` — new.
- `src/components/product/PriceBreakup.tsx` — new.
- `src/components/product/DetailsTabs.tsx` — new (2-tab wrapper).
- `src/components/StickyAddToCart.tsx` — add Buy It Now button.
- `src/components/Footer.tsx` — Popular Searches block.

## Deliberately NOT copied from Palmonas

- Their sans-serif typography, black-heavy palette, cluttered look — we keep Velista + sage.
- Dynamic gold-rate "Calculating price…" — irrelevant to couture.
- "Download the App" card — no Naira app.
- Announcement-bar red pill styling — we keep our sage ✦ divider.
- Full-width search box under the header — hidden behind icon instead.
- Metal Details / Diamond Details spec tables — Naira products are apparel, structured spec table would look forced.

## Verify
- Playwright screenshot of `/product/blush-of-dawn` at 390×844 after build, compare against Palmonas capture in `/tmp/browser/compare/`. Confirm every "worth stealing" item is present.

## Ready to build?

Approve and I'll implement in one pass.
