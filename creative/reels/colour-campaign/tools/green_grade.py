"""green_grade.py <frames_dir> [--test in.jpg out.jpg]: pull an AI clip's lime emerald toward the real stone's bottle green.
Only green-dominant pixels move (weight = how far G stands above R and B), so gold, pearls and CZ are untouched: the gap
between green and blue closes by 40% and blue rises by 15% of it. The real Verdant stone measures G:B about 1.33; the AI
hook stone measured 1.88, which read as a colour change at the cut to the listing photo. Rewrites the frames in place
(back them up first)."""
import sys, glob
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np
from PIL import Image

def grade(p, out):
    a = np.asarray(Image.open(p).convert('RGB')).astype(np.float32); R, G, B = a[..., 0], a[..., 1], a[..., 2]
    w = np.clip((G - np.maximum(R, B)) / 40, 0, 1); gap = np.maximum(G - B, 0)
    a[..., 1] = G - w * .40 * gap; a[..., 2] = B + w * .15 * gap
    Image.fromarray(np.clip(a + .5, 0, 255).astype(np.uint8)).save(out, quality=95)

if sys.argv[1] == '--test': grade(sys.argv[2], sys.argv[3])
else:
    fs = sorted(glob.glob(f'{sys.argv[1]}/f_*.jpg'))
    for f in fs: grade(f, f)
    print(sys.argv[1], len(fs), 'frames graded')
