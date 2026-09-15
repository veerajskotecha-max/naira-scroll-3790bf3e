# Sizing audit — 54 live jewellery SKUs

Artifact: https://claude.ai/artifact/JdTBKHyypWjpofijCq7hQC

## What is here

| File | |
|---|---|
| `sku-sizing-audit.json` | every live jewellery SKU, its stated sizing, status and note |
| `sku-sizing-audit.csv` | the same as a spreadsheet |
| `published-standard.md` | the site's own size guide, recovered from history |

## How the set was defined

The Storefront API returns **72 published products**. 54 are jewellery; the
other 18 are the old apparel line (`Blush of Dawn`, `Ivory Whisper Co-ord
Set` and so on), which carry no `productType` and were left alone. Admin
reports 90 products in total — 73 active, 17 draft.

The owner's figure of 54 is exactly the live jewellery count.

## What the audit found

| | |
|---|---|
| Correct as written | 38 |
| Genuinely wrong | 12 |
| Unclear or trivially fixable | 4 |

The expensive one is a contradiction, not a gap. Four rings — Cushion Halo,
Chevron Whisper, Pearl Ribbon, Blush Cluster — state in their Shopify
listing that they are made in a single fixed US 7 and are *not* adjustable.
The live PDP (`src/pages/JewelDetail.tsx`) ignores that and renders the same
ring picker on every ring: **US 6 pre-selected and in stock, US 5 and US 7
marked 45-day pre-orders.** A shopper who reads the description and takes
the default buys a size the description says the ring is not made in.

Sizing never becomes a Shopify variant. `JewelDetail` passes the choice as a
cart **line attribute** (`SIZE_ATTRIBUTE = "Size"` in `src/lib/shopify.ts`),
so stock is not tracked per size and fulfilment reads it off the line item.
That is why no jewellery product carries a Size option in Shopify — and why
auditing Shopify alone gives the wrong answer.

`src/data/ringFit.ts` hard-codes six handles as adjustable and says the set
was "verified against the live Shopify photography and listing copy for
every ring". Four check out. **Halo Curve Ring** and **Rose Verdant Band**
do not — their listings say nothing about size at all, so there was no copy
to verify against, yet the page tells shoppers they adjust to US 6–8.

Seven SKUs state no length in the Details block or the body copy, and have
no supplier sheet. Those numbers cannot be recovered from anything available
here — they need measuring or a note to the manufacturer. No value has been
guessed for them.

## Two corrections to earlier passes

The first run flagged seven rings as contradicting themselves by saying both
"US 7" and "adjustable". They do not. The actual phrases are "US 7, fixed
size, not adjustable" and "adjustable around US 7" — a pattern match had
caught the word inside its own negation. Those seven are counted correct.

The second is larger. The first version of this audit said four rings could
not be bought by anyone who was not a size 7. That was read from Shopify
alone, where no jewellery product carries a Size option. But the storefront
is a React app and it has its own ring picker, so shoppers can and do choose
a size. Auditing the commerce backend without reading the front end that
sits in front of it produced a confident, wrong headline. The real defect is
the opposite one, above.

## Two corrections that are ready

Both state their length in their own body copy but omit it from the Details
block, where shoppers look. Nothing invented.

| SKU | Add to Details | Authority |
|---|---|---|
| `YF5244` Marquise Layering Set | `Length: Approximately 40cm` | own copy, and supplier spec agrees |
| `YF6618` Clover Charm Necklace | `Length: Approximately 42cm` | own copy |

## Also worth knowing

`src/components/SizeGuideModal.tsx` is an **apparel** size guide — bust,
waist, hip, length, XS to XL. It is still in the codebase on a site that now
sells jewellery. `RingSizeGuideModal.tsx` is the jewellery one.

The published guide names three necklace lengths (40 / 45 / 50cm). The
catalogue ships four (40, 42, 46, 50). The guide is incomplete rather than
the products being wrong.
