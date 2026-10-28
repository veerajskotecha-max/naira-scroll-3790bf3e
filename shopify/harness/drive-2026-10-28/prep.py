# prep.py <D> <outdir>  — manifest photos -> cropped, high-quality JPEGs named for the listing
import json, os, sys
from PIL import Image
D, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
inv = {e['n']: e for e in json.load(open(os.path.join(D, 'inventory.json')))}
rows = json.load(open(os.path.join(D, 'manifest.json')))
total = 0
for r in rows:
    im = Image.open(os.path.join(D, 'raw', inv[r['n']]['id']))
    icc = im.info.get('icc_profile')
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA'); bg = Image.new('RGB', im.size, (255, 255, 255)); bg.paste(im, mask=im.split()[3]); im = bg
    else:
        im = im.convert('RGB')
    if r.get('crop'): im = im.crop(tuple(r['crop']))
    path = os.path.join(OUT, r['file'] + '.jpg')
    im.save(path, 'JPEG', quality=88, optimize=True, progressive=True, **({'icc_profile': icc} if icc else {}))
    r['w'], r['h'], r['bytes'] = im.width, im.height, os.path.getsize(path); total += r['bytes']
    print(f"#{r['n']:>2} {r['file']}.jpg {im.width}x{im.height} {r['bytes'] // 1024} KB{' icc' if icc else ''}")
json.dump(rows, open(os.path.join(D, 'manifest.json'), 'w'), indent=1, ensure_ascii=False)
print(len(rows), 'files', round(total / 1e6, 1), 'MB')
