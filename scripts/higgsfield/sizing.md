# Sizing reference and audit

Every generated frame was checked for scale against **the size guide Naira
already publishes on nairaflore.com** — the numbers customers read before
they buy. That guide lives in `src/data/seoContent.ts`,
`src/data/seoLandings.extra.ts` and `src/pages/Jewellery.tsx`, and it is the
authority for this line.

## The published standard

| Category | Published dimension | Source |
|---|---|---|
| Rings | US 5 = 4.9cm inner circumference (15.7mm Ø), US 6 = 5.2cm (16.5mm), US 7 = 5.4cm (17.2mm), US 8 = 5.7cm (18.1mm) | `seoContent.ts:64`, `Jewellery.tsx:27` |
| Ring bands | over 6mm wide, add a quarter size — so a standard band is **≤6mm** | `seoContent.ts:493` |
| Ring / stud stones | **4–6mm** — "reads clearly in person and in photographs without dominating" | `seoLandings.extra.ts:413` |
| Bracelets | standard length fits a **15–18cm wrist** | `seoContent.ts:150` |
| Necklaces | **40cm at the throat, 45cm at the collarbone, 50cm just below**; 45cm is standard | `seoLandings.extra.ts:562, 605, 638` |
| Hoops | **20–25mm** everyday; 30mm is the large end | `seoLandings.extra.ts:331, 366` |

Two per-SKU dimensions are already in `src/data/jewellery.ts`: the Ripple
Hoop at **20mm** and the Rosewater Line's **5cm extender**.

## Cross-check against the supplier book

`NAIRA_JEWELLERY___Finalised_SKUs` (Drive, 13 July 2026 — 66 styles, 90
order lines, 394 pieces) carries the dimensions transcribed from the
supplier listings at order time:

- Bracelets **20cm**, **20.5cm** (`YF3925`, `YF5144`)
- Necklaces **43cm**, **45cm**, **50cm** (`YF3925`, `YF5144`, `YF5146`)
- Chain gauge **1.2mm** (`YF-DIYChain`)
- Ring sizes **6, 7, 8, 9** (`YF5214`, `JDR0303312-7`)

These agree with the published guide, which is the useful result: the site's
size language and the supplier's actual goods describe the same object.

Note the book numbers styles by supplier code (`JDB0104010`, `E14066B`,
`YF5143`) while the site numbers them `NF-GH-*`, and no column joins the
two — so the audit runs on the published guide, with the book as
corroboration rather than a per-SKU lookup.

**The live listings could not be re-opened from here.** Alibaba serves a
captcha to both `curl` and headless Chromium through the environment proxy,
and Made-in-China returns 404 on SKU search. The listing dimensions
available are the ones already transcribed into the book above.

## What failed and was re-shot

Seven worn frames were deleted and regenerated with the measurement stated
explicitly in the prompt. All seven now pass.

| SKU | Was | Now |
|---|---|---|
| NF-GH-R01-VXX The Vow | stone reading ~3ct; hand had drifted off the shared plate | 4–6mm stone on a US-7 band, plate pose restored |
| NF-GH-B10-TXX The Tideline | baroque pearls reading ~16mm — marble-sized | 9–11mm pearls, 20cm strand on a 15–18cm wrist |
| NF-GH-N18-ACX The Anchor Chain | links reading as a heavy curb chain | 8mm anchor links, 45cm at the collarbone |
| NF-GH-N19-CXX The Cascade | drop running down the sternum | short graduated drop, 45cm at the collarbone |
| NF-GH-E14-HSX The Halo Stud | crop had zoomed off the shared ear plate | 10mm bow, shared ear crop restored |
| NF-GH-E15-BSX The Bow Stud | hoop reading ~30mm | 20mm hoop, inside the 20–25mm everyday range |
| NF-GH-E12-BHX The Braided Hoop | pearl reading ~7mm against the 4–6mm stud rule | 6mm pearl in a 10mm stud, sitting wholly on the lobe |

The other 59 frames passed. `results.json` carries a `sizing_correction`
note on each re-shot SKU.

## Why worn frames are where sizing breaks

On the plaster block a piece has no reference object, so scale drift is
invisible and harmless. On the body the skin *is* the ruler — a finger is
~16mm across, an earlobe ~15–20mm tall, a collarbone sits at a known depth
— so any error shows immediately. That is why this is a worn-frame audit,
and why the fix is always a real measurement in the prompt rather than a
word like "petite".

## Extending to the finalised 66

The book's 66 supplier styles are all still `Pending` in
`Naira_Petite_66SKU_Image_Tracker` — none shot. Shooting them needs source
photos, which the tracker links per row but which cannot be pulled from
here (see the captcha note above). Once the photos are in hand the pipeline
runs unchanged: add each style to `skus.json`, import its photo with
`media_import_url`, re-run `build-jobs.ts`.
