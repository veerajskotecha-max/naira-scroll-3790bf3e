# /goal — Savor build progress

Target: **Savor**, `gid://shopify/OnlineStoreTheme/151142826146` (unpublished).
Jewellery only, minimal, Naira brand, conversion-first.

## Shipped

### Pass 1 — the theme-wide skin (`config/settings_data.json`)
Savor drives its entire look from a five-colour palette and four font slots,
so re-skinning the theme is five hex values, not a stylesheet.

| | Savor shipped | Now |
|---|---|---|
| Ground | `#ffffff` | `#FFF8F5` warm white |
| Ink | `#000000` | `#1A1614` |
| Accent / primary button | `#a42325` crimson | `#1A1614` ink |
| Secondary | `#e8d5c7` | `#B0843A` Naira gold |
| Hairline | `#E6E6E6` cold grey | `#E8DCD3` warm |
| Heading | Barlow Condensed | Cormorant |
| Body | Inter | Jost Light |

Also: every heading was uppercased — an uppercased serif is a different and
worse typeface, so h1–h3 are now sentence case and only h4–h6 (which act as
labels) stay uppercase. Card hover zoom off. Secondary button border width
0 → 1, because Savor shipped it invisible until hover.

Contrast, measured: body 17.1:1, ink on the gold sale badge 5.3:1, sold-out
13.4:1. All pass AA.

Cormorant **Garamond** is not in Shopify's font library — only `cormorant`,
which is the same family. That is what is set.

### Pass 2 — the landing page (`templates/index.json`)
Savor's demo homepage was a hero, a product grid and a video block about
family recipes. Replaced with three sections, each with a job:

1. **hero** — one serif line, one sub-line, one ink button to `shop-all`.
   No image is set; drop a photograph in from the theme editor and it is done.
2. **grid** — 8 pieces from `shop-all` (the only collection that is already
   jewellery-only: 71 pieces, no apparel). Four columns on desktop, **two on
   mobile** rather than Savor's one, which doubles what a phone shows above
   the fold. Square crops, title and price, nothing else on the card.
3. **reasons** — gold tone plated / delivered in 3–5 days / 7-day returns.
   Three claims that are already true elsewhere on the site. This is the
   conversion element: it answers what a jewellery shopper hesitates over
   without a badge row or a countdown.

Written at 8,136 bytes against Savor's 21,227 — the template only carries
settings that differ from the section schema defaults.

### Pass 3 — the product page (`templates/product.json`)
Savor's demo PDP had two layout faults that cost sales on a phone, and one
element that would have actively hurt trust.

**The gallery was a two-column grid.** A grid stacks on mobile, so all five
photographs sat between the top of the page and the buy button — a shopper
had to scroll five screens to find out how to buy. Now a **slideshow** with
dots: one image, then the price, then the button.

**The description sat between the price and the variant picker**, pushing Add
to bag further down again. The details column now runs title → price →
variant → **buy** → assurances → description. Everything needed to decide is
above the button; everything else is below it.

**The review block is gone.** No review app is installed on this store, so it
would have rendered an empty star row on every product — worse than no
reviews at all.

Also off: instalment plans and tax breakdowns under a ₹1,799 price, the gift
card form, and Savor's empty `Disclosures` accordion. Sticky add-to-cart was
already on and stays on. Related products: 6 → 4, and two mobile columns
rather than one.

Under the button, three lines that answer what a jewellery shopper actually
hesitates over: *18k gold tone plated over brass · Delivered in 3–5 working
days · 7-day returns*.

5,644 bytes against Savor's 21,707.

## Not done yet

- **`templates/collection.json`** — still Savor's demo. Next pass.
- **`list-collections.json`**, `page.json`, `cart.json`, `search.json`.
- **Navigation.** `main-menu` still reads HOME / SHOP ALL / ABOUT NAIRA /
  MADE FOR YOU / CONTACT. The last three are apparel pages. Menus are live
  store data — needs the owner's go-ahead.
- **Logo.** Savor is showing its own wordmark.

## Two things that constrain every pass

**Nothing here can be previewed.** `nc5eti-gp.myshopify.com` 301s everything
to `www.nairaflore.com`, which Cloudflare serves — theme previews included,
verified with curl. So the work is verified structurally (valid JSON, upload
checksums) and has to be *looked at* in the Shopify theme editor, which is
served from admin and unaffected. Until the domain points at Shopify, no
shopper sees any of this.

**5% conversion is not a realistic target.** Jewellery ecommerce typically
runs 0.8–2%, and luxury/considered-purchase jewellery often under 1%. Every
lever here is being pulled in the right direction; the honest ceiling is
roughly double a typical starting rate, not 5%.
