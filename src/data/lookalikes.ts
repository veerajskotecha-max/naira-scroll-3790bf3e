/* GENERATED from the photo check of 1 November 2026 — see src/lib/pairings.ts.

   Pieces that look alike, matched from their photos rather than their names.
   Three finders went through every live piece's photo (stones and colour;
   motif and construction; the same design sold as separate listings), two
   checkers confirmed each group photo by photo and dropped any piece that did
   not plainly match, and a critic looked for misses.

     twin: the same design, or plainly made as one matching set;
     set:  the same look (stones, colour and setting, or one distinctive motif,
           in the same metal), but not one design.

   A piece that matches only in another colour than its own photo is left out
   of that group, so a card never offers a ruby ring as the match for green
   earrings. A pair that sits in more than one group was matched more than once
   and ranks closer. A handle that leaves the shop simply matches nothing. */
export type Lookalike = "twin" | "set";

export const LOOKALIKES: ReadonlyArray<readonly [Lookalike, readonly string[]]> = [
  // Amethyst Carré Bracelet · Blush Carré Bracelet · Champagne Carré Bracelet · Emerald Carré Bracelet · Sapphire Carré Bracelet
  ["twin", ["amethyst-carre-bracelet", "blush-carre-bracelet", "champagne-carre-bracelet", "emerald-carre-bracelet", "sapphire-carre-bracelet"]],
  // Baguette Arc Hoops · Baguette Éclat Bracelet · Baguette Huggies · Baguette Tennis Bracelet · Baguette Tennis Necklace · Crystal Baguette Eternity Ring
  ["twin", ["baguette-arc-hoops", "baguette-eclat-bracelet", "baguette-huggies", "baguette-tennis-bracelet", "baguette-tennis-necklace", "crystal-baguette-eternity-ring"]],
  // Baguette Éclat Bracelet · Baguette Tennis Bracelet
  ["twin", ["baguette-eclat-bracelet", "baguette-tennis-bracelet"]],
  // Baguette Éclat Bracelet · Baguette Eternity Band · Baguette Huggies · Baguette Tennis Bracelet · Baguette Tennis Necklace · Crystal Baguette Eternity Ring
  ["twin", ["baguette-eclat-bracelet", "baguette-eternity-band", "baguette-huggies", "baguette-tennis-bracelet", "baguette-tennis-necklace", "crystal-baguette-eternity-ring"]],
  // Baguette Eternity Band · Crystal Baguette Eternity Ring
  ["twin", ["baguette-eternity-band", "crystal-baguette-eternity-ring"]],
  // Baguette Eternity Band · Baguette Huggies · Baguette Tennis Bracelet · Baguette Tennis Necklace
  ["twin", ["baguette-eternity-band", "baguette-huggies", "baguette-tennis-bracelet", "baguette-tennis-necklace"]],
  // Baroque Shell Bracelet · Pearl Legacy Necklace
  ["twin", ["baroque-shell-bracelet", "pearl-legacy-necklace"]],
  // Bold Nocturne Bracelet · Bold Nocturne Chain · Bold Nocturne Drops
  ["twin", ["bold-nocturne-bracelet", "bold-nocturne-chain", "bold-nocturne-drops"]],
  // Bow Pear Drop Necklace · Ribbon Bead Bracelet
  ["twin", ["bow-pear-drop-necklace", "ribbon-bead-bracelet"]],
  // Clover Chain Bracelet · Clover Charm Necklace · Clover Drop Earrings · Clover Drop Pendant Necklace · Clover Station Bracelet · Clover Trio Edit
  ["twin", ["clover-chain-bracelet", "clover-charm-necklace", "clover-drop-earrings", "clover-drop-pendant-necklace", "clover-station-bracelet", "clover-trio-edit"]],
  // Clover Drop Earrings · Clover Drop Pendant Necklace
  ["twin", ["clover-drop-earrings", "clover-drop-pendant-necklace"]],
  // Cushion Halo Ring · Solitaire Whisper Studs · Whisper Pavé Band
  ["twin", ["cushion-halo-ring", "solitaire-whisper-studs", "whisper-pave-band"]],
  // Droplet Open Cuff · Droplet Open Ring
  ["twin", ["droplet-open-cuff", "droplet-open-ring"]],
  // Duo Link Bracelet · Duo Link Necklace
  ["twin", ["duo-link-bracelet", "duo-link-necklace"]],
  // Granule Dome Ring · Pavé Dome Ring
  ["twin", ["granule-dome-ring", "silver-dome-ring"]],
  // Lumière Oval Bracelet · Lumière Oval Necklace
  ["twin", ["lumiere-oval-bracelet", "lumiere-oval-necklace"]],
  // Lumière Oval Bracelet · Lumière Oval Necklace · Lumière Solitaire Bracelet
  ["twin", ["lumiere-oval-bracelet", "lumiere-oval-necklace", "lumiere-solitaire-bracelet"]],
  // Prism Pear Drop Hoops · Prism Pear Drop Necklace
  ["twin", ["prism-pear-drop-hoops", "prism-pear-drop-necklace"]],
  // Serpentine Whisper Chain · Serpentine Whisper Chain — Silver
  ["twin", ["serpentine-whisper-chain", "serpentine-whisper-chain-silver"]],
  // Twin Heart Necklace · Twin Heart Studs
  ["twin", ["twin-heart-necklace", "twin-heart-studs"]],
  // Watch Link Ring · Watch Link Strap Bracelet
  ["twin", ["watch-link-ring", "watch-link-strap-bracelet"]],
  // Aquarelle Rivière Bracelet · Midnight Rivière Bracelet
  ["set", ["aquarelle-riviere-bracelet", "midnight-riviere-bracelet"]],
  // Aquarelle Rivière Bracelet · Midnight Rivière Bracelet · Sapphire Carré Bracelet
  ["set", ["aquarelle-riviere-bracelet", "midnight-riviere-bracelet", "sapphire-carre-bracelet"]],
  // Aquarelle Rivière Bracelet · Midnight Rivière Bracelet · Sorbet Rivière Bracelet
  ["set", ["aquarelle-riviere-bracelet", "midnight-riviere-bracelet", "sorbet-riviere-bracelet"]],
  // Asscher Solitaire Ring · Serpentine Whisper Chain
  ["set", ["asscher-solitaire-ring", "serpentine-whisper-chain"]],
  // Asscher Solitaire Ring · Cushion Solitaire Ring · Lumière Oval Solitaire Ring
  ["set", ["asscher-solitaire-ring", "cushion-solitaire-ring", "lumiere-oval-solitaire-ring"]],
  // Asscher Solitaire Ring · Cushion Solitaire Ring · Dewdrop Pendant Necklace · First Light Set · Lumière Oval Solitaire Ring · Serpentine Whisper Chain · Solitaire Drop Huggies
  ["set", ["asscher-solitaire-ring", "cushion-solitaire-ring", "dewdrop-bezel-necklace", "first-light-set", "lumiere-oval-solitaire-ring", "serpentine-whisper-chain", "solitaire-drop-huggies"]],
  // Baguette Arc Hoops · Baguette Éclat Bracelet · Baguette Tennis Bracelet · Baguette Tennis Necklace · Crystal Baguette Eternity Ring
  ["set", ["baguette-arc-hoops", "baguette-eclat-bracelet", "baguette-tennis-bracelet", "baguette-tennis-necklace", "crystal-baguette-eternity-ring"]],
  // Baguette Halo Drops · Filigree Bloom Studs · Pearl Point Studs
  ["set", ["baguette-halo-drops", "filigree-bloom-studs", "pearl-point-studs"]],
  // Baroque Bloom Cuff · Halo Curve Ring
  ["set", ["baroque-bloom-cuff", "halo-curve-ring"]],
  // Baroque Pearl Lariat · Pearl Reverie Bracelet
  ["set", ["baroque-pearl-lariat", "pearl-reverie-bracelet"]],
  // Birthstone Heart Necklace · Emerald Carré Bracelet · Emerald Square Ear Cuff
  ["set", ["birthstone-heart-necklace", "emerald-carre-bracelet", "emerald-square-ear-cuff"]],
  // Birthstone Heart Necklace · Emerald Carré Bracelet · Emerald Square Ear Cuff · Verdant Circlet Studs
  ["set", ["birthstone-heart-necklace", "emerald-carre-bracelet", "emerald-square-ear-cuff", "verdant-circlet-studs"]],
  // Blush Carré Bracelet · Lilac Papillon Ring
  ["set", ["blush-carre-bracelet", "lilac-papillon-ring"]],
  // Blush Carré Bracelet · Blush Cluster Ring · Blush Station Bracelet
  ["set", ["blush-carre-bracelet", "blush-cluster-ring", "blush-station-bracelet"]],
  // Blush Cluster Ring · Blush Station Bracelet
  ["set", ["blush-cluster-ring", "blush-station-bracelet"]],
  // Bold Dome Huggies · Chain Drop Dome Ring
  ["set", ["bold-dome-huggies", "chain-drop-dome-ring"]],
  // Bold Dome Huggies · Brushed Gold Huggies · Torsade Huggies
  ["set", ["bold-dome-huggies", "brushed-gold-huggies", "torsade-huggies"]],
  // Bold Dome Huggies · Brushed Gold Huggies · Petite Square Huggies · Torsade Huggies
  ["set", ["bold-dome-huggies", "brushed-gold-huggies", "petite-square-huggies", "torsade-huggies"]],
  // Bow Pear Drop Necklace · Lotus Pear Drop Studs
  ["set", ["bow-pear-drop-necklace", "lotus-pear-drop-studs"]],
  // Bow Pear Drop Necklace · Ribbon Bead Bracelet · Ribbon Bow Earrings
  ["set", ["bow-pear-drop-necklace", "ribbon-bead-bracelet", "ribbon-bow-earrings"]],
  // Bow Pear Drop Necklace · Dewdrop Pendant Necklace · Lotus Pear Drop Studs
  ["set", ["bow-pear-drop-necklace", "dewdrop-bezel-necklace", "lotus-pear-drop-studs"]],
  // Bow Pear Drop Necklace · Ribbon Bead Bracelet · Twin Heart Necklace · Twin Heart Studs
  ["set", ["bow-pear-drop-necklace", "ribbon-bead-bracelet", "twin-heart-necklace", "twin-heart-studs"]],
  // Bow Pear Drop Necklace · Pearl Ribbon Ring · Ribbon Bead Bracelet · Ribbon Bow Earrings
  ["set", ["bow-pear-drop-necklace", "pearl-ribbon-ring", "ribbon-bead-bracelet", "ribbon-bow-earrings"]],
  // Chevron Whisper Ring · Petite Pavé Band
  ["set", ["chevron-whisper-ring", "petite-pave-band"]],
  // Clover Chain Bracelet · Clover Charm Necklace · Clover Drop Earrings · Clover Drop Pendant Necklace · Clover Station Bracelet · Clover Trio Edit · Petal Flower Studs
  ["set", ["clover-chain-bracelet", "clover-charm-necklace", "clover-drop-earrings", "clover-drop-pendant-necklace", "clover-station-bracelet", "clover-trio-edit", "petal-flower-studs"]],
  // Clover Drop Earrings · Clover Trio Edit · Petal Flower Studs
  ["set", ["clover-drop-earrings", "clover-trio-edit", "petal-flower-studs"]],
  // Crystal Pear Ear Cuff · Pear Point Open Cuff
  ["set", ["crystal-pear-ear-cuff", "pear-point-open-cuff"]],
  // Crystal Pear Ear Cuff · Emerald Square Ear Cuff
  ["set", ["crystal-pear-ear-cuff", "emerald-square-ear-cuff"]],
  // Crystal Pear Ear Cuff · Dewdrop Pendant Necklace · Pear Point Open Cuff
  ["set", ["crystal-pear-ear-cuff", "dewdrop-bezel-necklace", "pear-point-open-cuff"]],
  // Cushion Halo Ring · Vintage Halo Ring · Whisper Pavé Band
  ["set", ["cushion-halo-ring", "vintage-halo-ring", "whisper-pave-band"]],
  // Cushion Halo Ring · Solitaire Whisper Studs · Vintage Halo Ring · Whisper Pavé Band
  ["set", ["cushion-halo-ring", "solitaire-whisper-studs", "vintage-halo-ring", "whisper-pave-band"]],
  // Emerald Carré Bracelet · Emerald Square Ear Cuff
  ["set", ["emerald-carre-bracelet", "emerald-square-ear-cuff"]],
  // Emerald Deco Hoops · Emerald Halo C-Hoops · Verdant Cushion Studs · Verdant Eternity Band
  ["set", ["emerald-deco-hoops", "emerald-halo-c-hoops", "verdant-cushion-studs", "verdant-eternity-band"]],
  // Emerald Halo C-Hoops · Verdant Eternity Band
  ["set", ["emerald-halo-c-hoops", "verdant-eternity-band"]],
  // Fine Tennis Bracelet · Rivière Eternal Bracelet · Rivière Eternal Necklace · Rivière of Light Bracelet
  ["set", ["fine-tennis-bracelet", "riviere-eternal-bracelet", "riviere-eternal-necklace", "riviere-of-light-bracelet"]],
  // Fine Tennis Bracelet · Midnight Rivière Bracelet · Rivière Eternal Bracelet · Rivière of Light Bracelet · Sorbet Rivière Bracelet
  ["set", ["fine-tennis-bracelet", "midnight-riviere-bracelet", "riviere-eternal-bracelet", "riviere-of-light-bracelet", "sorbet-riviere-bracelet"]],
  // First Light Set · Solitaire Drop Huggies
  ["set", ["first-light-set", "solitaire-drop-huggies"]],
  // First Light Set · Lumière Oval Solitaire Ring · Solitaire Drop Huggies
  ["set", ["first-light-set", "lumiere-oval-solitaire-ring", "solitaire-drop-huggies"]],
  // Garnet Cable Cuff · Torsade Pearl Cuff
  ["set", ["garnet-cable-cuff", "torsade-pearl-cuff"]],
  // Heartline Paperclip Necklace · Twin Heart Necklace · Twin Heart Studs
  ["set", ["heartline-paperclip-necklace", "twin-heart-necklace", "twin-heart-studs"]],
  // Kiss Knot Bangle · Marquise Drop Choker · Triple Coil Wrap Bangle · Tubogas Dome Ring
  ["set", ["kiss-knot-bangle", "marquise-drop-choker", "triple-coil-wrap-bangle", "tubogas-dome-ring"]],
  // Linked Pair Ring · North Star Bangle · Star Point Band
  ["set", ["linked-trio-ring", "north-star-bangle", "star-point-band"]],
  // Lotus Pear Drop Studs · Marquise Drop Choker · Marquise Layering Set · Marquise Coil Cuff
  ["set", ["lotus-pear-drop-studs", "marquise-drop-choker", "marquise-layering-set", "marquise-wheat-cuff"]],
  // Lumière Oval Bracelet · Lumière Oval Necklace · Lumière Oval Solitaire Ring
  ["set", ["lumiere-oval-bracelet", "lumiere-oval-necklace", "lumiere-oval-solitaire-ring"]],
  // Lumière Oval Bracelet · Lumière Oval Necklace · Lumière Oval Solitaire Ring · Lumière Solitaire Bracelet
  ["set", ["lumiere-oval-bracelet", "lumiere-oval-necklace", "lumiere-oval-solitaire-ring", "lumiere-solitaire-bracelet"]],
  // Mesh Band Ring · Silk Mesh Cuff
  ["set", ["mesh-band-ring", "silk-mesh-cuff"]],
  // Molten Bloom Hoops · Molten Wave Ear Cuff · Triple Dawn Cuff
  ["set", ["molten-bloom-hoops", "molten-wave-ear-cuff", "triple-dawn-cuff"]],
  // Molten Panel Bangle · Watch Link Ring · Watch Link Strap Bracelet
  ["set", ["molten-panel-bracelet", "watch-link-ring", "watch-link-strap-bracelet"]],
  // North Star Bangle · Star Point Band
  ["set", ["north-star-bangle", "star-point-band"]],
  // Open Heart Layered Bracelet · Pearl Heart Layered Necklace
  ["set", ["open-heart-layered-bracelet", "pearl-heart-layered-necklace"]],
  // Pearl Blossom Earrings · Petite Bow Studs
  ["set", ["pearl-blossom-earrings", "petite-bow-studs"]],
  // Pearl Point Studs · Torsade Pearl Cuff
  ["set", ["pearl-point-studs", "torsade-pearl-cuff"]],
  // Prism Cluster Studs · Prism Rivière Bracelet
  ["set", ["prism-cluster-studs-silver", "prism-riviere-bracelet"]],
  // Prism Pear Drop Hoops · Prism Pear Drop Necklace · Sorbet Rivière Bracelet
  ["set", ["prism-pear-drop-hoops", "prism-pear-drop-necklace", "sorbet-riviere-bracelet"]],
  // Rivière Eternal Bracelet · Rivière Eternal Necklace
  ["set", ["riviere-eternal-bracelet", "riviere-eternal-necklace"]],
  // Torsade Huggies · Woven Gold Hoops
  ["set", ["torsade-huggies", "woven-gold-hoops"]],
];
