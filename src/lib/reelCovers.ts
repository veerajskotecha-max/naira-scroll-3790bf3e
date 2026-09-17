import reelCover1 from "@/assets/reel-cover-1.webp";
import reelCover2 from "@/assets/reel-cover-2.webp";

/*
  Hand-picked cover frames, bundled with the app.

  Two reasons these beat the poster stored beside the video:

  1. The stored poster for reel 1 was the video's opening frame — a mid-sentence
     expression, which is not what the brand should lead with. These are frames
     chosen from the same footage (the packaging shots), cropped above the
     burned-in subtitle so the tile reads clean.
  2. Speed. A stored poster costs a signed-URL round trip before the first byte
     of the image is even requested — measured at ~600ms to sign plus ~900ms to
     fetch on the live site. A bundled cover is hashed, cached by the CDN and
     painted immediately, so the reel tile is never empty.

  Keyed by the reel's stored `video_path`, so a reel without a bundled cover
  simply falls back to its uploaded poster and nothing needs to change here.
*/
const COVERS: Record<string, string> = {
  "seed/reel-1.mp4": reelCover1,
  "seed/reel-2.mp4": reelCover2,
};

export const reelCover = (videoPath?: string | null): string | undefined =>
  videoPath ? COVERS[videoPath] : undefined;
