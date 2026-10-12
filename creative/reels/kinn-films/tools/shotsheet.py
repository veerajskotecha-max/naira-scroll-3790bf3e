"""First, middle and last source frame of every shot in a reel, from the extracted frames: a sheet to check in-points before a
render. Usage: shotsheet.py <S> <reel> <out.jpg> [shots per row] [first shot index] [count]"""
import json, math, sys
sys.path.append('/root/.local/lib/python3.11/site-packages')
import cv2, numpy as np
S, reel, out = sys.argv[1:4]; per = int(sys.argv[4]) if len(sys.argv) > 4 else 4
a0 = int(sys.argv[5]) if len(sys.argv) > 5 else 0; cnt = int(sys.argv[6]) if len(sys.argv) > 6 else 999
D = json.load(open(f'{S}/v15/eng/data_{reel}.json')); FPS = 30
def src(s, t):
    if s.get('map'):
        m = s['map']
        if t <= m[0][0]: return m[0][1]
        for i in range(1, len(m)):
            if t <= m[i][0]: return m[i - 1][1] + (m[i][1] - m[i - 1][1]) * (t - m[i - 1][0]) / max(1e-6, m[i][0] - m[i - 1][0])
        return m[-1][1]
    lt = (t - s['t0']) * s.get('rate', 1)
    if s.get('loop'): lt = lt % s['loop']
    return s['s0'] + lt
tw, th = 162, 288; tiles = []
for s in D['shots'][a0:a0 + cnt]:
    row = []
    for t in (s['t0'], (s['t0'] + s['t1']) / 2, s['t1'] - 1 / FPS):
        st = src(s, t); i = min(max(round((st - s['ext0']) * FPS), 0), s['n'] - 1)
        im = cv2.imread(f"{S}/v15/fr/{s['key']}/f_{i + 1:04d}.jpg"); im = cv2.resize(im, (tw, th), interpolation=cv2.INTER_AREA)
        cv2.rectangle(im, (0, 0), (tw, 20), (0, 0, 0), -1); cv2.putText(im, f"{s['id']} {st:.2f}", (3, 15), cv2.FONT_HERSHEY_SIMPLEX, .45, (255, 255, 255), 1)
        row.append(im)
    row.append(np.full((th, 8, 3), 40, np.uint8)); tiles.append(np.hstack(row))
while len(tiles) % per: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite(out, np.vstack([np.hstack(tiles[i:i + per]) for i in range(0, len(tiles), per)]), [cv2.IMWRITE_JPEG_QUALITY, 85]); print(out, len(D['shots']))
