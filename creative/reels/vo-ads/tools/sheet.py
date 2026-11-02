"""contact sheet of rendered frames: python3.13 -I sheet.py <dir> <out.jpg> [cols] [w]"""
import sys, os
sys.path.append('/root/.local/lib/python3.13/site-packages')
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]; cols = int(sys.argv[3]) if len(sys.argv) > 3 else 5; w = int(sys.argv[4]) if len(sys.argv) > 4 else 300
fs = sorted(f for f in os.listdir(d) if f.endswith('.jpg')); h = int(w * 1920 / 1080)
rows = (len(fs) + cols - 1) // cols
im = Image.new('RGB', (cols * w, rows * h), 'black'); dr = ImageDraw.Draw(im)
for i, f in enumerate(fs):
    x, y = (i % cols) * w, (i // cols) * h
    im.paste(Image.open(f'{d}/{f}').convert('RGB').resize((w, h)), (x, y))
    t = (int(f[2:7]) - 1) / 30
    dr.rectangle([x, y, x + 64, y + 18], fill='black'); dr.text((x + 4, y + 3), f'{t:.2f}s', fill='yellow')
    dr.line([(x, y + 1250 * w / 1080), (x + w, y + 1250 * w / 1080)], fill=(255, 0, 0))
im.save(out, quality=86)
