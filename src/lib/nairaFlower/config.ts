import { SPIN as BOX_SPIN } from "@/lib/nairaBox/config";

/*
  How the flower that stands as the I in the header wordmark moves. Kept
  apart from the scene so the numbers can be tested without WebGL.

  A slow, steady turn, 30% quicker than the Naira box — one revolution about
  every 27 seconds. It is derived from the box's constant rather than copied,
  so if the box's pace changes the flower keeps the same relation to it.
  History: a rest-and-quick-turn (3 s face-on, 1.6 s turn) was sent back for
  the box's pace; then the owner asked for 30% more speed than that.
*/
export const SPEED_OVER_BOX = 1.3;
export const SPIN = BOX_SPIN * SPEED_OVER_BOX; // rad/s
export const SECONDS_PER_TURN = (Math.PI * 2) / SPIN; // ≈ 27 s

export function turnAngle(seconds: number): number {
  return seconds * SPIN;
}

/* Face-on, exactly as the flat still draws it, so the hand-over from the still
   to the live flower is a cross-fade with nothing jumping. */
export const FRONT = 0;

/* Share of the canvas height the flower fills. The canvas is taller than
   the flower so the bevels are not clipped. */
export const FILL = 0.8;

/* Half the canvas width, in flower heights, measured from the turning axis.
   The low leaf reaches 0.42 from the I's stem, and swings that far out on
   both sides as it turns; any narrower and the canvas edge would cut its tip
   off mid-turn. */
export const HALF_WIDTH = 0.48;

/* Enough thickness that it reads as a cast charm edge-on, not as a card. */
export const DEPTH = 0.07;
export const BEVEL = 0.018;

/* The wordmark's own pink: the flower that stands as the I in NAIRA was
   always blush (--nf-blush, #FFBDA8, sampled from the old logo at #FDBCA9).
   Glazed enamel, not metal: a metal pink tips into rose gold, which is not the
   logo's colour. The base is a shade deeper than the token because lit and
   tone-mapped it lands on it; at the flat token the lit face washed out to
   near-white against the ivory bar. */
export const BLUSH = {
  base: "#F5A58F",
  roughness: 0.5,
};
