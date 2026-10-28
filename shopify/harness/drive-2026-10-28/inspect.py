import json, os, sys
from PIL import Image
D = sys.argv[1]
entries = {e['id']: e['name'] for e in json.load(open(os.path.join(D, 'entries.json')))}
rows = []
for i, (fid, name) in enumerate(entries.items(), 1):
    p = os.path.join(D, 'raw', fid)
    head = open(p, 'rb').read(16)
    try:
        im = Image.open(p)
        rows.append((i, fid, name, im.format, im.size, os.path.getsize(p)))
    except Exception as e:
        rows.append((i, fid, name, 'NOT-IMAGE ' + repr(head[:12]), None, os.path.getsize(p)))
for r in rows:
    print(f"{r[0]:>2} {r[3]:<5} {str(r[4]):<13} {r[5]//1024:>6}KB {r[2]}")
json.dump([{'n': r[0], 'id': r[1], 'name': r[2], 'fmt': r[3], 'size': r[4], 'bytes': r[5]} for r in rows], open(os.path.join(D, 'inventory.json'), 'w'), indent=1)
