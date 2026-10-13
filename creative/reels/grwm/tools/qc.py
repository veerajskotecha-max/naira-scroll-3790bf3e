# QC the GRWM final against the source: frame count, every output frame matched back to its source frame (by the edit list),
# colour fidelity (decoded RGB, BT.709 TV out vs BT.709 full in), and the motion jumps (where the cuts actually are).
import subprocess, sys, numpy as np
FF, out, src = sys.argv[1:4]
def frames(p, rng, w=270, h=480):
    p = subprocess.run([FF, '-v', 'error', '-i', p, '-vf', f'scale={w}:{h}:flags=area+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range={rng},format=rgb24',
                        '-f', 'rawvideo', '-'], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.uint8).reshape(-1, h, w, 3).astype(np.float32)
O, Sf = frames(out, 'tv'), frames(src, 'full')
print('frames out', len(O), 'src', len(Sf))
emap = {}
for o in range(718):
    if o <= 2: emap[o] = 3
    elif o <= 253: emap[o] = o
    elif o <= 258: emap[o] = None            # graded raw frames
    elif o <= 523: emap[o] = o
    elif o <= 616: emap[o] = o + 2
    else: emap[o] = o + 6
title = set(range(10, 253))
bad = []
for o, s in emap.items():
    if s is None: continue
    m = np.ones(O.shape[1:3], bool)
    if o in title: m[int(1140 / 4):int(1480 / 4) + 1, int(236 / 4):int(844 / 4) + 1] = False   # outside the title box
    d = O[o][m] - Sf[s][m]
    if abs(d.mean()) > 1.0 or np.abs(d).mean() > 2.5: bad.append((o, s, round(float(d.mean()), 2), round(float(np.abs(d).mean()), 2)))
print('frames off their source:', bad[:10], len(bad))
allD = np.concatenate([(O[o] - Sf[s]).reshape(-1, 3) for o, s in emap.items() if s is not None and o not in title][::7])
print('colour: mean out-src per channel', allD.mean(0).round(2), ' MAE', np.abs(allD).mean().round(2))
lum = O @ np.array([.2126, .7152, .0722], np.float32)
dif = np.abs(np.diff(lum, axis=0)).mean((1, 2))
cuts = [i + 1 for i in np.argsort(dif)[::-1][:6]]
print('largest frame jumps at out frames:', sorted((c, round(float(dif[c - 1]), 1)) for c in cuts))
print('around 254..259:', [round(float(dif[i - 1]), 1) for i in range(250, 262)])
