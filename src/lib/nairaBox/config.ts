/*
  How the Naira box moves. Kept apart from the scene so the numbers can be
  tested without a WebGL context and read without loading three.js.

  The turn is the bag's on bluorng.com exactly: 0.003 rad per frame at 60fps,
  one slow revolution about every 35 seconds. A four-second turn was tried and
  the owner asked for Bluorng's slower pace back. Everything else follows the
  bag too — drag to spin with an eased catch-up, a soft contact shadow — plus a
  hover: the box floats and sways a little, as in the levitating packshot.
*/
export const SPIN = 0.003 * 60; // rad/s
export const SECONDS_PER_TURN = (Math.PI * 2) / SPIN; // ≈ 35 s

export const EASE = 0.1; // share of the remaining angle closed each 60fps frame
export const DRAG = 0.012; // rad per px of drag

export const HOVER = {
  lift: 0.07, // world units up and down
  period: 3.2, // seconds per float cycle
  sway: 0.03, // rad of tilt at the top of the float
};

/* The box leans its lid towards the viewer, as in the levitating packshot, so
   the wordmark reads from a lower, more product-like camera. */
export const TILT = 0.16; // rad

/* Resting three-quarter view — used for the still, for anyone with reduced
   motion switched on, and as the angle the box presents the ring from. */
export const FRONT = -0.55;

/* The reveal, on a loop: the box turns, comes round to face the viewer, the
   drawer slides out and the solitaire rises from its cushion, holds, and the
   drawer closes again. The first reveal comes soon after the band scrolls in,
   because most visitors pass the foot of the page in seconds. */
export const REVEAL = {
  firstAfter: 2.5, // s of turning before the first reveal
  every: 9, // s of turning between reveals
  faceSpeed: 1.4, // rad/s while coming round to face the viewer
  open: 1.1, // s for the drawer to slide out
  hold: 2.8, // s with the ring up
  close: 1.0, // s for the drawer to slide home
  slide: 0.62, // world units the drawer travels
};

/* Proportions read off the packaging photography: a square lid and a depth a
   little under half the width. */
export const BOX = { w: 1.6, d: 1.6, h: 0.7, card: 0.03, tray: 0.022 };

export const COLOURS = {
  card: "#D9BAB3",
  cardDeep: "#C9A69E",
  rim: "#E8D2CB",
  velvet: "#141112",
};
