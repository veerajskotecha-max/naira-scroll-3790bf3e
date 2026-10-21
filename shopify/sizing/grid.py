# Overlay a labelled coordinate grid (in the image's own pixels) for picking points by eye.
import sys
from PIL import Image, ImageDraw, ImageFont
src, dst = sys.argv[1], sys.argv[2]
step = int(sys.argv[3]) if len(sys.argv) > 3 else 50
im = Image.open(src).convert('RGB')
d = ImageDraw.Draw(im, 'RGBA')
f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
for x in range(0, im.width, step):
    d.line([(x, 0), (x, im.height)], fill=(255, 0, 80, 90 if x % (step * 2) else 150), width=1)
    d.text((x + 2, 2), str(x), fill=(200, 0, 60, 255), font=f)
for y in range(0, im.height, step):
    d.line([(0, y), (im.width, y)], fill=(0, 90, 255, 90 if y % (step * 2) else 150), width=1)
    d.text((2, y + 2), str(y), fill=(0, 60, 200, 255), font=f)
im.save(dst, quality=90)
