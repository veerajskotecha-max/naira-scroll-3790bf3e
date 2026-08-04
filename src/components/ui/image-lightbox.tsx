import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowLeft, ArrowRight, X, ZoomIn, ZoomOut } from "lucide-react";

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

interface ImageLightboxProps {
  images: string[];
  /** Piece or product name, used for labels and alt text. */
  name?: string;
  open: boolean;
  initialIndex?: number;
  onOpenChange: (open: boolean) => void;
}

const controlClasses =
  "flex h-11 w-11 items-center justify-center border border-[#1A1614]/15 bg-[#FBF3EC]/90 text-[#1A1614] transition-colors duration-200 hover:bg-[#1A1614] hover:text-[#FBF3EC] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#9A7634]";

/**
 * Full-screen product image viewer for the atelier.
 * Ivory backdrop, ink controls, 2x zoom toggle, arrow-key navigation.
 * Focus trap, Escape and backdrop close are handled by Radix Dialog.
 */
const ImageLightbox = ({ images, name = "Product", open, initialIndex = 0, onOpenChange }: ImageLightboxProps) => {
  const count = images.length;
  const [index, setIndex] = React.useState(initialIndex);
  const [zoomed, setZoomed] = React.useState(false);
  const [origin, setOrigin] = React.useState("50% 50%");

  React.useEffect(() => {
    if (open) {
      setIndex(Math.min(Math.max(initialIndex, 0), Math.max(count - 1, 0)));
      setZoomed(false);
      setOrigin("50% 50%");
    }
  }, [open, initialIndex, count]);

  const step = React.useCallback(
    (delta: number) => {
      if (count < 2) return;
      setZoomed(false);
      setOrigin("50% 50%");
      setIndex((prev) => (prev + delta + count) % count);
    },
    [count]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  const toggleZoomAtPoint = (e: React.MouseEvent<HTMLImageElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setOrigin(`${x.toFixed(1)}% ${y.toFixed(1)}%`);
    setZoomed((z) => !z);
  };

  const toggleZoomButton = () => {
    setOrigin("50% 50%");
    setZoomed((z) => !z);
  };

  if (count === 0) return null;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-[70] bg-[#FBF3EC] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        />
        <DialogPrimitive.Content
          onKeyDown={handleKeyDown}
          aria-describedby={undefined}
          className="fixed inset-0 z-[70] flex flex-col outline-none duration-200 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <DialogPrimitive.Title className="sr-only">{name}, image viewer</DialogPrimitive.Title>

          {/* Top bar */}
          <div className="flex shrink-0 items-start justify-between px-4 pt-4 md:px-8 md:pt-6">
            <div className="min-w-0 pr-4 pt-1.5">
              <p className="truncate text-[10px] uppercase tracking-[0.3em] text-[#9A7634] md:text-[11px]" style={jost}>
                {name}
              </p>
              {count > 1 && (
                <p className="mt-1.5 text-[10px] tracking-[0.24em] text-[#1A1614]/55" style={jost} aria-live="polite">
                  {index + 1} / {count}
                </p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={toggleZoomButton}
                className={controlClasses}
                aria-label={zoomed ? "Zoom out" : "Zoom in to 2x"}
                aria-pressed={zoomed}
              >
                {zoomed ? <ZoomOut size={16} strokeWidth={1.5} /> : <ZoomIn size={16} strokeWidth={1.5} />}
              </button>
              <DialogPrimitive.Close className={controlClasses} aria-label="Close image viewer">
                <X size={16} strokeWidth={1.5} />
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Stage */}
          <div
            className="relative mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden px-4 pb-6 md:px-24 md:pb-10"
            onClick={(e) => {
              if (e.target === e.currentTarget) onOpenChange(false);
            }}
          >
            <img
              key={index}
              src={images[index]}
              alt={`${name}, view ${index + 1} of ${count}`}
              draggable={false}
              onClick={toggleZoomAtPoint}
              className={`max-h-full max-w-full select-none object-contain transition-transform duration-500 ${
                zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              style={{
                transform: zoomed ? "scale(2)" : "scale(1)",
                transformOrigin: origin,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>

          {/* On-screen arrows */}
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                className={`${controlClasses} absolute left-3 top-1/2 z-10 -translate-y-1/2 md:left-6`}
                aria-label="Previous image"
              >
                <ArrowLeft size={16} strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                className={`${controlClasses} absolute right-3 top-1/2 z-10 -translate-y-1/2 md:right-6`}
                aria-label="Next image"
              >
                <ArrowRight size={16} strokeWidth={1.5} />
              </button>
            </>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { ImageLightbox };
export default ImageLightbox;
