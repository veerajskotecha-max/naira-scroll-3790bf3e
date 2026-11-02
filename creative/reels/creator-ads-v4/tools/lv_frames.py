"""The pearl clip is a CapCut 50 fps export. Where her 30 fps capture was repeated (2 repeats in every 5 frames) each
new picture gets the next 1/30 s; where CapCut animated at 50 fps (its transitions, and its zoom from 11.4 s on) each
picture keeps its own 1/50 s. Each output frame at i/30 s then takes the picture nearest in that time, so the 30 fps
result neither stalls nor skips. Usage: python3.13 -I lv_frames.py <S>"""
import json, os, subprocess, sys
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np
S = sys.argv[1]; src = f'{S}/dl/new/lv0/lv0.mp4'; tmp = f'{S}/ads/new/lv50'; out = f'{S}/ads/frames/lv'
g = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', src, '-vf', 'scale=270:480,format=gray', '-f', 'rawvideo', '-'], capture_output=True, check=True).stdout
a = np.frombuffer(g, np.uint8).reshape(-1, 480, 270).astype(np.float32); N = len(a)
d = np.abs(np.diff(a[:, 160:345], axis=0)).mean(axis=(1, 2))      # face and torso only: CapCut animates the captions at 50 fps
dup = np.r_[False, d < .35]                                        # dup[j]: picture j repeats picture j-1
patterned = np.array([dup[max(0, j - 4):j + 5].any() for j in range(N)])
tau, prev = {}, None
for j in range(N):
    if dup[j]: continue
    if prev is not None and patterned[j] and patterned[prev]: t = tau[prev] + 1 / 30
    else: t = j / 50
    if abs(t - j / 50) > 1 / 25: t = j / 50                         # never drift from the sound
    tau[j] = t; prev = j
js = np.array(sorted(tau)); ts = np.array([tau[j] for j in js])
n_out = int(np.floor(N / 50 * 30))
pick = [int(js[np.argmin(np.abs(ts - i / 30))]) for i in range(n_out)]
rep = sum(1 for x, y in zip(pick, pick[1:]) if x == y)
print('pictures', len(js), 'out', n_out, 'repeats', rep, 'skipped unique', len(set(js)) - len(set(pick)))
os.makedirs(out, exist_ok=True)
for f in os.listdir(out): os.remove(f'{out}/{f}')
for i, j in enumerate(pick): os.link(f'{tmp}/f_{j + 1:04d}.jpg', f'{out}/f_{i + 1:04d}.jpg')
json.dump({'fps': 30, 'n': n_out, 'sq': False, 'src50': pick}, open(f'{out}/meta.json', 'w'))
