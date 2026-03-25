import { useState } from "react";
import { Star, X, ImagePlus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

interface WriteReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (review: {
    name: string;
    rating: number;
    text: string;
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

  const isValid = rating > 0 && name.trim().length > 0 && text.trim().length > 0;

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-4">
        <div className="w-14 h-14 flex items-center justify-center" style={{ backgroundColor: "hsl(186 35% 28% / 0.1)" }}>
          <Star size={24} style={{ color: "hsl(186 35% 28%)", fill: "hsl(186 35% 28%)" }} />
        </div>
        <p className="font-cormorant text-[20px] font-semibold" style={{ color: "hsl(var(--foreground))" }}>
          Thank you for your review
        </p>
        <p className="text-[13px] font-cormorant" style={{ color: "hsl(var(--muted-foreground))" }}>
          Your feedback helps other customers
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
      onSubmit={(e) => {
        e.preventDefault();
        if (!isValid) return;
        onSubmit({ name: name.trim(), rating, text: text.trim() });
        setSubmitted(true);
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
          className="w-full h-11 px-4 rounded-md border text-[14px] font-cormorant bg-background outline-none transition-colors duration-200 focus:border-primary"
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
          className="w-full px-4 py-3 rounded-md border text-[14px] font-cormorant bg-background outline-none resize-none transition-colors duration-200 focus:border-primary"
          style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
        />
      </div>

      {/* Photo Upload (visual only) */}
      <button
        type="button"
        className="self-start flex items-center gap-2 px-4 py-2 rounded-md border text-[13px] font-cormorant transition-colors duration-200 hover:bg-secondary"
        style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
      >
        <ImagePlus size={15} />
        Add Photo (optional)
      </button>

      {/* Submit */}
      <button
        type="submit"
        disabled={!isValid}
        className="w-full h-[48px] rounded-md text-[13px] font-medium uppercase tracking-[0.1em] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isValid ? "hsl(186 35% 28%)" : "hsl(186 35% 28%)",
          color: "hsl(0 0% 100%)",
        }}
      >
        Submit Review
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
