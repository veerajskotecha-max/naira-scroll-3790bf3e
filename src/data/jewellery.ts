import theVow from "@/assets/jewellery/gilded/the-vow.jpg.asset.json";
import theHalo from "@/assets/jewellery/gilded/the-halo.jpg.asset.json";
import theWhirl from "@/assets/jewellery/gilded/the-whirl.jpg.asset.json";
import theVine from "@/assets/jewellery/gilded/the-vine.jpg.asset.json";
import theDewRing from "@/assets/jewellery/gilded/the-dew-ring.jpg.asset.json";
import theToiEtMoi from "@/assets/jewellery/gilded/the-toi-et-moi.jpg.asset.json";
import theChevronStack from "@/assets/jewellery/gilded/the-chevron-stack.jpg.asset.json";
import theSugarTennis from "@/assets/jewellery/gilded/the-sugar-tennis.jpg.asset.json";
import theSugarTennis2 from "@/assets/jewellery/gilded/the-sugar-tennis-2.jpg.asset.json";
import theBow from "@/assets/jewellery/gilded/the-bow.jpg.asset.json";
import theTideline from "@/assets/jewellery/gilded/the-tideline.jpg.asset.json";
import theKeepsake from "@/assets/jewellery/gilded/the-keepsake.jpg.asset.json";
import theKeepsake2 from "@/assets/jewellery/gilded/the-keepsake-2.jpg.asset.json";
import theBraidedHoop from "@/assets/jewellery/gilded/the-braided-hoop.jpg.asset.json";
import theStuds from "@/assets/jewellery/gilded/the-studs.jpg.asset.json";
import theStuds2 from "@/assets/jewellery/gilded/the-studs-2.jpg.asset.json";
import theStuds3 from "@/assets/jewellery/gilded/the-studs-3.jpg.asset.json";
import theKnotLariat from "@/assets/jewellery/gilded/the-knot-lariat.jpg.asset.json";
import theRondelle from "@/assets/jewellery/gilded/the-rondelle.jpg.asset.json";
import theAnchorChain from "@/assets/jewellery/gilded/the-anchor-chain.jpg.asset.json";
import theCascade from "@/assets/jewellery/gilded/the-cascade.jpg.asset.json";
import theVineUgc from "@/assets/jewellery/ugc/the-vine-ugc.jpg.asset.json";

/* ───────────────────────────────────────────────────────────────
   THE GILDED HOUR — Naira Flore's petite jewellery line, first look
   Seventeen numbered pieces from the private teaser. 18k gold /
   silver / rhodium coatings, hand-set zirconia, anti-tarnish and
   waterproof-sealed. Pre-order launch — prices hidden, orders run
   through the atelier's WhatsApp enquiry line.
   ─────────────────────────────────────────────────────────────── */

export type JewelCategory = "Rings" | "Bracelets" | "Earrings" | "Necklaces";

/** Shown in place of a price while the collection is in pre-order. */
export const PREORDER_LABEL = "Pre-order open";

export interface JewelPiece {
  handle: string;
  name: string;
  category: JewelCategory;
  number: string;           // "01"–"17" — engraved edition number
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
    `Hi Naira Flore — I'd love to pre-order the "${name}" from The Gilded Hour. Could you share availability and details?`
  )}`;

export const jewellery: JewelPiece[] = [
  // ── THE RINGS ────────────────────────────────────────────────
  {
    handle: "the-vow",
    name: "The Vow",
    category: "Rings",
    number: "01",
    price: 4500,
    priceLabel: PREORDER_LABEL,
    image: theVow.url,
    gallery: [theVow.url],
    blurb: "A round stone, a thin band. One brilliant-cut zirconia on a hairline of rhodium, worn like a promise.",
    materials: "Rhodium coating · brilliant-cut zirconia · 4-prong",
    tag: "THE CLASSIC",
  },
  {
    handle: "the-halo",
    name: "The Halo",
    category: "Rings",
    number: "02",
    price: 4800,
    priceLabel: PREORDER_LABEL,
    image: theHalo.url,
    gallery: [theHalo.url],
    blurb: "A stone ringed in pave. A brilliant centre held inside a whisper of smaller stones.",
    materials: "Rhodium coating · zirconia halo · pavé shoulders",
  },
  {
    handle: "the-whirl",
    name: "The Whirl",
    category: "Rings",
    number: "03",
    price: 4600,
    priceLabel: PREORDER_LABEL,
    image: theWhirl.url,
    gallery: [theWhirl.url],
    blurb: "Spinning in a coil of pave. A single stone held inside a turning band of light.",
    materials: "Rhodium coating · zirconia · pavé coil",
  },
  {
    handle: "the-vine",
    name: "The Vine",
    category: "Rings",
    number: "04",
    price: 5200,
    priceLabel: PREORDER_LABEL,
    image: theVine.url,
    gallery: [theVine.url],
    blurb: "Green stones, cradled in white. An open eternity of emerald-cut greens against a rhodium sky.",
    materials: "Rhodium coating · green zirconia · open eternity band",
    tag: "NEW",
  },
  {
    handle: "the-dew-ring",
    name: "The Dew Ring",
    category: "Rings",
    number: "05",
    price: 3900,
    priceLabel: PREORDER_LABEL,
    image: theDewRing.url,
    gallery: [theDewRing.url],
    blurb: "Two beaded drops, one gold, one rhodium, on an open band. Worn the way water beads on a leaf.",
    materials: "18k gold coating · rhodium · open band",
  },
  {
    handle: "the-toi-et-moi",
    name: "The Toi et Moi",
    category: "Rings",
    number: "06",
    price: 5400,
    priceLabel: PREORDER_LABEL,
    image: theToiEtMoi.url,
    gallery: [theToiEtMoi.url],
    blurb: "Two stones that never quite touch. A cushion and a pear held in a two-tone bezel.",
    materials: "18k gold + rhodium · cushion & pear zirconia",
    tag: "STATEMENT",
  },
  {
    handle: "the-chevron-stack",
    name: "The Chevron Stack",
    category: "Rings",
    number: "07",
    price: 4200,
    priceLabel: PREORDER_LABEL,
    image: theChevronStack.url,
    gallery: [theChevronStack.url],
    blurb: "Three rings that arrive together and rarely part. A pavé chevron above two slim gold bands.",
    materials: "18k gold coating · pavé chevron · stack of three",
  },

  // ── THE WRIST ────────────────────────────────────────────────
  {
    handle: "the-sugar-tennis",
    name: "The Sugar Tennis",
    category: "Bracelets",
    number: "08",
    price: 8900,
    priceLabel: PREORDER_LABEL,
    image: theSugarTennis.url,
    gallery: [theSugarTennis.url, theSugarTennis2.url],
    blurb: "Pastel zirconia in rhodium, cool against the skin. A soft tennis line of sugared blues, pinks and yellows.",
    materials: "Rhodium coating · pastel zirconia · box-clasp",
    tag: "BESTSELLER",
  },
  {
    handle: "the-bow",
    name: "The Bow",
    category: "Bracelets",
    number: "09",
    price: 4600,
    priceLabel: PREORDER_LABEL,
    image: theBow.url,
    gallery: [theBow.url],
    blurb: "Two hearts of zirconia tied at the wrist, on a chain of small gold beads.",
    materials: "18k gold coating · heart-cut zirconia · beaded chain",
  },
  {
    handle: "the-tideline",
    name: "The Tideline",
    category: "Bracelets",
    number: "10",
    price: 6800,
    priceLabel: PREORDER_LABEL,
    image: theTideline.url,
    gallery: [theTideline.url],
    blurb: "Baroque pearls, no two alike, gathered on a single gold toggle.",
    materials: "Baroque freshwater pearls · 18k gold toggle",
    tag: "NEW",
  },
  {
    handle: "the-keepsake",
    name: "The Keepsake",
    category: "Bracelets",
    number: "11",
    price: 4200,
    priceLabel: PREORDER_LABEL,
    image: theKeepsake.url,
    gallery: [theKeepsake.url, theKeepsake2.url],
    blurb: "Steel beads, cool as river stones, a gold heart caught at the clasp.",
    materials: "Rhodium-coated steel beads · 18k gold heart · toggle",
  },

  // ── THE EARS ─────────────────────────────────────────────────
  {
    handle: "the-braided-hoop",
    name: "The Braided Hoop",
    category: "Earrings",
    number: "12",
    price: 5200,
    priceLabel: PREORDER_LABEL,
    image: theBraidedHoop.url,
    gallery: [theBraidedHoop.url],
    blurb: "Gold woven the way our hems are. A generous braid, hinged closed.",
    materials: "18k gold coating · braided hoop · hinged clasp",
  },
  {
    handle: "the-studs",
    name: "The Studs — Three Ways",
    category: "Earrings",
    number: "13",
    price: 3400,
    priceLabel: PREORDER_LABEL,
    image: theStuds.url,
    gallery: [theStuds.url, theStuds2.url, theStuds3.url],
    blurb: "A pearl, a halo, a bow. One goes with everything — chosen as a set or singly.",
    materials: "18k gold coating · pearl / halo zirconia / bow zirconia",
    tag: "SET OF THREE",
  },

  // ── THE THROAT ───────────────────────────────────────────────
  {
    handle: "the-knot-lariat",
    name: "The Knot Lariat",
    category: "Necklaces",
    number: "14",
    price: 7200,
    priceLabel: PREORDER_LABEL,
    image: theKnotLariat.url,
    gallery: [theKnotLariat.url],
    blurb: "A snake chain looped once, a pearl caught in the turn.",
    materials: "18k gold coating · snake chain · freshwater pearl",
  },
  {
    handle: "the-rondelle",
    name: "The Rondelle",
    category: "Necklaces",
    number: "15",
    price: 6400,
    priceLabel: PREORDER_LABEL,
    image: theRondelle.url,
    gallery: [theRondelle.url],
    blurb: "A barrel of pave beside a smooth gold ring, sliding on a fine box chain.",
    materials: "18k gold coating · pavé barrel · box chain",
  },
  {
    handle: "the-anchor-chain",
    name: "The Anchor Chain",
    category: "Necklaces",
    number: "16",
    price: 7800,
    priceLabel: PREORDER_LABEL,
    image: theAnchorChain.url,
    gallery: [theAnchorChain.url],
    blurb: "Heavy links, one paved in white, worn close.",
    materials: "18k gold coating · anchor links · single pavé link",
    tag: "STATEMENT",
  },
  {
    handle: "the-cascade",
    name: "The Cascade",
    category: "Necklaces",
    number: "17",
    price: 8600,
    priceLabel: PREORDER_LABEL,
    image: theCascade.url,
    gallery: [theCascade.url],
    blurb: "A marquise held high, then three more falling in a line.",
    materials: "18k gold coating · marquise zirconia · four-stone drop",
  },
];
