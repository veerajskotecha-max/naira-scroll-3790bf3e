

## Plan: Create FAQ Page & Integrate Links

### 1. Create `src/pages/FAQs.tsx`

New standalone page following the Exchange & Return Policy layout pattern:

- **Hero**: Title "Frequently Asked Questions", subtext "Everything you need to know before placing your order", `#F4F1ED` background
- **Anchor nav strip**: Links to each of the 5 sections below
- **Content**: 5 accordion sections using the existing `Accordion` UI component (`@/components/ui/accordion`), max-width 760px:
  - **Orders & Customization** — How customization works, timelines (4–8 weeks), modification policy
  - **Shipping & Delivery** — 3–7 days standard, 45–60 days custom, tracking info
  - **Returns & Exchanges** — Summary of policy, custom non-returnable, 48-hour defect window
  - **Product & Care** — Dry clean only, colour variations, handcraft irregularities
  - **Contact & Support** — WhatsApp number, styling assistance availability
- **Need Help? CTA** at bottom with WhatsApp button (same as Exchange & Return page)
- Footer at bottom

### 2. Update `src/App.tsx`

- Import and add route: `/faqs` → `<FAQs />`

### 3. Update `src/components/Footer.tsx`

- The `careLinks` array already has `{ label: "FAQs", to: "/faqs" }` — verify it points to `/faqs` (it does, no change needed)

### 4. Update `src/pages/MadeForYou.tsx`

- Replace the inline `<CustomFAQ />` component with a styled CTA block linking to `/faqs` (e.g. "Have questions? View our FAQs" with a link button), keeping the section visually consistent

### 5. Update `src/components/product/ProductDetails.tsx`

- Add a "View FAQs" link next to or below the existing "View Exchange & Return Policy" link

### Files
- **Create**: `src/pages/FAQs.tsx`
- **Edit**: `src/App.tsx`, `src/pages/MadeForYou.tsx`, `src/components/product/ProductDetails.tsx`

