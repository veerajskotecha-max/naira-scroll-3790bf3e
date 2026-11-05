"""COLOUR CAMPAIGN, AD 4: Woven Gold Hoops - haldi gold. Two Kling 4.0 shots from start frames built on the real listing
photos:
1. The pair on a brass thali while marigold petals rain down through saffron sunlight.
2. On the ear at a haldi: marigold garlands, a laugh.
The end card sits on the settled petals. Claims, all from the listing: about 25 mm, a thick braided rope of gold
strands, one pair, PVD 18K gold coating; Rs 1,199 (MRP 2,769). Usage: python3.13 -I build_p4.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 6 * B, 10 * B, 16 * B]                          # 0, 3.75, 6.25, 10.0
DUR = CUT[-1]
shots = [shot('p4_hoops' + X, CUT[0], CUT[1], off=.2),
         shot('p4_ear' + X, CUT[1], CUT[2], off=0.0),                                    # profile: the hoop in full view
         shot('p4_hoops' + X, CUT[2], DUR, off=4.95, speed=0, zoom=[1.0, 1.035], ay=.6)]
ov = [o.replace("tk(0, 99", f"tk(0, {CUT[1]}") if False else o for o in []]
ov += [o.replace('data-k=\'' + tk(0, 99, now=True) + '\'', 'data-k=\'' + tk(0, CUT[1], now=True) + '\'') for o in hook('The hoops for every function.', 1199, 2769, size=64)]
ov.append(line('From haldi to sangeet.', 'q', 'iv sh', 66, 64, 1080, CUT[1] + .2, CUT[2], align='l'))
ov.append(caps('BRAIDED GOLD ROPE &nbsp;·&nbsp; ABOUT 25 MM', 'iv sh', 64, 1112, 22, CUT[1] + .45, CUT[2], track=.22))
ov.append(caps('PVD 18K GOLD COATING', 'iv sh', 64, 1150, 22, CUT[1] + .6, CUT[2], track=.22))
ov.append(quiet_offer(1.0, CUT[1]))
ov += endcard(CUT[2], 'Woven Gold Hoops', 1199, 2769, 'rgba(92,38,8,A)')
cue('air', 0, t1=1.8, v=.35); cue('bloom', CUT[2] + .05, v=.3)
page7('p4' if DPR == 1 else 'p4_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[2] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .55, 'harp_v': .85,
                       'sections': [[0, CUT[2], 'groove'], [CUT[2], CUT[2] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[2], DUR - 2 * B], 'tail_silence': 3 / 24}})
