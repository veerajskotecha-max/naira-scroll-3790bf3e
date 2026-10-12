"""Edit lists, overlays and tracks for the corset take × Woven Gold Hoops: three ads and two posts.

Source: one 24.2 s take (726 frames, 30 fps), untouched. Three songs came with it; every cut is timed to
its song's fitted beat grid. Times are seconds on the output timeline unless a key says src.
Depth: every frame has a person matte (../work/matte), so type and shapes can sit behind her.
The hoop track (hoopL.json, track/hoop4.py + clean4.py) is only defined where the hoop is in view; every
graphic that points at the hoop is timed inside those runs.

Ads carry the brand and the price from the first seconds and end on a shop card. Posts are built to travel:
a joke or a question in the first frame, native-looking captions, no logo, no price, one @handle.
"""
import json, os
S = os.environ.get('WORK', '../..')                      # the asset root; this file runs from $WORK/v13/eng
SONGS = json.load(open('../work/songs.json'))
FACES = {int(k): v[:4] for k, v in json.load(open('../work/faces.json')).items()}
HOOP = json.load(open('hoopL.json'))
MARKS = json.load(open(f'{S}/pk/marks2.json'))
# live on 12 Oct 2026: price and compare-at price, as the product page shows them (JewelPriceTag rounds the saving)
PRICE_N, MRP_N, NAME = 1499, 2769, 'WOVEN GOLD HOOPS'
PRICE, MRP, OFF = '₹1,499', '₹2,769', round((MRP_N - PRICE_N) / MRP_N * 100)
fr = lambda s: int(round(s * 30)) + 1                      # source seconds -> frame number
LOUPE_SRC = 541                                            # the sharpest frame of the hoop (Laplacian variance)

def face_cx(a, b):
    fs = [f for f in range(fr(a), fr(b)) if f in FACES]
    return round(sum(FACES[f][0] + FACES[f][2] / 2 for f in fs) / len(fs), 1)

def bars(song, start, n):
    """n bars of the song from the downbeat at `start`, as output times (n + 1 values, the last is the end)."""
    P = SONGS[song]['period']
    b = [round(d - start, 3) for d in SONGS[song]['downbeats'] if start - 1e-3 <= d < start + n * 4 * P + 1e-3]
    assert len(b) == n + 1, (song, start, n, b)
    return b

def play(t0, t1, src, z0=1.0, z1=None, **kw):
    return dict(t0=t0, t1=t1, kind='play', s0=src, z0=z0, z1=z1 if z1 is not None else z0, **kw)

V = {}
a, b, c = SONGS['a'], SONGS['b'], SONGS['c']
Pa, Pb, Pc = a['period'], b['period'], c['period']
# ---------------------------------------------------------------------------------------------------------
# AD · "The Cover" · song A, 6 bars from 7.369 (the lift lands on bar 4). She is the cover of NAIRA's festive
# issue: masthead behind her head, the price in the headline and a 46%-off sticker from frame 1. The loupe
# holds the braid; benefits land on the beats while she reaches for her hair; the hair falls on the lift;
# the tag; a shutter closes onto the back cover (the shop card).
A = bars('a', a['downbeats'][2], 6)
LIFT_SRC = 15.05                                           # in the take, the hair is down at 15.05 s, on song A's lift
V['ad_cover'] = dict(song='a', song_start=a['downbeats'][2], dur=A[6], edl=[
    play(A[0], A[1], 1.0), play(A[1], A[2], 5.0),          # from 1.0 s she stands clear of the headline column
    play(A[2], A[4], LIFT_SRC - (A[3] - A[2])),            # one real-time run, so the hair drops on the lift
    play(A[4], A[5], 18.6, 1.0, 1.05)],
    depth=[[0.0, A[5]]],
    cues=dict(cover=[0.0, A[1]], sticker=[0.0, A[1]], loupe=[A[1], A[2] - .05], leader=[A[1], A[2] - .05], loupe_src=LOUPE_SRC,
              lines=[dict(id='wp', t=A[2]), dict(id='tf', t=A[2] + Pa), dict(id='gold', t=A[2] + 2 * Pa), dict(id='steel', t=A[2] + 3 * Pa)],
              lift=A[3], stay=A[3] + 2 * Pa, tag=[A[4] + .05, A[5]], shutter=A[5] - .13, end=A[5]))
# ---------------------------------------------------------------------------------------------------------
# AD · "Doing all the work" · song C from the drop (7.536 -> 22.854, 8 bars). The giant price behind her
# and a 46%-off sticker; a single hoop from the product shoot flips in and hands over to her real one; the
# loupe; benefit chips on the beat; the ticker behind her and the tag; the offer; the shop card.
AW = bars('c', c['downbeats'][3], 8)
V['ad_work'] = dict(song='c', song_start=c['downbeats'][3], dur=AW[8], edl=[
    play(0.0, AW[1], 20.53, 1.05), play(AW[1], AW[2], 16.35), play(AW[2], AW[3], 14.314),
    play(AW[3], AW[4], 0.0, 1.08), play(AW[4], AW[5], 18.615), play(AW[5], AW[6], 5.745, 1.0), play(AW[6], 99, 9.575, 1.0)],
    pulse=[0.0, AW[5]], depth=[[0.0, AW[1]], [AW[4], AW[5]]],
    cues=dict(hook=[0.0, AW[1] - .02], sticker=[Pc, AW[1] - .02], bug=[AW[1], AW[6]], fly=[AW[1] + .03, AW[1] + .93], loupe=[AW[1] + .95, AW[2] - .1],
              loupe_src=LOUPE_SRC, chips=[dict(t=AW[2], w='WATERPROOF'), dict(t=AW[2] + Pc * 2, w='TARNISH-FREE'), dict(t=AW[3], w='18K GOLD-TONE PLATED'),
                                          dict(t=AW[3] + Pc * 2, w='SOLD AS A PAIR')],
              chips_off=AW[4] - .02, marquee=[AW[4], AW[5]], tag=[AW[4] + .05, AW[5] - .05], offer=[AW[5] + .05, AW[6]], end=AW[6]))
# ---------------------------------------------------------------------------------------------------------
# AD · "Two little moons" · song B, 7 bars from 4.55 (its steadiest stretch, so the loop does not jump in
# level). A blush moon behind her head; an orbit round the hoop; the name and price by the second bar; a
# ring bursts off her hoop at the cut; tag, offer, and a shop card where the hoops sit on the moon.
M = bars('b', b['downbeats'][2], 7)
CUTM = round(M[3] + 3 * Pb, 3)                             # the last beat of bar 4
V['ad_moons'] = dict(song='b', song_start=b['downbeats'][2], dur=M[7], edl=[
    play(0.0, CUTM, 24.2 - CUTM), play(CUTM, 99, 0.6)],     # close-ups to the end of the take, then the cover pose
    depth=[[0.0, M[6]]],
    cues=dict(bug=[0.0, M[6]], orbit=[0.40, 1.42], sparkles=[[0.0, CUTM - .1], [CUTM + .3, M[6]]], moons=[0.0, M[2] - .05], kick=[M[1], M[2] - .05],
              golden=[M[2], CUTM - .05], earring=[M[2] + 2 * Pb, CUTM - .05], iris=[CUTM], tag=[M[4], M[5] - .05], benefits=[M[4] + 2 * Pb, M[5] - .05],
              offer=[M[5] + .05, M[6]], end=M[6]))
# ---------------------------------------------------------------------------------------------------------
# POST · "Mummy vs me" · song C, 8 bars from 1.792 (the drop lands on bar 4). A chat-style ask from Mummy
# (wear the heavy jhumkas), my reply, "wait for it", the hair comes down on the drop with HOOPS behind her,
# then Mummy two seconds later asking where they are from, and the share ask. No logo, no price: the handle
# is the punchline, and the missing price is what people will comment for.
C = bars('c', c['downbeats'][0], 8)
V['post_mummy'] = dict(song='c', song_start=c['downbeats'][0], dur=C[8], edl=[
    play(C[0], C[1], 0.0), play(C[1], C[2], 9.575, 1.04), play(C[2], C[3], 12.40, 1.0, 1.14),
    play(C[3], C[4], 14.314, 1.0, 1.04), play(C[4], C[5], 16.35), play(C[5], C[6], 19.0, 1.06),
    play(C[6], C[7], 21.0, 1.04), play(C[7], 99, 24.2 - (C[8] - C[7]))],
    pulse=[C[3], C[8]], depth=[[C[3], C[4]]],
    cues=dict(hook=[0.0, C[2] - .05], ask=[0.0, C[2] - .05], reply=[C[1] + .1, C[2] - .05], wait=[C[2], C[3]], dots=[C[2] + Pc, C[2] + 2 * Pc, C[2] + 3 * Pc],
              flash=C[3], behind=[C[3], C[4]], drop=[C[3] + Pc, C[4] - .05], goldish=[C[4] + .05, C[5] - .05], specs=[C[4] + 2 * Pc, C[5] - .05],
              ask2=[C[5] + .1, C[7] - .05], reply2=[C[6] + .1, C[7] - .05], share=[C[7] + .05, C[8]]))
# ---------------------------------------------------------------------------------------------------------
# POST · "Hair up or hair down?" · song A, 6 bars from 4.808 (the lift lands on bar 5). The question and
# the split are on screen in frame 1; rings on both hoops ("same hoops."); the comment ask; a tie-breaker;
# her hair falls on the lift; a take that people will want to argue with; the ask again, and the loop cuts
# back to the split on the downbeat. Leave the middle of bars 1-2 clear for Instagram's own poll sticker.
B = bars('a', a['downbeats'][1], 6)
LEFT_SRC, RIGHT_SRC = 9.16, 15.0
V['post_poll'] = dict(song='a', song_start=a['downbeats'][1], dur=B[6], edl=[
    dict(t0=0.0, t1=B[2], kind='split', left=LEFT_SRC, right=RIGHT_SRC, cxl=face_cx(LEFT_SRC, LEFT_SRC + B[2]), cxr=face_cx(RIGHT_SRC, RIGHT_SRC + B[3])),
    dict(t0=B[2], t1=B[3], kind='merge', right=RIGHT_SRC + B[2], cxr=face_cx(RIGHT_SRC, RIGHT_SRC + B[3]), mdur=.5),
    play(B[3], B[5], LIFT_SRC - (B[4] - B[3])), play(B[5], 99, 18.9, 1.0, 1.06)],
    depth=[[0.0, B[2] + .55]],
    cues=dict(question=[0.0, B[2] - .05], updown=[0.0, B[2] + .5], rings=[Pa, 5 * Pa], same=[2 * Pa, B[2] - .05], comment=[B[1], B[2] - .05],
              tie=[B[2] + .1, B[3] - .05], watch=[B[3] + .1, B[4] - .05], verdict=[B[4] + .15, B[5] - .05], verdict2=[B[4] + .15 + 2 * Pa, B[5] - .05],
              ask=[B[5] + .1, B[6]], handle=[B[5] + 2 * Pa, B[6]]))

for k, v in V.items():
    v.update(fps=30, nSrc=726, frames='../work/fr/f_', matte='../work/matte/m_', hoop=HOOP, faces={str(f): FACES[f] for f in FACES},
             marks=dict(flower=MARKS['flower'], wordmark=dict(w=MARKS['wordmark']['w'], h=MARKS['wordmark']['h'], letters=MARKS['letters'])),
             product=dict(img='../work/prod/hoops_cut.png', w=1131, h=854, name=NAME, price=PRICE, mrp=MRP, off=OFF,
                          single='../work/prod/hoop1_cut.png', sw=699, sh=967),   # one hoop, cut from hoops_2.jpg
             beat=SONGS[v['song']]['period'], grid=[round(g - v['song_start'], 4) for g in SONGS[v['song']]['grid'] if g >= v['song_start'] - 1e-3])
    v.setdefault('pulse', None)
    json.dump(v, open(f'data_{k}.json', 'w'))
    print(k, 'dur', v['dur'], 'song', v['song'], 'from', round(v['song_start'], 3), '| edl:', [(round(e['t0'], 3), e['kind'], e.get('s0', e.get('left'))) for e in v['edl']])
print('price', PRICE, 'mrp', MRP, 'off', OFF)
