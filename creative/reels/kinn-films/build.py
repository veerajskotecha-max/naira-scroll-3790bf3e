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
        'D2': dict(file=f'{S}/v16/an/ref2.wav', beat=0.65201, k0=0.245),
        'B2': dict(file=f'{V15}/an/song_full.wav', beat=2 * 0.34238, k0=23.240 - 64 * 0.34238)}  # B at the pace it is felt: 87.6 BPM  # D at the pace it is felt: 92 BPM, kicks on these beats   # the owner's newest track (from her own edit): 184.05 BPM, gap 17.25-17.52, drop 17.849 (beat 54)
fsnap = lambda x: round(x * FPS) / FPS
scan = {}
def faces(clip):
    if clip not in scan:
        d = json.load(open(f'{S}/v14/scan/{clip}.json'))
        scan[clip] = {r['i']: [v * 1.5 for v in r['face']['box']] for r in d['rows'] if r.get('face')}
    return scan[clip]

class Reel:
    def __init__(self, name, song, k_start, beats, title, off=0.0):
        self.name, self.song, self.title, self.off = name, song, title, off
        g = SONG[song]; self.beat = g['beat']; self.start = g['k0'] + k_start * g['beat'] - off
        self.frames = round((off + beats * g['beat']) * FPS); self.dur = self.frames / FPS
        self.shots, self.fx, self.cues = [], [], {}
    def B(self, k): return fsnap(self.off + k * self.beat)
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
        D = dict(name=self.name, title=self.title, fps=FPS, frames=self.frames, dur=self.dur, beat=self.beat, off=self.off, song=self.song,
                 audio=dict(file=song['file'], start=max(0.0, round(self.start, 4))), shots=self.shots, fx=self.fx, cues=self.cues, faces=fz)
        if getattr(self, 'script', None): D['script'] = self.script            # a shared script, configured by the cues
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
# 5d · I ASKED FOR ONE PHOTO, the final cut: track D from its first note (beat 0 at 0.245 s, so off=0.245) to just before bar
#      10's downbeat (26.33 s). Bars of 2.608 s: the ask in bars 0-1 (the Naira line on bar 1's bass), the gallery in bar 2's
#      breakdown, twelve videos one a beat through bars 3-5, the fan in bar 6 (frozen on its beat-2 hit), her laugh in the
#      silence, a clap that snaps the camera's focus onto her, the shutter on the drop (17.85 s), the DP held through bar 7's
#      drum roll, the profile on bar 8's heavy kick, comments on its snares, and her reply on bar 9's sub hit
r = Reel('onephoto4', 'D2', 0, 40, 'I asked for ONE photo', off=0.245); R[r.name] = r
r.shot('a1', '62379666', (0.0,), 2, 0.00, z=[1.0, 1.06], focus='face')
r.shot('a2', '041FCDC6', 2, 4, 8.10, z=[1.02, 1.07], focus='face')
r.shot('a3', '212E5E27', 4, 6, 18.40, z=[1.0, 1.05], focus='face')
r.shot('a4', '398F157B', 6, 8, 7.90, z=[1.02, 1.08], focus='face')
VID4 = [('F2532C01', 27.0), ('74FA1A49', 20.4), ('CF686DEA', 18.6), ('5627AA72', 7.85), ('E2552016', 4.6), ('1AEDD2D8', 15.2),
        ('84BD71C7', 58.6), ('267E722A', 6.6), ('212E5E27', 20.2), ('C64FD42F', 13.0), ('76D95B49', 4.3), ('2FB96BA5', 2.6)]
for i, (c, s0) in enumerate(VID4):
    r.shot(f'v{i + 1:02d}', c, 12 + i, 13 + i, s0, z=[1.04, 1.08], focus='face')
r.shot('vfan', 'BD3B07AF', 24, 26, map=[[r.B(24), 21.95], [r.B(25), 22.60], [r.B(26), 22.60]], z=[1.0, 1.06])
r.shot('vlaugh', 'DE17C1BF', 26, 27, map=[[r.B(26), 7.72], [r.B(27), 8.37]])
r.shot('dp', '62379666', 27, 40, map=[[r.B(27), 4.00], [r.B(40), 4.00]], focus='face')
r.add('punch', 4, a=.05, d=.32)                                              # the bass comes in
for kk in range(12, 24): r.add('punch', kk, a=.035, d=.24)                   # a kick under every video
r.add('flash', 12, c='#FBF3EC', a=.35, d=.16); r.add('punch', 25, a=.06, d=.3)   # the bass returns; the fan freezes
r.add('flash', 27, c='#FBF3EC', a=.6, d=.22)                                 # the camera flash on the shutter
r.cues = dict(drop=r.B(27), gap=[fsnap(17.25 - r.start), fsnap(17.52 - r.start)], clap=fsnap(17.541 - r.start), fan=[r.B(24), r.B(26)],
              freeze=r.B(25), dp=r.B(27), vid=[r.B(12), r.B(24)],
              roll=[fsnap(t - r.start) for t in (18.679, 18.841, 19.495, 19.657, 20.147)])   # bar 7's drum roll: glints on the jewellery
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

# =====================================================================================================================
# 5e · I ASKED FOR ONE PHOTO, the elegant final, on track B (the moon song) from its first note, cut at B's felt pace (87.6 BPM:
#      beat 0.68476 s, beat 0 at 1.328 s, so off=1.32768 puts the song's 0.0 at reel 0.0). The ask over two posed shots, then all
#      27 of her videos, one a beat and two a beat through the build; the 27th is the DP clip itself, which plays into B's
#      breakdown and freezes on B's silence (22.20 s) on the best frame in the shoot. The drop (23.24 s, beat 32) is the
#      screenshot. Eight more stills stack up as prints on sage, one a beat, and the profile card lands on beat 44. It ends before
#      beat 48 (34.196 s), after the beat where B's bass drops out, so the loop breathes.
r = Reel('onephoto5', 'B2', 0, 48, 'I asked for ONE photo', off=1.32768); R[r.name] = r
r.shot('a1', 'FB8CD2FD', (0.0,), 2, 1.00, z=[1.0, 1.03], focus='face')       # posing for the one photo
r.shot('a2', '041FCDC6', 2, 6, 1.00, z=[1.0, 1.03], focus='face')
VID5 = [('041FCDC6', 8.20), ('267E722A', 0.00), ('74FA1A49', 20.30), ('A352935A', 10.30), ('E3C6EA7D', 9.80), ('212E5E27', 18.70),
        ('1AEDD2D8', 17.60), ('FB8CD2FD', 6.20), ('C64FD42F', 44.30), ('398F157B', 8.00), ('F2532C01', 45.90), ('76D95B49', 2.40),
        ('069EEAED', 0.50), ('0C1A5F38', 1.60), ('50E69BE9', 0.90), ('D0798597', 1.50),
        ('5627AA72', 13.85), ('E2552016', 4.85), ('2FB96BA5', 2.60), ('CF686DEA', 51.60), ('DE17C1BF', 1.50), ('84BD71C7', 40.60),
        ('20AA749D', 0.50), ('A9E89517', 3.20), ('BD3B07AF', 2.30), ('8FC2055C', 0.40)]      # videos 1-26; 27 is the DP clip
for i, (c, s0) in enumerate(VID5):
    k0 = 6 + i if i < 16 else 22 + (i - 16) / 2
    r.shot(f'v{i + 1:02d}', c, k0, k0 + (1 if i < 16 else .5), s0, z=[1.0, 1.03], focus='face')
gap0, gap1 = fsnap(22.20 - r.start), fsnap(22.45 - r.start)
r.shot('dp', '62379666', 27, 48, map=[[r.B(27), 4.00 - (gap0 - r.B(27))], [gap0, 4.00], [r.B(48), 4.00]], focus='face')
STILLS5 = [('E2552016', 11.93), ('50E69BE9', 5.70), ('E3C6EA7D', 17.53), ('C64FD42F', 0.00), ('CF686DEA', 40.87), ('041FCDC6', 12.43),
           ('0C1A5F38', 4.60), ('398F157B', 1.00)]                          # sharp frames from the DP ranking, none a montage frame
for i, (c, s) in enumerate(STILLS5):
    r.shot(f'c{i + 1}', c, 36 + i, 48, map=[[r.B(36 + i), s], [r.B(48), s]])
r.add('flash', 32, c='#FBF3EC', a=.92, d=.42)                               # the screenshot
r.cues = dict(gap=[gap0, gap1], drop=r.B(32), freeze=gap0, vid=[r.B(6), r.B(27)], fast=r.B(22), shrink=[r.B(34), r.B(35)],
              stack=r.B(36), card=r.B(44))
# =====================================================================================================================
# 8 · THE FINISHING TOUCHES · track D (Punjabi) from its first note to bar 8 (21.109 s), at its felt 92 BPM (bars of 2.608 s
#     from 0.245 s): the hoop goes in as the bass enters, the cuff slides on in the breakdown, the ring on the bass's return, the
#     hair comes down with the drums, the look in the full groove, her eyes to the lens through the silence, the spin on the
#     drop (17.849 s), the cover close-up through the drum roll. The opening lines are subtitled in English.
r = Reel('golden', 'D2', 0, 32, 'The finishing touches', off=0.245); R[r.name] = r
r.shot('g0', '069EEAED', (0.0,), 2, 0.50, z=[1.0, 1.03], focus='face')            # a close, still first frame: her hand at the choker, the cuff
r.shot('g1', '1AEDD2D8', 2, 4, 1.20, z=[1.0, 1.03], focus='face')                 # fastening the hoop
r.shot('g2', '74FA1A49', 4, 8, 20.00, z=[1.0, 1.03])
r.shot('g3', '74FA1A49', 8, 12, 4.90, z=[1.0, 1.04])
r.shot('g4', '5627AA72', 12, 16, 8.85 - 4 * 0.65201, z=[1.0, 1.03])  # the cuff at her collar, then her hand to the lens: the ring fills the frame, a wipe into the hair
r.shot('g6', 'E3C6EA7D', 16, 20, 13.55, z=[1.0, 1.04])
r.shot('g7', 'FB8CD2FD', 20, 22, 6.10, z=[1.0, 1.03], focus='face')
r.shot('g8', '212E5E27', 22, 24, 18.45, z=[1.0, 1.03], focus='face')
r.shot('g9', '041FCDC6', 24, 27, 8.00, z=[1.0, 1.05], focus='face')
r.shot('g10', '5627AA72', 27, 29, 13.75)
r.shot('g11', '62379666', 29, 32, 0.00, z=[1.0, 1.05], focus='face')
r.script = 'elegant'
r.cues = dict(silence=[fsnap(17.25 - r.start), fsnap(17.52 - r.start)], drop=r.B(27), credit=r.B(29) + .35,
              lines=[["come, let's love like the old days.", 0.1, r.B(4) - .2], ["i've written you a thousand letters.", r.B(4) + .05, r.B(8) - .15]])
# =====================================================================================================================
# 9 · TERA KARAAN INTEZAAR (I wait for you) · track D from its drop hit (17.849 s) to bar 14 (36.758 s): portraits a bar each,
#     two a bar in the middle; the hook is subtitled where it is sung (22.36 s), and the credit closes it.
r = Reel('intezaar', 'D2', 27, 29, 'I wait for you'); R[r.name] = r
r.shot('i1', 'C64FD42F', 0, 1, 13.00)
r.shot('i2', '267E722A', 1, 5, 5.90, z=[1.0, 1.04])
r.shot('i3', 'E3C6EA7D', 5, 9, 9.30, z=[1.0, 1.05], focus='face')
r.shot('i4', '041FCDC6', 9, 13, 7.90, z=[1.0, 1.04], focus='face')
r.shot('i5', 'C64FD42F', 13, 15, 20.80, z=[1.0, 1.03], focus='face')
r.shot('i6', '212E5E27', 15, 17, 18.50, z=[1.0, 1.03], focus='face')
r.shot('i7', 'FB8CD2FD', 17, 21, 10.80, z=[1.0, 1.03])
r.shot('i8', 'A352935A', 21, 25, 9.80, z=[1.0, 1.04], focus='face')
r.shot('i9', '76D95B49', 25, 29, 1.00, z=[1.0, 1.05], focus='face')
r.script = 'elegant'
r.cues = dict(credit=r.B(25) + .35, frame=True, lines=[['i wait for you.', fsnap(22.36 - r.start) - .05, fsnap(25.34 - r.start) + .2]])

# =====================================================================================================================
# THE PUNJABI SET (track D, no lyrics on screen): four ways to hit the same drop. D at its felt 92 BPM (D2): beat k of the song
# at 0.245 + k * 0.65201 s; bars of 2.608 s; the silence 17.25-17.52 s, a clap at 17.541 s, the drop on beat 27 (17.849 s), the
# drum roll's hits (18.679, 18.841, 19.495, 19.657, 20.147 s), the heavy kick on beat 32 (21.109 s), the hook from 22.36 s, the
# sub hit on beat 36 (23.717 s). The vocal line that follows ends at 31.38 s, so the long cuts end on beat 48 (31.541 s).
DT = lambda k: 0.245 + k * 0.65201                                      # song time of D's beat k
ROLL = (18.679, 18.841, 19.495, 19.657, 20.147)
def rt(r, t): return fsnap(t - r.start)                                 # a song time as reel time
# ---------------------------------------------------------------------------------------------------------------------
# P1 · THE DROP · bars 3-7 (8.069-21.109 s): hair-up looks, two a bar, then one a beat, then two a beat as the song fills;
#      bar 6 is one take of her taking the clip out, frozen with her hands at it through the silence, moving again on the clap,
#      and the hair falls on the drop. Then the drum roll: a cut on every hit of it.
r = Reel('pj_drop', 'D2', 12, 20, 'The drop'); R[r.name] = r
r.script = 'elegant'
r.shot('d01', '267E722A', 0, 2, 0.00, z=[1.0, 1.05], focus='face')
r.shot('d02', 'E2552016', 2, 4, 7.85, z=[1.0, 1.04], focus='face')
for i, (c, s0) in enumerate([('C64FD42F', 44.35), ('F2532C01', 56.38), ('267E722A', 6.75), ('C64FD42F', 31.65)]):
    r.shot(f'd{i + 3:02d}', c, 4 + i, 5 + i, s0, z=[1.02, 1.06], focus='face')
for i, (c, s0) in enumerate([('E2552016', 4.80), ('267E722A', 2.00), ('E3C6EA7D', 10.00), ('E3C6EA7D', 7.60),
                             ('E2552016', 23.10), ('E3C6EA7D', 3.90), ('267E722A', 7.25), ('E2552016', 8.90)]):
    r.shot(f'd{i + 7:02d}', c, 8 + i / 2, 8.5 + i / 2, s0, z=[1.03, 1.07], focus='face')
SIL0, CLAP, DROP = rt(r, 17.25), rt(r, 17.541), r.B(15)
r.shot('d15a', 'C64FD42F', 12, 13, 55.25, z=[1.0, 1.04], focus='face')       # one beat of her profile, hair up
r.shot('d15', 'E2552016', 13, 16, map=[[r.B(13), 26.87 - (SIL0 - r.B(13))], [SIL0, 26.87], [CLAP, 26.87], [DROP, 27.07], [r.B(16), 27.07 + r.B(16) - DROP]],
       z=[1.0, 1.06], focus='face')                                   # hands at the clip in the silence; the clap pulls it; the hair falls on the drop
cuts = [r.B(16)] + [rt(r, h) for h in ROLL[:2]] + [r.B(17)] + [rt(r, h) for h in ROLL[2:4]] + [r.B(18), rt(r, ROLL[4]), r.B(19), r.B(20)]
for i, (c, s0) in enumerate([('5627AA72', 13.80), ('CF686DEA', 51.80), ('FB8CD2FD', 11.00), ('C64FD42F', 13.10), ('DE17C1BF', 2.25),
                             ('5627AA72', 15.40), ('212E5E27', 18.60), ('041FCDC6', 8.40), ('398F157B', 7.95)]):
    r.shot(f'd{i + 16:02d}', c, (cuts[i],), (cuts[i + 1],), s0, z=[1.04, 1.0] if i < 8 else [1.0, 1.05], focus='face')
for k in range(4, 8): r.add('punch', k, a=.04, d=.2)
for k in [8 + i / 2 for i in range(8)]: r.add('punch', k, a=.05, d=.16)
r.add('flash', 15, c='#FBF3EC', a=.8, d=.32); r.add('zoomin', 15, a=1.2, d=.4)
for t in cuts[:-1]: r.add('punch', (t,), a=.08, d=.18)
r.cues = dict(lines=[], credit=999, silence=[SIL0, rt(r, 17.52)], clap=CLAP, drop=DROP, cuts=cuts)
# ---------------------------------------------------------------------------------------------------------------------
# P2 · MULTIPLY · bars 4-11 (10.677-31.541 s): one frame becomes two (on her hand covering the lens), four, then nine, all
#      frozen in the silence; the centre tile bursts to full screen on the drop with the hair whip. The drum roll flickers the
#      screen into 4 and 9 on its hits; the heavy kick ripples one spin across nine tiles; the hook is one calm close-up; the
#      grid builds back tile by tile in the last bar round a sage tile carrying the only credit.
r = Reel('pj_grid', 'D2', 16, 32, 'Multiply'); R[r.name] = r
SIL0, CLAP, DROP, HOOK = rt(r, 17.25), rt(r, 17.541), r.B(11), rt(r, 22.36)
RH = [rt(r, h) for h in ROLL]
SEG = []
def seg(t0, t1, kind, tiles, **kw): SEG.append(dict(t0=t0, t1=t1, kind=kind, tiles=tiles, **kw))
def tiles(prefix, k0, k1, clips, t0=None):
    ids = []
    for i, (c, s0) in enumerate(clips):
        sid = f'{prefix}{i + 1}'; r.shot(sid, c, k0 if t0 is None else (t0,), k1, s0, focus='face'); ids.append(sid)
    return ids
r.shot('ga', '212E5E27', 0, 4, 20.81 - 4 * 0.65201, z=[1.0, 1.04], focus='face')     # ends on her hand over the lens, ring in
seg(0, r.B(4), 'full', ['ga'])
seg(r.B(4), r.B(6), '2v', tiles('gb', 4, 6, [('041FCDC6', 8.00), ('FB8CD2FD', 6.10)]))
seg(r.B(6), r.B(8), '2x2', tiles('gc', 6, 8, [('62379666', 0.10), ('267E722A', 0.00), ('C64FD42F', 21.00), ('76D95B49', 1.80)]))
ring9 = [('398F157B', 8.00), ('E3C6EA7D', 10.00), ('069EEAED', 0.60), ('2FB96BA5', 2.60), None, ('C64FD42F', 44.40), ('A352935A', 10.20),
         ('1AEDD2D8', 1.40), ('F2532C01', 56.40)]
ring9[4] = ('5627AA72', 13.75 - (SIL0 - r.B(8)))                        # the centre: frozen just before the whip, which plays on the drop
seg(r.B(8), DROP, '3x3', tiles('gd', 8, (DROP,), ring9), freeze=SIL0, flash=CLAP,
    num=[f'{i + 1:02d}' for i in range(9)], sel=dict(tile=4, t=CLAP))          # numbered tiles; the clap picks 05, the drop bursts it
r.shot('ge', '5627AA72', (DROP,), 12, 13.75)
seg(DROP, r.B(12), 'full', ['ge'], grow=4)                                 # grows out of the centre tile
WH = [('5627AA72', 13.85), ('CF686DEA', 51.85), ('FB8CD2FD', 11.10), ('E2552016', 4.90), ('C64FD42F', 13.20), ('DE17C1BF', 2.30),
      ('267E722A', 7.00), ('E2552016', 27.10), ('E3C6EA7D', 14.75)]
r.shot('gf1', 'CF686DEA', 12, (RH[0],), 51.60); seg(r.B(12), RH[0], 'full', ['gf1'])
seg(RH[0], RH[1], '2x2', tiles('gf2', (RH[0],), (RH[1],), WH[:4], t0=RH[0]))
r.shot('gf3', 'FB8CD2FD', (RH[1],), 13, 11.00); seg(RH[1], r.B(13), 'full', ['gf3'])
r.shot('gf4', 'C64FD42F', 13, (RH[2],), 13.10); seg(r.B(13), RH[2], 'full', ['gf4'])
seg(RH[2], RH[3], '2x2', tiles('gf5', (RH[2],), (RH[3],), WH[4:8], t0=RH[2]))
r.shot('gf6', 'DE17C1BF', (RH[3],), 14, 2.20); seg(RH[3], r.B(14), 'full', ['gf6'])
r.shot('gf7', '212E5E27', 14, (RH[4],), 18.55); seg(r.B(14), RH[4], 'full', ['gf7'])
seg(RH[4], r.B(15), '3x3', tiles('gf8', (RH[4],), 15, WH, t0=RH[4]))
r.shot('gf9', '041FCDC6', 15, 16, 8.40, z=[1.0, 1.05], focus='face'); seg(r.B(15), r.B(16), 'full', ['gf9'])
CAS = 0.07                                                                 # the ripple: each tile 70 ms behind the last
r.shot('gcas', '5627AA72', (r.B(16) - 8 * CAS,), (HOOK,), 13.62 - 8 * CAS)
seg(r.B(16), HOOK, '3x3', ['gcas'] * 9, cascade=CAS)
r.shot('gh', '62379666', (HOOK,), 20, 0.00, z=[1.0, 1.08], focus='face'); seg(HOOK, r.B(20), 'full', ['gh'])
seg(r.B(20), r.B(22), '2x2', tiles('gi', 20, 22, [('041FCDC6', 8.50), ('212E5E27', 18.45), ('C64FD42F', 44.50), ('398F157B', 8.10)]))
r.shot('gi5', 'E3C6EA7D', 22, 24, 9.85, z=[1.0, 1.05], focus='face'); seg(r.B(22), r.B(24), 'full', ['gi5'])
for i, (c, s0) in enumerate([('FB8CD2FD', 11.00), ('CF686DEA', 51.70), ('267E722A', 6.80), ('C64FD42F', 13.10)]):
    r.shot(f'gj{i + 1}', c, 24 + i, 25 + i, s0, z=[1.04, 1.0], focus='face'); seg(r.B(24 + i), r.B(25 + i), 'full', [f'gj{i + 1}'])
k9 = [('041FCDC6', 8.60), ('212E5E27', 18.60), ('62379666', 0.30), ('398F157B', 8.20), None, ('C64FD42F', 44.60), ('5627AA72', 4.25),
      ('FB8CD2FD', 6.40), ('267E722A', 0.30)]
ids = []
for i, c in enumerate(k9):
    if c is None: ids.append('brand'); continue
    sid = f'gk{i + 1}'; r.shot(sid, c[0], 28, 32, c[1], focus='face'); ids.append(sid)
ORDER = [0, 1, 2, 5, 8, 7, 6, 3, 4]                                         # round the edge clockwise, the brand last, in the centre
NUM = [''] * 9
for j, i in enumerate(ORDER[:8]): NUM[i] = f'{j + 1:02d}'                  # each tile's number counts up as it lands
seg(r.B(28), r.B(32) + 1, '3x3', ids, build=[r.B(28 + j / 4) for j in range(9)], order=ORDER, num=NUM)
r.add('punch', 4, a=.05, d=.2); r.add('punch', 6, a=.05, d=.2); r.add('punch', 8, a=.05, d=.2)
r.add('flash', (CLAP,), c='#FBF3EC', a=.45, d=.16); r.add('flash', (DROP,), c='#FBF3EC', a=.7, d=.3)
for t in [r.B(12), RH[0], RH[1], r.B(13), RH[2], RH[3], r.B(14), RH[4], r.B(15)]: r.add('punch', (t,), a=.06, d=.16)
r.add('punch', 16, a=.08, d=.3); r.add('punch', 20, a=.06, d=.3)
for k in range(24, 28): r.add('punch', k, a=.05, d=.2)
r.cues = dict(seg=SEG, silence=[SIL0, rt(r, 17.52)], clap=CLAP, drop=DROP, hook=HOOK)
# ---------------------------------------------------------------------------------------------------------------------
# P3 · HOOP ZOOM · bars 6-11 (15.893-31.541 s): the hoops are the main character. A slow push on her profile, frozen in the
#      silence, snaps into the hoop on the clap; the drop is the hair whip. Through the drum roll every shot lands wide and
#      the camera snaps into the hoop on the roll's hits; the heavy kick is the hoop in macro; the hook is slow pushes into it;
#      bars 10-11 snap in on every off-beat; the last bar pushes into the cover close-up's hoop and names it.
r = Reel('pj_zoom', 'D2', 24, 24, 'Hoop zoom'); R[r.name] = r
SIL0, CLAP, DROP, HOOK = rt(r, 17.25), rt(r, 17.541), r.B(3), rt(r, 22.36)
RH = [rt(r, h) for h in ROLL]
Z = {}                                                                     # shot -> [[t, zoom, ease seconds], ...]
r.shot('z01', '212E5E27', 0, 3, map=[[0, 18.40], [SIL0, 19.55], [DROP, 19.55]])
Z['z01'] = [[0, 1.25, SIL0, 'io'], [CLAP, 2.0, .09, 'out']]
r.shot('z02', '5627AA72', 3, 4, 13.75)
plan = [('z03', '041FCDC6', 8.20, 4, 5, [[RH[0], 1.6], [RH[1], 2.1]]), ('z04', '069EEAED', 0.60, 5, 6, [[RH[2], 1.6], [RH[3], 2.1]]),
        ('z05', '398F157B', 7.95, 6, 7, [[RH[4], 1.8]]), ('z06', 'C64FD42F', 44.40, 7, 8, [[r.B(7.5), 1.8]])]
for sid, c, s0, k0, k1, zz in plan:
    r.shot(sid, c, k0, k1, s0); Z[sid] = [[t, z, .08, 'out'] for t, z in zz]
r.shot('z07', '74FA1A49', 8, (HOOK,), 20.00)                               # the heavy kick: the hoop in macro
for sid, c, s0, t0, t1, zt in [('z08', 'C64FD42F', 20.85, (HOOK,), 12, 1.35), ('z09', '212E5E27', 18.30, 12, 16, 1.3)]:   # z09 ends on her hand over the lens
    r.shot(sid, c, t0, t1, s0); a, b = (fsnap(t0[0]) if isinstance(t0, tuple) else r.B(t0)), r.B(t1); Z[sid] = [[a, zt, b - a, 'io']]
for i, (c, s0) in enumerate([('E3C6EA7D', 9.90), ('267E722A', 0.10), ('2FB96BA5', 2.55), ('041FCDC6', 11.50), ('398F157B', 8.90), ('76D95B49', 2.00)]):
    sid = f'z{i + 11}'; r.shot(sid, c, 16 + i, 17 + i, s0); Z[sid] = [[r.B(16.5 + i), 1.75, .08, 'out']]
r.shot('z17', '62379666', 22, 24, 0.00); Z['z17'] = [[r.B(22), 1.55, r.B(24) - r.B(22), 'io']]
r.add('flash', (DROP,), c='#FBF3EC', a=.75, d=.3); r.add('zoomin', (DROP,), a=1.22, d=.4)
r.add('punch', 8, a=.12, d=.35)
for k in [4, 5, 6, 7] + list(range(16, 22)): r.add('punch', k, a=.05, d=.16)
r.cues = dict(zoom=Z, silence=[SIL0, rt(r, 17.52)], clap=CLAP, drop=DROP, hook=HOOK, credit=r.B(22) + .3)
# ---------------------------------------------------------------------------------------------------------------------
# P4 · FLASH · the song from its first note to bar 8 (0-21.109 s): a photoshoot. Each camera flash freezes her for a beat's
#      fraction, then the take runs on: one shot a bar and two flashes a bar in the slow intro, then a flash every beat, then
#      a freeze every half beat; black in the silence; the clap's flash shows her hands at the clip; the drop is a burst of
#      eight stills, an eighth of a beat each; the drum roll flashes on its hits. White flashes stay at most two a second.
r = Reel('pj_flash', 'D2', 0, 32, 'Flash', off=0.245); R[r.name] = r
SIL0, CLAP, DROP = rt(r, 17.25), rt(r, 17.541), r.B(27)
RH = [rt(r, h) for h in ROLL]
POSES = [(2, '212E5E27', 18.45, .40, 1), (4, '041FCDC6', 8.30, .40, 1), (6, 'FB8CD2FD', 5.90, .40, 1), (8, 'E3C6EA7D', 9.55, .45, 1),
         (10, '267E722A', 0.00, .45, 1), (12, 'C64FD42F', 44.40, .30, 1), (13, '398F157B', 7.90, .30, 0), (14, '5627AA72', 5.50, .30, 1),
         (15, 'A352935A', 10.20, .30, 0), (16, '069EEAED', 0.60, .30, 1), (17, '2FB96BA5', 2.60, .30, 1), (18, 'E2552016', 7.90, .30, 1),
         (19, '76D95B49', 1.90, .30, 1), (20, 'C64FD42F', 21.00, .20, 1), (20.5, '212E5E27', 18.90, .15, 0), (21, '267E722A', 7.25, .20, 1),
         (21.5, 'F2532C01', 56.40, .15, 0), (22, 'E3C6EA7D', 3.90, .20, 1), (22.5, '041FCDC6', 12.40, .15, 0), (23, 'CF686DEA', 41.00, .20, 1),
         (23.5, 'E3C6EA7D', 7.60, .15, 0), (24, 'E2552016', 4.75, .20, 1), (24.5, 'C64FD42F', 31.70, .15, 0), (25, '267E722A', 6.80, .20, 1),
         (25.5, '5627AA72', 13.80, .15, 0)]
r.shot('f01', '62379666', (0.0,), POSES[0][0], 0.00, focus='face')
EV = []
for i, (k, c, s0, h, fl) in enumerate(POSES):
    end = POSES[i + 1][0] if i + 1 < len(POSES) else (SIL0,)
    r.shot(f'f{i + 2:02d}', c, k, end, s0, focus='face'); EV.append([r.B(k), h, fl])
r.shot('fclap', 'E2552016', (CLAP,), 27, map=[[CLAP, 26.87], [DROP, 26.87]], focus='face')      # the clap's photo: hands at the clip
for i, (c, s0) in enumerate([('E2552016', 27.40), ('5627AA72', 13.90), ('CF686DEA', 51.90), ('FB8CD2FD', 11.20), ('C64FD42F', 13.25),
                             ('267E722A', 7.00), ('DE17C1BF', 2.40), ('041FCDC6', 8.50)]):
    a, b = r.B(27 + i / 8), r.B(27 + (i + 1) / 8); r.shot(f'b{i + 1}', c, (a,), (b,), map=[[a, s0], [b, s0]], focus='face')
for sid, c, s0, k0, k1 in [('fr1', '5627AA72', 13.70, 28, 29), ('fr2', 'CF686DEA', 51.50, 29, 30), ('fr3', 'C64FD42F', 12.95, 30, 31)]:
    r.shot(sid, c, k0, k1, s0, focus='face')
r.shot('fend', '041FCDC6', 31, 32, 8.30, z=[1.0, 1.06], focus='face')
EV += [[RH[0], .12, 1], [RH[1], .1, 0], [RH[2], .12, 1], [RH[3], .1, 0], [RH[4], .15, 1], [r.B(31), .3, 0]]   # no white on beat 31: three flashes in a second is the limit
EV.sort()
for t, h, fl in EV:
    r.add('punch', (t,), a=.03, d=.2)
    if fl: r.add('flash', (t,), c='#FBF3EC', a=.5, d=.18)
r.add('flash', (CLAP,), c='#FBF3EC', a=.6, d=.2); r.add('flash', (DROP,), c='#FBF3EC', a=.6, d=.25)
r.cues = dict(events=EV, black=[SIL0, CLAP], clap=CLAP, drop=DROP)

# the two elegant Punjabi reels again with no lyrics on screen (the owner's note: the lyrics did not look good); the credit stays
import copy
for base in ['golden', 'intezaar']:
    c = copy.deepcopy(R[base]); c.name = base + '_clean'; c.cues = dict(c.cues, lines=[]); R[c.name] = c

jobs = {}
for r in R.values():
    D = r.finish()
    for s in D['shots']:
        j = jobs.setdefault(s['key'], dict(key=s['key'], clip=s['clip'], ext0=s['ext0'], n=s['n'], matte=False))
        j['matte'] = j['matte'] or bool(s.get('matte'))
    print(f"{r.name:9s} song {r.song} from {r.start:7.3f}s  {r.frames} frames ({r.dur:.2f}s)  shots {len(r.shots)}  fx {len(r.fx)}")
json.dump(list(jobs.values()), open(f'{V15}/extract.json', 'w'), indent=0)
print(len(jobs), 'source ranges,', sum(j['n'] for j in jobs.values()), 'frames,', sum(j['n'] for j in jobs.values() if j['matte']), 'matte frames')
