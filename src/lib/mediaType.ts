/* Content types for media we put in Supabase storage.

   Storage serves back whatever content type it was handed at upload, and it is
   handed `file.type` — which the browser fills in from the OS. That is not
   reliable: several Android pickers and some desktop file managers report
   `application/octet-stream` for a perfectly ordinary .mp4. Stored that way,
   the object is served as `application/octet-stream` for ever, and Safari on
   iOS refuses to decode a <video> whose type it cannot recognise. Both seeded
   reels are stored exactly like this today.

   So the extension wins whenever the browser has not given us a real video
   type. Guessing from the extension is the lesser risk: a mislabelled .mp4
   will not play at all, while a correctly labelled one that happens to hold
   another codec fails no worse than it already would. */

const BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

/**
 * The content type a video should be stored under.
 *
 * `reportedType` is trusted only when it actually names a video; anything else
 * — empty, octet-stream, a spreadsheet type from a confused picker — is
 * ignored in favour of the file extension, defaulting to mp4.
 */
export const videoMimeFor = (path: string, reportedType?: string | null): string => {
  const reported = (reportedType ?? "").trim().toLowerCase();
  if (reported.startsWith("video/")) return reported;

  const clean = path.toLowerCase().split(/[?#]/)[0];
  const ext = clean.includes(".") ? clean.slice(clean.lastIndexOf(".") + 1) : "";
  return BY_EXTENSION[ext] ?? "video/mp4";
};

/**
 * Cache lifetime for reel media, in seconds.
 *
 * Matched to the signed-URL TTL in `useReels`. The seeded objects are served
 * `cache-control: no-cache`, so every visit re-downloads several megabytes of
 * video. There is no point caching beyond the life of the URL that addresses
 * it — a fresh signature is a different URL and misses the cache anyway — so
 * this buys the whole browsing session and nothing more, which also means a
 * replaced file can never be served stale for longer than one signing period.
 */
export const MEDIA_CACHE_SECONDS = String(60 * 60 * 6);
