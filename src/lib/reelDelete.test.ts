import { describe, expect, it, vi } from "vitest";
import { deleteReel, deleteReelPrompt } from "./reelDelete";

const reel = { id: "r1", video_path: "uploads/1700-reel.mp4", poster_path: "uploads/1700-poster.jpg", caption: "Pearl studs" };

/* A stand-in for the Supabase client: the row delete answers `rowResult`,
   storage records what it was asked to remove. */
const clientFor = (rowResult: { error: { message: string } | null; data: Array<{ id: string }> | null }, storageError: { message: string } | null = null) => {
  const calls: string[] = [];
  const select = vi.fn(async () => {
    calls.push("row");
    return rowResult;
  });
  const del = vi.fn(() => ({ eq: () => ({ select }) }));
  const remove = vi.fn(async (paths: string[]) => {
    calls.push(`files:${paths.join(",")}`);
    return { data: null, error: storageError };
  });
  const client = {
    from: vi.fn(() => ({ delete: del })),
    storage: { from: vi.fn(() => ({ remove })) },
  };
  return { client: client as unknown as Parameters<typeof deleteReel>[0], calls, select, remove };
};

describe("deleteReel", () => {
  /* The files used to be removed whatever the row delete returned: a failed
     delete left a published reel whose video was already gone for good. */
  it("keeps the files when the row delete fails", async () => {
    const { client, calls, remove } = clientFor({ error: { message: "canceling statement due to statement timeout" }, data: null });
    await expect(deleteReel(client, reel)).rejects.toThrow("statement timeout");
    expect(remove).not.toHaveBeenCalled();
    expect(calls).toEqual(["row"]);
  });

  it("keeps the files when row-level security deletes nothing", async () => {
    const { client, remove } = clientFor({ error: null, data: [] });
    await expect(deleteReel(client, reel)).rejects.toThrow(/Nothing was deleted/);
    expect(remove).not.toHaveBeenCalled();
  });

  it("removes the video and poster only after the row is gone", async () => {
    const { client, calls, select } = clientFor({ error: null, data: [{ id: "r1" }] });
    await expect(deleteReel(client, reel)).resolves.toEqual({});
    expect(select).toHaveBeenCalledWith("id");
    expect(calls).toEqual(["row", "files:uploads/1700-reel.mp4,uploads/1700-poster.jpg"]);
  });

  it("reports files storage would not remove, without failing the delete", async () => {
    const { client } = clientFor({ error: null, data: [{ id: "r1" }] }, { message: "Object not found" });
    await expect(deleteReel(client, { ...reel, poster_path: null })).resolves.toEqual({ filesError: "Object not found" });
  });

  it("names the reel in the confirmation", () => {
    expect(deleteReelPrompt(reel)).toContain('"Pearl studs"');
    expect(deleteReelPrompt({ ...reel, caption: null })).toContain('"uploads/1700-reel.mp4"');
  });
});
