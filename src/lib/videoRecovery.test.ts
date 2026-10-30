import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const MIME = { code: 4 };
const NETWORK = { code: 2 };
const DECODE = { code: 3 };

/* A fetch that answers with `type` and counts body reads and aborts. */
const fakeFetch = (type: string, status = 200) => {
  const seen = { calls: 0, bodies: 0, aborted: 0 };
  const impl = vi.fn(async (_src: string, init?: RequestInit) => {
    seen.calls += 1;
    init?.signal?.addEventListener("abort", () => (seen.aborted += 1));
    return {
      ok: status < 400,
      status,
      headers: new Headers({ "content-type": type }),
      blob: async () => {
        seen.bodies += 1;
        return new Blob(["mp4 bytes"]);
      },
    } as unknown as Response;
  });
  return { impl: impl as unknown as typeof fetch, seen };
};

let relabelledVideoUrl: typeof import("./videoRecovery").relabelledVideoUrl;
beforeEach(async () => {
  vi.resetModules(); // each test starts a fresh visit
  ({ relabelledVideoUrl } = await import("./videoRecovery"));
  URL.createObjectURL = vi.fn(() => "blob:relabelled");
});
afterEach(() => vi.restoreAllMocks());

describe("relabelledVideoUrl", () => {
  /* The reels downloaded the whole 3.4 MB file again on ANY video error. */
  it("does nothing for a network or decode error", async () => {
    const { impl, seen } = fakeFetch("application/octet-stream");
    expect(await relabelledVideoUrl("https://x/reel-1.mp4", NETWORK, impl)).toBeNull();
    expect(await relabelledVideoUrl("https://x/reel-1.mp4", DECODE, impl)).toBeNull();
    expect(await relabelledVideoUrl("https://x/reel-1.mp4", null, impl)).toBeNull();
    expect(seen.calls).toBe(0);
  });

  /* Storage now labels both seeded reels video/mp4: relabelling cannot help,
     so the download stops at the headers. */
  it("stops at the headers when storage already says video/*", async () => {
    const { impl, seen } = fakeFetch("video/mp4");
    expect(await relabelledVideoUrl("https://x/reel-1.mp4", MIME, impl)).toBeNull();
    expect(seen).toEqual({ calls: 1, bodies: 0, aborted: 1 });
  });

  it("relabels octet-stream bytes as video/mp4", async () => {
    const { impl, seen } = fakeFetch("application/octet-stream");
    expect(await relabelledVideoUrl("https://x/reel-1.mp4", MIME, impl)).toBe("blob:relabelled");
    expect(seen.bodies).toBe(1);
    const blob = vi.mocked(URL.createObjectURL).mock.calls[0][0] as Blob;
    expect(blob.type).toBe("video/mp4");
  });

  /* Each mounted player (rail, gallery, viewer) used to fetch the file itself. */
  it("fetches each source once per visit, whichever player asks", async () => {
    const { impl, seen } = fakeFetch("application/octet-stream");
    const [a, b] = await Promise.all([
      relabelledVideoUrl("https://x/reel-1.mp4", MIME, impl),
      relabelledVideoUrl("https://x/reel-1.mp4", MIME, impl),
    ]);
    expect(await relabelledVideoUrl("https://x/reel-1.mp4", MIME, impl)).toBe(a);
    expect(b).toBe(a);
    expect(seen.calls).toBe(1);

    await relabelledVideoUrl("https://x/reel-2.mp4", MIME, impl);
    expect(seen.calls).toBe(2);
  });

  it("may try again after a fetch that never connected", async () => {
    const offline = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    }) as unknown as typeof fetch;
    expect(await relabelledVideoUrl("https://x/reel-1.mp4", MIME, offline)).toBeNull();
    const { impl, seen } = fakeFetch("application/octet-stream");
    expect(await relabelledVideoUrl("https://x/reel-1.mp4", MIME, impl)).toBe("blob:relabelled");
    expect(seen.calls).toBe(1);
  });
});
