"""qc.py: measure the finished render. Soft frames per move (variance of the Laplacian against the adjacent holds),
type extents against the safe zones, the bottom 400 px of the 9:16 (rings/hands under Meta's caption band), 100% anchor
crops at the pin, transition sheets, loudness and the probe."""
import sys, os, json
R3 = '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/r3'
sys.path.insert(0, '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/tools'); sys.path.insert(0, R3)
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, cv2, soundfile as sf
from scipy.signal import resample_poly
import mx, mxkit as K
from look import lab, tile
import build as B
D = f'{R3}/final'; OUT = B.OUT; SLUG = B.SLUG
N = len([f for f in os.listdir(D) if f.startswith('f_')])
ld = lambda i: cv2.cvtColor(cv2.imread(f'{D}/f_{i + 1:04d}.jpg'), cv2.COLOR_BGR2RGB)
fr = lambda t: int(round(t * 30))
rep = {}

# 1. sharpness: 'pic' avoids the caption slot (x < 380) so type fading in/out does not read as focus
def lap(im, box):
    x0, y0, x1, y1 = box; g = cv2.cvtColor(im[y0:y1, x0:x1], cv2.COLOR_RGB2GRAY); return float(cv2.Laplacian(g, cv2.CV_64F).var())
PIC, HOOPB = (380, 0, 1080, 1050), (152, 920, 312, 1100)
sh = [(lap(ld(i), PIC), lap(ld(i), HOOPB)) for i in range(N)]
moves = {  # name: (first frame of the move, cut frame, last settle frame, hold before (frames), hold after (frames))
    'roll-push': (fr(B.T_W), fr(B.T_C), fr(B.T_C) + 8, range(fr(B.T_W) - 6, fr(B.T_W)), range(fr(B.T_C) + 12, fr(B.T_C) + 20)),
    'relay': (fr(B.T_R), fr(B.T_RC), fr(B.T_RC) + 8, range(fr(B.T_R) - 6, fr(B.T_R)), range(fr(B.T_RC) + 10, fr(B.T_RC) + 16)),
    'return': (fr(B.T_RP), fr(B.T_RET), fr(B.T_RET) + 5, range(fr(B.T_RP) - 8, fr(B.T_RP) - 2), range(fr(B.T_RET) + 6, fr(B.T_RET) + 10)),
}
for name, (a, c, b, h0, h1) in moves.items():
    r0 = np.median([sh[i][0] for i in h0]); r1 = np.median([sh[i][0] for i in h1])
    soft = [i for i in range(a, b + 1) if sh[i][0] < .4 * (r0 if i < c else r1)]
    rep[f'soft_{name}'] = {'frames': soft, 'n': len(soft), 'hold_before': round(r0, 1), 'hold_after': round(r1, 1),
                           'per_frame': {i: round(sh[i][0], 1) for i in range(a, b + 1)}}
rep['frame1_vs_cycle'] = round(sh[0][0] / np.median([sh[i][0] for i in range(0, 27)]), 2)
rep['frame1_hoop_vs_landing_hold'] = round(sh[0][1] / np.median([sh[i][1] for i in range(28, 50)]), 2)

# 2. type extents (alpha > 0.05) of every overlay that is not the card ground
ext = []
for o in B.P.overlays:
    a = o.img[..., 3]
    if a.shape[0] >= 1900: continue
    ys, xs = np.nonzero(a > .05)
    if not len(ys): continue
    x0, y0 = o.x + xs.min(), o.y + ys.min(); x1, y1 = o.x + xs.max(), o.y + ys.max()
    ext.append({'t': [round(o.t0, 2), round(o.t1, 2)], 'x': [int(x0), int(x1)], 'y': [int(y0), int(y1)],
                'in_270_1250': bool(y0 >= 270 and y1 <= 1250), 'in_45': bool(y0 >= 230 and y1 <= 1580), 'right_ok': bool(y1 < 1050 or x1 <= 900)})
rep['type'] = ext

# 3. bottom 400 px of the 9:16, every 3rd frame before the card, for rings and hands
ims = [lab(cv2.resize(ld(i)[1520:1920], (270, 100), interpolation=cv2.INTER_AREA), f'{i}') for i in range(0, fr(B.T_CARD), 3)]
cv2.imwrite(f'{OUT}/{SLUG}-bottom400.jpg', cv2.cvtColor(tile(ims, 8), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 85])

# 4. 100% anchor crops at the pin: every cycle picture, the landing, the roll-push cut, the claim still, the closing
P0 = B.P0; R = 110
picks = [f0 for f0 in B.CYC_STARTS[:-1]] + [27, 40, fr(B.T_C) - 1, fr(B.T_C), fr(B.T_C) + 4, fr(B.T_JS) + 10, fr(B.T_RET), fr(B.T_RET) + 10]
ims = []
for i in picks:
    c = ld(i)[int(P0[1]) - R:int(P0[1]) + R, int(P0[0]) - R:int(P0[0]) + R].copy()
    c[R, :] = (0, 255, 255); c[:, R] = (0, 255, 255)
    ims.append(lab(c, f'{i} {i / 30:.2f}'))
cv2.imwrite(f'{OUT}/{SLUG}-anchors-100pct.jpg', cv2.cvtColor(tile(ims, 10), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 92])

# 5. transition sheets (every frame, so 30 per second of sheet)
def tsheet(name, a, b, w=180, cols=10):
    ims = [lab(cv2.resize(ld(i), (w, int(w * 1920 / 1080)), interpolation=cv2.INTER_AREA), f'{i} {i / 30:.2f}') for i in range(a, min(b, N))]
    p = f'{OUT}/{SLUG}-{name}.jpg'; cv2.imwrite(p, cv2.cvtColor(tile(ims, cols), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 85]); return p
rep['sheets'] = [tsheet('t1-cycle', 0, 32), tsheet('t2-rollpush', fr(B.T_W) - 3, fr(B.T_C) + 12),
                 tsheet('t3-relay', fr(B.T_R) - 3, fr(B.T_RC) + 12), tsheet('t4-lookswap', fr(B.T_LS) - 6, fr(B.T_LS) + 6),
                 tsheet('t5-return', fr(B.T_RP) - 6, fr(B.T_RET) + 8), tsheet('t6-card', fr(B.T_CARD) - 4, fr(B.T_CARD) + 6)]
# 4:5 check frames (the crop y 230-1580) at each type hold and the card
ims = [lab(cv2.resize(ld(i)[230:1580], (240, 300), interpolation=cv2.INTER_AREA), f'{i}') for i in (0, 45, fr(B.T_JS) + 20, 150, 165, fr(B.T_RET) + 20, N - 1)]
cv2.imwrite(f'{OUT}/{SLUG}-4x5-check.jpg', cv2.cvtColor(tile(ims, 7), cv2.COLOR_RGB2BGR), [cv2.IMWRITE_JPEG_QUALITY, 88])

# 6. loudness and the probe
x, sr = sf.read(f'{R3}/{SLUG}.wav', always_2d=True)
rep['lufs'] = round(K.lufs(x), 2); rep['tp_dbtp'] = round(20 * np.log10(np.abs(resample_poly(x, 4, 1, axis=0)).max()), 2)
rep['probe'] = [K.probe(f'{OUT}/{SLUG}.mp4'), K.probe(f'{OUT}/{SLUG}-4x5.mp4')]
rep['n_frames_rendered'] = N
json.dump(rep, open(f'{R3}/qc.json', 'w'), indent=1)
for k, v in rep.items():
    if k.startswith('soft_'): print(k, v['n'], v['frames'], 'holds', v['hold_before'], v['hold_after'])
    elif k != 'type': print(k, v)
for e in ext: print('type', e)
