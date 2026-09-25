/*
  How the Naira box moves. Kept apart from the scene so the numbers can be
  tested without a WebGL context and read without loading three.js.

  The turn is the owner's brief: about one full revolution every four seconds.
  Everything else follows the bag on bluorng.com — drag to spin with an eased
  catch-up, a soft contact shadow — plus a hover: the box floats and sways a
  little, as in the levitating packshot on the product pages.
*/
export const SECONDS_PER_TURN = 4;
export const SPIN = (Math.PI * 2) / SECONDS_PER_TURN; // rad/s

export const EASE = 0.1; // share of the remaining angle closed each 60fps frame
export const DRAG = 0.012; // rad per px of drag

export const HOVER = {
  lift: 0.07, // world units up and down
  period: 3.2, // seconds per float cycle
  sway: 0.035, // rad of tilt at the top of the float
};

/* Resting three-quarter view, drawer towards the viewer — used when the drawer
   opens and for anyone with reduced motion switched on. */
export const FRONT = -0.35;

/* Proportions read off the packaging photography: a square lid and a depth a
   little under half the width. */
export const BOX = { w: 1.6, d: 1.6, h: 0.7, card: 0.03, tray: 0.022 };

export const COLOURS = {
  card: "#D9BAB3",
  cardDeep: "#C9A69E",
  rim: "#E8D2CB",
  velvet: "#141112",
};
