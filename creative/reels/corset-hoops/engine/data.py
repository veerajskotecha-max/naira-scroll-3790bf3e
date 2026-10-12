"""Edit lists, overlays and tracks for the five corset-reel cuts (Woven Gold Hoops), one data_<v>.json each.

Source: one 24.2 s take (726 frames, 30 fps), untouched. Three songs came with it; every cut is timed to
its song's fitted beat grid. Times are seconds on the output timeline unless a key says src.
Depth: every frame has a person matte (../work/matte), so type and shapes can sit behind her.
The hoop track (hoopL.json, track/hoop4.py + clean4.py) is only defined where the hoop is in view; every
graphic that points at the hoop is timed inside those runs.
"""
import json, os
S = os.environ.get('WORK', '../..')                      # the asset root; this file runs from $WORK/v13/eng
SONGS = json.load(open('../work/songs.json'))
FACES = {int(k): v[:4] for k, v in json.load(open('../work/faces.json')).items()}
HOOP = json.load(open('hoopL.json'))                       # left hoop (viewer's left), only where checked by eye
MARKS = json.load(open(f'{S}/pk/marks2.json'))
PRICE, NAME = '₹1,499', 'WOVEN GOLD HOOPS'
fr = lambda s: int(round(s * 30)) + 1                      # source seconds -> frame number
LOUPE_SRC = 541                                            # the sharpest frame of the hoop (Laplacian variance)

def face_cx(a, b):
    fs = [f for f in range(fr(a), fr(b)) if f in FACES]
    return round(sum(FACES[f][0] + FACES[f][2] / 2 for f in fs) / len(fs), 1)

def bar_times(song, start, n_bars):
    P = SONGS[song]['period']
    return [round(d - start, 3) for d in SONGS[song]['downbeats'] if start - 1e-3 <= d < start + n_bars * 4 * P + 1e-3]

def play(t0, t1, src, z0=1.0, z1=None, **kw):
    return dict(t0=t0, t1=t1, kind='play', s0=src, z0=z0, z1=z1 if z1 is not None else z0, **kw)

def freeze(t0, t1, frame, z0=1.0, z1=None):
    return dict(t0=t0, t1=t1, kind='freeze', f=frame, z0=z0, z1=z1 if z1 is not None else z0)

V = {}
# ---------------------------------------------------------------------------------------------------------
# POST 1 · "The Cover" · song A (instrumental, 93.7 BPM, lifts on the 15.05 downbeat)
# She is the cover of a NAIRA issue: the masthead sits BEHIND her head. Cover lines build on the beat,
# clear as her hair comes down on the lift (the masthead swells behind her), the loupe and tag land in
# the close-ups, a burst of contact-sheet photos drops on the half-beats, and a shutter returns to the cover.
a = SONGS['a']; db = a['downbeats']; P = a['period']
ph = [round(db[7] + 2 * P, 3), round(db[7] + 2.5 * P, 3), round(db[7] + 3 * P, 3)]
V['post1'] = dict(song='a', song_start=0.0, dur=24.2, edl=[freeze(0.0, 0.45, 1), play(0.45, 22.80, 0.0), freeze(22.80, 24.2, 1)],
    depth=[[0.0, 24.2]],
    cues=dict(masthead=[0.0, 24.2], cover_on=[[0.0, 0.45], [22.86, 24.2]], cover_exit=0.45,
              lines=[dict(id='kick1', t=db[0]), dict(id='tex', t=db[1]), dict(id='wp', t=db[2]), dict(id='tf', t=db[2] + P),
                     dict(id='fp', t=db[2] + 2 * P), dict(id='gold', t=db[3]), dict(id='next', t=db[3] + 2 * P), dict(id='sticker', t=db[4])],
              clear=13.65, lift=db[5], stay=db[5] + 2 * P, loupe=[db[6], 20.10], leader=[db[6], 18.45], loupe_src=LOUPE_SRC, tag=[db[6] + 2 * P, 21.35], credit=db[7],
              photos=[dict(t=t, f=fr(t - 0.45)) for t in ph], shutter=db[8]))
# ---------------------------------------------------------------------------------------------------------
# POST 2 · "Two Little Moons" · song B (dreamy vocal, 119 BPM). A ring edit: it opens on the close-ups
# (16.627 s on) and ends where it began, so the loop is one continuous take. A blush moon hangs behind
# her the whole time; her hoops are the two little moons. Hoop-to-hoop cut on the beat with a ring burst.
b = SONGS['b']; dbb = b['downbeats']; Pb = b['period']
CUT2 = 7.573                                               # a beat; 24.2 - 7.573 = 16.627 s into the take
V['post2'] = dict(song='b', song_start=0.0, dur=24.2, edl=[play(0.0, CUT2, 24.2 - CUT2), play(CUT2, 24.2, 0.0)],
    depth=[[0.0, 24.2]],
    cues=dict(bug=[0.0, 24.2], moon=[0.0, 24.2], orbit=[0.40, 1.42], sparkles=[[0.0, 7.4], [17.1, 20.6]], moons=[dbb[0], 6.9], kick=[dbb[1], 6.9],
              iris=[CUT2, 0.55, 726], golden=[dbb[4], 13.9], earring=[dbb[5], 13.9], tag=[dbb[6], 17.1], url=[dbb[7], 17.1],
              up=[dbb[10], 24.2], down=[23.20, 24.2], hit=23.20))
# ---------------------------------------------------------------------------------------------------------
# POST 3 · "Festive Mode" · song C (dance-pop, 125.3 BPM, drop on the 7.536 downbeat). Re-ordered onto the
# bars; giant words slam in BEHIND her on every downbeat; on the drop she is cut out onto solid blush for
# two beats; an echo triptych, a ticker behind her, a stutter on the hair flip, and the last cut runs
# straight into the first (20.05 s), so it loops on her own motion.
c = SONGS['c']; dbc = c['downbeats']; Pc = c['period']
SLOT = Pc / 2; STEP = SLOT / 2
n = (24.2 - dbc[11]) / SLOT; END_SRC = 20.05
stut_s0 = round(END_SRC - (int(n) * STEP + (n - int(n)) * SLOT), 4)
V['post3'] = dict(song='c', song_start=0.0, dur=24.2, edl=[
    play(0.0, dbc[0], END_SRC),
    play(dbc[0], dbc[1], 0.0, 1.06), play(dbc[1], dbc[2], 1.915, 1.12), play(dbc[2], dbc[3], 12.40, 1.0, 1.14),
    play(dbc[3], dbc[4], 14.314, 1.0, 1.04), play(dbc[4], dbc[5], 16.35), play(dbc[5], dbc[6], 3.83, 1.10),
    play(dbc[6], dbc[7], 22.285), play(dbc[7], dbc[8], 5.745, 1.12),
    dict(t0=dbc[8], t1=dbc[9], kind='tri', s0=7.66, lag=[0.0, 0.16, 0.32]),
    play(dbc[9], dbc[10], 9.575, 1.10), freeze(dbc[10], dbc[11], 540, 1.0, 1.06),
    dict(t0=dbc[11], t1=24.2, kind='stut', s0=stut_s0, slot=SLOT, step=STEP, z0=1.0, z1=1.0)],
    pulse=[dbc[3], dbc[10]], depth=[[0.0, dbc[10]]],
    cues=dict(bug=[0.0, 24.2], kick=[0.0, dbc[2]], flash=dbc[3],
              behind=[dict(t=dbc[0], t1=dbc[1], w='FESTIVE', s=300), dict(t=dbc[1], t1=dbc[2], w='SEASON?', s=290),
                      dict(t=dbc[3], t1=dbc[4], w='SORTED.', s=300), dict(t=dbc[5], t1=dbc[6], w='WATERPROOF', s=196),
                      dict(t=dbc[7], t1=dbc[8], w='18K GOLD', s=270), dict(t=dbc[9], t1=dbc[10], w=PRICE, s=300)],
              words=[dict(t=dbc[0], t1=dbc[1], w='festive season?'), dict(t=dbc[1], t1=dbc[2], w='one pair.'),
                     dict(t=dbc[2], t1=dbc[3], w='wait for it.', small=True), dict(t=dbc[3], t1=dbc[4], w='sorted.', big=True),
                     dict(t=dbc[5], t1=dbc[6], w='waterproof.'), dict(t=dbc[6], t1=dbc[7], w='tarnish-free.'),
                     dict(t=dbc[7], t1=dbc[8], w='18K gold-tone.'), dict(t=dbc[8], t1=dbc[9], w='every party.'),
                     dict(t=dbc[9], t1=dbc[10], w=PRICE + '.', big=True)],
              marquee=[dbc[6], dbc[7]], dots=[dbc[2] + Pc, dbc[2] + 2 * Pc, dbc[2] + 3 * Pc], tag=[dbc[4] + .15, dbc[5] - .08],
              signoff=[dbc[10], dbc[11]]))
# ---------------------------------------------------------------------------------------------------------
# AD 1 · "The ₹1,499 hoops" · song C from the drop (7.536 -> 22.854, 8 bars). Frame 1: a giant price
# BEHIND her; the hoop flies in off the product photo and lands on her ear; loupe on the braid; benefits
# on the beat; a ticker behind her; the offer; the shop card. Loops to the hook.
A1 = dbc[3]; ab = bar_times('c', A1, 8)
V['ad1'] = dict(song='c', song_start=A1, dur=round(dbc[11] - A1, 3), edl=[
    play(0.0, ab[1], 20.53, 1.05), play(ab[1], ab[2], 16.35), play(ab[2], ab[3], 14.314),
    play(ab[3], ab[4], 0.0, 1.08), play(ab[4], ab[5], 18.615), play(ab[5], ab[6], 5.745, 1.0), play(ab[6], 99, 9.575, 1.0)],
    pulse=[0.0, ab[5]], depth=[[0.0, ab[1]], [ab[4], ab[5]]],
    cues=dict(hook=[0.0, ab[1] - .02], price_behind=[0.0, ab[1] - .02], fly=[ab[1] + .03, ab[1] + .93], loupe=[ab[1] + .95, ab[2] - .1], loupe_src=LOUPE_SRC,
              chips=[dict(t=ab[2], w='WATERPROOF'), dict(t=ab[2] + Pc * 2, w='TARNISH-FREE'), dict(t=ab[3], w='18K GOLD-TONE PLATED'), dict(t=ab[3] + Pc * 2, w='SOLD AS A PAIR')],
              chips_off=ab[4] - .02, marquee=[ab[4], ab[5]], tag=[ab[4] + .05, ab[5] - .05], offer=[ab[5] + .05, ab[6]], end=ab[6]))
# ---------------------------------------------------------------------------------------------------------
# AD 2 · "Hair up or hair down?" · song A, 6 bars from 7.369 (the lift lands on bar 4). Split screen with
# giant UP / DOWN behind her on each half; rings on both hoops ("same hoops."); the halves merge; the lift
# brings the hair down for real; offer; shop card.
A2 = db[2]; bb = bar_times('a', A2, 6)
LEFT_SRC, RIGHT_SRC = 9.16, 15.0
V['ad2'] = dict(song='a', song_start=A2, dur=round(db[8] - A2, 3), edl=[
    dict(t0=0.0, t1=bb[2], kind='split', left=LEFT_SRC, right=RIGHT_SRC, cxl=face_cx(LEFT_SRC, LEFT_SRC + bb[2]), cxr=face_cx(RIGHT_SRC, RIGHT_SRC + bb[3])),
    dict(t0=bb[2], t1=bb[3], kind='merge', right=RIGHT_SRC + bb[2], cxr=face_cx(RIGHT_SRC, RIGHT_SRC + bb[3]), mdur=.5),
    play(bb[3], bb[4], 13.90), play(bb[4], 99, 0.0, 1.0)],
    depth=[[0.0, bb[2] + .55]],
    cues=dict(hook=[0.0, bb[2] - .05], updown=[0.0, bb[2] + .5], rings=[bb[0] + P, bb[0] + 5 * P], same=[bb[0] + 2 * P, bb[2] - .05],
              either=[bb[2] + .1, bb[3] - .05], win=[bb[2] + .1 + P, bb[3] - .05], letdown=[bb[3] + .05, bb[3] + 1.8],
              tag=[bb[3] + 1.0, bb[4] - .05], offer=[bb[4] + .05, bb[5]], end=bb[5]))

for k, v in V.items():
    v.update(fps=30, nSrc=726, frames='../work/fr/f_', matte='../work/matte/m_', hoop=HOOP, faces={str(f): FACES[f] for f in FACES},
             marks=dict(flower=MARKS['flower'], wordmark=dict(w=MARKS['wordmark']['w'], h=MARKS['wordmark']['h'], letters=MARKS['letters'])),
             product=dict(img='../work/prod/hoops_cut.png', w=1131, h=854, name=NAME, price=PRICE,
                          single='../work/prod/hoop1_cut.png', sw=699, sh=967),   # one hoop, cut from hoops_2.jpg
             beat=SONGS[v['song']]['period'], grid=[round(g - v['song_start'], 4) for g in SONGS[v['song']]['grid'] if g >= v['song_start'] - 1e-3])
    v.setdefault('pulse', None); v.setdefault('bgswap', [])
    json.dump(v, open(f'data_{k}.json', 'w'))
    print(k, 'dur', v['dur'], 'song', v['song'], 'from', round(v['song_start'], 3), '| edl:', [(round(e['t0'], 3), e['kind']) for e in v['edl']])
print('post3 stutter s0', stut_s0)
