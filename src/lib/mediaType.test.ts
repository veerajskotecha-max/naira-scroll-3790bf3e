import { describe, expect, it } from "vitest";
import { videoMimeFor, MEDIA_CACHE_SECONDS } from "./mediaType";

describe("videoMimeFor", () => {
  /* This is the bug the helper exists for: both seeded reels are stored as
     application/octet-stream, which iOS Safari will not decode. A picker that
     reports that type must never be allowed to set it. */
  it("overrides octet-stream from a confused file picker", () => {
    expect(videoMimeFor("uploads/clip.mp4", "application/octet-stream")).toBe("video/mp4");
  });

  it("overrides an empty or missing reported type", () => {
    expect(videoMimeFor("uploads/clip.mp4", "")).toBe("video/mp4");
    expect(videoMimeFor("uploads/clip.mp4")).toBe("video/mp4");
    expect(videoMimeFor("uploads/clip.mp4", null)).toBe("video/mp4");
  });

  it("trusts a reported type that really is a video", () => {
    expect(videoMimeFor("uploads/clip.mp4", "video/quicktime")).toBe("video/quicktime");
    expect(videoMimeFor("uploads/clip.webm", "video/webm")).toBe("video/webm");
  });

  it("reads the extension when the reported type is nonsense", () => {
    expect(videoMimeFor("seed/reel-1.mov", "application/vnd.ms-excel")).toBe("video/quicktime");
    expect(videoMimeFor("seed/reel-1.webm", "text/plain")).toBe("video/webm");
  });

  it("falls back to mp4 for an unknown extension rather than octet-stream", () => {
    expect(videoMimeFor("uploads/no-extension")).toBe("video/mp4");
    expect(videoMimeFor("uploads/clip.bin")).toBe("video/mp4");
  });

  /* Storage paths arrive as signed URLs elsewhere in the app; a query string
     must not be read as part of the extension. */
  it("ignores a query string or fragment on the path", () => {
    expect(videoMimeFor("seed/reel-1.mov?token=abc.def")).toBe("video/quicktime");
    expect(videoMimeFor("seed/reel-1.webm#t=2")).toBe("video/webm");
  });

  it("is case-insensitive about the extension", () => {
    expect(videoMimeFor("uploads/CLIP.MOV")).toBe("video/quicktime");
  });

  /* supabase-js takes cacheControl as a string of seconds; a number is
     silently stringified differently across versions. */
  it("hands storage a plain seconds string", () => {
    expect(MEDIA_CACHE_SECONDS).toBe("21600");
  });
});
