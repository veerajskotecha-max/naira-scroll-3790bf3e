# Perceptual fingerprints: is any new photo already on a listing?
import json, os, sys
from PIL import Image
D = sys.argv[1]
def dhash(im, size=12):
    g = im.convert('L').resize((size + 1, size), Image.LANCZOS)
    px = list(g.getdata()); bits = 0
    for r in range(size):
        for c in range(size):
            bits = (bits << 1) | (px[r * (size + 1) + c] < px[r * (size + 1) + c + 1])
    return bits
def crops(im):
    w, h = im.size
    out = [im]
    s = min(w, h); out.append(im.crop(((w - s) // 2, (h - s) // 2, (w - s) // 2 + s, (h - s) // 2 + s)))
    # 4:5 centre crop
    if w / h > 0.8: nw = int(h * 0.8); out.append(im.crop(((w - nw) // 2, 0, (w - nw) // 2 + nw, h)))
    else: nh = int(w / 0.8); out.append(im.crop((0, (h - nh) // 2, w, (h - nh) // 2 + nh)))
    return out
inv = json.load(open(os.path.join(D, 'inventory.json')))
refs = json.load(open(os.path.join(D, 'reflist.json')))
refh = []
for r in refs:
    p = os.path.join(D, 'ref', f"{r['handle']}__{r['i']:02d}.img")
    try: im = Image.open(p).convert('RGB')
    except Exception: continue
    refh.append((r, [dhash(c) for c in crops(im)]))
res = {}
for e in inv:
    im = Image.open(os.path.join(D, 'thumbs', f"{e['n']:02d}.jpg")).convert('RGB')
    hs = [dhash(c) for c in crops(im)]
    best = []
    for r, rh in refh:
        d = min(bin(a ^ b).count('1') for a in hs for b in rh)
        best.append((d, r['handle'], r['i'], r['file']))
    best.sort()
    res[e['n']] = best[:3]
    flag = 'DUPLICATE?' if best[0][0] <= 18 else ''
    print(f"{e['n']:>2} best {best[0][0]:>3} {best[0][1]}#{best[0][2]} {best[0][3][:44]} | 2nd {best[1][0]} {best[1][1]} {flag}")
json.dump(res, open(os.path.join(D, 'dupes.json'), 'w'))
