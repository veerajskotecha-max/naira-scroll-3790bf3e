/* The fallback for a reel the browser refuses because of how storage labels it.

   The seeded reels were stored as application/octet-stream, which Safari and
   the Instagram webview will not decode; the same bytes re-served as a
   video/mp4 blob play. The reels fetched the WHOLE file again for that on any
   video error, once per mounted player: 3.4 MB for a network or decode error
   too, and again each time the rail or the gallery mounted the reel, even
   after storage was corrected and relabelling could change nothing.

   Now it runs only for "source not supported" (the code a MIME refusal
   raises), reads the stored type from the response headers and stops the
   download there when it already names a video, and happens once per source
   per visit: every player of that source shares the one result. */

const SRC_NOT_SUPPORTED = 4; // MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED

const results = new Map<string, Promise<string | null>>();

const relabel = async (src: string, fetchImpl: typeof fetch): Promise<string | null> => {
  const ctrl = new AbortController();
  const response = await fetchImpl(src, { signal: ctrl.signal });
  if (!response.ok) {
    ctrl.abort();
    return null;
  }
  if ((response.headers.get("content-type") ?? "").toLowerCase().startsWith("video/")) {
    ctrl.abort(); // labelled correctly: relabelling cannot help, so skip the body
    return null;
  }
  return URL.createObjectURL(new Blob([await response.blob()], { type: "video/mp4" }));
};

/**
 * An object URL holding `src`'s bytes labelled video/mp4, or null when that
 * would not help. The URL lives for the visit; players must not revoke it.
 */
export const relabelledVideoUrl = (
  src: string,
  error: Pick<MediaError, "code"> | null,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> => {
  if (!src || error?.code !== SRC_NOT_SUPPORTED) return Promise.resolve(null);
  let result = results.get(src);
  if (!result) {
    result = relabel(src, fetchImpl).catch(() => {
      results.delete(src); // offline: a later error may try again
      return null;
    });
    results.set(src, result);
  }
  return result;
};
