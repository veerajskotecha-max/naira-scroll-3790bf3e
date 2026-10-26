"""Type-B size-guide specs for the four necklace/hoop listings (batch of 26 Oct 2026).

Method, as in shopify/sizing/bspec2.py: a window around the piece -> the piece's exact
extent -> marks at those edges -> pxPerMm = marked px / listed mm -> 10 mm bar under or
beside the piece -> square crop. Differences from bspec2:
  * edges are found on the full-resolution photo (sizecharts/hi), not a 900 px copy;
  * each edge comes from the same detail mask as extent.py, but a row/col counts with
    >= 3-4 mask pixels (extent.py's 4 % rule drops thin claws at the extremes), and every
    edge was then checked on a 3-8x gridded zoom (work/*.jpg). Where the mask is wrong
    (faint white stone on white backdrop, or soft shadow/texture under a piece) the value
    read off the zoom is used and noted;
  * the crop is chosen so the whole group (piece, marks, pills, bar, bar text) is centred
    in the photo area between the title chip and the caption fade.
Usage: python3 -I bspec.py   (writes specs-b.json next to this file)
"""
import json, os, sys
import cv2

S = '/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1603d6c2-8763-5ef3-b941-c9e1d9b9f412/scratchpad'
HI = f'{S}/sizecharts/hi'
OUT = os.path.dirname(os.path.abspath(__file__))

titles = {}
for line in open(f'{S}/sizecharts/all.jsonl'):
    o = json.loads(line)
    if 'handle' in o and 'title' in o:
        titles[o['handle']] = o['title']

# Card geometry (card px), from sizing/render/card.html
CARD = 1600
TOP, BOTTOM = 250, 1222          # free photo area: below the title chip (ends ~209), above the fade (1240)
PILL_H, PILL_OFF, TICK = 74, 34, 22
pill_w = lambda label: 40 + len(label) * 25
BAR_TICK, BAR_TEXT = 26, 54      # bar ticks rise 26 px; "10 mm" text reaches ~54 px below the bar line

# Per card: photo index, verified piece edges (source px), marks, bar rule, scale k (card px per source px).
# Edges: L/R/T/B of the measured span; notes say how each was found.
CARDS = [
    dict(handle='riviere-huggies-silver', idx=2, k=0.88,
         caption='35 mm across · oval stones 5 mm',
         # One hoop standing upright, seen at ~40 deg about the vertical axis: the vertical
         # extent is the full outer diameter, the horizontal one is foreshortened.
         # T 520: top claw bead of the top setting (mask 521; the post's top edge is 519, level with it).
         # B 1540: lowest polished setting (mask 1538-1539 at thr 40-55; thr 26 caught floor texture at 1559).
         # L 624 / R 1432: hoop's outer left edge and the lower end of the C (mask, thr 40).
         edges=dict(L=624, R=1432, T=520, B=1540),
         marks=[dict(axis='h', mm=35, label='35 mm', side='left', gap=50)],
         # bar at the bottom right, its line level with the bottom tick; the hoop is left of x=1114 below y=1500
         bar=dict(x=1205, y='B')),
    dict(handle='clover-drop-pendant-necklace', idx=0, k=1.85,
         caption='Pendant 17 mm long · clovers 8.5 and 6.5 mm',
         # Pendant lying on the block top, seen from high and in front: upper clover 196 px wide,
         # lower 164 px, drop 425 px -> 23-25 px/mm either way, so it is close to face-on.
         # T 697: top claw bead of the upper clover (mask 695-696, zoom 697-698).
         # B 1122: bottom claw of the lower clover (mask 1125-1126 includes the soft shadow; zoom 1120-1122).
         # L/R: upper clover 549-744, lower clover 588-752 (zoom; mask thr 40 gives 550 and 739-752).
         edges=dict(L=549, R=752, T=697, B=1122, LL=588),
         # mark on the right: the left chain comes down to the upper clover at x~520-548 near y 700
         marks=[dict(axis='h', mm=17, label='17 mm', side='right', gap=50)],
         bar=dict(under=True, cx=670, gap=70)),
    dict(handle='bow-pear-drop-necklace', idx=0, k=1.5,
         caption='Pendant 15 mm tall · bow 10 mm wide',
         # Same proportions as the front-on close-up (index 2): bow h/w 0.53 vs 0.52, pendant/bow
         # 1.39 vs 1.37, so index 0 is not foreshortened, and only index 0 leaves room for the bar
         # (in index 2 the pendant is 1046 card px tall at the widest possible crop).
         # T 730: top of the right top claw bead (mask 730; zoom 730). Left top claw is at 742.
         # B 1225: bottom of the pear's gallery (8x zoom: gold ends 1224, dark rim outline 1224-1228; mask 1230 incl. shadow).
         # L 468 / R 824: outer edges of the two heart stones of the bow (mask 469/825; zoom 467.5/823.5).
         # Pear: x 563-760 at its widest (y 1150-1200).
         edges=dict(L=468, R=824, T=730, B=1225),
         marks=[
             # vertical mark right of the bow, far enough out that its top end clears the chain
             # ring at the bow's corner (ring x<=855 at y 700-750)
             dict(axis='h', mm=15, label='15 mm', side='right', x=884),
             # bow width, above the bow at the height where both chains are clear of the tick ends
             # (left chain x<=440, right chain x>=850 at y 640-670)
             dict(axis='w', mm=10, label='10 mm', side='above', y=655),
         ],
         # The photo does not agree exactly with both listed sizes: pendant/bow = 495/356 = 1.39,
         # listing 15/10 = 1.5. One scale from both marks (all marked px / all listed mm) keeps
         # each label within 0.5 mm of what the bar implies (bow 10.46, pendant 14.54), inside the
         # card's own "give or take 1 mm"; either mark alone leaves the other 0.8-1.1 mm out
         # (from the pendant: bow reads 10.8; from the bow: pendant reads 13.9).
         scale_from='all',
         # bar left of the pear, under the left heart, on the block top and clear of its front
         # edge (which runs from (170,1083) to (543,1303)); pear's left edge is x 573-596 here
         bar=dict(right=545, y=1030)),
    dict(handle='twin-heart-necklace', idx=2, k=1600 / 1288,
         caption='Pendant 8.5 mm across · hearts 5 and 3.5 mm',
         # Front-on close-up. 8.5 mm = the two stones side by side (5 + 3.5 mm): big heart 314-~700
         # (386 px), small heart ~712-977 (265 px), ratio 1.46 vs 5/3.5 = 1.43.
         # L 314: big heart's left lobe (zoom; faint white-on-white, the mask finds 342).
         # R 980: outer edge of the small heart's gold rim where it meets the side prong (8x zoom;
         # stone facets end at 975-977; the mask's 989 is the prong bead).
         # The side prongs and chain loops beyond (to 285 and 1008) are the chain fittings, not measured.
         # T 584: top prong of the big heart (mask). B 1046: bottom claw of the big heart (zoom; mask 1049).
         edges=dict(L=314, R=980, T=584, B=1046),
         marks=[dict(axis='w', mm=8.5, label='8.5 mm', side='above', gap=40)],
         bar=dict(under=True, cx='mid', gap=70)),
]


def build(c):
    h = c['handle']
    fn = f"{h}-{c['idx']}.jpg"
    a = cv2.imread(f'{HI}/{fn}')
    H, W = a.shape[:2]
    k = c['k']
    e = c['edges']
    L, R, T, B = e['L'], e['R'], e['T'], e['B']
    marks, boxes, spans = [], [], []
    ppm = None
    for m in c['marks']:
        if m['axis'] == 'h':          # vertical extent: long / tall / hoop diameter
            if 'x' in m:
                x = m['x']
            else:
                x = L - m['gap'] / k if m['side'] == 'left' else R + m['gap'] / k
            mk = dict(x1=round(x, 1), y1=T, x2=round(x, 1), y2=B, label=m['label'], side=m['side'])
            span = B - T
            w = pill_w(m['label']) / k
            px0 = x - (PILL_OFF / k) - w if m['side'] == 'left' else x + PILL_OFF / k
            boxes += [(x - TICK / k, T, x + TICK / k, B), (px0, (T + B) / 2 - PILL_H / 2 / k, px0 + w, (T + B) / 2 + PILL_H / 2 / k)]
        else:                          # horizontal extent: across / wide
            y = m['y'] if 'y' in m else (T - m['gap'] / k if m['side'] == 'above' else B + m['gap'] / k)
            mk = dict(x1=L, y1=round(y, 1), x2=R, y2=round(y, 1), label=m['label'], side=m['side'])
            span = R - L
            w = pill_w(m['label']) / k
            cx = (L + R) / 2
            py0 = y - (PILL_OFF + PILL_H) / k if m['side'] == 'above' else y + PILL_OFF / k
            boxes += [(L, y - TICK / k, R, y + TICK / k), (cx - w / 2, py0, cx + w / 2, py0 + PILL_H / k)]
        marks.append(mk)
        spans.append((span, m['mm']))
        if ppm is None:               # the first (primary) mark sets the scale, as in bspec2
            ppm = span / m['mm']
    if c.get('scale_from') == 'all':  # all marked px / all listed mm
        ppm = sum(s for s, _ in spans) / sum(mm for _, mm in spans)
    bar = 10 * ppm
    b = c['bar']
    if b.get('under'):
        cx = (L + R) / 2 if b['cx'] == 'mid' else b['cx']
        sx, sy = cx - bar / 2, B + b['gap'] / k
    elif 'right' in b:
        sx, sy = b['right'] - bar, b['y']
    else:
        sx = b['x']
        sy = B if b.get('y') == 'B' else b['y']
    boxes.append((sx, sy - BAR_TICK / k, sx + bar, sy + BAR_TEXT / k))
    boxes.append((L, T, R, B))
    gx0 = min(bx[0] for bx in boxes); gx1 = max(bx[2] for bx in boxes)
    gy0 = min(bx[1] for bx in boxes); gy1 = max(bx[3] for bx in boxes)
    size = CARD / k
    # centre the group in the free photo area, then keep the crop inside the photo
    x0 = (gx0 + gx1) / 2 - size / 2
    y0 = (gy0 + gy1) / 2 - ((TOP + BOTTOM) / 2) / k
    x0 = min(max(x0, 0), W - size)
    y0 = min(max(y0, 0), H - size)
    if size > W + 0.5 or size > H + 0.5:
        sys.exit(f'{h}: crop {size:.0f} larger than the photo {W}x{H}')
    to_card = lambda x, y: (round((x - x0) * k), round((y - y0) * k))
    g0, g1 = to_card(gx0, gy0), to_card(gx1, gy1)
    spec = {
        'id': h, 'type': 'B', 'title': titles[h],
        'img': f'file://{HI}/{fn}', 'srcW': W, 'srcH': H,
        'crop': {'x0': round(x0, 1), 'y0': round(y0, 1), 'size': round(size, 1)},
        'marks': marks,
        'scale': {'x': round(sx, 1), 'y': round(sy, 1), 'pxPerMm': round(ppm, 3)},
        'caption': c['caption'],
    }
    info = {'photo_index': c['idx'], 'file': fn, 'k': round(k, 4), 'pxPerMm': round(ppm, 3),
            'bar_src_px': round(bar, 1), 'bar_card_px': round(bar * k),
            'group_card_bbox': [*g0, *g1],
            'mark_px': [round(abs(mk['x2'] - mk['x1']) + abs(mk['y2'] - mk['y1']), 1) for mk in marks]}
    # what each mark measures against the bar (should be the listed mm, give or take 1)
    info['marks_read_mm'] = [round(s / ppm, 2) for s, _ in spans]
    return spec, info


specs, infos = [], {}
for c in CARDS:
    s, i = build(c)
    specs.append(s)
    infos[s['id']] = i
json.dump(specs, open(f'{OUT}/specs-b.json', 'w'), indent=1, ensure_ascii=False)
print(json.dumps(infos, indent=1))
