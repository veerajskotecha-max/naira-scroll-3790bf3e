# selfdupes.py <D> — near-identical pairs within the Drive set (dHash 16x16 on the full frame, after squaring to the shorter side)
import os, sys, itertools, json
from PIL import Image
D = sys.argv[1]
def dh(path):
    im = Image.open(path).convert('L')
    w, h = im.size; s = min(w, h)
    im = im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)).resize((17, 16), Image.LANCZOS)
    px = list(im.getdata())
    return [px[r * 17 + c] > px[r * 17 + c + 1] for r in range(16) for c in range(16)]
hs = {}
for f in sorted(os.listdir(os.path.join(D, 'thumbs'))):
    n = int(f.split('.')[0])
    if n <= 3: continue
    hs[n] = dh(os.path.join(D, 'thumbs', f))
pairs = sorted((sum(a != b for a, b in zip(hs[i], hs[j])), i, j) for i, j in itertools.combinations(sorted(hs), 2))
for d, i, j in pairs[:15]: print(f"#{i} ~ #{j}: {d}/256")
