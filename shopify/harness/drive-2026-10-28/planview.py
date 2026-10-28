# planview.py <D> <out> handle ...  — each listing's current gallery (numbered) over the Drive photos planned for it
import json, os, sys
from PIL import Image, ImageDraw, ImageFont
D, out, handles = sys.argv[1], sys.argv[2], sys.argv[3:]
refs = json.load(open(os.path.join(D, 'reflist.json')))
plan = json.load(open(os.path.join(D, 'plan.json')))
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
small = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 17)
TH, MAXN = 190, 10
TW = TH * 4 // 5
rows = []
for h in handles:
    imgs = [r for r in refs if r['handle'] == h]
    new = plan.get(h, [])
    row = Image.new('RGB', (20 + MAXN * (TW + 6), 2 * TH + 64), 'white'); dr = ImageDraw.Draw(row)
    dr.text((4, 2), f"{h}: now {len(imgs)}  |  Drive {new}", fill='black', font=font)
    x = 4
    for k, r in enumerate(imgs[:MAXN]):
        try:
            im = Image.open(os.path.join(D, 'ref', f"{h}__{r['i']:02d}.img")).convert('RGB'); im.thumbnail((TW, TH))
            row.paste(im, (x, 28)); dr.rectangle((x, 28, x + 26, 48), fill='black'); dr.text((x + 4, 29), str(k + 1), fill='white', font=small); x += im.width + 6
        except Exception: pass
    x = 4
    for n in new:
        try:
            im = Image.open(os.path.join(D, 'thumbs', f"{n:02d}.jpg")).convert('RGB'); im.thumbnail((TW, TH))
            row.paste(im, (x, TH + 34)); dr.rectangle((x, TH + 34, x + 40, TH + 54), fill=(176, 132, 58)); dr.text((x + 3, TH + 35), f"#{n}", fill='white', font=small); x += im.width + 6
        except Exception as e: print(n, e)
    rows.append(row)
sheet = Image.new('RGB', (max(r.width for r in rows), sum(r.height for r in rows)), 'white')
y = 0
for r in rows: sheet.paste(r, (0, y)); y += r.height
sheet.save(out, quality=82); print(out, sheet.size)
