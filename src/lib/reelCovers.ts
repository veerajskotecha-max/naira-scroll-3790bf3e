import reelCover1 from "@/assets/reel-cover-1.webp";
import reelCover2 from "@/assets/reel-cover-2.webp";
import reelCoverAnanya from "@/assets/reel-cover-ananya.webp";
import reelCoverSonal from "@/assets/reel-cover-sonal.webp";

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

/* Edits made for the site, keyed by their file name: /admin/reels stores an
   upload as uploads/<time>-<file name>, so the path is not known until then.
   Each is the edit's designed cover, cropped to the 4:5 tile. */
const COVERS_BY_FILE: Record<string, string> = {
  "ananya-where-is-this-from.mp4": reelCoverAnanya,
  "sonal-doing-all-the-work.mp4": reelCoverSonal,
};

export const reelCover = (videoPath?: string | null): string | undefined => {
  if (!videoPath) return undefined;
  if (COVERS[videoPath]) return COVERS[videoPath];
  const file = videoPath.slice(videoPath.lastIndexOf("/") + 1);
  const name = Object.keys(COVERS_BY_FILE).find((known) => file === known || file.endsWith(`-${known}`));
  return name ? COVERS_BY_FILE[name] : undefined;
};
