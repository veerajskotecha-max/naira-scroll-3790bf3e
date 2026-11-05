"""disc_fix.py <frames_dir> <scale> <first> <last> <ref>: hold the Woven Hoops' right catch disc gold through the AI clip's
drift. Between frames ~44 and ~90 the generated disc slides from polished gold to a translucent orange (a review flagged it
as the clip's loudest AI tell). The hoops do not move, so a fixed feathered ellipse covers the disc; inside it each frame's
chroma (YCbCr) is shifted to the clean reference frame's disc while the luminance is kept, so the texture and highlights
stay and nothing is amplified (a per-channel gain pushed blue x23 and fringed the rim purple). Petals keep falling past (the frame is not
replaced, only graded), and a frame whose disc already matches is left as it is. Rewrites frames in place."""
import sys
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np
from PIL import Image
from scipy.ndimage import gaussian_filter

d, sc, a, b, ref = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
def load(k): return np.asarray(Image.open(f'{d}/f_{k:04d}.jpg').convert('RGB')).astype(np.float32)
R = load(ref); H, W = R.shape[:2]
yy, xx = np.mgrid[0:H, 0:W]
cx, cy, rx, ry = 782 * sc, 937 * sc, 84 * sc, 114 * sc            # the disc, measured on the 1080 frames
e = ((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2
mask = gaussian_filter((e < 1).astype(np.float32), 12 * sc)       # feathered edge
core = e < .55
def ycc(a):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    return np.stack([.299 * r + .587 * g + .114 * b, 128 - .168736 * r - .331264 * g + .5 * b, 128 + .5 * r - .418688 * g - .081312 * b], -1)
def rgb(c):
    y, cb, cr = c[..., 0], c[..., 1] - 128, c[..., 2] - 128
    return np.stack([y + 1.402 * cr, y - .344136 * cb - .714136 * cr, y + 1.772 * cb], -1)
cref = ycc(R)[core].mean(0)
for k in range(a, b + 1):
    C = ycc(load(k)); sh = .75 * (cref[1:] - C[core].mean(0)[1:])        # 3/4 of the way: the full shift landed olive under saffron light
    C[..., 1:] += mask[..., None] * sh
    Image.fromarray(np.clip(rgb(C) + .5, 0, 255).astype(np.uint8)).save(f'{d}/f_{k:04d}.jpg', quality=95)
    if k in (a, (a + b) // 2, b): print(k, 'chroma shift', sh.round(1))
