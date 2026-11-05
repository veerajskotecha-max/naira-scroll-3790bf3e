"""swap_frames.py <old.jpg> <new.jpg> <out_dir> <scale> [n=24]: one colourway flowing into the next along the necklace.
The listing photos of the three colourways are pixel-registered (only the stones differ), so the swap is a blend driven by
a distance map: every pixel takes the arc length of the nearest point on a hand-traced line that starts at the clasp,
runs round the loop, back past the clasp and down the tail. A soft front travels that line; a faint light rides it on the
stones only (where the two photos differ), like a turn of the wrist catching them. scale 1 = 1080x1920 frames, 2 = 4K."""
import sys, os, json
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np
from PIL import Image
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter

old_p, new_p, out, sc = sys.argv[1], sys.argv[2], sys.argv[3], float(sys.argv[4]); n = int(sys.argv[5]) if len(sys.argv) > 5 else 24
# the line, in 1080x1920 photo coordinates: the loop is an ellipse (centre 470,735; 400 x 180) from the clasp anticlockwise
# all the way round, then the strand that leaves the clasp on the right, round the outside and down the tail
th = np.radians(np.linspace(-62, -400, 240))
loop = np.stack([470 + 400 * np.cos(th), 735 + 180 * np.sin(th)], 1)
tail = np.array([(800, 560), (900, 575), (985, 620), (1032, 700), (1035, 790), (985, 875), (885, 935), (760, 975), (620, 1015),
                 (500, 1070), (420, 1140), (372, 1230), (356, 1350), (352, 1600), (350, 1990)], float)
P = np.concatenate([loop, tail]) * sc
seg = np.diff(P, axis=0); L = np.hypot(*seg.T); dense = [P[0]]; s = [0.0]
for (a, b), l in zip(zip(P[:-1], P[1:]), L):
    k = max(1, int(l / (3 * sc)))
    for j in range(1, k + 1): dense.append(a + (b - a) * j / k); s.append(s[-1] + l / k)
dense, s = np.array(dense), np.array(s); total = s[-1]
A = np.asarray(Image.open(old_p).convert('RGB')).astype(np.float32); Bm = np.asarray(Image.open(new_p).convert('RGB')).astype(np.float32)
H, W = A.shape[:2]
yy, xx = np.mgrid[0:H, 0:W]
_, idx = cKDTree(dense).query(np.stack([xx.ravel(), yy.ravel()], 1), workers=-1)
param = gaussian_filter(s[idx].reshape(H, W).astype(np.float32), 6 * sc)       # smooth the seams where two strands meet
stones = np.clip((np.abs(A - Bm).max(2) - 12) / 40, 0, 1); stones = gaussian_filter(stones, 2 * sc)
soft, glw = 260 * sc, 120 * sc
os.makedirs(out, exist_ok=True)
io = lambda u: 4 * u ** 3 if u < .5 else 1 - (-2 * u + 2) ** 3 / 2
for k in range(n):
    u = io(k / (n - 1)); front = -soft + u * (total + 2 * soft)
    m = np.clip((front - param) / soft + .5, 0, 1); m = m * m * (3 - 2 * m)
    img = A * (1 - m[..., None]) + Bm * m[..., None]
    g = .22 * np.exp(-((param - (front - .15 * soft)) / glw) ** 2) * stones * (1 if 0 < k < n - 1 else 0)
    img = img + (255 - img) * g[..., None]                                      # a screen-like lift, so whites never clip hard
    Image.fromarray(np.clip(img + .5, 0, 255).astype(np.uint8)).save(f'{out}/f_{k + 1:04d}.jpg', quality=95)
json.dump({'fps': 24, 'n': n}, open(f'{out}/meta.json', 'w'))
print(out, n, 'frames', W, 'x', H, 'line', round(total / sc), 'px')
