"""Grid-overlaid source frames for chosen shots and reel times, to place pinned graphics. Usage: anchors.py <S> <reel> <out.jpg> shot@t ..."""
import json, sys, cv2, numpy as np
S, reel, out = sys.argv[1], sys.argv[2], sys.argv[3]
D = json.load(open(f'{S}/v15/eng/data_{reel}.json')); SH = {s['id']: s for s in D['shots']}
def src(s, t):
    if s.get('map'):
        m = s['map']
        if t <= m[0][0]: return m[0][1]
        for i in range(1, len(m)):
            if t <= m[i][0]: return m[i-1][1] + (m[i][1] - m[i-1][1]) * (t - m[i-1][0]) / max(1e-6, m[i][0] - m[i-1][0])
        return m[-1][1]
    lt = (t - s['t0']) * s.get('rate', 1)
    if s.get('loop'): lt %= s['loop']
    return s['s0'] + lt
tiles = []
for spec in sys.argv[4:]:
    sid, t = spec.split('@'); s = SH[sid]; t = float(t)
    i = min(s['n'] - 1, max(0, round((src(s, t) - s['ext0']) * 30)))
    im = cv2.resize(cv2.imread(f"{S}/v15/fr/{s['key']}/f_{i+1:04d}.jpg"), (360, 640), interpolation=cv2.INTER_AREA)
    for k in range(1, 10):
        x, y = 36 * k, 64 * k
        cv2.line(im, (x, 0), (x, 639), (0, 255, 255), 1); cv2.line(im, (0, y), (359, y), (0, 255, 255), 1)
        cv2.putText(im, str(k * 108), (x + 2, 10), cv2.FONT_HERSHEY_SIMPLEX, .3, (0, 255, 255), 1)
        cv2.putText(im, str(k * 192), (2, y - 2), cv2.FONT_HERSHEY_SIMPLEX, .3, (0, 255, 255), 1)
    cv2.putText(im, f'{sid}@{t:.2f}', (6, 630), cv2.FONT_HERSHEY_SIMPLEX, .55, (0, 0, 255), 2)
    tiles.append(im)
while len(tiles) % 6: tiles.append(np.zeros_like(tiles[0]))
rows = [np.hstack(tiles[i:i + 6]) for i in range(0, len(tiles), 6)]
cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 82]); print(out)
