import { useRef, useState } from "react";
import { Star, X, Camera, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const MAX_PHOTOS = 4;
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: {
    name: string;
    rating: number;
    text: string;
    images: string[];
  }) => void;
}


const StarSelector = ({ rating, onChange }: { rating: number; onChange: (r: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          className="p-0.5 transition-transform duration-150 hover:scale-110"
        >
          <Star
            size={24}
            className="transition-colors duration-150"
            style={{
              color: i <= (hovered || rating) ? "hsl(45 93% 47%)" : "hsl(var(--border))",
              fill: i <= (hovered || rating) ? "hsl(45 93% 47%)" : "none",
            }}
          />
        </button>
      ))}
    </div>
  );
};

const ReviewForm = ({ onSubmit, onClose }: { onSubmit: WriteReviewModalProps["onSubmit"]; onClose: () => void }) => {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [photos, setPhotos] = useState<{ file: File; preview: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValid = rating > 0 && name.trim().length > 0 && text.trim().length > 0;

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/") && f.size <= 8 * 1024 * 1024)
      .slice(0, MAX_PHOTOS - photos.length);
    if (picked.length < files.length) {
      toast({
        title: "Some photos were skipped",
        description: `Up to ${MAX_PHOTOS} images, 8MB each.`,
      });
    }
    setPhotos((prev) => [...prev, ...picked.map((file) => ({ file, preview: URL.createObjectURL(file) }))]);
  };

  const uploadPhotos = async () => {
    const urls: string[] = [];
    for (const { file } of photos) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("review-photos").upload(path, file, {
        contentType: file.type,
        upsert: false,
      });
      if (error) throw error;
      const { data, error: signError } = await supabase.storage
        .from("review-photos")
        .createSignedUrl(path, TEN_YEARS);
      if (signError || !data) throw signError ?? new Error("Could not read uploaded photo");
      urls.push(data.signedUrl);
    }
    return urls;
  };


  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-14 h-14 flex items-center justify-center" style={{ backgroundColor: "hsl(186 35% 28% / 0.1)" }}>
          <Star size={18} style={{ color: "hsl(186 35% 28%)", fill: "hsl(186 35% 28%)" }} />
        </div>
        <p className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
          Thank you for your review
        </p>
        <p className="text-[13px] font-cormorant text-center max-w-[300px]" style={{ color: "hsl(var(--muted-foreground))" }}>
          Our team will publish it shortly, once it has been checked.
        </p>

        <button
          onClick={onClose}
          className="mt-2 px-6 py-2.5 text-[13px] font-medium transition-colors duration-200"
          style={{ backgroundColor: "hsl(186 35% 28%)", color: "hsl(0 0% 100%)" }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!isValid || uploading) return;
        setUploading(true);
        try {
          const images = photos.length ? await uploadPhotos() : [];
          onSubmit({ name: name.trim(), rating, text: text.trim(), images });
          setSubmitted(true);
        } catch (err) {
          toast({
            title: "Could not upload your photos",
            description: err instanceof Error ? err.message : "Please try again.",
            variant: "destructive",
          });
        } finally {
          setUploading(false);
        }
      }}
    >

      {/* Star Rating */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] uppercase tracking-[0.1em] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
          Rating
        </label>
        <StarSelector rating={rating} onChange={setRating} />
      </div>

      {/* Name */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] uppercase tracking-[0.1em] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
          Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full h-11 px-4 border text-[14px] font-cormorant bg-background outline-none transition-colors duration-200 focus:border-primary"
          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
        />
      </div>

      {/* Review Text */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] uppercase tracking-[0.1em] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
          Review
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="w-full px-4 py-3 border text-[14px] font-cormorant bg-background outline-none resize-none transition-colors duration-200 focus:border-primary"
          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
        />
      </div>

      {/* Photos */}
      <div className="flex flex-col gap-2">
        <label className="text-[12px] uppercase tracking-[0.1em] font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
          Photos <span className="normal-case tracking-normal">(optional, up to {MAX_PHOTOS})</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={p.preview} className="relative w-[64px] h-[64px] overflow-hidden border" style={{ borderColor: "hsl(var(--border))" }}>
              <img src={p.preview} alt={`Review photo ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setPhotos((prev) => prev.filter((_, idx) => idx !== i))}
                className="absolute top-0 right-0 p-0.5"
                style={{ backgroundColor: "hsla(0,0%,0%,0.55)", color: "hsl(0 0% 100%)" }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-[64px] h-[64px] flex flex-col items-center justify-center gap-1 border border-dashed transition-colors duration-200 hover:border-primary"
              style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
            >
              <Camera size={16} />
              <span className="text-[10px]">Add</span>
            </button>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            addPhotos(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid || uploading}
        className="press-scale w-full h-[48px] flex items-center justify-center gap-2 text-[13px] font-medium uppercase tracking-[0.1em] disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: "hsl(186 35% 28%)",
          color: "hsl(0 0% 100%)",
        }}
      >
        {uploading && <Loader2 size={14} className="animate-spin" />}
        {uploading ? "Submitting…" : "Submit Review"}
      </button>

    </form>
  );
};

const WriteReviewModal = ({ open, onOpenChange, onSubmit }: WriteReviewModalProps) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="px-5 pb-8 pt-2">
          <DrawerHeader className="px-0 pb-4">
            <DrawerTitle className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
              Write a Review
            </DrawerTitle>
          </DrawerHeader>
          <ReviewForm onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[440px] p-6">
        <DialogHeader>
          <DialogTitle className="font-cormorant text-[22px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
            Write a Review
          </DialogTitle>
        </DialogHeader>
        <ReviewForm onSubmit={onSubmit} onClose={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default WriteReviewModal;
