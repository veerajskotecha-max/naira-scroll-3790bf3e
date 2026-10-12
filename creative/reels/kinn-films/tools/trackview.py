"""Contact sheet of a track: every 4th frame of the shot with the tracked point drawn. Usage: trackview.py <S> <reel> <id> <out.jpg>"""
import json, sys, cv2, numpy as np
S, reel, tid, out = sys.argv[1:5]
D = json.load(open(f'{S}/v15/eng/data_{reel}.json')); SH = {s['id']: s for s in D['shots']}
T = json.load(open(f'{S}/v15/eng/track_{reel}.json'))[tid]; s = SH[T['shot']]
tiles = []
for i in range(0, s['n'], max(1, s['n'] // 18)):
    im = cv2.imread(f"{S}/v15/fr/{s['key']}/f_{i+1:04d}.jpg"); x, y = T['pts'][i]
    cv2.circle(im, (int(x), int(y)), 26, (0, 0, 255), 5); cv2.putText(im, f'{tid} f{i}', (20, 80), cv2.FONT_HERSHEY_SIMPLEX, 2.4, (0, 0, 255), 5)
    tiles.append(cv2.resize(im, (216, 384), interpolation=cv2.INTER_AREA))
while len(tiles) % 9: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite(out, np.vstack([np.hstack(tiles[i:i + 9]) for i in range(0, len(tiles), 9)]), [cv2.IMWRITE_JPEG_QUALITY, 80]); print(out)
