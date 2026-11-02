"""Grid sheet: frames at the given source times, at 1/3 scale, with a 120 px grid labelled in 1080x1920 coordinates.
Usage: python3.13 -I grid.py <frames_dir> <out.jpg> <cols> t1 t2 ..."""
import sys, os
sys.path.append('/root/.local/lib/python3.13/site-packages')
from PIL import Image, ImageDraw
d, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]); ts = [float(x) for x in sys.argv[4:]]
n = len([f for f in os.listdir(d) if f.endswith('.jpg')])
w, h = 360, 640; rows = (len(ts) + cols - 1) // cols
sheet = Image.new('RGB', (cols * w, rows * h), 'black'); dr = ImageDraw.Draw(sheet)
for i, t in enumerate(ts):
    k = min(n - 1, max(0, round(t * 30))); im = Image.open(f'{d}/f_{k + 1:04d}.jpg').convert('RGB').resize((w, h))
    x0, y0 = (i % cols) * w, (i // cols) * h; sheet.paste(im, (x0, y0))
    for gx in range(120, 1080, 120): dr.line([(x0 + gx / 3, y0), (x0 + gx / 3, y0 + h)], fill=(0, 255, 255) if gx % 360 == 0 else (0, 140, 140), width=1)
    for gy in range(120, 1920, 120): dr.line([(x0, y0 + gy / 3), (x0 + w, y0 + gy / 3)], fill=(0, 255, 255) if gy % 360 == 0 else (0, 140, 140), width=1)
    for gy in range(240, 1920, 240): dr.text((x0 + 2, y0 + gy / 3 - 10), str(gy), fill='yellow')
    for gx in range(240, 1080, 240): dr.text((x0 + gx / 3 + 2, y0 + 2), str(gx), fill='yellow')
    dr.rectangle([x0 + w - 60, y0 + h - 16, x0 + w, y0 + h], fill='black'); dr.text((x0 + w - 56, y0 + h - 14), f'{t:.2f}', fill='white')
sheet.save(out, quality=85)
