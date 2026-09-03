import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { shopifyImage, shopifySrcSet } from "@/lib/shopifyImage";
import type { JewelPiece } from "@/data/jewellery";
import {
  CALIBRATION,
  CARD_MM,
  basePxPerInch,
  clampCalibration,
  frameFromDrag,
  mmToPx,
  pieceScale,
  wrapFrame,
} from "./pieceScale";

/* ───────────────────────────────────────────────────────────────
   PIECE VIEWER — three ways to look at one piece, phone first.

   Gallery · native scroll-snap, real momentum, tap for the lightbox
   Spin    · drag the gallery images as frames, rAF momentum
   On Me   · the piece's own stated millimetres, drawn at true size

   Motion is transform/opacity only and stops entirely under
   prefers-reduced-motion, where Spin is not offered at all.
   ─────────────────────────────────────────────────────────────── */

const jost = { fontFamily: "'Jost', 'Inter', sans-serif" } as const;
const editorial = { fontFamily: "'Cormorant Garamond', Georgia, serif" } as const;
const display = { fontFamily: "'Velista', 'Cormorant Garamond', Georgia, serif" } as const;

const INK = "#1A1614";
const GOLD = "#B0843A";
const SAGE = "#99B4AF";
const CREAM = "#FBF3EC";

type Mode = "gallery" | "spin" | "onme";

/** Shopify names its files by shot type; that makes for far better alt text than "image 2". */
const VIEW_NAMES: [RegExp, string][] = [
  [/_worn|worn|model|wearing/i, "worn"],
  [/_main|_1[._]/i, "front view"],
  [/_alt|_detail|_close|_macro/i, "close detail"],
  [/_pack|_box|packaging/i, "in its box"],
];

const frameAlt = (piece: JewelPiece, src: string, i: number, count: number) => {
  const named = VIEW_NAMES.find(([re]) => re.test(src))?.[1];
  const what = named ? `${named}` : `view ${i + 1}`;
  const of = count > 1 ? `, ${i + 1} of ${count}` : "";
  return `${piece.name} in ${(piece.materials ?? "").split("·")[0].trim().toLowerCase()} — ${what}${of}`;
};

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const coarsePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;

const CAL_KEY = "nf-truesize-calibration";

const readCalibration = () => {
  try {
    return clampCalibration(Number(window.localStorage.getItem(CAL_KEY)));
  } catch {
    return 1;
  }
};

/* A conservatory needs a little green. Kept to a hairline so the
   photograph is never in competition with the frame around it. */
const Sprig = ({ className, flip = false }: { className?: string; flip?: boolean }) => (
  <svg
    viewBox="0 0 40 40"
    aria-hidden
    className={className}
    style={{ transform: flip ? "scaleX(-1)" : undefined }}
  >
    <path d="M2 38C2 20 12 6 34 2" fill="none" stroke={SAGE} strokeWidth="0.9" />
    <path d="M10 26c4-6 9-6 13-9M8 32c2-8 6-11 10-14M16 20c4-5 9-6 13-8" fill="none" stroke={SAGE} strokeWidth="0.7" />
  </svg>
);

/* The conservatory arch the photograph sits in. Defined at module scope: a
   component declared inside the render would remount the stage — and lose the
   gallery's scroll position — on every state change. */
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="relative overflow-hidden rounded-t-[999px_120px] border border-[#B0843A]/25 bg-white">
    <Sprig className="pointer-events-none absolute -left-1 bottom-2 z-10 h-10 w-10 opacity-50" />
    <Sprig className="pointer-events-none absolute -right-1 bottom-2 z-10 h-10 w-10 opacity-50" flip />
    {children}
  </div>
);

const PieceViewer = ({
  piece,
  className = "",
  initialMode = "gallery",
}: {
  piece: JewelPiece;
  className?: string;
  initialMode?: Mode;
}) => {
  const frames = useMemo(
    () => (piece.gallery?.length ? piece.gallery : [piece.image]).filter(Boolean),
    [piece.gallery, piece.image],
  );
  const count = frames.length;

  const [reduced] = useState(reducedMotion);
  const scale = useMemo(() => pieceScale(piece), [piece]);

  /* Spin is withheld under reduced motion — the brief's fallback is the gallery —
     and On Me only exists for a piece whose own specs state a size. */
  const modes = useMemo<Mode[]>(
    () => ["gallery", ...(reduced || count < 2 ? [] : (["spin"] as Mode[])), ...(scale ? (["onme"] as Mode[]) : [])],
    [reduced, count, scale],
  );
  const [mode, setMode] = useState<Mode>(initialMode);
  useEffect(() => {
    if (!modes.includes(mode)) setMode("gallery");
  }, [modes, mode]);

  const uid = useId();

  /* ── gallery ──────────────────────────────────────────────── */
  const railRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const slideRef = useRef(0);
  const showSlide = (i: number) => {
    slideRef.current = i;
    setSlide(i);
  };
  const [lightbox, setLightbox] = useState<number | null>(null);

  const scrollToSlide = useCallback(
    (index: number) => {
      const rail = railRef.current;
      if (!rail) return;
      const next = Math.min(Math.max(index, 0), count - 1);
      rail.scrollTo({ left: next * rail.clientWidth, behavior: reduced ? "auto" : "smooth" });
      showSlide(next);
    },
    [count, reduced],
  );

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    // Switching tabs unmounts the rail, so put the viewer back where they were.
    if (slideRef.current) rail.scrollLeft = slideRef.current * rail.clientWidth;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        showSlide(Math.round(rail.scrollLeft / Math.max(rail.clientWidth, 1))),
      );
    };
    // Passive: we only read scrollLeft, we never preventDefault.
    rail.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      rail.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [mode]);

  /* ── spin ─────────────────────────────────────────────────── */
  const stageRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);
  const showFrame = (i: number) => {
    frameRef.current = i;
    setFrame(i);
  };
  const [spun, setSpun] = useState(false);
  const drag = useRef({ active: false, startFrame: 0, lastX: 0, pos: 0, vel: 0, at: 0 });
  const raf = useRef(0);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const stageWidth = () => stageRef.current?.clientWidth ?? 320;

  const glide = useCallback(() => {
    cancelAnimationFrame(raf.current);
    const d = drag.current;
    let last = performance.now();
    const step = (now: number) => {
      if (d.active) return;
      const dt = Math.min(now - last, 32);
      last = now;
      d.pos += d.vel * dt;
      d.vel *= 0.94;
      showFrame(frameFromDrag(d.startFrame, d.pos, count, stageWidth()));
      if (Math.abs(d.vel) > 0.02) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  }, [count]);

  const onPointerDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(raf.current);
    const d = drag.current;
    d.active = true;
    d.startFrame = frameRef.current;
    d.lastX = e.clientX;
    d.pos = 0;
    d.vel = 0;
    d.at = performance.now();
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d.active) return;
    const now = performance.now();
    const dx = e.clientX - d.lastX;
    d.lastX = e.clientX;
    d.pos += dx;
    d.vel = dx / Math.max(now - d.at, 1);
    d.at = now;
    if (!spun && Math.abs(d.pos) > 8) setSpun(true);
    // Cheap enough to set straight from the move; React batches it into one paint.
    showFrame(frameFromDrag(d.startFrame, d.pos, count, stageWidth()));
  };

  const onPointerUp = () => {
    const d = drag.current;
    if (!d.active) return;
    d.active = false;
    d.startFrame = frameRef.current;
    d.pos = 0;
    if (Math.abs(d.vel) > 0.05) glide();
  };

  const stepFrame = (delta: number) => {
    setSpun(true);
    cancelAnimationFrame(raf.current);
    showFrame(wrapFrame(frameRef.current + delta, count));
  };

  /* ── on me ────────────────────────────────────────────────── */
  const [ppi] = useState(() => basePxPerInch(coarsePointer()));
  const [calibration, setCalibration] = useState(1);
  useEffect(() => setCalibration(readCalibration()), []);
  const setCal = (value: number) => {
    const next = clampCalibration(value);
    setCalibration(next);
    try {
      window.localStorage.setItem(CAL_KEY, String(next));
    } catch {
      /* private mode — the session keeps it, the device doesn't */
    }
  };
  const px = (mm: number) => mmToPx(mm, ppi, calibration);

  /* ── chrome ───────────────────────────────────────────────── */
  const tabLabel: Record<Mode, string> = { gallery: "Gallery", spin: "Spin", onme: "On Me" };

  return (
    <div className={`pv w-full max-w-full ${className}`} style={{ color: INK }}>
      <style>{`
        .pv-rail{scrollbar-width:none;-ms-overflow-style:none}
        .pv-rail::-webkit-scrollbar{display:none}
        @media (prefers-reduced-motion: reduce){
          .pv *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
        }
      `}</style>

      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        {/* Mode switch — a real tablist: arrow keys, Home/End and roving focus
            come from Radix, so this is keyboard-complete without hand-rolling it. */}
        <TabsList
          aria-label={`How to look at ${piece.name}`}
          className="mb-3 flex h-auto w-full items-stretch justify-start gap-0 rounded-none border-b border-[#1A1614]/10 bg-transparent p-0"
        >
          {modes.map((m) => (
            <TabsTrigger
              key={m}
              value={m}
              className="group relative flex-1 rounded-none bg-transparent px-2 py-3 text-[10px] tracking-[0.3em] text-[#1A1614]/45 transition-[color,opacity] duration-200 data-[state=active]:bg-transparent data-[state=active]:text-[#1A1614] data-[state=active]:shadow-none focus-visible:ring-1 focus-visible:ring-[#B0843A] focus-visible:ring-offset-0"
              style={jost}
            >
              {tabLabel[m].toUpperCase()}
              <span
                aria-hidden
                className="absolute inset-x-0 -bottom-px h-px origin-center scale-x-0 transition-transform duration-200 group-data-[state=active]:scale-x-100"
                style={{ background: GOLD }}
              />
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── GALLERY ─────────────────────────────────────────── */}
        <TabsContent value="gallery" className="mt-0 focus-visible:outline-none">
          <Frame>
            <div
              ref={railRef}
              className="pv-rail flex w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain"
              style={{ touchAction: "pan-x pan-y", WebkitOverflowScrolling: "touch" }}
              role="group"
              aria-roledescription="carousel"
              aria-label={`${piece.name}, ${count} photographs. Use the left and right arrow keys.`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                e.preventDefault();
                scrollToSlide(slide + (e.key === "ArrowRight" ? 1 : -1));
              }}
            >
              {frames.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setLightbox(i)}
                  className="w-full shrink-0 snap-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#B0843A]"
                  aria-label={`Open ${frameAlt(piece, src, i, count)} full screen`}
                >
                  <img
                    src={shopifyImage(src, 900)}
                    srcSet={shopifySrcSet(src, [390, 600, 900, 1200])}
                    sizes="(min-width: 768px) 560px, 100vw"
                    alt={frameAlt(piece, src, i, count)}
                    width={600}
                    height={750}
                    loading={i === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    className="aspect-[4/5] w-full select-none object-cover"
                  />
                </button>
              ))}
            </div>
          </Frame>

          {count > 1 && (
            <div className="mt-3 flex items-center justify-center gap-2">
              {frames.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => scrollToSlide(i)}
                  aria-label={`Show ${frameAlt(piece, src, i, count)}`}
                  aria-current={i === slide}
                  className="flex h-6 w-6 items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B0843A]"
                >
                  <span
                    aria-hidden
                    className="h-px w-4 transition-transform duration-200"
                    style={{ background: i === slide ? GOLD : `${INK}33`, transform: i === slide ? "scaleY(2)" : "scaleY(1)" }}
                  />
                </button>
              ))}
            </div>
          )}
          <p className="sr-only" aria-live="polite">{`Photograph ${slide + 1} of ${count}`}</p>
        </TabsContent>

        {/* ── SPIN ────────────────────────────────────────────── */}
        {modes.includes("spin") && (
          <TabsContent value="spin" className="mt-0 focus-visible:outline-none">
            <Frame>
              <div
                ref={stageRef}
                className="relative aspect-[4/5] w-full select-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-[#B0843A]"
                style={{ touchAction: "pan-y", cursor: "grab" }}
                role="group"
                aria-roledescription="turntable"
                aria-label={`${piece.name}, drag left or right to turn the piece. ${count} angles.`}
                tabIndex={0}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                onPointerCancel={onPointerUp}
                onKeyDown={(e) => {
                  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
                  e.preventDefault();
                  stepFrame(e.key === "ArrowRight" ? 1 : -1);
                }}
              >
                {frames.map((src, i) => (
                  <img
                    key={src}
                    src={shopifyImage(src, 900)}
                    alt={i === frame ? frameAlt(piece, src, i, count) : ""}
                    aria-hidden={i !== frame}
                    draggable={false}
                    decoding="async"
                    className="absolute inset-0 h-full w-full select-none object-cover"
                    style={{ opacity: i === frame ? 1 : 0 }}
                  />
                ))}
                <span
                  className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 px-4 py-2 text-[10px] tracking-[0.28em] transition-opacity duration-300"
                  style={{ ...jost, color: INK, background: "rgba(251,243,236,.9)", opacity: spun ? 0 : 1 }}
                >
                  <span aria-hidden>⟲</span> DRAG TO TURN
                </span>
              </div>
            </Frame>
            <p className="mt-3 text-center text-[10px] tracking-[0.28em] text-[#1A1614]/45" style={jost} aria-live="polite">
              {`ANGLE ${frame + 1} / ${count}`}
            </p>
          </TabsContent>
        )}

        {/* ── ON ME ───────────────────────────────────────────── */}
        {scale && (
          <TabsContent value="onme" className="mt-0 focus-visible:outline-none">
            <Frame>
              {/* Anything drawn at true size can outgrow a 390px screen once the
                  viewer calibrates upwards, so the stage — not the page — scrolls. */}
              <div className="pv-rail w-full overflow-x-auto overscroll-x-contain" style={{ background: CREAM }}>
                <div className="mx-auto flex min-h-[420px] w-max items-center justify-center px-6 py-8">
                  <div
                    className="relative flex items-center justify-center rounded-[10px] border border-dashed border-[#1A1614]/25"
                    style={{ width: px(CARD_MM.w), height: px(CARD_MM.h) }}
                  >
                    <span
                      className="absolute -top-5 left-0 text-[9px] tracking-[0.24em] text-[#1A1614]/40"
                      style={jost}
                    >
                      BANK CARD, ACTUAL SIZE
                    </span>
                    {/* The outline is the measurement; the photograph only says which
                        piece it is. These are styled shots on plinths, so what
                        fraction of the frame the jewellery fills is unknown and is
                        not guessed at.
                        ponytail: no subject crop — if the Shopify CDN ever serves
                        images CORS-open, measure the subject's bounding box on a
                        canvas once and scale the photo to the outline properly. */}
                    <div
                      className="relative overflow-hidden border"
                      style={{
                        width: px(scale.mm),
                        height: px(scale.heightMm),
                        borderRadius: scale.mm === scale.heightMm ? "9999px" : "12%",
                        borderColor: GOLD,
                      }}
                    >
                      <img
                        src={shopifyImage(frames[0], 600)}
                        alt={`${piece.name}, ${scale.label}`}
                        draggable={false}
                        decoding="async"
                        className="h-full w-full select-none object-cover"
                      />
                    </div>
                    <span
                      aria-hidden
                      className="absolute left-1/2 -translate-x-1/2"
                      style={{ top: `calc(50% + ${px(scale.heightMm) / 2 + 10}px)`, width: px(scale.mm), height: 1, background: GOLD }}
                    />
                  </div>
                </div>
              </div>
            </Frame>

            <p className="mt-4 text-center text-[1.05rem] italic leading-[1.5]" style={editorial}>
              {scale.label} — actual size.
            </p>
            <p className="mt-1 text-center text-[11px] leading-[1.6] text-[#1A1614]/55" style={jost}>
              Hold your phone up where you would wear it. The gold outline is the piece&rsquo;s own stated
              measurement <span className="italic" style={editorial}>({scale.source})</span>; the photograph
              inside it is not a measured crop.
            </p>

            <details className="mt-4 border-t border-[#1A1614]/10 pt-3">
              <summary className="cursor-pointer list-none text-center text-[10px] tracking-[0.28em] text-[#8A6A2F]" style={jost}>
                NOT QUITE RIGHT? CALIBRATE
              </summary>
              <div className="mt-3 px-1">
                <label htmlFor={`${uid}-cal`} className="block text-[11px] leading-[1.6] text-[#1A1614]/60" style={jost}>
                  Hold a bank card against the dashed outline and drag until the two match. No browser can
                  read a screen&rsquo;s real size, so this is the only way the millimetres above are exact on
                  your phone.
                </label>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    id={`${uid}-cal`}
                    type="range"
                    min={CALIBRATION.min}
                    max={CALIBRATION.max}
                    step={CALIBRATION.step}
                    value={calibration}
                    onChange={(e) => setCal(Number(e.target.value))}
                    aria-valuetext={`${calibration.toFixed(2)} times`}
                    className="h-6 min-w-0 flex-1 accent-[#B0843A]"
                  />
                  <span className="w-12 shrink-0 text-right text-[11px] tabular-nums text-[#1A1614]/60" style={jost}>
                    ×{calibration.toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCal(1)}
                    className="shrink-0 border-b border-[#B0843A] pb-0.5 text-[10px] tracking-[0.22em] text-[#8A6A2F]"
                    style={jost}
                  >
                    RESET
                  </button>
                </div>
              </div>
            </details>
          </TabsContent>
        )}
      </Tabs>

      <p className="mt-4 text-center text-[0.95rem] italic text-[#1A1614]/60" style={display}>
        {piece.name}
      </p>

      <ImageLightbox
        images={frames.map((src) => shopifyImage(src, 1600))}
        name={piece.name}
        open={lightbox !== null}
        initialIndex={lightbox ?? 0}
        onOpenChange={(open) => setLightbox(open ? lightbox : null)}
      />
    </div>
  );
};

export default PieceViewer;
