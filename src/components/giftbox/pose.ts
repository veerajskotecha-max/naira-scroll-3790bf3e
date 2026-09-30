import { BOX } from "@/lib/nairaBox/config";

/* How the CSS Naira box (NairaBoxCSS.tsx) is held and how its drawer sits,
   shared with the add-to-bag moment that animates it. */

export type BoxPose = { tilt: number; turn: number };

/* Three-quarter view from a little above, like the packshot: the pose the box
   keeps at rest, and the angle the bag's box turns at. */
export const REST_POSE: BoxPose = { tilt: -22, turn: -14 };

export const poseTransform = ({ tilt, turn }: BoxPose) => `rotateX(${tilt}deg) rotateY(${turn}deg)`;

export const boxGeometry = (size: number) => {
  const W = size;
  const D = size * (BOX.d / BOX.w);
  const H = Math.round(size * (BOX.h / BOX.w));
  return { W, D, H, travel: D * 0.5 };
};

/* The drawer's moving parts, open 0 (shut) to 1: the front panel, and what
   shows through the fixed windows over the part pulled out of the sleeve
   (the velvet tray on top, the two sides), each sliding back under the
   sleeve's edge as the drawer closes. */
export const drawerTransforms = (size: number, open: number) => {
  const { D, travel } = boxGeometry(size);
  const home = (1 - open) * travel;
  return {
    front: `translateZ(${D / 2 + open * travel}px)`,
    tray: `translateY(${-home}px)`,
    right: `translateX(${home}px)`,
    left: `translateX(${-home}px)`,
  };
};
