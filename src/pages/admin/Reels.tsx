import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLiveJewellery } from "@/hooks/useLiveJewellery";
import { fetchReels, type Reel } from "@/hooks/useReels";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";

const AdminReels = () => {
  const { user, loading } = useAuth();
  const { jewellery } = useLiveJewellery();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reels, setReels] = useState<Reel[]>([]);
  const [busy, setBusy] = useState(false);

  const [video, setVideo] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) {
      setIsAdmin(loading ? null : false);
      return;
    }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(Boolean(data)));
  }, [user, loading]);

  const refresh = () => fetchReels().then(setReels).catch(() => undefined);
  useEffect(() => {
    if (isAdmin) void refresh();
  }, [isAdmin]);

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (q ? jewellery.filter((p) => p.name.toLowerCase().includes(q)) : jewellery).slice(0, 12);
  }, [jewellery, search]);

  const upload = async () => {
    if (!video) {
      toast("Choose a video first");
      return;
    }
    setBusy(true);
    try {
      const stamp = Date.now();
      const videoPath = `uploads/${stamp}-${video.name.replace(/[^\w.-]/g, "_")}`;
      const { error: vErr } = await supabase.storage.from("reels").upload(videoPath, video, {
        contentType: video.type || "video/mp4",
        upsert: false,
      });
      if (vErr) throw vErr;

      let posterPath: string | null = null;
      if (poster) {
        posterPath = `uploads/${stamp}-poster-${poster.name.replace(/[^\w.-]/g, "_")}`;
        const { error: pErr } = await supabase.storage.from("reels").upload(posterPath, poster, {
          contentType: poster.type || "image/jpeg",
        });
        if (pErr) throw pErr;
      }

      const { data: reel, error } = await supabase
        .from("reels")
        .insert({
          caption: caption || null,
          video_path: videoPath,
          poster_path: posterPath,
          sort_order: reels.length,
          published: true,
        })
        .select("id")
        .single();
      if (error) throw error;

      if (picked.length) {
        const rows = picked.map((handle, i) => {
          const p = jewellery.find((j) => j.handle === handle)!;
          return {
            reel_id: reel.id,
            handle: p.handle,
            title: p.name,
            price_label: p.priceLabel,
            image_url: p.image,
            variant_id: p.variantId,
            position: i,
          };
        });
        const { error: tagErr } = await supabase.from("reel_products").insert(rows);
        if (tagErr) throw tagErr;
      }

      toast("Reel published");
      setVideo(null);
      setPoster(null);
      setCaption("");
      setPicked([]);
      await refresh();
    } catch (e) {
      toast("Upload failed", { description: e instanceof Error ? e.message : "Try again" });
    } finally {
      setBusy(false);
    }
  };

  const togglePublished = async (reel: Reel) => {
    await supabase.from("reels").update({ published: !reel.published }).eq("id", reel.id);
    await refresh();
  };

  const remove = async (reel: Reel) => {
    await supabase.from("reels").delete().eq("id", reel.id);
    await supabase.storage.from("reels").remove([reel.video_path, reel.poster_path].filter(Boolean) as string[]);
    await refresh();
  };

  if (isAdmin === null) {
    return <div className="pt-[140px] pb-20 text-center text-sm">Checking access…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="pt-[140px] pb-24 text-center">
        <h1 className="font-cormorant text-3xl">Reel studio</h1>
        <p className="mt-3 text-sm" style={{ color: "hsl(0 0% 40%)" }}>
          This page is for Naira Flore admins.{" "}
          <Link to="/auth" className="underline">
            Sign in
          </Link>{" "}
          with an admin account.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageSEO title="Reel Studio | Naira Flore" description="Upload and manage shoppable reels." noindex />
      <div className="mx-auto max-w-[880px] px-6 pt-[130px] pb-20">
        <h1 className="font-cormorant text-[34px]">Reel studio</h1>
        <p className="mb-8 text-sm" style={{ color: "hsl(0 0% 42%)" }}>
          Upload vertical (9:16) clips. Keep files under ~15 MB so product pages stay fast.
        </p>

        <div className="space-y-4 border p-5" style={{ borderColor: "hsl(0 0% 88%)" }}>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Video</label>
            <input type="file" accept="video/mp4,video/quicktime,video/webm" onChange={(e) => setVideo(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Poster image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => setPoster(e.target.files?.[0] ?? null)} />
          </div>
          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Caption</label>
            <input
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full border px-3 py-2 text-sm"
              style={{ borderColor: "hsl(0 0% 82%)" }}
              placeholder="Handcrafted, worn beautifully"
            />
          </div>

          <div>
            <label className="mb-1 block text-[11px] uppercase tracking-[0.12em]">Tag products</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-2 w-full border px-3 py-2 text-sm"
              style={{ borderColor: "hsl(0 0% 82%)" }}
              placeholder="Search the catalogue"
            />
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
              {results.map((p) => {
                const on = picked.includes(p.handle);
                return (
                  <button
                    key={p.handle}
                    type="button"
                    onClick={() =>
                      setPicked((prev) => (on ? prev.filter((h) => h !== p.handle) : [...prev, p.handle]))
                    }
                    className="flex items-center gap-2 border p-2 text-left text-[12px]"
                    style={{ borderColor: on ? "hsl(0 0% 20%)" : "hsl(0 0% 88%)" }}
                  >
                    <img src={p.image} alt="" className="h-10 w-10 object-cover" loading="lazy" />
                    <span className="truncate">{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={upload}
            disabled={busy}
            className="press-scale h-11 px-6 text-[11px] font-medium uppercase tracking-[0.14em] disabled:opacity-60"
            style={{ backgroundColor: "hsl(0 0% 12%)", color: "#fff" }}
          >
            {busy ? "Uploading…" : "Publish reel"}
          </button>
        </div>

        <h2 className="mb-3 mt-10 font-cormorant text-2xl">Published reels</h2>
        <div className="space-y-3">
          {reels.map((reel) => (
            <div key={reel.id} className="flex items-center gap-3 border p-3" style={{ borderColor: "hsl(0 0% 88%)" }}>
              {reel.posterUrl && <img src={reel.posterUrl} alt="" className="h-16 w-10 object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{reel.caption || reel.video_path}</p>
                <p className="text-[11px]" style={{ color: "hsl(0 0% 45%)" }}>
                  {reel.products.length} tagged product(s)
                </p>
              </div>
              <button type="button" onClick={() => togglePublished(reel)} className="text-[11px] underline">
                {reel.published ? "Unpublish" : "Publish"}
              </button>
              <button type="button" onClick={() => remove(reel)} className="text-[11px] underline" style={{ color: "hsl(0 60% 45%)" }}>
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminReels;
