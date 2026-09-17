import { afterEach, describe, expect, it, vi } from "vitest";

/* A thenable that mimics the PostgREST builder: .select().eq().order() and
   finally awaits to { data, error }. */
const rowsBuilder = (result: unknown) => {
  const builder: Record<string, unknown> = {};
  for (const method of ["select", "eq", "order"]) builder[method] = () => builder;
  builder.then = (resolve: (v: unknown) => unknown) => Promise.resolve(result).then(resolve);
  return builder;
};

const ROWS = [
  {
    id: "r1",
    title: "Naira Flore",
    caption: null,
    video_path: "seed/reel-1.mp4",
    poster_path: "seed/reel-1-poster.jpg",
    sort_order: 0,
    published: true,
    reel_products: [
      { id: "p1", handle: "cushion-halo-ring", title: "Cushion Halo Ring", price_label: "₹1,199", image_url: "https://x/a.jpg", variant_id: "1", position: 0 },
    ],
  },
];

const mockSupabase = (createSignedUrls: () => Promise<unknown>) => {
  vi.doMock("@/integrations/supabase/client", () => ({
    supabase: {
      from: () => rowsBuilder({ data: ROWS, error: null }),
      storage: { from: () => ({ createSignedUrls }) },
    },
  }));
};

afterEach(() => {
  vi.resetModules();
  vi.useRealTimers();
  vi.clearAllMocks();
});

/**
 * The reel section went permanently blank in the Instagram browser. The cause
 * was not the video: `createSignedUrls` has no timeout, so a request that hung
 * left the whole fetch pending, React Query stuck on isLoading, and the
 * placeholder on screen with no error to retry from — for the rest of the
 * visit, however long the shopper waited.
 */
describe("fetchReels when storage signing misbehaves", () => {
  it("still resolves when signing never settles", async () => {
    vi.useFakeTimers();
    mockSupabase(() => new Promise(() => {})); // hangs for ever
    const { fetchReels } = await import("./useReels");

    const pending = fetchReels();
    await vi.advanceTimersByTimeAsync(9000); // past the signing deadline
    const reels = await pending;

    expect(reels).toHaveLength(1);
    // The video cannot play unsigned, but the reel and its products survive —
    // which is the whole point: a cover and a shoppable tile beat a blank rail.
    expect(reels[0].videoUrl).toBe("");
    expect(reels[0].products).toHaveLength(1);
  });

  it("still resolves when signing rejects", async () => {
    mockSupabase(() => Promise.reject(new Error("network")));
    const { fetchReels } = await import("./useReels");

    const reels = await fetchReels();
    expect(reels).toHaveLength(1);
    expect(reels[0].products[0].handle).toBe("cushion-halo-ring");
  });

  it("uses the signed urls when signing works", async () => {
    mockSupabase(() =>
      Promise.resolve({
        data: [
          { path: "seed/reel-1.mp4", signedUrl: "https://signed/video" },
          { path: "seed/reel-1-poster.jpg", signedUrl: "https://signed/poster" },
        ],
      }),
    );
    const { fetchReels } = await import("./useReels");

    const reels = await fetchReels();
    expect(reels[0].videoUrl).toBe("https://signed/video");
    expect(reels[0].posterUrl).toBe("https://signed/poster");
  });
});
