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

/* The reveal, on a tap: the box comes round to face the viewer, the drawer
   slides out and the solitaire rises from its cushion, and it stays open until
   the next tap. It used to run on its own every nine seconds, which pulled the
   box back to the front before it could ever finish a turn; the owner asked
   for a full 360 and for the opening to be the shopper's to start. */
export const REVEAL = {
  faceSpeed: 2.8, // rad/s coming round to face the viewer — at most ~1.1 s
  open: 1.1, // s for the drawer to slide out
  close: 1.0, // s for the drawer to slide home
  glintEvery: 4, // s between glints on the stone while the ring is up
  slide: 0.62, // world units the drawer travels
};

/* The solitaire's height in world units, against a 1.6 box. It stood almost
   as tall as the open drawer was deep and the owner asked for it smaller. */
export const RING_SIZE = 0.78;

/* A press that moves less than this and lets go within TAP_MS is a tap, which
   opens or closes the box; anything more is a drag, which spins it. */
export const TAP_PX = 6;
export const TAP_MS = 350;

/* Proportions read off the packaging photography: a square lid and a depth a
   little under half the width. */
export const BOX = { w: 1.6, d: 1.6, h: 0.7, card: 0.03, tray: 0.022 };

export const COLOURS = {
  card: "#D9BAB3",
  cardDeep: "#C9A69E",
  rim: "#E8D2CB",
  velvet: "#141112",
};
