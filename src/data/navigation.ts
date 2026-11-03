import type { JewelCategory } from "@/data/jewellery";

/** Category tiles in the jewellery mega-menu, in merchandising order. They open
    each category's own landing: /jewellery?category=… canonicalises to
    /jewellery, so ~435 links a category sent no weight to the page that ranks
    for it, and none at all from a product page. */
export const menuCategories: Array<{ label: string; category: JewelCategory; to: string }> = [
  { label: "Rings", category: "Rings", to: "/jewellery/collections/rings" },
  { label: "Earrings", category: "Earrings", to: "/jewellery/collections/earrings" },
  { label: "Necklaces", category: "Necklaces", to: "/jewellery/collections/necklaces" },
  { label: "Bracelets", category: "Bracelets", to: "/jewellery/collections/bracelets" },
];

/** The footer's Popular Searches. Each opens the landing for its words: as
    /jewellery?search=… nothing read the term, and all eight showed the same
    unfiltered shop. */
export const popularSearches: Array<{ label: string; to: string }> = [
  { label: "Zircone Rings", to: "/jewellery/collections/rings" },
  { label: "Gold Plated Earrings", to: "/jewellery/collections/earrings" },
  { label: "Huggie Hoops", to: "/jewellery/collections/hoop-earrings" },
  { label: "Tennis Bracelet", to: "/jewellery/collections/bracelets" },
  { label: "Layered Necklace", to: "/jewellery/collections/layered-necklaces" },
  { label: "Anti-Tarnish Jewellery", to: "/jewellery/collections/anti-tarnish-jewellery" },
  { label: "Demi-Fine Jewellery", to: "/jewellery/collections/demi-fine-jewellery" },
  { label: "Gifts for Her", to: "/jewellery/collections/jewellery-gifts" },
  { label: "Made to Measure", to: "/customize" },
  { label: "Handmade Custom Outfits", to: "/customize" },
];

/** Quick edits — sort and filter deep links into the same listing page. */
export const menuEdits: Array<{ label: string; to: string }> = [
  { label: "New Arrivals", to: "/jewellery?sort=newest" },
  { label: "Bestsellers", to: "/jewellery?sort=best" },
  { label: "Under ₹1,500", to: "/jewellery?under=1499.99" },
  { label: "Naira Petite", to: "/jewellery" },
  
];

export const menuOccasions: Array<{ label: string; to: string }> = [
  { label: "Everyday", to: "/jewellery?tag=Everyday" },
  { label: "Festive", to: "/jewellery?tag=Festive" },
  { label: "Wedding", to: "/jewellery?tag=Wedding" },
  { label: "Gifting", to: "/gifting" },
];

/* The site sells two things: demi-fine jewellery, and outfits made to measure.
   Ready-to-wear apparel is not sold, so outfits have one entry in every menu,
   the made-to-measure service, beside Jewellery rather than inside it. */
export const customOutfitsLink = { label: "Custom Outfits", to: "/customize" };
