"""Data for the Halo Curve Ring + Baroque Pearl Lariat ad: the edit list (output time -> source frame),
captions, ring tracks, product geometry and the exit timings."""
import json, re, numpy as np
from PIL import Image
W = '..'
TL = json.load(open(f'{W}/timeline.json')); RT = json.load(open(f'{W}/ring_track.json')); M = json.load(open(f'{W}/../pk/marks2.json'))
seg = {i: s['out'] for i, s in enumerate(TL['segments'])}
word = lambda w, n=1: [x for x in TL['words'] if x['w'].lower().strip('.,?!') == w][n - 1]['t']
# ---- edit list: output [t0, t1) shows source second s0 + (t - t0) * speed, zoomed z0 -> z1 about (ax, ay)
E = []
E.append(dict(t0=0, t1=1.90, s0=0.0, sp=1.06, z0=1.12, z1=1.16, ax=540, ay=860, tag='hook'))   # her face, in sync
shots = [('S1', 3.233, 6.033, 1.00, 1.05, 440, 760), ('S2', 6.067, 8.267, 1.05, 1.10, 400, 900), ('S4', 10.767, 14.733, 1.00, 1.06, 420, 880),
         ('S3', 8.300, 10.733, 1.00, 1.05, 450, 950), ('S5', 14.767, 17.433, 1.00, 1.06, 480, 1100)]
k = sum(b - a for _, a, b, *_ in shots) / (15.85 - 1.90)                     # the ring B-roll fills 1.90 -> 15.85
t = 1.90
for tag, a, b, z0, z1, ax, ay in shots:
    d = (b - a) / k; E.append(dict(t0=round(t, 4), t1=round(t + d, 4), s0=a, sp=k, z0=z0, z1=z1, ax=ax, ay=ay, tag=tag)); t += d
E[-1]['t1'] = 15.85
E.append(dict(t0=15.85, t1=26.95, s0=17.64, sp=1.0, z0=1.0, z1=1.08, ax=560, ay=820, tag='stand'))
E.append(dict(t0=26.95, t1=31.00, s0=30.60, sp=(34.27 - 30.60) / 4.05, z0=1.05, z1=1.0, ax=540, ay=800, tag='both'))
c9 = TL['segments'][8]; c10 = TL['segments'][9]
LIP = .08                                      # measured: the mouth ran 2-3 frames behind the voice here
E.append(dict(t0=31.00, t1=c10['out'][0], s0=round(c9['src'][0] - (c9['out'][0] - 31.00) * 1.06 + LIP, 4), sp=1.06, z0=1.10, z1=1.12, ax=540, ay=900, tag='close'))
END_T = round(TL['words'][-1]['e'] + .04, 3)
E.append(dict(t0=c10['out'][0], t1=END_T, s0=c10['src'][0] + LIP, sp=1.06, z0=1.24, z1=1.26, ax=540, ay=900, tag='close2'))
s_end = c10['src'][0] + LIP + (END_T - c10['out'][0]) * 1.06
E.append(dict(t0=END_T, t1=60, s0=round(s_end, 4), sp=.3, z0=1.26, z1=1.27, ax=540, ay=900, tag='close3'))   # eases to a near-hold under the card instead of freezing
# ---- captions: phrased by sense, not by word count (counts index into the spoken words, in order)
KEY = {'ring', 'naira', 'two', 'stones', 'flat', 'match', 'point', 'different', 'unexpected', 'open', 'back', 'easily', 'pearl', 'uneven',
       'shape', 'slider', 'length', 'both', 'free', 'delivery', 'know', 'twice', 'one'}
COUNTS = [4, 4, 3, 4, 2, 4, 5, 4, 4, 3, 3, 4, 3, 3, 6, 4, 2, 2, 3, 4, 4, 4, 2, 3, 5, 4, 5, 3, 3, 4, 4, 3, 2, 6, 4, 3]
words = TL['words']; assert sum(COUNTS) == len(words), (sum(COUNTS), len(words))
caps = []; i = 0
for n in COUNTS:
    grp = words[i:i + n]; i += n
    ws = [dict(w=x['w'].strip(','), t=x['t'], k=x['w'].lower().strip('.,?!') in KEY) for x in grp]
    for x in ws:                      # the brand's lowercase italic voice; names and 'I' keep their capitals
        if not re.match(r"^(Naira|I|I'm)[.,]?$", x['w']): x['w'] = x['w'].lower()
    caps.append(dict(t0=round(grp[0]['t'] - .04, 3), e=grp[-1]['e'], words=ws))
for j, c in enumerate(caps):
    c['t1'] = round(min(caps[j + 1]['t0'] if j + 1 < len(caps) else 99, c.pop('e') + .5), 3)
# ---- ring tracks: by source frame; the crystal mirrored across the ring centre from the tiger eye (its own detector caught glare)
ring = {}
for shot in ('S1', 'S2', 'S4'):
    for f, r in RT[shot].items():
        c = np.array(r['c']); te = np.array(r['tiger'][:2]) if r['tiger'] else None
        if te is None: continue
        if np.hypot(*(te - c)) > 70: continue
        cr = c + .9 * (c - te)                  # mirror estimate; a detection at a plausible distance from the tiger eye wins
        if r['cryst'] is not None:
            dc = np.array(r['cryst'][:2]); dist = np.hypot(*(dc - te))
            if 35 < dist < 95: cr = dc
        ring[f] = [round(c[0], 1), round(c[1], 1), round(te[0], 1), round(te[1], 1), round(cr[0], 1), round(cr[1], 1)]
for a_, b_ in ((97, 181), (182, 248), (323, 442)):
    have = sorted(int(f) for f in ring if a_ <= int(f) <= b_)
    for f0, f1 in zip(have, have[1:]):
        if 1 < f1 - f0 <= 10:
            for f in range(f0 + 1, f1):
                u = (f - f0) / (f1 - f0); ring[str(f)] = [round(x + (y - x) * u, 1) for x, y in zip(ring[str(f0)], ring[str(f1)])]
# smooth the stone points a little across frames
fs = sorted(map(int, ring)); arr = np.array([ring[str(f)] for f in fs])
from scipy.ndimage import uniform_filter1d
for c in range(6): arr[:, c] = uniform_filter1d(arr[:, c], 3, mode='nearest')
ring = {str(f): [round(float(v), 1) for v in arr[i]] for i, f in enumerate(fs)}
# ---- product geometry: where the big pearl sits in the detail photo, where the slider sits in the full lariat
det = np.asarray(Image.open(f'{W}/cut/lariat_detail.png').convert('RGBA')).astype(float)
hsv_v = det[..., :3].max(2); sat = (det[..., :3].max(2) - det[..., :3].min(2)) / (hsv_v + 1)
m = (det[..., 3] > 200) & (hsv_v > 205) & (sat < .12); ys, xs = np.nonzero(m); low = ys > det.shape[0] * .5
pearl = [0.115, 0.89, 0.21]          # measured off the photo: the auto mask caught the white rim highlights
full = np.asarray(Image.open(f'{W}/cut/lariat_full.png').convert('RGBA')).astype(float); fh = full.shape[0]
a = full[..., 3] > 128; rows = a.sum(1)
# the slider ring is the widest band of opaque pixels in the middle third; the drop below it is a single chain
slider_y = 0.57                      # the slider ring's centre, measured off the photo
d = np.load(f'{W}/srcdiff.npy')
dups = [int(f) + 1 for f in np.nonzero(d[1:] < .35)[0] + 1]
src_cuts = [int(f) + 1 for f in np.nonzero(d > 12)[0]]
jumps = []
for e in E:
    for cf in src_cuts:
        so = (cf - 1) / 30
        if e['s0'] + .05 < so < e['s0'] + (e['t1'] - e['t0']) * e['sp'] - .05:
            jumps.append(round(e['t0'] + (so - e['s0']) / e['sp'], 4))
ring_img = Image.open(f'{W}/cut4/ring_cut.png'); det_img = Image.open(f'{W}/cut/lariat_detail.png'); full_img = Image.open(f'{W}/cut/lariat_full.png')
B = TL and 0.6375
ring = json.load(open(f'{W}/ring_pair.json'))      # stones tracked as a pair (colour detection jumped to her hair)
D = dict(fps=30, dur=round(END_T + 5.6, 2), nSrc=1240, dups=dups, srcCuts=src_cuts, jumps=sorted(jumps), frames='../srcf/f_', edl=E, caps=caps, words=words, ring=ring,
         marks=dict(flower=M['flower'], wordmark=dict(w=M['wordmark']['w'], h=M['wordmark']['h'], letters=M['letters'])),
         cut=dict(ring='../cut4/ring_cut.png', ringW=ring_img.width, ringH=ring_img.height,
                  det='../cut/lariat_detail.png', detW=det_img.width, detH=det_img.height, pearl=pearl,
                  full='../cut/lariat_full.png', fullW=full_img.width, fullH=full_img.height, sliderY=slider_y),
         cue=dict(asked=word('asked'), twice=word('twice'), week=word('week'), so=word('so'), ring=word('ring'), two=word('two'), stones=word('stones'),
                  flat=word('flat'), dont=word("don't"), match=word('match'), whole=word('whole'), point=word('point'), different=word('different'),
                  unexpected=word('unexpected'), open=word('open'), back=word('back'), fits=word('fits'), easily=word('easily'), this1=word('this', 4),
                  one=word('one'), pearl=word('pearl'), uneven=word('uneven'), because=word('because'), no=word('no'), two2=word('two', 2), pearls=word('pearls'),
                  exactly=word('exactly'), same=word('same'), shape=word('shape'), it_also=word('also'), slider=word('slider'), play=word('play'),
                  around=word('around'), length=word('length'), however=word('however'), want=word('want'), both=word('both'), pieces=word('pieces'),
                  available=word('available'), free=word('free'), delivery=word('delivery'), well=word('well'), someone2=word('someone', 2), asks=word('asks'),
                  you_know=word('know'), it_end=TL['words'][-1]['e']),
         exit=dict(shrink=END_T, flip=END_T + .3, grow=END_T + .75, logo=END_T + 1.1, letters=END_T + 1.35, prods=END_T + 1.55, price=END_T + 1.8, url=END_T + 2.05))
json.dump(D, open('data.json', 'w'))
print('jumps', sorted(jumps), 'dur', D['dur'], 'exit', D['exit']); print('k', round(k, 4)); [print(e) for e in E]; print('pearl', pearl, 'sliderY', round(slider_y, 3)); print('caps', len(caps)); print(D['cue'])
print([' '.join(w['w'] for w in c['words']) for c in caps])
