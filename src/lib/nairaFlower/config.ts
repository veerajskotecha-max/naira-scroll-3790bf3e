import { SPIN as BOX_SPIN } from "@/lib/nairaBox/config";

/*
  How the header's flower moves. Kept apart from the scene, as the box's
  numbers are, so they can be tested without WebGL or three.js.

  The owner's brief: the same slow, smooth turn as the Naira box — one
  revolution about every 35 seconds, Bluorng's pace. It is the box's constant,
  not a copy, so the two can never drift apart. The deck asks the same of the
  flower anywhere it moves: "a slow, slow rotation. Never spin fast."
*/
export const SPIN = BOX_SPIN; // rad/s
export const SECONDS_PER_TURN = (Math.PI * 2) / SPIN; // ≈ 35 s

/* A lighter float than the box's: in a 64px bar a bigger lift reads as the
   header twitching rather than the mark hovering. */
export const HOVER = {
  lift: 0.025, // world units; the flower is 1 unit tall
  period: 4, // seconds per float cycle
  sway: 0.035, // rad of tilt at the top of the float
};

/* Face-on, exactly as the flat still draws it, so the hand-over from the still
   to the live flower is a cross-fade with nothing jumping. */
export const FRONT = 0;

/* The camera's frame, shared with the still so both draw the flower at the
   same size: it fills this share of the canvas height. */
export const FILL = 0.76;

/* Enough thickness that it reads as a cast charm edge-on, not as a card. */
export const DEPTH = 0.07;
export const BEVEL = 0.018;

/* 18K-gold-tone metal: the jewellery's own finish and the brand gold
   (--nf-gold, #C99A4C). Metal needs a lighter base than the flat token to land
   on it once the room's reflections are in. Satin rather than mirror: at 0.26
   the flat face mirrored the room, blowing out white face-on and going olive
   at a three-quarter turn. */
export const GOLD = {
  base: "#E0B060",
  roughness: 0.4,
};
