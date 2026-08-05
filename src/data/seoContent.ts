/* ───────────────────────────────────────────────────────────────
   SEO CONTENT, indexable landing-page and journal copy.
   Kept as data so the sitemap generator and the routes read the
   same source of truth.
   ─────────────────────────────────────────────────────────────── */

import type { JewelCategory } from "./jewellery";
import { extraLandings } from "./seoLandings.extra";
import { extraJournal } from "./seoJournal.extra";

export const SITE_URL = "https://nairaflore.com";

export interface FaqItem {
  q: string;
  a: string;
}

export interface CategoryLanding {
  slug: string;
  /** Omitted on topic landings, which show the full collection. */
  category?: JewelCategory;
  /** Breadcrumb / section label. Falls back to the category name. */
  crumb?: string;
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
    metaTitle: "Zircone Rings for Women, 18K Gold Finished | Naira Flore",
    metaDescription:
      "Hand-set brilliant-cut zircone rings in 18K gold and rhodium finish. Solitaire, halo, eternity and toi-et-moi styles in US sizes 5–8. Anti-tarnish, waterproof-sealed.",
    intro: [
      "A ring is the piece people see first. Ours are cut and set the way fine jewellery is, a brilliant-cut zircone held in real prongs, a band filed thin enough to sit flush against the finger, and an 18K gold or rhodium finish sealed against water and daily wear.",
      "The Gilded Hour rings run from a single-stone solitaire to a full pavé eternity. Every piece is hand-set in small batches at our atelier, numbered, and finished to the same tolerances we use on our couture embroidery, nothing leaves until the stones sit level under light.",
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
        a: "Yes, zircone is our name for the lab-grown cubic zirconia we hand-set. It is cut and polished with the same brilliant facet pattern used for diamonds, which is where the sparkle comes from.",
      },
      {
        q: "Are these rings waterproof?",
        a: "They are waterproof-sealed for incidental contact, rain, washing hands. We still recommend removing them before swimming or long exposure to chlorinated or salt water.",
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
      "Earrings get worn more than anything else in a jewellery box, so weight matters as much as sparkle. The Gilded Hour studs and hoops are built light, hollow-formed where we can, with posts and backs sized for all-day wear rather than for the photograph.",
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
        body: "Hypoallergenic base metal under the gold finish, safe for most sensitive ears with no nickel bloom.",
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
        body: "Box clasp with a fold-over safety catch, the reason tennis bracelets get lost is the clasp, so we over-build it.",
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
        a: "Yes, because the pieces are made to order, we set the link count to your measurement rather than shipping a fixed length.",
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
        body: "18K gold finish with an anti-tarnish seal, the neck is the warmest, oiliest place jewellery sits, so the seal matters most here.",
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
  /* ── TOPIC LANDINGS, head-term demi-fine queries ─────────── */
  {
    slug: "demi-fine-jewellery",
    crumb: "Demi-Fine",
    h1: "Demi-Fine Jewellery in India",
    kicker: "THE GILDED HOUR · DEMI-FINE",
    metaTitle: "Demi-Fine Jewellery India, 18K Gold Finished, Anti-Tarnish",
    metaDescription:
      "Demi-fine jewellery made the way fine jewellery is: hand-set brilliant-cut zircone, 18K gold finish over a hypoallergenic base, anti-tarnish sealed. Rings, earrings, bracelets and necklaces from the Naira Flore atelier.",
    intro: [
      "Demi-fine jewellery sits between costume and solid gold. It is built like fine jewellery, stones set in real prongs, solid construction, a thick precious-metal finish over a hypoallergenic base, but priced so you can own several pieces instead of one.",
      "Everything in The Gilded Hour is demi-fine by that definition. Brilliant-cut zircone hand-set stone by stone, an 18K gold or rhodium finish, and an anti-tarnish seal that keeps the colour honest through daily wear. Nothing is glued, nothing is hollow-stamped, and every piece carries an edition number.",
      "If you have been buying artificial jewellery that greens in a month, demi-fine is the step up you are looking for. It is the category most global jewellery houses now build their everyday lines around, and it is what we make in small batches at our atelier.",
    ],
    bullets: [
      {
        title: "Built like fine jewellery",
        body: "Prong-set stones, soldered joins and finished backs. The construction is the difference between demi-fine and costume, not just the price.",
      },
      {
        title: "18K gold finished, sealed",
        body: "A thick gold or rhodium layer over a hypoallergenic base, then an anti-tarnish seal. No greening, no nickel itch, no dull grey after a monsoon.",
      },
      {
        title: "Priced to actually wear",
        body: "Solid gold sits in a locker. Demi-fine goes to work, to dinner and on the flight, which is the only reason to own jewellery at all.",
      },
    ],
    faqs: [
      {
        q: "What is demi-fine jewellery?",
        a: "Demi-fine jewellery is the tier between costume and fine jewellery. It uses real construction techniques, prong-set stones, soldered joins, a thick 18K gold or rhodium plating over a hypoallergenic base, but substitutes lab-grown stones like zircone for diamonds, so the price stays in reach.",
      },
      {
        q: "Is demi-fine jewellery worth it in India?",
        a: "Yes, if you want pieces you wear rather than store. Demi-fine survives Indian humidity far better than plated costume jewellery because the finish is thicker and sealed, and it costs a fraction of 18K solid gold at the same visual weight.",
      },
      {
        q: "How is demi-fine different from artificial jewellery?",
        a: "Artificial or costume jewellery is usually a thin flash-plate over brass with glued stones, it discolours within weeks. Demi-fine uses a heavy plating, a hypoallergenic base metal and set stones, which is why it holds up for years.",
      },
      {
        q: "Does demi-fine jewellery tarnish?",
        a: "Ours does not under normal wear. Every piece gets an anti-tarnish seal over the gold finish. Keep it away from perfume, chlorine and abrasive cleaners and the colour holds.",
      },
      {
        q: "Is demi-fine jewellery safe for sensitive skin?",
        a: "Yes. The base metal is hypoallergenic and nickel-free, which is the usual cause of reactions with cheaper plated jewellery.",
      },
    ],
  },
  {
    slug: "anti-tarnish-jewellery",
    crumb: "Anti-Tarnish",
    h1: "Anti-Tarnish Jewellery for Daily Wear",
    kicker: "THE GILDED HOUR · ANTI-TARNISH",
    metaTitle: "Anti-Tarnish Jewellery Online, Waterproof, Sealed 18K Finish",
    metaDescription:
      "Anti-tarnish jewellery that survives Indian humidity: sealed 18K gold and rhodium finishes over a hypoallergenic, nickel-free base. Rings, studs, bracelets and chains that will not green, dull or itch.",
    intro: [
      "Tarnish is a chemical reaction, not bad luck. Sweat, perfume, humidity and chlorine strip a thin plating and oxidise the base metal underneath, which is why most plated jewellery in India turns dull or green within a monsoon.",
      "Every Gilded Hour piece is finished in 18K gold or rhodium over a hypoallergenic, nickel-free base and then sealed with an anti-tarnish coat. That seal is the layer that does the real work: it keeps skin acids and moisture off the plating so the colour stays where it should.",
      "Waterproof-sealed for incidental contact, rain, washing hands, a spilt drink. We still ask you to take pieces off before a pool or the sea, because chlorine and salt beat any finish on earth given long enough.",
    ],
    bullets: [
      {
        title: "Sealed, not just plated",
        body: "The anti-tarnish layer sits above the gold. It is the difference between a finish that lasts a season and one that lasts years.",
      },
      {
        title: "Nickel-free base",
        body: "Green skin and itchy earlobes are usually a nickel reaction. Our base metal is hypoallergenic, so neither happens.",
      },
      {
        title: "Built for humidity",
        body: "Made and tested in India. If a finish can hold through an Indian monsoon it can hold anywhere.",
      },
    ],
    faqs: [
      {
        q: "What does anti-tarnish jewellery mean?",
        a: "It means the piece has a protective seal over its plating that blocks moisture, sweat and air from reaching the base metal. Without that barrier, the metal oxidises and the piece darkens or greens.",
      },
      {
        q: "Is anti-tarnish jewellery waterproof?",
        a: "Ours is waterproof-sealed for incidental contact like rain or washing hands. Remove pieces before swimming, chlorine and salt water will degrade any plated finish over time.",
      },
      {
        q: "How long does anti-tarnish jewellery last?",
        a: "With normal wear and basic care, off before perfume, wiped after wear, stored dry, the finish on our pieces holds its colour for years rather than months.",
      },
      {
        q: "Will anti-tarnish jewellery turn my skin green?",
        a: "No. Green skin comes from copper in the base alloy reacting with sweat. Our nickel-free, sealed pieces keep the base metal away from skin entirely.",
      },
    ],
  },
  {
    slug: "american-diamond-jewellery",
    crumb: "American Diamond",
    h1: "American Diamond Jewellery",
    kicker: "THE GILDED HOUR · AMERICAN DIAMOND",
    metaTitle: "American Diamond Jewellery, Brilliant-Cut Zircone, 18K Finish",
    metaDescription:
      "American diamond jewellery hand-set with 57-facet brilliant-cut zircone in an 18K gold or rhodium finish. Solitaire rings, studs, tennis bracelets and pendants that read like the real thing.",
    intro: [
      "American diamond is the Indian trade name for cubic zirconia, a lab-grown stone cut with the same 57-facet brilliant pattern used on diamonds. Cut well and set properly, the light return is close enough that most people cannot tell across a dinner table.",
      "We call ours zircone. Each stone is hand-checked for fire before it is set, held in real prongs rather than glued into a cup, and finished with 18K gold or rhodium. That is the entire difference between American diamond jewellery that looks expensive and the kind that looks like plastic.",
      "Solitaires, halos, eternity bands, tennis bracelets and studs, the classical diamond vocabulary, made in small batches so the setting work stays slow.",
    ],
    bullets: [
      {
        title: "57-facet brilliant cut",
        body: "The same facet map as a round brilliant diamond. Fire comes from the cut, not the carat, which is why cut quality is the only spec worth arguing about.",
      },
      {
        title: "Prong-set by hand",
        body: "Glue yellows and lets stones drop. Every stone we use sits in metal, checked level under light before the piece is sealed.",
      },
      {
        title: "Bridal-ready, daily-wearable",
        body: "Heavy enough for a reception, light enough for a Tuesday. Most clients buy for an occasion and then never take the piece off.",
      },
    ],
    faqs: [
      {
        q: "What is American diamond jewellery?",
        a: "American diamond is the Indian market term for cubic zirconia, a hard, colourless lab-grown stone cut in the brilliant style. It is not a diamond, but it is a real crystal, not glass or plastic.",
      },
      {
        q: "Does American diamond look like a real diamond?",
        a: "A well-cut, well-set stone is very difficult to tell apart in normal light. Under direct sunlight a zircone throws slightly more rainbow fire and slightly less white sparkle than a diamond.",
      },
      {
        q: "Does American diamond lose its shine?",
        a: "The stone itself does not. What dulls is the film of oils and product that builds on it. A soft brush, warm water and mild soap restores it in a minute.",
      },
      {
        q: "Is American diamond jewellery good for weddings?",
        a: "It is one of the most popular bridal choices in India, the scale you want for a reception at a price that does not need a locker afterwards.",
      },
    ],
  },
  {
    slug: "18k-gold-plated-jewellery",
    crumb: "18K Gold Plated",
    h1: "18K Gold Plated Jewellery",
    kicker: "THE GILDED HOUR · 18K GOLD FINISH",
    metaTitle: "18K Gold Plated Jewellery Online, Sealed, Nickel-Free Finish",
    metaDescription:
      "18K gold plated jewellery with a thick, sealed finish over a hypoallergenic nickel-free base. Rings, earrings, bracelets and chains that keep their colour through daily wear in Indian humidity.",
    intro: [
      "Not all gold plating is the same. Thickness, base metal and seal decide whether a piece looks like gold in two years or in two weeks, and almost nobody selling plated jewellery online will tell you which of the three they cut corners on.",
      "Our finish is an 18K gold layer over a hypoallergenic, nickel-free base, sealed with an anti-tarnish coat. It is heavier than the flash-plating used on costume jewellery, which is why our pieces cost more and last considerably longer.",
      "Every piece in The Gilded Hour carries the same finish specification, whether it is a ₹1,500 stud or a full pavé bracelet. Care instructions ship with the box.",
    ],
    bullets: [
      {
        title: "Thick plating, not flash",
        body: "Flash-plating measures in fractions of a micron and wears through at contact points within weeks. Ours is built for daily contact.",
      },
      {
        title: "Hypoallergenic base",
        body: "Nickel-free throughout, so the piece is safe for sensitive skin and freshly pierced ears.",
      },
      {
        title: "Sealed against tarnish",
        body: "A protective coat over the gold that keeps sweat, humidity and perfume off the plating underneath.",
      },
    ],
    faqs: [
      {
        q: "How long does 18K gold plated jewellery last?",
        a: "A thick, sealed plating like ours holds its colour for years of regular wear. Thin flash-plated costume jewellery typically shows wear at contact points within a few weeks.",
      },
      {
        q: "Is 18K gold plated jewellery real gold?",
        a: "The outer layer is real 18K gold bonded to a base metal. It is not solid gold, and it should not be priced or resold as such, but visually and in wear it behaves like gold.",
      },
      {
        q: "Can I wear gold plated jewellery every day?",
        a: "Yes. Put it on last after perfume and lotion, take it off before swimming or the shower, and wipe it with a dry soft cloth after wear.",
      },
      {
        q: "Does gold plated jewellery come with a guarantee?",
        a: "Message the atelier on WhatsApp before ordering and we will confirm the finish warranty that applies to the specific piece you are considering.",
      },
    ],
  },
  {
    slug: "office-wear-jewellery",
    crumb: "Office & Everyday",
    h1: "Office Wear & Everyday Jewellery",
    kicker: "THE GILDED HOUR · EVERYDAY",
    metaTitle: "Office Wear Jewellery, Dainty Gold Pieces for Every Day",
    metaDescription:
      "Dainty, understated jewellery for work: fine chains, small studs, slim bands and thin bracelets in a sealed 18K gold finish. Light enough for a keyboard, finished enough for a meeting.",
    intro: [
      "Work jewellery has one job: to be noticed only after the person wearing it. That means scale before sparkle, a thin band, a small stud, a chain that sits above the collar rather than under it.",
      "These are the Gilded Hour pieces we make for daily rotation. Nothing catches on a sleeve, nothing needs to come off to type, and the anti-tarnish seal means the piece survives the commute, the sanitiser and the air conditioning.",
      "Most clients start here, buy one more, and end up wearing three pieces they never take off. That is the correct outcome.",
    ],
    bullets: [
      {
        title: "Dainty by design",
        body: "Slim profiles and small stones. Weight is deliberately low so pieces disappear on the hand and neck.",
      },
      {
        title: "Stacks cleanly",
        body: "Bands, chains and bracelets are proportioned to layer with each other without crowding.",
      },
      {
        title: "Survives the day",
        body: "Sealed finish, snag-free settings and secure backs, built around a working day, not a photoshoot.",
      },
    ],
    faqs: [
      {
        q: "What jewellery is appropriate for the office?",
        a: "Small studs, a fine chain, one or two slim rings and a thin bracelet. Keep drop earrings short and avoid pieces that make noise when you type.",
      },
      {
        q: "Can I wear this jewellery every day?",
        a: "Yes, these pieces are designed for it. Sealed 18K gold finish, hypoallergenic base and low-profile settings that do not snag on clothing.",
      },
      {
        q: "Is dainty jewellery fragile?",
        a: "Slim is not the same as weak. Our thin bands and chains are solid rather than hollow, so they take daily wear without deforming.",
      },
    ],
  },
];

export const allLandings: CategoryLanding[] = [...categoryLandings, ...extraLandings];

export const categoryBySlug = (slug?: string) =>
  allLandings.find((c) => c.slug === slug);

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
    metaTitle: "Ring Size Guide India, Measure Your Ring Size at Home",
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
          "Cut a strip of paper about 6 mm wide and 10 cm long. Wrap it around the base of the finger you intend to wear the ring on, snug but not tight, you should still be able to slide it off over the knuckle.",
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
    metaTitle: "How to Care for Gold Plated Jewellery, Keep the Finish",
    metaDescription:
      "What actually strips a gold plated finish, how to clean demi-fine jewellery safely, and the storage habit that adds years to an 18K gold finished piece.",
    excerpt:
      "Plating does not simply wear off, it is stripped, usually by perfume, sweat and the wrong cloth. Here is the routine we give every Gilded Hour client.",
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
    metaTitle: "Zirconia vs Diamond, Sparkle, Hardness and Cost Compared",
    metaDescription:
      "An honest comparison of cubic zirconia and diamond: brilliance, fire, hardness, price and how to tell them apart, and when zircone is the smarter buy.",
    excerpt:
      "Zirconia is not a fake diamond, it is a different stone with different optics. Knowing where it wins makes it much easier to buy well.",
    published: "2026-04-18",
    readTime: "6 min read",
    intro:
      "The comparison is usually framed as real versus fake, which is not useful. Cubic zirconia is a genuine lab-grown crystal with its own optical properties, some of which beat diamond outright.",
    sections: [
      {
        h: "Fire versus brilliance",
        p: [
          "Diamond returns more white light, that is brilliance. Zirconia disperses more coloured light, that is fire. A well-cut zirconia throws noticeably more rainbow flash than a diamond of the same size, which is why it photographs so well.",
          "In candlelight or warm indoor lighting, most people cannot separate the two across a room. Under bright daylight at close range, the difference in dispersion becomes visible to a trained eye.",
        ],
      },
      {
        h: "Hardness and daily wear",
        p: [
          "Diamond sits at 10 on the Mohs scale, zirconia at roughly 8.5. Both are far harder than anything in everyday life, but zirconia will accumulate fine surface scratches over years of hard wear where a diamond will not.",
          "The practical consequence is edges. A zirconia's facet junctions soften slightly with age, which is the real reason older costume stones look cloudy, not the stone itself, but the polish.",
        ],
      },
      {
        h: "Cost and what it buys you",
        p: [
          "The price gap is enormous, and it is not the stone alone. A diamond piece has to be built to protect the investment; a zirconia piece can put the budget into the setting, the finish and the design instead.",
          "That is the trade we make at Naira Flore. Hand-set stones, an 18K gold finish, soldered links and a sealed surface, construction quality you would not get at the same price if the stone were carrying the cost.",
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
    metaTitle: "How to Style Indo-Western Outfits, A Practical Guide",
    metaDescription:
      "Silhouette, fabric and jewellery rules for styling Indo-Western outfits for weddings, receptions and work events, from the Naira Flore atelier.",
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
          "If the outfit carries heavy zardosi or thread work, the jewellery should be quiet, a fine chain, small studs, one ring. The embroidery is already doing the work.",
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
        a: "Keep it minimal, a fine chain, small studs and at most one ring. Heavy embroidery and statement jewellery compete, and the outfit loses.",
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
          "The Gilded Hour is made in small numbered batches at our atelier. Every zircone is hand-set and levelled, every chain link soldered, and every surface sealed against tarnish before it is boxed.",
          "Making in small batches means no dead inventory, which is what lets us spend the time on the setting rather than the volume.",
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
  {
    slug: "anti-tarnish-jewellery-guide",
    title: "Anti-Tarnish Jewellery: What It Actually Means",
    metaTitle: "Anti-Tarnish Jewellery, What It Means and How to Check",
    metaDescription:
      "Why plated jewellery tarnishes, what an anti-tarnish seal really does, and the four questions to ask a brand before you buy anti-tarnish jewellery online in India.",
    excerpt:
      "Half the jewellery sold as anti-tarnish in India is flash-plated brass with a marketing line. Here is how the seal actually works and how to test a claim before you pay for it.",
    published: "2026-04-08",
    readTime: "6 min read",
    intro:
      "Tarnish is oxidation. When sweat, humidity or perfume reaches the base metal under a plating, the metal reacts and the piece darkens or turns green. Anti-tarnish jewellery is simply jewellery built so that contact never happens.",
    sections: [
      {
        h: "The three layers that decide everything",
        p: [
          "A plated piece is three things: a base metal, a precious-metal plating, and, on good pieces, a protective seal above the plating. The base decides whether your skin reacts. The plating thickness decides how long the colour survives friction. The seal decides how long moisture stays out.",
          "Cheap costume jewellery skips the seal entirely and flash-plates a brass base at a fraction of a micron. That is why it looks perfect in the box and grey at the contact points three weeks later.",
        ],
      },
      {
        h: "Why Indian humidity is the hard test",
        p: [
          "Humid air carries more moisture and more airborne sulphur, both of which speed oxidation. A finish that holds fine in a dry climate can fail within one monsoon here.",
          "This is the single best reason to buy demi-fine rather than costume jewellery in India: the thicker plating and seal are built for exactly this environment.",
        ],
      },
      {
        h: "Four questions to ask before buying",
        p: [
          "What is the base metal? You want a nickel-free, hypoallergenic alloy or sterling silver, not unspecified brass.",
          "How thick is the plating? Anything described as flash or micron-plated without a number is usually the thinnest option available.",
          "Is there a protective seal above the plating? If the brand cannot answer this, there almost certainly is not one.",
          "Is the piece waterproof-sealed, and to what degree? Incidental contact and swimming are very different asks.",
        ],
      },
      {
        h: "Care that actually extends the finish",
        p: [
          "Put jewellery on last, after perfume, lotion and hairspray, and take it off first at night. Perfume alcohol is the most common finish-killer we see.",
          "Wipe pieces with a dry, soft cloth after wear, not a silver polishing cloth, which is abrasive and will cut through plating.",
          "Store pieces separately in a dry pouch or box. Loose jewellery in a shared bowl scratches its own finish off.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is anti-tarnish jewellery really tarnish-proof?",
        a: "No finish is permanent. Anti-tarnish means the piece is sealed so that oxidation is delayed for years rather than weeks under normal wear.",
      },
      {
        q: "Can I shower with anti-tarnish jewellery?",
        a: "Better not to. Shampoo and soap residue build a film that dulls the surface, and hot water accelerates the breakdown of any seal.",
      },
      {
        q: "How do I clean anti-tarnish jewellery?",
        a: "Warm water, a drop of mild soap, a very soft brush, then dry completely with a lint-free cloth. Never use silver dip, toothpaste or baking soda on plated pieces.",
      },
    ],
  },
  {
    slug: "american-diamond-vs-cubic-zirconia-vs-moissanite",
    title: "American Diamond vs Cubic Zirconia vs Moissanite",
    metaTitle: "American Diamond vs Cubic Zirconia vs Moissanite, Compared",
    metaDescription:
      "American diamond, cubic zirconia, zircon and moissanite explained: hardness, sparkle, price and how each one holds up in daily wear. A plain-language buying comparison.",
    excerpt:
      "American diamond and cubic zirconia are the same stone under two names. Moissanite is not. Here is what actually separates them, and which one to buy for what.",
    published: "2026-04-22",
    readTime: "7 min read",
    intro:
      "Four names get used interchangeably in Indian jewellery listings, and only two of them describe the same material. Sorting them out takes about five minutes and saves a lot of money.",
    sections: [
      {
        h: "American diamond and cubic zirconia are one stone",
        p: [
          "American diamond is the Indian trade name for cubic zirconia, lab-grown zirconium dioxide, colourless, hard, and cut in the brilliant style. Zircone is our house name for the same material.",
          "So a listing offering you an American diamond ring and one offering cubic zirconia are offering the same stone. Judge them on cut quality and setting, not on the label.",
        ],
      },
      {
        h: "Zircon is a different mineral entirely",
        p: [
          "Natural zircon is a mined gemstone with its own chemistry and a slightly softer, more brittle character. It is often confused with cubic zirconia because the names look alike.",
          "If a listing says zircon at cubic-zirconia pricing, it almost certainly means cubic zirconia.",
        ],
      },
      {
        h: "Moissanite: harder, brighter, pricier",
        p: [
          "Moissanite is silicon carbide, roughly 9.25 on the Mohs scale against cubic zirconia's 8 to 8.5, and considerably more expensive. It also throws far more rainbow fire, which some people love and others find obviously non-diamond.",
          "For an engagement ring you intend to wear for decades, moissanite is the more durable choice. For a wardrobe of demi-fine pieces you rotate, cubic zirconia gives you five pieces for the price of one.",
        ],
      },
      {
        h: "What to look for when buying",
        p: [
          "Cut first. A poorly cut stone at any price looks glassy. Facets should be crisp and symmetric, and the stone should sit level in the setting.",
          "Setting second. Prongs beat glue every time, glue yellows, dries out and drops stones.",
          "Finish third. The metal around the stone fails long before the stone does, so a sealed 18K gold finish over a nickel-free base is what determines how the piece ages.",
        ],
      },
    ],
    faqs: [
      {
        q: "Is American diamond the same as cubic zirconia?",
        a: "Yes. American diamond is simply the Indian market name for cubic zirconia, a lab-grown colourless stone cut in the brilliant style.",
      },
      {
        q: "Which is better, moissanite or American diamond?",
        a: "Moissanite is harder and more brilliant, and costs many times more. American diamond gives close-to-diamond looks at demi-fine pricing, which suits pieces you rotate rather than wear for decades.",
      },
      {
        q: "Do cubic zirconia stones scratch?",
        a: "They can over years of hard wear, since they are softer than diamond or moissanite. Storing pieces separately prevents most of it.",
      },
    ],
  },
  {
    slug: "best-demi-fine-jewellery-brands-india",
    title: "How to Judge a Demi-Fine Jewellery Brand in India",
    metaTitle: "Demi-Fine Jewellery Brands India, How to Judge One",
    metaDescription:
      "A buyer's checklist for demi-fine jewellery brands in India: base metal, plating thickness, stone setting, warranty and returns, plus the red flags that mean costume jewellery at demi-fine prices.",
    excerpt:
      "Every brand now calls itself demi-fine. Six checks separate the ones building real jewellery from the ones re-labelling costume stock.",
    published: "2026-05-06",
    readTime: "6 min read",
    intro:
      "Demi-fine has become a marketing word in India. The category is real and worth buying into, but the label alone guarantees nothing, these are the specifics to check before you spend.",
    sections: [
      {
        h: "1. The base metal is stated",
        p: [
          "A serious brand names it: sterling silver, or a hypoallergenic nickel-free alloy. If a listing only says alloy or metal, assume brass.",
        ],
      },
      {
        h: "2. The plating is described in more than adjectives",
        p: [
          "18K gold finished tells you the colour. What you also want is some sense of thickness and, critically, whether there is a protective anti-tarnish seal above the gold.",
        ],
      },
      {
        h: "3. Stones are set, not glued",
        p: [
          "Look closely at product photography. Prongs, bezels and channel settings hold metal around the stone. Glued stones sit in a shallow cup and are the single most common failure point in cheap jewellery.",
        ],
      },
      {
        h: "4. There is a real human to ask",
        p: [
          "Small ateliers answer sizing and finish questions directly. If nobody will tell you the base metal over chat, that is your answer.",
        ],
      },
      {
        h: "5. The returns policy is specific",
        p: [
          "Look for a stated window, and honest language about made-to-order pieces. Custom and made-to-measure work is genuinely non-returnable almost everywhere, a brand that pretends otherwise is not reading its own operations.",
        ],
      },
      {
        h: "6. The pricing makes sense",
        p: [
          "Demi-fine sits well above costume and well below solid gold. A full pavé bracelet at costume pricing is not demi-fine, whatever the listing says.",
        ],
      },
    ],
    faqs: [
      {
        q: "What should demi-fine jewellery cost in India?",
        a: "Typically a few thousand rupees for studs and slim bands, rising for larger pavé work. Considerably more than costume jewellery, and a small fraction of solid gold at similar visual weight.",
      },
      {
        q: "Is demi-fine jewellery a good gift?",
        a: "It is one of the safest gifts in jewellery, it looks substantial, it is not size-critical for earrings and bracelets, and it does not carry the price anxiety of solid gold.",
      },
    ],
  },
  {
    slug: "everyday-dainty-jewellery-styling",
    title: "Styling Dainty Jewellery for Everyday and Office Wear",
    metaTitle: "Dainty Jewellery Styling, Everyday & Office Wear Guide",
    metaDescription:
      "How to stack dainty rings, layer fine chains and choose office-appropriate earrings, with the proportion rules that keep everyday jewellery looking deliberate rather than accidental.",
    excerpt:
      "Three pieces, one focal point, and a rule about chain length. The whole of everyday jewellery styling fits on a postcard.",
    published: "2026-05-20",
    readTime: "5 min read",
    intro:
      "Everyday jewellery fails in one of two directions: too little, so it reads as forgotten, or too much, so it reads as costume. The fix is proportion, not restraint.",
    sections: [
      {
        h: "Pick one focal point",
        p: [
          "Decide whether the hand, the ear or the neck is doing the talking, then keep the other two quiet. A statement ring pairs with small studs and a bare neck; a layered chain set pairs with a plain band.",
        ],
      },
      {
        h: "Layer chains at different lengths",
        p: [
          "Two chains at the same length tangle and read as one thick chain. Separate them by at least 5 cm so each reads on its own.",
          "For collared shirts, keep the shortest chain above the collar line rather than fighting it.",
        ],
      },
      {
        h: "Stack rings with a size hierarchy",
        p: [
          "Three rings maximum across both hands for office wear, and only one with a raised stone. Slim bands stack cleanly on adjacent fingers; a solitaire wants space either side.",
        ],
      },
      {
        h: "Earrings that work in meetings",
        p: [
          "Small studs and short drops that stay above the jawline. Anything that swings will pull focus on video calls and catch on a headset.",
        ],
      },
      {
        h: "Metal mixing is fine, matching finishes is not optional",
        p: [
          "Mixing gold and rhodium works when it looks intentional: repeat each metal at least twice across the outfit. What does not work is one worn-out finish next to a fresh one, which is an argument for buying sealed pieces in the first place.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many pieces of jewellery should I wear to work?",
        a: "Three is a reliable ceiling, for example small studs, one fine chain and a slim ring. Add a thin bracelet only if the sleeves allow it.",
      },
      {
        q: "Can I mix gold and silver jewellery?",
        a: "Yes, provided each metal appears at least twice so the mix looks deliberate. A single odd-metal piece reads as a mistake.",
      },
    ],
  },
];

export const allArticles: JournalArticle[] = [...journal, ...extraJournal];

export const articleBySlug = (slug?: string) =>
  allArticles.find((a) => a.slug === slug);
