"""Reel 3 - Sonal - "The hoop never moves". Lead device: a hoop-locked substitution cycle.  (round 2)

Every pixel is a real Kinn Films frame (720x1280, raw, never 8BB38387 or grwm.mp4) or our own type/logo.
The Woven Gold Hoop holds ONE screen point (P0) while her looks swap around it; it leaves that point only through made
moves (her spin, a pull-back relay into her real turn) and comes back to it for the last held look.

Round-2 changes against the critique (see the return notes for the full list):
- the cycle uses only hand-free frames, ordered by head turn (frontal -> over the shoulder), white wall first and the
  curtain after one switch, picture rate 15/s -> 10/s -> 7.5/s -> 6/s, opening at x1.25 (hoop ~145 px on frame 1);
- brand + offer on the first hold (sage NAIRA over the name and price) by 1.0 s;
- holds are real 1.0x playback or true stills, never held-frame slow motion;
- every made move is short (3-6 steps) with the shutter open only on its peak steps; the soft-frame count is measured;
- the arbitrary hand-wipe cut is replaced by a hoop-on-hoop pull-back relay into her real turn;
- the 2x zoom-through is replaced by a cut on her real turn (x1.2 push) back to the pin;
- the closing look is hand-free (398F 8.10) and carries the ladder, so the deal is complete before the card.

Run:  python3.13 -I build.py frames A B   (render frames A..B-1 into r3/part)
      python3.13 -I build.py full          (render all, mix, encode both shapes, sheets, probe)
      python3.13 -I build.py check         (border/coverage check of every layer on every frame, no render)
"""
import sys, os, math, json, shutil
R3 = '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/r3'
sys.path.insert(0, '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/tools'); sys.path.insert(0, R3)
sys.path.append("/root/.local/lib/python3.13/site-packages")
import numpy as np, cv2
import mx, mxkit as K, track as TR
from look import frames, src

S = K.S
OUT = f'{S}/mx/out'; SLUG = 'naira-morph-3-sonal-hoop'
W, H, FPS = 1080, 1920, 30
STEP = 1 / 18
SW, SH = 720, 1280
COVER = max(W / SW, H / SH)                      # 1.5: k of a plain full-frame framing
P = mx.Plate(W, H, fps=FPS, shutter=.5)
EPS = 1e-6
F_ = lambda n: n / FPS                            # output frame n -> seconds

# The pin. Her eyes sit 230-330 source px up-right of the hoop, so the hoop sits low-left and the face reads in both
# the 9:16 and the 4:5 (y 230-1580). Every pinned picture is checked for coverage (no mirrored border) by `check`.
P0 = (232.0, 1010.0)
# 116 px of loop at rest: the side-on X (40 px) at gs 1.03 is then k 2.99, inside the 2.0x-cover cap (k 3.0)
HOOP = 116.0


def still(cid, t):
    return frames(cid, t, t + .05)              # index 0 is the very frame the anchor was measured on


def ref_index(F, img, n=8):
    """the index in a layer's decode whose picture IS the measured still (decode starts can differ by a frame)"""
    d = [np.abs(F.get(k).astype(np.int16) - img.astype(np.int16)).mean() for k in range(min(n, F.n))]
    k = int(np.argmin(d)); assert d[k] < 1.0, ('measured frame not found in decode', d)
    return k


def ref_index_from(F, img, k0, n=8):
    d = [np.abs(F.get(k).astype(np.int16) - img.astype(np.int16)).mean() for k in range(k0, min(k0 + n, F.n))]
    k = int(np.argmin(d)); assert d[k] < 1.0, ('measured frame not found in decode', d)
    return k


def tracked(F, kref, c, half=(26, 30), smooth=1, ks=None):
    """sub-pixel NCC track of the hoop from the measured frame, as offsets from the measured centre"""
    b = [c[0] - half[0], c[1] - half[1], c[0] + half[0], c[1] + half[1]]
    hi = F.n if ks is None else ks[1]; lo = 0 if ks is None else ks[0]
    tr = TR.tmatch(F, kref, b, range(kref, hi), search=1.8, scale=1.0)
    tr.update(TR.tmatch(F, kref, b, range(kref, lo - 1, -1), search=1.8, scale=1.0))
    k_ = sorted(tr); xs = np.array([tr[k][0] for k in k_]); ys = np.array([tr[k][1] for k in k_])
    if smooth and len(k_) > 2:
        w = np.ones(2 * smooth + 1) / (2 * smooth + 1)
        xs = np.convolve(np.pad(xs, smooth, mode='edge'), w, 'valid'); ys = np.convolve(np.pad(ys, smooth, mode='edge'), w, 'valid')
    i0 = k_.index(kref); x0, y0 = xs[i0], ys[i0]
    return {k: (xs[i] - x0, ys[i] - y0, tr[k][2]) for i, k in enumerate(k_)}


def ladder(t, t0, cum, dt=STEP):
    """piecewise-linear over 18 fps steps from t0 (constant speed inside each step, so each step blurs at its own speed)"""
    j = (t - t0) / dt
    if j <= 0: return cum[0]
    if j >= len(cum) - 1: return cum[-1]
    i = int(math.floor(j)); f = j - i
    return cum[i] + (cum[i + 1] - cum[i]) * f


def lerp(a, b, w): return a + (b - a) * w


# =====================================================================================================================
# 1. THE CYCLE (frames 0-26): 10 real pictures, the hoop pinned on P0. Anchors (loop centre, loop height, post excluded)
#    were measured by hand on 4-5x crops (look/m4_*.jpg, v2/m3.jpg) and refined by canvas-space overlay NCC against an
#    already validated neighbour (v2/ana.py -> v2/anchors.json; red/cyan overlays v2/ana.jpg).
#    Every picture is hand-free, eyes open to the lens: 267E 0.10 (the fist with the unlisted ring enters at 0.167),
#    6237 0.0, E3C6 10.2, 398F 8.10 (the ring hand enters at 8.2), 212E 18.6, 041F 8.65.
CYC = {
    'A': ('267E722A', .10, (160.0, 670.0), 69.6),     # hair up, frontal, white wall (eye-line 24 deg from the hoop)
    'C': ('62379666', 0.00, (194.0, 602.0), 58.9),    # hair down, frontal, wall (25 deg)
    'X': ('E3C6EA7D', 10.20, (273.0, 565.0), 40.0),   # hair up, turning over the shoulder, wall + curtain (40 deg)
    'B': ('398F157B', 8.10, (305.0, 605.5), 49.8),    # hair down, over the shoulder (46 deg)
    'N': ('212E5E27', 18.60, (232.3, 631.5), 45.7),   # hair down, over the shoulder, curtain (49 deg)
    'G': ('041FCDC6', 8.65, (248.0, 669.0), 61.0),    # the landing's own take a beat later (49.5 deg)
}
L_ = ('041FCDC6', 8.35, (252.0, 636.0), 58.0)         # the landing (48 deg)
# Picture order follows her head turning from frontal to over the shoulder, so the face travels one way into the landing
# instead of flickering. The ground changes once (white wall -> curtain) at X, which shows both. Hair up/down alternates
# in the fast singles: that is the look swap. Durations in output frames: 15/s singles, then 10/s, 7.5/s, 6/s.
ORDER = [('A', 2), ('C', 2), ('A', 2), ('C', 2), ('A', 2), ('C', 2), ('X', 3), ('B', 3), ('N', 4), ('G', 5)]
CYC_STARTS = list(np.cumsum([0] + [n for _, n in ORDER]))
N_CYC = CYC_STARTS[-1]; T_L = F_(N_CYC)               # 27 frames: the landing at 0.900 s

# One continuous camera for the cycle: an x1.25 pull-back on the reference's expo-out profile (per-step scale 0.80,
# 0.917 ... 1.0), finished by frame 18 so the side-on X never exceeds the cap. It is STEPPED with the pictures (one
# camera position per picture, like the reference's stop-motion camera), so every picture is sharp - frame 1 included -
# and the hoop, the pivot, never moves.
_ref = np.cumprod([1, .80, .917, .932, .946, .957, .966, .977, .987, .996, 1.0])
_u = np.log(_ref) / np.log(_ref[-1])
GS0, T_PB = 1.25, 18
def gs_at(f): return float(GS0 ** (1 - np.interp(min(f, T_PB) / T_PB * (len(_u) - 1), np.arange(len(_u)), _u)))
P.gkeys = []
for (key, n), f0 in zip(ORDER, CYC_STARTS):
    # the key lands half a frame early so the shutter of a picture's first frame never straddles the jump
    P.gkeys.append([max(0, F_(f0) - .5 / FPS), {'gs': gs_at(f0), 'gx': P0[0], 'gy': P0[1]}, 'step'])
P.gkeys.append([T_L - .5 / FPS, {'gs': 1.0, 'gx': P0[0], 'gy': P0[1]}, 'step'])

STILLS = {key: still(c, t) for key, (c, t, _, _) in CYC.items()}
for (key, n), f0 in zip(ORDER, CYC_STARTS):
    c, t, (cx, cy), h = CYC[key]
    k = HOOP / h
    assert k * gs_at(f0) <= 3.01, ('over the 2.0x cover cap', key, k * gs_at(f0))
    P.layer(src=STILLS[key], t0=F_(f0) - EPS, t1=F_(f0 + n) - EPS, freeze=0, group=True, name=f'cyc{key}{f0}',
            keys=[[0, {'k': k, 'x': cx / SW, 'y': cy / SH, 'px': P0[0], 'py': P0[1]}, 'lin']])

# =====================================================================================================================
# 2. LAND + HOLD on 041FCDC6: real 1.0x playback 8.35 -> 9.133 (eyes to the lens; they drop at 9.167), stabilised on the
#    hoop, then a true still of 9.133 until the spin. Brand + offer lockup over her dark hair.
kL = HOOP / L_[3]                                     # 2.0 = 1.33x cover (held-hoop cap 1.4x)
T_W = T_L + 1.55                                      # the spin wind-up starts (2.40)
LP = P.layer(src=src(L_[0]), t0=T_L - EPS, t1=T_W + 6 * STEP - EPS, inp=8.35, speed=1, group=False, name='041F')
L_STILL = still(L_[0], L_[1])
kLref = ref_index(LP.F, L_STILL.get(0))
LP.inp_off = kLref / 30 + 1e-3                        # decode index kLref (the measured 8.35) shows at T_L
L_LAST = kLref + 20 + ref_index_from(LP.F, still(L_[0], 9.133).get(0), kLref + 20)   # 9.133: the last eyes-to-lens frame
_si = LP.src_index
LP.src_index = lambda t: min(L_LAST, _si(t))          # play at 1.0x, then hold the last good frame as a true still
offL = tracked(LP.F, kLref, L_[2], (24, 30), smooth=2, ks=(kLref, L_LAST + 1))

# THE ROLL-PUSH (the reel's spin). A full spin about the pinned hoop cannot stay inside these frames: with the hoop low-left
# on a 9:16 canvas the far corners sit 1300 px away, so beyond ~20 deg at k 2.4 the 041F still shows a mirrored border and
# 212E (hoop 155 px from its left edge) tolerates ~5 deg (`check` measures every shutter sample). So the move is the
# reference's spin shape (x1.37-1.5 per step, expo-in, clockwise about the hoop) scaled to what the frames hold: 21 deg
# into the cut on a x1.3 push, the incoming arriving 2 deg short and finishing the roll in two steps.
ROT_IN = [.8, 1.4, 2.4, 3.8, 5.4, 6.9]
ROT_CUT = 1.5
ROT_OUT = [.5, .2, 0, 0, 0]
SH_IN = [.05, .05, .06, .06, .2, .9]
SH_CUT = .7
SH_OUT = [.12, .05, .05, .05, .05]
T_C = T_W + len(ROT_IN) * STEP                        # the cut, on the max-blur step
THETA = list(np.cumsum([0] + ROT_IN + [ROT_CUT] + ROT_OUT))
TH_END = THETA[-1]
theta = lambda t: ladder(t, T_W, THETA)
# the wind-up zoom: the reference's expo-in shape, capped at x1.3 (041F at 1.73x cover at the peak)
_z = [1.011, 1.023, 1.036, 1.051, 1.067, 1.086]
_z = [z ** (math.log(1.3) / math.log(float(np.prod(_z)))) for z in _z]
ZOUT = list(np.cumprod([1] + _z))


def cam_L(t):
    o = offL.get(min(getattr(LP, 'k_now', kLref), L_LAST), (0, 0, 1))
    return {'k': kL * ladder(t, T_W, ZOUT), 'x': (L_[2][0] + o[0]) / SW, 'y': (L_[2][1] + o[1]) / SH,
            'px': P0[0], 'py': P0[1], 'r': theta(t)}
LP.camf = cam_L
LP.t1 = T_C - EPS

# =====================================================================================================================
# 3. LAND HOOP ON HOOP: 212E5E27 plays 19.40 -> 19.50 at 1.0x through the settle (her face sharp from 19.37, eyes to the
#    lens), then holds a true still of 19.50 for the claim. Held at k 2.1 (1.4x cover, the held-hoop cap): below 1.76 the
#    top edge leaves the source, and the extra margin is what lets it arrive rolled.
J_ = ('212E5E27', 19.50, (154.6, 575.5), 70.7)
kJ = 2.10
J_STILL = still(J_[0], J_[1])
T_JS = T_C + 3 / 30                                   # 19.40 + 3 frames = 19.50: from here a still
JP = P.layer(src=src(J_[0]), t0=T_C - EPS, t1=T_JS - EPS, inp=19.40, speed=1, group=False, name='212E')
kJref = ref_index(JP.F, J_STILL.get(0), n=JP.F.n)
JP.inp_off = (kJref - 3) / 30 + 1e-3                  # 3 frames before the measured still (19.40: lids up again)
offJ = tracked(JP.F, kJref, J_[2], (30, 34), smooth=1)
# incoming size on the cut = the outgoing hoop at the peak of its zoom (HOOP x 1.3), settling to the hold size
ZC = HOOP * ZOUT[-1] / (kJ * J_[3]) * 1.035          # +3.5 %: the push carries on through the cut (and buys the rolled frame its margin)
D_IN = [1, .30, .06, 0]


def cam_J(t, still=False):
    o = (0, 0, 1) if still else offJ.get(getattr(JP, 'k_now', kJref), (0, 0, 1))
    return {'k': kJ * (1 + (ZC - 1) * ladder(t, T_C, D_IN)), 'x': (J_[2][0] + o[0]) / SW, 'y': (J_[2][1] + o[1]) / SH,
            'px': P0[0], 'py': P0[1], 'r': theta(t) - TH_END}
JP.camf = cam_J
P.steps += [(T_W, T_C + (len(ROT_OUT) + 1) * STEP, 18, 1.0)]
SPIN_SH = SH_IN + [SH_CUT] + SH_OUT                   # per-step shutter angle (the clock reads it below)

T_R = T_C + 1.55                                      # the claim hold ends, the relay begins (4.48)
JS = P.layer(src=J_STILL, t0=T_JS - EPS, t1=T_R + 3 * STEP - EPS, freeze=0, group=False, name='212Estill')

# =====================================================================================================================
# 4. PULL-BACK RELAY into her real turn. The still pulls back three steps (x0.84) toward a full-frame framing, its hoop
#    rising off the pin; cut on the max-blur step into 267E722A 6.55 with ITS hoop on the same screen point at 0.9 of the
#    size (the pull-back carried through the cut), and that settles to a plain full-frame framing while she turns away.
T_RC = T_R + 3 * STEP
RK_OUT = [kJ, 2.075, 1.99, 1.62]                       # per-step k of the still (x0.99, 0.96, 0.81: the speed piles into the cut)
SH_ROUT = [.06, .12, .85]


def cover_pos(c, k):
    """where a source point sits when the frame is exactly covered (k = COVER) - the pull-back's destination"""
    return (W / 2 + (c[0] - SW / 2) * k, H / 2 + (c[1] - SH / 2) * k)


J_COV = cover_pos(J_[2], COVER)


def cam_JS(t):
    k = ladder(t, T_R, RK_OUT)
    w = (kJ - k) / (kJ - COVER)
    if t < T_R: push = 1 + .02 * min(1, max(0, (t - T_JS) / (T_R - T_JS)))     # x1.02 over the claim hold
    else: push = 1.02 ** (1 - w)
    c = cam_J(T_C + 1.0, still=True)
    return {'k': k * push, 'x': c['x'], 'y': c['y'],
            'px': lerp(P0[0], J_COV[0], w), 'py': lerp(P0[1], J_COV[1], w)}
JS.camf = cam_JS

T_TURN0 = 6.55
Q_ = ('267E722A', 6.60, (274.0, 554.5), 41.0)         # hoop measured on a 5x crop (v2/m4.jpg)
CUT_POS = (lerp(P0[0], J_COV[0], (kJ - RK_OUT[-1]) / (kJ - COVER)), lerp(P0[1], J_COV[1], (kJ - RK_OUT[-1]) / (kJ - COVER)))
K_IN0 = .75 * RK_OUT[-1] * J_[3] / Q_[3]              # incoming hoop = 0.75 of the outgoing's last: the cut is the fastest step
                                                      # of the pull-back, and 720p stays under 1.4x cover where it shows
RK_IN = [K_IN0, K_IN0 * .81]
_d = math.log(RK_IN[1] / COVER)                       # the tail decays into exact cover (expo-out)
RK_IN += [COVER * math.exp(_d * .4 ** (i + 1)) for i in range(3)] + [COVER]
SH_RIN = [.5, .1, .08, .08, .08]
T_LS = T_RC + (7.30 - T_TURN0)                        # the look-swap cut (back to us, the bun flying)
QP = P.layer(src=src(Q_[0]), t0=T_RC - EPS, t1=T_LS - EPS, inp=T_TURN0, speed=1, group=False, name='267Eturn')
kQref = ref_index(QP.F, still(Q_[0], Q_[1]).get(0), n=QP.F.n)
offQ = tracked(QP.F, kQref, Q_[2], (16, 22), smooth=1, ks=(0, kQref + 14))


def cam_Q(t):
    k = ladder(t, T_RC, RK_IN)
    w = (K_IN0 - k) / (K_IN0 - COVER)
    o = offQ.get(getattr(QP, 'k_now', kQref), None)
    if o is None: o = offQ[max(offQ)] if getattr(QP, 'k_now', 0) > max(offQ) else offQ[min(offQ)]
    hx, hy = Q_[2][0] + o[0], Q_[2][1] + o[1]
    dest = cover_pos((hx, hy), COVER)
    return {'k': k, 'x': hx / SW, 'y': hy / SH, 'px': lerp(CUT_POS[0], dest[0], w), 'py': lerp(CUT_POS[1], dest[1], w)}
QP.camf = cam_Q
P.steps += [(T_R, T_RC + len(SH_RIN) * STEP, 18, 1.0)]
RELAY_SH = SH_ROUT + SH_RIN

# =====================================================================================================================
# 5. LOOK SWAP INSIDE HER TURN: hard cut while her back is to us (267E 7.30, the bun flying) into 5627AA72 14.80 (hair
#    down, back turned, the same turn direction); she comes round with her hair flying (real 30 fps).
T_M0 = 14.80
T_RET = T_LS + (15.42 - T_M0)                         # cut back to the pin on her real turn (head and hair in motion)
MP = P.layer(src=src('5627AA72'), t0=T_LS - EPS, t1=T_RET - EPS, inp=T_M0, speed=1, group=False, name='5627')
M_C = (405.0, 540.0)                                  # where her head and hoop come round (measured 409.5, 536.5 at 15.60)
RET_Z = [1, 1.03, 1.09, 1.20]                          # x1.2 over three steps, expo-in
SH_RET = [.12, .5, .9]
T_RP = T_RET - 3 * STEP
M_TO = (522.0, 950.0)                                  # as far toward P0 as the frame's right/top edges allow at x1.2


def cam_M(t):
    z = ladder(t, T_RP, RET_Z); w = (z - 1) / (RET_Z[-1] - 1)
    c0 = cover_pos(M_C, COVER)
    return {'k': COVER * z, 'x': M_C[0] / SW, 'y': M_C[1] / SH, 'px': lerp(c0[0], M_TO[0], w), 'py': lerp(c0[1], M_TO[1], w)}
MP.camf = cam_M

# =====================================================================================================================
# 6. BACK ON THE PIN: 398F157B 8.10 (hand-free, eyes to the lens, the cycle's own B) lands with its hoop on P0, settles
#    two steps, then holds as a true still (x1.02 push) carrying the ladder, so the deal is complete before the card.
E_ = CYC['B']
kE = 2.08                                             # 1.39x cover: the held-hoop cap, and the right edge needs >= 2.05
SETTLE = [1.03, 1.008, 1.0]
SH_SET = [.3, .1]
T_CARD = T_RET + 1.60
EP = P.layer(src=STILLS['B'], t0=T_RET - EPS, t1=T_CARD - EPS, freeze=0, group=False, name='398Fclose')


def cam_E(t):
    push = 1 + .02 * min(1, max(0, (t - T_RET - 2 * STEP) / (T_CARD - T_RET)))
    return {'k': kE * ladder(t, T_RET, SETTLE) * push, 'x': E_[2][0] / SW, 'y': E_[2][1] / SH, 'px': P0[0], 'py': P0[1]}
EP.camf = cam_E
P.steps += [(T_RP, T_RET + len(SH_SET) * STEP, 18, 1.0)]
RET_SH = SH_RET + SH_SET

# per-step shutter angles for the three made moves (Plate.steps carries one angle per window; the reference opens the
# shutter only on its fastest steps, so the clock is wrapped to read the angle of the step on show)
_SHUT = [(T_W, SPIN_SH), (T_R, RELAY_SH), (T_RP, RET_SH)]
_clock = P.clock


def clock(t):
    tq, sh = _clock(t)
    for t0, angs in _SHUT:
        j = int(math.floor((t - t0) / STEP + 1e-4))
        if 0 <= j < len(angs) and abs(sh - STEP) < 1e-9: return tq, angs[j] * STEP
    return tq, sh
P.clock = clock

# =====================================================================================================================
# 7. END CARD (1.6 s, the last frame IS the logo): NAIRA and the full ladder arrive together on the cut.
DUR = round((T_CARD + 1.60) * 30) / 30


def card(t0, t1):
    g = np.zeros((H, W, 4), np.uint8); g[..., :3] = K.IVORY; g[..., 3] = 255
    P.overlay(g, 0, 0, t0, t1, fin=0, fout=0, rise=0)
    lw, ly = 560, 676
    L = K.logo(lw); P.overlay(L, (W - lw) / 2, ly, t0, t1, fin=0, fout=0, rise=0)
    y = ly + L.shape[0] + 66
    rows = [(f'BUY {q}  ·  {p}% OFF', 'jost', 30, K.DEEP, 16) for q, p in K.OFFER['rungs']]
    rows[-1] = rows[-1][:4] + (24,)
    rows += [('APPLIED IN THE BAG', 'jost', 19, (120, 112, 106), 50), ('COD AVAILABLE  ·  FREE INSURED SHIPPING', 'jost', 22, K.INK, 40)]
    for s, kind, size, col, gap in rows:
        tp = K.text(s, kind, size, 500, .22, color=col, shadow=0)
        K.place(P, (tp[0], tp[1]), W / 2, y, t0, t1, fin=3 / 30, fout=0, rise=0)
        y += size + gap
    shop = K.hrow([K.text('SHOP AT', 'jost', 20, 500, .22, color=K.INK, shadow=0), K.text('nairaflore.com', 'cgi', 44, 500, 0, color=K.DEEP, shadow=0)], gap=16)
    K.place(P, (shop[0], shop[1]), W / 2, y, t0, t1, fin=3 / 30, fout=0, rise=0)
    return y + 44


CARD_BOTTOM = card(T_CARD, DUR + 1)

# ---- type: one super at a time, only on holds, never over a move; fades of 4 frames, >= 0.9 s at full opacity ----
FADE = 4 / 30
CAP_X = 250                                           # the caption slot under the pinned hoop, over her dark hair


def soft_halo(img, r=7, a=.55, color=K.INK):
    """put a soft ink halo under an RGBA picture (the logo), so sage reads on dark hair without a box"""
    lg = img.astype(np.float32); al = lg[..., 3] / 255; p = 3 * r
    out = np.zeros((lg.shape[0] + 2 * p, lg.shape[1] + 2 * p, 4), np.float32)
    out[p:-p, p:-p, :3] = lg[..., :3]; out[p:-p, p:-p, 3] = al
    halo = cv2.GaussianBlur(out[..., 3], (0, 0), r) * a
    A = out[..., 3] + halo * (1 - out[..., 3])
    rgb = (out[..., :3] * out[..., 3:4] + np.array(color, np.float32) * (halo * (1 - out[..., 3]))[..., None]) / np.maximum(A, 1e-6)[..., None]
    return (np.dstack([rgb, A * 255]).clip(0, 255) + .5).astype(np.uint8), p


def lockup(t0, t1, cx, y_top):
    """sage NAIRA above WOVEN GOLD HOOPS and the price (MRP struck) - brand and offer together on the first hold.
    Sized for the dark hair band left of her neck (x 0-360 on the 041F hold, measured): 316 px at its widest."""
    logo, lp = soft_halo(K.logo(180))
    name = K.text('WOVEN GOLD HOOPS', 'jost', 22, 500, .22, color=K.IVORY, shadow=.5)
    pr = K.text(K.rs(K.OFFER['prices']['woven-gold-hoops'][0]), 'cg', 58, 500, 0, color=K.IVORY, shadow=.5)
    mrp = K.text(K.rs(K.OFFER['prices']['woven-gold-hoops'][1]), 'cg', 30, 500, 0, color=(232, 222, 212), shadow=.5)
    im, pad, w = mrp; im = im.copy(); y = int(im.shape[0] * .57)        # a 2 px strike, as the critic asked
    im[y - 1:y + 1, pad - 2:pad + w + 2, :3] = (232, 222, 212); im[y - 1:y + 1, pad - 2:pad + w + 2, 3] = 240
    row = K.hrow([pr, (im, pad, w)], gap=14)
    st = K.stack([name, row], gap=8)
    P.overlay(logo, cx - logo.shape[1] / 2, y_top - lp, t0, t1, fin=FADE, fout=FADE, rise=0)
    K.place(P, st, cx, y_top + K.logo(180).shape[0] + 8, t0, t1, fin=FADE, fout=FADE, rise=0)


T_LOCK0 = T_L + 1 / 30
lockup(T_LOCK0, T_W - 2 / 30, 180, 1080)
# one line, never split (split, "18K GOLD" would read alone); sized for the dark hair band left of her jaw (x 0-360)
CLAIM = K.stack([K.text('PVD 18K GOLD COATING', 'jost', 23, 500, .18, color=K.IVORY, shadow=.55),
                 K.text('WATERPROOF', 'jost', 22, 500, .22, color=K.IVORY, shadow=.55)], gap=12)
T_CL0 = T_C + len(D_IN) * STEP + 1 / 30               # once the landing has settled to the still
K.place(P, CLAIM, 190, 1150, T_CL0, T_R - 2 / 30, fin=FADE, fout=FADE, rise=0)
# the deal before the card, over the dark hair under the hoop (x 0-760 at y 1080-1250 on this frame, measured)
LAD = K.stack([K.text(f'BUY {q}  ·  {p}% OFF', 'jost', 34, 500, .22, color=K.IVORY, shadow=.5) for q, p in K.OFFER['rungs']], gap=12)
T_LD0 = T_RET + len(SETTLE) * STEP + 1 / 30
K.place(P, LAD, 262, 1072, T_LD0, T_CARD - 1 / 30, fin=FADE, fout=FADE, rise=0)

TIMES = {'T_L': T_L, 'T_W': T_W, 'T_C': T_C, 'T_JS': T_JS, 'T_R': T_R, 'T_RC': T_RC, 'T_LS': T_LS, 'T_RP': T_RP,
         'T_RET': T_RET, 'T_CARD': T_CARD, 'DUR': DUR}


# =====================================================================================================================
def coverage(t):
    """every active layer's source must cover the whole canvas at every shutter sample: no mirrored border"""
    tq, sh = P.clock(t); bad = []
    for L in P.layers:
        if tq < L.t0 or tq >= L.t1: continue
        sw, shh = L.F.size
        for tt in (tq - sh / 2, tq, tq + sh / 2):
            L.k_now = L.src_index(tq)
            Mi = np.linalg.inv(L.matrix(tt))
            cs = Mi @ np.array([[0, 0, 1], [W, 0, 1], [0, H, 1], [W, H, 1]], float).T
            over = max(-cs[0].min(), cs[0].max() - sw, -cs[1].min(), cs[1].max() - shh)
            if over > .5: bad.append((L.name, round(tt, 3), round(float(over), 1)))
    return bad


def mix(out_wav):
    m = K.Mix(DUR)
    # the hero film's own instrument and key, beatless: B minor add9 -> G maj7 on the spin's cut -> D add9 under the card;
    # the first chord starts before the reel so the bed is already there on frame 1
    m.pad([(-0.6, [47, 54, 59, 61, 66]), (T_C, [43, 50, 55, 59, 62, 66]), (T_CARD - .25, [50, 57, 62, 64, 66, 69])])
    # felt taps under the cycle: on every second single, then on every picture of the slowing tail, widening and softening
    taps = [0, 4, 8, 12, 15, 18, 22]
    for j, f in enumerate(taps): m.felt(F_(f) + .004, v=1.0 - .06 * j, seed=j)
    m.felt(T_L + .004, v=.72, seed=11)
    # sub-only whooshes, rising from the first step of each move to its max-blur frame; the bed dips before each
    m.subwhoosh(T_W + .02, T_C + .03, v=1.6)          # the spin
    m.subwhoosh(T_R + .01, T_RC + .03, tail=.36, v=1.25)   # the pull-back relay
    m.subwhoosh(T_LS - .05, T_LS + .25, tail=.30, v=.45)   # her own turn through the look swap
    m.subwhoosh(T_RP + .01, T_RET + .03, tail=.34, v=1.2)  # the cut back to the pin
    m.duck = [(T_W - .45, T_C + .05, -7), (T_R - .35, T_RC + .05, -6), (T_RP - .35, T_RET + .05, -6)]
    m.felt(T_CARD + .004, v=.85, seed=21)             # the card lands
    tgt, r = -14.0, None
    for _ in range(5):
        r = m.master(out_wav, target=tgt, bed_lufs=-26.5)   # the bed sits lower so the moves land (loud, quiet, loud)
        if abs(r['lufs'] + 14.0) < .08: break
        tgt += -14.0 - r['lufs']
    return r


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'info'
    print(json.dumps({**{k: round(v, 3) for k, v in TIMES.items()}, 'kLref': kLref, 'kJref': kJref, 'kQref': kQref,
                      'ZC': round(ZC, 3), 'K_IN0': round(K_IN0, 3), 'RK_IN': [round(v, 3) for v in RK_IN], 'CUT_POS': CUT_POS,
                      'card_bottom': CARD_BOTTOM, 'GS': [round(gs_at(f), 3) for f in CYC_STARTS],
                      'track_min': {n: round(min(v[2] for v in o.values()), 2) for n, o in (('L', offL), ('J', offJ), ('Q', offQ))}}))
    if cmd == 'check':
        n = int(round(DUR * FPS)); bad = {}
        for i in range(n):
            b = coverage(i / FPS)
            if b: bad[i] = b
        print('coverage problems:', len(bad)); [print(i, v) for i, v in list(bad.items())[:40]]
    elif cmd == 'frames':
        a, b = int(sys.argv[2]), int(sys.argv[3]); d = f'{R3}/part'
        P.render(d, DUR, start=a, stop=b, workers=2)
        print('rendered', b - a)
    elif cmd == 'mix':
        print(mix(f'{R3}/{SLUG}.wav'))
    elif cmd == 'full':
        d = f'{R3}/final'
        if os.path.exists(d): shutil.rmtree(d)
        n = P.render(d, DUR, workers=2)
        os.makedirs(OUT, exist_ok=True)
        wav = f'{R3}/{SLUG}.wav'; print('mix', mix(wav))
        K.encode(d, wav, f'{OUT}/{SLUG}.mp4'); K.encode(d, wav, f'{OUT}/{SLUG}-4x5.mp4', crop45=True)
        mx.sheet(d, f'{OUT}/{SLUG}-sheet.jpg', times=list(np.arange(0, DUR, 1 / 3)), cols=10, w=200)
        print('frames', n, K.probe(f'{OUT}/{SLUG}.mp4'), K.probe(f'{OUT}/{SLUG}-4x5.mp4'))
