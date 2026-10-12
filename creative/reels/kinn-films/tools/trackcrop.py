"""Zoomed check of tracks: 8 frames per track, a 360 px crop around the tracked point with a crosshair, one row per track.
Usage: trackcrop.py <S> <reel> <out.jpg> id ..."""
import json, sys, cv2, numpy as np
S, reel, out = sys.argv[1:4]
D = json.load(open(f'{S}/v15/eng/data_{reel}.json')); SH = {s['id']: s for s in D['shots']}
TT = json.load(open(f'{S}/v15/eng/track_{reel}.json')); rows = []
for tid in sys.argv[4:]:
    T = TT[tid]; s = SH[T['shot']]; tiles = []
    for i in np.linspace(0, s['n'] - 1, 8).astype(int):
        im = cv2.imread(f"{S}/v15/fr/{s['key']}/f_{i+1:04d}.jpg"); x, y = map(int, T['pts'][i])
        im = cv2.copyMakeBorder(im, 180, 180, 180, 180, cv2.BORDER_CONSTANT); c = im[y:y + 360, x:x + 360].copy()
        cv2.line(c, (150, 180), (210, 180), (0, 0, 255), 2); cv2.line(c, (180, 150), (180, 210), (0, 0, 255), 2)
        cv2.putText(c, f'{tid} f{i}', (8, 28), cv2.FONT_HERSHEY_SIMPLEX, .8, (0, 0, 255), 2); tiles.append(cv2.resize(c, (200, 200)))
    rows.append(np.hstack(tiles))
cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 82]); print(out)
