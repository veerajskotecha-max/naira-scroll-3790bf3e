"""Stones as a pair: NCC on a tight template round both stones, then tiger eye and crystal at the offsets
measured on a clean seed frame (the pair barely rotates within a shot). Replaces colour detection,
which jumped to her hair on fast frames."""
import cv2, json, numpy as np
from scipy.ndimage import median_filter, uniform_filter1d
RT = json.load(open('ring_track.json'))
F = lambda f: cv2.cvtColor(cv2.imread(f'srcf/f_{f:05d}.jpg'), cv2.COLOR_BGR2GRAY).astype(np.float32)
def track(f0, f1, seed, cx, cy, half=48, search=70):
    out = {}
    for frames in (range(seed, f1 + 1), range(seed, f0 - 1, -1)):
        x, y = cx, cy; tpl = F(seed)[y-half:y+half, x-half:x+half].copy()
        for f in frames:
            g = F(f); x0, y0 = max(0, x-half-search), max(0, y-half-search)
            r = cv2.matchTemplate(g[y0:y+half+search, x0:x+half+search], tpl, cv2.TM_CCOEFF_NORMED); _, sc, _, loc = cv2.minMaxLoc(r)
            if sc > .45: x, y = x0 + loc[0] + half, y0 + loc[1] + half
            p = g[y-half:y+half, x-half:x+half]
            if p.shape == tpl.shape and sc > .7: tpl = .9 * tpl + .1 * p
            out[f] = (x, y, sc)
    return out
res = {}
for shot, (f0, f1, seed) in {'S1': (97, 181, 125), 'S2': (182, 248, 215), 'S4': (323, 442, 373)}.items():
    r = RT[shot][str(seed)]; te = np.array(r['tiger'][:2]); c = np.array(r['c'])
    cr = np.array(r['cryst'][:2]) if r['cryst'] and 35 < np.hypot(*(np.array(r['cryst'][:2]) - te)) < 95 else c + .9 * (c - te)
    mid = ((te + cr) / 2).astype(int); ot, oc = te - mid, cr - mid
    tr = track(f0, f1, seed, int(mid[0]), int(mid[1]))
    fs = sorted(tr); arr = np.array([tr[f][:2] for f in fs], float); sc = np.array([tr[f][2] for f in fs])
    arr = np.stack([uniform_filter1d(median_filter(arr[:, k], 5, mode='nearest'), 3, mode='nearest') for k in range(2)], 1)
    for i, f in enumerate(fs):
        if sc[i] < .45: continue
        m = arr[i]; res[str(f)] = [round(float(v), 1) for v in (*m, *(m + ot), *(m + oc))]
    print(shot, 'seed', seed, 'offsets', ot.round(1), oc.round(1), 'kept', sum(sc >= .45), '/', len(fs), 'mean ncc', sc.mean().round(2))
json.dump(res, open('ring_pair.json', 'w'))
tiles = []
for f in list(range(352, 412, 3)) + list(range(190, 246, 6)):
    im = cv2.imread(f'srcf/f_{f:05d}.jpg'); r = res.get(str(f))
    if r: cv2.circle(im, (int(r[2]), int(r[3])), 36, (175, 180, 153), 5); cv2.circle(im, (int(r[4]), int(r[5])), 36, (168, 189, 255), 5)
    cy = int(r[1]) if r else 850; cx = int(r[0]) if r else 400
    c = im[max(0, cy-250):cy+250, max(0, cx-250):cx+250]; c = cv2.resize(c, (160, 160)); cv2.putText(c, str(f), (3, 14), 0, .45, (0, 255, 255), 1); tiles.append(c)
while len(tiles) % 10: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite('ring_pair_check.jpg', np.vstack([np.hstack(tiles[i:i+10]) for i in range(0, len(tiles), 10)]))
