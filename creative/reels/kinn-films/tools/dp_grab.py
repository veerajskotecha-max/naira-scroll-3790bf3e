"""Grab given frames (30 fps timeline) of each clip at full 720x1280, then square DP crops round the face for review.
Usage: grab.py <S> <top.json> <outdir> <sheet.jpg> [cell]"""
import json, os, subprocess, sys, collections, cv2, numpy as np
S, top, out, sheet = sys.argv[1:5]; cell = int(sys.argv[5]) if len(sys.argv) > 5 else 280
FF = f'{S}/ffmpeg'; os.makedirs(out, exist_ok=True); T = json.load(open(top)); by = collections.defaultdict(list)
for r in T: by[r['clip']].append(r['i'])
for clip, idx in by.items():
    need = [i for i in idx if not os.path.exists(f'{out}/{clip}_{i:05d}.png')]
    if not need: continue
    sel = '+'.join(f'eq(n\\,{i})' for i in sorted(need))
    subprocess.run([FF, '-v', 'error', '-nostdin', '-y', '-i', f'{S}/v14/dl/{clip}/{clip}.mov', '-vf',
                    f'fps=30,select={sel},format=rgb24', '-vsync', '0', f'{out}/_{clip}_%03d.png'], check=True)
    for k, i in enumerate(sorted(need)): os.replace(f'{out}/_{clip}_{k + 1:03d}.png', f'{out}/{clip}_{i:05d}.png')
tiles = []
for n, r in enumerate(T):
    im = cv2.imread(f"{out}/{r['clip']}_{r['i']:05d}.png"); x0, y0, x1, y1 = r['box']
    cx, cy, s = (x0 + x1) / 2, (y0 + y1) / 2 + .08 * (y1 - y0), 1.9 * (y1 - y0)
    a, b = int(max(0, cx - s / 2)), int(max(0, cy - s / 2)); crop = im[b:int(b + s), a:int(a + s)]
    t = cv2.resize(crop, (cell, cell), interpolation=cv2.INTER_AREA)
    cv2.rectangle(t, (0, 0), (cell, 22), (0, 0, 0), -1)
    cv2.putText(t, f"{n + 1} {r['clip'][:4]} {r['i'] / 30:.2f}", (4, 16), cv2.FONT_HERSHEY_SIMPLEX, .5, (255, 255, 255), 1); tiles.append(t)
while len(tiles) % 8: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite(sheet, np.vstack([np.hstack(tiles[i:i + 8]) for i in range(0, len(tiles), 8)]), [cv2.IMWRITE_JPEG_QUALITY, 90]); print(sheet, len(T))
