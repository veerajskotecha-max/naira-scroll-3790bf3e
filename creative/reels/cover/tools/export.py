"""The cover as a standard 4:4:4 JPEG (q95, keeps the sage type crisp), and a sheet of the crops Instagram shows.
Usage: python3 -I export.py <cover.png> <outdir> <fonts dir>"""
import sys
from PIL import Image, ImageDraw, ImageFont
src, out, fonts = sys.argv[1:4]
im = Image.open(src).convert('RGB')
im.save(f'{out}/naira-reel-cover.jpg', quality=95, subsampling=0, optimize=True)
# Feed shows the centre 4:5 (y 285-1635), the profile grid the centre 3:4 (y 240-1680).
H = 960
fit = lambda i: i.resize((round(i.width * H / i.height), H), Image.LANCZOS)
tiles = [(fit(im), '9:16  Reels tab / full screen'), (fit(im.crop((0, 285, 1080, 1635))), '4:5  Feed'),
         (fit(im.crop((0, 240, 1080, 1680))), '3:4  Profile grid')]
pad, top = 28, 70
sheet = Image.new('RGB', (sum(t.width for t, _ in tiles) + pad * 4, H + top + pad), (251, 243, 236))
d = ImageDraw.Draw(sheet); f = ImageFont.truetype(f'{fonts}/Jost.ttf', 24); x = pad
for t, label in tiles:
    sheet.paste(t, (x, top)); d.text((x, 26), label.upper(), fill=(80, 114, 106), font=f); x += t.width + pad
sheet.save(f'{out}/naira-reel-cover-crops.jpg', quality=92)
