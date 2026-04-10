

## Plan: Update Product Page Accordion Content

**File to edit:** `src/components/product/ProductDetails.tsx` (lines 228–275)

### Changes

Replace the content of three accordion sections while keeping "Product Information" untouched:

**1. Delivery Timelines (lines 235–239)**
Replace with two bullet points:
- All orders from the website are delivered within 3–7 working days.
- Custom orders are delivered in 45–60 days.

Use a `space-y-1.5` container with individual `<p>` tags prefixed by bullet characters for clean line spacing.

**2. Disclaimer (lines 249–253)**
Replace with two bullet points:
- Dry clean only.
- Product color may slightly vary due to photographic lighting sources or your screen settings.

Same formatting pattern as above.

**3. Additional Information (lines 263–269)**
Replace with three lines:
- For queries or assistance, please WhatsApp / WhatsApp Call on: **+91 9561557935** (phone number in semi-bold with a subtle accent color, e.g. `font-semibold` + `hsl(0 0% 20%)`)
- Manufactured and marketed by Naira Flore
- Address: Flat 7, Veeraj Blossom, Karanyogi Nagar, Nashik – 422002

Same `space-y-1.5` container with `<p>` tags for proper line spacing.

### What stays the same
- Product Information accordion — unchanged
- All typography sizes, tracking, accordion trigger styles
- Expand/collapse behavior
- Mobile responsiveness (already handled by existing layout)

