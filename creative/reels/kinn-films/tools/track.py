"""Track a gold piece (hoop, kada, ring) or the pale-blue fan through one shot's extracted frames, by colour.
Usage: track.py <S> <reel> spec ...   spec = id:shot:kind:t:x:y[:win]
  t is a reel time in the shot (the seed frame), x,y the object's centre in source px there (from anchors.py).
  It tracks forward and back from the seed; a lost frame holds the last position. Then a 5-frame centred mean.
Merges {id: {"shot": shot, "pts": [[x, y], ...] one per extracted frame}} into eng/track_<reel>.json.
"""
import json, sys, os, cv2, numpy as np
S, reel = sys.argv[1], sys.argv[2]
D = json.load(open(f'{S}/v15/eng/data_{reel}.json')); SH = {s['id']: s for s in D['shots']}
out = f'{S}/v15/eng/track_{reel}.json'; T = json.load(open(out)) if os.path.exists(out) else {}
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
KIND = {'gold': dict(lo=(15, 125, 115), hi=(33, 255, 255), win=90, amin=25),
        'fan': dict(lo=(78, 16, 165), hi=(112, 150, 255), win=380, amin=1500)}
for spec in sys.argv[3:]:
    p = spec.split(':'); tid, sid, kind, t, x, y = p[0], p[1], p[2], float(p[3]), float(p[4]), float(p[5])
    s = SH[sid]; K = dict(KIND[kind]); K['win'] = int(p[6]) if len(p) > 6 else K['win']
    seed = min(s['n'] - 1, max(0, round((src(s, t) - s['ext0']) * 30)))
    pts = [None] * s['n']; lost = 0
    for d in (1, -1):
        px, py = x, y
        for i in range(seed, s['n'] if d > 0 else -1, d):
            im = cv2.imread(f"{S}/v15/fr/{s['key']}/f_{i+1:04d}.jpg"); w = K['win']
            x0, y0 = int(max(0, px - w)), int(max(0, py - w)); x1, y1 = int(min(1080, px + w)), int(min(1920, py + w))
            hsv = cv2.cvtColor(im[y0:y1, x0:x1], cv2.COLOR_BGR2HSV)
            m = cv2.inRange(hsv, K['lo'], K['hi']); m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((5, 5), np.uint8))
            n, lab, st, cen = cv2.connectedComponentsWithStats(m)
            best, bs = None, -1
            for j in range(1, n):
                a = st[j, cv2.CC_STAT_AREA]
                if a < K['amin']: continue
                cx_, cy_ = cen[j][0] + x0, cen[j][1] + y0; dist = np.hypot(cx_ - px, cy_ - py)
                sc = a / (1 + dist / (w * .35))
                if sc > bs: bs, best = sc, (cx_, cy_)
            if best is None: lost += 1
            else: px, py = best
            if pts[i] is None or d > 0: pts[i] = [px, py]
    a = np.array(pts, float); sm = a.copy()
    for i in range(len(a)): sm[i] = a[max(0, i - 2): i + 3].mean(0)
    T[tid] = dict(shot=sid, pts=[[round(v[0], 1), round(v[1], 1)] for v in sm])
    print(f'{tid}: {sid} {kind} seed f{seed} of {s["n"]}, lost {lost}')
json.dump(T, open(out, 'w'))
