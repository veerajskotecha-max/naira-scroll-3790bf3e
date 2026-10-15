"""Extends the DP frame upward by SH rows so her head clears the masthead, with nothing invented on her.
Usage: python3 -I fill_top.py dp_1080.png her_cut.png <SH> <bg.png> <her.png>
The plain wall above the wallpaper is synthesised from its own colour; the brick wallpaper is continued by a per-column
vertical repeat that follows the wall's perspective; the curtain by copying its own texture upward. Seams are min-cut.
Every constant below was measured on THIS frame (62379666 @ 4.00 s); another frame needs them measured again."""
import sys, json
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter, gaussian_filter1d

frame, cut, SH, out_bg, out_her = sys.argv[1], sys.argv[2], int(sys.argv[3]), sys.argv[4], sys.argv[5]
rng = np.random.default_rng(7)
img = np.asarray(Image.open(frame).convert('RGB')).astype(np.float32)
cutA = np.asarray(Image.open(cut))
alpha = cutA[..., 3].astype(np.float32) / 255
H, W = img.shape[:2]
C = np.zeros((H + SH, W, 3), np.float32); C[SH:] = img
hair = np.zeros((H + SH, W), bool); hair[SH:] = alpha > 0.08
r_of = lambda y_in: y_in + SH

EM, EC = 0.4605, -210.19            # wallpaper's top edge, fitted on the visible beige wedge (max residual 4 px)
XC = 671                             # curtain's left boundary (vertical)
xs = np.arange(W)
y_edge = EM * xs + EC

def mincut(cost):
    """min-cost left-to-right path through cost[rows, cols], |dy|<=1 per column."""
    R, N = cost.shape
    acc = cost.copy(); back = np.zeros((R, N), np.int8)
    for j in range(1, N):
        prev = acc[:, j-1]
        up = np.r_[np.inf, prev[:-1]]; dn = np.r_[prev[1:], np.inf]
        stack = np.vstack([up, prev, dn]); k = stack.argmin(0)
        acc[:, j] += stack[k, np.arange(R)]; back[:, j] = k - 1
    path = np.zeros(N, int); path[-1] = acc[:, -1].argmin()
    for j in range(N-1, 0, -1):
        path[j-1] = path[j] + back[path[j], j]
    return path

def quilt(cols, y_top, T_of, OV, y_seam0):
    """Fill rows [y_top(x), y_seam0+seam) of columns `cols` from row+T_of(x); seam inside the
    overlap rows [y_seam0, y_seam0+OV) that are already known."""
    cols = np.asarray(cols)
    T = np.array([T_of(x) for x in cols])
    rows = np.arange(OV)
    cur = C[r_of(y_seam0 + rows)[:, None], cols[None, :]]
    src = C[r_of(y_seam0 + rows[:, None] + T[None, :]), cols[None, :]]
    cost = ((cur - src) ** 2).sum(-1)
    cost = gaussian_filter(cost, 1.0)
    bad = hair[r_of(y_seam0 + rows[:, None] + T[None, :]), cols[None, :]]
    cost[bad] += 1e7
    seam = mincut(cost)
    for j, x in enumerate(cols):
        yt = int(np.floor(y_top(x))); ys = y_seam0 + seam[j]
        y = np.arange(yt, ys + 3)
        s = C[r_of(y + T[j]), x]
        w = np.clip((ys + 2 - y) / 4.0, 0, 1)[:, None]      # 4px feather into the known rows
        known = r_of(y) >= SH
        tgt = C[r_of(y), x]
        C[r_of(y), x] = np.where(known[:, None], w * s + (1 - w) * tgt, s)
        hair[r_of(y[~known]), x] = hair[r_of(y[~known] + T[j]), x]
    return seam

# ---------- 1. bricks (columns where the wallpaper edge lies above the frame) ----------
# Vertical repeat of two courses per column, measured by NCC on the visible wall. It shrinks to the right because
# the wall recedes (vertical lines stay vertical, so the vertical scale is linear in x); one course would
# mismatch the staggered joints.
meas = np.array([(40,276),(60,273),(80,271),(100,266),(120,264),(140,263),(160,258),(180,258),
                 (220,254),(240,245),(260,243),(280,241),(300,239),(320,236),(340,235)], float)
q = np.polyfit(meas[:,0], meas[:,1], 2)
def T_brick(x):
    if x <= 340: return int(round(np.polyval(q, max(x, 20))))
    d = 2*q[0]*340 + q[1]
    return int(round(np.polyval(q, 340) + d * (x - 340)))
bcols = [x for x in range(0, XC) if y_edge[x] < 0]
quilt(bcols, lambda x: max(-SH, y_edge[x] - 3), T_brick, 30, 0)

# ---------- 2. plain wall above the wallpaper ----------
# per-column colour from the visible beige wedge, plateau to the left of it
prof = np.zeros((W, 3), np.float32); have = np.zeros(W, bool)
for x in range(460, XC):
    ye = int(y_edge[x]) - 4
    if ye >= 12: prof[x] = img[0:ye, x].mean(0); have[x] = True   # thinner columns are mostly edge rim
plateau = img[0:12, 492:546].reshape(-1, 3).mean(0)
first = np.argmax(have)
prof[:first] = plateau
for ch in range(3): prof[:XC, ch] = gaussian_filter1d(prof[:XC, ch], 5, mode='nearest')
noise = gaussian_filter(rng.standard_normal((SH + 200, W)), 0.9)
noise /= noise.std()
chroma = gaussian_filter(rng.standard_normal((SH + 200, W, 3)), (1.2, 1.2, 0)); chroma /= chroma.std()
sig = np.array([2.6, 3.2, 3.9], np.float32)
for x in range(0, XC):
    ytop = -SH; ybot = int(np.ceil(min(y_edge[x], 0) + 2)) if y_edge[x] < 0 else int(np.ceil(y_edge[x] + 2))
    y = np.arange(ytop, ybot)
    col = prof[x][None, :] + noise[r_of(y), x, None] * sig * 0.8 + chroma[r_of(y), x] * sig * 0.35
    # soft 4px transition across the wallpaper edge (beige above, wallpaper below)
    d = (y - y_edge[x]) * np.cos(np.arctan(EM))
    a = np.clip(0.5 - d / 4.0, 0, 1)[:, None]                # 1 = beige
    tgt = C[r_of(y), x]
    keep_orig = (r_of(y) >= SH)[:, None] & (d[:, None] < -2)  # real beige stays real
    newc = a * col + (1 - a) * tgt
    C[r_of(y), x] = np.where(keep_orig, tgt, newc)

# ---------- 3. curtain: upward passes of copied texture, folds re-aligned at each seam ----------
# The folds lean a few px over a couple of hundred rows, so a straight copy jogs them at the
# seam. Each pass shifts the copied block sideways per column so its folds meet the real ones.
ccols = np.arange(XC, W)
def fold_profile(y0, n, cols):
    return C[r_of(y0):r_of(y0) + n][:, cols].mean(0).mean(-1)
def align_dx(y_tgt, y_src, n=24, win=40, maxd=14):
    ext = np.arange(XC - 30, W)
    pt = fold_profile(y_tgt, n, ext); ps = fold_profile(y_src, n, ext)
    pt = pt - gaussian_filter1d(pt, 30); ps = ps - gaussian_filter1d(ps, 30)
    centers = np.arange(XC, W, 8); dxs = []
    for cx in centers:
        i = cx - ext[0]; lo, hi = max(i - win//2, maxd), min(i + win//2, len(ext) - maxd)
        if hi - lo < 12: dxs.append(np.nan); continue
        a = pt[lo:hi]; best = (0, -1e9)
        for d in range(-maxd, maxd + 1):
            b = ps[lo + d:hi + d]
            v = float(((a - a.mean()) * (b - b.mean())).sum() / (np.sqrt(((a - a.mean())**2).sum() * ((b - b.mean())**2).sum()) + 1e-6))
            if v > best[1]: best = (d, v)
        dxs.append(best[0] if best[1] > 0.3 else np.nan)
    dxs = np.array(dxs, float)
    ok = ~np.isnan(dxs)
    dx = np.interp(ccols, centers[ok], dxs[ok]) if ok.any() else np.zeros(len(ccols))
    dx = gaussian_filter1d(dx, 6, mode='nearest')
    # the curtain's edge band is plumb: no sideways shift at the wall, and never sample past either edge
    dx *= np.clip((ccols - XC) / 24.0, 0, 1) * np.clip(((W - 1) - ccols - 2) / 40.0, 0, 1)
    return np.clip(dx, -(ccols - XC), (W - 1.001) - ccols)
def sample_cols(rows_r, xf):
    x0 = np.clip(np.floor(xf).astype(int), 0, W - 2); f = (xf - x0)[None, :, None]
    return C[rows_r[:, None], x0[None, :]] * (1 - f) + C[rows_r[:, None], x0[None, :] + 1] * f
def curtain_pass(y_top, y_seam0, T, OV):
    dx = align_dx(y_seam0, y_seam0 + T)
    xf = np.clip(ccols + dx, 0, W - 1.001)
    rows = np.arange(OV)
    cur = C[r_of(y_seam0 + rows)][:, ccols]
    src = sample_cols(r_of(y_seam0 + rows + T), xf)
    cost = gaussian_filter(((cur - src) ** 2).sum(-1), 1.0)
    seam = mincut(cost)
    y = np.arange(y_top, y_seam0 + OV)
    blk = sample_cols(r_of(y + T), xf)
    for j, x in enumerate(ccols):
        ys = y_seam0 + seam[j]
        w = np.clip((ys + 2 - y) / 4.0, 0, 1)[:, None]
        tgt = C[r_of(y), x]
        filled = r_of(y) < r_of(y_seam0)
        C[r_of(y), x] = np.where(filled[:, None], blk[:, j], w * blk[:, j] + (1 - w) * tgt)
    return float(np.abs(dx).max())
def best_T(y0, OV, lo, hi, n_up):
    best = None
    for T in range(lo, hi):
        rows = np.arange(OV)
        rr = r_of(y0 + rows[:, None] + T)
        if r_of(y0 - n_up + T) < 0 or (rr >= H + SH).any(): continue
        if hair[rr, ccols[None, :]].any(): continue
        dx = align_dx(y0, y0 + T)
        src = sample_cols(r_of(y0 + rows + T), np.clip(ccols + dx, 0, W - 1.001))
        cur = C[r_of(y0 + rows)][:, ccols]
        v = float(np.median(((cur - src) ** 2).sum(-1).mean(0)))
        if best is None or v < best[1]: best = (T, v)
    return best
OV = 30
b1 = best_T(0, OV, 150, 262, SH // 2)
m1 = curtain_pass(-SH // 2, 0, b1[0], OV)
b2 = best_T(-SH // 2, OV, 150, 300, SH // 2)
if b2 is None or b2[0] == b1[0]: b2 = (b1[0] + 17, 0)
m2 = curtain_pass(-SH, -SH // 2, b2[0], OV)
# the curtain's edge band is a plain dark strip: give it its own steady column profile so
# no light flecks from the source rows repeat up it
band = np.arange(XC - 1, XC + 24)
med = img[0:16, band].mean(0)                                 # matches the real band where they meet
bn = gaussian_filter(rng.standard_normal((SH, len(band))), (2.5, 0.7)); bn /= bn.std()
for j, x in enumerate(band):
    w = np.clip((XC + 23 - x) / 5.0, 0, 1)                      # fade into the copied curtain
    C[0:SH, x] = w * (med[j][None, :] + bn[:, j, None] * 2.5) + (1 - w) * C[0:SH, x]
print(json.dumps({'T_brick_0': T_brick(0), 'T_brick_456': T_brick(456), 'curtain_T': [b1[0], b2[0]], 'max_dx': [m1, m2]}))

out = np.clip(C[:H], 0, 255).astype(np.uint8)
Image.fromarray(out).save(out_bg)
oc = np.zeros_like(cutA); oc[SH:] = cutA[:-SH]
Image.fromarray(oc).save(out_her)
