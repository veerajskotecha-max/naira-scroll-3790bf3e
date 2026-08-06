# Sizing reference and audit

Every generated frame was checked for scale against the supplier book
**`NAIRA_JEWELLERY___Finalised_SKUs`** (Drive, 13 July 2026 — 66 styles, 90
order lines, 394 pieces across Yiwu J&D, KAVNAR and Foshan Yiss Fera).

## First, the mapping gap

The finalised book numbers styles by supplier code — `JDB0104010`,
`E14066B`, `YF5143`. The website's Gilded Hour line numbers them
`NF-GH-R01-VXX` and so on. **The two schemes do not overlap**, and the book
carries no `NF-GH-*` column, so there is no per-SKU dimension for the 22
styles that were shot.

What the book does give is the house's real dimensional language, which is
what the audit was run against:

| From the book | Value |
|---|---|
| Bracelet lengths | 20cm, 20.5cm (`YF3925`, `YF5144`) |
| Necklace lengths | 43cm, 45cm, 50cm (`YF3925`, `YF5144`, `YF5146`) |
| Chain gauge | 1.2mm (`YF-DIYChain`) |
| Ring sizes | 6, 7, 8, 9 (`YF5214`, `JDR0303312-7`) |

Plus the two dimensions already in `src/data/jewellery.ts`: the Ripple Hoop
at **20mm** and the Rosewater Line's **5cm extender**.

## The standard applied

| Category | Dimension | How it must read on the body |
|---|---|---|
| Rings | size 6–9 → 16.5–19mm inner Ø, shank ~2mm, centre stone 5–7mm | stone no wider than half the finger |
| Bracelets | 20–20.5cm; baroque pearls 9–11mm | a shirt-button pearl, ~⅙ the wrist's width |
| Necklaces | 43cm at the collarbone, 45cm just below, 50cm mid-sternum; links ~8mm | link no wider than a fingernail |
| Earrings | studs 6–11mm; hoops 20mm | stud covers ~half the lobe; hoop stops level with the lobe's base |

## What failed and was re-shot

Six worn frames were deleted and regenerated with the dimension stated
explicitly in the prompt. All six now pass.

| SKU | Frame | Was | Now |
|---|---|---|---|
| NF-GH-R01-VXX The Vow | worn | stone reading ~3ct, and the hand had drifted off the shared plate | 6mm stone on a size-7 band, back on the plate pose |
| NF-GH-B10-TXX The Tideline | worn | baroque pearls reading ~16mm — marble-sized | 9–11mm pearls along a 20cm strand |
| NF-GH-N18-ACX The Anchor Chain | worn | links reading as a heavy curb chain | 8mm anchor links on a 43cm chain at the collarbone |
| NF-GH-N19-CXX The Cascade | worn | drop running down the sternum, stones too small | short drop on a 43cm chain, four graduated marquise |
| NF-GH-E14-HSX The Halo Stud | worn | crop had zoomed off the shared ear plate | 10mm bow, shared ear crop restored |
| NF-GH-E15-BSX The Bow Stud | worn | hoop reading ~30mm | 20mm hoop, stopping level with the lobe |

The other 60 frames passed. `results.json` carries a `sizing_correction`
note on each re-shot SKU.

## Why worn frames are where sizing breaks

On the plaster block a piece has no reference object, so scale drift is
invisible and harmless. On the body the skin *is* the ruler — a finger, a
lobe, a collarbone all have known dimensions, so any error shows
immediately. That is why the audit is a worn-frame audit, and why the fix
is always a real measurement in the prompt rather than a word like "petite".

## Extending to the finalised 66

The book's 66 supplier styles have not been shot — they are all `Pending` in
`Naira_Petite_66SKU_Image_Tracker`. Shooting them needs source photos from
the three supplier stores, which the tracker links per row. Once those are
in hand the same pipeline runs unchanged: add each style to `skus.json`,
import its photo with `media_import_url`, and re-run `build-jobs.ts`.
