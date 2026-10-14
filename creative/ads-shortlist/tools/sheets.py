# Labelled review sheets: one row per video, 10 frames (0, 0.5, 1.2, 2.5 s for the hook, then six spread to the end).
import subprocess, sys, json, numpy as np
from PIL import Image, ImageDraw, ImageFont
FF, S, out = sys.argv[1], sys.argv[2], sys.argv[3]
groups = json.loads(sys.argv[4])
font = ImageFont.truetype(f'{S}/fonts/Jost.ttf', 22); small = ImageFont.truetype(f'{S}/fonts/Jost.ttf', 18)
TW, TH, LW = 144, 256, 230
def dur(p):
    e = subprocess.run([FF, '-hide_banner', '-i', p], capture_output=True, text=True).stderr
    h, m, s = e.split('Duration: ')[1].split(',')[0].split(':'); return float(h) * 3600 + float(m) * 60 + float(s)
for gi, rows in enumerate(groups):
    sheet = Image.new('RGB', (LW + 10 * TW, len(rows) * (TH + 6)), (24, 22, 21)); d = ImageDraw.Draw(sheet)
    for ri, (label, path) in enumerate(rows):
        p = f'{S}/{path}'; D = dur(p)
        ts = [0, .5, 1.2, 2.5] + list(np.linspace(4, D - .25, 6))
        ns = sorted({int(round(t * 30)) for t in ts})
        sel = '+'.join(f'eq(n\\,{n})' for n in ns)
        r = subprocess.run([FF, '-v', 'error', '-i', p, '-vf', f"select='{sel}',scale={TW}:{TH}:flags=area", '-vsync', '0', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True)
        fr = np.frombuffer(r.stdout, np.uint8).reshape(-1, TH, TW, 3)
        y = ri * (TH + 6)
        for k, f in enumerate(fr[:10]):
            sheet.paste(Image.fromarray(f), (LW + k * TW, y))
        lines = [label[i:i + 18] for i in range(0, len(label), 18)]
        for li, ln in enumerate(lines[:6]): d.text((10, y + 12 + li * 28), ln, fill=(251, 243, 236), font=font)
        d.text((10, y + TH - 30), f'{D:.1f}s  t: 0 .5 1.2 2.5 …', fill=(153, 180, 175), font=small)
    sheet.save(f'{out}/sheet_{gi + 1}.jpg', quality=88)
    print('sheet', gi + 1, len(rows))
