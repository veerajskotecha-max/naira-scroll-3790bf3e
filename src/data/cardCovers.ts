/*
  The photo each piece's card leads with wherever shoppers browse: the shop
  grid, collections, Most loved, the product page's recommendations, the bag's
  suggestions and search. Just the piece, large: never a model, a hand, the
  gift box or the size guide.

  Chosen by eye on 22 Oct 2026 from every listing's photos. Most are the
  product shot that already leads the listing in Shopify; the ones with a note
  differ from it, and the note says why.

  Matched by file name. A piece missing here, or whose photo has since been
  replaced in Shopify, falls back to the first product shot of its Shopify
  gallery (see cardCover). The product page's own gallery order is untouched.
*/
export const CARD_COVER_FILES: Record<string, string> = {
  "aqua-heart-drops-silver": "WE22108C3_1.jpg",
  "baguette-arc-hoops": "baguette-arc-hoops-0_36619557-b91b-4449-99db-9ba31c4eb7e2.jpg",
  "baguette-eclat-bracelet": "hf_20261021_075229_841998de-6dc7-4361-8378-696346cc24a1.png",
  "baguette-eternity-band": "2507ca8a-c3d5-4e1f-9184-3ea46ce1631d.jpg",
  "baguette-halo-drops": "WE23818B_1.jpg",
  "baguette-huggies": "5b1db5cf-e98e-41c3-b411-f3d165cbf67c.jpg",
  "baguette-tennis-bracelet": "d0f971cc-451f-4aac-a786-a130a4d22e1c.jpg",
  "baguette-tennis-necklace": "42fb467f-1368-4074-b8b5-fcb0594f8d98.jpg",  // the crystal necklace on the block
  "baroque-bloom-cuff": "baroque-bloom-cuff-2.jpg",
  "baroque-pearl-lariat": "baroque-pearl-lariat-2.jpg",  // the listing opens on the model
  "baroque-shell-bracelet": "hf_20260829_210929_c89ac146-44c5-415f-9cbd-fd6af6093299.png",
  "birthstone-heart-necklace": "3741041e-7c59-4bf7-97d6-f7724ce59844.jpg",
  "blush-cluster-ring": "hf_20261021_081012_6a56d25a-965c-4e50-9351-8e791ee043a8.png",
  "blush-station-bracelet": "blush-station-bracelet-0_980b07cd-a586-4075-bb0f-a2658ca4a97f.jpg",
  "bold-dome-huggies": "E200570_5.jpg",  // the huggie close on the block
  "bold-nocturne-bracelet": "hf_20260829_202820_4655468e-3f43-44d3-a072-b82f1349fc13.png",
  "bold-nocturne-chain": "YF5144_3_alt.png",  // the chain on the block; the listing opens on the model
  "bold-nocturne-drops": "2ceb34a3-b476-49ae-8c5d-2dde451ded7e.jpg",
  "brushed-gold-huggies": "brushed-gold-huggies-0_d9e5187c-0e22-4997-988b-81e1533a5ebd.jpg",
  "chain-drop-dome-ring": "9c16b3d6-21af-41ed-8618-86c425893d23.jpg",
  "charm-box-chain": "hf_20261021_081237_8246c610-28ad-4532-a4b0-e758fca00f81.png",  // the charm close on the block
  "chevron-whisper-ring": "chevron-whisper-ring-0_c55321a4-4269-49f6-afa0-8025e597ceae.jpg",
  "clover-charm-necklace": "clover-charm-necklace-0_60fd02ce-f2ff-44ce-a275-f30faaf8b350.jpg",
  "clover-trio-edit": "clover-trio-edit-0_ed1fda50-33d5-436b-a5c6-3c9133b4bf74.jpg",
  "crystal-baguette-eternity-ring": "3bedf26d-84de-4497-bda9-bfd45d44afa3.jpg",
  "crystal-pear-ear-cuff": "crystal-pear-ear-cuff-hero.jpg",
  "cushion-halo-ring": "hf_20261021_080442_3e62cb3f-26c5-4ea9-825d-0fc8b545e0b7.png",
  "droplet-open-cuff": "droplet-open-cuff-hero.jpg",
  "droplet-open-ring": "858efaeb-dfc2-45da-a2fd-f71d07cdc82a.jpg",
  "duo-link-bracelet": "ad28df0a-ae8a-4ff1-aee1-d4fb29d1529f.jpg",  // the bracelet laid on the block
  "duo-link-necklace": "duo-link-necklace-hero.jpg",
  "emerald-deco-hoops": "67a9a867-ec89-4288-ae31-abae55c188b2.jpg",  // the hoops close on the block
  "emerald-halo-c-hoops": "23919771-9988-4795-a4ae-b9ccc71d502f.jpg",
  "emerald-square-ear-cuff": "emerald-square-ear-cuff-hero.jpg",
  "filigree-bloom-studs": "filigree-bloom-studs-0_f3857d31-3b5a-4271-9e05-b80ffaa77693.jpg",
  "fine-tennis-bracelet": "9cbd7508-b1e8-479b-9b46-8b1e232dc34f.jpg",
  "first-light-set": "first-light-set-0_2ac00b30-2c62-45f5-a55b-000ea726002b.jpg",
  "garnet-cable-cuff": "a9f45ee4-e983-4789-9933-b841b30502da.jpg",
  "golden-duet-ring": "hf_20261021_080442_10122fba-d048-4e9c-b875-207de9d6a498.png",
  "granule-dome-ring": "granule-dome-ring-0_b16739f1-1513-46e1-9a4c-bae0d6a9c53e.jpg",
  "halo-curve-ring": "862d208c-22ed-4330-8c8c-e71645248e4d.jpg",
  "heartbead-bracelet": "heartbead-bracelet-3.jpg",
  "heartline-paperclip-necklace": "heartline-paperclip-necklace-0_660f5314-75b0-4ab9-8d78-cfb1bb519987.jpg",
  "kiss-knot-bangle": "34e7babc-ac3e-4b6b-af9d-bfd865e04acb.jpg",
  "lilac-papillon-ring": "WR11674B2_5.jpg",  // the butterfly close on the block
  "lumiere-oval-bracelet": "hf_20260829_211041_19e84071-ec11-4410-a655-b97d8ba0d656.png",
  "lumiere-oval-necklace": "hf_20260829_211042_8828b64e-a588-46c4-96c3-5cdd2eeff282.png",
  "marquise-drop-choker": "dbe1bcdc-c7cf-442c-9251-c2bb08b382d5.jpg",
  "marquise-layering-set": "marquise-layering-set-2.jpg",  // both necklaces on the block; the listing opens on the model
  "mesh-band-ring": "d09d09ef-1fee-4149-9b0c-4faa7092ae35.jpg",
  "mint-pear-drop-earrings": "cd17d6d9-9942-4cc4-8723-9908bdfac3bd.jpg",
  "molten-bloom-hoops": "molten-bloom-hoops-0_26771e6d-f11a-4437-901d-45929c48331e.jpg",
  "molten-panel-bracelet": "BSS00028_1.jpg",
  "north-star-bangle": "75ac3058-b397-4e09-9313-96bef7c64918.jpg",
  "pear-point-open-cuff": "ba00044f-03ad-44c0-893d-502943ddf280.jpg",
  "pearl-blossom-earrings": "pearl-blossom-earrings-0_8b601091-c9d3-48bf-baa8-c3bfebb4950c.jpg",
  "pearl-circlet-studs": "WE20796C_1.jpg",
  "pearl-drop-studs": "pearl-drop-studs-hero.jpg",
  "pearl-legacy-necklace": "hf_20261021_080921_2c211a09-6ed0-492e-9721-6c70f73c906f.png",
  "pearl-nugget-hoops": "6909c402-078c-4ef4-b45e-e1a0a3c9e028.jpg",
  "pearl-point-studs": "pearl-point-studs-0.jpg",
  "pearl-reverie-bracelet": "pearl-reverie-bracelet-1.jpg",
  "pearl-ribbon-ring": "pearl-ribbon-ring-0_cffc36a6-2a0b-4078-bf3d-74090b0bde22.jpg",
  "petal-flower-studs": "dbf16a22-30c8-4453-9b92-3e75a241ebdc.jpg",
  "petite-bow-studs": "E17967C_1.jpg",
  "petite-pave-band": "petite-pave-band-macro.jpg",  // the band close on the block
  "petite-pearl-chain": "petite-pearl-chain-2.jpg",  // the coiled chain reads; the hanging one was a thread
  "petite-square-huggies": "WE25284B1_5.jpg",  // the huggie close; the pair on the block was tiny
  "prism-cluster-studs-silver": "E15838C1_5.jpg",  // the studs larger on the block
  "prism-riviere-bracelet": "prism-riviere-bracelet-0_caf6459a-db93-4679-a68c-a74aeafa2a52.jpg",  // the cream block shot, not the dark ad frame with the logo
  "quatrefoil-eclat-studs": "FE03783B_1.jpg",
  "ribbon-bead-bracelet": "ribbon-bead-bracelet-0_2a52afd2-edcb-4827-8600-e95779d977b8.jpg",
  "ribbon-bow-earrings": "ribbon-bow-earrings-macro.jpg",  // the bow close; the pair on the block was tiny
  "riviere-eternal-bracelet": "YF7085_4_alt.png",  // the listing opens on the model
  "riviere-eternal-necklace": "riviere-eternal-necklace-0_47d234c3-abc4-4cfe-a9ab-caa3ae2e1fb5.jpg",
  "riviere-of-light-bracelet": "riviere-of-light-bracelet-0_1bfa22be-ba1d-4967-bccd-018bd98c3148.jpg",
  "roman-numeral-trio-ring": "83675981-d19c-44bb-9ac2-8450be634ec7.jpg",
  "rose-verdant-band": "rose-verdant-band.jpg",
  "serpentine-whisper-chain": "serpentine-whisper-chain-0_51e2b606-e02d-4389-a9ab-79e1a02faccd.jpg",
  "serpentine-whisper-chain-silver": "hf_20260829_211552_60eab886-839f-4492-95a3-042c70cd96b7.png",
  "silk-mesh-cuff": "ce20c7ee-80cb-4f9a-a2f6-8615ac42b863.jpg",
  "silver-dome-ring": "silver-dome-ring-0_08859528-2db2-47cf-80ba-4f6cd68f34ba.jpg",
  "silver-drop-earrings": "silver-drop-earrings-1.jpg",
  "solitaire-whisper-studs": "solitaire-whisper-studs-3.jpg",  // the stud close; the listing opens on the model
  "star-point-band": "star-point-band-4.jpg",
  "teardrop-lariat": "YF8396_3_alt.png",
  "textured-gold-hoops": "textured-gold-hoops-0_039c8b77-a5ed-4539-8e2a-97a3fa43b662.jpg",
  "tile-stone-bangle": "6ee838bc-b864-45cf-9472-955407a53caf.jpg",
  "toggle-link-chain": "toggle-link-chain-1.jpg",  // the listing opens on the model
  "torsade-huggies": "E156970_5.jpg",  // the huggie close on the block
  "torsade-pearl-cuff": "BSS00066_1.jpg",
  "triple-coil-wrap-bangle": "triple-coil-wrap-bangle-gold-hero.jpg",
  "triple-dawn-cuff": "triple-dawn-cuff-2.jpg",  // the listing opens on a wrist
  "tubogas-dome-ring": "ddc5a7ce-0164-486c-b60a-ac2f4f43ae5b.jpg",
  "verdant-circlet-studs": "verdant-circlet-studs-0_45d95fdc-6489-4cc0-b2ee-a407149df50e.jpg",
  "verdant-cushion-studs": "E19712C_5.jpg",  // the stud close; the pair on the block was tiny
  "verdant-drop-earrings": "hf_20260807_193030_5a9252be-61ad-41d8-b412-31422860c3b5.png",  // the drops close on the block; the pair was tiny
  "verdant-eternity-band": "verdant-eternity-band-1.jpg",
  "vintage-halo-ring": "vintage-halo-ring-angle.jpg",  // the ring close; on the block it was tiny
  "watch-link-ring": "f665150b-1791-4a8f-bf65-e87cfd6e8a69.jpg",
  "whisper-pave-band": "hf_20261021_080442_a66a139d-7ff8-4e13-806e-0661fc25d88a.png",
  "woven-gold-hoops": "woven-gold-hoops-0_6c9f6b30-a09f-479d-bbfa-ab40df3853a4.jpg",
};
