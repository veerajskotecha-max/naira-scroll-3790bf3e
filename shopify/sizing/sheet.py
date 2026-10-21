# Contact sheets: python3 sheet.py <list.json> <outprefix> <cols> <rows> <tile_px>
# list.json: [{"path": ..., "label": ...}]
import sys, json, math
from PIL import Image, ImageDraw, ImageFont
items = json.load(open(sys.argv[1]))
prefix, cols, rows, tile = sys.argv[2], int(sys.argv[3]), int(sys.argv[4]), int(sys.argv[5])
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', max(14, tile // 22))
except Exception:
    font = ImageFont.load_default()
lab = max(20, tile // 14)
per = cols * rows
outs = []
for s in range(math.ceil(len(items) / per)):
    chunk = items[s * per:(s + 1) * per]
    sheet = Image.new('RGB', (cols * tile, rows * (tile + lab)), 'white')
    d = ImageDraw.Draw(sheet)
    for i, it in enumerate(chunk):
        x, y = (i % cols) * tile, (i // cols) * (tile + lab)
        try:
            im = Image.open(it['path']).convert('RGB')
            im.thumbnail((tile - 6, tile - 6))
            sheet.paste(im, (x + (tile - im.width) // 2, y + lab + (tile - im.height) // 2))
        except Exception as e:
            d.text((x + 6, y + lab + 6), 'ERR ' + str(e)[:40], fill='red', font=font)
        d.rectangle([x, y, x + tile - 1, y + lab + tile - 1], outline=(200, 200, 200))
        d.text((x + 6, y + 3), it['label'][:60], fill=(160, 0, 0), font=font)
    out = f'{prefix}-{s + 1:02d}.jpg'
    sheet.save(out, quality=88)
    outs.append(out)
print('\n'.join(outs))
