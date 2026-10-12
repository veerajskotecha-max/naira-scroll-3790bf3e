"""raw4.json -> eng/hoopL.json: keep detections that sit at ear height with enough gold, bridge short gaps,
smooth lightly inside each run, and store a fade factor so graphics leave before the hoop goes behind hair."""
import json, os, numpy as np
from scipy.ndimage import gaussian_filter1d
V = os.environ.get('WORK', '.') + '/v13'
T = json.load(open(f'{V}/track/raw4.json')); F = json.load(open(f'{V}/work/faces.json'))
BAD = set(range(674, 688)) | {702}            # checked by eye: fingers over the hoop, a mis-detected face
ok = {}
for f in range(1, 727):
    x, y, D, s = T[str(f)]; fc = F[str(f)]
    rel = (y - fc[1]) / fc[3]                  # the hoop hangs at 0.68-0.89 of the face box; the choker at 1.1
    if rel < .95 and s >= .14 and f not in BAD: ok[f] = (x, y, D)
# bridge gaps of up to 3 frames
fs = sorted(ok)
for a, b in zip(fs, fs[1:]):
    if 1 < b - a <= 4:
        for f in range(a + 1, b):
            p = (f - a) / (b - a); ok[f] = tuple(ok[a][i] + (ok[b][i] - ok[a][i]) * p for i in range(3))
fs = sorted(ok)
runs, cur = [], [fs[0]]
for f in fs[1:]:
    if f == cur[-1] + 1: cur.append(f)
    else: runs.append(cur); cur = [f]
runs.append(cur)
out = {}
for r in runs:
    if len(r) < 8: continue                    # too short to hang a graphic on
    xs = np.array([ok[f][0] for f in r]); ys = np.array([ok[f][1] for f in r]); ds = np.array([ok[f][2] for f in r])
    xs, ys, ds = (gaussian_filter1d(v, 1.2, mode='nearest') for v in (xs, ys, ds))
    for i, f in enumerate(r):
        # the take's own first and last frames are not occlusions, so nothing fades there
        edge = min(i if r[0] > 1 else 99, len(r) - 1 - i if r[-1] < 726 else 99)
        out[str(f)] = [round(float(xs[i]), 1), round(float(ys[i]), 1), round(float(ds[i]), 1), round(min(1.0, edge / 5), 2)]
json.dump(out, open(f'{V}/eng/hoopL.json', 'w'))
print('runs:', [(r[0], r[-1]) for r in runs if len(r) >= 8], '| frames', len(out))
