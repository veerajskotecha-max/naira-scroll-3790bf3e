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

### Pass 4 — navigation (live store data, approved)
Both menus pointed at apparel. Rewritten as Shopify menu resources, so the
links resolve by collection/page id rather than a hardcoded path:

| | Was | Now |
|---|---|---|
| `main-menu` | HOME · SHOP ALL · ABOUT NAIRA · MADE FOR YOU · CONTACT | NECKLACES · EARRINGS · BRACELETS · RINGS |
| `footer` | Search · Shop All · About Naira · Made for you | Shop all · Contact · FAQs · Exchange & returns |

Every header link now lands on product rather than on a page. Nothing was
deleted — About Naira, Made for You, Concepts, Gifting and the Wedding Edit
all still exist in Shopify, they are just no longer linked.

One side effect worth knowing: menus are store-wide, so the currently
published theme sees this too. Since no shopper reaches a Shopify-rendered
page today, that changes nothing in practice.

### Pass 5 — the brand layer (logo, Velista, floral)
Savor was still wearing its own clothes: no logo, Shopify's Cormorant
standing in for the real display face, and none of the site's floral art.
All three came out of the ported theme in this repo rather than being
recreated.

**The logo.** Savor renders `{% render 'jumbo-text', text: shop.name %}` when
`settings.logo` is empty — the shop name as plain text, which is what was
showing. `settings.logo` is an `image_picker` against Shopify **Files**, not
theme assets, so the wordmark had to be uploaded there.

Getting a usable file took three tries, and the first two are worth writing
down. `nf-naira-logo.webp` turned out to be 1920×1080 — a padded canvas, not
a wordmark. `nf-naira-logo.svg` is really a 105×24 raster wrapped in an SVG
pattern fill, so it is both too small and unusable as an `image_picker`
value. `nf-wordmark-cream.png` is the right artwork at 520×116, but cream on
transparent — invisible on a warm-white header. It is a palette PNG, so
rewriting its 32-entry PLTE chunk to ink (and recomputing the CRC) produced
`nf-wordmark-ink.png`: the real NAIRA wordmark, floral "I" and all, at full
resolution in brand ink. Uploaded, set, and the 1920×1080 file deleted.

**Velista.** The actual brand display face, uploaded as a theme asset and
wired through `assets/nf-brand.css`, which redefines `--font-heading--family`
— the one token Savor builds every heading from. Two things the port had
already solved and this reuses: the `src` URL is relative because plain .css
assets are served verbatim and never run through Liquid, and there is no
`format()` hint because Shopify's CDN transcodes the stored TTF to WOFF2 on
delivery. Cormorant stays as the fallback.

**Floral.** `nf-floral-pattern-bg.webp` and `nf-floral-corner.webp` ported
across and applied to `#shopify-section-reasons` — the quiet three-claim band
— at 7% and 42% opacity. Behind the calmest part of the page on purpose: a
floral wash under a photograph of a necklace fights the necklace.

**And a bug of my own from pass 1.** Savor draws a *transparent* header over
the hero and paints its text in `background`. Once the ground became warm
white that was warm-white-on-warm-white — an invisible header on the home,
product and collection pages. Transparency off, solid ground, ink text.
Also off: the country and language pickers, two controls nobody in a
single-market Indian store touches. Sticky header on.

Every binary verified by MD5 against the local file after upload, since the
staged-upload path returns no record of its own.

### Pass 6 — the brand book (`naira.pdf`)
The owner sent the brand book. It settles two things I had been guessing at
and overturns one.

**The palette is not what the site has been using.** The book names three
colours and gold is not among them:

| | Hex | Where it goes |
|---|---|---|
| Cream | `FFF8F5` | the ground — already set, and the book confirms it exactly |
| Sage | `99B4AF` | the brand's own colour; the wordmark is set in it |
| Peach | `FFBDA8` | the iris in the logo, and now the sale badge |

`#B0843A` gold, which the React site uses in 46 places, appears nowhere in
the book. It was being used out of habit. `color2` is sage now and the sale
badge is peach with ink on it at 11.2:1.

The book specifies no text or button colour, as brand books usually do not,
so both stay ink. That is a deliberate reading rather than an omission: sage
body text on cream measures **2.1:1** and a sage button would be unreadable,
while the book's own logo application is 2.1:1 *on purpose* — a mark is
exempt from contrast minimums, a paragraph is not.

**The logo is vector, and now it is the real one.** Only two rasters exist in
26 pages, so the wordmark is drawn. Page 3 carries the definitive
application — sage wordmark, peach iris, on cream — and that region was
rendered at 300dpi and cropped to 2073×560. It replaces the ink wordmark
hand-recoloured in pass 5, which is deleted; that was a reconstruction, this
is the artwork.

Page 2's lockup also gives the reversed pair (black on white, white on
black) if a dark surface ever needs one.

Getting here needed poppler, which was not installed and whose first
`apt-get` failed on a stale index; `apt-get update` fixed it. Pillow was
also tried and abandoned — the apt build targets Python 3.12 and this
container runs 3.11 — so the crop was done with `pdftoppm -x -y -W -H`
instead, which needed no new dependency at all.

## Not done yet

- **`templates/collection.json`** — still Savor's demo. Next pass.
- **`list-collections.json`**, `page.json`, `cart.json`, `search.json`.

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
