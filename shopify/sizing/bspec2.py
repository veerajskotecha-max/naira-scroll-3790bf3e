"""B cards for earrings: window on the 900px copy -> exact extent -> marks + scale -> card spec."""
import json, sys
sys.path.insert(0, '/home/user/naira-scroll-3790bf3e/shopify/sizing')
from extent import extent
S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad'
dims = json.load(open(f'{S}/sizing/hi/dims.json'))
# (handle, file, [marks: (window x0,y0,x1,y1 on the copy, axis 'w'|'h', mm, label)], caption)
SPECS = [
 ('molten-bloom-hoops', 'molten-bloom-hoops-01.jpg', [((205, 235, 565, 675), 'h', 19, '19 mm')], '21 mm wide · 19 mm tall'),
 ('clover-trio-edit', 'clover-trio-edit-01.jpg', [((200, 265, 290, 415), 'w', 10.2, '10.2 mm'), ((420, 380, 520, 470), 'w', 6.2, '6.2 mm')], 'Huggie 10.2 mm · studs 6.2 and 3.7 mm'),
 ('filigree-bloom-studs', 'filigree-bloom-studs-01.jpg', [((215, 320, 465, 585), 'w', 30, '30 mm')], '30 mm across · pearl 8 mm'),
 ('pearl-nugget-hoops', 'pearl-nugget-hoops-01.jpg', [((120, 320, 445, 690), 'w', 20.5, '20.5 mm')], '23 mm tall · 20.5 mm wide'),
 ('silver-drop-earrings', 'silver-drop-earrings-02.jpg', [((330, 365, 440, 815), 'h', 44, '44 mm')], '44 mm long'),
 ('pearl-point-studs', 'pearl-point-studs-08.jpg', [((165, 445, 450, 735), 'w', 18.5, '18.5 mm')], '18.5 mm across · pearl 9 mm'),
 ('emerald-deco-hoops', 'emerald-deco-hoops-01.jpg', [((235, 300, 445, 690), 'h', 22, '22 mm')], '22 mm across'),
 ('baguette-arc-hoops', 'baguette-arc-hoops-05.jpg', [((185, 520, 545, 1000), 'h', 52, '52 mm')], '52 mm across'),
]
only = sys.argv[1:]
out, debug = [], {}
for h, fn, marks, caption in SPECS:
    if only and h not in only: continue
    W, H = dims['hi'][fn]; cw, chh = dims['copy'][fn]; f = W / cw
    ms, ppm, box = [], None, None
    for win, axis, mm, label in marks:
        e = extent(f'{S}/sizing/grid/{fn}', list(win))
        debug.setdefault(h, []).append({'win': win, 'ext': e})
        x0, y0, x1, y1 = e
        if axis == 'w':
            ms.append({'x1': x0 * f, 'y1': (y0 - 24) * f, 'x2': x1 * f, 'y2': (y0 - 24) * f, 'label': label, 'side': 'above'})
            p = (x1 - x0) / mm
        else:
            ms.append({'x1': (x0 - 26) * f, 'y1': y0 * f, 'x2': (x0 - 26) * f, 'y2': y1 * f, 'label': label, 'side': 'left'})
            p = (y1 - y0) / mm
        if ppm is None: ppm, box = p, e
    x0, y0, x1, y1 = box
    # square crop for portrait photos, centred on the first marked piece
    cy0 = 0
    if chh > cw:
        cy0 = min(max((y0 + y1) / 2 - cw / 2, 0), chh - cw)
    # the 10 mm bar sits under the piece, or beside it when under would run into the caption
    bar = 10 * ppm
    sx, sy = x0, y1 + 60
    if sy - cy0 > 0.70 * cw:
        sy = y0 + 40
        sx = x1 + 50 if x1 + 50 + bar < cw - 40 else x0 - 50 - bar
    out.append({'id': h, 'type': 'B', 'img': f'{S}/sizing/hi/{fn}', 'srcW': W, 'srcH': H,
                'crop': {'x0': 0, 'y0': cy0 * f, 'size': W}, 'marks': ms,
                'scale': {'x': sx * f, 'y': sy * f, 'pxPerMm': ppm * f}, 'caption': caption})
json.dump(out, open(f'{S}/sizing/data3.json', 'w'), indent=1)
print(json.dumps(debug))
