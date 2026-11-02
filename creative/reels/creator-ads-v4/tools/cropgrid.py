"""Crops of the same region at several source times with a 40 px grid in frame coordinates.
Usage: python3.13 -I cropgrid.py <frames_dir> <out.jpg> <x0> <y0> <w> <h> <cols> t1 t2 ..."""
import sys, os
sys.path.append('/root/.local/lib/python3.13/site-packages')
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; x0, y0, w, h, cols = map(int, sys.argv[3:8]); ts = [float(v) for v in sys.argv[8:]]
n = len([f for f in os.listdir(d) if f.endswith('.jpg')]); sc = min(1.0, 420 / w)
tw, th = int(w * sc), int(h * sc); rows = (len(ts) + cols - 1) // cols
sh = Image.new('RGB', (cols * tw, rows * th), 'black'); dr = ImageDraw.Draw(sh)
for i, t in enumerate(ts):
    k = min(n - 1, max(0, round(t * 30))); im = Image.open(f'{d}/f_{k + 1:04d}.jpg').convert('RGB').crop((x0, y0, x0 + w, y0 + h)).resize((tw, th))
    ox, oy = (i % cols) * tw, (i // cols) * th; sh.paste(im, (ox, oy))
    for gx in range((x0 // 40 + 1) * 40, x0 + w, 40):
        c = (255, 255, 0) if gx % 200 == 0 else (0, 160, 160); dr.line([(ox + (gx - x0) * sc, oy), (ox + (gx - x0) * sc, oy + th)], fill=c)
        if gx % 200 == 0: dr.text((ox + (gx - x0) * sc + 2, oy + 2), str(gx), fill='yellow')
    for gy in range((y0 // 40 + 1) * 40, y0 + h, 40):
        c = (255, 255, 0) if gy % 200 == 0 else (0, 160, 160); dr.line([(ox, oy + (gy - y0) * sc), (ox + tw, oy + (gy - y0) * sc)], fill=c)
        if gy % 200 == 0: dr.text((ox + 2, oy + (gy - y0) * sc + 2), str(gy), fill='yellow')
    dr.rectangle([ox, oy + th - 14, ox + 44, oy + th], fill='black'); dr.text((ox + 3, oy + th - 13), f'{t:.2f}', fill='white')
sh.save(out, quality=88)
