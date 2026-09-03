import type { JewelPiece } from "@/data/jewellery";

/* ───────────────────────────────────────────────────────────────
   PIECE SCALE — the pure arithmetic behind the portal's viewer.
   No React, no DOM: everything here is checked by
   __checks__/viewer.check.ts with `npx tsx`.
   ─────────────────────────────────────────────────────────────── */

export const MM_PER_INCH = 25.4;

/** ISO/IEC 7810 ID-1 — a bank card, the one ruler everybody carries. Held portrait. */
export const CARD_MM = { w: 53.98, h: 85.6 } as const;

/**
 * Nominal CSS pixels per physical inch.
 *
 * CSS pins the reference pixel at 96/in, which only holds for an ordinary
 * desktop monitor. Phones size a CSS pixel off the device-independent pixel
 * instead — Android *defines* dp as 1/160in and iOS points land at 153–163/in
 * — so on a touch device 96 renders everything at roughly 60% of life size.
 *
 * Nothing on the web reports the real screen size, so both numbers are
 * assumptions. `calibration`, which the viewer sets by matching a bank card
 * against the screen, is the only thing that makes the scale actually true.
 */
export const basePxPerInch = (coarsePointer: boolean) => (coarsePointer ? 160 : 96);

export const mmToPx = (mm: number, pxPerInch: number, calibration = 1) =>
  (mm * pxPerInch * calibration) / MM_PER_INCH;

export const CALIBRATION = { min: 0.7, max: 1.4, step: 0.01 } as const;

export const clampCalibration = (value: number) =>
  Number.isFinite(value) ? Math.min(CALIBRATION.max, Math.max(CALIBRATION.min, value)) : 1;

/* ── spin ─────────────────────────────────────────────────────── */

/** Frame index wrapped in both directions: -1 of 5 → 4, 5 of 5 → 0. */
export const wrapFrame = (index: number, count: number) =>
  count > 0 ? ((index % count) + count) % count : 0;

/**
 * Horizontal drag → frame. One stage width of travel is one full turn, so a
 * piece with three frames feels the same to spin as one with five.
 * Dragging left (negative px) turns the piece forwards.
 */
export const frameFromDrag = (startFrame: number, dragPx: number, count: number, stageWidth: number) =>
  wrapFrame(startFrame - Math.round((dragPx / Math.max(stageWidth, 1)) * count), count);

/* ── on me ────────────────────────────────────────────────────── */

/**
 * Only labels that describe the WHOLE piece are trusted. "Stone: 3mm",
 * "Chain: 2mm" and "Length: 40cm" (a chain's run, not its footprint when
 * worn) describe a part, and a part can't be laid out at true size without
 * inventing what fraction of the piece it is. "Width" is excluded for the
 * same reason: in this catalogue it is only ever a chain's gauge.
 */
const EXTENT_LABEL = /\b(Size|Height|Diameter|Dome)\s*:\s*/g;
const NEXT_LABEL = /\s[A-Z][A-Za-z]*(?: [a-z]+){0,2}:\s/;
const MEASURE = /(\d+(?:\.\d+)?)\s*(mm|cm)\b/gi;
const US_RING = /\bUS\s*(\d+(?:\.\d+)?)/i;

/** Smaller than a seed pearl, or wider than a phone: not a footprint we can draw honestly. */
export const MIN_MM = 3;
export const MAX_MM = 70;

/** US ring size → inner diameter in mm. The standard linear rule: US 7 = 17.32mm. */
export const usRingMm = (size: number) => 11.63 + 0.8128 * size;

export type PieceScale = {
  /** Longer stated edge, mm. */
  mm: number;
  /** Shorter stated edge, mm — equal to `mm` when only one was given. */
  heightMm: number;
  /** Short caption, e.g. "20 mm across" or "US 7 · 17.3 mm inside". */
  label: string;
  /** The spec line it came from, shown to the viewer so they can judge it. */
  source: string;
};

type Measured = Pick<JewelPiece, "details" | "description">;

const round1 = (n: number) => Math.round(n * 10) / 10;

/**
 * The piece's real footprint, read out of its own spec lines — or null when
 * the catalogue never states one, in which case "On Me" is not offered for
 * that piece. Nothing here guesses a size.
 */
export const pieceScale = (piece: Measured): PieceScale | null => {
  const text = [...(piece.details ?? []), piece.description ?? ""].join("  ");
  let best: PieceScale | null = null;
  const keep = (found: PieceScale) => {
    if (!best || found.mm > best.mm) best = found;
  };

  for (const label of text.matchAll(EXTENT_LABEL)) {
    const after = text.slice((label.index ?? 0) + label[0].length);
    const end = after.search(NEXT_LABEL);
    const value = after.slice(0, end === -1 ? 90 : Math.min(end, 90)).trim();
    const source = `${label[1]}: ${value}`;

    const mms = [...value.matchAll(MEASURE)]
      .map((m) => Number(m[1]) * (m[2].toLowerCase() === "cm" ? 10 : 1))
      .filter((mm) => mm >= MIN_MM && mm <= MAX_MM)
      .sort((a, b) => b - a);

    if (mms.length) {
      const mm = round1(mms[0]);
      // A second edge only counts if it belongs to the same object — "on 1.5mm
      // wire" trailing a 60mm cuff is the wire's gauge, not the cuff's height.
      const heightMm = mms[1] && mms[1] >= mms[0] * 0.25 ? round1(mms[1]) : mm;
      keep({ mm, heightMm, label: heightMm === mm ? `${mm} mm across` : `${mm} × ${heightMm} mm`, source });
      continue;
    }

    // Rings state a US size instead of millimetres. That maps exactly.
    const us = value.match(US_RING);
    if (us) {
      const mm = round1(usRingMm(Number(us[1])));
      if (mm >= MIN_MM && mm <= MAX_MM) {
        keep({ mm, heightMm: mm, label: `US ${us[1]} · ${mm} mm inside`, source });
      }
    }
  }

  return best;
};

/** Whether the viewer offers "On Me" for this piece. */
export const hasTrueSize = (piece: Measured) => pieceScale(piece) !== null;
