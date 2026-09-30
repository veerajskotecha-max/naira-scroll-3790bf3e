import type { CSSProperties, Ref } from "react";
import { COLOURS } from "@/lib/nairaBox/config";
import { boxGeometry, drawerTransforms, poseTransform, REST_POSE, type BoxPose } from "./pose";

/*
  The Naira gift box in CSS 3D — faces are divs, the browser's compositor does
  the perspective and the motion. No three.js, no WebGL context, no canvas: a
  few hundred bytes of markup that draws at any size, from the 22px mark to
  the box turning in the bag, and costs nothing to animate (only transform and
  opacity ever change).

  Proportions and colours are the 3D showcase box's own (src/lib/nairaBox):
  a square lid, a height a little under half its width, the pink card with
  its paler rim, a drawer that slides out of the sleeve onto dark velvet.

  It is always one convex box, every face turned outward and hidden from
  behind, so there is only one right way to draw it. Safari orders 3D faces
  more simply than Chrome, and a face inside another (a drawer floor under
  the lid) can show through there. So the open drawer is the same box made
  longer: the part out of the sleeve is drawn through fixed windows (the
  velvet tray on top, the two sides) whose contents slide back under the
  sleeve's edge as the drawer closes, while the front panel moves in.

  Geometry: x right, y down, z towards the viewer; the drawer pulls out
  along +z. The camera is always above, so the base of the pulled-out part is
  never drawn.
*/

type Parts = {
  /** Holds the box in the air: move it to float (the shadow stays down). */
  lift?: Ref<HTMLDivElement>;
  shadow?: Ref<HTMLDivElement>;
  box?: Ref<HTMLDivElement>;
  gleam?: Ref<HTMLDivElement>;
  /** The ring, sunk in its slot until it is raised (translateY 100% → 0). */
  ring?: Ref<HTMLDivElement>;
  glint?: Ref<HTMLDivElement>;
  front?: Ref<HTMLDivElement>;
  tray?: Ref<HTMLDivElement>;
  left?: Ref<HTMLDivElement>;
  right?: Ref<HTMLDivElement>;
};

type Props = {
  /** Lid width in px. */
  size: number;
  pose?: BoxPose;
  /** How far the drawer is out, 0 (shut) to 1. */
  open?: number;
  /** Draw the drawer's windows even while it is shut, so it can be animated open. */
  withDrawer?: boolean;
  /** Lid wordmark (a transparent image). Left off at very small sizes. */
  print?: string;
  /** A ring cut-out standing in the cushion's slot, hidden until raised. */
  ring?: string;
  /** The pose the ring is turned to face (it is flat, like the 3D box's sprite). */
  ringFacing?: BoxPose;
  parts?: Parts;
  className?: string;
  style?: CSSProperties;
  shadow?: boolean;
};

const face = (w: number, h: number, W: number, H: number, transform: string, style: CSSProperties = {}): CSSProperties => ({
  position: "absolute",
  boxSizing: "border-box",
  width: w,
  height: h,
  left: (W - w) / 2,
  top: (H - h) / 2,
  transform,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  ...style,
});

const fill: CSSProperties = { position: "absolute", inset: 0 };

/* A four-point glint, as a stone catches the light. */
const GLINT =
  "radial-gradient(circle, rgb(255 255 255) 0 7%, rgb(255 255 255 / 0) 32%), " +
  "linear-gradient(90deg, transparent 47%, rgb(255 255 255 / 0.95) 50%, transparent 53%), " +
  "linear-gradient(0deg, transparent 47%, rgb(255 255 255 / 0.95) 50%, transparent 53%)";
const GLINT_FADE = "radial-gradient(circle, #000 0 22%, transparent 68%)";

const RING_ASPECT = 172 / 132; // the cut-out's height to width; the band's foot is its bottom edge
const SLOT = 0.56; // how far along the pulled-out part the cushion's slot is

const NairaBoxCSS = ({ size, pose = REST_POSE, open = 0, withDrawer = false, print, ring, ringFacing = pose, parts = {}, className = "", style, shadow = true }: Props) => {
  const { W, D, H, travel: E } = boxGeometry(size);
  const rim = `${Math.max(1, size * 0.012)}px solid ${COLOURS.rim}`;
  const wall = Math.max(1.5, size * 0.03); // the drawer's walls, seen from above
  const drawer = drawerTransforms(size, open);
  const pulledOut = `translateZ(${D / 2 + E / 2}px)`; // the middle of the part out of the sleeve
  const ringW = W * 0.48;
  const ringH = ringW * RING_ASPECT;

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ width: W, height: H + size * 0.36, perspective: size * 5.1, perspectiveOrigin: "50% 28%", ...style }}
      aria-hidden="true"
    >
      {shadow && (
        <div className="pointer-events-none absolute" style={{ top: H + size * 0.2, left: -W * 0.125, width: W * 1.25, height: size * 0.2 }}>
          <div
            ref={parts.shadow}
            style={{
              ...fill,
              background: "radial-gradient(ellipse at center, rgb(26 22 20 / 0.24), rgb(26 22 20 / 0) 70%)",
              filter: `blur(${Math.max(1, size * 0.03)}px)`,
            }}
          />
        </div>
      )}
      <div ref={parts.lift} className="absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
        <div
          ref={parts.box}
          className="absolute left-0"
          style={{ top: size * 0.12, width: W, height: H, transformStyle: "preserve-3d", transform: poseTransform(pose) }}
        >
          {/* Sleeve: lid, base, sides, back; open at the front. */}
          <div
            style={face(W, D, W, H, `rotateX(90deg) translateZ(${H / 2}px)`, {
              background: "linear-gradient(140deg, #F2DED8 0%, #E6CCC5 55%, #DDBFB8 100%)",
              overflow: "hidden",
              border: rim,
            })}
          >
            {print && (
              <img src={print} alt="" draggable={false} style={{ position: "absolute", left: "19%", width: "62%", top: "34%", opacity: 0.86 }} />
            )}
            <div
              ref={parts.gleam}
              style={{
                position: "absolute",
                inset: "-20% 0",
                width: "45%",
                background: "linear-gradient(90deg, rgb(255 255 255 / 0), rgb(255 250 244 / 0.62), rgb(255 255 255 / 0))",
                transform: "translateX(-160%) skewX(-18deg)",
              }}
            />
          </div>
          <div style={face(W, D, W, H, `rotateX(-90deg) translateZ(${H / 2}px)`, { background: COLOURS.cardDeep })} />
          <div
            style={face(D, H, W, H, `rotateY(90deg) translateZ(${W / 2}px)`, {
              background: "linear-gradient(180deg, #C8A69F, #B9968F)",
              borderTop: rim,
              borderLeft: rim,
            })}
          />
          <div
            style={face(D, H, W, H, `rotateY(-90deg) translateZ(${W / 2}px)`, {
              background: "linear-gradient(180deg, #D8B8B1, #CBA9A2)",
              borderTop: rim,
              borderRight: rim,
            })}
          />
          <div style={face(W, H, W, H, `rotateY(180deg) translateZ(${D / 2}px)`, { background: COLOURS.cardDeep })} />

          {/* The pulled-out part of the drawer, through its three windows. */}
          {(open > 0 || withDrawer) && (
            <>
              <div style={face(W, E, W, H, `${pulledOut} rotateX(90deg) translateZ(${H / 2}px)`, { overflow: "hidden" })}>
                <div ref={parts.tray} style={{ ...fill, transform: drawer.tray, background: COLOURS.rim }}>
                  <div
                    style={{
                      position: "absolute",
                      left: wall,
                      right: wall,
                      top: 0,
                      bottom: wall,
                      background: `radial-gradient(ellipse at 50% 58%, #2E2527 0%, ${COLOURS.velvet} 70%)`,
                      boxShadow: `inset ${wall * 0.8}px 0 ${wall}px -${wall * 0.4}px rgb(201 166 158 / 0.28), inset 0 -${wall * 0.8}px ${wall}px -${wall * 0.4}px rgb(201 166 158 / 0.22)`,
                    }}
                  >
                    {/* the sleeve's edge shades the velvet it covers */}
                    <div style={{ ...fill, background: "linear-gradient(180deg, rgb(0 0 0 / 0.6), rgb(0 0 0 / 0) 32%)" }} />
                    {/* the ring cushion, with its slot */}
                    <div
                      style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        top: `${(SLOT - 0.18) * 100}%`,
                        height: "36%",
                        borderRadius: size * 0.05,
                        background: "linear-gradient(180deg, #4A3C3F 0%, #2B2224 45%, #1A1415 100%)",
                        boxShadow: "0 1px 2px rgb(0 0 0 / 0.5)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          left: "18%",
                          right: "18%",
                          top: "48%",
                          height: Math.max(1, size * 0.02),
                          background: "rgb(0 0 0 / 0.75)",
                          boxShadow: "0 1px 0 rgb(255 255 255 / 0.1)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div style={face(E, H, W, H, `${pulledOut} rotateY(90deg) translateZ(${W / 2}px)`, { overflow: "hidden" })}>
                <div ref={parts.right} style={{ ...fill, transform: drawer.right, background: "linear-gradient(180deg, #C2A09A, #B3918A)", borderTop: rim }} />
              </div>
              <div style={face(E, H, W, H, `${pulledOut} rotateY(-90deg) translateZ(${W / 2}px)`, { overflow: "hidden" })}>
                <div ref={parts.left} style={{ ...fill, transform: drawer.left, background: "linear-gradient(180deg, #D2B1AA, #C5A39C)", borderTop: rim }} />
              </div>
            </>
          )}

          {/* The ring, standing in the cushion's slot and turned to face the
              viewer; it rises out of a window whose foot is the slot. */}
          {ring && (open > 0 || withDrawer) && (
            <div
              style={{
                position: "absolute",
                left: (W - ringW) / 2,
                top: H / 2 - ringH,
                width: ringW,
                height: ringH,
                overflow: "hidden",
                transformOrigin: "50% 100%",
                transform: `translate3d(0, ${-H / 2}px, ${D / 2 + E * SLOT}px) rotateY(${-ringFacing.turn}deg) rotateX(${-ringFacing.tilt}deg)`,
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
              }}
            >
              <div ref={parts.ring} style={{ ...fill, transform: "translateY(100%)" }}>
                <img src={ring} alt="" draggable={false} style={{ display: "block", width: "100%", height: "100%" }} />
                <div
                  ref={parts.glint}
                  style={{
                    position: "absolute",
                    left: "48%",
                    top: "15%",
                    width: ringW * 0.7,
                    height: ringW * 0.7,
                    marginLeft: -ringW * 0.35,
                    marginTop: -ringW * 0.35,
                    background: GLINT,
                    maskImage: GLINT_FADE,
                    WebkitMaskImage: GLINT_FADE,
                    opacity: 0,
                  }}
                />
              </div>
            </div>
          )}

          {/* The drawer's front panel, with its pull tab; it closes the sleeve. */}
          <div
            ref={parts.front}
            style={face(W, H, W, H, drawer.front, {
              background: "linear-gradient(180deg, #D1AEA7 0%, #C6A39C 100%)",
              border: rim,
            })}
          >
            <span
              style={{
                position: "absolute",
                left: "43%",
                width: "14%",
                bottom: "8%",
                height: Math.max(1.5, size * 0.035),
                background: "#EEDDD7",
                boxShadow: "0 1px 0 rgb(0 0 0 / 0.08)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NairaBoxCSS;
