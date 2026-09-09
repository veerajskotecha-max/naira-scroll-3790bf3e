# Naira Petite — working notes

## The jewellery proof sheet is the standing verification document

There is ONE proof sheet for jewellery product imagery. Do not create a new one.

- **Live artifact:** https://claude.ai/code/artifact/444d3189-88e4-47ca-abbc-6c47a5f6aaea
- **Title:** "Naira Jewellery Proof Sheet"

**Every time we verify product images, use this document and update it in place.**
Republish to the same URL rather than publishing a new artifact — pass that URL as
`url` to the Artifact tool from any conversation that did not itself publish it.
Read it first (`action: "read"`) and build the update on what comes back.

### What it must always contain

- **All jewellery SKUs on Shopify.** As of 9 Sep 2026 that is **71** (90 products
  total, minus 19 with an empty `productType`, which are clothing). Jewellery is
  identified by a non-empty `productType`: Ring, Necklace, Bracelet, Earrings,
  Jewellery Set. Re-derive this count each time; do not assume 71 still holds.
- **Every live product image** for each SKU, in its real Shopify media order,
  labelled by position, with its alt-text status.
- For any SKU we have shot: the supplier reference and the new frames beside it,
  with the measurement each frame was checked against.

### The rule that governs what goes in

A generated frame is only allowed in the sheet if it depicts the **same physical
piece** as the images already on that product page. The live product page is the
authority — above the supplier photograph and above the listing copy. Where a Drive
supplier photo disagrees with the live page, re-shoot from the live page. Where the
listing copy disagrees with every photograph, follow the photographs and flag the
copy.

### Standing constraints

- Jewellery only. Never touch clothing images.
- Nothing is uploaded to Shopify and nothing is committed until the user approves
  the sheet.
- Never publish a theme, never write to theme `143850864802` ("Naira official", LIVE),
  never change DNS, never touch Settings → Payments or the Razorpay app, never delete
  a theme or theme file.
- Do not commit campaign assets (images, video, generated frames) to this repo.

### Where the pipeline lives

`scripts/higgsfield/` holds the shot pipeline: `prompt.ts` (the fidelity lock and
per-category staging), `plates.json` (the five staging plates, reused as IMAGE 2 so
the whole catalogue reads as one shoot), and `sizing.md` (the published size standard
every worn frame is measured against).
