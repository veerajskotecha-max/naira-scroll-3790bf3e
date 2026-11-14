/*
  Card-size versions (560x700, 4:5) of the customers' own review photos, for
  the product page's review cards. The originals are 90-250 KB each on the
  shop's host and the tile thumbnails are 144px, too small for a 260px card
  at 2x; these are 7-29 KB. Any other URL (a newly approved review's upload)
  comes back unchanged.
*/
import { url as realPastelBoxUrl } from "@/assets/jewellery/real/real-pastel-bracelet-box.jpg.asset.json";
import { url as realPastelWornUrl } from "@/assets/jewellery/real/real-pastel-bracelet-worn.jpg.asset.json";
import { url as realBraceletPackagingUrl } from "@/assets/jewellery/real/real-bracelet-packaging.jpg.asset.json";
import { url as realGoldSetUrl } from "@/assets/jewellery/real/real-gold-set.jpg.asset.json";
import { url as realSolitaireSetUrl } from "@/assets/jewellery/real/real-solitaire-set.jpg.asset.json";
import { url as realHeartbeadUrl } from "@/assets/jewellery/real/real-heartbead-bracelet.jpg.asset.json";
import { url as realPearlPendantUrl } from "@/assets/jewellery/real/real-pearl-pendant.jpg.asset.json";
import realPastelBoxCard from "@/assets/jewellery/review-cards/real-pastel-bracelet-box.webp";
import realPastelWornCard from "@/assets/jewellery/review-cards/real-pastel-bracelet-worn.webp";
import realBraceletPackagingCard from "@/assets/jewellery/review-cards/real-bracelet-packaging.webp";
import realGoldSetCard from "@/assets/jewellery/review-cards/real-gold-set.webp";
import realSolitaireSetCard from "@/assets/jewellery/review-cards/real-solitaire-set.webp";
import realHeartbeadCard from "@/assets/jewellery/review-cards/real-heartbead-bracelet.webp";
import realPearlPendantCard from "@/assets/jewellery/review-cards/real-pearl-pendant.webp";

const CARDS: Record<string, string> = {
  [realPastelBoxUrl]: realPastelBoxCard,
  [realPastelWornUrl]: realPastelWornCard,
  [realBraceletPackagingUrl]: realBraceletPackagingCard,
  [realGoldSetUrl]: realGoldSetCard,
  [realSolitaireSetUrl]: realSolitaireSetCard,
  [realHeartbeadUrl]: realHeartbeadCard,
  [realPearlPendantUrl]: realPearlPendantCard,
};

export const reviewCard = (url: string): string => CARDS[url] ?? url;
