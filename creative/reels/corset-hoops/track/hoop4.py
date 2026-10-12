"""Left-hoop detector v4 (viewer's left = her right ear).

The old gold-ratio mask let skin through (skin and gold share G/R), so the track slid onto her jaw
whenever the hoop went behind her hair. Gold here is told apart by hue (20-46 deg; skin sits at 15-19),
saturation and texture: the braid has strong local contrast, skin is smooth.
"""
import json, os, sys, numpy as np, cv2
W = os.environ.get('WORK', '.') + '/v13/work'
F = json.load(open(f'{W}/faces.json'))
out = {}
for f in range(1, 727):
    fc = F[str(f)]; fx, fy, fw, fh = fc[:4]
    x0, x1 = int(max(0, fx - .45 * fw)), int(min(1080, fx + .30 * fw))
    y0, y1 = int(max(0, fy + .45 * fh)), int(min(1920, fy + 1.15 * fh))
    bgr = cv2.imread(f'{W}/fr/f_{f:04d}.png')[y0:y1, x0:x1]
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    Hh, Ss, Vv = hsv[..., 0].astype(int), hsv[..., 1].astype(int), hsv[..., 2].astype(int)
    gold = ((Hh >= 10) & (Hh <= 23) & (Ss >= 110) & (Vv >= 70)).astype(np.float32)
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    lap = np.abs(cv2.Laplacian(cv2.GaussianBlur(g, (3, 3), 0), cv2.CV_32F))
    tex = cv2.blur(lap, (7, 7))
    m = gold * (tex > 6)
    D = max(20, int(.19 * fw)); k = np.zeros((D, D), np.float32); cv2.circle(k, (D // 2, D // 2), D // 2, 1, -1); k /= k.sum()
    sc = cv2.filter2D(m, -1, k, borderType=cv2.BORDER_CONSTANT)
    _, mx, _, loc = cv2.minMaxLoc(sc)
    cx, cy = loc
    # refine: centroid of gold pixels near the peak
    r = int(.6 * D); ys, xs = np.nonzero(m[max(0, cy - r):cy + r, max(0, cx - r):cx + r])
    if len(xs) > 5: cx, cy = max(0, cx - r) + xs.mean(), max(0, cy - r) + ys.mean()
    out[f] = [round(x0 + cx, 1), round(y0 + cy, 1), D, round(float(mx), 3)]
json.dump(out, open(sys.argv[1], 'w'))
sc = [v[3] for v in out.values()]
print('score pct', [round(float(np.percentile(sc, p)), 3) for p in (5, 25, 50, 75, 95)])
