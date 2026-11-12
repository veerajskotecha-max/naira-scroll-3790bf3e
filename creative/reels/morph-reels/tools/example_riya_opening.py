"""Kit test: Riya's opening 3.2 s. Hoop tray pull-back (18 fps, expo-out), hold with the offer, zoom-through the
left hoop's dark centre into the drawer velvet (cut on the blurred frame), settle on the ring, registered swap
drawer -> hand. Coordinates are 4K source px (2160x3840)."""
import sys, os, math
sys.path.insert(0, '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/tools')
import numpy as np
import mx, mxkit as K, track as TR

S = K.S; SRC = f'{S}/src/riya_F67FB13D.mp4'; OUT = f'{S}/mx/riya/proto'
SW, SH = 2160, 3840
P = mx.Plate(1080, 1920, fps=30, shutter=.5)
STEP = 1 / 18

# ---- 1. hoop tray, stabilised on the left hoop ----
A1 = P.layer(src=SRC, t0=0, t1=2.0, inp=17.0, speed=.45, name='hoops')
F = A1.F
k17 = int(round((17.4 - (17.0 - 1 / 30)) * 30))                     # the decoded frame of 17.4
trk = TR.tmatch(F, k17, [880, 2610, 1160, 2890], range(F.n), search=1.8)
ref = trk[k17]
off = lambda k: (trk.get(k, ref)[0] - ref[0], trk.get(k, ref)[1] - ref[1])

LH, MID = (1020, 2750), (1255, 2680)                               # left hoop centre, between the hoops (17.4)
# the reference's pull-back: per-step scale 0.80, 0.917 ... 1.0, mapped onto our x1.44 (k 1.30 -> 0.90)
ratios = [1, .80, .917, .932, .946, .957, .966, .977, .987, .996, 1.0]
cum = np.cumprod(ratios); u = np.log(cum) / np.log(cum[-1])         # 0 -> 1, fast first
k0, k1 = 1.30, 0.90
kk = k0 * (k1 / k0) ** u
start = (990, 2700)
ax = start[0] + (MID[0] - start[0]) * u; ay = start[1] + (MID[1] - start[1]) * u
py = 1000

def cam_a(t):
    k = A1.k_now if hasattr(A1, 'k_now') else 0
    dx, dy = off(k)
    i = t / STEP
    if i >= len(u) - 1: kv, x, y = kk[-1], ax[-1], ay[-1]
    else:
        j = int(max(0, math.floor(i))); f = i - j
        kv = kk[j] * (kk[j + 1] / kk[j]) ** f; x = ax[j] + (ax[j + 1] - ax[j]) * f; y = ay[j] + (ay[j + 1] - ay[j]) * f
    return {'k': kv, 'x': (x + dx) / SW, 'y': (y + dy) / SH, 'px': 540, 'py': py}
A1.camf = cam_a
P.steps.append((0, 10 * STEP, 18, .9))

# ---- 2. zoom-through the left hoop's hole: the group camera pushes x2.05 about it while panning it to the centre ----
T_Z = 1.40; NZ = 9; T_CUT = T_Z + NZ * STEP                         # 1.90
hole_c = (540 + (LH[0] - MID[0]) * k1, py + (LH[1] - MID[1]) * k1)  # where the hole sits on screen in the hold
zin = np.cumprod([1, 1.009, 1.021, 1.034, 1.050, 1.068, 1.089, 1.117, 1.159, 1.220])
zout = np.cumprod([.84, .91, .94, .95])             # emerge: the drawer arrives close and pulls back
target = (540, 1150)
gk = [[0, {'gs': 1.0, 'gtx': 0.0, 'gty': 0.0, 'gx': hole_c[0], 'gy': hole_c[1]}, 'lin'], [T_Z, {'gs': 1.0, 'gtx': 0.0, 'gty': 0.0}, 'lin']]
for i in range(1, NZ + 1):
    w = (i / NZ) ** 2
    gk.append([T_Z + i * STEP, {'gs': float(zin[i]), 'gtx': (target[0] - hole_c[0]) * w, 'gty': (target[1] - hole_c[1]) * w}, 'lin'])
for i, z in enumerate(zout):
    gk.append([T_CUT + (i + 1) * STEP, {'gs': float(zin[-1] * z)}, 'lin'])
P.gkeys = gk
P.steps.append((T_Z, T_CUT + 4 * STEP, 18, .9))
A1.t1 = T_CUT

# ---- 3. the drawer, ring head on the hole's screen point; it rides the same group camera, so its own k is the
# k we want at rest divided by the group's final scale ----
G_END = float(zin[-1] * zout[-1])
B = P.layer(src=SRC, t0=T_CUT, t1=2.62, inp=6.20, speed=.5, name='drawer')
FB = B.F
kb = int(round((6.27 - (6.20 - 1 / 30)) * 30))
trkB = TR.tmatch(FB, kb, [1070, 2370, 1255, 2560], range(FB.n), search=1.8)
refB = trkB[kb]
RING_K = .95
def cam_b(t):
    c = trkB.get(B.k_now, refB)
    # the hole centre is the group pivot; the group translation already carries it to `target`
    return {'k': RING_K / G_END, 'x': c[0] / SW, 'y': c[1] / SH, 'px': hole_c[0], 'py': hole_c[1]}
B.camf = cam_b

# ---- 4. registered swap: drawer 9.667 -> her hand 10.133, the ring head fixed (scale .92) ----
T_SW = 2.62
B2 = P.layer(src=SRC, t0=T_SW, t1=3.25, inp=9.60, speed=0, freeze=None, group=False, name='drawer2')
B2.t1 = T_SW + 2 * STEP
C = P.layer(src=SRC, t0=T_SW + 2 * STEP, t1=3.25, inp=10.133, speed=1, group=False, name='hand')
FC = C.F
kc = int(round((10.133 - (10.133 - 1 / 30)) * 30))
trkC = TR.tmatch(FC, kc, [900, 1960, 1060, 2120], range(FC.n), search=1.8)
refC = trkC[kc]
FB2 = B2.F; kb2 = int(round((9.667 - (9.60 - 1 / 30)) * 30)); B2.freeze = kb2
trkB2 = TR.tmatch(FB2, kb2, [1080, 2370, 1265, 2560], [kb2], search=1.8)
pB2 = trkB2[kb2]
B2.camf = lambda t: {'k': RING_K, 'x': pB2[0] / SW, 'y': pB2[1] / SH, 'px': target[0], 'py': target[1]}
C.camf = lambda t: {'k': RING_K * .92 * 184 / 170, 'x': trkC.get(C.k_now, refC)[0] / SW, 'y': trkC.get(C.k_now, refC)[1] / SH,
                    'px': target[0], 'py': target[1]}

# ---- type on the holds ----
K.place(P, K.stack([K.text('BUY 3 · 20% OFF', 'jost', 34, 500, .24, color=K.INK, shadow=.5), K.text('APPLIED IN THE BAG', 'jost', 22, 500, .24, color=K.INK, shadow=.5)], gap=14), 540, 300, .70, 1.38)
K.price_line(P, 'Cushion Halo Ring', 999, 1429, 2.02, 2.60, y=1360)

DUR = 3.25
if __name__ == '__main__':
    n = P.render(OUT, DUR)
    mx.sheet(OUT, f'{S}/mx/riya/proto_sheet.jpg', every=2, cols=10, w=162)
    print('frames', n, 'track A', len(trk), 'B', len(trkB), 'C', len(trkC))
