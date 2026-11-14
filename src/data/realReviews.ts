/*
  The customer reviews the team has as genuine, each with the buyer's own
  photographs (src/assets/jewellery/real). Kept apart from the review wall's
  other text so the product page can show them, and count them beside the
  title, without loading the rest: the wall's other sets (productReviews.ts,
  the curated notes and one-liners) were written for the site, and the
  product page no longer shows them as reviews.
*/
import { url as realPastelBoxUrl } from "@/assets/jewellery/real/real-pastel-bracelet-box.jpg.asset.json";
import { url as realPastelWornUrl } from "@/assets/jewellery/real/real-pastel-bracelet-worn.jpg.asset.json";
import { url as realBraceletPackagingUrl } from "@/assets/jewellery/real/real-bracelet-packaging.jpg.asset.json";
import { url as realGoldSetUrl } from "@/assets/jewellery/real/real-gold-set.jpg.asset.json";
import { url as realSolitaireSetUrl } from "@/assets/jewellery/real/real-solitaire-set.jpg.asset.json";
import { url as realHeartbeadUrl } from "@/assets/jewellery/real/real-heartbead-bracelet.jpg.asset.json";
import { url as realPearlPendantUrl } from "@/assets/jewellery/real/real-pearl-pendant.jpg.asset.json";

export interface Review {
  no?: number;
  /** Keywords used to surface the most relevant real review first on a PDP. */
  match?: string[];
  name: string;
  initials: string;
  verified: boolean;
  rating: number;
  date: string;
  text: string;
  hasPhotos: boolean;
  images: string[];
}

/* Genuine customer reviews with their own photographs. These lead the wall on
   every product page, ahead of the curated and one-line notes. */
export const realReviews: Review[] = [
  {
    name: "Khushi",
    initials: "A",
    verified: true,
    rating: 5,
    date: "September 2, 2026",
    text: "The pastel zircone bracelet is even prettier in person. Every stone is set cleanly and the colours look soft and expensive, not loud. It came in the sweetest pink Naira box and I've worn it stacked with my everyday chain since the day it arrived.",
    hasPhotos: true,
    images: [realPastelBoxUrl, realPastelWornUrl, realBraceletPackagingUrl],
    match: ["bracelet", "pastel", "zircone", "candy", "rainbow"],
  },
  {
    name: "Tanvi Joshi",
    initials: "TJ",
    verified: true,
    rating: 5,
    date: "August 28, 2026",
    text: "Ordered the baguette bracelet with two pairs of hoops and the whole set arrived beautifully packed. The gold tone is warm and rich, the braided hoops are far lighter than they look, and nothing has dulled after weeks of wear.",
    hasPhotos: true,
    images: [realGoldSetUrl],
    match: ["hoop", "huggie", "bracelet", "baguette", "gold"],
  },
  {
    name: "Dipika Tated",
    initials: "DT",
    verified: true,
    rating: 5,
    date: "August 21, 2026",
    text: "Wearing the solitaire pendant with the matching studs almost daily now. The chain is fine and delicate, the stone catches light in every photo, and there's been no skin darkening at all.",
    hasPhotos: true,
    images: [realSolitaireSetUrl],
    match: ["pendant", "solitaire", "necklace", "stud", "chain"],
  },
  {
    name: "Nabby Dsouza",
    initials: "ND",
    verified: true,
    rating: 5,
    date: "August 14, 2026",
    text: "The beaded bracelet with the gold heart charm is my favourite pickup this year. The beads have a lovely weight, the toggle clasp is easy to fasten one-handed, and the heart sits perfectly on the wrist.",
    hasPhotos: true,
    images: [realHeartbeadUrl],
    match: ["heartbead", "heart", "bead", "bracelet", "charm"],
  },
  {
    name: "Sneha Kulkarni",
    initials: "SK",
    verified: true,
    rating: 5,
    date: "August 6, 2026",
    text: "Bought the blush cluster ring for a family lunch and it has not left my finger since. The pink centre stone catches light beautifully, the tiny stones around it are set evenly, and the slim band makes it comfortable enough for all-day wear.",
    hasPhotos: false,
    images: [],
    match: ["blush", "cluster", "ring", "pink", "flower"],
  },
  {
    name: "Ishita Mehta",
    initials: "IM",
    verified: true,
    rating: 5,
    date: "September 5, 2026",
    text: "The pearl drop stud with the little pendant chain has become my everyday pair. It is light enough to forget I am wearing it, the pearl has a soft natural sheen, and the chain sits at exactly the right length with a shirt.",
    hasPhotos: true,
    images: [realPearlPendantUrl],
    match: ["pearl", "stud", "earring", "pendant", "necklace", "chain"],
  },
  {
    name: "Prachi Deshmukh",
    initials: "PD",
    verified: true,
    rating: 5,
    date: "September 7, 2026",
    text: "The blush cluster ring is such a pretty everyday statement. The pink centre stone glows in natural light, the surrounding setting is delicate, and the slim band makes it comfortable to wear all day.",
    hasPhotos: false,
    images: [],
    match: ["blush", "cluster", "ring", "pink", "flower"],
  },
];

export const realPhotos = realReviews.flatMap((r) => r.images);

/* Show the real review whose piece matches the product being viewed first, so
   the photo wall on each page feels specific to that piece. */
export const orderedRealReviews = (productName?: string) => {
  const n = (productName ?? "").toLowerCase();
  if (!n) return realReviews;
  const score = (r: Review) => (r.match ?? []).filter((k) => n.includes(k)).length;
  return [...realReviews].sort((a, b) => score(b) - score(a));
};
