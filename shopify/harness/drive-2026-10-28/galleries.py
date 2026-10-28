# galleries.py <D> <out> handle ...  — each listing's current photos as a row
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
D, out, handles = sys.argv[1], sys.argv[2], sys.argv[3:]
refs = json.load(open(os.path.join(D, 'reflist.json')))
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
TH, MAXN = 210, 9
rows = []
for h in handles:
    imgs = [r for r in refs if r['handle'] == h]
    row = Image.new('RGB', (40 + MAXN * (TH * 4 // 5 + 6), TH + 30), 'white'); dr = ImageDraw.Draw(row)
    dr.text((4, 2), f"{h}  ({len(imgs)} photos)", fill='black', font=font)
    x = 4
    for r in imgs[:MAXN]:
        try:
            im = Image.open(os.path.join(D, 'ref', f"{h}__{r['i']:02d}.img")).convert('RGB'); im.thumbnail((TH * 4 // 5, TH))
            row.paste(im, (x, 28)); x += im.width + 6
        except Exception: pass
    rows.append(row)
sheet = Image.new('RGB', (max(r.width for r in rows), sum(r.height for r in rows)), 'white')
y = 0
for r in rows: sheet.paste(r, (0, y)); y += r.height
sheet.save(out, quality=80); print(out, sheet.size)
