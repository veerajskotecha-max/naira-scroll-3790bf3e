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
| Correct as written | 35 |
| Genuinely wrong | 15 |
| Unclear or trivially fixable | 4 |

The expensive one: **four rings are made in a single fixed US 7 and sold as
one variant with no size selector** — Cushion Halo, Chevron Whisper, Pearl
Ribbon, Blush Cluster. Nobody who is not a size 7 can buy them. The supplier
lists two of these styles in four sizes (`YF5214` in US 6/7/8/9; the `-7` in
`JDR0303312-7` *is* the size), so the choice exists upstream and is not
being offered downstream.

Seven SKUs state no length in the Details block or the body copy, and have
no supplier sheet. Those numbers cannot be recovered from anything available
here — they need measuring or a note to the manufacturer. No value has been
guessed for them.

## A correction to the first pass

The first run flagged seven rings as contradicting themselves by saying both
"US 7" and "adjustable". They do not. The actual phrases are "US 7, fixed
size, not adjustable" and "adjustable around US 7" — a pattern match had
caught the word inside its own negation. Those seven are counted correct.
The lesson is the usual one: read the sentence before reporting the match.

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
