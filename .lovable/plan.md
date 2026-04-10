

## Plan: Create Exchange & Return Policy Page

### Overview
Create a new static page at `/exchange-return-policy` following the same layout pattern as the Privacy Policy page, then link it from the footer and product page.

### Files to Create

**1. `src/pages/ExchangeReturnPolicy.tsx`**
- Follow the exact same structure as `PrivacyPolicy.tsx` (hero header with `#F4F1ED` background, 760px max-width content area, section dividers)
- Hero: title "Exchange & Return Policy", subtext: "Please review our policy carefully before making a purchase."
- Anchor navigation strip below hero linking to the 3 sections
- Three content sections with headings, bullet points, and proper spacing:
  - **Custom Orders (Made for You)** — non-returnable/non-exchangeable notice
  - **Standard (Ready-to-Ship) Orders** — 48-hour defect return process with WhatsApp contact steps, resolution options
  - **Not Eligible for Returns** — worn/washed/altered items, colour variations, handcraft irregularities
- **Need Help? CTA** at bottom with a WhatsApp button linking to `https://wa.me/919561557935`
- Footer component at the bottom

### Files to Edit

**2. `src/App.tsx`**
- Import `ExchangeReturnPolicy` page
- Add route: `<Route path="/exchange-return-policy" element={<ExchangeReturnPolicy />} />`

**3. `src/components/Footer.tsx`**
- Update `careLinks` array: change the existing "Return & Exchange Policy" entry's `to` from `/returns` to `/exchange-return-policy`

**4. `src/components/product/ProductDetails.tsx`**
- Add a subtle "View Exchange & Return Policy" link below the CTA buttons (after the "Inquire About Customization" button), styled as an understated text link matching the page's typography

