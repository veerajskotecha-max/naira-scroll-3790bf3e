"""Edit lists for the seven concept reels (and the 30 s best-parts recut).

Every reel starts on a downbeat of its song, so beat k of a reel is at k * beat seconds. Cuts land on frames.
Songs (re-measured 12 Oct): B is the user's track (the new upload is B, longer): 175.24 BPM, drop at 23.240 s.
C: 125.00 BPM, beat 0 at 0.3178 s, drop at 7.518 s (beat 15). A: 129.99 BPM on its 808s, beat 0 at 0.489 s,
the bass lifts at 15.26 s (beat 32) after a gap from 14.0 s.
Output: eng/data_<reel>.json and extract.json (one entry per source range to pull frames, and mattes where flagged).
"""
import json, math, os
S = os.environ.get('WORK', '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad')
V15 = f'{S}/v15'; FPS = 30
SONG = {'B': dict(file=f'{V15}/an/song_full.wav', beat=0.34238, k0=23.240 - 64 * 0.34238),
        'C': dict(file=f'{S}/v13/work/song_c.wav', beat=0.47999, k0=0.3178),
        'A': dict(file=f'{S}/v13/work/song_a.wav', beat=0.46159, k0=0.489),
        'D': dict(file=f'{S}/v16/an/ref2.wav', beat=0.3260, k0=0.245),
        'D2': dict(file=f'{S}/v16/an/ref2.wav', beat=0.65201, k0=0.245)}  # D at the pace it is felt: 92 BPM, kicks on these beats   # the owner's newest track (from her own edit): 184.05 BPM, gap 17.25-17.52, drop 17.849 (beat 54)
fsnap = lambda x: round(x * FPS) / FPS
scan = {}
def faces(clip):
    if clip not in scan:
        d = json.load(open(f'{S}/v14/scan/{clip}.json'))
        scan[clip] = {r['i']: [v * 1.5 for v in r['face']['box']] for r in d['rows'] if r.get('face')}
    return scan[clip]

class Reel:
    def __init__(self, name, song, k_start, beats, title):
        self.name, self.song, self.title = name, song, title
        g = SONG[song]; self.beat = g['beat']; self.start = g['k0'] + k_start * g['beat']
        self.frames = round(beats * g['beat'] * FPS); self.dur = self.frames / FPS
        self.shots, self.fx, self.cues = [], [], {}
    def B(self, k): return fsnap(k * self.beat)
    def shot(self, id, clip, k0, k1, s0=None, rate=1.0, **kw):
        t0 = self.B(k0) if not isinstance(k0, tuple) else fsnap(k0[0]); t1 = self.B(k1) if not isinstance(k1, tuple) else fsnap(k1[0])
        s = dict(id=id, clip=clip, t0=t0, t1=t1, s0=s0, rate=rate); s.update(kw)
        self.shots.append(s); return s
    def at(self, k): return self.B(k)
    def add(self, type, k, **kw):
        t = self.B(k) if not isinstance(k, tuple) else fsnap(k[0]); self.fx.append(dict(type=type, t=t, **kw))
    def finish(self):
        for s in self.shots:
            if s.get('map'):
                srcs = [m[1] for m in s['map']]
            elif s.get('loop'):
                srcs = [s['s0'], s['s0'] + s['loop']]
            else:
                srcs = [s['s0'], s['s0'] + (s['t1'] - s['t0']) * s['rate']]
            lo, hi = min(srcs), max(srcs)
            ext0 = math.floor((lo - 2 / FPS) * FPS) / FPS; ext0 = max(0, ext0)
            n = int(math.ceil((hi - ext0) * FPS)) + 4
            s['ext0'] = round(ext0, 4); s['n'] = n; s['key'] = f"{s['clip']}_{round(ext0 * FPS)}_{n}"
            if s.get('focus') == 'face':                      # mean face centre over the shot
                F = faces(s['clip']); fs = [F[i] for i in range(round(lo * FPS), round(hi * FPS) + 1) if i in F]
                s['focus'] = [round(sum((f[0] + f[2]) / 2 for f in fs) / len(fs)), round(sum((f[1] + f[3]) / 2 for f in fs) / len(fs))] if fs else [540, 960]
        fz = {}
        for s in self.shots:
            F = faces(s['clip']); fz.setdefault(s['clip'], {})
            for i in range(round(s['ext0'] * FPS), round(s['ext0'] * FPS) + s['n']):
                if i in F: fz[s['clip']][str(i)] = [round(v) for v in F[i]]
        song = SONG[self.song]
        D = dict(name=self.name, title=self.title, fps=FPS, frames=self.frames, dur=self.dur, beat=self.beat, song=self.song,
                 audio=dict(file=song['file'], start=round(self.start, 4)), shots=self.shots, fx=self.fx, cues=self.cues, faces=fz)
        json.dump(D, open(f'{V15}/eng/data_{self.name}.json', 'w'))
        return D

R = {}
# =====================================================================================================================
# 1 · DIWALI LOOK LOADING · B from 12.284 s: 8 bars of loading (one item per bar), the drop at beat 32, 8 bars of the look
r = Reel('diwali', 'B', 32, 64, 'Diwali look loading…'); R[r.name] = r
r.shot('d01', 'F2532C01', 0, 4, 2.40, z=[1.03, 1.10], focus='face')
r.shot('d02', '74FA1A49', 4, 8, 5.50, z=[1.0, 1.06])
r.shot('d03', '0C1A5F38', 8, 11, 2.95, z=[1.02, 1.07], focus='face')
r.shot('d04', '5627AA72', 11, 12, 8.02)
r.shot('d05', 'F2532C01', 12, 16, 26.75, z=[1.04, 1.10], focus='face')
r.shot('d06', 'F2532C01', 16, 18, 36.95, z=[1.10, 1.16], focus='face')
r.shot('d07', '74FA1A49', 18, 20, 20.35, z=[1.0, 1.08])
r.shot('d08', 'E2552016', 20, 24, 4.55, z=[1.02, 1.06], focus='face')
r.shot('d09', 'E3C6EA7D', 24, 28, 9.70, z=[1.10, 1.18], focus='face')
gap0, gap1 = fsnap(22.20 - r.start), fsnap(22.45 - r.start)
r.shot('d10', 'E3C6EA7D', 28, 32, map=[[r.B(28), 14.45], [gap0, 14.78], [gap1, 14.78], [r.B(32), 15.57]], z=[1.08, 1.30], focus='face', matte=True)
r.shot('d11', '5627AA72', 32, 34, 13.75, z=[1.06, 1.0])
r.shot('d12', '5627AA72', 34, 35, 15.38, z=[1.18, 1.10], focus='face')
r.shot('d13', '62379666', 35, 37, 6.25, z=[1.0, 1.04], matte=True)          # stepped back: DIWALI can stand behind her head and still read
r.shot('d14', '041FCDC6', 37, 39, 8.25, z=[1.0, 1.06])
r.shot('d15', '62379666', 39, 41, 3.60, z=[1.04, 1.0])
r.shot('d16', '212E5E27', 41, 43, 19.85, z=[1.0, 1.05])
r.shot('d17', '5627AA72', 43, 44, 8.08)
r.shot('d18', '398F157B', 44, 46, 8.05, z=[1.05, 1.12])
r.shot('d19a', 'FB8CD2FD', 46, 47, 6.20, focus='face'); r.shot('d19b', '041FCDC6', 46, 47, 8.50, focus='face'); r.shot('d19c', '212E5E27', 46, 47, 18.70, focus='face')
r.shot('d20', 'FB8CD2FD', 47, 49, 6.00, z=[1.02, 1.08])
r.shot('d21', '041FCDC6', 49, 51, 11.00, z=[1.0, 1.05])
for i, (c, s0) in enumerate([('62379666', 0.2), ('041FCDC6', 8.5), ('212E5E27', 20.0), ('398F157B', 8.3), ('FB8CD2FD', 6.3), ('5627AA72', 15.5), ('62379666', 3.8), ('041FCDC6', 11.3), ('E3C6EA7D', 22.8)]):
    r.shot(f'dg{i}', c, 51, 52, s0, loop=0.34, focus='face')
r.shot('d22', '62379666', 52, 53, map=[[r.B(52), 0.40], [r.B(53), 0.40]], matte=True)
r.shot('d23', '212E5E27', 53, 55, 18.45, z=[1.0, 1.06])
r.shot('d24', 'D0798597', 55, 57, 1.30, z=[1.10, 1.16], focus='face')
r.shot('d25', '5627AA72', 57, 59, 2.55, z=[1.12, 1.18], focus='face')
r.shot('d26', 'E3C6EA7D', 59, 61, 22.65, z=[1.08, 1.14], focus='face')
r.shot('d27', 'DE17C1BF', 61, 64, 7.85, z=[1.0, 1.06])
for k in [32]: r.add('flash', k, c='#FBF3EC', a=.95, d=.35); r.add('zoomin', k, a=1.35, d=.45); r.add('shake', k, a=26, d=.4)
for k in range(33, 64, 2): r.add('punch', k, a=.07, d=.26)
for k in [35, 41, 47, 52, 57, 59, 61]: r.add('flash', k, c='#FFBDA8', a=.55, d=.22)
for k in [39, 45, 51, 55]: r.add('glitch', k, a=20, d=.2)
for k in [37, 43, 53]: r.add('shake', k, a=18, d=.25)
r.add('spin', 47, a=-14, d=.3); r.add('zoomin', 47, a=1.28, d=.3); r.add('zoomin', 41, a=1.22, d=.28)
r.add('glitch', 11, a=14, d=.12); r.add('flash', 12, c='#FBF3EC', a=.6, d=.15); r.add('shake', 14, a=10, d=.5); r.add('glitch', 16, a=10, d=.14)
r.add('flash', 19, c='#FFBDA8', a=.5, d=.2); r.add('punch', 22, a=.08); r.add('punch', 25, a=.06); r.add('flash', 4, c='#FBF3EC', a=.4, d=.15); r.add('flash', 8, c='#FBF3EC', a=.4, d=.15)
r.cues = dict(gap=[gap0, gap1], drop=r.B(32), riser=[gap1, r.B(32)])
# =====================================================================================================================
# 2 · HAIR UP OR HAIR DOWN · C from 1.758 s: the duel, a tie in the breakdown, the hair falls on the drop (beat 12)
r = Reel('hair', 'C', 3, 32, 'Hair up or hair down?'); R[r.name] = r
r.shot('hL', 'E3C6EA7D', 0, 4, 9.65, focus='face', matte=True)
r.shot('hR', '62379666', 0, 4, 0.00, focus='face', matte=True)
r.shot('h02', '267E722A', 4, 5, 6.75, z=[1.05, 1.12]); r.shot('h03', '398F157B', 5, 6, 8.05, z=[1.05, 1.1])
r.shot('h04', 'C64FD42F', 6, 6.5, 44.0, z=[1.0, 1.05]); r.shot('h05', '041FCDC6', 6.5, 7, 8.40, z=[1.0, 1.05])
r.shot('h06', '267E722A', 7, 7.5, 0.20); r.shot('h07', 'FB8CD2FD', 7.5, 8, 6.25)
r.shot('tL', 'C64FD42F', 8, 10, 44.0, loop=0.6, focus='face'); r.shot('tR', '62379666', 8, 10, 0.30, loop=0.6, focus='face')
r.shot('h09', 'E3C6EA7D', 10, 12, 14.65 - 2 * 0.47999, z=[1.04, 1.14], focus='face')
r.shot('h10', 'E3C6EA7D', 12, 14, 14.65, z=[1.14, 1.04], focus='face', matte=True)
r.shot('h11', '5627AA72', 14, 16, 13.70); r.shot('h12', 'CF686DEA', 16, 17, 51.80, z=[1.1, 1.14], focus='face')
r.shot('h13', 'FB8CD2FD', 17, 18, 11.10, z=[1.08, 1.12], focus='face'); r.shot('h14', 'C64FD42F', 18, 19, 13.00, z=[1.06, 1.1], focus='face')
r.shot('h15', 'BD3B07AF', 19, 20, 2.25, z=[1.1, 1.14], focus='face'); r.shot('h16', 'E3C6EA7D', 20, 22, 16.55, z=[1.06, 1.12], focus='face')
r.shot('h17', '5627AA72', 22, 23, 2.55, z=[1.12, 1.16], focus='face'); r.shot('h18', '398F157B', 23, 24, 7.55, z=[1.04, 1.08])
for i, (c, s0) in enumerate([('62379666', 0.2), ('398F157B', 8.3), ('FB8CD2FD', 6.3), ('5627AA72', 15.5), ('212E5E27', 18.6), ('C64FD42F', 21.1), ('041FCDC6', 8.5), ('E3C6EA7D', 17.0), ('D0798597', 1.5)]):
    r.shot(f'hg{i}', c, 24, 25, s0, loop=0.46, focus='face')
r.shot('h19', 'C64FD42F', 25, 26, 21.00, z=[1.04, 1.08], focus='face'); r.shot('h20', '212E5E27', 26, 27, 18.35, z=[1.0, 1.04])
r.shot('h21', '267E722A', 27, 28, 0.00); r.shot('h22', 'DE17C1BF', 28, 32, 7.40, z=[1.0, 1.06])
r.add('flash', 12, c='#FBF3EC', a=.95, d=.35); r.add('zoomin', 12, a=1.3, d=.45); r.add('shake', 12, a=24, d=.4)
for k in [4, 5, 6, 6.5, 7, 7.5]: r.add('punch', k, a=.06, d=.2)
for k in range(14, 28): r.add('punch', k, a=.06, d=.24)
for k in [14, 16, 20, 24, 28]: r.add('flash', k, c='#FFBDA8', a=.5, d=.2)
for k in [17, 19, 23, 26]: r.add('shake', k, a=16, d=.22)
for k in [18, 22, 25]: r.add('glitch', k, a=16, d=.18)
r.add('spin', 16, a=12, d=.3); r.add('glitch', 27, a=24, d=.3); r.add('zoomin', 28, a=1.25, d=.35)
r.cues = dict(drop=r.B(12), tie=r.B(8))
# =====================================================================================================================
# 3 · INTRODUCING PAWAN KUMAR · B from 12.284 s: the heroine entry, the freeze on the song's own silence, laughs on the drop
r = Reel('pawan', 'B', 32, 48, 'Introducing Pawan Kumar'); R[r.name] = r
gap0, gap1 = fsnap(22.20 - r.start), fsnap(22.45 - r.start)
r.shot('p01', 'FB8CD2FD', 0, 4, 5.90, z=[1.04, 1.10], focus='face')
r.shot('p02', '041FCDC6', 4, 8, 8.20, z=[1.0, 1.08])
r.shot('p03', '62379666', 8, 12, 3.40, z=[1.0, 1.10])
r.shot('p04', '5627AA72', 12, 20, map=[[r.B(12), 13.10], [r.B(12) + 2.52, 15.62], [r.B(20), 15.62]], z=[1.04, 1.12], matte=True)
r.shot('p06', '398F157B', 20, 24, 7.90, z=[1.02, 1.10])
r.shot('p07', 'BD3B07AF', 24, 28, 12.90, z=[1.0, 1.05])
r.shot('p08', 'BD3B07AF', 28, 32, map=[[r.B(28), 22.20], [gap0, 22.60], [r.B(32), 22.60]], z=[1.0, 1.04])   # 22.60: the fan is biggest and clear of the caption
r.shot('p09', 'BD3B07AF', 32, 38, 22.95, z=[1.04, 1.0])
r.shot('p10', '62379666', 38, 44, 0.00, z=[1.0, 1.06])
r.shot('p11', 'DE17C1BF', 44, 48, 7.80, z=[1.0, 1.05])
r.add('flash', 32, c='#FBF3EC', a=.9, d=.3); r.add('shake', 32, a=22, d=.4)
for k in [4, 8, 12, 20, 24]: r.add('flash', k, c='#FBF3EC', a=.35, d=.18)
for k in range(33, 48, 2): r.add('punch', k, a=.05, d=.24)
r.cues = dict(gap=[gap0, gap1], drop=r.B(32), freeze=[r.B(12) + 2.52, r.B(20)], fan=[800, 1380])
# =====================================================================================================================
# 4 · CHOOSE YOUR CHARACTER · A from beat 8 (4.182 s): select screen in the light intro, the 808s arrive on PLAYER 1,
#     power-ups, special move, final boss in the bass gap, K.O. on the lift (beat 24 of the reel)
r = Reel('cyc', 'A', 8, 28, 'Choose your character'); R[r.name] = r
tiles = [('62379666', 0.0, 1.30), ('F2532C01', 27.0, 2.0), ('84BD71C7', 58.3, 1.2), ('5627AA72', 13.5, 1.8), ('041FCDC6', 13.15, .85), ('267E722A', 0.0, .9)]
for i, (c, s0, lp) in enumerate(tiles):
    r.shot(f'ct{i}', c, 0, 28, s0, loop=lp, focus='face')
r.shot('c02', '041FCDC6', 8, 9, 8.25, z=[1.0, 1.06]); r.shot('c03', '62379666', 9, 10, 3.65, z=[1.0, 1.06])
r.shot('c04', '212E5E27', 10, 11, 19.85, z=[1.0, 1.06]); r.shot('c05', '62379666', 11, 12, 0.20, z=[1.04, 1.1])
r.shot('c06', '5627AA72', 12, 16, 13.20)
r.shot('c07', 'BD3B07AF', 16, 21, 12.70, z=[1.0, 1.06])
r.shot('c08', 'BD3B07AF', 21, 24, 23.30 - 3 * 0.46159, z=[1.06, 1.0])
r.shot('c09', 'BD3B07AF', 24, 26, 23.30, z=[1.06, 1.02])
r.add('flash', 8, c='#FFBDA8', a=.8, d=.3); r.add('shake', 8, a=18, d=.3)
for k in [9, 10, 11]: r.add('flash', k, c='#FBF3EC', a=.6, d=.18); r.add('punch', k, a=.1, d=.25)
for k in [13, 14, 15]: r.add('shake', k, a=26, d=.25); r.add('punch', k, a=.08, d=.25)
r.add('flash', 24, c='#FFBDA8', a=.9, d=.3); r.add('shake', 24, a=34, d=.6); r.add('zoomin', 24, a=1.3, d=.4); r.add('glitch', 24, a=24, d=.25)
r.add('glitch', 16, a=18, d=.25); r.add('flash', 26, c='#FBF3EC', a=.6, d=.2)
r.cues = dict(lift=r.B(24), tiles=[t[0] for t in tiles])
# =====================================================================================================================
# 5 · I ASKED FOR ONE PHOTO · B from 17.762 s: the ask, the gallery in the breakdown, 27 videos fire in eighths on the drop
r = Reel('onephoto', 'B', 48, 40, 'I asked for ONE photo'); R[r.name] = r
r.shot('o01', '62379666', 0, 8, 0.00, z=[1.0, 1.08])
order = [('62379666', 0.4), ('041FCDC6', 8.7), ('E2552016', 5.0), ('5627AA72', 14.0), ('267E722A', 0.3), ('212E5E27', 20.6), ('2FB96BA5', 2.8),
         ('F2532C01', 28.0), ('E3C6EA7D', 10.2), ('D0798597', 2.0), ('1AEDD2D8', 17.8), ('74FA1A49', 20.6), ('A9E89517', 9.0), ('0C1A5F38', 12.5),
         ('A352935A', 12.0), ('FB8CD2FD', 6.5), ('C64FD42F', 21.2), ('84BD71C7', 59.2), ('BD3B07AF', 22.95), ('398F157B', 8.2), ('76D95B49', 2.0),
         ('CF686DEA', 19.5), ('20AA749D', 0.8), ('DE17C1BF', 8.3), ('069EEAED', 1.0), ('50E69BE9', 1.3), ('8FC2055C', 0.6)]
k = 16.0
for i, (c, s0) in enumerate(order):
    span = 4 / 2 if c == 'BD3B07AF' else (3 / 2 if i == 26 else 1 / 2)        # the fan holds two beats, the last clip runs to the bar
    if c == 'BD3B07AF':
        r.shot(f'ob{i:02d}', c, k, k + span, map=[[r.B(k), 22.30], [r.B(k) + .3, 22.60], [r.B(k + span), 22.60]])
    else:
        r.shot(f'ob{i:02d}', c, k, k + span, s0 - .08, z=[1.06, 1.1], focus='face')
    k += span
r.shot('o40', 'DE17C1BF', 32, 40, map=[[r.B(32), 7.70], [r.B(32) + .7, 8.40], [r.B(40), 8.40]], z=[1.0, 1.0])
for kk in [x / 2 for x in range(32, 64)]: r.add('punch', kk, a=.05, d=.14)
r.add('flash', 16, c='#FBF3EC', a=.9, d=.25); r.add('shake', 16, a=20, d=.3)
r.add('glitch', 25, a=22, d=.3); r.add('flash', 32, c='#FFBDA8', a=.7, d=.25)
r.cues = dict(drop=r.B(16), gap=[fsnap(22.20 - r.start), fsnap(22.45 - r.start)], fan=[r.B(25), r.B(27)])
# =====================================================================================================================
# 5b · I ASKED FOR ONE PHOTO, on track D from 12.633 s (beat 38): the chat (with the reason: her Naira hoops have to show), the
#      gallery holding on D's silence, a snare pickup into video 1, 27 cuts from D's drop, the fan, the laugh, and on D's next
#      bass hit (beat 72, reel beat 34) a shutter onto the DP she actually wanted: 041FCDC6 at 8.50 s, eyes to the lens, hoop in.
r = Reel('onephoto2', 'D', 38, 44, 'I asked for ONE photo'); R[r.name] = r
r.shot('o01', '62379666', 0, 8, 0.00, z=[1.0, 1.08])
k = 16.0
for i, (c, s0) in enumerate(order):
    span = 4 / 2 if c == 'BD3B07AF' else (3 / 2 if i == 26 else 1 / 2)
    if c == 'BD3B07AF':
        r.shot(f'ob{i:02d}', c, k, k + span, map=[[r.B(k), 22.30], [r.B(k) + .3, 22.60], [r.B(k + span), 22.60]])
    else:
        r.shot(f'ob{i:02d}', c, k, k + span, s0 - .08, z=[1.06, 1.1], focus='face')
    k += span
r.shot('o40', 'DE17C1BF', 32, 34, map=[[r.B(32), 7.72], [r.B(34), 8.38]])
r.shot('dp', '041FCDC6', 34, 44, map=[[r.B(34), 8.50], [r.B(44), 8.50]])
r.add('flash', 16, c='#FBF3EC', a=.9, d=.3); r.add('shake', 16, a=20, d=.3)
for kk in [x / 2 for x in range(32, 64)]: r.add('punch', kk, a=.05, d=.14)
r.add('glitch', 25, a=22, d=.3); r.add('flash', 32, c='#FFBDA8', a=.5, d=.2); r.add('flash', 34, c='#FBF3EC', a=.6, d=.22)   # the camera flash on the shutter
r.cues = dict(drop=r.B(16), gap=[fsnap(17.25 - r.start), fsnap(17.52 - r.start)], snare=r.B(15), fan=[r.B(25), r.B(27)], dp=r.B(34))
# =====================================================================================================================
# 1b · DIWALI LOOK LOADING on track D from 7.417 s (beat 22): the same 64 beats, so D's silence (17.25-17.52), snare (beat 53)
#      and drop (beat 54) fall where B's did; D's gap is one beat before its drop, so the clip-pull is re-timed round it
r = Reel('diwali2', 'D', 22, 64, 'Diwali look loading…'); R[r.name] = r
gap0, gap1 = fsnap(17.25 - r.start), fsnap(17.52 - r.start)
r.shot('d01', 'F2532C01', 0, 4, 2.40, z=[1.03, 1.10], focus='face')
r.shot('d02', '74FA1A49', 4, 8, 5.50, z=[1.0, 1.06])
r.shot('d03', '0C1A5F38', 8, 11, 2.95, z=[1.02, 1.07], focus='face')
r.shot('d04', '5627AA72', 11, 12, 8.02)
r.shot('d05', 'F2532C01', 12, 16, 26.75, z=[1.04, 1.10], focus='face')
r.shot('d06', 'F2532C01', 16, 18, 36.95, z=[1.10, 1.16], focus='face')
r.shot('d07', '74FA1A49', 18, 20, 20.35, z=[1.0, 1.08])
r.shot('d08', 'E2552016', 20, 24, 4.55, z=[1.02, 1.06], focus='face')
r.shot('d09', 'E3C6EA7D', 24, 28, 9.70, z=[1.10, 1.18], focus='face')
r.shot('d10', 'E3C6EA7D', 28, 32, map=[[r.B(28), 14.10], [gap0, 14.78], [gap1, 14.78], [r.B(32), 15.40]], z=[1.08, 1.30], focus='face', matte=True)
r.shot('d11', '5627AA72', 32, 34, 13.75, z=[1.06, 1.0])
r.shot('d12', '5627AA72', 34, 35, 15.38, z=[1.18, 1.10], focus='face')
r.shot('d13', '62379666', 35, 37, 6.25, z=[1.0, 1.04], matte=True)
r.shot('d14', '041FCDC6', 37, 39, 8.25, z=[1.0, 1.06])
r.shot('d15', '62379666', 39, 41, 3.60, z=[1.04, 1.0])
r.shot('d16', '212E5E27', 41, 43, 19.85, z=[1.0, 1.05])
r.shot('d17', '5627AA72', 43, 44, 8.08)
r.shot('d18', '398F157B', 44, 46, 8.05, z=[1.05, 1.12])
r.shot('d19a', 'FB8CD2FD', 46, 47, 6.20, focus='face'); r.shot('d19b', '041FCDC6', 46, 47, 8.50, focus='face'); r.shot('d19c', '212E5E27', 46, 47, 18.70, focus='face')
r.shot('d20', 'FB8CD2FD', 47, 49, 6.00, z=[1.02, 1.08])
r.shot('d21', '041FCDC6', 49, 51, 11.00, z=[1.0, 1.05])
for i, (c, s0) in enumerate([('62379666', 0.2), ('041FCDC6', 8.5), ('212E5E27', 20.0), ('398F157B', 8.3), ('FB8CD2FD', 6.3), ('5627AA72', 15.5), ('62379666', 3.8), ('041FCDC6', 11.3), ('E3C6EA7D', 22.8)]):
    r.shot(f'dg{i}', c, 51, 52, s0, loop=0.34, focus='face')
r.shot('d22', '62379666', 52, 53, map=[[r.B(52), 0.40], [r.B(53), 0.40]], matte=True)
r.shot('d23', '212E5E27', 53, 55, 18.45, z=[1.0, 1.06])
r.shot('d24', 'D0798597', 55, 57, 1.30, z=[1.10, 1.16], focus='face')
r.shot('d25', '5627AA72', 57, 59, 2.55, z=[1.12, 1.18], focus='face')
r.shot('d26', 'E3C6EA7D', 59, 61, 22.65, z=[1.08, 1.14], focus='face')
r.shot('d27', 'DE17C1BF', 61, 64, 7.85, z=[1.0, 1.06])
for k in [32]: r.add('flash', k, c='#FBF3EC', a=.95, d=.35); r.add('zoomin', k, a=1.35, d=.45); r.add('shake', k, a=26, d=.4)
for k in range(33, 64, 2): r.add('punch', k, a=.07, d=.26)
for k in [35, 41, 47, 52, 57, 59, 61]: r.add('flash', k, c='#FFBDA8', a=.55, d=.22)
for k in [39, 45, 51, 55]: r.add('glitch', k, a=20, d=.2)
for k in [37, 43, 53]: r.add('shake', k, a=18, d=.25)
r.add('spin', 47, a=-14, d=.3); r.add('zoomin', 47, a=1.28, d=.3); r.add('zoomin', 41, a=1.22, d=.28)
r.add('glitch', 11, a=14, d=.12); r.add('flash', 12, c='#FBF3EC', a=.6, d=.15); r.add('shake', 14, a=10, d=.5); r.add('glitch', 16, a=10, d=.14)
r.add('flash', 19, c='#FFBDA8', a=.5, d=.2); r.add('punch', 22, a=.08); r.add('punch', 25, a=.06); r.add('flash', 4, c='#FBF3EC', a=.4, d=.15); r.add('flash', 8, c='#FBF3EC', a=.4, d=.15)
r.add('flash', 31, c='#FBF3EC', a=.35, d=.12)                                      # D's snare: the clip starts to come out
r.add('zoomin', 50, a=1.2, d=.3); r.add('flash', 50, c='#FFBDA8', a=.45, d=.2)        # D's sub hit at 23.717 s
r.cues = dict(gap=[gap0, gap1], drop=r.B(32), riser=[gap1, r.B(32)])
# =====================================================================================================================
# 3b · INTRODUCING PAWAN KUMAR on track D from 7.417 s (beat 22): the fan freezes a beat before D's silence (beat 29), so the
#      debut card holds for three beats through the silence and the snare, and she breaks on the drop
r = Reel('pawan2', 'D', 22, 48, 'Introducing Pawan Kumar'); R[r.name] = r
gap0, gap1 = fsnap(17.25 - r.start), fsnap(17.52 - r.start)
r.shot('p01', 'FB8CD2FD', 0, 4, 5.90, z=[1.04, 1.10], focus='face')
r.shot('p02', '041FCDC6', 4, 8, 8.20, z=[1.0, 1.08])
r.shot('p03', '62379666', 8, 12, 3.40, z=[1.0, 1.10])
r.shot('p04', '5627AA72', 12, 20, map=[[r.B(12), 13.30], [r.B(20) - .2, 15.62], [r.B(20), 15.62]], z=[1.04, 1.12], matte=True)
r.shot('p06', '398F157B', 20, 24, 7.90, z=[1.02, 1.10])
r.shot('p07', 'BD3B07AF', 24, 28, 12.90, z=[1.0, 1.05])
r.shot('p08', 'BD3B07AF', 28, 32, map=[[r.B(28), 22.20], [r.B(29), 22.60], [r.B(32), 22.60]], z=[1.0, 1.04])
r.shot('p09', 'BD3B07AF', 32, 38, 22.95, z=[1.04, 1.0])
r.shot('p10', '62379666', 38, 44, 0.00, z=[1.0, 1.06])
r.shot('p11', 'DE17C1BF', 44, 48, 7.80, z=[1.0, 1.05])
r.add('flash', 32, c='#FBF3EC', a=.9, d=.3); r.add('shake', 32, a=22, d=.4)
for k in [4, 8, 12, 20, 24]: r.add('flash', k, c='#FBF3EC', a=.35, d=.18)
for k in range(33, 48, 2): r.add('punch', k, a=.05, d=.24)
r.cues = dict(gap=[gap0, gap1], drop=r.B(32), fan0=r.B(29), fan=[800, 1380])
# =====================================================================================================================
# 5c · I ASKED FOR ONE PHOTO, re-cut at track D's own pace (92 BPM: every cut on a kick), 40 beats = 26.1 s. The ask over four
#      posed shots (the bass comes in on the Naira line), the gallery in D's breakdown, the videos one a beat from the bass's
#      return and two a beat in the full groove, the fan frozen, her laugh in D's silence, the shutter on the drop, and the
#      DP: the best frame in the shoot (62379666 at 4.00 s, ranked over every frame: face sharpness, stillness, eyes to the
#      lens, mouth, a hoop showing), then the profile, the comments, and her reply on D's heaviest bass hit
r = Reel('onephoto3', 'D2', 0, 40, 'I asked for ONE photo'); R[r.name] = r
r.shot('a1', '62379666', 0, 2, 0.00, z=[1.0, 1.06], focus='face')
r.shot('a2', '041FCDC6', 2, 4, 8.10, z=[1.02, 1.07], focus='face')
r.shot('a3', '212E5E27', 4, 6, 18.40, z=[1.0, 1.05], focus='face')
r.shot('a4', '398F157B', 6, 8, 7.90, z=[1.02, 1.08], focus='face')
VID = [('F2532C01', 27.0), ('74FA1A49', 20.4), ('CF686DEA', 18.6), ('5627AA72', 7.85), ('E2552016', 4.6), ('1AEDD2D8', 15.2), ('84BD71C7', 58.6), ('267E722A', 6.6),
       ('212E5E27', 20.2), ('0C1A5F38', 12.6), ('C64FD42F', 13.0), ('2FB96BA5', 2.6), ('A352935A', 10.4), ('76D95B49', 4.3), ('E3C6EA7D', 15.0), ('D0798597', 1.4)]
k = 12.0
for i, (c, s0) in enumerate(VID):
    span = 1 if i < 8 else .5                                       # one a beat, then two a beat in the full groove
    r.shot(f'v{i + 1:02d}', c, k, k + span, s0, z=[1.04, 1.08], focus='face'); k += span
r.shot('vfan', 'BD3B07AF', 24, 26, map=[[r.B(24), 22.20], [r.B(24) + .4, 22.60], [r.B(26), 22.60]], z=[1.0, 1.06])
r.shot('vlaugh', 'DE17C1BF', 26, 27, map=[[r.B(26), 7.72], [r.B(27), 8.38]])
r.shot('dp', '62379666', 27, 40, map=[[r.B(27), 4.00], [r.B(40), 4.00]], focus='face')
for kk in range(12, 20): r.add('punch', kk, a=.03, d=.22)
for kk in [x / 2 for x in range(40, 48)]: r.add('punch', kk, a=.035, d=.16)
r.add('flash', 12, c='#FBF3EC', a=.35, d=.16); r.add('flash', 27, c='#FBF3EC', a=.6, d=.22); r.add('punch', 4, a=.05, d=.32)   # the bass comes in
r.cues = dict(drop=r.B(27), gap=[fsnap(17.25 - r.start), fsnap(17.52 - r.start)], fan=[r.B(24), r.B(26)], dp=r.B(27), vid=[r.B(12), r.B(24)])
# =====================================================================================================================
# 6 · POV: YOU'RE HER HOOP · C from 1.758 s: one bubble a bar; the spin lands on the drop (bar 4)
r = Reel('hoop', 'C', 3, 32, "POV: you're her hoop"); R[r.name] = r
r.shot('v1', '74FA1A49', 0, 4, 19.90, z=[1.0, 1.04]); r.shot('v2', 'F2532C01', 4, 8, 27.00, z=[1.04, 1.1], focus='face')
r.shot('v3', '041FCDC6', 8, 12, 8.10, z=[1.0, 1.06]); r.shot('v4', '5627AA72', 12, 16, 13.30, z=[1.0, 1.04])
r.shot('v5', '041FCDC6', 16, 20, 10.70, z=[1.0, 1.05]); r.shot('v6', 'BD3B07AF', 20, 24, 12.80, z=[1.0, 1.04])
r.shot('v7', 'BD3B07AF', 24, 28, 22.70, z=[1.04, 1.0]); r.shot('v8', '62379666', 28, 32, 0.00, z=[1.0, 1.06])
r.add('flash', 12, c='#FFBDA8', a=.7, d=.3); r.add('shake', 12, a=20, d=.4)
for k in [4, 8, 16, 20, 24, 28]: r.add('punch', k, a=.05, d=.25)
r.add('shake', 25, a=14, d=1.4)
r.cues = dict(drop=r.B(12))
# =====================================================================================================================
# 7 · KISNE DIYA? MAINE. · A from beat 24 (11.568 s): the question, a held look into the bass gap, "Maine." on the lift
r = Reel('maine', 'A', 24, 24, 'Kisne diya? Maine.'); R[r.name] = r
r.shot('m01', '041FCDC6', 0, 2, 8.25, z=[1.0, 1.05]); r.shot('m02', '62379666', 2, 4, 3.55, z=[1.0, 1.05])
r.shot('m03', '62379666', 4, 8, 0.00, z=[1.0, 1.14])
r.shot('m04', '5627AA72', 8, 12, 13.55)
r.shot('m05', '212E5E27', 12, 16, 19.70, z=[1.0, 1.05]); r.shot('m06', '041FCDC6', 16, 20, 10.80, z=[1.0, 1.05])
r.shot('m07', '398F157B', 20, 24, 7.80, z=[1.0, 1.08])
r.add('flash', 8, c='#FFBDA8', a=.9, d=.35); r.add('zoomin', 8, a=1.3, d=.45); r.add('shake', 8, a=24, d=.45)
for k in [2, 12, 16, 20]: r.add('flash', k, c='#FBF3EC', a=.35, d=.18)
for k in range(9, 24, 2): r.add('punch', k, a=.05, d=.22)
r.cues = dict(lift=r.B(8), gap=fsnap(14.0 - r.start))

jobs = {}
for r in R.values():
    D = r.finish()
    for s in D['shots']:
        j = jobs.setdefault(s['key'], dict(key=s['key'], clip=s['clip'], ext0=s['ext0'], n=s['n'], matte=False))
        j['matte'] = j['matte'] or bool(s.get('matte'))
    print(f"{r.name:9s} song {r.song} from {r.start:7.3f}s  {r.frames} frames ({r.dur:.2f}s)  shots {len(r.shots)}  fx {len(r.fx)}")
json.dump(list(jobs.values()), open(f'{V15}/extract.json', 'w'), indent=0)
print(len(jobs), 'source ranges,', sum(j['n'] for j in jobs.values()), 'frames,', sum(j['n'] for j in jobs.values() if j['matte']), 'matte frames')
