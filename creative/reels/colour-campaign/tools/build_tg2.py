"""COLOUR CAMPAIGN, TOGGLE LINK CHAIN 2: "Jade & gold". The same clasp as the owner's photo (round spring-gate ring about
15 mm, small pave bar of clear CZ, 4 mm paperclip links).
- 0-3.75 s: the worn still, built on that photo. A slow push to the clasp while a cloud of gold-ivory powder (a veo
  element plate on black, made RGBA) sweeps across and carries the cut.
- Then the clasp macro: gold dust swirling up off a jade-green plate, measured.
- The end card sits back on the worn still.
Claims: 50 cm, 4 mm paperclip links, about 15 mm ring clasp, PVD 18K gold coating; Rs 1,199 (MRP 2,900).
Usage: python3.13 -I build_tg2.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 6 * B, 12 * B, 18 * B]                         # 0, 3.75, 7.5, 11.25
DUR = CUT[-1]
shots = [shot('tg_neck' + X, CUT[0], CUT[1], speed=0, zoom=[1.0, 1.1], ax=.52, ay=.53),
         shot('pl_ivory', CUT[1] - 1.6, CUT[1] + .45, off=3.4 - 1.6, fadeOut=.4),          # densest on the cut
         shot('tg_plate', CUT[1], CUT[2], off=.6),
         shot('tg_neck' + X, CUT[2], DUR, speed=0, zoom=[1.1, 1.13], ax=.52, ay=.62)]
shots = [shots[0], shots[2], shots[1], shots[3]]                                           # the plate draws over the macro's first frames
ov = [o.replace('data-k=\'' + tk(0, 99, now=True) + '\'', 'data-k=\'' + tk(0, CUT[1] - 1.0, now=True) + '\'') for o in hook('Gold, worn clasp-front.', 1199, 2900, size=64)]
ov.append(line('A round ring clasp,', 'q', 'iv sh', 64, 0, 400, CUT[1] + .3, CUT[2]))
ov.append(line('a little pavé bar.', 'q', 'iv sh', 64, 0, 470, CUT[1] + .45, CUT[2]))
ov.append(dim_rule(362, 1238, 772, 1238, CUT[1] + .4, CUT[1] + 1.9, ''))     # early in the push-in, while the ring still matches it
ov.append(f'<div class="o ta-r" style="left:{334 - 1080}px;top:1196px;width:1080px;z-index:18" data-k=\'{tk(CUT[1] + .7, CUT[1] + 1.9)}\'>'
          f'<div class="num7 iv sh" style="font-size:52px">15 mm</div><div class="lab7 iv" style="font-size:16px;margin-top:6px;margin-right:-.2em">RING CLASP</div></div>')
ov.append(caps('50 CM &nbsp;·&nbsp; 4 MM PAPERCLIP LINKS &nbsp;·&nbsp; PVD 18K GOLD COATING', 'iv sh', 0, 500, 18, CUT[1] + .6, CUT[2], track=.2, extra='width:1080px;text-align:center'))
ov.append(quiet_offer(1.0, CUT[1] - 1.0))
ov += endcard(CUT[2], 'Toggle Link Chain', 1199, 2900, 'rgba(14,44,34,A)', veil_h=760)
cue('air', CUT[1] - 1.6, t1=CUT[1] + .4, v=.5); cue('bloom', CUT[1] + .5, v=.3); cue('bloom', CUT[2] + .05, v=.3)
page7('tg2' if DPR == 1 else 'tg2_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[2] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .45, 'harp_v': .85,
                       'sections': [[0, CUT[2], 'groove'], [CUT[2], CUT[2] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[2], DUR - 2 * B], 'tail_silence': 3 / 24}})
