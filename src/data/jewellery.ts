import marigoldRing from "@/assets/jewellery/marigold-ring.jpg";
import marigoldRing2 from "@/assets/jewellery/marigold-ring-2.jpg";
import vineRing from "@/assets/jewellery/vine-ring.jpg";
import vineRing2 from "@/assets/jewellery/vine-ring-2.jpg";
import dropEarrings from "@/assets/jewellery/drop-earrings.jpg";
import dropEarrings2 from "@/assets/jewellery/drop-earrings-2.jpg";
import studEarrings from "@/assets/jewellery/stud-earrings.jpg";
import studEarrings2 from "@/assets/jewellery/stud-earrings-2.jpg";
import chandbali from "@/assets/jewellery/chandbali.jpg";
import chandbali2 from "@/assets/jewellery/chandbali-2.jpg";
import zirconeSolitaire from "@/assets/jewellery/zircone-solitaire.jpg";
import zirconeSolitaire2 from "@/assets/jewellery/zircone-solitaire-2.jpg";
import zirconeStuds from "@/assets/jewellery/zircone-studs.jpg";
import zirconeStuds2 from "@/assets/jewellery/zircone-studs-2.jpg";

/* ───────────────────────────────────────────────────────────────
   FINE JEWELLERY — demi-gold (18k gold-plated) capsule
   A new arm of Naira Flore: pressed-flower jewellery, made to order.
   Self-contained catalogue (not Shopify-backed) — orders run through
   the atelier's WhatsApp enquiry line, fitting a made-to-order launch.
   Imagery generated for the brand on a matching ivory ground.

   PRE-ORDER LAUNCH: prices are intentionally hidden for now — every
   piece shows "Pre-order open" instead of a figure. The numeric `price`
   fields below are kept as an internal record for when pricing goes
   live; only `priceLabel` is rendered, so flip these back to the ₹
   values (and revert the ring-lab captions) to show prices again.
   ─────────────────────────────────────────────────────────────── */

export type JewelCategory = "Rings" | "Earrings";

/** Shown in place of a price while the collection is in pre-order. */
export const PREORDER_LABEL = "Pre-order open";

export interface JewelPiece {
  handle: string;
  name: string;
  category: JewelCategory;
  price: number;            // INR — internal record only; not displayed during pre-order
  priceLabel: string;       // displayed status/label (currently PREORDER_LABEL)
  image: string;            // primary packshot (grid + first gallery frame)
  gallery?: string[];       // additional angles for the quick-view
  blurb: string;
  materials: string;
  tag?: string;
}

export const WHATSAPP_NUMBER = "919561557935";

export const jewelleryEnquiryUrl = (name: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hi Naira Flore — I'd love to pre-order the "${name}" from the demi-gold jewellery collection. Could you share availability and details?`
  )}`;

export const jewellery: JewelPiece[] = [
  {
    handle: "zircone-solitaire",
    name: "The Zircone Solitaire",
    category: "Rings",
    price: 4500,
    priceLabel: PREORDER_LABEL,
    image: zirconeSolitaire,
    gallery: [zirconeSolitaire, zirconeSolitaire2],
    blurb: "One brilliant-cut white zircone, four gold claws, nothing else. Cut like a diamond, worn like a flower.",
    materials: "18k gold-plated · brilliant-cut white zircone · 4-prong",
    tag: "THE CLASSIC",
  },
  {
    handle: "zircone-halo-studs",
    name: "Zircone Halo Studs",
    category: "Earrings",
    price: 3600,
    priceLabel: PREORDER_LABEL,
    image: zirconeStuds,
    gallery: [zirconeStuds, zirconeStuds2],
    blurb: "A brilliant white zircone ringed by a halo of smaller stones — everyday fire.",
    materials: "18k gold-plated · white zircones · halo setting",
    tag: "NEW",
  },
  {
    handle: "marigold-signet-ring",
    name: "Marigold Signet Ring",
    category: "Rings",
    price: 3900,
    priceLabel: PREORDER_LABEL,
    image: marigoldRing,
    gallery: [marigoldRing, marigoldRing2],
    blurb: "A full marigold in bloom, cast in demi-gold with a blush-pink crystal at its heart.",
    materials: "18k gold-plated brass · blush crystal · hand-finished",
    tag: "BESTSELLER",
  },
  {
    handle: "sage-vine-band",
    name: "Sage Vine Band",
    category: "Rings",
    price: 3200,
    priceLabel: PREORDER_LABEL,
    image: vineRing,
    gallery: [vineRing, vineRing2],
    blurb: "A slim band wound with engraved leaves around a single sage-jade cabochon.",
    materials: "18k gold-plated brass · sage jade · engraved",
  },
  {
    handle: "pressed-petal-drops",
    name: "Pressed Petal Drops",
    category: "Earrings",
    price: 4800,
    priceLabel: PREORDER_LABEL,
    image: dropEarrings,
    gallery: [dropEarrings, dropEarrings2],
    blurb: "Real pressed blossoms set in resin above a faceted blush teardrop.",
    materials: "18k gold-plated · pressed flowers · blush crystal",
    tag: "NEW",
  },
  {
    handle: "bloom-studs",
    name: "Bloom Studs",
    category: "Earrings",
    price: 2900,
    priceLabel: PREORDER_LABEL,
    image: studEarrings,
    gallery: [studEarrings, studEarrings2],
    blurb: "Eight-petal flower studs cast from a real bloom, centred with sage stone.",
    materials: "18k gold-plated brass · sage cabochon",
  },
  {
    handle: "chandbali-florale",
    name: "Chandbali Florale",
    category: "Earrings",
    price: 5600,
    priceLabel: PREORDER_LABEL,
    image: chandbali,
    gallery: [chandbali, chandbali2],
    blurb: "An Indo-western chandbali in floral filigree, finished with seed-pearl drops.",
    materials: "18k gold-plated · filigree · freshwater pearl",
    tag: "STATEMENT",
  },
];
