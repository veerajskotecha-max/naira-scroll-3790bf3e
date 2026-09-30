"""Follow a gold ring through a shot: Hough circles on a gold-ness map (Lab b minus a floor, only where
it is bright), searched near the last position, preferring the circle whose rim is really gold and whose
radius stays close to the last one, so it does not hop to the smaller pave ring beside it."""
import cv2, json, os, sys, numpy as np
FRAMES = os.environ.get("FRAMES", "frames")
def gold(f):
    im = cv2.imread(f"{FRAMES}/f_{f:05d}.jpg"); lab = cv2.cvtColor(im, cv2.COLOR_BGR2LAB).astype(np.float32)
    g = np.clip((lab[:, :, 2] - 128 - 8) * 6, 0, 255) * (lab[:, :, 0] > 90)
    return cv2.GaussianBlur(g.astype(np.uint8), (5, 5), 1.5)
def run(f0, f1, x, y, r, win=130):
    out = {}; cx, cy, cr = x, y, r
    st = 1 if f1 >= f0 else -1
    for f in range(f0, f1 + st, st):
        g = gold(f); x0, y0 = max(0, cx - win), max(0, cy - win); sub = g[y0:cy + win, x0:cx + win]
        cs = cv2.HoughCircles(sub, cv2.HOUGH_GRADIENT, dp=1.2, minDist=15, param1=80, param2=16,
                              minRadius=int(cr * .82), maxRadius=int(cr * 1.22))
        best = None
        if cs is not None:
            for c in cs[0]:
                px, py, pr = c[0] + x0, c[1] + y0, c[2]; ang = np.linspace(0, 2 * np.pi, 64)
                rim = g[np.clip((py + pr * np.sin(ang)).astype(int), 0, 1919), np.clip((px + pr * np.cos(ang)).astype(int), 0, 1079)]
                sc = rim.mean() - 0.5 * np.hypot(px - cx, py - cy) - 2.0 * abs(pr - cr)
                if best is None or sc > best[3]: best = (px, py, pr, sc)
        if best is not None and np.hypot(best[0] - cx, best[1] - cy) < 70:
            cx, cy = int(best[0]), int(best[1]); cr = .7 * cr + .3 * float(best[2]); ok = 1
        else: ok = 0
        out[f] = (cx, cy, round(cr, 1), ok)
    return out
spec = json.load(open(sys.argv[1])); res = {}
for n, s in spec.items():
    o = run(**s); res[n] = {str(k): v for k, v in o.items()}; print(n, 'found', sum(v[3] for v in o.values()), '/', len(o))
json.dump(res, open(sys.argv[2], 'w'))
