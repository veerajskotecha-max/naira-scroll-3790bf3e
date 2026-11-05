#!/bin/bash
# qc.sh <S> <build> <t1> <t2> ...: build at 1080, render those times, and lay them out as one labelled sheet with the
# Reels safe zone (y 270-1250, x 900 below y 1050) in magenta. Sheet: <S>/rv/qc_<build>.jpg
S=$1; b=$2; shift 2; cd $S/ads
python3.13 -I tools/build_$b.py $S > /dev/null || exit 1
rm -rf qc_$b && node tools/render2.mjs $b qc_$b --at "$@" | tail -1
python3.13 -I - "$S" "$b" "$@" <<'EOF'
import sys; sys.path.append('/root/.local/lib/python3.13/site-packages')
from PIL import Image, ImageDraw
S, b, ts = sys.argv[1], sys.argv[2], [float(x) for x in sys.argv[3:]]
w, h, cols = 360, 640, 6; rows = (len(ts) + cols - 1) // cols
sheet = Image.new('RGB', (w * cols, (h + 26) * rows), (30, 30, 30)); d = ImageDraw.Draw(sheet)
for i, t in enumerate(ts):
    im = Image.open(f'{S}/ads/qc_{b}/f_{round(t * 24) + 1:05d}.jpg').convert('RGB').resize((w, h)); g = ImageDraw.Draw(im)
    k = w / 1080; g.line([(0, 270 * k), (w, 270 * k)], fill=(255, 0, 255)); g.line([(0, 1250 * k), (w, 1250 * k)], fill=(255, 0, 255))
    g.line([(900 * k, 1050 * k), (900 * k, 1250 * k)], fill=(255, 0, 255))
    x, y = (i % cols) * w, (i // cols) * (h + 26); sheet.paste(im, (x, y + 26)); d.text((x + 6, y + 6), f'{t:.2f}s', fill=(255, 255, 255))
sheet.save(f'{S}/rv/qc_{b}.jpg', quality=88); print('sheet', f'{S}/rv/qc_{b}.jpg')
EOF
