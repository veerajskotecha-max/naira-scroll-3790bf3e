import type { Reel } from "@/hooks/useReels";
import { ReelFrame } from "./ReelShopNext";

/* The reel a piece appears in, as the last slide of its photo gallery: the
   piece moving in real light. Streams only once the slide is swiped to. */
const GalleryReel = ({ reel, active }: { reel: Reel; active: boolean }) => (
  <ReelFrame reel={reel} active={active} canLoad={active} frameClassName="h-full w-full" inGallery />
);

export default GalleryReel;
