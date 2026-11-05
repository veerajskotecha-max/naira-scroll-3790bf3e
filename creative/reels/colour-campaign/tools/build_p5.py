"""COLOUR CAMPAIGN, AD 5: Halo Curve Ring - amber hour. Two Kling 4.0 shots from start frames built on the real listing
photos:
1. A desert wind blows amber sand off a mound and uncovers the ring; start and end frames are pinned to the real piece.
2. Golden sand streams past the hand wearing it.
The end card sits on the revealed ring. Claims, all from the listing: natural tiger eye beside a faceted pale champagne
crystal, irregular bezels, an open gold band that adjusts US 5-9, PVD 18K gold coating; "two stones that do not match,
and that is the point"; Rs 1,199 (MRP 3,419). Usage: python3.13 -I build_p5.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 6 * B, 11 * B, 17 * B]                         # 0, 3.75, 6.875, 10.625
DUR = CUT[-1]
shots = [shot('p5_reveal' + X, CUT[0], CUT[1], off=.6),
         shot('p5_hand', CUT[1], CUT[2], off=.3),                                       # 1080 only (credits ran out before its 4K pass): the canvas scales it
         shot('p5_reveal' + X, CUT[2], DUR, off=4.95, speed=0, zoom=[1.0, 1.035], ay=.6)]
ov = [o.replace('data-k=\'' + tk(0, 99, now=True) + '\'', 'data-k=\'' + tk(0, CUT[1], now=True) + '\'')
      for o in hook('Two stones that do not match.', 1199, 3419, size=58, line2='That is the point.')]
ov.append(line('Natural tiger eye,', 'q', 'iv sh', 64, 0, 400, CUT[1] + .2, CUT[2]))
ov.append(line('champagne crystal.', 'q', 'iv sh', 64, 0, 470, CUT[1] + .35, CUT[2]))
ov.append(caps('OPEN BAND &nbsp;·&nbsp; ADJUSTS US 5–9 &nbsp;·&nbsp; PVD 18K GOLD COATING', 'iv sh', 0, 500, 20, CUT[1] + .55, CUT[2], track=.2, extra='width:1080px;text-align:center'))
ov.append(quiet_offer(1.0, CUT[2]))
ov += endcard(CUT[2], 'Halo Curve Ring', 1199, 3419, 'rgba(70,36,10,A)')
cue('air', 0, t1=2.6, v=.45); cue('air', CUT[1], t1=CUT[1] + 1.6, v=.25); cue('bloom', CUT[2] + .05, v=.3)
page7('p5' if DPR == 1 else 'p5_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[2] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .45, 'harp_v': .85,
                       'sections': [[0, CUT[2], 'groove'], [CUT[2], CUT[2] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[2], DUR - 2 * B], 'tail_silence': 3 / 24}})
