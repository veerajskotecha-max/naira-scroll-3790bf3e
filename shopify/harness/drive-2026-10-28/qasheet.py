# qasheet.py <D> <out> n ...  — Drive photos large, 3 across, for a close look
import os, sys
from PIL import Image, ImageDraw, ImageFont
D, out, ns = sys.argv[1], sys.argv[2], [int(n) for n in sys.argv[3:]]
font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 26)
W, H = 530, 680
rows = (len(ns) + 2) // 3
sheet = Image.new('RGB', (3 * (W + 6), rows * (H + 6)), 'white'); dr = ImageDraw.Draw(sheet)
for k, n in enumerate(ns):
    im = Image.open(os.path.join(D, 'thumbs', f"{n:02d}.jpg")).convert('RGB'); im.thumbnail((W, H))
    x, y = (k % 3) * (W + 6), (k // 3) * (H + 6)
    sheet.paste(im, (x, y)); dr.rectangle((x, y, x + 64, y + 32), fill=(176, 132, 58)); dr.text((x + 4, y + 1), f"#{n}", fill='white', font=font)
sheet.save(out, quality=85); print(out, sheet.size)
