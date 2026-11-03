"""QC sheet: frames labelled with their time (from the 1-based frame index at 30 fps), with the Reels safe zone drawn.
Usage: python3.13 -I qsheet.py <dir> <out_prefix> [per_sheet=16] [cols=8]"""
import sys, os
sys.path.append('/root/.local/lib/python3.13/site-packages')
from PIL import Image, ImageDraw
d, outp = sys.argv[1], sys.argv[2]; per = int(sys.argv[3]) if len(sys.argv) > 3 else 16; cols = int(sys.argv[4]) if len(sys.argv) > 4 else 8
fs = sorted(f for f in os.listdir(d) if f.endswith('.jpg')); w, h = 270, 480
for s in range(0, len(fs), per):
    grp = fs[s:s + per]; rows = (len(grp) + cols - 1) // cols
    im = Image.new('RGB', (cols * w, rows * h), 'black'); dr = ImageDraw.Draw(im)
    for i, f in enumerate(grp):
        x, y = (i % cols) * w, (i // cols) * h; im.paste(Image.open(os.path.join(d, f)).convert('RGB').resize((w, h)), (x, y))
        t = (int(f[2:7]) - 1) / 30
        for yy in (270, 1250): dr.line([x, y + yy * h / 1920, x + w, y + yy * h / 1920], fill=(255, 0, 255), width=1)
        dr.rectangle([x, y, x + 46, y + 14], fill='black'); dr.text((x + 3, y + 2), f'{t:.2f}', fill='yellow')
    im.save(f'{outp}_{s // per + 1}.jpg', quality=85); print(f'{outp}_{s // per + 1}.jpg')
