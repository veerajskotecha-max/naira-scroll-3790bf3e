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
 * Ivory backdrop, ink controls, arrow-key navigation, tap or click to zoom 2x,
 * and pinch to zoom up to 4x with one-finger panning on touch.
 * Focus trap, Escape and backdrop close are handled by Radix Dialog.
 */
const ImageLightbox = ({ images, name = "Product", open, initialIndex = 0, onOpenChange }: ImageLightboxProps) => {
  const count = images.length;
  const [index, setIndex] = React.useState(initialIndex);
  /* One object so a pinch produces one render per frame, not four. */
  const [zoom, setZoom] = React.useState({ scale: 1, x: 0, y: 0, origin: "50% 50%", live: false });
  const gesture = React.useRef<{ dist: number; scale: number; mx: number; my: number } | null>(null);
  const zoomed = zoom.scale > 1;
  const resetZoom = React.useCallback(
    () => setZoom({ scale: 1, x: 0, y: 0, origin: "50% 50%", live: false }),
    [],
  );

  React.useEffect(() => {
    if (open) {
      setIndex(Math.min(Math.max(initialIndex, 0), Math.max(count - 1, 0)));
      resetZoom();
    }
  }, [open, initialIndex, count, resetZoom]);

  const step = React.useCallback(
    (delta: number) => {
      if (count < 2) return;
      resetZoom();
      setIndex((prev) => (prev + delta + count) % count);
    },
    [count, resetZoom]
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
    if (zoomed) return resetZoom();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setZoom({ scale: 2, x: 0, y: 0, origin: `${x.toFixed(1)}% ${y.toFixed(1)}%`, live: false });
  };

  const toggleZoomButton = () => {
    if (zoomed) return resetZoom();
    setZoom({ scale: 2, x: 0, y: 0, origin: "50% 50%", live: false });
  };

  /* Pinch to zoom, and one finger to pan once zoomed.
     `touch-action: none` on the image hands us the gesture, so nothing here
     has to call preventDefault and every listener stays passive. */
  const MAX_SCALE = 4;
  const midpoint = (t: React.TouchList) => ({
    x: (t[0].clientX + (t[1]?.clientX ?? t[0].clientX)) / 2,
    y: (t[0].clientY + (t[1]?.clientY ?? t[0].clientY)) / 2,
  });
  const spread = (t: React.TouchList) =>
    t.length < 2 ? 0 : Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    const t = e.touches;
    const p = midpoint(t);
    gesture.current = { dist: spread(t), scale: zoom.scale, mx: p.x, my: p.y };
    if (t.length === 2 && !zoomed) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((p.x - rect.left) / rect.width) * 100));
      const y = Math.min(100, Math.max(0, ((p.y - rect.top) / rect.height) * 100));
      setZoom((z) => ({ ...z, origin: `${x.toFixed(1)}% ${y.toFixed(1)}%`, live: true }));
    }
  };

  const onTouchMove = (e: React.TouchEvent<HTMLImageElement>) => {
    const g = gesture.current;
    if (!g) return;
    const t = e.touches;
    const pinching = t.length === 2 && g.dist > 0;
    if (!pinching && !(t.length === 1 && zoomed)) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const p = midpoint(t);
    setZoom((z) => {
      const scale = pinching
        ? Math.min(MAX_SCALE, Math.max(1, g.scale * (spread(t) / g.dist)))
        : z.scale;
      // Keep the image within its own overflow, whatever the fingers do.
      const limitX = (rect.width * (scale - 1)) / 2;
      const limitY = (rect.height * (scale - 1)) / 2;
      return {
        ...z,
        scale,
        x: Math.min(limitX, Math.max(-limitX, z.x + (p.x - g.mx))),
        y: Math.min(limitY, Math.max(-limitY, z.y + (p.y - g.my))),
        live: true,
      };
    });
    g.mx = p.x;
    g.my = p.y;
  };

  const onTouchEnd = () => {
    gesture.current = null;
    setZoom((z) => (z.scale <= 1.05 ? { scale: 1, x: 0, y: 0, origin: "50% 50%", live: false } : { ...z, live: false }));
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
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onTouchCancel={onTouchEnd}
              className={`max-h-full max-w-full select-none object-contain transition-transform ${
                zoomed ? "cursor-zoom-out" : "cursor-zoom-in"
              }`}
              style={{
                transform: `translate3d(${zoom.x}px, ${zoom.y}px, 0) scale(${zoom.scale})`,
                transformOrigin: zoom.origin,
                touchAction: "none",
                transitionDuration: zoom.live ? "0ms" : "260ms",
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
