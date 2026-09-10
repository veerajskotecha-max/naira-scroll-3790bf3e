# Brand artwork, extracted from the book

Source: `naira.pdf` (12 pages, "ppt nera", Illustrator 29.5). The book is not
in this repo — it was supplied by the owner. Everything here was rendered
from it with `pdftoppm` and encoded to WebP through a Chromium canvas
(`shopify/harness/webp.mjs`), because this container has no Pillow.

## The three named colours

Confirmed by histogramming page 3 at 150dpi, not by eye.

| | Hex |
|---|---|
| Cream | `#FFF8F5` |
| Sage | `#99B4AF` |
| Peach | `#FFBDA8` |

Gold (`#B0843A`), which the React site uses in 46 places, appears nowhere in
the book.

## The floral

Page 4, BRAND LOOK. A watercolour composition — two blush tulips, a bud, a
fan of sage leaves — given in two colourways, on cream and on sage.

These are **washes**, not line art. Measured range:

| | Lightest | Deepest |
|---|---|---|
| Petals | `#FCEEEA` | `#FBD4CD` |
| Leaves | `#EBEDEA` | `#D2DBD6` |

So sage and peach are accents; the ambient floral sits at 10–25% tints of
them. Anything drawn at full strength reads wrong.

| File | | |
|---|---|---|
| `nf-flora-blooms.webp` | 1400w | blooms only, cream ground |
| `nf-flora-leaves.webp` | 1400w | leaf spray only, cream ground |
| `nf-flora-blooms-sage.webp` | 1400w | blooms only, sage ground |
| `nf-brand-look-cream.webp` | 1200w | the full page-4 composition, cream |
| `nf-brand-look-sage.webp` | 1200w | the full page-4 composition, sage |

The two `flora-*` crops are free of the wordmark — the blooms sit above it
in the artwork and the leaves below, so both crop clean.

Grounds are kept rather than keyed to transparency. The cream ground is
`#FFF8F5` exactly, the same token the theme already uses, so a crop drops
onto a cream section seamlessly; keying pale washes would only add fringing.

Do not use `src/assets/background_image_flora.webp` in its place. That is a
tan engraved damask on ivory — stock, and in the gold family the book
excludes.

## Regenerating

```
pdftoppm -png -r 150 -f 4 -l 4 -x 2000 -y 100 -W 2000 -H 1050 naira.pdf blooms
node shopify/harness/webp.mjs blooms-04.png nf-flora-blooms.webp 1400 0.86
```

`shopify/harness/hist.mjs <png> <n>` prints the n most common colours,
quantised so watercolour washes group; `sheet.mjs <dir> <cols> <pages> <out>`
builds a contact sheet so a deck can be read in one pass.
