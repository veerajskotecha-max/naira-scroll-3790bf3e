/* ───────────────────────────────────────────────────────────────
   NAIRA PETITE — Naira Flore's demi-fine jewellery line.
   Generated from the live Shopify catalogue: every piece below is an
   ACTIVE listing (Naira Petite). Pieces removed from Shopify are
   removed here too.
   ─────────────────────────────────────────────────────────────── */

export type JewelCategory = "Rings" | "Bracelets" | "Earrings" | "Necklaces";

/** Live now: orders ship in 3–5 working days. */
export const PREORDER_LABEL = "Pre-order open";
export const LAUNCH_DATE_LABEL = "3–5 working days";
export const PREORDER_NOTE =
  "Delivery in 3–5 working days.";
export const PREORDER_NOTE_SHORT = "Delivery in 3–5 working days";

/* A piece that cannot ship now has ONE lead time, said wherever the product
   page speaks of delivery. A sold-out piece used to read "shipped within 2
   weeks" under the button, "Delivery in 3–5 working days" in Delivery &
   returns and a dated pincode promise, all at once. */
export const SOLD_OUT_LEAD = "Hand-finished for you and shipped within 2 weeks";
export const SIZE_PREORDER_LEAD = "delivered in 45 days";
export const VARIANT_SOLD_OUT_LEAD = "Reserve it and we will confirm the date on WhatsApp.";

/** The product page's delivery line for a piece it cannot ship now, or null when it can. */
export const preorderLead = (state: { soldOut: boolean; variantSoldOut: boolean; sizePreorder: boolean; size?: string }): string | null =>
  state.soldOut
    ? `${SOLD_OUT_LEAD}.`
    : state.variantSoldOut
      ? VARIANT_SOLD_OUT_LEAD
      : state.sizePreorder
        ? `US ${state.size} is a pre-order, ${SIZE_PREORDER_LEAD}.`
        : null;

export interface JewelPiece {
  handle: string;
  name: string;
  category: JewelCategory;
  sku: string;
  number: string;
  price: number;
  priceLabel: string;
  /** MRP from Shopify's compare-at price, when the piece is on offer. */
  compareAtPrice?: number;
  compareAtLabel?: string;
  /** Shopify variant GID — used for Add to Cart and checkout. */
  variantId: string;
  availableForSale: boolean;
  image: string;
  /** The listing's lead product photo in Shopify, for cards (see cardCover). */
  cover?: string;
  gallery?: string[];
  /** Shopify's alt text for gallery photos that have a real description,
      keyed by URL without its query (see lib/galleryAlt). */
  galleryAlt?: Record<string, string>;
  /** The listing's size guide photo (also the last gallery photo), shown in Details. */
  sizeGuide?: string;
  blurb: string;
  /** Full Shopify listing description. */
  description?: string;
  stylingTip?: string;
  /** Spec pairs, "Label: value". Rendered as a list, never joined into prose. */
  details?: string[];
  care?: string;
  materials: string;
  tag?: string;
  /** Shopify tags — power the style/occasion filters on the listing page. */
  tags?: string[];
  /** The choices Shopify offers ("Metal", "Stone", "Size", "Month"), each with
      its values. Absent on a piece sold one way only. */
  options?: Array<{ name: string; values: string[] }>;
  /** Every way the piece is sold, when there is more than one. */
  variants?: JewelVariant[];
  /** On a shop-grid card that shows one colour of the piece ("Metal" → "Silver");
      see colourCards. */
  colour?: { option: string; value: string };
}

/** One way a piece is sold: a Shopify variant, a metal, a stone, a size or a month. */
export interface JewelVariant {
  id: string;
  title: string;
  availableForSale: boolean;
  price: number;
  compareAtPrice?: number;
  /** "Metal" → "Silver", "Size" → "7". Shopify's "Title" placeholder is left out. */
  options: Record<string, string>;
  /** Its own photo, when Shopify has one. */
  image?: string;
}

export const WHATSAPP_NUMBER = "919561557935";

export const jewelleryEnquiryUrl = (name: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore, I'd love to pre-order the "${name}" from Naira Petite. Could you share availability and details?`
  )}`;


/* Pre-orders are booked by hand on WhatsApp, never through checkout: the piece
   is not in stock, so a paid checkout would take money for something we cannot
   ship on the stated date. */
export const preorderWhatsAppUrl = (p: { name: string; handle: string; priceLabel?: string; size?: string; choice?: string }) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hello Naira Flore, I would like to pre-order the "${p.name}"${p.choice ? ` in ${p.choice}` : p.size ? ` in size ${p.size}` : ""}${p.priceLabel ? ` (${p.priceLabel})` : ""}. Please book this piece for me, and let me know what further details you need to reserve it.\n\nhttps://nairaflore.com/jewellery/${p.handle}`
  )}`;

export const formatJewelPrice = (v: number) =>
  `₹${v.toLocaleString("en-IN")}`;

export const jewellery: JewelPiece[] = [
  {
    handle: "riviere-eternal-necklace",
    name: "Rivière Eternal Necklace",
    category: "Necklaces" as JewelCategory,
    sku: "YF7085-NEC",
    number: "01",
    price: 1799,
    priceLabel: "₹1,799",
    variantId: "gid://shopify/ProductVariant/47501786480802",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/riviere-eternal-necklace-0_47d234c3-abc4-4cfe-a9ab-caa3ae2e1fb5.jpg?v=1787524333",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/riviere-eternal-necklace-0_47d234c3-abc4-4cfe-a9ab-caa3ae2e1fb5.jpg?v=1787524333", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/riviere-eternal-necklace-1.jpg?v=1787277307", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/riviere-eternal-necklace-2.jpg?v=1787277307", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b3_a6492ca4-26e4-4a64-8b57-72506134c6f5.jpg?v=1789487842"],
    blurb: "Light, laid in a single row. This 40cm necklace is set with round brilliant cut clear cubic zirconia of about 3mm, each stone in its own four claw gold setting linked directly to the next so the line never breaks. A flat polished buckle station of about 12mm sits at the front. Wear it high on the neck with an open collar, or under a saree blouse for a wedding evening.",
    description: "Light, laid in a single row. This 40cm necklace is set with round brilliant cut clear cubic zirconia of about 3mm, each stone in its own four claw gold setting linked directly to the next so the line never breaks. A flat polished buckle station of about 12mm sits at the front. Wear it high on the neck with an open collar, or under a saree blouse for a wedding evening.STYLING TIP: Pair it with an open collar shirt and small studs so the line stays uninterrupted.Details Length: Approximately 40cm Stone: Round brilliant cut clear cubic zirconia, each in its own four claw setting Setting: Individual four claw settings linked directly to one another Feature: Flat rectangular buckle station, approximately 12mm, at the front Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Pair it with an open collar shirt and small studs so the line stays uninterrupted.",
    details: ["Length: Approximately 40cm", "Stone: Round brilliant cut clear cubic zirconia, each in its own four claw setting", "Setting: Individual four claw settings linked directly to one another", "Feature: Flat rectangular buckle station, approximately 12mm, at the front", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "heartline-paperclip-necklace",
    name: "Heartline Paperclip Necklace",
    category: "Necklaces" as JewelCategory,
    sku: "YF3952",
    number: "02",
    price: 2449,
    priceLabel: "₹2,449",
    variantId: "gid://shopify/ProductVariant/47501786513570",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/heartline-paperclip-necklace-0_660f5314-75b0-4ab9-8d78-cfb1bb519987.jpg?v=1787524296",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/heartline-paperclip-necklace-0_660f5314-75b0-4ab9-8d78-cfb1bb519987.jpg?v=1787524296", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/heartline-paperclip-necklace-1.jpg?v=1787277315", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/heartline-paperclip-necklace-2.jpg?v=1787277315", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/heartline-paperclip-necklace-3.jpg?v=1787277315", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b13_a87c1294-2b6b-4edf-9165-1050d133780c.jpg?v=1789487793"],
    blurb: "Small hearts, gathered where they show. This necklace is built from fine gold paperclip links, with the row of small heart shaped clear cubic zirconia stations grouped through the front centre section and plain chain running along both sides. The PVD coating is finished in 18k gold tone over surgical stainless steel, so it holds up to daily wear. Wear it on its own, or layer it under a longer chain.",
    description: "Small hearts, gathered where they show. This necklace is built from fine gold paperclip links, with the row of small heart shaped clear cubic zirconia stations grouped through the front centre section and plain chain running along both sides. The PVD coating is finished in 18k gold tone over surgical stainless steel, so it holds up to daily wear. Wear it on its own, or layer it under a longer chain.STYLING TIP: Layer it with a longer pendant chain so the heart stations stay visible above it.Details Chain: Fine gold paperclip links Stone: Small heart shaped clear cubic zirconia stations Placement: Stations grouped through the front centre section, with plain paperclip chain along both sides Finish: Tarnish resistant PVD gold coating Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Layer it with a longer pendant chain so the heart stations stay visible above it.",
    details: ["Chain: Fine gold paperclip links", "Stone: Small heart shaped clear cubic zirconia stations", "Placement: Stations grouped through the front centre section, with plain paperclip chain along both sides", "Finish: Tarnish resistant PVD gold coating", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "bold-nocturne-chain",
    name: "Bold Nocturne Chain",
    category: "Necklaces" as JewelCategory,
    sku: "YF5144",
    number: "03",
    price: 2449,
    priceLabel: "₹2,449",
    variantId: "gid://shopify/ProductVariant/47501786546338",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260829_202820_ced0ce1b-4902-4f44-96ba-51ad4982a154.png?v=1788035828",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260829_202820_ced0ce1b-4902-4f44-96ba-51ad4982a154.png?v=1788035828", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260829_202820_d8c5c163-56ee-43d5-9271-645333345fb2.png?v=1788035829", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/YF5144_2_worn.png?v=1786123099", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260809_164607_184572e5-2099-46dc-a93b-410f3d094f95.png?v=1789558281", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b8.jpg?v=1789485381", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/YF5144_3_alt.png?v=1786123098"],
    blurb: "A chain with enough presence to be the whole outfit. This 46cm necklace is built from bold elongated oval links roughly 11.7mm wide in warm gold tone, with one link pave set with clear cubic zirconia so a single point of sparkle breaks the run of plain metal. At about 47.6g it has real weight and holds its shape on the neck, and a 5cm extender lets it sit higher or lower. Wear it on its own over a plain black top for evenings.",
    description: "A chain with enough presence to be the whole outfit. This 46cm necklace is built from bold elongated oval links roughly 11.7mm wide in warm gold tone, with one link pave set with clear cubic zirconia so a single point of sparkle breaks the run of plain metal. At about 47.6g it has real weight and holds its shape on the neck, and a 5cm extender lets it sit higher or lower. Wear it on its own over a plain black top for evenings.STYLING TIP: Wear it with a plain black crew neck so the pave link catches the light.Details Length: Approximately 46cm plus a 5cm extender Weight: Approximately 47.6g Chain: Bold elongated oval links, approximately 11.7mm wide Stone: One link pave set with clear cubic zirconia Closure: Lobster clasp with extender chain Finish: Polished warm gold tone Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Wear it with a plain black crew neck so the pave link catches the light.",
    details: ["Length: Approximately 46cm plus a 5cm extender", "Weight: Approximately 47.6g", "Chain: Bold elongated oval links, approximately 11.7mm wide", "Stone: One link pave set with clear cubic zirconia", "Closure: Lobster clasp with extender chain", "Finish: Polished warm gold tone", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "serpentine-whisper-chain",
    name: "Serpentine Whisper Chain",
    category: "Necklaces" as JewelCategory,
    sku: "YF8439",
    number: "04",
    price: 1849,
    priceLabel: "₹1,849",
    variantId: "gid://shopify/ProductVariant/47501786611874",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/serpentine-whisper-chain-0_51e2b606-e02d-4389-a9ab-79e1a02faccd.jpg?v=1787524333",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/serpentine-whisper-chain-0_51e2b606-e02d-4389-a9ab-79e1a02faccd.jpg?v=1787524333", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/serpentine-whisper-chain-3.jpg?v=1787277323", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b15_65fadc0d-065e-4cfe-9430-79a2df35e005.jpg?v=1789487844", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/IMG-3060.png?v=1787573979", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/IMG-3059.png?v=1787573978"],
    blurb: "One stone, one smooth line of gold. This necklace runs a 2mm snake chain measuring 40cm with a 5cm extender, finished at the front with a single cushion cut clear cubic zirconia of about 10mm held in a fine gold basket setting. The PVD coating keeps the chain sleek and even against the skin. Wear it alone on a bare neckline when you want one clear point of focus.",
    description: "One stone, one smooth line of gold. This necklace runs a 2mm snake chain measuring 40cm with a 5cm extender, finished at the front with a single cushion cut clear cubic zirconia of about 10mm held in a fine gold basket setting. The PVD coating keeps the chain sleek and even against the skin. Wear it alone on a bare neckline when you want one clear point of focus.STYLING TIP: Wear it with a scoop neck top and let the single stone sit on its own.Details Length: 40cm plus a 5cm extender Weight: 10g Chain: Smooth snake chain, 2mm Stone: Cushion cut clear cubic zirconia, approximately 10mm Setting: Fine gold basket Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Wear it with a scoop neck top and let the single stone sit on its own.",
    details: ["Length: 40cm plus a 5cm extender", "Weight: 10g", "Chain: Smooth snake chain, 2mm", "Stone: Cushion cut clear cubic zirconia, approximately 10mm", "Setting: Fine gold basket", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "dewdrop-bezel-necklace",
    name: "Dewdrop Bezel Necklace",
    category: "Necklaces" as JewelCategory,
    sku: "YF6403",
    number: "05",
    price: 1299,
    priceLabel: "₹1,299",
    variantId: "gid://shopify/ProductVariant/47501786677410",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/YF6403_1_main.png?v=1786122969",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/YF6403_1_main.png?v=1786122969", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/YF6403_2_worn.png?v=1786122969", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/YF6403_4_alt.png?v=1786122969", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/W03-dewdrop-bezel-necklace.jpg?v=1786190824"],
    blurb: "The quietest version of a good idea. A very fine 42cm gold chain carries one clear pear cut cubic zirconia, hung point up from a small polished tube bail and held in fine gold claws, with an adjustable extender at the clasp so the length can shift with your neckline. There is nothing else on the chain, which is the point. Wear it to work under a collar, and leave it on through the evening.",
    description: "The quietest version of a good idea. A very fine 42cm gold chain carries one clear pear cut cubic zirconia, hung point up from a small polished tube bail and held in fine gold claws, with an adjustable extender at the clasp so the length can shift with your neckline. There is nothing else on the chain, which is the point. Wear it to work under a collar, and leave it on through the evening.STYLING TIP: Layer it with a heavier chain below so the fine drop sits on top.Details Length: 42cm plus a 5cm extender Pendant: Approximately 15mm tall including the bail Stone: Pear cut clear cubic zirconia, approximately 9 x 7mm Setting: Fine gold claws, hung point up from a polished tube bail Chain: Very fine gold chain Closure: Lobster clasp with an adjustable extender chain Weight: Approximately 4g Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Layer it with a heavier chain below so the fine drop sits on top.",
    details: ["Length: 42cm plus a 5cm extender", "Pendant: Approximately 15mm tall including the bail", "Stone: Pear cut clear cubic zirconia, approximately 9 x 7mm", "Setting: Fine gold claws, hung point up from a polished tube bail", "Chain: Very fine gold chain", "Closure: Lobster clasp with an adjustable extender chain", "Weight: Approximately 4g", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "charm-box-chain",
    name: "Charm Box Chain",
    category: "Necklaces" as JewelCategory,
    sku: "YF5146",
    number: "06",
    price: 2149,
    priceLabel: "₹2,149",
    variantId: "gid://shopify/ProductVariant/47501786710178",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/charm-box-chain-0_829299c5-a731-48ba-96fd-cbfcd3491b7b.jpg?v=1787524089",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/charm-box-chain-0_829299c5-a731-48ba-96fd-cbfcd3491b7b.jpg?v=1787524089", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/charm-box-chain-1.jpg?v=1787277336", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b15_e796aad4-30f4-4e68-850d-0147e53faa30.jpg?v=1789487731", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-u02-charm-box-chain.jpg?v=1789559140", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/charm-box-chain-2.jpg?v=1787277336", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/charm-box-chain-4.jpg?v=1787277336"],
    blurb: "One small charm on a very neat chain. This 50cm necklace uses a fine 2.5mm gold box chain, built from square links that hold their shape and resist twisting through the day, carrying a cylindrical barrel rondelle at the front, pave set with tiny clear cubic zirconia all the way around. The PVD coating is finished to resist tarnish with regular wear. Wear it close to the neck on its own, or under a longer chain for a soft layered look.",
    description: "One small charm on a very neat chain. This 50cm necklace uses a fine 2.5mm gold box chain, built from square links that hold their shape and resist twisting through the day, carrying a cylindrical barrel rondelle at the front, pave set with tiny clear cubic zirconia all the way around. The PVD coating is finished to resist tarnish with regular wear. Wear it close to the neck on its own, or under a longer chain for a soft layered look.STYLING TIP: Layer it with a longer pendant chain so the small charm sits closest to you.Details Length: 50cm Weight: 12.3g Chain: Fine gold box chain with square link construction, approximately 2.5mm Charm: Cylindrical barrel rondelle approximately 10mm tall, pave set with many tiny clear cubic zirconia around its circumference Feature: Box links hold their shape and resist twisting Finish: Tarnish resistant PVD gold coating Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Layer it with a longer pendant chain so the small charm sits closest to you.",
    details: ["Length: 50cm", "Weight: 12.3g", "Chain: Fine gold box chain with square link construction, approximately 2.5mm", "Charm: Cylindrical barrel rondelle approximately 10mm tall, pave set with many tiny clear cubic zirconia around its circumference", "Feature: Box links hold their shape and resist twisting", "Finish: Tarnish resistant PVD gold coating", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "molten-bloom-hoops",
    name: "Molten Bloom Hoops",
    category: "Earrings" as JewelCategory,
    sku: "JDE0110042",
    number: "08",
    price: 2949,
    priceLabel: "₹2,949",
    variantId: "gid://shopify/ProductVariant/47501786841250",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/molten-bloom-hoops-0_26771e6d-f11a-4437-901d-45929c48331e.jpg?v=1787524296",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/molten-bloom-hoops-0_26771e6d-f11a-4437-901d-45929c48331e.jpg?v=1787524296", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/molten-bloom-hoops-1.jpg?v=1787275931", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/molten-bloom-hoops-2.jpg?v=1787275931", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b11.jpg?v=1789484471", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/molten-bloom-hoops-3.jpg?v=1787275931", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/molten-bloom-hoops-4.jpg?v=1787275931", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/molten-bloom-hoops-5.jpg?v=1787275931"],
    blurb: "Some shapes look like they were poured rather than made. These chunky open huggie hoops measure about 21mm across and 19mm tall, with a thick irregular band that swells and narrows as it travels around the circle. The rippled molten surface catches light from every angle, and a small hinged snap closure keeps them secure. Light enough for a full day at work, bold enough to carry a plain outfit on their own.",
    description: "Some shapes look like they were poured rather than made. These chunky open huggie hoops measure about 21mm across and 19mm tall, with a thick irregular band that swells and narrows as it travels around the circle. The rippled molten surface catches light from every angle, and a small hinged snap closure keeps them secure. Light enough for a full day at work, bold enough to carry a plain outfit on their own.STYLING TIP: Wear it with a slick low bun and a crisp white shirt for easy weekday polish.Details Size: Approximately 21mm wide and 19mm tall Weight: 5.3g the pair Style: Open huggie hoop Surface: Rippled molten texture on a thick irregular band Closure: Hinged snap Stones: None Band thickness: Approximately 4.7mm Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Wear it with a slick low bun and a crisp white shirt for easy weekday polish.",
    details: ["Size: Approximately 21mm wide and 19mm tall", "Weight: 5.3g the pair", "Style: Open huggie hoop", "Surface: Rippled molten texture on a thick irregular band", "Closure: Hinged snap", "Stones: None", "Band thickness: Approximately 4.7mm", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "clover-trio-edit",
    name: "Clover Trio Edit",
    category: "Earrings" as JewelCategory,
    sku: "JDE0201327",
    number: "09",
    price: 2749,
    priceLabel: "₹2,749",
    variantId: "gid://shopify/ProductVariant/47501786874018",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/clover-trio-edit-0_ed1fda50-33d5-436b-a5c6-3c9133b4bf74.jpg?v=1787524090",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/clover-trio-edit-0_ed1fda50-33d5-436b-a5c6-3c9133b4bf74.jpg?v=1787524090", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/clover-trio-edit-1.jpg?v=1787277433", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b6_4e5bb319-5269-4517-8d42-88721aac06af.jpg?v=1789487792", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/clover-trio-edit-2.jpg?v=1787277433", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/clover-trio-edit-3.jpg?v=1787277433", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/clover-trio-edit-5.jpg?v=1787277433"],
    blurb: "Three ways to wear one idea. This set brings together gold huggie hoops of about 10mm with detachable four petal clover charms of about 8.5mm, a pair of clover studs of about 6mm, and round solitaire studs of about 3.7mm. Every stone is clear cubic zirconia set in PVD 18K gold coated surgical stainless steel. Wear the hoops plain on a busy morning, then clip the clovers back on for dinner.",
    description: "Three ways to wear one idea. This set brings together gold huggie hoops of about 10mm with detachable four petal clover charms of about 8.5mm, a pair of clover studs of about 6mm, and round solitaire studs of about 3.7mm. Every stone is clear cubic zirconia set in PVD 18K gold coated surgical stainless steel. Wear the hoops plain on a busy morning, then clip the clovers back on for dinner.STYLING TIP: Wear it with second and third piercings filled for a layered ear that still reads quiet.Details Size: Huggie hoops approximately 10.2mm across Weight: 4.4g the set Set: Three pairs, huggie hoops, clover studs and round solitaire studs Charms: Detachable four petal clover, approximately 8.5mm drop Studs: Clover stud face approximately 6.2mm, round solitaire stone approximately 3.7mm Stone: Clear cubic zirconia Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Wear it with second and third piercings filled for a layered ear that still reads quiet.",
    details: ["Size: Huggie hoops approximately 10.2mm across", "Weight: 4.4g the set", "Set: Three pairs, huggie hoops, clover studs and round solitaire studs", "Charms: Detachable four petal clover, approximately 8.5mm drop", "Studs: Clover stud face approximately 6.2mm, round solitaire stone approximately 3.7mm", "Stone: Clear cubic zirconia", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "woven-gold-hoops",
    name: "Woven Gold Hoops",
    category: "Earrings" as JewelCategory,
    sku: "E20267O",
    number: "10",
    price: 2349,
    priceLabel: "₹2,349",
    variantId: "gid://shopify/ProductVariant/47501786906786",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/woven-gold-hoops-0_6c9f6b30-a09f-479d-bbfa-ab40df3853a4.jpg?v=1787524536",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/woven-gold-hoops-0_6c9f6b30-a09f-479d-bbfa-ab40df3853a4.jpg?v=1787524536", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/woven-gold-hoops-2.jpg?v=1787277440", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/woven-gold-hoops-3.jpg?v=1787277440", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-u23-woven-gold-hoops.jpg?v=1789656224", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/woven-gold-hoops-4.jpg?v=1787277440", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b7_4901d496-c260-4092-a6be-a3ae76a35343.jpg?v=1789487818"],
    blurb: "Texture does the talking here. These hoops measure about 25mm across and each one is a thick braided rope of gold strands, worked so the surface reads as raised ridge and shadow rather than a single smooth curve. There are no stones at all, just weight, PVD coating and pattern. They carry a plain kurta or a work shirt without needing anything else on the ear.",
    description: "Texture does the talking here. These hoops measure about 25mm across and each one is a thick braided rope of gold strands, worked so the surface reads as raised ridge and shadow rather than a single smooth curve. There are no stones at all, just weight, PVD coating and pattern. They carry a plain kurta or a work shirt without needing anything else on the ear.STYLING TIP: Pair it with a bare neckline and loose hair so the braided texture stays the focus.Details Style: Chunky braided hoop Size: Approximately 25mm across Surface: Braided rope of gold tone strands with raised ridges Stones: None Sold as: One pair Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Pair it with a bare neckline and loose hair so the braided texture stays the focus.",
    details: ["Style: Chunky braided hoop", "Size: Approximately 25mm across", "Surface: Braided rope of gold tone strands with raised ridges", "Stones: None", "Sold as: One pair", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "ribbon-bow-earrings",
    name: "Ribbon Bow Earrings",
    category: "Earrings" as JewelCategory,
    sku: "E16075B",
    number: "11",
    price: 2299,
    priceLabel: "₹2,299",
    variantId: "gid://shopify/ProductVariant/47501787005090",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/ribbon-bow-earrings-0.jpg?v=1787277455",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/ribbon-bow-earrings-0.jpg?v=1787277455", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b1_2af9b1d3-6cff-4b51-ab53-dc5cd136d54b.jpg?v=1789487842", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260809_171450_157d70b8-90d2-478a-83c8-5d5b7a5462bc.png?v=1789558320", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-u18-ribbon-bow-earrings.jpg?v=1789656223", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/ribbon-bow-earrings-2.jpg?v=1787277455", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/ribbon-bow-earrings-3.jpg?v=1787277455", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/ribbon-bow-earrings-4.jpg?v=1787277455"],
    blurb: "A ribbon, held still in gold. These studs measure about 12mm across and are shaped as a soft bow, built from pear cut and tapered clear cubic zirconia held in fine gold claws so the whole form reads as one continuous curve of light. The stud fitting keeps them close to the lobe. They suit a party evening as easily as a birthday lunch with friends.",
    description: "A ribbon, held still in gold. These studs measure about 12mm across and are shaped as a soft bow, built from pear cut and tapered clear cubic zirconia held in fine gold claws so the whole form reads as one continuous curve of light. The stud fitting keeps them close to the lobe. They suit a party evening as easily as a birthday lunch with friends.STYLING TIP: Pair it with a satin slip dress and soft waves for a light evening look.Details Size: Approximately 12mm Stone: Pear cut and tapered clear cubic zirconia Setting: Fine gold claws Fitting: Stud Sold as: One pair Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Pair it with a satin slip dress and soft waves for a light evening look.",
    details: ["Size: Approximately 12mm", "Stone: Pear cut and tapered clear cubic zirconia", "Setting: Fine gold claws", "Fitting: Stud", "Sold as: One pair", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "textured-gold-hoops",
    name: "Textured Gold Hoops",
    category: "Earrings" as JewelCategory,
    sku: "FE03586B",
    number: "12",
    price: 2849,
    priceLabel: "₹2,849",
    variantId: "gid://shopify/ProductVariant/47501787070626",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/textured-gold-hoops-0_039c8b77-a5ed-4539-8e2a-97a3fa43b662.jpg?v=1787524334",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/textured-gold-hoops-0_039c8b77-a5ed-4539-8e2a-97a3fa43b662.jpg?v=1787524334", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/textured-gold-hoops-2.jpg?v=1787277463", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b1_264a714c-92f0-4cd8-9ffe-aa1b6bde8579.jpg?v=1789487863", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/textured-gold-hoops-1.jpg?v=1787277463", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/textured-gold-hoops-3.jpg?v=1787277463", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/textured-gold-hoops-4.jpg?v=1787277463"],
    blurb: "An arc that builds as it climbs. These open half hoops measure about 20mm across, each one made from alternating fluted gold discs of about 6mm and clusters of small round clear cubic zirconia, so texture and sparkle take turns along the curve. A straight post at the top holds them close to the lobe. Wear them for a wedding function, or on any day that needs a little more.",
    description: "An arc that builds as it climbs. These open half hoops measure about 20mm across, each one made from alternating fluted gold discs of about 6mm and clusters of small round clear cubic zirconia, so texture and sparkle take turns along the curve. A straight post at the top holds them close to the lobe. Wear them for a wedding function, or on any day that needs a little more.STYLING TIP: Pair it with hair tucked behind the ear so the full arc stays in view.Details Size: Approximately 20mm across Style: Open half hoop Detail: Alternating fluted gold discs, approximately 6mm each Stone: Clusters of small round clear cubic zirconia between the discs Fitting: Straight post Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Pair it with hair tucked behind the ear so the full arc stays in view.",
    details: ["Size: Approximately 20mm across", "Style: Open half hoop", "Detail: Alternating fluted gold discs, approximately 6mm each", "Stone: Clusters of small round clear cubic zirconia between the discs", "Fitting: Straight post", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "solitaire-whisper-studs",
    name: "Solitaire Whisper Studs",
    category: "Earrings" as JewelCategory,
    sku: "E16355C",
    number: "15",
    price: 1899,
    priceLabel: "₹1,899",
    variantId: "gid://shopify/ProductVariant/47501787267234",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/solitaire-whisper-studs-1.jpg?v=1787277489",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/solitaire-whisper-studs-1.jpg?v=1787277489", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/solitaire-whisper-studs-2.jpg?v=1787277489", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-u07-solitaire-whisper-studs.jpg?v=1789559488", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/solitaire-whisper-studs-3.jpg?v=1787277489", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/solitaire-whisper-studs-4.jpg?v=1787277489", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b1_264a714c-92f0-4cd8-9ffe-aa1b6bde8579.jpg?v=1789487863"],
    blurb: "Cool and bright, close to the lobe. Each stud measures about 9mm square and holds a round brilliant clear cubic zirconia of about 7mm at the centre, framed by a cushion shaped pave halo of smaller clear stones. The metal is PVD rhodium coated over surgical stainless steel, so the colour stays cool and even. They read as a classic pair for office days and dress up easily for a night out.",
    description: "Cool and bright, close to the lobe. Each stud measures about 9mm square and holds a round brilliant clear cubic zirconia of about 7mm at the centre, framed by a cushion shaped pave halo of smaller clear stones. The metal is PVD rhodium coated over surgical stainless steel, so the colour stays cool and even. They read as a classic pair for office days and dress up easily for a night out.STYLING TIP: Pair it with a cool toned chain and a crisp collar for a clean office look.Details Size: Approximately 9mm square Centre stone: Round brilliant clear cubic zirconia, approximately 7mm Halo: Cushion shaped pave halo of small clear cubic zirconia Fitting: Stud Sold as: One pair Plating: PVD rhodium coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Pair it with a cool toned chain and a crisp collar for a clean office look.",
    details: ["Size: Approximately 9mm square", "Centre stone: Round brilliant clear cubic zirconia, approximately 7mm", "Halo: Cushion shaped pave halo of small clear cubic zirconia", "Fitting: Stud", "Sold as: One pair", "Plating: PVD rhodium coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD rhodium coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "riviere-of-light-bracelet",
    name: "Rivière of Light Bracelet",
    category: "Bracelets" as JewelCategory,
    sku: "JDB201083",
    number: "20",
    price: 1049,
    priceLabel: "₹1,049",
    variantId: "gid://shopify/ProductVariant/47501787922594",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/riviere-of-light-bracelet-0_1bfa22be-ba1d-4967-bccd-018bd98c3148.jpg?v=1787524333",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/riviere-of-light-bracelet-0_1bfa22be-ba1d-4967-bccd-018bd98c3148.jpg?v=1787524333", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/riviere-of-light-bracelet-1.jpg?v=1787277567", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b14_cd6a0b93-eae2-4e02-93c3-4d1dcc9fbd74.jpg?v=1789487864"],
    blurb: "Nothing sparkles quite like an unbroken line. This 17.5cm bracelet holds round brilliant clear cubic zirconia of about 3mm, every stone in a fine four prong gold setting that links straight into the next, with no backing chain behind it. That construction lets the line stay flexible and sit flat against the wrist. Wear it on its own for evenings, or stack it with a plain chain by day.",
    description: "Nothing sparkles quite like an unbroken line. This 17.5cm bracelet holds round brilliant clear cubic zirconia of about 3mm, every stone in a fine four prong gold setting that links straight into the next, with no backing chain behind it. That construction lets the line stay flexible and sit flat against the wrist. Wear it on its own for evenings, or stack it with a plain chain by day. STYLING TIP: Layer it with a baguette line bracelet on the same wrist for a soft mixed stack. Details Length: 17.5cm Weight: 4.2g Stone: Round brilliant clear cubic zirconia, approximately 3mm each Setting: Fine four prong settings linked directly, with no backing chain Fit: Flexible line that sits flat against the wrist Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. Care Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch. You will receive your piece in a Naira Petite box.",
    stylingTip: "Layer it with a baguette line bracelet on the same wrist for a soft mixed stack.",
    details: ["Length: 17.5cm", "Weight: 4.2g", "Stone: Round brilliant clear cubic zirconia, approximately 3mm each", "Setting: Fine four prong settings linked directly, with no backing chain", "Fit: Flexible line that sits flat against the wrist", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. Care Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "bold-nocturne-bracelet",
    name: "Bold Nocturne Bracelet",
    category: "Bracelets" as JewelCategory,
    sku: "YF5144-BRA",
    number: "21",
    price: 1999,
    priceLabel: "₹1,999",
    variantId: "gid://shopify/ProductVariant/47501788020898",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260829_202820_4655468e-3f43-44d3-a072-b82f1349fc13.png?v=1788035873",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260829_202820_4655468e-3f43-44d3-a072-b82f1349fc13.png?v=1788035873", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260829_202820_8f628d11-a37b-4470-9d19-13712dda1c07.png?v=1788035873", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/YF5144-BRA_2_worn.png?v=1786123096", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b14_3d3f7e3b-368b-42e7-929c-1ff5f8fe99b3.jpg?v=1789487730"],
    blurb: "Weight, worn plainly. This 20cm bracelet is a chunky elongated oval link chain in warm gold tone with links roughly 11.7mm wide, one of them pave set with clear cubic zirconia so a single point of light sits on top of the wrist. At about 20.6g it has the heft of the matching chain, and a 3cm extender takes it up or down a size. It closes with a lobster clasp.",
    description: "Weight, worn plainly. This 20cm bracelet is a chunky elongated oval link chain in warm gold tone with links roughly 11.7mm wide, one of them pave set with clear cubic zirconia so a single point of light sits on top of the wrist. At about 20.6g it has the heft of the matching chain, and a 3cm extender takes it up or down a size. It closes with a lobster clasp.STYLING TIP: Turn the pave link to the top of the wrist and wear it alone.Details Length: Approximately 20cm plus a 3cm extender Weight: Approximately 20.6g Chain: Chunky elongated oval links, approximately 11.7mm wide Stone: One link pave set with clear cubic zirconia Closure: Lobster clasp with extender chain Finish: Polished warm gold tone Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Turn the pave link to the top of the wrist and wear it alone.",
    details: ["Length: Approximately 20cm plus a 3cm extender", "Weight: Approximately 20.6g", "Chain: Chunky elongated oval links, approximately 11.7mm wide", "Stone: One link pave set with clear cubic zirconia", "Closure: Lobster clasp with extender chain", "Finish: Polished warm gold tone", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "baroque-bloom-cuff",
    name: "Baroque Bloom Cuff",
    category: "Bracelets" as JewelCategory,
    sku: "YF6671",
    number: "22",
    price: 1849,
    priceLabel: "₹1,849",
    variantId: "gid://shopify/ProductVariant/47501788086434",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baroque-bloom-cuff-0_80bb0244-7923-4303-a825-653061497716.jpg?v=1787524087",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baroque-bloom-cuff-0_80bb0244-7923-4303-a825-653061497716.jpg?v=1787524087", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baroque-bloom-cuff-2.jpg?v=1787277584", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b9_6c176b11-456e-4144-ac53-fb0d9442c93c.jpg?v=1789486138", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baroque-bloom-cuff-1.jpg?v=1787277584", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baroque-bloom-cuff-3.jpg?v=1787277584"],
    blurb: "Two different endings on one open circle. The cuff measures about 6cm by 5.5cm on 1.5mm wire, one terminal set with an irregular white mother of pearl slab of about 1.8cm by 0.7cm in a slim bezel, and the other a 1.7cm gold cap holding a clear emerald cut cubic zirconia. The white piece is polished shell, not a pearl. The open back slides on at the narrowest part of the wrist, making it an easy single statement for an evening out.",
    description: "Two different endings on one open circle. The cuff measures about 6cm by 5.5cm on 1.5mm wire, one terminal set with an irregular white mother of pearl slab of about 1.8cm by 0.7cm in a slim bezel, and the other a 1.7cm gold cap holding a clear emerald cut cubic zirconia. The white piece is polished shell, not a pearl. The open back slides on at the narrowest part of the wrist, making it an easy single statement for an evening out.STYLING TIP: Wear it with sleeves pushed back so both terminals stay visible from every angle.Details Size: Open cuff, approximately 6cm by 5.5cm, on 1.5mm wire Terminal one: Irregular white mother of pearl slab, approximately 1.8cm by 0.7cm, in a 0.25cm bezel Terminal two: 1.7cm gold cap set with a clear emerald cut cubic zirconia Shell: Mother of pearl is polished shell, not a pearl Fit: Open back, slides on at the narrowest part of the wrist Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Wear it with sleeves pushed back so both terminals stay visible from every angle.",
    details: ["Size: Open cuff, approximately 6cm by 5.5cm, on 1.5mm wire", "Terminal one: Irregular white mother of pearl slab, approximately 1.8cm by 0.7cm, in a 0.25cm bezel", "Terminal two: 1.7cm gold cap set with a clear emerald cut cubic zirconia", "Shell: Mother of pearl is polished shell, not a pearl", "Fit: Open back, slides on at the narrowest part of the wrist", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · pearl · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "baguette-eclat-bracelet",
    name: "Baguette Éclat Bracelet",
    category: "Bracelets" as JewelCategory,
    sku: "JDB201210",
    number: "25",
    price: 1549,
    priceLabel: "₹1,549",
    variantId: "gid://shopify/ProductVariant/47501788250274",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baguette-eclat-bracelet-0_b190417a-894e-41d0-ba3d-7525aa6d73b5.jpg?v=1787524087",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baguette-eclat-bracelet-0_b190417a-894e-41d0-ba3d-7525aa6d73b5.jpg?v=1787524087", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baguette-eclat-bracelet-1.jpg?v=1787277590", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baguette-eclat-bracelet-2.jpg?v=1787277590", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b15.jpg?v=1789484665", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/baguette-eclat-bracelet-3.jpg?v=1787277590"],
    blurb: "A cleaner kind of shine, cut in straight lines. This 16.5cm bracelet runs a continuous line of rectangular step cut clear cubic zirconia set upright, each stone held in its own fine gold four claw setting so the row reads as one bright band about 6mm wide. It lies flat on the wrist and stacks cleanly beside a round brilliant line. Wear it to work under a sleeve, or with a heavier chain for evening.",
    description: "A cleaner kind of shine, cut in straight lines. This 16.5cm bracelet runs a continuous line of rectangular step cut clear cubic zirconia set upright, each stone held in its own fine gold four claw setting so the row reads as one bright band about 6mm wide. It lies flat on the wrist and stacks cleanly beside a round brilliant line. Wear it to work under a sleeve, or with a heavier chain for evening.STYLING TIP: Layer it with a round brilliant line bracelet for a stack that mixes two cuts.Details Length: 16.5cm Weight: 7.5g Stone: Rectangular step cut baguette clear cubic zirconia, the set line approximately 6mm wide Setting: Individual fine gold four claw settings, linked directly to one another Closure: Gold box clasp Fit: Sits flat and stacks cleanly Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Layer it with a round brilliant line bracelet for a stack that mixes two cuts.",
    details: ["Length: 16.5cm", "Weight: 7.5g", "Stone: Rectangular step cut baguette clear cubic zirconia, the set line approximately 6mm wide", "Setting: Individual fine gold four claw settings, linked directly to one another", "Closure: Gold box clasp", "Fit: Sits flat and stacks cleanly", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "cushion-halo-ring",
    name: "Cushion Halo Ring",
    category: "Rings" as JewelCategory,
    sku: "WR20902K8",
    number: "27",
    price: 1499,
    priceLabel: "₹1,499",
    variantId: "gid://shopify/ProductVariant/47501788577954",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/cushion-halo-ring-0_5d46c0f5-1847-4550-8d3c-77d72f06b67f.jpg?v=1787524091",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/cushion-halo-ring-0_5d46c0f5-1847-4550-8d3c-77d72f06b67f.jpg?v=1787524091", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/cushion-halo-ring-1.jpg?v=1787277624", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b1.jpg?v=1789484224", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/cushion-halo-ring-3.jpg?v=1787277624", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/cushion-halo-ring-4.jpg?v=1787277624"],
    blurb: "Cool and bright, built around one clear centre. An 8mm round brilliant clear cubic zirconia sits in four claws at the heart of a cushion shaped pave halo of about 12mm, with pave running down both shoulders and a small opening at the back of the band. The metal is PVD rhodium coated over surgical stainless steel, so the setting reads cool rather than warm. That opening lets it adjust to fit US 5 to 9, and it works as an everyday statement or a proposal style ring.",
    description: "Cool and bright, built around one clear centre. An 8mm round brilliant clear cubic zirconia sits in four claws at the heart of a cushion shaped pave halo of about 12mm, with pave running down both shoulders and a small opening at the back of the band. The metal is PVD rhodium coated over surgical stainless steel, so the setting reads cool rather than warm. That opening lets it adjust to fit US 5 to 9, and it works as an everyday statement or a proposal style ring.STYLING TIP: Wear it with cool toned studs and a bare second hand for a balanced look.Details Size: Adjustable, fits US 5 to 9 Stone: Round brilliant clear cubic zirconia, approximately 8mm, four claw set Halo: Cushion shaped pave halo, approximately 12mm across Band: Pave set down both shoulders, open at the back so it adjusts Plating: PVD rhodium coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Wear it with cool toned studs and a bare second hand for a balanced look.",
    details: ["Size: Adjustable, fits US 5 to 9", "Stone: Round brilliant clear cubic zirconia, approximately 8mm, four claw set", "Halo: Cushion shaped pave halo, approximately 12mm across", "Band: Pave set down both shoulders, open at the back so it adjusts", "Plating: PVD rhodium coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD rhodium coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "chevron-whisper-ring",
    name: "Chevron Whisper Ring",
    category: "Rings" as JewelCategory,
    sku: "JDR0303312-7",
    number: "28",
    price: 1449,
    priceLabel: "₹1,449",
    variantId: "gid://shopify/ProductVariant/47501788610722",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/chevron-whisper-ring-0_c55321a4-4269-49f6-afa0-8025e597ceae.jpg?v=1787524090",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/chevron-whisper-ring-0_c55321a4-4269-49f6-afa0-8025e597ceae.jpg?v=1787524090", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/chevron-whisper-ring-1.jpg?v=1787277629", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/chevron-whisper-ring-2.jpg?v=1787277629", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b7_ee49a81f-0521-4705-a231-7bfda91ea31f.jpg?v=1789487731"],
    blurb: "A band that comes to a soft point. This ring is shaped as a double V, with two fine pave lines of small round clear cubic zirconia running along the band and meeting at the chevron. The form is cut to nest against a plain band or sit under a solitaire without crowding it. Made in US size 6, about 16.5mm inside, it is an easy piece to stack or wear alone.",
    description: "A band that comes to a soft point. This ring is shaped as a double V, with two fine pave lines of small round clear cubic zirconia running along the band and meeting at the chevron. The form is cut to nest against a plain band or sit under a solitaire without crowding it. Made in US size 6, about 16.5mm inside, it is an easy piece to stack or wear alone.STYLING TIP: Layer it with a plain gold band so the chevron point nests neatly against it.Details Size: US 6, inner diameter approximately 16.5mm. US 5 and 7 on pre-order Weight: 2g Profile: Double V chevron band Stone: Two fine pave lines of small round clear cubic zirconia Wear: Shaped to nest against a plain band or a solitaire Band height: Approximately 9.5mm at the chevron Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Layer it with a plain gold band so the chevron point nests neatly against it.",
    details: ["Size: US 6, inner diameter approximately 16.5mm. US 5 and 7 on pre-order", "Weight: 2g", "Profile: Double V chevron band", "Stone: Two fine pave lines of small round clear cubic zirconia", "Wear: Shaped to nest against a plain band or a solitaire", "Band height: Approximately 9.5mm at the chevron", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "pearl-ribbon-ring",
    name: "Pearl Ribbon Ring",
    category: "Rings" as JewelCategory,
    sku: "FR03136B",
    number: "30",
    price: 1099,
    priceLabel: "₹1,099",
    variantId: "gid://shopify/ProductVariant/47501788741794",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/pearl-ribbon-ring-0_cffc36a6-2a0b-4078-bf3d-74090b0bde22.jpg?v=1787524297",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/pearl-ribbon-ring-0_cffc36a6-2a0b-4078-bf3d-74090b0bde22.jpg?v=1787524297", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/pearl-ribbon-ring-1.jpg?v=1787277635", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/pearl-ribbon-ring-2.jpg?v=1787277635", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b5_69318d2f-ebf3-4456-88c7-9dcca979b938.jpg?v=1789487820"],
    blurb: "A bow, tied once and kept. The front of this ring is formed from two flat gold loops channel set along their length with rectangular baguette clear cubic zirconia, tied at a polished gold knot, with a round white freshwater pearl of about 10mm resting at one side. The shank behind is a slim plain gold band. Made in US size 6, about 16.5mm inside, it suits an engagement lunch or a festive evening.",
    description: "A bow, tied once and kept. The front of this ring is formed from two flat gold loops channel set along their length with rectangular baguette clear cubic zirconia, tied at a polished gold knot, with a round white freshwater pearl of about 10mm resting at one side. The shank behind is a slim plain gold band. Made in US size 6, about 16.5mm inside, it suits an engagement lunch or a festive evening.STYLING TIP: Pair it with bare fingers and soft pink nails so the bow reads clearly.Details Size: US 6, inner diameter approximately 16.5mm. US 5 and 7 on pre-order Front: Bow formed from two flat gold loops tied at a polished knot Stone: Rectangular baguette clear cubic zirconia, channel set along each loop Pearl: Round white freshwater pearl, approximately 10mm Band: Slim plain gold shank Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Pair it with bare fingers and soft pink nails so the bow reads clearly.",
    details: ["Size: US 6, inner diameter approximately 16.5mm. US 5 and 7 on pre-order", "Front: Bow formed from two flat gold loops tied at a polished knot", "Stone: Rectangular baguette clear cubic zirconia, channel set along each loop", "Pearl: Round white freshwater pearl, approximately 10mm", "Band: Slim plain gold shank", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · pearl · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "star-point-band",
    name: "Star Point Band",
    category: "Rings" as JewelCategory,
    sku: "YF5214",
    number: "31",
    price: 999,
    priceLabel: "₹999",
    variantId: "gid://shopify/ProductVariant/47501788774562",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/star-point-band-1.jpg?v=1787277642",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/star-point-band-1.jpg?v=1787277642", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/star-point-band-2.jpg?v=1787277643", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260807_195911_ca10c138-d4b0-4ae6-8c6d-7d0f67152961.png?v=1789558321", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b7.jpg?v=1789484278", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/star-point-band-3.jpg?v=1787277643", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/star-point-band-4.jpg?v=1787277643"],
    blurb: "A wide band, marked with small points of light. The surface carries repeating four pointed star motifs in low relief, each one centred on a small clear cubic zirconia, so the pattern runs the whole way around the finger. It comes in gold tone or rhodium coated, in US sizes 5 to 8. Wear it as an everyday band that still has detail.",
    description: "A wide band, marked with small points of light. The surface carries repeating four pointed star motifs in low relief, each one centred on a small clear cubic zirconia, so the pattern runs the whole way around the finger. It comes in gold tone or rhodium coated, in US sizes 5 to 8. Wear it as an everyday band that still has detail.STYLING TIP: Wear it with a slim stacking ring on the same finger for a soft everyday pair.Details Sizes: US 5, 6, 7 and 8 Width: Approximately 6mm Weight: Approximately 5.2g Profile: Wide flat band Pattern: Repeating engraved four pointed star motifs in low relief Stone: Small clear cubic zirconia at the centre of each star Plating: PVD 18K gold or PVD rhodium coating (choose above), anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Wear it with a slim stacking ring on the same finger for a soft everyday pair.",
    details: ["Sizes: US 5, 6, 7 and 8", "Width: Approximately 6mm", "Weight: Approximately 5.2g", "Profile: Wide flat band", "Pattern: Repeating engraved four pointed star motifs in low relief", "Stone: Small clear cubic zirconia at the centre of each star", "Plating: PVD 18K gold or PVD rhodium coating (choose above), anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold or PVD rhodium coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
  {
    handle: "first-light-set",
    name: "First Light Set",
    category: "Necklaces" as JewelCategory,
    sku: "JDS0204301-set",
    number: "38",
    price: 1799,
    priceLabel: "₹1,799",
    variantId: "gid://shopify/ProductVariant/47501789397154",
    availableForSale: true,
    image: "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/first-light-set-0_2ac00b30-2c62-45f5-a55b-000ea726002b.jpg?v=1787524294",
    gallery: ["https://cdn.shopify.com/s/files/1/0680/9606/5698/files/first-light-set-0_2ac00b30-2c62-45f5-a55b-000ea726002b.jpg?v=1787524294", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/first-light-set-1.jpg?v=1787277765", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/naira-packaging-b13_a87c1294-2b6b-4edf-9165-1050d133780c.jpg?v=1789487793", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/hf_20260807_133544_c9d4e48d-1895-4661-bd1b-4c7fed98b062.png?v=1789558282", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/first-light-set-2.jpg?v=1787277765", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/first-light-set-3.jpg?v=1787277765", "https://cdn.shopify.com/s/files/1/0680/9606/5698/files/first-light-set-4.jpg?v=1787277765"],
    blurb: "A first piece of gold, and a quiet one. The set pairs a fine 1mm cable chain carrying a round clear cubic zirconia of about 5.8mm in a gold four prong setting with matching studs, each stud stone a little larger at about 7.3mm. The chain measures 42cm with a 5cm extender. Both pieces are PVD 18K gold coated, so the finish stays consistent across the neck and ear. It is an easy gift, and an easier everyday default.",
    description: "A first piece of gold, and a quiet one. The set pairs a fine 1mm cable chain carrying a round clear cubic zirconia of about 5.8mm in a gold four prong setting with matching studs, each stud stone a little larger at about 7.3mm. The chain measures 42cm with a 5cm extender. Both pieces are PVD 18K gold coated, so the finish stays consistent across the neck and ear. It is an easy gift, and an easier everyday default.STYLING TIP: Layer it with a longer chain and keep the studs in for a soft everyday set.Details Length: 42cm plus a 5cm extender Set: Pendant necklace and matching stud pair Chain: Fine cable chain, approximately 1mm, 42cm with a 5cm extender Stone: Round clear cubic zirconia, approximately 5.8mm on the pendant Setting: Gold four prong Studs: Round clear cubic zirconia, approximately 7.3mm, included Plating: PVD 18K gold coating, anti-tarnish Material: Surgical stainless steel PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer. CareWaterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.You will receive your piece in a Naira Petite box.",
    stylingTip: "Layer it with a longer chain and keep the studs in for a soft everyday set.",
    details: ["Length: 42cm plus a 5cm extender", "Set: Pendant necklace and matching stud pair", "Chain: Fine cable chain, approximately 1mm, 42cm with a 5cm extender", "Stone: Round clear cubic zirconia, approximately 5.8mm on the pendant", "Setting: Gold four prong", "Studs: Round clear cubic zirconia, approximately 7.3mm, included", "Plating: PVD 18K gold coating, anti-tarnish", "Material: Surgical stainless steel", "PVD vs plating: Regular plating is a soft layer that wears off over time. PVD is bonded to the metal in a vacuum, so it is far harder, stands up to sweat and keeps its colour much longer."],
    care: "Waterproof and tarnish free, so daily wear and water are fine. Keep it away from perfume and harsh chemicals, wipe with a soft dry cloth and store it flat in its pouch.",
    materials: "PVD 18K gold coated · brilliant-cut zircone · surgical stainless steel · waterproof, anti-tarnish",
  },
];
