import { url as jewelUgcVineUrl } from "@/assets/jewellery/ugc/the-vine-ugc.jpg.asset.json";
import { url as jewelUgcBraceletUrl } from "@/assets/jewellery/ugc/jewel-review-bracelet.jpg.asset.json";
import { url as jewelUgcSolitaireUrl } from "@/assets/jewellery/ugc/jewel-review-solitaire.jpg.asset.json";
import { url as jewelUgcToiEtMoiUrl } from "@/assets/jewellery/ugc/jewel-review-toietmoi.jpg.asset.json";
import { url as jewelUgcBowUrl } from "@/assets/jewellery/ugc/jewel-review-bow.jpg.asset.json";
import { url as jewelUgcPearlStudsUrl } from "@/assets/jewellery/ugc/jewel-review-pearl-studs.jpg.asset.json";
import { url as jewelUgcBraidedHoopUrl } from "@/assets/jewellery/ugc/jewel-review-braided-hoop.jpg.asset.json";
import { url as jewelUgcPearPendantUrl } from "@/assets/jewellery/ugc/jewel-review-pear-pendant.jpg.asset.json";
import { url as jewelUgcHaloRingUrl } from "@/assets/jewellery/ugc/jewel-review-halo-ring.jpg.asset.json";
import { url as realPastelBoxUrl } from "@/assets/jewellery/real/real-pastel-bracelet-box.jpg.asset.json";
import { url as realPastelWornUrl } from "@/assets/jewellery/real/real-pastel-bracelet-worn.jpg.asset.json";
import { url as realBraceletPackagingUrl } from "@/assets/jewellery/real/real-bracelet-packaging.jpg.asset.json";
import { url as realGoldSetUrl } from "@/assets/jewellery/real/real-gold-set.jpg.asset.json";
import { url as realSolitaireSetUrl } from "@/assets/jewellery/real/real-solitaire-set.jpg.asset.json";
import { url as realHeartbeadUrl } from "@/assets/jewellery/real/real-heartbead-bracelet.jpg.asset.json";
import { url as realPearlPendantUrl } from "@/assets/jewellery/real/real-pearl-pendant.jpg.asset.json";
import jewelUgcVineThumb from "@/assets/jewellery/review-thumbs/the-vine-ugc.webp";
import jewelUgcBraceletThumb from "@/assets/jewellery/review-thumbs/jewel-review-bracelet.webp";
import jewelUgcSolitaireThumb from "@/assets/jewellery/review-thumbs/jewel-review-solitaire.webp";
import jewelUgcToiEtMoiThumb from "@/assets/jewellery/review-thumbs/jewel-review-toietmoi.webp";
import jewelUgcBowThumb from "@/assets/jewellery/review-thumbs/jewel-review-bow.webp";
import jewelUgcPearlStudsThumb from "@/assets/jewellery/review-thumbs/jewel-review-pearl-studs.webp";
import jewelUgcBraidedHoopThumb from "@/assets/jewellery/review-thumbs/jewel-review-braided-hoop.webp";
import jewelUgcPearPendantThumb from "@/assets/jewellery/review-thumbs/jewel-review-pear-pendant.webp";
import jewelUgcHaloRingThumb from "@/assets/jewellery/review-thumbs/jewel-review-halo-ring.webp";
import realPastelBoxThumb from "@/assets/jewellery/review-thumbs/real-pastel-bracelet-box.webp";
import realPastelWornThumb from "@/assets/jewellery/review-thumbs/real-pastel-bracelet-worn.webp";
import realBraceletPackagingThumb from "@/assets/jewellery/review-thumbs/real-bracelet-packaging.webp";
import realGoldSetThumb from "@/assets/jewellery/review-thumbs/real-gold-set.webp";
import realSolitaireSetThumb from "@/assets/jewellery/review-thumbs/real-solitaire-set.webp";
import realHeartbeadThumb from "@/assets/jewellery/review-thumbs/real-heartbead-bracelet.webp";
import realPearlPendantThumb from "@/assets/jewellery/review-thumbs/real-pearl-pendant.webp";
/* The review photos are shown as 36–48 px tiles, and each is a full-size
   camera JPEG — the four in the summary strip alone were 593 KB. The tiles use
   144 px thumbnails (about 3 KB each); the enlarged view keeps the original. */
const THUMBS: Record<string, string> = {
  [jewelUgcVineUrl]: jewelUgcVineThumb,
  [jewelUgcBraceletUrl]: jewelUgcBraceletThumb,
  [jewelUgcSolitaireUrl]: jewelUgcSolitaireThumb,
  [jewelUgcToiEtMoiUrl]: jewelUgcToiEtMoiThumb,
  [jewelUgcBowUrl]: jewelUgcBowThumb,
  [jewelUgcPearlStudsUrl]: jewelUgcPearlStudsThumb,
  [jewelUgcBraidedHoopUrl]: jewelUgcBraidedHoopThumb,
  [jewelUgcPearPendantUrl]: jewelUgcPearPendantThumb,
  [jewelUgcHaloRingUrl]: jewelUgcHaloRingThumb,
  [realPastelBoxUrl]: realPastelBoxThumb,
  [realPastelWornUrl]: realPastelWornThumb,
  [realBraceletPackagingUrl]: realBraceletPackagingThumb,
  [realGoldSetUrl]: realGoldSetThumb,
  [realSolitaireSetUrl]: realSolitaireSetThumb,
  [realHeartbeadUrl]: realHeartbeadThumb,
  [realPearlPendantUrl]: realPearlPendantThumb,
};

/** The small version of a review photo for tiles; any other URL comes back unchanged. */
export const reviewThumb = (url: string): string => THUMBS[url] ?? url;
