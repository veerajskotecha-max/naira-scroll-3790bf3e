import type { supabase } from "@/integrations/supabase/client";
import type { Reel } from "@/hooks/useReels";

/* Deleting a reel removes its row, then its video and poster from storage.

   The files go ONLY once the row is gone. Both calls used to run back to back
   without a look at the first one's result (supabase-js returns errors, it
   does not throw), so a delete that failed — a timeout, a 500, a dropped
   connection — left the reel published on the site with its video and poster
   already destroyed, and we hold no other copy of either.

   A delete that row-level security refuses is not an error either: it simply
   matches no rows. So the delete returns the rows it removed (admins can read
   every reel), and no row back means nothing was deleted. */

type Client = Pick<typeof supabase, "from" | "storage">;

export interface ReelDeleteResult {
  /** Set when the row went but storage would not remove the files. */
  filesError?: string;
}

export const deleteReel = async (
  client: Client,
  reel: Pick<Reel, "id" | "video_path" | "poster_path">,
): Promise<ReelDeleteResult> => {
  const { data, error } = await client.from("reels").delete().eq("id", reel.id).select("id");
  if (error) throw new Error(error.message);
  if (!data?.length) throw new Error("Nothing was deleted. Is this account still an admin?");

  const paths = [reel.video_path, reel.poster_path].filter(Boolean) as string[];
  const { error: filesError } = await client.storage.from("reels").remove(paths);
  return filesError ? { filesError: filesError.message } : {};
};

/** The question asked before a delete: it cannot be undone. */
export const deleteReelPrompt = (reel: Pick<Reel, "caption" | "video_path">) =>
  `Delete "${reel.caption || reel.video_path}"? Its video and poster are removed for good; there is no other copy.`;
