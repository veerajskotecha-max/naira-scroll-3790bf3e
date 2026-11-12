"""Reel 4 v2: "One drawer, the whole ladder" (Riya + Pankti boxes). Lead device: the lid lock, then ONE drawer whose
contents change rung by rung.

Every picture is a real frame (Riya's 4K F67FB13D, Pankti's HLG raw tone-mapped and flipped) or our own type and vector
logo. No pack photos (b13's provenance is unknown, the critic read it as a CGI packshot). The only dissolve is the lid's
printed NAIRA into the vector logo at the end.

    python3.13 -I build.py check             coverage (no mirrored borders) and punch-in caps for every layer
    python3.13 -I build.py part A B [cols]   render output frames [A, B) into part/ and a sheet in look/
    python3.13 -I build.py frames i j ...    single frames into one/ (anchor and type checks)
    python3.13 -I build.py full              render, mix, encode both shapes, sheets
    python3.13 -I build.py mix               the sound only

Beats (round 2, after the critique):
  A  HOOK. Riya's CLOSED lid, its printed NAIRA pinned on the card's logo centre at a sharp 4K macro (frame 1 is a held
     step), then ONE expo-out pull-back (1.6x) on the reference's ratios. Under the blur of the fastest steps the hands
     and room become Pankti's (her closed toggle lid), and on the still lock they snap back to Riya's, whose drawer
     then slides. Closed lids only, so the slide is the first reveal.
  B  Riya's real slide at native 30 fps (the lock follows her lift of the box). BUY 4 . 30% OFF, big, in ink on the lid.
     The ring is piece 1: the slide ends on it, held still.
  C  ONE DRAWER. Each drawer is locked by its velvet's front edge.
     M1  Riya's ring drawer turns and drops onto Pankti's pose; the creator changes once, on the blurred cut frame.
     L1  Pankti's toggle drawer, live, still: 2 IN THE BAG . 10% OFF.
     S1  On the still lock the drawer snaps shut (her second box, empty, nearly closed) and slides open again for real,
         revealing the huggies: 3 IN THE BAG . 20% OFF. Same light, same pose, no camera move: the stop-motion refill.
     M2  The huggie drawer pushes and levels into Riya's hoop tray; again one change, on the blurred cut frame.
     L3  The tray, live: 4 IN THE BAG . 30% OFF in ink on the wood.
  D  The tray whips right into Riya's real hair flip (entered at 19.333); 4 blurred frames; 30 fps from the landing.
  E  Her worn hoop, tracked and held on HP at native 30 fps.
  F  One-frame circle swap: her hoop becomes Pankti's toggle ring on the same screen circle; the ring stays pinned on HP
     while she turns it (tracked), 30 fps.
  G  Axial cut back: the worn toggle on Pankti's neckline lands on HP, then an expo-out pull-back reveals her face,
     eyes to the lens, wearing both pieces (1x, no held frames).
  H  Her lid (a true still) rises into the card's logo box, the centre of frame 1's macro; the print becomes the vector
     logo (letter on letter); the card, with the whole deal as ONE line, holds 1.6 s once complete.
  Sound: pad, felt taps (one pitched-down felt body on the whip) and drawer foley, shelved above 3 kHz.
"""
import sys, os, math, json, shutil
R4 = '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/r4'
sys.path.insert(0, '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/tools'); sys.path.insert(0, R4)
import mx, mxkit as K
import track as TR
import numpy as np, cv2
from src import rng
import word as WD
from pose import sim, edge_pts, drawer_M, over, kof, apply

S = K.S
OUT = f'{S}/mx/out'
SLUG = 'naira-morph-4-drawer-ladder'
W, H = 1080, 1920
STEP = 1 / 18
P = mx.Plate(W, H, fps=30, shutter=.5)

PK, RS, RH, RL = (rng(n) for n in ('pk', 'r_slide', 'r_hoop', 'r_look'))
WH = {nm: {int(k): np.array(v['H']) for k, v in d.items()} for nm, d in json.load(open(f'{R4}/wordH.json')).items()}
QD = {nm: {int(k): np.array(v) for k, v in d.items()} for nm, d in json.load(open(f'{R4}/quads.json')).items()}
# 4.33-4.57 (the huggies emerging) had no quads in round 1; the same detector, re-run (q130.py), matches round 1's
# corners exactly on the frames either side
QD['pk'].update({int(k): np.array(v) for k, v in json.load(open(f'{R4}/q130.json')).items()})
T2L = WD.tpl_to_logo()


# =====================================================================================================================
# a layer whose geometry is a full 3x3, source px -> canvas px, recomputed per instant. Motion blur is the kit's idea:
# the SAME real frame sampled across the shutter along the camera's own path. Round 2: the shutter TRAILS the step
# ([t, t + sh]) instead of straddling it, so a held step never samples the next step's move (the critic's double
# "echo" letters on frames 2-6 of round 1 came from the centred shutter).
# =====================================================================================================================
class HL(mx.Layer):
    def __init__(self, P, F, t0, t1, geo, inp=0.0, speed=1.0, freeze=None, group=False, name='', cap=None, a=None):
        super().__init__(P, src=F, t0=t0, t1=t1, inp=inp, speed=speed, group=group, freeze=freeze, name=name)
        self.geo, self.cap, self.afn = geo, cap, a
    def matrix(self, t):
        M = self.geo(t, getattr(self, 'k_now', 0))
        return self.P.G(t) @ M if self.group else M
    def local_k(self, M):
        Mi = np.linalg.inv(M); c = Mi @ np.array([540, 960, 1.0]); c = c[:2] / c[2]
        p0, p1, p2 = apply(M, c), apply(M, c + [1, 0]), apply(M, c + [0, 1])
        a, b = p1 - p0, p2 - p0; return math.sqrt(abs(a[0] * b[1] - a[1] * b[0]))
    def render(self, t, sh):
        if t < self.t0 or t >= self.t1: return None
        Wc, Hc = self.P.W, self.P.H
        k = self.src_index(t); self.k_now = k
        ta, tb = t, t + sh
        Ma, Mb = self.matrix(ta), self.matrix(tb)
        cv_ = np.array([[0, Wc, 0, Wc, Wc / 2], [0, 0, Hc, Hc, Hc / 2], [1, 1, 1, 1, 1]], float)
        s = np.linalg.inv(Ma) @ cv_; m = Mb @ s; m = m[:2] / m[2]
        travel = np.abs(m - cv_[:2]).max()
        n = int(min(48, max(1, math.ceil(travel / 2.5))))
        ts = [t] if n == 1 else list(np.linspace(ta, tb, n))
        acc = np.zeros((Hc, Wc, 3), np.float32)
        for tt in ts:
            M = self.matrix(tt); ks = self.local_k(M)
            lv = 4 if ks < .3 else 2 if ks < .65 else 1
            img = self.F.get(k, lv)
            Mi = M @ np.diag([lv, lv, 1.0])
            flag = cv2.INTER_CUBIC if ks > 1.05 else cv2.INTER_LINEAR
            w = cv2.warpPerspective(img, Mi, (Wc, Hc), flags=flag, borderMode=cv2.BORDER_REFLECT101)
            acc += w[..., :3].astype(np.float32)
        rgb = acc / (255 * len(ts))
        alpha = np.full((Hc, Wc), 1.0 if self.afn is None else self.afn(t), np.float32)
        return rgb, alpha


LAYERS = []
def add(name, F, t0, t1, geo, cap, **kw):
    L = HL(P, F, t0, t1, geo, name=name, cap=cap, **kw); P.layers.append(L); LAYERS.append(L); return L


def steps_curve(t0, vals, mode='log'):
    """vals[i] at t0 + i*STEP; log-linear (scale) or linear inside each step, so each 18 fps step moves at its own
    constant speed and blurs exactly as much as it moves"""
    vals = np.asarray(vals, float)
    def f(t):
        i = (t - t0) / STEP
        if i <= 0: return float(vals[0])
        if i >= len(vals) - 1: return float(vals[-1])
        j = int(math.floor(i)); u = i - j
        if mode == 'log': return float(vals[j] * (vals[j + 1] / vals[j]) ** u)
        return float(vals[j] + (vals[j + 1] - vals[j]) * u)
    return f


def stepwin(t0, angles):
    """one 18 fps step window per entry, each with its own shutter angle: 0.5 on ramp steps, 0.9 only either side of
    a cut (round 1 opened 0.9 on whole windows and smeared 35 frames)"""
    for i, a in enumerate(angles): P.steps.append((t0 + i * STEP, t0 + (i + 1) * STEP, 18, a))
    return t0 + len(angles) * STEP


def T(dx=0.0, dy=0.0):
    return np.array([[1, 0, dx], [0, 1, dy], [0, 0, 1.0]])
def Zc(z, c=(540.0, 960.0)): return np.array([[z, 0, c[0] * (1 - z)], [0, z, c[1] * (1 - z)], [0, 0, 1.0]])


def smooth_track(d, ks, win=2):
    """moving average (+-win frames) of a per-frame array track inside one contiguous span"""
    ks = [k for k in ks if k in d]; A = np.array([d[k] for k in ks], float); out = {}
    for i, k in enumerate(ks):
        lo, hi = max(0, i - win), min(len(ks), i + win + 1); out[k] = A[lo:hi].mean(0)
    return out


def nearest(d, k):
    if k in d: return d[k]
    ks = np.array(sorted(d)); return d[int(ks[np.argmin(np.abs(ks - k))])]


# =====================================================================================================================
# THE LID LOCK (kept from round 1, which the critic re-projected and passed): each picture's printed NAIRA is laid by
# its own homography (ECC fit of the vector letters, wordH.json) onto the vector logo at width LW centred (540, CY);
# the lock is the least-squares SIMILARITY of that fit (the full keystone would warp hands and rooms across the frame).
# =====================================================================================================================
LW_CARD, LY_CARD = 690, 560                    # 690: Pankti's end lid at k 1.59, inside her 1.6 cap
LOGO_H = 606 / 2708
CY_CARD = LY_CARD + LW_CARD * LOGO_H / 2
def logo_place(LW, CY):
    s = LW / 2708; return np.array([[s, 0, 540 - LW / 2], [0, s, CY - LW * LOGO_H / 2], [0, 0, 1]])
def umeyama(src, dst):
    src, dst = np.asarray(src, float), np.asarray(dst, float)
    ms, md = src.mean(0), dst.mean(0); a, b = src - ms, dst - md
    U, D, Vt = np.linalg.svd(b.T @ a / len(src)); S_ = np.eye(2)
    if np.linalg.det(U) * np.linalg.det(Vt) < 0: S_[1, 1] = -1
    R = U @ S_ @ Vt; c = np.trace(np.diag(D) @ S_) / (a ** 2).sum(1).mean()
    t = md - c * R @ ms
    return np.array([[c * R[0, 0], c * R[0, 1], t[0]], [c * R[1, 0], c * R[1, 1], t[1]], [0, 0, 1.0]])
_Tt, _ = WD._template(); _th, _tw = _Tt.shape
LETTER_PTS = np.array([[x, y, 1.0] for x in np.linspace(WD.TP, _tw - WD.TP, 5) for y in np.linspace(WD.TP, _th - WD.TP, 3)]).T
def lid_M(Hk, LW, CY):
    p = Hk @ LETTER_PTS; src = (p[:2] / p[2]).T
    q = logo_place(LW, CY) @ T2L @ LETTER_PTS; dst = (q[:2] / q[2]).T
    return umeyama(src, dst)
def smooth_H(d, win=1):
    Tt, _ = WD._template(); th, tw = Tt.shape
    src = np.array([[0, 0], [tw, 0], [tw, th], [0, th]], np.float32)
    ks = sorted(d); C = {}
    for k in ks:
        p = d[k] @ np.vstack([src.T, np.ones(4)]); C[k] = (p[:2] / p[2]).T
    out = {}
    for i, k in enumerate(ks):
        nb = [C[j] for j in ks[max(0, i - win):i + win + 1] if abs(j - k) <= win]
        out[k] = cv2.getPerspectiveTransform(src, np.mean(nb, 0).astype(np.float32))
    return out
WHS = {nm: smooth_H(d) for nm, d in WH.items()}

# ---- A. the hook pull-back: LW per 18 fps step, 1040 -> 663 (1.57x), expo-out. Step 0 is held (frame 1 sharp).
# Riya's print is 805 4K px wide (k 1.29 at LW 1040, under her 1.3 cap); Pankti's foil is 433 px, so her lid can only
# appear once LW <= 690 (k 1.59): the creator change sits on the first step after the fastest two.
# The pull-back is about the card's logo centre (CY_CARD) and does not drift: Pankti's lid, low in her frame, only
# covers the canvas with the print at least 620 px down (her 0.40-0.60 frames, further right and lower, never do).
LW_SL, CY_SL0 = 663.0, CY_CARD
LWv = [1040.0, 1040.0, 845.0, 692.0, 672.0, 665.0, 663.0]          # 1.57x
LW_hook = steps_curve(0.0, LWv); CY_hook = lambda t: CY_CARD
HOOK = [('r_slide', RS, 2), ('r_slide', RS, 4), ('r_slide', RS, 5), ('pk_lid1', PK, 20), ('pk_lid1', PK, 21), ('pk_lid1', PK, 22)]
T_B = stepwin(0.0, [.5, .5, .9, .9, .5, .5])           # 0.333: the slide starts on the still lock
for i, (nm, rg, k) in enumerate(HOOK):
    add(f'hook{i}_{nm}{k}', rg.F, i * STEP, (i + 1) * STEP,
        (lambda Hk: lambda t, kk: lid_M(Hk, LW_hook(t), CY_hook(t)))(WHS[nm][k]), 1.3 if nm[0] == 'r' else 1.6, freeze=k)

# ---- B. Riya's real slide, native 30 fps, from 5.300 (frame 9: the drawer starts to move) to 6.600 (the ring has
# been out and still since 6.1: piece 1's beat). The lock follows her own lift of the box, NAIRA rising from the card's
# centre to y 420 so the open drawer ends near y 1370 rather than 1590 (the 4:5 crop ends at 1580).
SLIDE_K0, SLIDE_K1 = 9, 48
CY_SLIDE_END, K_RISE = 400.0, (9, 25)
def CY_slide(k):
    u = min(1.0, max(0.0, (k - K_RISE[0]) / (K_RISE[1] - K_RISE[0]))); u = u * u * (3 - 2 * u)
    return CY_SL0 + (CY_SLIDE_END - CY_SL0) * u
T_M1 = T_B + (SLIDE_K1 - SLIDE_K0) / 30

# =====================================================================================================================
# C. ONE DRAWER: every drawer picture is locked by its velvet's FRONT edge (BL->BR) to a canvas pose
# C = (mid x, mid y, length, angle). Pankti's three drawers (toggle, the empty second box sliding open, the huggies)
# share ONE pose, solved for coverage over every frame shown and her 1.6 cap (poses2.py): 16 deg is her own tilt, so
# her footage is not rotated at all on the holds. The tray has its own, level, higher pose.
# =====================================================================================================================
QS = {nm: smooth_track(d, sorted(d), win=1) for nm, d in QD.items() if nm != 'pk'}
QP = {}
for a, b in ((54, 97), (110, 216)):
    QP.update(smooth_track({k: QD['pk'][k] for k in range(a, b) if k in QD['pk']}, list(range(a, b)), win=1))
QS['pk'] = QP
C_P = (520.0, 1450.0, 940.0, 16.0)                   # huggies k <= 1.58
C_M2 = (540.0, 1520.0, 940.0, 8.0)                   # M2's cut pose: the huggies dip and level into it, the tray rises out of it
C3 = (540.0, 1370.0, 1260.0, 0.0)                    # level; the wood above the tray carries the rung

def geo_slide_lid(k): return lid_M(nearest(WHS['r_slide'], k), LW_SL, CY_slide(k))
_Mb = geo_slide_lid(SLIDE_K1)
_q = QS['r_slide'][SLIDE_K1]; _bl, _br = apply(_Mb, _q[3]), apply(_Mb, _q[2])
C_SLIDE = (*(((_bl + _br) / 2).tolist()), float(np.hypot(*(_br - _bl))), math.degrees(math.atan2(_br[1] - _bl[1], _br[0] - _bl[0])))

def lerpC(a, b, u):
    return (a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] * (b[2] / a[2]) ** u, a[3] + (b[3] - a[3]) * u)
# each move is 4 steps: slow, FAST (outgoing, 0.9), FAST (incoming, 0.9), slow; the creator changes on step 2
U_MOVE = [0.0, .04, .5, .96, 1.0]
MOVE_ANG = [.5, .9, .9, .5]
T_L1 = stepwin(T_M1, MOVE_ANG)
L1_DUR = .90
T_S1 = T_L1 + L1_DUR
S1_K0, HUG_REVEAL_K = 120, 136                          # the empty drawer at 4.000, nearly shut; huggies out by 4.533
L2_DUR = .95                                            # hold after the reveal
T_M2 = T_S1 + (HUG_REVEAL_K - S1_K0) / 30 + L2_DUR
T_L3 = stepwin(T_M2, MOVE_ANG)
L3_DUR = .80
T_D = T_L3 + L3_DUR
# M2 carries a push (1.34x) and a level (8 deg) on the tray's side: its slow steps are slower still, so only the two
# fast steps either side of the cut blur (measured: 6 soft frames with .04, 4 with .02)
U_MOVE2 = [0.0, .02, .5, .98, 1.0]
u_m1 = steps_curve(T_M1, U_MOVE, 'lin'); u_m2 = steps_curve(T_M2, U_MOVE2, 'lin')
def Cf(t):
    if t < T_L1: return lerpC(C_SLIDE, C_P, u_m1(t))
    if t < T_M2: return C_P
    u = u_m2(t)                                         # through the cut pose: the huggies never push (cap), the tray does
    return lerpC(C_P, C_M2, u / .5) if u < .5 else lerpC(C_M2, C3, (u - .5) / .5)

def geo_drawer(qs): return lambda t, k: drawer_M(nearest(qs, k), Cf(t))

# B + M1 steps 0-1: one Riya layer; the lid lock hands over to the edge lock at T_M1 (C_SLIDE is where the lid lock
# leaves her drawer, so nothing jumps)
def geo_slide(t, k):
    return geo_slide_lid(k) if t < T_M1 else drawer_M(nearest(QS['r_slide'], k), Cf(t))
add('slide', RS.F, T_B, T_M1 + 2 * STEP, geo_slide, 1.3, inp=SLIDE_K0 / 30)
# M1 steps 2-3 + L1: Pankti's toggle drawer, live (2.067 ->); L1 shows 2.18-3.08, the calm span (velvet.json)
L1_K0 = 62
add('toggle', PK.F, T_M1 + 2 * STEP, T_S1, geo_drawer(QS['pk']), 2.8, inp=L1_K0 / 30)
# S1 + L2 + M2 steps 0-1: her second box, empty and nearly shut at 4.000, slides open for real and shows the huggies
add('huggies', PK.F, T_S1, T_M2 + 2 * STEP, geo_drawer(QS['pk']), 1.6, inp=S1_K0 / 30)

# =====================================================================================================================
# D. The tray (from M2 step 2), then the whip RIGHT (her hair flies right) on two steps, cut on the fastest, into
# her hair flip at 19.333 (the critic: 2 frames later than round 1, where her face starts to resolve), settling in 3
# steps. The 18 fps window closes there: the worn hold plays at native 30 fps.
# =====================================================================================================================
WHIP = [0.0, 12.0, 290.0]                               # the first step barely moves: the woven hoops soften at 15 px
WPUSH = [1.0, 1.01, 1.08]
T_CUT = stepwin(T_D, [.5, .9])
whip_dx = steps_curve(T_D, WHIP, 'lin'); whip_z = steps_curve(T_D, WPUSH)
def geo_tray(t, k):
    M = drawer_M(nearest(QS['r_hoop'], k), Cf(t))
    return T(whip_dx(t)) @ Zc(whip_z(t)) @ M if t >= T_D else M
add('tray', RH.F, T_M2 + 2 * STEP, T_CUT, geo_tray, 1.3, inp=0.0)

HP = np.array([580.0, 1130.0])                          # the shared screen circle: hoop -> ring -> worn toggle
HOOP_D, RING_D, TOG_D = 150.0, 152.0, 57.0              # outer diameters, source px (4K hoop, Pankti ring, worn toggle)
K_FING = 1.22                                           # her ring pinned at HP while it climbs 130 px needs >= 1.2
K_LOOK = K_FING * RING_D / HOOP_D                       # 1.24 (Riya cap 1.3): hoop and ring the same size on screen
SETTLE = [-160.0, -28.0, 0.0]
T_E = stepwin(T_CUT, [.9, .5])                          # 30 fps from here
look_dx = steps_curve(T_CUT, SETTLE, 'lin')
LOOK_K0 = RL.k(19.333)
_k_ref = RL.k(20.20)
HOOP_BOX = [1365, 1635, 1500, 1775]
_tr = TR.tmatch(RL.F, _k_ref, HOOP_BOX, list(range(_k_ref, RL.k(19.45) - 1, -1)) + list(range(_k_ref, RL.F.n)), search=1.6)
HOOP = smooth_track({k: np.array(v[:2]) for k, v in _tr.items()}, sorted(_tr), win=1)
HOOP_C_REF = np.array([1429.6, 1699.4])                 # hoop centre at 20.20: round 1's (1432,1705) re-measured on the
                                                        # rendered swap frame at 2x (v2look/swap2x.jpg), 7 px high
_off = HOOP_C_REF - HOOP[_k_ref]
def hoop_c(k): return nearest(HOOP, max(k, min(HOOP))) + _off
T_F = T_CUT + (20.20 - 19.333) + 1e-6
def geo_look(t, k):
    c = hoop_c(k)
    return T(look_dx(t)) @ sim(c, c + [1, 0], HP, HP + [K_LOOK, 0])
add('look', RL.F, T_CUT, T_F, geo_look, 1.3, inp=LOOK_K0 / 30)

# =====================================================================================================================
# F. Pankti's ring (20.40) takes the hoop's circle; tracked so it stays pinned on HP while her fingers turn it (30 fps)
# =====================================================================================================================
RING_C = np.array([602.0, 1061.0])                      # outer ring centre at 20.40 (ring612.jpg, then 4 px lower from swap2x.jpg)
FING_K0, FING_DUR = PK.k(20.40), .333
_rt = TR.tmatch(PK.F, FING_K0, [530, 985, 675, 1130], list(range(FING_K0, FING_K0 + 14)), search=1.5)
RING = smooth_track({k: np.array(v[:2]) for k, v in _rt.items()}, sorted(_rt), win=1)
_roff = RING_C - RING[FING_K0]
def ring_c(k): return nearest(RING, k) + _roff
T_G = round((T_F + FING_DUR) * 30) / 30                   # on a frame, so the held first face step gets its 2 frames
add('fingers', PK.F, T_F, T_G, lambda t, k: sim(ring_c(k), ring_c(k) + [1, 0], HP, HP + [K_FING, 0]), 1.6, inp=20.40)

# =====================================================================================================================
# G. AXIAL CUT BACK: the same screen point, wider: her worn toggle on HP at k 1.6 (the cap; the size steps down 0.42x,
# a cut back on axis, not a circle swap), then an expo-out pull-back to her face, eyes to the lens, wearing both. 1x,
# no held frames (27.90-28.70: her hand leaves the hair, then the calm look, lips closed).
# =====================================================================================================================
FACE_T0 = 27.90                                         # 27.90-28.70: her lips part from 28.73 (v2look/mouth.jpg)
TOG_C = np.array([389.0, 1418.6])                       # the worn toggle at 27.90: the 3x crop at 28.00 (tog_face840.jpg)
                                                        # carried back 3 frames by NCC
K_F0, K_F1 = 1.60, 1.06
FACE_C = np.array([540.0, 1000.0])
# step 0 is held: the cut back lands SHARP (a blurred first step was a white smear of her tank, a flash)
# the pull-back follows the cut, it is not a cut: every step at 0.5 (0.9 made a radial smear of her face)
U_FACE = [0.0, 0.0, .62, .94, 1.0]                      # three moving steps = 5 frames (round 2a's four smeared 7)
T_G1 = stepwin(T_G, [.5, .5, .5, .5])
u_face = steps_curve(T_G, U_FACE, 'lin')
_t0v = HP - K_F0 * TOG_C; _t1v = np.array([540.0, 960.0]) - K_F1 * FACE_C
def geo_face(t, k):
    u = u_face(t); kk = K_F0 * (K_F1 / K_F0) ** u
    # translation eased slightly ahead of the scale so the bottom edge stays covered mid-move
    uu = 1 - (1 - u) ** 1.35; tv = _t0v + (_t1v - _t0v) * uu
    return np.array([[kk, 0, tv[0]], [0, kk, tv[1]], [0, 0, 1.0]])
FACE_DUR = .80
T_H = T_G + FACE_DUR
add('face', PK.F, T_G, T_H, geo_face, 1.6, inp=FACE_T0)

# =====================================================================================================================
# H. The lid enters RISING (her head and hand lift through the face hold) and settles on the card's logo box, the
# centre of frame 1's macro. A true still (0.667, the crispest foil), never half-speed held frames. The print holds,
# becomes the vector logo (the reel's one dissolve), and the card arrives.
# =====================================================================================================================
LID_K = 20
RISE = [230.0, 50.0, 8.0, 0.0]
T_H1 = stepwin(T_H, [.9, .5, .5])
lid_rise = steps_curve(T_H, RISE, 'lin')
def geo_lid(t, k): return T(0, lid_rise(t)) @ lid_M(WHS['pk_lid1'][LID_K], LW_CARD, CY_CARD)
T_DIS = T_H1 + .30
DIS_DUR = .42
LINES_AT = T_DIS + DIS_DUR + .04
add('lid_end', PK.F, T_H, T_DIS + DIS_DUR + .05, geo_lid, 1.6, freeze=LID_K)

# the card: ivory, sage logo, the ladder, the whole deal as ONE line (a sum, not a struck subtotal), the facts
HANDLES = ['cushion-halo-ring', 'toggle-link-chain', 'brushed-gold-huggies', 'woven-gold-hoops']
SUB, TOT, RATE = K.bag_total(HANDLES)
def card_lines():
    r = K.OFFER['rungs']
    L = [('t', f'BUY {q}  ·  {p}% OFF', 34, K.DEEP, 14) for q, p in r]
    L[-1] = L[-1][:4] + (30,)
    deal = K.hrow([K.text(f'{len(HANDLES)} PIECES', 'jost', 26, 500, .24, color=K.INK, shadow=0),
                   K.text(f'{K.rs(SUB)}  →  {K.rs(TOT)}', 'cg', 50, 600, 0, color=K.INK, shadow=0)], gap=22)
    L.append(('img', deal, 50, None, 34))
    L += [('t', 'APPLIED IN THE BAG', 24, (112, 104, 98), 38),
          ('t', 'COD AVAILABLE  ·  FREE INSURED SHIPPING', 24, K.INK, 40),
          ('c', 'nairaflore.com', 46, K.DEEP, 0)]
    return L
LINE_GAP = .06
N_CARD_LINES = len(card_lines())
CARD_DONE = LINES_AT + LINE_GAP * (N_CARD_LINES - 1) + .25
DUR = math.ceil((CARD_DONE + 1.62) * 30) / 30

def endcard(t0, t1):
    g = np.zeros((H, W, 4), np.uint8); g[..., :3] = K.IVORY; g[..., 3] = 255
    P.overlay(g, 0, 0, t0, t1, fin=DIS_DUR, fout=0, rise=0)
    Lg = K.logo(LW_CARD); P.overlay(Lg, (W - LW_CARD) / 2, LY_CARD, t0, t1, fin=DIS_DUR, fout=0, rise=0)
    y = LY_CARD + Lg.shape[0] + 62
    for i, (kind, s_, size, col, gap) in enumerate(card_lines()):
        if kind == 'img': tp = (s_[0], s_[1])
        else: tp = K.text(s_, 'jost' if kind == 't' else 'cgi', size, 500, .22 if kind == 't' else 0, color=col, shadow=0)[:2]
        K.place(P, tp, W / 2, y, LINES_AT + LINE_GAP * i, t1, fin=.25, fout=0, rise=6)
        y += size + gap
    return y
CARD_BOTTOM = endcard(T_DIS, DUR + 1)

# =====================================================================================================================
# TYPE: one line per hold, Jost tracked caps; ink on the pale lid and the wood. 4-frame fades.
# =====================================================================================================================
TYPE = []
def line(s, t0, t1, y, color=K.INK, size=46, shadow=.30, cx=540):
    TYPE.append((s, t0, t1, y, size, cx))
    return K.super_line(P, s, t0, t1, y=y, size=size, cx=cx, color=color, shadow=shadow, fin=.133, fout=.133)
R2, R3, R4_ = K.OFFER['rungs']
def line_rot(s, t0, t1, cx, cy, ang, size=40, color=K.INK, shadow=.30):
    """one super laid along Pankti's tilted lid like a second printed line (her own lid angle; horizontal type across
    a 16 deg lid straddled its corner in round 1). Rotated premultiplied so the edges do not darken."""
    TYPE.append((s, t0, t1, cy, size, cx))
    img = K.text(s, 'jost', size, 500, .24, color=color, shadow=shadow)[0].astype(np.float32) / 255
    img[..., :3] *= img[..., 3:4]
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), -ang, 1.0)
    c, sn = abs(M[0, 0]), abs(M[0, 1]); nw, nh = int(w * c + h * sn) + 4, int(w * sn + h * c) + 4
    M[0, 2] += nw / 2 - w / 2; M[1, 2] += nh / 2 - h / 2
    r = cv2.warpAffine(img, M, (nw, nh), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_CONSTANT, borderValue=0)
    r = np.clip(r, 0, 1); r[..., :3] = r[..., :3] / np.maximum(r[..., 3:4], 1e-4)
    return P.overlay((np.clip(r, 0, 1) * 255 + .5).astype(np.uint8), cx - nw / 2, cy - nh / 2, t0, t1, fin=.133, fout=.133, rise=0)
line(f'BUY {R4_[0]}  ·  {R4_[1]}% OFF', T_B + .05, T_M1 - .04, y=740, size=58)
ROT_L1 = (655, 585, 19.0, 42); ROT_L2 = (660, 640, 15.0, 42)
line_rot(f'{R2[0]} IN THE BAG  ·  {R2[1]}% OFF', T_L1 + .05, T_S1 - .04, *ROT_L1)
line_rot(f'{R3[0]} IN THE BAG  ·  {R3[1]}% OFF', T_S1 + (HUG_REVEAL_K - S1_K0) / 30, T_M2 - .04, *ROT_L2)
line(f'{R4_[0]} IN THE BAG  ·  {R4_[1]}% OFF', T_L3 + .05, T_D - .04, y=330, size=46)


# =====================================================================================================================
# checks, sheets, sound
# =====================================================================================================================
VERBOSE = os.environ.get('VERBOSE')
def check(names=None):
    bad = []
    for L in LAYERS:
        if names and not any(n in L.name for n in names): continue
        n0, n1 = int(math.ceil(L.t0 * 30 - 1e-6)), int(math.ceil(min(L.t1, DUR) * 30 - 1e-6))
        worst, kmax, kmin = -1e9, 0.0, 99.0
        sw, sh = L.F.size
        for n in range(n0, n1):
            tq, shut = P.clock(n / 30)
            if tq < L.t0 or tq >= L.t1: continue
            L.k_now = L.src_index(tq)
            for tt in np.linspace(tq, tq + shut, 5):
                o = over(L.matrix(tt), sw, sh); worst = max(worst, o)
                if VERBOSE and o > .5: print(f'   {L.name} frame {n} t {tq:.3f} over {o:.0f}')
            k = L.local_k(L.matrix(tq)); kmax = max(kmax, k); kmin = min(kmin, k)
        cap = L.cap
        flag = ('  OUTSIDE %.0f px' % worst if worst > .5 else '') + ('  OVER CAP' if cap and kmax > cap + 1e-3 else '')
        print(f'{L.name:22s} t {L.t0:6.3f}-{min(L.t1, DUR):6.3f}  k {kmin:.2f}-{kmax:.2f} cap {cap}{flag}')
        if flag: bad.append(L.name)
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


class Mix4(K.Mix):
    def drawer(self, t, d=.55, v=1.0):
        """the kit's paperboard slide, its hiss shelved ~8 dB above 3 kHz (round 1's was the brightest thing in the
        mix, 37 dB over the bed in 3-8 kHz)"""
        n = int(d * K.SR); tt = K.T(n); u = tt / d
        grain = K.bp(K._rng.standard_normal(n), 380, 2600, 2) * (1 + .6 * np.sin(2 * np.pi * (22 + 12 * u) * tt))
        grain = K.lp(grain, 3000, 2) * .6 + K.lp(grain, 1200, 2) * .5
        env = np.sin(np.pi * np.minimum(1, u * 1.05)) ** 1.2
        y = grain * env * .10
        stop = self._felt(.9, 9)[:, 0]
        y = np.concatenate([y, np.zeros(len(stop))]); y[n - 300:n - 300 + len(stop)] += stop * 1.2
        self.put(self.fx, np.stack([y, y], 1) * v, t)
    def thump(self, t, v=1.0):
        """the felt tap's own body pitched down an octave and a half for the whip's cut: the same kind of sound, lower"""
        n = int(.09 * K.SR); tt = K.T(n)
        y = np.sin(2 * np.pi * (68 + 30 * np.exp(-tt / .02)) * tt) * np.exp(-tt / .028) * .55
        y += K.lp(K._rng.standard_normal(n), 500, 2) * np.exp(-tt / .006) * .25
        self.put(self.fx, np.stack([y, y], 1) * v * .35, t)


def mix(out_wav):
    """three kinds only: the beatless string pad, felt taps (with one low felt body on the whip) and drawer foley.
    No whoosh, no tings, no song, no voice. The pad dips 6 dB under the worn holds and opens into the card."""
    m = Mix4(DUR)
    m.pad([(0.0, [47, 54, 59, 62, 66]), (T_S1 - .3, [50, 57, 62, 64, 66]), (T_D - .2, [43, 50, 59, 62, 66]),
           (T_DIS + .05, [50, 57, 62, 66, 69])])
    m.felt(0.0, v=.95, seed=1)                                                  # frame 1
    m.felt(3 * STEP, v=.75, seed=2); m.felt(T_B, v=.8, seed=4)                  # the two lid-lock changes
    m.drawer(T_B + .06, d=.80, v=1.0)                                           # Riya's drawer slides out
    m.felt(T_M1 + 2 * STEP, v=.9, seed=3)                                       # M1 cut
    m.felt(T_S1, v=.85, seed=11)                                                # the drawer snaps shut (S1 swap)
    m.drawer(T_S1 + .12, d=.42, v=.55)                                          # ... and slides open for real
    m.felt(T_M2 + 2 * STEP, v=.9, seed=12)                                      # M2 cut
    m.thump(T_CUT, v=.7)                                                        # the whip's cut
    m.felt(T_F, v=.9, seed=6); m.felt(T_G, v=.7, seed=7); m.felt(T_H, v=.8, seed=8)
    # the bed: -6 dB from the whip through the worn holds, then back up (and a touch over) for the card
    m.duck += [(T_D - .1, T_H, -10.0), (0.0, T_D - .1, -3.5)]
    return m.master(out_wav)


def lra(wav):
    """short-term loudness range (EBU 3342 style, 3 s windows): the 10th-95th percentile spread, LU"""
    import soundfile as sf
    x, sr = sf.read(wav, always_2d=True)
    hop, win = int(.1 * sr), int(3 * sr); st = []
    for i in range(0, len(x) - win + 1, hop):
        st.append(K.lufs(x[i:i + win]))
    st = np.array([s for s in st if s > -70]); rel = st[st > st.mean() - 20] if len(st) else st
    return float(np.percentile(rel, 95) - np.percentile(rel, 10)) if len(rel) else 0.0


TIMES = dict(T_B=T_B, T_M1=T_M1, T_L1=T_L1, T_S1=T_S1, T_M2=T_M2, T_L3=T_L3, T_D=T_D, T_CUT=T_CUT, T_E=T_E, T_F=T_F,
             T_G=T_G, T_G1=T_G1, T_H=T_H, T_H1=T_H1, T_DIS=T_DIS, LINES_AT=LINES_AT, CARD_DONE=CARD_DONE, DUR=DUR)

if __name__ == '__main__':
    mode = sys.argv[1] if len(sys.argv) > 1 else 'check'
    print(' '.join(f'{k} {v:.3f}' for k, v in TIMES.items()), '| frames', [k for k in ()])
    print('C_SLIDE', np.round(C_SLIDE, 1), 'card bottom', CARD_BOTTOM, 'deal', SUB, TOT, RATE)
    if mode == 'check':
        print('bad', check(sys.argv[2:] or None))
    if mode == 'part':
        a, b = int(sys.argv[2]), int(sys.argv[3])
        d = f'{R4}/part'; shutil.rmtree(d, ignore_errors=True)
        P.render(d, DUR, start=a, stop=b, workers=int(os.environ.get('WK', 2)))
        os.makedirs(f'{R4}/look', exist_ok=True)
        sheet(d, f'{R4}/look/part_{a}_{b}.jpg', cols=int(sys.argv[4]) if len(sys.argv) > 4 else 10)
    if mode == 'frames':
        os.makedirs(f'{R4}/one', exist_ok=True)
        for a in sys.argv[2:]:
            i = int(a); img = P.frame(i / 30)
            cv2.imwrite(f'{R4}/one/f_{i + 1:04d}.jpg', cv2.cvtColor((img * 255 + .5).astype(np.uint8), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 95])
    if mode == 'mix':
        wav = f'{R4}/{SLUG}.wav'; print('mix', mix(wav), 'LRA', round(lra(wav), 2))
    if mode in ('full', 'sheets'):
        N = int(round(DUR * 30)); d = f'{R4}/final'
        if mode == 'full':
            shutil.rmtree(d, ignore_errors=True)
            P.render(d, DUR, workers=int(os.environ.get('WK', 2)))
            wav = f'{R4}/{SLUG}.wav'; print('mix', mix(wav), 'LRA', round(lra(wav), 2))
            os.makedirs(OUT, exist_ok=True)
            K.encode(d, wav, f'{OUT}/{SLUG}.mp4'); K.encode(d, wav, f'{OUT}/{SLUG}-4x5.mp4', crop45=True)
            for fn in (f'{OUT}/{SLUG}.mp4', f'{OUT}/{SLUG}-4x5.mp4'): print(fn, K.probe(fn))
        sheet(d, f'{OUT}/{SLUG}-sheet.jpg', frames=list(range(0, N, 10)), cols=10, w=162)
        f = lambda t: int(round(t * 30))
        TS = {'1-lidlock-slide': (0, f(T_M1) + 2), '2-drawer-cycle': (f(T_M1) - 2, f(T_D) + 2),
              '3-whip-flip-hoop': (f(T_D) - 4, f(T_F) + 4), '4-circle-swap-face': (f(T_F) - 4, f(T_H) + 2),
              '5-lid-logo-card': (f(T_H) - 4, N)}
        for nm, (a, b) in TS.items():
            sheet(d, f'{OUT}/{SLUG}-tr{nm}.jpg', frames=list(range(a, b)), cols=10, w=162)
        print('frames', N)
