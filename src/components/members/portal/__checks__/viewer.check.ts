/**
 * Checks for the pure logic behind the Inner Circle piece viewer.
 * No framework, no browser:
 *
 *   npx tsx src/components/members/portal/__checks__/viewer.check.ts
 */
import assert from "node:assert/strict";
import { jewellery } from "@/data/jewellery";
import {
  CARD_MM,
  MAX_MM,
  basePxPerInch,
  clampCalibration,
  frameFromDrag,
  hasTrueSize,
  mmToPx,
  pieceScale,
  usRingMm,
  wrapFrame,
} from "../pieceScale";

/** Floating point: 96/25.4*25.4 is 95.99999999999999. */
const close = (actual: number, expected: number, why: string, epsilon = 0.01) =>
  assert.ok(Math.abs(actual - expected) < epsilon, `${why} — got ${actual}, wanted ${expected}`);

const byName = (name: string) => {
  const piece = jewellery.find((p) => p.name === name);
  assert.ok(piece, `catalogue is missing "${name}" — update this check`);
  return piece;
};

/* ── 1. frame index wraps in both directions ──────────────────── */

assert.equal(wrapFrame(0, 5), 0);
assert.equal(wrapFrame(4, 5), 4);
assert.equal(wrapFrame(5, 5), 0, "past the last frame wraps to the first");
assert.equal(wrapFrame(-1, 5), 4, "before the first frame wraps to the last");
assert.equal(wrapFrame(-7, 5), 3, "wraps however many turns back");
assert.equal(wrapFrame(12, 5), 2);
assert.equal(wrapFrame(3, 0), 0, "a piece with no frames never indexes out of bounds");

/* A spin: 300px stage, 4 frames, so 75px of drag is one frame.
   Dragging left turns the piece forwards. */
const STAGE = 300;
assert.equal(frameFromDrag(0, -75, 4, STAGE), 1);
assert.equal(frameFromDrag(0, -150, 4, STAGE), 2);
assert.equal(frameFromDrag(0, -300, 4, STAGE), 0, "a full stage width is one whole turn");
assert.equal(frameFromDrag(0, -375, 4, STAGE), 1, "and keeps going past the end");
assert.equal(frameFromDrag(0, 75, 4, STAGE), 3, "dragging back off the start wraps to the last frame");
assert.equal(frameFromDrag(0, 225, 4, STAGE), 1);
assert.equal(frameFromDrag(2, -900, 4, STAGE), 2, "three whole turns lands where it started");
assert.equal(frameFromDrag(3, -75, 4, STAGE), 0, "wraps from a non-zero start frame too");
assert.equal(frameFromDrag(0, -1000, 4, 0), 0, "a stage that has not been measured yet cannot divide by zero");

/* ── 2. millimetres → pixels ──────────────────────────────────── */

close(mmToPx(25.4, 96), 96, "one inch at the CSS reference pixel");
close(mmToPx(25.4, 160), 160, "one inch at a phone's device-independent pixel");
assert.equal(mmToPx(0, 96), 0);
close(mmToPx(10, 160), 62.99, "10mm on a phone");
close(mmToPx(10, 160, 1.2), 75.59, "calibration scales linearly");
close(mmToPx(20, 160, 0.5), mmToPx(10, 160), "half the calibration, half the pixels");

assert.equal(basePxPerInch(true), 160, "touch device");
assert.equal(basePxPerInch(false), 96, "desktop");

assert.equal(clampCalibration(1), 1);
assert.equal(clampCalibration(99), 1.4);
assert.equal(clampCalibration(0), 0.7);
assert.equal(clampCalibration(Number.NaN), 1, "an unreadable stored value falls back to nominal");

/* A bank card drawn at true size has to fit a 390px phone with its padding,
   or the On Me stage starts sideways. */
assert.ok(mmToPx(CARD_MM.w, 160) < 390 - 32, "reference card fits a 390px viewport at calibration 1");

close(usRingMm(7), 17.32, "US 7 is 17.32mm inside");
close(usRingMm(6), 16.51, "US 6");

/* ── 3. when "On Me" is offered at all ────────────────────────── */

// Stated in millimetres, as the whole piece's size.
assert.deepEqual(pieceScale(byName("Baguette Arc Hoops")), {
  mm: 20,
  heightMm: 20,
  label: "20 mm across",
  source: "Size: Approximately 20mm across",
});

// Two edges, and a wire gauge in the same line that is not one of them.
const cuff = pieceScale(byName("Baroque Bloom Cuff"));
assert.deepEqual([cuff?.mm, cuff?.heightMm], [60, 55], "6cm by 5.5cm — the 1.5mm wire is not an edge");

// A ring states a US size instead; that converts exactly.
assert.equal(pieceScale(byName("Cushion Halo Ring"))?.mm, 17.3);

// Read out of the description when the piece has no details list.
assert.equal(pieceScale(byName("Verdant Circlet Studs"))?.mm, 20);

// Nothing about the whole piece is stated → the mode is withheld, not guessed.
assert.equal(pieceScale(byName("Rivière Eternal Necklace")), null, "a 40cm chain is a length, not a footprint");
assert.equal(pieceScale(byName("Pearl Drop Studs")), null, "the pearl's size is not the piece's size");
assert.equal(pieceScale(byName("Toggle Link Chain")), null, "a chain's 4mm width is its gauge, not its size");
assert.equal(pieceScale({}), null, "no specs at all");
assert.equal(pieceScale({ details: ["Length: 40cm", "Stone: 3mm each"] }), null);
assert.equal(pieceScale({ details: ["Size: Multiple sizes available, confirmed at order"] }), null);
assert.equal(pieceScale({ details: ["Size: Approximately 900mm across"] }), null, "beyond MAX_MM is not drawable");

// The rule the component branches on, and the bounds the layout relies on.
let offered = 0;
for (const piece of jewellery) {
  const scale = pieceScale(piece);
  assert.equal(hasTrueSize(piece), scale !== null, `${piece.name}: rule disagrees with the reading`);
  if (!scale) continue;
  offered++;
  assert.ok(scale.mm >= scale.heightMm, `${piece.name}: mm is the longer edge`);
  assert.ok(scale.mm <= MAX_MM && scale.heightMm > 0, `${piece.name}: ${scale.mm}mm out of bounds`);
  assert.ok(scale.source.length > 0 && scale.label.length > 0, `${piece.name}: nothing to show the viewer`);
}
assert.ok(offered > 0 && offered < jewellery.length, "some pieces state a size and some do not");

console.log(`ok — spin wrapping, mm→px and the On Me rule (${offered}/${jewellery.length} pieces state a size)`);
