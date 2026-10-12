"""Rank every frame of the shoot as a profile photo: a close face, sharp, still, eyes open and to the lens, mouth closed or a
soft smile, a hoop showing. Writes the top picks (best frame per 1.5 s window, at most 4 per clip) to top.json."""
import json, glob, os, sys, numpy as np
S = sys.argv[1]; rows = []
for f in sorted(glob.glob(f'{S}/v14/scan/*.json')):
    d = json.load(open(f))
    if 'clip' not in d: continue                                       # 31C35B03: a duplicate, no rows
    clip = d['clip'].split('.')[0]
    if clip == '31C35B03': continue                                  # the same take as F2532C01
    for r in d['rows']:
        fc = r.get('face')
        if not fc or fc['n'] != 1: continue
        bs = fc['bs']; m = float(np.hypot(r.get('dx', 0), r.get('dy', 0)))
        blink = max(bs['eyeBlinkLeft'], bs['eyeBlinkRight']); sq = max(bs['eyeSquintLeft'], bs['eyeSquintRight'])
        smile = (bs['mouthSmileLeft'] + bs['mouthSmileRight']) / 2; jaw = bs['jawOpen']
        gaze = fc['yaw'] - 28 * (bs['eyeLookInLeft'] - bs['eyeLookOutLeft'])
        gv = fc['pitch'] + 25 * (bs['eyeLookUpLeft'] - bs['eyeLookDownLeft'])
        hoop = max(fc['hoopL'], fc['hoopR'])
        rows.append(dict(clip=clip, i=r['i'], fh=fc['fh'], fs=fc['sharp'], m=m, blink=blink, sq=sq, smile=smile, jaw=jaw, pucker=bs['mouthPucker'],
                         gaze=gaze, gv=gv, yaw=fc['yaw'], roll=fc['roll'], hoop=hoop, lum=r['lum'], box=fc['box']))
print(len(rows), 'frames with one face')
fs = np.array([r['fs'] for r in rows]); p50, p95 = np.percentile(fs, 50), np.percentile(fs, 95)
def score(r):
    if r['blink'] > .35 or r['jaw'] > .14 or r['fh'] < .19 or r['m'] > 3.0 or r['hoop'] < .03 or abs(r['roll']) > 32: return -1
    s = 3.0 * min(1, max(0, (r['fs'] - p50) / (p95 - p50)))               # face sharpness
    s += 2.0 * (1 - min(1, r['m'] / 3.0))                                     # still
    s += 2.0 * max(0, 1 - abs(r['gaze']) / 14) + 1.0 * max(0, 1 - abs(r['gv']) / 16)   # eyes to the lens
    s += 1.5 * min(1, max(0, (r['fh'] - .19) / .14)) - 1.5 * max(0, (r['fh'] - .45) / .15)   # a close face, not cropped
    s += 1.0 * min(1, r['hoop'] / .15)                                        # a hoop showing
    s += 1.0 * (1 - min(1, r['sq'] / .6)) + 0.8 * (1 - min(1, r['pucker'] / .4))
    s += 0.6 * (1 if .05 <= r['smile'] <= .45 else (.5 if r['smile'] < .05 else 0))   # a soft smile or a still, sultry mouth
    s += 0.6 * (1 if 6 <= abs(r['yaw']) <= 30 else .4)                       # a three-quarter turn flatters
    s -= 1.0 * (r['lum'] < 85 or r['lum'] > 175)
    return s
for r in rows: r['score'] = round(score(r), 3)
ok = sorted([r for r in rows if r['score'] > 0], key=lambda r: -r['score'])
print(len(ok), 'pass the hard limits')
picked, per = [], {}
for r in ok:                                                          # best per 1.5 s window, at most 4 per clip
    if per.get(r['clip'], 0) >= 4: continue
    if any(q['clip'] == r['clip'] and abs(q['i'] - r['i']) < 45 for q in picked): continue
    picked.append(r); per[r['clip']] = per.get(r['clip'], 0) + 1
    if len(picked) >= 48: break
json.dump(picked, open(f'{S}/v16/dp/top.json', 'w'), indent=0)
for r in picked[:48]:
    print(f"{r['clip']} {r['i'] / 30:6.2f}s  score {r['score']:.2f}  fh {r['fh']:.2f} sharp {r['fs']:6.1f} move {r['m']:.1f} gaze {r['gaze']:+5.1f}/{r['gv']:+5.1f} smile {r['smile']:.2f} jaw {r['jaw']:.2f} hoop {r['hoop']:.2f}")
