import json, os, sys
from PIL import Image, ImageDraw, ImageFont
D = sys.argv[1]
inv = json.load(open(os.path.join(D, 'inventory.json')))
out = os.path.join(D, 'sheets'); os.makedirs(out, exist_ok=True)
thumbs = os.path.join(D, 'thumbs'); os.makedirs(thumbs, exist_ok=True)
TW, TH, COLS, ROWS = 400, 500, 4, 3
try:
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 34)
except Exception:
    font = ImageFont.load_default()
for e in inv:
    im = Image.open(os.path.join(D, 'raw', e['id'])).convert('RGB')
    im.thumbnail((900, 900))
    im.save(os.path.join(thumbs, f"{e['n']:02d}.jpg"), quality=85)
for s in range(0, len(inv), COLS * ROWS):
    chunk = inv[s:s + COLS * ROWS]
    sheet = Image.new('RGB', (COLS * TW, ROWS * TH), 'white')
    d = ImageDraw.Draw(sheet)
    for k, e in enumerate(chunk):
        im = Image.open(os.path.join(thumbs, f"{e['n']:02d}.jpg"))
        im.thumbnail((TW - 8, TH - 8))
        x, y = (k % COLS) * TW, (k // COLS) * TH
        sheet.paste(im, (x + (TW - im.width) // 2, y + (TH - im.height) // 2))
        d.rectangle([x + 4, y + 4, x + 70, y + 46], fill='black')
        d.text((x + 10, y + 6), str(e['n']), fill='white', font=font)
    sheet.save(os.path.join(out, f"sheet-{s // (COLS * ROWS) + 1}.jpg"), quality=82)
print(sorted(os.listdir(out)))
