import { useEffect, useRef, useState } from "react";
import type { JewelPiece } from "@/data/jewellery";

/* ───────────────────────────────────────────────────────────────
   SPIN STAGE — drag-to-spin jewellery viewer
   A tactile 360°-feel turntable: grab the piece and drag left/right
   to physically spin it. The two real angles (front / three-quarter)
   are mounted on the front & back faces of a 3D card; drag rotates
   the card with momentum, then it settles on the nearest face.
   A tap (drag < 6px) calls onTap (quick-view). Reduced-motion users
   get a simple tap-to-swap crossfade. Touch + mouse + pen via
   pointer events.
   ─────────────────────────────────────────────────────────────── */

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;

type Props = {
  piece: JewelPiece;
  onTap?: () => void;
  className?: string;
  hintColor?: string;   // text color of the DRAG TO SPIN chip
  chipBg?: string;      // bg of the chip
};

const SpinStage = ({ piece, onTap, className = "", hintColor = "#1A1614", chipBg = "rgba(251,243,236,.9)" }: Props) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const rot = useRef(0);          // current rotation deg
  const vel = useRef(0);          // angular velocity
  const dragging = useRef(false);
  const lastX = useRef(0);
  const totalDrag = useRef(0);
  const raf = useRef(0);
  const [spun, setSpun] = useState(false);      // has user interacted
  const [swapped, setSwapped] = useState(false); // reduced-motion fallback
  const reduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const gallery = piece.gallery && piece.gallery.length > 1 ? piece.gallery : [piece.image, piece.image];

  const apply = () => {
    if (stageRef.current) stageRef.current.style.transform = `rotateY(${rot.current}deg)`;
  };

  // inertia loop: apply velocity, decay, then settle to nearest 180°
  const settle = () => {
    cancelAnimationFrame(raf.current);
    const step = () => {
      if (dragging.current) return;
      rot.current += vel.current;
      vel.current *= 0.94;
      if (Math.abs(vel.current) < 0.35) {
        // ease to nearest face
        const target = Math.round(rot.current / 180) * 180;
        const d = target - rot.current;
        if (Math.abs(d) < 0.4) { rot.current = target; apply(); return; }
        rot.current += d * 0.12;
      }
      apply();
      raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onPointerDown = (e: React.PointerEvent) => {
    if (reduced) return;
    dragging.current = true;
    lastX.current = e.clientX;
    totalDrag.current = 0;
    vel.current = 0;
    cancelAnimationFrame(raf.current);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    totalDrag.current += Math.abs(dx);
    rot.current += dx * 0.55;
    vel.current = dx * 0.55;
    if (!spun && totalDrag.current > 8) setSpun(true);
    apply();
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (totalDrag.current < 6) {
      if (reduced) setSwapped((s) => !s);
      onTap?.();
      return;
    }
    settle();
  };

  return (
    <div
      className={`group relative select-none ${className}`}
      style={{ perspective: "1100px", touchAction: "pan-y", cursor: reduced ? "pointer" : "grab" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      role="button"
      aria-label={`${piece.name} — drag to spin, tap for details`}
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onTap?.(); } }}
    >
      {reduced ? (
        <img src={swapped ? gallery[1] : gallery[0]} alt={piece.name} draggable={false} className="h-full w-full object-cover" />
      ) : (
        <div ref={stageRef} className="h-full w-full will-change-transform" style={{ transformStyle: "preserve-3d", transform: "rotateY(0deg)" }}>
          <img src={gallery[0]} alt={piece.name} draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ backfaceVisibility: "hidden" }} />
          <img src={gallery[1]} alt="" aria-hidden draggable={false} className="absolute inset-0 h-full w-full object-cover" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }} />
        </div>
      )}
      {/* drag hint — fades once the user spins */}
      <span
        className="pointer-events-none absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 px-4 py-2 text-[10px] tracking-[0.28em] transition-opacity duration-500"
        style={{ ...jost, color: hintColor, background: chipBg, opacity: spun ? 0 : 1 }}
      >
        <span aria-hidden>⟲</span> DRAG TO SPIN
      </span>
    </div>
  );
};

export default SpinStage;
