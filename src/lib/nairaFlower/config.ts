/*
  How the flower that stands as the I in the header wordmark moves. Kept
  apart from the scene so the numbers can be tested without WebGL.

  It rests face-on, exactly over the still, then turns once around the I's
  stem and settles again. The owner asked for more movement than the box's
  35 s drift; a steady fast spin never lets the wordmark read, and a flower
  that is always mid-turn is a thin line half the time. Resting face-on for
  most of each cycle keeps NAIRA legible and makes the turn an event. The
  turn is eased at both ends so it never snaps, which is the deck's "never
  spin fast" kept in spirit.
*/
export const REST = 3; // seconds face-on between turns
export const TURN = 1.6; // seconds for one full turn
export const CYCLE = REST + TURN;

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* The flower's angle at a time: 0 while resting, one eased revolution per
   cycle. Whole turns accumulate so the angle never jumps back. */
export function turnAngle(seconds: number): number {
  const n = Math.floor(seconds / CYCLE);
  const phase = seconds - n * CYCLE;
  const turned = phase < REST ? 0 : easeInOut((phase - REST) / TURN);
  return (n + turned) * Math.PI * 2;
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
