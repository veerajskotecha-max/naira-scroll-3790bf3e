/* ───────────────────────────────────────────────────────────────
   SEO CONTENT — indexable landing-page and journal copy.
   Kept as data so the sitemap generator and the routes read the
   same source of truth.
   ─────────────────────────────────────────────────────────────── */

import type { JewelCategory } from "./jewellery";

export const SITE_URL = "https://nairaflore.com";

export interface FaqItem {
  q: string;
  a: string;
}

export interface CategoryLanding {
  slug: string;
  category: JewelCategory;
  h1: string;
  kicker: string;
  metaTitle: string;
  metaDescription: string;
  intro: string[];
  bullets: { title: string; body: string }[];
  faqs: FaqItem[];
}

export const categoryLandings: CategoryLanding[] = [
  {
    slug: "rings",
    category: "Rings",
    h1: "Zircone Rings for Women",
    kicker: "THE GILDED HOUR · RINGS",
    metaTitle: "Zircone Rings for Women — 18K Gold Finished | Naira Flore",
    metaDescription:
      "Hand-set brilliant-cut zircone rings in 18K gold and rhodium finish. Solitaire, halo, eternity and toi-et-moi styles in US sizes 5–8. Anti-tarnish, waterproof-sealed.",
    intro: [
      "A ring is the piece people see first. Ours are cut and set the way fine jewellery is — a brilliant-cut zircone held in real prongs, a band filed thin enough to sit flush against the finger, and an 18K gold or rhodium finish sealed against water and daily wear.",
      "The Gilded Hour rings run from a single-stone solitaire to a full pavé eternity. Every piece is hand-set in small batches at our Nashik atelier, numbered, and finished to the same tolerances we use on our couture embroidery — nothing leaves until the stones sit level under light.",
      "Sizes run US 5 (4.9 cm inner circumference) through US 8 (5.7 cm). If you are between sizes, message the atelier and we will guide you before the piece is made.",
    ],
    bullets: [
      {
        title: "Brilliant-cut zircone",
        body: "Machine-cut to 57 facets and hand-checked for fire. Under warm light the return reads close to a diamond, which is exactly the point of a demi-fine stone.",
      },
      {
        title: "18K gold finished",
        body: "A thick gold or rhodium coating over a hypoallergenic base, sealed with an anti-tarnish layer so the shank does not green or dull with daily wear.",
      },
      {
        title: "Made in small batches",
        body: "Each ring carries an edition number. We make to order rather than to inventory, which keeps the setting work slow and the finish consistent.",
      },
    ],
    faqs: [
      {
        q: "What ring sizes are available?",
        a: "US 5 (4.9 cm), US 6 (5.2 cm), US 7 (5.4 cm) and US 8 (5.7 cm). Measurements are inner circumference. Tell us your usual size on WhatsApp and we will confirm the fit before production.",
      },
      {
        q: "Will the gold finish fade?",
        a: "Our rings are 18K gold finished over a hypoallergenic base with an anti-tarnish seal. Kept away from perfume, chlorine and abrasive cleaners, the finish holds its colour through everyday wear.",
      },
      {
        q: "Is zircone the same as cubic zirconia?",
        a: "Yes — zircone is our name for the lab-grown cubic zirconia we hand-set. It is cut and polished with the same brilliant facet pattern used for diamonds, which is where the sparkle comes from.",
      },
      {
        q: "Are these rings waterproof?",
        a: "They are waterproof-sealed for incidental contact — rain, washing hands. We still recommend removing them before swimming or long exposure to chlorinated or salt water.",
      },
    ],
  },
  {
    slug: "earrings",
    category: "Earrings",
    h1: "Zircone Earrings & Studs",
    kicker: "THE GILDED HOUR · EARRINGS",
    metaTitle: "Zircone Earrings & Gold Studs for Women | Naira Flore",
    metaDescription:
      "Bow studs, braided hoops and pavé drops in 18K gold finish with hand-set zircone. Lightweight, anti-tarnish and made to order by the Naira Flore atelier.",
    intro: [
      "Earrings get worn more than anything else in a jewellery box, so weight matters as much as sparkle. The Gilded Hour studs and hoops are built light — hollow-formed where we can, with posts and backs sized for all-day wear rather than for the photograph.",
      "The range covers everyday studs, a braided hoop that reads gold from across a room, and drop styles set with graduated zircone for evening. Each is 18K gold finished and sealed against tarnish.",
    ],
    bullets: [
      {
        title: "Built light",
        body: "Hollow-formed hoops and slim posts, so the lobe is not dragged down over a long day or a long evening.",
      },
      {
        title: "Hand-set stones",
        body: "Every zircone is seated and levelled by hand, then checked under raking light before the pair is boxed.",
      },
      {
        title: "Skin-friendly",
        body: "Hypoallergenic base metal under the gold finish — safe for most sensitive ears with no nickel bloom.",
      },
    ],
    faqs: [
      {
        q: "Are these earrings suitable for sensitive ears?",
        a: "Yes. We use a hypoallergenic base metal under the 18K gold finish and avoid nickel in the posts, which is the usual cause of irritation.",
      },
      {
        q: "How heavy are the hoops?",
        a: "Our hoops are hollow-formed and sit in the light range for their diameter, so they can be worn through a full day or an event without dragging.",
      },
      {
        q: "Can I wear them every day?",
        a: "They are made for it. Wipe them with a dry cloth after wear and keep them away from perfume and hairspray to protect the finish.",
      },
    ],
  },
  {
    slug: "bracelets",
    category: "Bracelets",
    h1: "Tennis Bracelets & Gold Cuffs",
    kicker: "THE GILDED HOUR · BRACELETS",
    metaTitle: "Zircone Tennis Bracelets & Gold Cuffs for Women | Naira Flore",
    metaDescription:
      "Hand-set tennis bracelets, chevron stacks and gold-finished cuffs with brilliant-cut zircone. Adjustable, anti-tarnish, made to order in India by Naira Flore.",
    intro: [
      "A tennis bracelet lives on the wrist bone, which means the clasp and the articulation matter more than the stone count. Ours are linked so the line follows the wrist instead of standing away from it, with a secure box clasp and a safety catch.",
      "Alongside the classic line we make a chevron stack and a set of gold-finished cuffs meant to be layered with a watch. All pieces are 18K gold or rhodium finished and sealed against tarnish.",
    ],
    bullets: [
      {
        title: "Articulated links",
        body: "Each setting pivots against the next, so the bracelet drapes around the wrist rather than sitting proud of it.",
      },
      {
        title: "Secure closure",
        body: "Box clasp with a fold-over safety catch — the reason tennis bracelets get lost is the clasp, so we over-build it.",
      },
      {
        title: "Layerable finishes",
        body: "Gold and rhodium in the same collection, cut to stack cleanly with a watch or with each other.",
      },
    ],
    faqs: [
      {
        q: "What wrist size do the bracelets fit?",
        a: "Our standard length suits wrists between 15 cm and 18 cm. Share your wrist measurement on WhatsApp and we will adjust the link count before making your piece.",
      },
      {
        q: "Can the bracelet be resized?",
        a: "Yes — because the pieces are made to order, we set the link count to your measurement rather than shipping a fixed length.",
      },
      {
        q: "How should I store a tennis bracelet?",
        a: "Lay it flat in the pouch it ships in rather than coiling it. Coiling stresses the links over time and can loosen a setting.",
      },
    ],
  },
  {
    slug: "necklaces",
    category: "Necklaces",
    h1: "Gold Finished Necklaces & Pendants",
    kicker: "THE GILDED HOUR · NECKLACES",
    metaTitle: "Gold Finished Necklaces & Zircone Pendants | Naira Flore",
    metaDescription:
      "Lariats, rondelle chains and zircone pendants in an 18K gold finish. Layerable lengths, anti-tarnish sealing, made to order by the Naira Flore atelier.",
    intro: [
      "Necklaces are the hardest demi-fine piece to get right, because the chain is where cheap jewellery gives itself away. We use a soldered, weight-matched chain on every style so the pendant sits centred and the links do not splay after a month.",
      "The line runs from a knotted lariat to a rondelle chain and a fine zircone pendant, cut at layering lengths so two or three can be worn together without tangling.",
    ],
    bullets: [
      {
        title: "Soldered chain links",
        body: "Closed and soldered rather than pressed shut, which is what keeps a fine chain from opening at the weakest link.",
      },
      {
        title: "Layering lengths",
        body: "Cut at staggered lengths so a lariat, a chain and a pendant can be stacked without riding over one another.",
      },
      {
        title: "Sealed finish",
        body: "18K gold finish with an anti-tarnish seal — the neck is the warmest, oiliest place jewellery sits, so the seal matters most here.",
      },
    ],
    faqs: [
      {
        q: "What chain lengths do you offer?",
        a: "Standard lengths sit at 40 cm, 45 cm and 50 cm so the pieces layer cleanly. Custom lengths can be requested on WhatsApp before your order is made.",
      },
      {
        q: "Will the chain turn my neck green?",
        a: "No. The base metal is hypoallergenic and the 18K gold finish is sealed, which prevents the copper reaction that causes green marks on plated chains.",
      },
      {
        q: "Can I shower wearing the necklace?",
        a: "The finish is waterproof-sealed, but soap and shampoo residue dulls any plated surface. We recommend taking it off before a shower and wiping it dry after wear.",
      },
    ],
  },
];

export const categoryBySlug = (slug?: string) =>
  categoryLandings.find((c) => c.slug === slug);

/* ── JOURNAL ─────────────────────────────────────────────────── */

export interface JournalSection {
  h: string;
  p: string[];
}

export interface JournalArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  published: string; // ISO date
  readTime: string;
  intro: string;
  sections: JournalSection[];
  faqs?: FaqItem[];
}

export const journal: JournalArticle[] = [
  {
    slug: "ring-size-guide-india",
    title: "Ring Size Guide for India: How to Measure at Home",
    metaTitle: "Ring Size Guide India — Measure Your Ring Size at Home",
    metaDescription:
      "How to find your ring size at home in minutes, with a US-to-cm conversion chart for Indian sizes and the mistakes that make rings come back too loose.",
    excerpt:
      "A paper strip, a ruler and two minutes. Here is how to measure your ring size accurately at home, plus the US-to-centimetre chart we use at the atelier.",
    published: "2026-02-10",
    readTime: "5 min read",
    intro:
      "Nearly every ring exchange we handle comes down to one thing: the size was guessed. Measuring at home takes two minutes and needs nothing you do not already own.",
    sections: [
      {
        h: "The paper strip method",
        p: [
          "Cut a strip of paper about 6 mm wide and 10 cm long. Wrap it around the base of the finger you intend to wear the ring on, snug but not tight — you should still be able to slide it off over the knuckle.",
          "Mark where the strip overlaps, unwrap it, and measure the length in millimetres with a ruler. That number is your inner circumference, which is the measurement jewellers actually work from.",
        ],
      },
      {
        h: "US to centimetre conversion",
        p: [
          "US 5 is 4.9 cm inner circumference. US 6 is 5.2 cm. US 7 is 5.4 cm. US 8 is 5.7 cm. Indian sizes 10, 12, 14 and 16 land close to those four, which is why we quote both.",
          "If your measurement falls between two sizes, go up rather than down. A ring that spins slightly can be padded; a ring that will not clear the knuckle cannot be worn at all.",
        ],
      },
      {
        h: "Three things that skew the measurement",
        p: [
          "Temperature. Fingers are smallest in the early morning and in cold weather, and can swell by up to half a size by evening. Measure at the end of the day.",
          "Band width. A wide band feels tighter than a thin one at the same size. If you are buying a band over 6 mm wide, add a quarter size.",
          "Knuckle size. If your knuckle is noticeably larger than the base of your finger, size to the knuckle and expect a little movement at the base.",
        ],
      },
    ],
    faqs: [
      {
        q: "Which finger should I measure?",
        a: "Measure the exact finger and hand you plan to wear the ring on. Your dominant hand is usually a quarter to a half size larger than the other.",
      },
      {
        q: "What if I am between two ring sizes?",
        a: "Choose the larger size. A slightly loose ring can be adjusted or padded, while a ring that does not clear the knuckle cannot be worn.",
      },
    ],
  },
  {
    slug: "how-to-care-for-gold-plated-jewellery",
    title: "How to Care for Gold Plated Jewellery So It Lasts",
    metaTitle: "How to Care for Gold Plated Jewellery — Keep the Finish",
    metaDescription:
      "What actually strips a gold plated finish, how to clean demi-fine jewellery safely, and the storage habit that adds years to an 18K gold finished piece.",
    excerpt:
      "Plating does not simply wear off — it is stripped, usually by perfume, sweat and the wrong cloth. Here is the routine we give every Gilded Hour client.",
    published: "2026-03-04",
    readTime: "6 min read",
    intro:
      "Gold plated and gold finished jewellery fails in predictable ways. Almost all of them are chemical rather than mechanical, which means they are avoidable.",
    sections: [
      {
        h: "What strips the finish",
        p: [
          "Perfume and hairspray are the biggest offenders. Both are alcohol-based, and alcohol lifts the anti-tarnish seal that sits over the gold layer. Once the seal is gone, sweat reaches the base metal.",
          "Chlorine is next. A single afternoon in a pool does measurable damage to any plated surface, and salt water is not much kinder.",
          "Abrasives finish the job. Toothpaste, baking soda and polishing cloths designed for solid gold will physically remove a microns-thick plating layer.",
        ],
      },
      {
        h: "The order of operations",
        p: [
          "Jewellery goes on last and comes off first. Perfume, moisturiser, sunscreen and hairspray all get applied and allowed to dry before anything is put on.",
          "At the end of the day, wipe each piece with a dry, soft cotton cloth before it goes away. This removes the body oils and sweat that would otherwise sit on the surface overnight.",
        ],
      },
      {
        h: "Cleaning without damage",
        p: [
          "For a proper clean, use lukewarm water with a single drop of mild dish soap. Dip, do not soak. Work gently around the stone settings with a very soft brush, rinse in clean water and pat completely dry.",
          "Never use ultrasonic cleaners on plated or demi-fine jewellery. The cavitation that lifts dirt out of solid gold will also lift plating away from the base.",
        ],
      },
      {
        h: "Storage that actually helps",
        p: [
          "Store pieces separately in soft pouches or a lined box. Loose in a drawer, chains abrade rings and rings abrade one another, and every scratch is a place where the seal has been broken.",
          "Keep the storage dry. A silica sachet in the box costs nothing and removes the humidity that accelerates tarnish, which matters through an Indian monsoon.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I wear gold plated jewellery every day?",
        a: "Yes, provided you keep it away from perfume, chlorine and abrasives, and wipe it dry after wear. Daily wear itself is not what damages a sealed 18K gold finish.",
      },
      {
        q: "How do I clean gold plated jewellery at home?",
        a: "Lukewarm water with one drop of mild dish soap, a very soft brush around the settings, a clean-water rinse and a full pat dry. Avoid toothpaste, baking soda and ultrasonic cleaners.",
      },
    ],
  },
  {
    slug: "zirconia-vs-diamond",
    title: "Zirconia vs Diamond: What You Are Actually Buying",
    metaTitle: "Zirconia vs Diamond — Sparkle, Hardness and Cost Compared",
    metaDescription:
      "An honest comparison of cubic zirconia and diamond: brilliance, fire, hardness, price and how to tell them apart — and when zircone is the smarter buy.",
    excerpt:
      "Zirconia is not a fake diamond, it is a different stone with different optics. Knowing where it wins makes it much easier to buy well.",
    published: "2026-04-18",
    readTime: "6 min read",
    intro:
      "The comparison is usually framed as real versus fake, which is not useful. Cubic zirconia is a genuine lab-grown crystal with its own optical properties — some of which beat diamond outright.",
    sections: [
      {
        h: "Fire versus brilliance",
        p: [
          "Diamond returns more white light — that is brilliance. Zirconia disperses more coloured light — that is fire. A well-cut zirconia throws noticeably more rainbow flash than a diamond of the same size, which is why it photographs so well.",
          "In candlelight or warm indoor lighting, most people cannot separate the two across a room. Under bright daylight at close range, the difference in dispersion becomes visible to a trained eye.",
        ],
      },
      {
        h: "Hardness and daily wear",
        p: [
          "Diamond sits at 10 on the Mohs scale, zirconia at roughly 8.5. Both are far harder than anything in everyday life, but zirconia will accumulate fine surface scratches over years of hard wear where a diamond will not.",
          "The practical consequence is edges. A zirconia's facet junctions soften slightly with age, which is the real reason older costume stones look cloudy — not the stone itself, but the polish.",
        ],
      },
      {
        h: "Cost and what it buys you",
        p: [
          "The price gap is enormous, and it is not the stone alone. A diamond piece has to be built to protect the investment; a zirconia piece can put the budget into the setting, the finish and the design instead.",
          "That is the trade we make at Naira Flore. Hand-set stones, an 18K gold finish, soldered links and a sealed surface — construction quality you would not get at the same price if the stone were carrying the cost.",
        ],
      },
      {
        h: "How to tell them apart",
        p: [
          "Weight is the giveaway. Zirconia is around 1.7 times denser than diamond, so a zirconia of the same size feels heavier in the hand.",
          "The breath test is folklore and unreliable. If certainty matters, a jeweller's thermal probe reads the difference in seconds.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does cubic zirconia lose its sparkle over time?",
        a: "The stone does not change, but surface film from oils and soap dulls it. Cleaning it in lukewarm soapy water restores the sparkle. Very old stones can also show softened facet edges from years of abrasion.",
      },
      {
        q: "Is zirconia a good choice for an everyday ring?",
        a: "Yes. At 8.5 on the Mohs scale it easily handles daily wear, and the lower cost means the money goes into the setting and finish instead of the stone.",
      },
    ],
  },
  {
    slug: "how-to-style-indo-western-outfits",
    title: "How to Style Indo-Western Outfits Without Overthinking It",
    metaTitle: "How to Style Indo-Western Outfits — A Practical Guide",
    metaDescription:
      "Silhouette, fabric and jewellery rules for styling Indo-Western outfits for weddings, receptions and work events — from the Naira Flore atelier.",
    excerpt:
      "Indo-Western works when one element is doing the talking. Here is how to decide which one, and what to do with everything else.",
    published: "2026-05-22",
    readTime: "5 min read",
    intro:
      "Indo-Western dressing fails in one specific way: two loud ideas competing. The fix is deciding early whether the drape, the embroidery or the jewellery is the point.",
    sections: [
      {
        h: "Pick the hero",
        p: [
          "If the outfit carries heavy zardosi or thread work, the jewellery should be quiet — a fine chain, small studs, one ring. The embroidery is already doing the work.",
          "If the outfit is clean-lined in a solid fabric, that is the moment for a tennis bracelet, layered chains or a statement drop earring. A plain silhouette is a stage, not a compromise.",
        ],
      },
      {
        h: "Fabric decides the season",
        p: [
          "Georgette, organza and chiffon move, which suits daytime and outdoor functions where a stiff fabric reads heavy in photographs.",
          "Raw silk, velvet and brocade hold structure and light. They belong at evening receptions and sangeets where the light is warm and directional.",
        ],
      },
      {
        h: "Getting the proportion right",
        p: [
          "Volume goes on one half only. A dramatic sleeve pairs with a narrow skirt; a full drape pairs with a fitted bodice. Volume on both halves reads as bulk, not as drama.",
          "Length is the other lever. A cropped jacket over a floor-length drape lengthens the line; a long jacket over wide trousers shortens it, which is occasionally what you want.",
        ],
      },
      {
        h: "Jewellery pairings that work",
        p: [
          "Deep necklines take a pendant that sits above the neckline, never inside it. High or closed necklines belong to earrings and bracelets instead.",
          "Mixing gold and rhodium is fine, and is easier to carry off when the two finishes appear in the same piece somewhere in the look.",
        ],
      },
    ],
    faqs: [
      {
        q: "What jewellery works with heavily embroidered outfits?",
        a: "Keep it minimal — a fine chain, small studs and at most one ring. Heavy embroidery and statement jewellery compete, and the outfit loses.",
      },
      {
        q: "Can Indo-Western outfits be worn to a wedding?",
        a: "Yes, and they suit sangeets, receptions and mehendi particularly well. For the main ceremony, choose structured fabrics like raw silk or brocade over lighter drapes.",
      },
    ],
  },
  {
    slug: "demi-fine-jewellery-explained",
    title: "Demi-Fine Jewellery Explained: Between Costume and Fine",
    metaTitle: "What is Demi-Fine Jewellery? The Category Explained",
    metaDescription:
      "What demi-fine jewellery means, how it differs from costume and fine jewellery, and what to check before buying an 18K gold finished piece.",
    excerpt:
      "Demi-fine is the category most people are actually shopping for without having a word for it. Here is what defines it, and what to check before you buy.",
    published: "2026-06-15",
    readTime: "5 min read",
    intro:
      "Between throwaway costume jewellery and solid-gold fine jewellery sits a category built for real, repeated wear at a price that is not an event. That is demi-fine.",
    sections: [
      {
        h: "The three categories",
        p: [
          "Costume jewellery uses base metals with a thin flash of colour and glued stones. It is made to last a season and priced accordingly.",
          "Fine jewellery is solid precious metal with natural or lab-grown precious stones, and is priced as a store of value as much as an object.",
          "Demi-fine sits between them: a hypoallergenic base with a substantial gold or rhodium coating, hand-set stones in real prongs or bezels, and construction detail borrowed from fine jewellery.",
        ],
      },
      {
        h: "What to check before buying",
        p: [
          "Are the stones set or glued? Prongs, bezels and channels are set. Glue is the single clearest sign of costume construction.",
          "Is the finish sealed? An anti-tarnish seal over the gold layer is what stops sweat reaching the base metal, and it is the difference between two years and two months.",
          "Are the chain links soldered? Pressed links open. Soldered links do not. On a fine chain this is the failure point every time.",
        ],
      },
      {
        h: "Why we build the way we do",
        p: [
          "The Gilded Hour is made to order in small numbered batches at our Nashik atelier. Every zircone is hand-set and levelled, every chain link soldered, and every surface sealed against tarnish before it is boxed.",
          "Made to order means no dead inventory, which is what lets us spend the time on the setting rather than the volume.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is demi-fine jewellery worth buying?",
        a: "If you want pieces you can wear daily without worrying about them, yes. You get set stones, sealed finishes and proper construction at a fraction of solid-gold pricing.",
      },
      {
        q: "How long does demi-fine jewellery last?",
        a: "A well-made, sealed piece kept away from perfume and chlorine holds its finish through years of regular wear. Costume jewellery at the same care level lasts months.",
      },
    ],
  },
];

export const articleBySlug = (slug?: string) =>
  journal.find((a) => a.slug === slug);
