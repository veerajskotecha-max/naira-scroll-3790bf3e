# cmp.py <D> <out> spec ...  — spec "d<n>[:x0,y0,x1,y1]" (Drive original) or "r<handle>@<i>[:box]" (live listing photo); boxes are fractions
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
D, out = sys.argv[1], sys.argv[2]
inv = {e['n']: e for e in json.load(open(os.path.join(D, 'inventory.json')))}
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 24)
tiles = []
for spec in sys.argv[3:]:
    src, _, box = spec.partition(':')
    if src.startswith('d'):
        im = Image.open(os.path.join(D, 'raw', inv[int(src[1:])]['id'])).convert('RGB')
    else:
        h, i = src[1:].split('@')
        im = Image.open(os.path.join(D, 'ref', f"{h}__{int(i):02d}.img")).convert('RGB')
    if box:
        x0, y0, x1, y1 = [float(v) for v in box.split(',')]
        im = im.crop((int(x0 * im.width), int(y0 * im.height), int(x1 * im.width), int(y1 * im.height)))
    im.thumbnail((620, 620))
    t = Image.new('RGB', (630, 660), 'white'); t.paste(im, (5, 35))
    ImageDraw.Draw(t).text((6, 2), spec[:48], fill='black', font=font)
    tiles.append(t)
cols = 3
sheet = Image.new('RGB', (630 * cols, 660 * ((len(tiles) + cols - 1) // cols)), 'white')
for k, t in enumerate(tiles): sheet.paste(t, ((k % cols) * 630, (k // cols) * 660))
sheet.save(out, quality=86); print(out, sheet.size)
