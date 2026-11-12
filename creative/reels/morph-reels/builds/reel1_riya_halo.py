"""Reel 1, Riya: "Every stone in its own halo". Lead device: a dark portal. Revision 3 (after the 5/10 critique).

One chain of real 4K frames (riya_F67FB13D, her own clean cut), every join planned on a shape:
  hoop tray (one real still), sharp at native 4K pixels, pulled back at 18 fps -> hold, the offer, the hoops' price ->
  push into the left hoop's dark centre: a streak, then one picture INSIDE the hole (black) -> the drawer's black
  velvet (black), which streaks back to the open drawer (one real still) -> hold, price on the lid -> registered swap
  on her own cut: the halo stays put while the drawer becomes her mehendi hand (real, 30 fps), which carries the halo
  to the bracelet's place -> registered swap: the cushion halo becomes the bracelet's centre square link, same
  centre, size and angle (one real still) -> hold, price -> whip off the wrist into her REAL hair flip -> over-the-
  shoulder look, hoops at her ear -> all three worn, the deal as a sum -> cut on the ring back to the box -> the lid
  print becomes the vector logo, end card.

What changed from v1 and why (the critique's numbers):
- Blur: 19 soft frames in the reel, at most 5 per move, measured on a type-free render (an/blurqc.py: Laplacian under
  40% of the shot's hold); v1 had 66. Gentle pictures open the shutter .2-.35, streaks .5-.9, landings .3.
- Frame 1 is a held picture at k 1.0 (native pixels): 83% of the hold's sharpness (v1 13 vs 93; v2a 27%).
  Laplacian variance falls roughly as k^-3.5, so any opener at k > ~1.07 fails an 80% test however still it is.
- Product holds are single real frames (freeze), so they are dead still and nothing steps at 9 fps: the tray, the
  drawer (and the lid bookend, the same frame), the bracelet. Real action (hand, flip, look, worn) plays at 1.0x.
- The ring push, the macro and the bracelet pull-back are gone (over the 2.6x cap, the zoom grammar five times). The
  chain is pull-back / portal / swap / swap / whip / ring-hinge cut / relay.
- Portal: dark into dark, measured: the last hoop picture's thirds 6/5/4, the first drawer picture's 8/6/5.
- Swaps measured at 3-4x on axis-aligned crops: halos 129-133 px across on screen, centres within ~3 px (drawer ->
  hand) and ~1 px (hand -> link), hand -> link angle matched (-34.5 deg). Drawer -> hand still turns ~35 deg.
- Type: offer 62/32 px, ~0.95 s at full opacity; the deal as a sum with an arrow (never a struck subtotal), ivory on
  the dark wall (v2a's ink there was invisible); card ladder 38 px, COD 27 px, URL 56 px, a direct ask.
- Sound: felt taps low-passed (no 6-16 kHz tick), her bracelet line keeps "for", the whip ducks her 3 dB.

Coordinates are 4K source px (2160x3840) unless named canvas. Run: python3.13 -I build.py [render a b [dir] | edges |
audio | encode dir | times]. a, b are output frame indices (30 fps).
"""
import sys, os, math
sys.path.insert(0, '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/tools')
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, cv2
import mx, mxkit as K, track as TR

S = K.S
SRC = f'{S}/src/riya_F67FB13D.mp4'
WD = f'{S}/mx/r1'
OUT = f'{S}/mx/out'
SLUG = 'naira-morph-1-riya-halo'
SW, SH = 2160, 3840
P = mx.Plate(1080, 1920, fps=30, shutter=.5)
STEP = 1 / 18
FR = 1 / 30
C = (540.0, 960.0)


def kof(L, ts):
    """the decoded frame index of source time ts in layer L"""
    return int(round((ts - (L.inp - L.inp_off)) * 30))


def lerp_steps(vals, t, t0):
    """a per-step curve (value at t0 + i * STEP), linear inside a step so each step's blur matches its own speed"""
    i = (t - t0) / STEP
    if i <= 0: return vals[0]
    if i >= len(vals) - 1: return vals[-1]
    j = int(math.floor(i)); f = i - j
    return vals[j] + (vals[j + 1] - vals[j]) * f


def rot(d, r):
    """a source offset as a canvas offset under the kit's clockwise rotation r (degrees), before scale"""
    c, s = math.cos(math.radians(r)), math.sin(math.radians(r))
    return (d[0] * c - d[1] * s, d[0] * s + d[1] * c)


def smooth(d, n=5):
    """a {frame: value} track smoothed with an n-frame mean (landmark/NCC jitter is a pixel or two)"""
    ks = sorted(d); v = np.array([d[k] for k in ks], float)
    p = n // 2; v = np.convolve(np.pad(v, p, mode='edge'), np.ones(n) / n, 'valid')
    return dict(zip(ks, v))


def ease_io(u): u = min(1.0, max(0.0, u)); return u * u * (3 - 2 * u)


# =====================================================================================================================
# 1. HOOK 0.00-2.62: the hoop tray as ONE real still (17.367, the sharpest picture of the shot: Laplacian 180 on the
#    hoops at 1:1 against 125-160 for the rest), so the hold is dead still and nothing steps or judders. Frame 1 shows
#    it at k 1.0, native 4K pixels: any k above 1 is an upscale and reads soft (v1 opened at 1.3 and blurred; v2a at
#    1.2 measured 27% of the hold). Two held 18 fps pictures, then six gentle pull-back steps (shutter .3) to KA1 and
#    the hold under the offer, then the hoops' price.
# =====================================================================================================================
HOOP_T = 17.367
PB_R = [.965, .97, .975, .98, .99, .995]
T_PB0 = 2 * STEP
T_PB1 = T_PB0 + len(PB_R) * STEP
T_Z = 2.62
# the push into the hole: slow, slow, then two fast steps; the last picture is the dark core
# five pictures: three gentle (shutter .35), the streak (.9), then one picture INSIDE the hole: its exposure runs
# k 11.9-15.9 and the hole's clear black (110 x 170 px) fills the frame from k 11.3, so the last hoop picture is black
# and meets the drawer's black velvet (v2a's cut picture was a gold streak, thirds 68/46/52 against 33/7/12)
ZIN_R = [1.03, 1.08, 1.25, 14.0, 1.15]   # slow, slow, small, then the plunge
T_CUT = T_Z + len(ZIN_R) * STEP
A1 = P.layer(src=SRC, t0=0, t1=T_CUT, inp=HOOP_T, speed=0, name='hoops')
FA = A1.F
A1.freeze = kof(A1, HOOP_T)
kA = kof(A1, 17.4)
trkA = TR.tmatch(FA, kA, [880, 2610, 1160, 2890], range(FA.n), search=1.8)
refA = trkA[kA]
dxA, dyA = trkA[A1.freeze][0] - refA[0], trkA[A1.freeze][1] - refA[1]   # coordinates below were read at 17.4
MID = (1255 + dxA, 2680 + dyA)         # between the hoops
HOLE = (1005 + dxA, 2695 + dyA)        # centre of the hole's largest clear rectangle (950-1060 x 2610-2780, 100% crop)
pb = np.cumprod([1.0] + PB_R)
KA0 = 1.0                              # frame 1: native 4K pixels
KA1 = KA0 * pb[-1]                     # .88: both hoops, the box rim and the wood above for the type
uA = np.log(pb) / np.log(pb[-1])
PYA = 1060                             # MID's canvas y: wood above the tray for the type
zc = np.cumprod([1.0] + ZIN_R)
wz = np.log(zc) / np.log(zc[-1])
h0 = (C[0] + (HOLE[0] - MID[0]) * KA1, PYA + (HOLE[1] - MID[1]) * KA1)


def cam_a(t):
    if t < T_Z:
        u = 0.0 if t < T_PB0 else lerp_steps(list(uA), t, T_PB0)
        return {'k': KA0 * (KA1 / KA0) ** u, 'x': MID[0] / SW, 'y': MID[1] / SH, 'px': C[0], 'py': PYA}
    # zoom about the hole while the hole slides to the frame centre, both on the same per-step curve
    z = lerp_steps(list(zc), t, T_Z); w = lerp_steps(list(wz), t, T_Z)
    return {'k': KA1 * z, 'x': HOLE[0] / SW, 'y': HOLE[1] / SH, 'px': h0[0] + (C[0] - h0[0]) * w, 'py': h0[1] + (C[1] - h0[1]) * w}
A1.camf = cam_a

# =====================================================================================================================
# 2. DRAWER: the cleanest packshot as one real still (9.667: box upright, drawer open; the frame the lid print was
#    registered on). It arrives INSIDE the black velvet right of the ring (VR, k ~4: only velvet in frame for the whole
#    first exposure, so the cut is black into black - v2a arrived on the pink lid), then recedes on a decaying curve
#    while the ring comes in from the left, and holds levelled (the print turned 7.5 deg back to horizontal) under the
#    ring's price on the lid.
# =====================================================================================================================
DR_T = 9.667
ZOUT_R = [.20, .85, .93]               # pic 0 black (short shutter, stays inside the velvet), pic 1 the streak out,
                                       # pic 2 a 3% settle: then the hold
T_SETTLE = T_CUT + len(ZOUT_R) * STEP
T_SW1 = T_SETTLE + 1.0
KL = .66                               # the bracelet's scale: every stone of the strand stays above Meta's caption line
D_DR, D_HD, D_LK = 183.0, 127.0, 192.0  # halo across flats, source px: drawer, hand, link. Read on the rendered swaps,
                                       # each crop turned so its halo is axis-aligned, at 3-4x (the link's flat side
                                       # 133 px on screen at KL .66 = 201 src... its pave edge ~192; the drawer's 190 and
                                       # the hand's 127 came out 4% small against it): the drawer and hand follow the
                                       # link, so all three halos read 129-133 px across on screen
KD = KL * D_LK / D_DR                  # the chain's sizes all follow from the bracelet's
LEVEL = 7.5                            # the lid print sits 7.5 deg anticlockwise at 9.667 (printreg.py)
PR_C = (580.0, 560.0)                  # the print centre's canvas point in the hold (lower and the source runs out under the box)
B = P.layer(src=SRC, t0=T_CUT, t1=T_SW1, inp=DR_T, speed=0, group=False, name='drawer')
FB = B.F
B.freeze = kB = kof(B, DR_T)
PRINT = (1085, 1600)                   # print centre at 9.667
RING = (1161, 2456)                    # halo centre at 9.667 (200% crop: outer halo 1065-1257 x 2360-2552)
VR = (1585, 2432)                      # black velvet right of the ring: centre of the clear velvet (levelled, 512 px
                                       # tall) so the first picture's 287 x 510 px window holds nothing else
k_ = np.cumprod([1.0] + ZOUT_R)
KD0 = KD / k_[-1]
uB = np.log(k_) / np.log(k_[-1])


def drawer_geo():
    """the hold's rotation and where the ring lands on the canvas in the hold"""
    r = LEVEL
    o = rot((RING[0] - PRINT[0], RING[1] - PRINT[1]), r)
    return r, (PR_C[0] + o[0] * KD, PR_C[1] + o[1] * KD)


def cam_b(t):
    r, a1 = drawer_geo()
    if t >= T_SETTLE:
        return {'k': KD, 'x': PRINT[0] / SW, 'y': PRINT[1] / SH, 'px': PR_C[0], 'py': PR_C[1], 'r': r}
    u = lerp_steps(list(uB), t, T_CUT)
    k = KD0 * (KD / KD0) ** u
    # the pivot runs from the velvet (at the frame centre) to the ring (at its hold point)
    sx, sy = VR[0] + (RING[0] - VR[0]) * u, VR[1] + (RING[1] - VR[1]) * u
    return {'k': k, 'x': sx / SW, 'y': sy / SH, 'px': C[0] + (a1[0] - C[0]) * u, 'py': C[1] + (a1[1] - C[1]) * u, 'r': r}
B.camf = cam_b
ANCH1 = drawer_geo()[1]                # the drawer ring's canvas point in the hold

# =====================================================================================================================
# 3. HAND: her own cut, drawer -> hand (10.100), the halo held on ANCH1 at the same across-flats size (190 x KD =
#    127 x KH). Her real hand plays 14 frames at 30 fps (10.100-10.533; she starts to blink at 10.667), ring-locked,
#    while the lock point glides (ease in-out) to ANCH2, where the bracelet's link will sit. The hand is rolled 20.5 deg
#    so its halo meets the link at the link's angle. Across her cut from the drawer the halo still turns ~35 deg (drawer
#    ~0 on screen, hand +35 natively): a start roll that halves it pushes the frame's corner off the 4K source (edge
#    check: 61 px of mirror at 27 deg), and levelling the box differently would tilt the lid and its price.
# =====================================================================================================================
KH = KD * D_DR / D_HD
ROLL_H0, ROLL_H1 = 20.5, 20.5          # 20.5: hand +35 rolled 20.5 = 55.5 = -34.5 (mod 90) = the link's -28.5 - 6
N_HAND = 14
T_SW2 = T_SW1 + N_HAND * FR
Cc = P.layer(src=SRC, t0=T_SW1, t1=T_SW2, inp=10.100, speed=1, group=False, name='hand')
FC = Cc.F
kC = kof(Cc, 10.100)
trkC = TR.tmatch(FC, kC, [898, 1952, 1038, 2092], range(FC.n), search=1.8)
refC = trkC[kC]
HD_HEAD = (970, 2026)                  # hand halo centre at 10.100 (refined on the rendered swap at 4x)
ROLL_L = -6.0                          # about the most the 4K frame allows at KL: the source must cover the turned frame
ANCH2 = (500.0, 785.0)                 # the link's canvas point: the strand's stones sit in y ~330-1225 (the clasp
                                       # below; the source ends under it)


def cam_c(t):
    c = trkC.get(Cc.k_now, refC)
    u = ease_io((t - T_SW1) / ((N_HAND - 1) * FR))
    return {'k': KH, 'r': ROLL_H0 + (ROLL_H1 - ROLL_H0) * u, 'x': (c[0] + HD_HEAD[0] - refC[0]) / SW,
            'y': (c[1] + HD_HEAD[1] - refC[1]) / SH,
            'px': ANCH1[0] + (ANCH2[0] - ANCH1[0]) * u, 'py': ANCH1[1] + (ANCH2[1] - ANCH1[1]) * u}
Cc.camf = cam_c

# =====================================================================================================================
# 4. BRACELET: the cushion halo becomes the bracelet's centre square link on a hard cut, same centre, same across-
#    flats size, same angle (the link holds -28.5 deg through 20.67-21.63). One real still (20.917: the sharpest steady
#    picture, Laplacian ~475 on the strand against ~200-280 after 21.1), so the hold is dead still; then the whip.
# =====================================================================================================================
BR_T = 20.917
T_WHIP = T_SW2 + 1.10
NW = 3                                 # three pictures: still, moving, the cut picture (4 blurred 7 frames)
T_FLIP = T_WHIP + NW * STEP
E = P.layer(src=SRC, t0=T_SW2, t1=T_FLIP, inp=BR_T, speed=0, group=False, name='brace')
FE = E.F
E.freeze = kof(E, BR_T)
LINK = (1059, 1976)                    # the centre link's halo centre at 20.917, read at 200% and on the render at 4x (NCC from
                                       # 21.133 put it 70 px off: its score was .38)
# the whip: the picture slides right (her flip sweeps left to right) and pushes in, both accelerating; the push keeps
# the source under the frame while it travels
uW = np.concatenate([[0], np.cumsum([2.3 ** i for i in range(NW)])]); uW = uW / uW[-1]
W_DX, W_K = 330.0, 1.6


def cam_e(t):
    u = lerp_steps(list(uW), t, T_WHIP) if t >= T_WHIP else 0.0
    return {'k': KL * W_K ** u, 'r': ROLL_L, 'x': LINK[0] / SW, 'y': LINK[1] / SH, 'px': ANCH2[0] + W_DX * u, 'py': ANCH2[1]}
E.camf = cam_e

# =====================================================================================================================
# 5. FLIP + OVER THE SHOULDER: cut on the whip's most blurred frame into her REAL hair flip (f578, 19.267, already
#    blurred left to right by her own motion), which lands decelerating (3 steps) and resolves into her look over the
#    shoulder at native 30 fps, locked on her eyes' x and her forehead edge (she leans in; the forehead lock keeps the
#    dark crown of her hair under the type).
# =====================================================================================================================
T_OS = T_FLIP + 3 * STEP
T_ALL = T_OS + 26 * FR
Fo = P.layer(src=SRC, t0=T_FLIP, t1=T_ALL, inp=19.267, speed=1, group=False, name='flip')
FF = Fo.F
facesF = TR.face(FF, step=1)
eyeF = {k: ((v['L'][0] + v['R'][0]) / 2 * SW, (v['L'][1] + v['R'][1]) / 2 * SH) for k, v in facesF.items()}
k_first = kof(Fo, 19.45)
ksF = sorted(k for k in eyeF if k >= k_first)
w5 = np.ones(5) / 5
exF = np.convolve(np.pad(np.array([eyeF[k][0] for k in ksF]), 2, mode='edge'), w5, 'valid')
ftF = np.convolve(np.pad(np.array([facesF[k]['box'][1] * SH for k in ksF]), 2, mode='edge'), w5, 'valid')
eye_at = lambda k: (float(np.interp(k, ksF, exF)), float(np.interp(k, ksF, ftF)))
KF = .70                               # with the face this high the hoop stays above the caption line all through
EYE_C = (590, 340)                     # canvas point of (eye x, forehead top). A black ceiling fixture shows at the
                                       # top-right edge (y ~170-260, above the 4:5 crop) for ~6 frames as she lands:
                                       # framing it out (k .74, eye x 640) pushed the hoop off the right edge as she
                                       # leans in, and the source ends 28 px short on the left at eye x 630
L_D, L_K = 90.0, 1.10                  # the landing's leftover travel and scale: her flip carries its own blur, so
                                       # the camera adds little and is still by the second picture


def cam_f(t):
    ex, ey = eye_at(max(Fo.k_now, k_first))
    if t < T_OS:
        i = int(math.floor((t - T_FLIP) / STEP + 1e-6)); f = (t - T_FLIP) / STEP - i
        dec = [1.0, .22, 0.0, 0.0]
        d = dec[min(i, 3)] + (dec[min(i + 1, 3)] - dec[min(i, 3)]) * f
    else: d = 0.0
    return {'k': KF * L_K ** d, 'x': ex / SW, 'y': ey / SH, 'px': EYE_C[0] - L_D * d, 'py': EYE_C[1]}
Fo.camf = cam_f

# =====================================================================================================================
# 6. ALL THREE: hands crossed at her chest - ring, bracelet, hoops at her ear - smiling to the lens (26.80-27.47, then
#    that frame held: from 27.50 her lids start to drop into the blink at 27.6, checked at 100%). A cut on the look.
# =====================================================================================================================
T_LID = T_ALL + .90
Gw = P.layer(src=SRC, t0=T_ALL, t1=T_LID, inp=26.80, speed=1, group=False, name='worn')
FG = Gw.F
kG_last = kof(Gw, 27.467)
Gw.src_index = lambda t: min(kG_last, int(math.floor((Gw.inp_off + (t - T_ALL)) * 30 + 1e-4)))
facesG = TR.face(FG, step=1)
ksG = sorted(k for k in facesG if kof(Gw, 26.80) <= k <= kG_last)
exG = np.convolve(np.pad(np.array([(facesG[k]['L'][0] + facesG[k]['R'][0]) / 2 * SW for k in ksG]), 2, mode='edge'), w5, 'valid')
eyG = np.convolve(np.pad(np.array([(facesG[k]['L'][1] + facesG[k]['R'][1]) / 2 * SH for k in ksG]), 2, mode='edge'), w5, 'valid')
eyeG0 = (float(exG[0]), float(eyG[0]))
# the window: the frame's top clears the ceiling fan (source y >= 1100), its bottom stays on the source (3840), the
# ring and bracelet stay above the caption line (y <= 1206 as her hands sink), and the grey wall right of her head is
# ~400 px wide for the deal
KG = .71
G_C = (440.0, 353.0)                   # canvas point of her eyes
Gw.camf = lambda t: {'k': KG, 'x': float(np.interp(Gw.k_now, ksG, exG)) / SW, 'y': float(np.interp(Gw.k_now, ksG, eyG)) / SH,
                     'px': G_C[0], 'py': G_C[1]}

# =====================================================================================================================
# 7. LID + END: back to the packshot (the same still as the drawer hold: a bookend), the lid print levelled and placed
#    letter on letter where the vector logo will be (printreg.py: k .74, NCC .67 on the letters). Then the print
#    dissolves into the sage vector logo as the ivory ground comes up (the ONE dissolve), and the card's lines rise.
# =====================================================================================================================
T_DIS = T_LID + .55
T_CARD = T_DIS + .45
DUR = round((T_CARD + 1.50) * 30) / 30   # the card holds 1.5 s once the ivory is up
# LOGO_Y puts the lid shot's ring where her ring sits on the last worn picture (505, 1205 on screen; the lid's ring
# lands at 515, 1205): the cut from all three worn back to the box hinges on the ring, not on nothing
LOGO_W, LOGO_Y = 560, 495
PRINT_AT = ((1080 - LOGO_W) / 2 + 279, LOGO_Y + 75)
H = P.layer(src=SRC, t0=T_LID, t1=T_CARD + .05, inp=DR_T, speed=0, group=False, name='lid')
H.freeze = kof(H, DR_T)
H.camf = lambda t: {'k': .74, 'r': LEVEL, 'x': PRINT[0] / SW, 'y': PRINT[1] / SH, 'px': PRINT_AT[0], 'py': PRINT_AT[1]}

# ---- the 18 fps made sequences: shutter .5 on ramp steps, .9 only on the one step either side of a cut; the opener's
# gentle pull-back at .3; the hand beat stays 30 fps but with a 90-degree shutter, so the glide does not smear her hand ----
# Per picture: the push's gentle pictures at .3, its streak at .9, the black core at .5; the drawer's black picture
# at .2, its streak at .5 and the settle at .3; the whip's first picture at .2, its ramp at .5 and its cut picture at
# .9; her flip's first picture at .9 and the landing at .4. Measured on the type-free render (an/blurqc.py): at most
# 5 frames per move fall under 40% of their shot's hold sharpness.
P.steps += [(0, T_PB1 + STEP, 18, .3), (T_SW1, T_SW2, 30, .25),
            (T_Z, T_Z + 3 * STEP, 18, .3), (T_Z + 3 * STEP, T_Z + 4 * STEP, 18, .9), (T_Z + 4 * STEP, T_CUT, 18, .5),
            (T_CUT, T_CUT + STEP, 18, .2), (T_CUT + STEP, T_CUT + 2 * STEP, 18, .5), (T_CUT + 2 * STEP, T_SETTLE + STEP, 18, .3),
            (T_WHIP, T_WHIP + STEP, 18, .2), (T_WHIP + STEP, T_FLIP - STEP, 18, .5), (T_FLIP - STEP, T_FLIP + STEP, 18, .9),
            (T_FLIP + STEP, T_OS, 18, .4)]

# =====================================================================================================================
# TYPE: one block per hold, never over a move; ink on wood, the lid and her forearm, ivory with a halo on the dark wall.
# =====================================================================================================================
FADE = 4 * FR
DARK = (70, 62, 57)                    # the struck MRP in ink: dark enough to read at phone size


def price_block(name, price, mrp, color=K.INK, shadow=.3, ns=32, ps=74, ms=42, gap=14):
    """PIECE NAME (one line, or a list of short lines for a narrow clean ground) over a Cormorant price with the MRP
    struck beside it"""
    dim = DARK if sum(color) < 380 else (235, 225, 216)
    names = [name] if isinstance(name, str) else name
    a = [K.text(n.upper(), 'jost', ns, 500, .22, color=color, shadow=shadow) for n in names]
    p = K.text(K.rs(price), 'cg', ps, 500, 0, color=color, shadow=shadow)
    m = K.strike(K.text(K.rs(mrp), 'cg', ms, 500, 0, color=dim, shadow=shadow))
    if len(a) == 1: return K.stack([a[0], K.hrow([p, m], gap=20)], gap=gap)
    return K.stack([K.stack(a, gap=8)[:2] + (0,), K.hrow([p, m], gap=20)], gap=gap)


# The hoop tray hold carries two blocks in turn on the same clean wood: the offer first (legible by ~0.6 s, ~0.9 s at
# full opacity), then the hoops' price. The over-the-shoulder look has no clean ground (her face fills it, the hoop
# sits just above the caption line and the source has no headroom to reframe), so it plays without type.
OFFER_T = (T_PB1 + .02, 1.68)          # 1.22 s: ~0.95 s at full opacity between 4-frame fades
K.place(P, K.stack([K.text('BUY 3  ·  20% OFF', 'jost', 62, 500, .2, color=K.INK, shadow=.45),
                    K.text('APPLIED IN THE BAG', 'jost', 32, 500, .22, color=K.INK, shadow=.45)], gap=18),
        540, 290, *OFFER_T, fin=FADE, fout=FADE, rise=6)
HP_T = (1.74, T_Z - .03)
K.place(P, price_block('Woven Gold Hoops', *K.OFFER['prices']['woven-gold-hoops']), 540, 285, *HP_T, fin=FADE, fout=FADE, rise=6)
CUSH_T = (T_SETTLE + .06, T_SW1 - .04)
K.place(P, price_block('Cushion Halo Ring', *K.OFFER['prices']['cushion-halo-ring']), PR_C[0], PR_C[1] + 95, *CUSH_T,
        fin=FADE, fout=FADE, rise=6)
BRP_T = (T_SW2 + .10, T_WHIP - .04)
BR_XY = (835, 640)                     # the plain forearm right of the strand, under the mehendi: ink on skin
K.place(P, price_block(['Prism Riviere', 'Bracelet'], *K.OFFER['prices']['prism-riviere-bracelet'], ns=28, ps=70, ms=40), *BR_XY, *BRP_T,
        fin=FADE, fout=FADE, rise=6)
# the deal on the shot that shows all three worn, on the grey wall right of her head (luma ~72: IVORY with an ink halo;
# v2a's ink there was near invisible). It reads as a SUM, the bag before and after the rung, with an arrow - never a
# struck price, which would read as an MRP.
sub, tot, rate = K.bag_total(['woven-gold-hoops', 'cushion-halo-ring', 'prism-riviere-bracelet'])
DEAL_T = (T_ALL + .06, T_LID - .03)
DEAL_XY = (888, 318)                   # the clean wall between the lamp (x ~700) and the picture frame (y ~640)
_iv = K.IVORY; _dimv = (226, 216, 208)
K.place(P, K.stack([K.text('ALL THREE', 'jost', 30, 500, .22, color=_iv, shadow=.55),
                    K.hrow([K.text(K.rs(sub), 'cg', 42, 500, 0, color=_dimv, shadow=.55),
                            K.text('→', 'cg', 38, 500, 0, color=_dimv, shadow=.55),
                            K.text(K.rs(tot), 'cg', 60, 500, 0, color=_iv, shadow=.55)], gap=10)], gap=12),
        *DEAL_XY, *DEAL_T, fin=FADE, fout=FADE, rise=6)

# ---- the end: ivory comes up round the print while the vector logo lands on it; then the card ----
g = np.zeros((P.H, P.W, 4), np.uint8); g[..., :3] = K.IVORY; g[..., 3] = 255
P.overlay(g, 0, 0, T_DIS, DUR, fin=T_CARD - T_DIS, fout=0, rise=0, ease_in='io')
P.overlay(K.logo(LOGO_W), (P.W - LOGO_W) / 2, LOGO_Y, T_DIS, DUR, fin=T_CARD - T_DIS, fout=0, rise=0, ease_in='io')
GREY = (120, 112, 106)
CARD = [(f'BUY {q}  ·  {p}% OFF', 'jost', 38, K.DEEP, 18) for q, p in K.OFFER['rungs']]
CARD[-1] = CARD[-1][:4] + (26,)
CARD += [('APPLIED IN THE BAG', 'jost', 26, GREY, 44),
         ('COD AVAILABLE  ·  FREE INSURED SHIPPING', 'jost', 27, K.INK, 48),
         ('SHOP THE SET', 'jost', 30, K.INK, 16),
         ('nairaflore.com', 'cgi', 56, K.DEEP, 0)]


def endcard_lines():
    """the card's lines (the kit's endcard with larger type and a direct ask): placed under the logo, staggered in"""
    y = LOGO_Y + K.logo(LOGO_W).shape[0] + 60; boxes = []
    for i, (s, kind, size, col, gap) in enumerate(CARD):
        tp = K.text(s, kind, size, 500, .22 if kind == 'jost' else 0, color=col, shadow=0)
        K.place(P, (tp[0], tp[1]), P.W / 2, y, T_CARD + .12 + .08 * i, DUR, fin=.3, fout=0, rise=8)
        boxes.append((s, round(P.W / 2 - tp[2] / 2), y, round(P.W / 2 + tp[2] / 2), y + size))
        y += size + gap
    return boxes
CARD_BOXES = endcard_lines()


# ---- edge check: every layer's camera must keep the source under the whole frame (BORDER_REFLECT shows mirrors) ----
def edge_report(step=1):
    bad = []
    corners = np.array([[0, 0, 1], [P.W, 0, 1], [0, P.H, 1], [P.W, P.H, 1]], float).T
    for i in range(0, int(round(DUR * 30)), step):
        t, sh = P.clock(i / 30)
        for L in P.layers:
            if not (L.t0 <= t < L.t1): continue
            sw, shh = L.F.size
            for tt in (t - sh / 2, t + sh / 2):
                L.k_now = L.src_index(t)
                Mi = np.linalg.inv(L.matrix(tt)); s = Mi @ corners
                if s[0].min() < -1 or s[1].min() < -1 or s[0].max() > sw + 1 or s[1].max() > shh + 1:
                    bad.append((i, L.name, round(float(s[0].min())), round(float(s[1].min())), round(float(s[0].max() - sw)), round(float(s[1].max() - shh))))
                    break
    return bad


# =====================================================================================================================
# SOUND: three kinds only - the beatless string pad (B minor resolving to D add9 on the card), a sub-only whoosh on
# each move into a blurred cut (portal, whip), and one soft felt tap on each registered swap (drawer -> hand,
# halo -> link). Her own voice carries the words; the bed steps under it.
# Voice lines (raw time, from the envelope): hook 0.00-4.33, bracelet 20.42-23.84 (ends after "for", 23.46-23.78),
# sign-off 31.00-32.93. Never 28.1-30.6 (the plating line).
# =====================================================================================================================
VO = f'{S}/vo/riya.48k.wav'
LINES = [(0.00, 4.33, 0.10), (20.42, 23.84, T_SW2 - .04), (31.00, 32.93, T_DIS - .08)]


def soft_felt(v=1.0, seed=0):
    """the kit's felt tap with its top removed: low-passed at 3.2 kHz and a 5 ms attack, so no click reaches the
    6-16 kHz band (v1's taps sat ~30 dB over the bed there and read as a tick on earbuds)"""
    from scipy.signal import butter, sosfilt
    r = np.random.default_rng(seed + 77); n = int(.08 * K.SR); t = np.arange(n) / K.SR
    y = K.lp(r.standard_normal(n), 900, 2) * np.exp(-t / .008) * .45 + np.sin(2 * np.pi * (170 + 20 * r.random()) * t) * np.exp(-t / .016) * .55
    y = sosfilt(butter(4, 3200, 'low', fs=K.SR, output='sos'), y)
    a = int(.005 * K.SR); y[:a] *= np.linspace(0, 1, a) ** 2
    return np.stack([y, y], 1) * v * .35


def build_audio(out_wav):
    import soundfile as sf
    from scipy.signal import resample_poly
    m = K.Mix(DUR)
    # chord changes sit under the structural cuts: into the drawer, into the bracelet, into her flip, onto the card
    m.pad([(0.0, [47, 54, 59, 62, 66]), (T_CUT, [43, 50, 55, 59, 62, 66]), (T_SW2, [40, 52, 55, 59, 62, 66]),
           (T_FLIP, [45, 52, 57, 61, 64, 66]), (T_DIS, [50, 57, 62, 64, 66, 69])])
    m.subwhoosh(T_Z, T_CUT, v=.8)
    m.subwhoosh(T_WHIP, T_FLIP, v=.8)
    m.put(m.fx, soft_felt(1.0, 1), T_SW1)
    m.put(m.fx, soft_felt(.9, 2), T_SW2)
    # each line levelled on its own first: the hook and the bracelet line are phone-mic, the sign-off is the lav at
    # her lips, ~12 dB hotter
    x, sr = sf.read(VO, always_2d=True)
    for a, b, at in LINES:
        seg = x[int(a * sr):int(b * sr)].mean(1)
        seg = resample_poly(seg, K.SR, sr) if sr != K.SR else seg
        g = 10 ** ((-20 - K.lufs(np.stack([seg, seg], 1))) / 20)
        m.voice(VO, a, b, at, g=g)
    # the whip and flip breathe: her line dips 3 dB so the sub-whoosh leads (the critique's loud-quiet-loud)
    i0, i1 = int((T_WHIP - .05) * K.SR), int((T_OS + .05) * K.SR); r = int(.08 * K.SR)
    gv = np.ones(m.N); gv[i0:i1] = 10 ** (-3 / 20)
    gv = np.convolve(gv, np.ones(r) / r, 'same'); m.vo *= gv[:, None]
    return m.master(out_wav, fade_out=.12)


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'times'
    if cmd == 'render':
        a, b = int(sys.argv[2]), int(sys.argv[3]); d = sys.argv[4] if len(sys.argv) > 4 else f'{WD}/part'
        P.render(d, DUR, start=a, stop=b, workers=2)
    elif cmd == 'qc':
        # the picture alone (no type, no card): what the per-frame sharpness check measures, so type never counts as detail
        a, b, d = int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
        P.overlays = []; P.render(d, DUR, start=a, stop=b, workers=2)
    elif cmd == 'frames':
        # a few output frames (1-based names, as the render writes them) for looking at one beat
        d = sys.argv[3] if len(sys.argv) > 3 else f'{WD}/fr'; os.makedirs(d, exist_ok=True)
        for i in [int(v) for v in sys.argv[2].split(',')]:
            img = P.frame(i / 30)
            cv2.imwrite(f'{d}/f_{i + 1:04d}.jpg', cv2.cvtColor((img * 255 + .5).astype(np.uint8), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 95])
    elif cmd == 'edges':
        for b in edge_report(): print(b)
    elif cmd == 'audio':
        print(build_audio(f'{WD}/{SLUG}.wav'))
    elif cmd == 'encode':
        d = sys.argv[2]; wav = f'{WD}/{SLUG}.wav'
        K.encode(d, wav, f'{OUT}/{SLUG}.mp4'); K.encode(d, wav, f'{OUT}/{SLUG}-4x5.mp4', crop45=True)
        for f in (f'{OUT}/{SLUG}.mp4', f'{OUT}/{SLUG}-4x5.mp4'): print(f, K.probe(f))
    elif cmd == 'times':
        T = dict(T_PB1=T_PB1, T_Z=T_Z, T_CUT=T_CUT, T_SETTLE=T_SETTLE, T_SW1=T_SW1, T_SW2=T_SW2, T_WHIP=T_WHIP,
                 T_FLIP=T_FLIP, T_OS=T_OS, T_ALL=T_ALL, T_LID=T_LID, T_DIS=T_DIS, T_CARD=T_CARD, DUR=DUR)
        print({k: (round(v, 3), round(v * 30, 1)) for k, v in T.items()})
        print('KA1', KA1, 'KD', KD, 'KD0', KD0, 'KH', KH, 'KL', KL, 'ANCH1', ANCH1, 'ANCH2', ANCH2)
        print('card', CARD_BOXES)
