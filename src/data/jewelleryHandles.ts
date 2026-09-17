/* Every ACTIVE jewellery handle in Shopify (vendor "Naira Petite").

   This exists for ONE job: deciding, on the very first render of
   /products/<handle>, whether that handle belongs to the jewellery line so the
   hop to /jewellery/<handle> can happen immediately.

   It is deliberately just strings, not the catalogue. `src/data/jewellery.ts`
   carries only the 21 pieces needed for a first paint, so it answered that
   question for 21 of 56 pieces — the other 35 had to mount the apparel page,
   fetch the product from Shopify and only then redirect. Those 35 include most
   of the handles the Facebook catalogue ads point at, so paid clicks were
   paying for a round trip before reaching the page that sells.

   A handle missing here costs a round trip, never correctness: ProductDetail
   still resolves the product and redirects on `isJewelleryProduct`. So this
   list going stale is a performance regression, not a broken page — regenerate
   it when the jewellery line changes:

     products(first: 250) { edges { node { handle vendor status } } }

   keeping vendor "Naira Petite" and status ACTIVE.

   Last regenerated 2026-09-17 against the live store: 56 pieces. */
export const JEWELLERY_HANDLES: ReadonlySet<string> = new Set([
  "baguette-arc-hoops",
  "baguette-eclat-bracelet",
  "baroque-bloom-cuff",
  "baroque-pearl-lariat",
  "baroque-shell-bracelet",
  "blush-cluster-ring",
  "blush-station-bracelet",
  "bold-nocturne-bracelet",
  "bold-nocturne-chain",
  "brushed-gold-huggies",
  "charm-box-chain",
  "chevron-whisper-ring",
  "clover-charm-necklace",
  "clover-trio-edit",
  "cushion-halo-ring",
  "dewdrop-bezel-necklace",
  "filigree-bloom-studs",
  "first-light-set",
  "granule-dome-ring",
  "halo-curve-ring",
  "heartbead-bracelet",
  "heartline-paperclip-necklace",
  "lumiere-oval-bracelet",
  "lumiere-oval-necklace",
  "marquise-layering-set",
  "molten-bloom-hoops",
  "pearl-blossom-earrings",
  "pearl-drop-studs",
  "pearl-legacy-necklace",
  "pearl-point-studs",
  "pearl-reverie-bracelet",
  "pearl-ribbon-ring",
  "petal-pearl-drop-studs",
  "petite-pave-band",
  "petite-pearl-chain",
  "prism-riviere-bracelet",
  "ribbon-bead-bracelet",
  "ribbon-bow-earrings",
  "riviere-eternal-necklace",
  "riviere-of-light-bracelet",
  "rose-verdant-band",
  "serpentine-whisper-chain",
  "serpentine-whisper-chain-silver",
  "silver-dome-ring",
  "silver-drop-earrings",
  "solitaire-whisper-studs",
  "star-point-band",
  "textured-gold-hoops",
  "toggle-link-chain",
  "triple-dawn-cuff",
  "verdant-circlet-studs",
  "verdant-drop-earrings",
  "verdant-eternity-band",
  "vintage-halo-ring",
  "whisper-pave-band",
  "woven-gold-hoops",
]);
