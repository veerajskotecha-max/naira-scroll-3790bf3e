import type { JewelCategory } from "@/data/jewellery";

/** Category tiles in the jewellery mega-menu, in merchandising order. */
export const menuCategories: Array<{ label: string; category: JewelCategory; to: string }> = [
  { label: "Rings", category: "Rings", to: "/jewellery?category=Rings" },
  { label: "Earrings", category: "Earrings", to: "/jewellery?category=Earrings" },
  { label: "Necklaces", category: "Necklaces", to: "/jewellery?category=Necklaces" },
  { label: "Bracelets", category: "Bracelets", to: "/jewellery?category=Bracelets" },
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
