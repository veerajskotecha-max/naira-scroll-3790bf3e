# borders.py <D> n ...  — rows/columns at each edge that are one flat colour (letterbox bars)
import json, os, sys
from PIL import Image, ImageStat
D = sys.argv[1]
inv = {e['n']: e for e in json.load(open(os.path.join(D, 'inventory.json')))}
def flat(im, box):
    s = ImageStat.Stat(im.crop(box)); return max(s.stddev) < 2.0
for n in [int(a) for a in sys.argv[2:]]:
    im = Image.open(os.path.join(D, 'raw', inv[n]['id'])).convert('RGB'); w, h = im.size
    top = 0
    while top < h // 3 and flat(im, (0, top, w, top + 1)): top += 1
    bot = 0
    while bot < h // 3 and flat(im, (0, h - bot - 1, w, h - bot)): bot += 1
    lef = 0
    while lef < w // 3 and flat(im, (lef, 0, lef + 1, h)): lef += 1
    rig = 0
    while rig < w // 3 and flat(im, (w - rig - 1, 0, w - rig, h)): rig += 1
    if top or bot or lef or rig: print(f"#{n} {w}x{h}: top {top} bottom {bot} left {lef} right {rig}")
print('done')
