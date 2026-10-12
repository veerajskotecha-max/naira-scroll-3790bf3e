"""Find the hoop in a shot's frame, to seed the tracker: gold blobs beside the face box (from the face scan), at ear height, the
largest wins. Usage: hoopseed.py <S> <reel> shot:t ...  prints track.py specs (id = shot) and writes a check sheet."""
import json, sys
sys.path.append('/root/.local/lib/python3.11/site-packages')
import cv2, numpy as np
S, reel = sys.argv[1], sys.argv[2]
D = json.load(open(f'{S}/v15/eng/data_{reel}.json')); SH = {s['id']: s for s in D['shots']}
def src(s, t):
    if s.get('map'):
        m = s['map']
        if t <= m[0][0]: return m[0][1]
        for i in range(1, len(m)):
            if t <= m[i][0]: return m[i-1][1] + (m[i][1] - m[i-1][1]) * (t - m[i-1][0]) / max(1e-6, m[i][0] - m[i-1][0])
        return m[-1][1]
    return s['s0'] + (t - s['t0']) * s.get('rate', 1)
specs, tiles = [], []
for a in sys.argv[3:]:
    sid, t = a.split(':'); t = float(t); s = SH[sid]
    st = src(s, t); i = min(s['n'] - 1, max(0, round((st - s['ext0']) * 30)))
    im = cv2.imread(f"{S}/v15/fr/{s['key']}/f_{i + 1:04d}.jpg")
    fb = D['faces'].get(s['clip'], {}).get(str(round(st * 30)))
    x0, y0, x1, y1 = fb if fb else (300, 500, 780, 1100); fw, fh = x1 - x0, y1 - y0
    hsv = cv2.cvtColor(im, cv2.COLOR_BGR2HSV); m = cv2.inRange(hsv, (15, 125, 115), (33, 255, 255))
    m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((7, 7), np.uint8))
    n, lab, stt, cen = cv2.connectedComponentsWithStats(m); best = None
    for j in range(1, n):
        cx, cy = cen[j]; ar = stt[j, cv2.CC_STAT_AREA]
        if ar < 400 or not (y0 + .35 * fh < cy < y1 + .15 * fh): continue          # ear height to the jaw: the choker sits lower
        if x0 - .7 * fw < cx < x0 + .25 * fw or x1 - .25 * fw < cx < x1 + .7 * fw:    # beside the face, either side
            if best is None or ar > best[2]: best = (cx, cy, ar)
    if best is None: print(f'# {sid}: no hoop found at {t:.2f}'); continue
    specs.append(f'{sid}:{sid}:gold:{t:.3f}:{best[0]:.0f}:{best[1]:.0f}')
    v = im.copy(); cv2.circle(v, (int(best[0]), int(best[1])), 60, (0, 0, 255), 6); cv2.rectangle(v, (int(x0), int(y0)), (int(x1), int(y1)), (0, 255, 0), 4)
    v = cv2.resize(v, (270, 480)); cv2.putText(v, sid, (6, 24), cv2.FONT_HERSHEY_SIMPLEX, .8, (255, 255, 255), 2); tiles.append(v)
print(' '.join(specs))
if tiles:
    while len(tiles) % 8: tiles.append(np.zeros_like(tiles[0]))
    cv2.imwrite(f'{S}/v19/an/hoopseed_{reel}.jpg', np.vstack([np.hstack(tiles[k:k + 8]) for k in range(0, len(tiles), 8)]), [cv2.IMWRITE_JPEG_QUALITY, 82])
