"""Reel 2, Pankti: "Closes with a turn".  Lead device: the toggle's big ring locked to one screen point while the
world around it changes (the reference's coin series, inverted), then the reel's one clockwise spin-whip seeded by her
own flip of the ring.

Revision 2 (after the critique): the ring series is one-way (velvet once, then skin only, ground switched under the
burst blur), the spin cut keeps the ring's size, every move keeps its blur to a few frames at peak speed, the deal
line sits off her face, the face hold plays at 30 fps, the face-to-lid join is a zoom-through the huggie into the
lid's flower-I, and the lid print is re-registered on the vector logo.

Every picture is a real frame of pankti_raw.mp4 (HLG, tone-mapped with mx.PANKTI and flipped) or our own type and
logo. The only dissolve is the lid's printed wordmark into the vector logo at the end.

    python3.13 -I build.py check            coverage / punch-in report for every layer, no render
    python3.13 -I build.py part A B          render output frames [A, B) into part/ and a sheet
    python3.13 -I build.py frames i j ...    single frames into one/
    python3.13 -I build.py full              render, mix, encode both shapes, sheets
"""
import sys, os, math, json, shutil
sys.path.insert(0, '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/tools')
import mx, mxkit as K
import numpy as np, cv2

S = K.S
WD = f'{S}/mx/r2'
SRC = f'{S}/src/pankti_raw.mp4'
OUT = f'{S}/mx/out'
SLUG = 'naira-morph-2-pankti-turn'
# HOOK=B builds the alternate opening with NO macro (the owner once sent a macro pull-back back): her real closed lid,
# then the drawer open. Only frames before T_B differ; everything after is the same picture and the same sound.
HOOK = os.environ.get('HOOK', 'A')
W, H = 1080, 1920
STEP = 1 / 18
# The plate samples a stepped frame's shutter CENTRED on the step's start time, so a move whose curve passes value i
# at t0 + (i - 1/2) STEP shows exactly the motion vals[i] -> vals[i+1] on step i (its blur matches that step's speed,
# and the incoming's first step blurs over its whole shutter, not half). Every made-move curve below starts at t0 - H2.
H2 = STEP / 2

# one decode of the whole clip, so frame k is source time k/30 for every layer (her edit has hard cuts at 0.367,
# 1.533, 3.300, 7.200, 9.033, ~11.00, 12.767, 13.700, 15.233, 17.667, 22.067, 27.867, 30.167: every live layer below
# stays inside one of her shots)
FR = mx.Frames(*mx.decode(SRC, 0, 31.6, 30, None, '', mx.PANKTI))
TRK = {n: {int(k): v for k, v in d.items()} for n, d in json.load(open(f'{WD}/tracks.json')).items()}

# ---- the big toggle ring, hand-fitted (outer edge; checked at 3x in look/c*.jpg and v2/chk*.jpg) ----
# R is the MAJOR semi-axis: the ring's true size whatever its tilt, so every context shows the same ring at the same
# size on screen (registration by centre + true radius). Only FRONTAL rings are used after the burst, so the outline
# itself matches swap to swap, not just its centre.
CTX = {  # name: (source s, cx, cy, R)
    'd25': (2.500, 518.5, 1330.0, 55.0),                         # drawer, the one velvet still (on the burst)
    'f196': (19.600, 516.0, 1081.0, 74.0), 'f1973': (19.733, 531.0, 1058.0, 73.0), 'f1987': (19.867, 578.0, 973.0, 73.5),
    'f200': (20.000, 558.0, 966.0, 74.0), 'f2027': (20.267, 590.0, 1069.0, 76.2), 'f204': (20.400, 599.5, 1055.5, 79.0),
}
CAP = {'d': 2.8, 'f': 1.6, 'w': 1.6, 'h': 1.5, 'c': 2.0, 'l': 3.0}   # the owner's punch-in caps (c: her face, eye good to 2x)


def smooth_track(name, ks=None, win=2, off=(0.0, 0.0)):
    """{frame: (x, y)} from a template track, moving-averaged over +-win frames (tmatch jitters by a pixel or two)"""
    d = TRK[name]; ks = sorted(d) if ks is None else ks
    xs = np.array([d[k][0] for k in ks]); ys = np.array([d[k][1] for k in ks])
    if win:
        w = np.ones(2 * win + 1) / (2 * win + 1)
        xs = np.convolve(np.pad(xs, win, mode='edge'), w, 'valid'); ys = np.convolve(np.pad(ys, win, mode='edge'), w, 'valid')
    return {k: (float(x + off[0]), float(y + off[1])) for k, x, y in zip(ks, xs, ys)}


def lookup(tr, k):
    ks = sorted(tr)
    k = min(max(k, ks[0]), ks[-1])
    if k in tr: return tr[k]
    a = max(x for x in ks if x <= k); b = min(x for x in ks if x >= k); u = (k - a) / max(1, b - a)
    return (tr[a][0] + (tr[b][0] - tr[a][0]) * u, tr[a][1] + (tr[b][1] - tr[a][1]) * u)


def steps_curve(t0, vals, mode='log'):
    """a value that is vals[i] at t0 + i*STEP, log-linear (scale) or linear (angle) inside each step, so each 18 fps
    step moves at its own constant speed and its blur matches that speed"""
    vals = np.asarray(vals, float)
    def f(t):
        i = (t - t0) / STEP
        if i <= 0: return float(vals[0])
        if i >= len(vals) - 1: return float(vals[-1])
        j = int(math.floor(i)); u = i - j
        if mode == 'log': return float(vals[j] * (vals[j + 1] / vals[j]) ** u)
        return float(vals[j] + (vals[j + 1] - vals[j]) * u)
    return f


P = mx.Plate(W, H, fps=30, shutter=.5)
LAYERS = {}                                                     # name -> (layer, cap kind) for the coverage check
def add(name, cap, **kw):
    L = P.layer(group=False, name=name, **kw); LAYERS[name] = (L, cap); return L


# =====================================================================================================================
# A. 0.000-0.611  HOOK: the drawer clasp opens SHARP at 2.8x cover on the big ring and pulls back expo-out at 18 fps.
#    Brand in frame 1 is the real box (the lid edge, then the NAIRA print arriving at the top).
# B. 0.611-1.450  HOLD on the open drawer, ring stabilised: BUY 2 . 10% OFF in ink on the blush lid.
#    (both kept as built: the critique's strongest beat)
# =====================================================================================================================
LX = 540.0                                                      # the ring's screen column for the whole reel
FADE = 4 / 30                                                   # every super fades in and out over 4 frames
T_B = 11 * STEP
T_HK = T_B if HOOK == 'A' else 10 / 30                          # where the drawer hold begins (hook B: sooner)
# Round 3: the offer super is big (58 px) and holds 0.96 s at full opacity, so the hold is longer, and it never
# slows her real action (round 2 played it at 0.55x on held frames, which judders). Her own gold band shows at the
# top edge before f62 and after f83 (v3/band.jpg), so the drawer is used only inside f63-f82: the pull-back lands on
# a TRUE STILL of f63 (2.10), the still holds while the offer arrives, then the drawer comes to life at 1.0x and
# native 30 fps (f63 -> f82) and runs straight into the series.
SUP_T0 = T_B + .05
SUP_T1 = SUP_T0 + 2 * FADE + .96
T_C = SUP_T1 + .03                                              # the series starts on the live f82
SUP_X, SUP_Y = 640, 548                                         # on the blush lid, under the print
K0, KB = 2.8, 1.40                                              # hook punch-in (drawer cap) -> the hold
PY0, PYB = 1020.0, 1165.0                                       # ring row: centre of frame -> lower, lid above it
rat = [1, 1, .80, .917, .932, .946, .957, .966, .977, .987, .996, 1.0]   # the reference's per-step pull-back scale,
cum = np.cumprod(rat); u = np.log(cum) / np.log(cum[-1])                # step 0 held sharp, then expo-out
kA = steps_curve(0, K0 * (KB / K0) ** u)
pyA = steps_curve(0, PY0 + (PYB - PY0) * u, 'lin')
TR_D = smooth_track('drawer', off=(0.0, 0.0))                   # track is already offset to the fitted ring centre at f75
D_K0, D_K1 = 63, 82                                             # 2.10 (best 2.10-2.50, crisp to 3x) -> 2.733
T_LIVE = T_C - (D_K1 - D_K0) / 30                               # the still comes to life here
# the ring's true centre drifts off the template (the pave link turns) as she tilts the box: hand-fitted at 3x on
# f75 / f82 / f84 (v3/ell2.jpg), blended in slowly so the hold's stabilisation never jumps
D_OFF = {75: (0.0, 0.0), 82: (-1.7, -7.8), 84: (-1.8, -6.2)}
R_D = 57.0                                                      # drawer ring major semi-axis at f82-f84 (aspect ~0.66)
def ring_d(k):
    x, y = lookup(TR_D, k); o = lookup(D_OFF, k); return x + o[0], y + o[1]

LA = add('drawer_live', 'd', src=FR, t0=0 if HOOK == 'A' else T_HK, t1=T_C + 2 * STEP, inp=D_K0 / 30 + .0001, speed=1)
LA.src_index = lambda t: D_K0 if t < T_LIVE else D_K0 + int(math.floor((t - T_LIVE) * 30 + 1e-4))
def cam_A(t):
    x, y = ring_d(LA.k_now if hasattr(LA, 'k_now') else D_K0)
    if t < T_C: k, py = (kA(t), pyA(t)) if (t < T_B and HOOK == 'A') else (KB, PYB)   # hook B: no pull-back at all
    else: k, py = R_ser(t) / R_D, LY_ser(t)                      # series steps 0-1: the same live drawer, growing
    return {'k': k, 'x': x / W, 'y': y / H, 'px': LX, 'py': py}
LA.camf = cam_A
def stepwin(t0, angles):
    """one 18 fps window per step, each with its own shutter: ~0.5 on ramp steps, 0.9 only beside a cut"""
    for i, ang in enumerate(angles): P.steps.append((t0 + i * STEP, t0 + (i + 1) * STEP, 18, ang))
# the pull-back: the first two fast steps blur (the hook starts at full speed), the decelerating tail at a half
# shutter lands sharp; then native 30 fps for the real hold
if HOOK == 'A':
    stepwin(0, [.5, .9, .7, .5, .5, .5, .5, .5, .5, .5, .5])
else:
    # hook B: her real closed toggle lid, f12-f21 (her shot 0.367-1.50) at 1.0x and native 30 fps, then her own jump
    # cut: the drawer is open (the f63 still). Her own rings sit just above the lid (on the hand holding it) and on her
    # lower hand (from f20), so the camera rides the print (two-point track, position only: the box keeps its own
    # tilt and her hands and the drawer tab move) at 1.85x with the print at y 680, which keeps both rings outside
    # the frame (v3/hookB_edges.jpg). 1.85x is over the 1.6 cap for skin; the foil print is crisp to 3x.
    LTB = {nm: {int(k): v for k, v in d.items()} for nm, d in json.load(open(f'{WD}/lidtrack.json')).items()}
    LB = add('lid_hook', 'l', src=FR, t0=0, t1=T_HK, inp=12 / 30 + .0001, speed=1)
    def cam_LB(t):
        k = min(max(LB.k_now if hasattr(LB, 'k_now') else 12, 12), 23); n, a = LTB['N'][k], LTB['A'][k]
        return {'k': 1.85, 'x': (n[0] + a[0]) / 2 / W, 'y': (n[1] + a[1]) / 2 / H, 'px': 540, 'py': 680}
    LB.camf = cam_LB

# =====================================================================================================================
# C. 1.450-2.228  RING-LOCKED GROWTH SERIES, ONE WAY. The ring never moves; the world around it changes one real
#    picture per 18 fps step, then on twos, and LANDS on her fingers turning it to the lens (20.40).
#    - The velvet appears once (the live drawer, then the 2.50 still on the first burst step) and the ground switches
#      to skin on the max-blur step, exactly once, as the reference switches its ground once under its heaviest blur.
#      The drawer never returns, so there is no velvet/skin strobe.
#    - After the switch every picture is a FRONTAL ring on her fingers (19.60-20.40), so the outline (not only the
#      centre) matches swap to swap. The tilted palm (an ellipse of aspect ~0.79 even at its most frontal, 14.53) and
#      the drawer ellipse (0.6) are not used after the burst.
#    - The target (20.40) flashes once mid-cycle, then the series slows to twos and lands on it (the reference's
#      coin cycle).
#    One continuous S-curve: R 77 -> 117 px with the burst on steps 1-3, while the ring rises 1165 -> 1060.
# =====================================================================================================================
growth = [1, 1.02, 1.08, 1.13, 1.07, 1.04, 1.02, 1.008, 1.003, 1.0, 1.0]
R_B = KB * R_D                                                  # the live drawer ring's size at the end of the hold
R_steps = R_B * np.cumprod(growth)
LY_LAND = 1060.0
ly_steps = PYB + (LY_LAND - PYB) * (np.log(R_steps / R_B) / np.log(R_steps[-1] / R_B))
R_ser = steps_curve(T_C - H2, R_steps)
LY_ser = steps_curve(T_C - H2, ly_steps, 'lin')
# steps 0-1 are the live drawer itself (no jump back in time); the ground switches to skin on step 2, the fastest
SERIES = ['f196', 'f1973', 'f204', 'f1987', 'f200', 'f200', 'f2027', 'f2027']   # step 2..
N_LAND = 4                                                      # the landing still, then real playback resumes
T_LAND = T_C + (2 + len(SERIES)) * STEP
T_D = T_LAND + N_LAND * STEP                                    # live fingers from here
stepwin(T_C, [.5, .6, .9, .5] + [.5] * (len(SERIES) - 2 + N_LAND))
SWAPS = [T_C + (2 + i) * STEP for i, nm in enumerate(SERIES) if i == 0 or nm != SERIES[i - 1]] + [T_LAND]

def still_cam(name):
    ts, cx, cy, R = CTX[name]
    return lambda t: {'k': R_ser(t) / R, 'x': cx / W, 'y': cy / H, 'px': LX, 'py': LY_ser(t)}
for i, name in enumerate(SERIES):
    t0 = T_C + (2 + i) * STEP
    add(f'ser{i}_{name}', name[0], src=FR, t0=t0, t1=t0 + STEP, freeze=int(round(CTX[name][0] * 30)), camf=still_cam(name))
add('land_f204', 'f', src=FR, t0=T_LAND, t1=T_D, freeze=612, camf=still_cam('f204'))

# =====================================================================================================================
# D. 2.228-3.228  REAL 20.40-21.40 at 30 fps: she turns the ring to face the lens; the ring stays locked on its point.
#    TOGGLE LINK CHAIN  999 (MRP 1,429 struck).
# E. 3.228-3.394  SPIN-WHIP seeded by her own flip: three 18 fps steps (21.40, 21.46, 21.51: on the third her ring
#    starts to turn) turn the stabilised frame CLOCKWISE about the ring, 3, 8, 16 degrees per step, and the ground
#    cuts skin -> ribbed tank on the max-blur step. The push (x1.19) is only what the turned frame needs to keep the
#    source under every corner (no mirrored edges); it also brings the ring to exactly the size the incoming ring has
#    on the cut (117 px), so the circle carries across at the same size and centre.
# =====================================================================================================================
K_LAND = R_steps[-1] / 79.0
T_E = T_D + (21.40 - 20.40)
ROT_IN = [3.0, 8.0, 16.0]
ZIN = [1.03, 1.06, 1.09]
T_CUT = T_E + len(ROT_IN) * STEP
rot_out = steps_curve(T_E - H2, np.concatenate([[0], np.cumsum(ROT_IN)]), 'lin')
zoom_out = steps_curve(T_E - H2, np.concatenate([[1], np.cumprod(ZIN)]))
# fingers ring: template track to 20.80 (f624); from 21.20 the ring is hand-fitted at 3x (v2/chk3.jpg), because the
# template (which holds the pave link too) drifts as she turns the ring; the two are joined by linear interpolation
TR_F = smooth_track('fingers', ks=list(range(588, 625)))
HANDFIT = {630: (584.0, 900.0), 636: (598.0, 962.0), 640: (575.0, 960.0), 642: (578.0, 968.0), 644: (562.0, 1002.0),
           645: (571.0, 1010.0), 646: (571.0, 1012.0)}
RF = {**TR_F, **HANDFIT}
def ring_f(k): return lookup(RF, k)
R_OUT_SRC = 67.0                                                # the ring's outer radius at 21.51 (f645), fitted

LD = add('fingers_live', 'f', src=FR, t0=T_D, t1=T_CUT, inp=20.40, speed=1)
def cam_D(t):
    x, y = ring_f(LD.k_now if hasattr(LD, 'k_now') else 612)
    return {'k': K_LAND * zoom_out(t), 'x': x / W, 'y': y / H, 'px': LX, 'py': LY_LAND, 'r': rot_out(t)}
LD.camf = cam_D
stepwin(T_E, [.5, .5, .9])                                       # the ramp at a half shutter; full only on the cut step

# =====================================================================================================================
# F. 3.394-4.294  SPIN LANDS on the worn necklace (24.40-25.30). The incoming frame is already turning on the cut step
#    (24 degrees inside that step, the max-blur frame), then 6, 1.5, 0: sharp by the fourth step. It arrives with its
#    ring at the outgoing ring's size (k 2.87 -> 2.75 inside the cut step; this is over the 1.6 cap only on the two
#    rotation-blurred frames) and pulls back to rest at 1.55 in two more steps (a zoom-through out: the spin lands).
#    24.40-25.30 is one continuous take, sharp from 24.43, so the hair swish at 25.07 needs no extra cut.
# =====================================================================================================================
TR_W0 = smooth_track('worn')
offW = (573.0 - TR_W0[752][0], 1216.0 - TR_W0[752][1])           # hand-fitted ring centre at 25.067 (look/c7.jpg)
TR_W = smooth_track('worn', off=offW)
R_W_SRC = 41.0                                                   # worn ring outer radius (v2/chkw.jpg)
K_W = 1.55
# sizes are matched on the frames' CENTRE poses (each stepped frame is sampled about the middle of its step)
R_CUT = R_OUT_SRC * K_LAND * math.sqrt(float(np.prod(ZIN[:-1])) * float(np.prod(ZIN)))   # outgoing ring, last step
K_IN0 = R_CUT / (R_W_SRC * math.sqrt(.958))                      # incoming ring on the cut step = R_CUT
# Round 3: the size change (the outgoing ring is ~110 px, the worn one rests at 64) used to land in ONE x0.62 step at
# a full shutter, a radial starburst on two frames. It is now spread over two x0.76 / x0.80 steps at a 0.45 shutter:
# a fast pull you can see through, sharp by the next step.
LAND_K = [K_IN0, K_IN0 * .958, K_IN0 * .958 * .76, 1.62, K_W]     # per step boundary: cut step, then the pull
LAND_R = [-(24 + 6 + 1.5), -(6 + 1.5), -1.5, 0.0, 0.0]           # degrees clockwise, decaying to rest
rot_in = steps_curve(T_CUT - H2, LAND_R, 'lin')
zoom_in = steps_curve(T_CUT - H2, LAND_K)
WORN_INP = 24.40
T_H = T_CUT + (25.300 - WORN_INP)                                # cut after f758 (25.267), the hair at its widest
# her hair crosses only the right third with the ring centred, so the camera whips the way the hair moves (right
# to left, expo-in) and cuts on the fastest frame: the hair swish becomes the leading edge of a real-looking pan.
# Three steps only (6, 18, 210 px), the first two at a half shutter: blur on the cut step only.
HAIR_OUT = [0, -6, -24, -234]
T_HW = T_H - (len(HAIR_OUT) - 1) * STEP
worn_dx = steps_curve(T_HW - H2, HAIR_OUT, 'lin')
worn_wz = steps_curve(T_HW - H2, [1, 1.02, 1.07, 1.18])
LW = add('worn', 'w', src=FR, t0=T_CUT, t1=T_H, inp=WORN_INP, speed=1)
def cam_W(t):
    x, y = lookup(TR_W, LW.k_now if hasattr(LW, 'k_now') else 732)
    return {'k': zoom_in(t) * worn_wz(t), 'x': x / W, 'y': y / H, 'px': LX + worn_dx(t), 'py': LY_LAND, 'r': rot_in(t)}
LW.camf = cam_W
stepwin(T_CUT, [.9, .45, .45, .45])
stepwin(T_HW, [.4, .5, .9])

# =====================================================================================================================
# H. 4.294-5.305  HAIR WIPE -> EAR: the huggie lands on the screen point the ring held, still carrying the whip's
#    leftward motion for two steps on a held SHARP frame (11.867; the huggie is sharp from 11.83, her hand blur ends),
#    then her real 11.867-12.733 at 30 fps. BRUSHED GOLD HUGGIES 699 (MRP 879). 1.35x (softer and the helix studs
#    larger past that; it also keeps the price clear of her helix).
# =====================================================================================================================
TR_E = smooth_track('ear', off=(-10.0, 3.0))                     # the huggie itself sits 10 px left of the lobe template
K_E = 1.36
EAR_K0 = 356                                                      # 11.867
SETTLE = [170, 8, 0]
SETTLE_Z = [1.10, 1.005, 1.0]
T_EP = T_H + (len(SETTLE) - 1) * STEP                             # real playback starts here
EAR_FREEZE = .20                                                  # f382 held still, so the price reads ~0.75 s at full opacity
T_I = T_EP + (382 - EAR_K0 + 1) / 30 + EAR_FREEZE                 # through 12.733 (f382); her cut is at 12.767
PULL = [1, .978]                                                  # one step of pull-out into the cut (x0.84 on the cut)
T_I0 = T_I - (len(PULL) - 1) * STEP
ear_dx = steps_curve(T_H - H2, SETTLE, 'lin')
ear_sz = steps_curve(T_H - H2, SETTLE_Z)
ear_z = steps_curve(T_I0 - H2, PULL)
LE = add('ear', 'h', src=FR, t0=T_H, t1=T_I, inp=EAR_K0 / 30 + .0001, speed=1)
_ear_idx = LE.src_index
LE.src_index = lambda t: EAR_K0 if t < T_EP else min(382, EAR_K0 + int(math.floor((t - T_EP) * 30 + 1e-4)))
def cam_E(t):
    x, y = lookup(TR_E, LE.k_now if hasattr(LE, 'k_now') else EAR_K0)
    return {'k': K_E * ear_z(t) * ear_sz(t), 'x': x / W, 'y': y / H, 'px': LX + ear_dx(t), 'py': LY_LAND}
LE.camf = cam_E
stepwin(T_H, [.9, .45])
P.steps.append((T_I0, T_I, 18, .9))

# =====================================================================================================================
# I. 5.305-5.583  PULL-OUT: cut on the fastest frame from the ear huggie to the same huggie in her eyes-to-lens shot,
#    on a FROZEN sharp frame (28.333: eyes to the lens, lips closed, her hand gone), pulling back expo-out in five
#    steps (blur on the first two) into her natural framing.
# J. 5.583-6.386  HOLD: her real 28.333-28.633 at 30 fps (lips closed, no hand), then its last frame held.
#    BOTH · BUY 2  1,528 (1,698 struck) as ONE line on the wall and hair above her head, off her face.
# K. 6.386-6.608  ZOOM-THROUGH IN: a four-step expo-in push into the huggie (x1.03, 1.10, 1.25, 1.52), carrying it to
#    the screen point where the lid's flower-I will land; cut on the fastest step.
# =====================================================================================================================
TR_FC0 = smooth_track('face')
HUG_F = (280.0, 646.0)                                            # huggie centre at 28.333 (f850), v2/hugf.jpg
offF = (HUG_F[0] - TR_FC0[850][0], HUG_F[1] - TR_FC0[850][1])
TR_FC = smooth_track('face', off=offF)
R_HUG_EAR, R_HUG_FACE = 46.0, 20.0                                # huggie half-widths (v2/hugs.jpg, v2/hugf.jpg)
# Both face moves are PURE ZOOMS about one fixed canvas point (a dolly with a fixed centre: every point moves on a
# straight line toward or away from it, and the source covers the canvas at any k >= 1, so nothing slides sideways
# and nothing is mirrored). The fixed point is solved so the huggie sits exactly on the anchor at the cut frame.
#   pull-out: the cut step itself moves only x0.94 (the huggie-on-huggie lock reads), then ONE fast step (.58) carries
#   most of the scale, .955 and .995 settle it; a half shutter, so her face is smeared on two frames, not a run
ratF = [.94, .49, .955, .995]
K_F1 = 1.0
cF = np.concatenate([[1], np.cumprod(ratF)]); cF = cF / cF[-1]   # k at each step boundary, landing exactly on 1.0
face_k = steps_curve(T_I - H2, K_F1 * cF)
K_FC = K_F1 * cF[0] * math.sqrt(ratF[0])                          # the cut frame's centre pose
HUG_P = lookup(TR_FC, 851)                                        # the huggie on the frozen pull-out frame
PF = ((K_FC * HUG_P[0] - LX) / (K_FC - 1), (K_FC * HUG_P[1] - LY_LAND) / (K_FC - 1))   # fixed point of the pull
FACE_K0, FACE_K1 = 851, 859                                       # 28.367 -> 28.633: her hand is out of frame (in at f850 and
# f860, v3/face_left.jpg), lips closed
T_J = T_I + len(ratF) * STEP
FACE_FREEZE = .80                                                 # a still face, so the deal reads for ~0.8 s at full opacity
T_K0 = T_J + (FACE_K1 - FACE_K0 + 1) / 30 + FACE_FREEZE           # push starts
#   zoom-through in: three steps, x1.03, 1.10, 1.88 (the last is the cut: blur peaks there, and only there)
PUSH = [1, 1.03, 1.10, 1.88]
T_LID = T_K0 + (len(PUSH) - 1) * STEP
push_k = steps_curve(T_K0 - H2, np.cumprod(PUSH))
K_PUSH = float(np.prod(PUSH))
LF = add('face', 'c', src=FR, t0=T_I, t1=T_LID, inp=FACE_K0 / 30 + .0001, speed=1)
LF.src_index = lambda t: FACE_K0 if t < T_J else min(FACE_K1, FACE_K0 + int(math.floor((t - T_J) * 30 + 1e-4)))
HUG_PUSH = lookup(TR_FC, FACE_K1)                                 # the huggie on the held last frame
def cam_F(t):
    # k = 1 is her natural framing (source = canvas). canvas = P + k (src - P) for the fixed point P, i.e. the source
    # point P sits at canvas P. The real playback between the moves is unstabilised (natural framing).
    if t < T_K0: k, Pp = face_k(t), PF
    else: k, Pp = push_k(t), PP
    return {'k': k, 'x': Pp[0] / W, 'y': Pp[1] / H, 'px': Pp[0], 'py': Pp[1]}
LF.camf = cam_F
P.steps.append((T_I, T_J, 18, .5))
P.steps.append((T_K0, T_LID, 18, .75))

# =====================================================================================================================
# L. 6.608-7.010  The lid (0.40-0.70) EMERGES from the zoom-through at 1.4x its rest size, centred on the flower-I,
#    and pulls back in two steps to the NAIRA print locked by a two-point track (N and last A: position, angle,
#    scale) exactly where the vector logo will sit; then the print dissolves into the vector logo on the ivory card.
#    That dissolve is the only one in the reel (it lands on our own art).
# =====================================================================================================================
LT = {nm: {int(k): v for k, v in d.items()} for nm, d in json.load(open(f'{WD}/lidtrack.json')).items()}
LID_REF = 20
# Round 3: the logo (and so the locked lid print) sits higher and a touch larger, so her own gold band, which rests
# above the lid's top edge, is out of the frame for the whole lid hold (v3/lidtop.jpg)
LOGO_W, LOGO_Y = 720, 548                                         # bigger than the kit's 560 so the locked lid fills the frame
# print-over-logo registration, re-measured on letter boxes (v2/lidreg): the critique found the print 12 px high
# the print's N-A midpoint sits at logo-relative (0.4946, 0.1091) x LOGO_W: measured on letter boxes at 680/680 (v2/lidreg)
LID_S, LID_T = 1.285 * LOGO_W / 560, ((W - LOGO_W) / 2 + .4946 * LOGO_W, LOGO_Y + .1091 * LOGO_W)
LID_ROT = 0.7                                                     # the two-point track leaves the print 0.7 deg anticlockwise
# the push's fixed point: the held frame's huggie lands on the lid's flower-I point at K_PUSH
PP = ((K_PUSH * HUG_PUSH[0] - LID_T[0]) / (K_PUSH - 1), (K_PUSH * HUG_PUSH[1] - LID_T[1]) / (K_PUSH - 1))
def lid_pose(k):
    k = min(max(k, 12), 23); n, a = LT['N'][k], LT['A'][k]
    m = ((n[0] + a[0]) / 2, (n[1] + a[1]) / 2)
    ang = math.degrees(math.atan2(a[1] - n[1], a[0] - n[0])); d = math.hypot(a[0] - n[0], a[1] - n[1])
    return m, ang, d
_, _, D_REF = lid_pose(LID_REF)
LID_Z = [1.25, 1.03, 1.0]                                  # emerges big, pulls back (blur on the first step)
lid_z = steps_curve(T_LID - H2, LID_Z)
LID_INP, LID_SPEED = 21 / 30 + .0001, 1.0                         # a TRUE still of f21 (round 2 ran 0.75x held frames)
T_DIS = T_LID + 0.40
LL = add('lid', 'l', src=FR, t0=T_LID, t1=99, inp=LID_INP, speed=LID_SPEED)
def cam_L(t):
    k = LL.k_now if hasattr(LL, 'k_now') else 12
    m, ang, d = lid_pose(k)
    return {'k': LID_S * D_REF / d * lid_z(t), 'x': m[0] / W, 'y': m[1] / H, 'px': LID_T[0], 'py': LID_T[1], 'r': -ang + LID_ROT}
LL.camf = cam_L
P.steps.append((T_LID, T_LID + (len(LID_Z) - 1) * STEP, 18, .9))
_src_index = LL.src_index
LL.src_index = lambda t: min(_src_index(t), 21)                   # the print holds still while it becomes the logo

CARD_LINES_AT, CARD_GAP = .30, .06                                # card lines start as the dissolve ends, quickly
CARD_HOLD = 1.00                                                  # the COMPLETE card holds this long (card ~1.5 s after the dissolve)
def card_lines():
    """the kit's card lines with a direct ask (SHOP THE PAIR) set above the address"""
    L = [list(x) for x in K.ladder_lines()]
    return [tuple(x) for x in L[:-1]] + [('SHOP THE PAIR', 'jost', 24, K.INK, 14)] + [tuple(L[-1])]
N_CARD = len(card_lines())
DUR = math.ceil((T_DIS + CARD_LINES_AT + CARD_GAP * (N_CARD - 1) + .30 + CARD_HOLD) * 30) / 30   # whole frames
def endcard(t0, t1, fade=.45):
    """the kit's card (ivory ground, sage NAIRA with the blush flower, the ladder one rung per line, the facts), with
    its lines held back until the print-to-logo dissolve has finished"""
    g = np.zeros((H, W, 4), np.uint8); g[..., :3] = K.IVORY; g[..., 3] = 255
    P.overlay(g, 0, 0, t0, t1, fin=fade, fout=0, rise=0)
    Lg = K.logo(LOGO_W); P.overlay(Lg, (W - LOGO_W) / 2, LOGO_Y, t0, t1, fin=fade, fout=0, rise=0)
    y = LOGO_Y + Lg.shape[0] + 62
    for i, (s_, kind, size, col, gap) in enumerate(card_lines()):
        tp = K.text(s_, kind, size, 500, .22 if kind == 'jost' else 0, color=col, shadow=0)
        K.place(P, (tp[0], tp[1]), W / 2, y, t0 + CARD_LINES_AT + CARD_GAP * i, t1, fin=.3, fout=0, rise=8)
        y += size + gap
    return y
CARD_BOTTOM = endcard(T_DIS, DUR + 1)

# =====================================================================================================================
# TYPE: one line (or one price) per hold, Jost caps / Cormorant price, never over a move
# =====================================================================================================================
K.super_line(P, 'BUY 2  ·  10% OFF', SUP_T0, SUP_T1, y=SUP_Y, size=58, cx=SUP_X, color=K.INK, shadow=.30, fin=FADE, fout=FADE, rise=6)
def price_block(name, price, mrp, t0, t1, y, color=K.IVORY, shadow=.5, cx=540, **kw):
    """the kit's price line one step larger (it is read on a phone held at arm's length, over skin): PIECE NAME in
    tracked Jost caps over a Cormorant price with the MRP struck through"""
    dim = (238, 229, 220) if sum(color) > 380 else (110, 100, 94)
    a = K.text(name.upper(), 'jost', 31, 500, .24, color=color, shadow=shadow)
    p = K.text(K.rs(price), 'cg', 72, 500, 0, color=color, shadow=shadow)
    m = K.strike(K.text(K.rs(mrp), 'cg', 46, 500, 0, color=dim, shadow=shadow))
    return K.place(P, K.stack([a, K.hrow([p, m], gap=20)], gap=14), cx, y, t0, t1, **kw)
def deal_line(label, sub, tot, t0, t1, y, color=K.IVORY, shadow=.62, cx=540, **kw):
    """the deal as ONE line that reads as a SUM: BOTH · BUY 2, the two pieces' prices added (not struck: a struck
    price would claim an MRP), an arrow, and what the bag charges"""
    dim = (238, 229, 220)
    a = K.text(label, 'jost', 30, 500, .24, color=color, shadow=shadow)
    m = K.text(K.rs(sub), 'cg', 50, 500, 0, color=dim, shadow=shadow)
    r = K.text('\u2192', 'cg', 46, 500, 0, color=dim, shadow=shadow)
    p = K.text(K.rs(tot), 'cg', 66, 500, 0, color=color, shadow=shadow)
    return K.place(P, K.hrow([a, m, r, p], gap=20), cx, y, t0, t1, **kw)
TOG = K.OFFER['prices']['toggle-link-chain']; HUG = K.OFFER['prices']['brushed-gold-huggies']
SUB, TOT, RATE = K.bag_total(['toggle-link-chain', 'brushed-gold-huggies'])
price_block('Toggle Link Chain', TOG[0], TOG[1], T_D + .06, T_E - .04, y=560, fin=FADE, fout=FADE)
price_block('Brushed Gold Huggies', HUG[0], HUG[1], T_H + .13, T_I0 - .02, y=278, fin=FADE, fout=FADE)
DEAL_Y = 282
deal_line('BOTH  ·  BUY 2', SUB, TOT, T_J + .03, T_K0 - .03, y=DEAL_Y, fin=FADE, fout=FADE)


def check(layers=None):
    """for every output frame and shutter sample: where the canvas corners land in the source (a corner outside the
    source would show BORDER_REFLECT mirroring) and the punch-in k against the owner's caps"""
    bad = []
    for name, (L, cap) in LAYERS.items():
        if layers and name not in layers: continue
        n0, n1 = int(math.ceil(L.t0 * 30 - 1e-6)), int(math.ceil(min(L.t1, DUR) * 30 - 1e-6))
        worst, kmax, kmin = 0.0, 0.0, 99.0
        for n in range(n0, n1):
            tq, sh = P.clock(n / 30)
            if tq < L.t0 or tq >= L.t1: continue
            L.k_now = L.src_index(tq)
            for tt in np.linspace(tq - sh / 2, tq + sh / 2, 5):
                M = L.matrix(tt); Mi = np.linalg.inv(M)
                c = Mi @ np.array([[0, W, 0, W], [0, 0, H, H], [1, 1, 1, 1]], float)
                over = max(0, -c[0].min(), c[0].max() - 1080, -c[1].min(), c[1].max() - 1920)
                worst = max(worst, over)
                if VERBOSE and over > .5: print(f'   {name} frame {n} t {tq:.3f} over {over:.0f} corners x {c[0].round()} y {c[1].round()}')
            if not any(a <= tq < b for a, b in BLUR_WINDOWS):     # whip frames are motion-blurred, not punch-ins
                k = math.sqrt(abs(np.linalg.det(L.matrix(tq)[:2, :2]))); kmax = max(kmax, k); kmin = min(kmin, k)
        flag = ('  OUTSIDE %.0f px' % worst if worst > .5 else '') + ('  OVER CAP' if cap and kmax > CAP[cap] + 1e-3 else '')
        print(f'{name:16s} t {L.t0:6.3f}-{L.t1:6.3f}  k {kmin:.2f}-{kmax:.2f} cap {CAP.get(cap, 0):.1f}{flag}')
        if flag: bad.append(name)
    return bad


def sheet(d, out, frames=None, cols=10, w=162):
    from PIL import Image, ImageDraw
    fs = sorted(f for f in os.listdir(d) if f.startswith('f_') and f.endswith('.jpg'))
    if frames is not None: fs = [f'f_{i + 1:04d}.jpg' for i in frames if os.path.exists(f'{d}/f_{i + 1:04d}.jpg')]
    ims = []
    for f in fs:
        i = int(f[2:6]) - 1; im = Image.open(f'{d}/{f}'); im = im.resize((w, int(im.height * w / im.width)))
        ImageDraw.Draw(im).text((3, 3), f'{i / 30:.2f} #{i}', fill=(255, 255, 0)); ims.append(im)
    rows = math.ceil(len(ims) / cols); h = ims[0].height
    Sh = Image.new('RGB', (cols * w, rows * h), (20, 20, 20))
    for j, im in enumerate(ims): Sh.paste(im, ((j % cols) * w, (j // cols) * h))
    Sh.save(out, quality=90)


VERBOSE = os.environ.get('VERBOSE')
# frames that are motion-blurred by a camera move (excluded from the punch-in cap check; the blur hides the softness)
BLUR_WINDOWS = [(T_E, T_CUT), (T_CUT, T_CUT + 3 * STEP), (T_HW, T_H), (T_H, T_H + STEP), (T_I, T_I + 3 * STEP),
                (T_K0 + 2 * STEP, T_LID + STEP)]
def mix(out_wav):
    """three kinds of sound only: the beatless string pad, soft felt taps (one per swap of the ring series), and a
    sub-only whoosh (all energy under 400 Hz) peaking on the fastest frame of each move. No tings, no song."""
    m = K.Mix(DUR)
    m.pad([(0.0, [47, 54, 59, 62, 66]),                         # B minor: the hero film's key, under the box
           (T_CUT - .3, [50, 57, 62, 64, 66]),                  # D add9 as the spin lands on her neck
           (T_I - .2, [43, 50, 59, 62, 66]),                     # G maj7 under the face
           (T_DIS + .1, [50, 57, 62, 66, 69])])                  # home to D on the card
    if HOOK == 'A': m.subwhoosh(0.0, .11, tail=.55, v=.28)        # the hook pull-back starts at full speed
    else: m.put(m.fx, K.lp(m._felt(.95, seed=40), 2500, 2) * 10 ** (-3 / 20), math.ceil(T_HK * 30 - 1e-6) / 30)   # the drawer pops
    # the series: exactly one tap on each picture change, none before the first swap; low-passed at 2.5 kHz and 3 dB
    # down so a phone speaker (which lifts 1-5 kHz) hears felt, not a tick. Taps land on the frame the picture shows.
    for i, t in enumerate(SWAPS):
        tf = math.ceil(t * 30 - 1e-6) / 30
        m.put(m.fx, K.lp(m._felt(.95 - .04 * i, seed=i), 2500, 2) * 10 ** (-3 / 20), tf)
    m.subwhoosh(T_E, T_CUT, tail=.45, v=.60)                     # the spin, peak on the max-blur cut
    m.subwhoosh(T_HW, T_H, tail=.35, v=.32)                      # her hair whip
    m.subwhoosh(T_K0 - .05, T_LID - .05, tail=.40, v=.40)        # the zoom-through into the lid (envelope lags ~2 frames)
    m.duck += [(T_E - .7, T_E - .05, -4.0), (T_K0 - .5, T_K0 - .05, -3.0)]   # a breath before each big move
    return m.master(out_wav)


def times():
    return {n: round(v, 3) for n, v in dict(T_B=T_B, T_C=T_C, T_LAND=T_LAND, T_D=T_D, T_E=T_E, T_CUT=T_CUT, T_HW=T_HW, T_H=T_H,
                                              T_EP=T_EP, T_I0=T_I0, T_I=T_I, T_J=T_J, T_K0=T_K0, T_LID=T_LID, T_DIS=T_DIS, DUR=DUR).items()}


if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'check'
    print(times(), 'R_CUT %.1f K_IN0 %.2f K_FC %.2f K_PUSH %.2f PF %s PP %s card bottom %d' % (R_CUT, K_IN0, K_FC, K_PUSH, PF, PP, CARD_BOTTOM))
    if mode == 'part':
        a, b = int(sys.argv[2]), int(sys.argv[3])
        d = f'{WD}/part'; shutil.rmtree(d, ignore_errors=True)
        P.render(d, DUR, start=a, stop=b, workers=int(os.environ.get("WK", 2)))
        fs = sorted(f for f in os.listdir(d) if f.endswith('.jpg'))
        print('rendered', len(fs))
        sheet(d, f'{WD}/look/part_{a}_{b}.jpg', cols=int(sys.argv[4]) if len(sys.argv) > 4 else 10)
    if mode == 'frames':                                          # a few single frames, for type and anchor checks
        os.makedirs(f'{WD}/one', exist_ok=True)
        for a in sys.argv[2:]:
            i = int(a); img = P.frame(i / 30)
            cv2.imwrite(f'{WD}/one/f_{i + 1:04d}.jpg', cv2.cvtColor((img * 255 + .5).astype(np.uint8), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 95])
    if mode == 'hookb':                                           # HOOK=B: the no-macro opening, the rest copied from final/
        assert HOOK == 'B'
        N = int(round(DUR * 30)); d = f'{WD}/finalB'; shutil.rmtree(d, ignore_errors=True)
        nb = int(math.ceil(T_B * 30 - 1e-6)) + 1                  # every frame up to the end of hook A's pull-back
        P.render(d, DUR, start=0, stop=nb, workers=int(os.environ.get('WK', 2)))
        for i in range(nb, N): shutil.copy(f'{WD}/final/f_{i + 1:04d}.jpg', f'{d}/f_{i + 1:04d}.jpg')
        wav = f'{WD}/{SLUG}-hookB.wav'; print('mix', mix(wav))
        K.encode(d, wav, f'{OUT}/{SLUG}-hookB.mp4'); K.encode(d, wav, f'{OUT}/{SLUG}-hookB-4x5.mp4', crop45=True)
        for fn in (f'{OUT}/{SLUG}-hookB.mp4', f'{OUT}/{SLUG}-hookB-4x5.mp4'): print(fn, K.probe(fn))
        sheet(d, f'{WD}/sheet_hookB.jpg', frames=list(range(0, 64)), cols=8, w=162)
    if mode == 'check':
        print('bad', check())
    if mode == 'sheets':                                          # transition sheets from an existing final render
        mode = 'full'; SHEETS_ONLY = True
    else: SHEETS_ONLY = False
    if mode == 'full':
        N = int(round(DUR * 30)); d = f'{WD}/final'
        if not SHEETS_ONLY:
            shutil.rmtree(d, ignore_errors=True)
            P.render(d, DUR, workers=int(os.environ.get('WK', 2)))
            wav = f'{WD}/{SLUG}.wav'; print('mix', mix(wav))
            os.makedirs(OUT, exist_ok=True)
            K.encode(d, wav, f'{OUT}/{SLUG}.mp4'); K.encode(d, wav, f'{OUT}/{SLUG}-4x5.mp4', crop45=True)
            for fn in (f'{OUT}/{SLUG}.mp4', f'{OUT}/{SLUG}-4x5.mp4'): print(fn, K.probe(fn))
        sheet(d, f'{OUT}/{SLUG}-sheet.jpg', frames=list(range(0, N, 10)), cols=10, w=162)
        f = lambda t: int(round(t * 30))
        TS = {'1-hook-pullback': (0, f(T_B) + 6), '2-ring-series': (f(T_C) - 4, f(T_D) + 8), '3-spin': (f(T_E) - 4, f(T_CUT) + 14),
              '4-hair-whip': (f(T_HW) - 4, f(T_EP) + 8), '5-pullout-face': (f(T_I) - 6, f(T_J) + 6),
              '6-zoomthrough-lid-logo': (f(T_K0) - 4, f(T_DIS) + 24)}
        for nm, (a, b) in TS.items():
            sheet(d, f'{WD}/sheet_{nm}.jpg', frames=list(range(a, b)), cols=10, w=162)
        sheet(d, f'{WD}/sheet_45check.jpg', frames=[f(1.0), f(T_D + .5), f(T_CUT + .5), f(T_EP + .5), f(T_J + .4), f(T_LID + .3), N - 1], cols=7, w=240)
        print('frames', N)
