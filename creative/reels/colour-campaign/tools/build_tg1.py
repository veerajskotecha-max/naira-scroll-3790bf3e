"""COLOUR CAMPAIGN, TOGGLE LINK CHAIN 1: "Gold rush", practical. The clasp is the one in the owner's photo: a round
polished spring-gate ring about 15 mm across with a small pave bar of clear CZ on a jump ring, on 4 mm paperclip links.
NOT a long toggle bar and NOT an extended clasp.
- 0-3.1 s: one AI macro, built on that photo. Gold dust swirls up off a jade-green plate around the clasp.
- Then a gold-ivory powder wave carries the cut to the REAL on-model listing photo, worn clasp-front.
- Then a jade wave carries the cut to the REAL cube photo.
- The end card sits on the settled gold dust.
Claims: 50 cm, 4 mm paperclip links, about 15 mm ring clasp, PVD 18K gold coating; Rs 1,199 (MRP 2,900).
Usage: python3.13 -I build_tg1.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 5 * B, 9 * B, 13 * B, 19 * B]                  # 0, 3.125, 5.625, 8.125, 11.875
DUR = CUT[-1]
def wave(plate, cut, lead=1.0, dense=4.0, tail=.45): return shot(plate, cut - lead, cut + tail, off=dense - lead, fadeOut=tail * .9)
shots = [shot('tg_plate', CUT[0], CUT[1], off=.3),
         shot('tg_real_model' + X, CUT[1], CUT[2], speed=0, zoom=[1.0, 1.05], ay=.6),
         shot('tg_real_cube' + X, CUT[2], CUT[3], speed=0, zoom=[1.02, 1.07], ay=.5),
         shot('tg_plate', CUT[3], DUR, off=4.95, speed=0, zoom=[1.0, 1.03], ay=.55),
         wave('pl_ivory', CUT[1], dense=3.4), wave('pl_green', CUT[2])]
INK = 'lt'; GLOW = 'text-shadow:0 0 20px rgba(251,243,236,.9)'
ov = [o.replace('data-k=\'' + tk(0, 99, now=True) + '\'', 'data-k=\'' + tk(0, CUT[1] - .9, now=True) + '\'') for o in hook('The clasp is the jewel.', 1199, 2900, size=66)]
ov.append(dim_rule(368, 1238, 758, 1238, .9, CUT[1] - .9, ''))
ov.append(f'<div class="o ta-r" style="left:{340 - 1080}px;top:1196px;width:1080px;z-index:18" data-k=\'{tk(1.2, CUT[1] - .9)}\'>'
          f'<div class="num7 iv sh" style="font-size:52px">15 mm</div><div class="lab7 iv" style="font-size:16px;margin-top:6px;margin-right:-.2em">RING CLASP</div></div>')
ov.append(caps('THE REAL PIECE', INK, 0, 292, 22, CUT[1] + .45, CUT[3] - 1.0, track=.3, extra=f'width:1080px;text-align:center;color:#50726A;{GLOW}'))
ov.append(line('Worn clasp-front.', 'q', INK, 58, 0, 398, CUT[1] + .5, CUT[2] - 1.0, extra=GLOW))
ov.append(caps('PAVÉ BAR &nbsp;·&nbsp; 15 MM RING CLASP', INK, 0, 436, 20, CUT[1] + .7, CUT[2] - 1.0, track=.22, extra=f'width:1080px;text-align:center;{GLOW}'))
ov.append(line('Paperclip links, 50 cm.', 'q', INK, 66, 0, 404, CUT[2] + .5, CUT[3] - .2, extra=GLOW))
ov.append(caps('4 MM LINKS &nbsp;·&nbsp; PVD 18K GOLD COATING', INK, 0, 436, 20, CUT[2] + .7, CUT[3] - .2, track=.22, extra=f'width:1080px;text-align:center;{GLOW}'))
ov.append(f'<div class="o ta-r" style="left:{1016 - 1080}px;top:1166px;width:1080px;z-index:15" data-k=\'{tk(CUT[1] + .5, CUT[3] - .2)}\'>'
          f'<div class="lab7 lt" style="font-size:22px;line-height:1.9;margin-right:-.22em;{GLOW}">{OFFER2}<br>{OFFER3}</div></div>')
ov += endcard(CUT[3], 'Toggle Link Chain', 1199, 2900, 'rgba(14,44,34,A)')
cue('bloom', .4, v=.35); cue('air', CUT[1] - 1.0, t1=CUT[1] + .3, v=.45); cue('air', CUT[2] - 1.0, t1=CUT[2] + .3, v=.45); cue('bloom', CUT[3] + .05, v=.3)
page7('tg1' if DPR == 1 else 'tg1_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[3] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .5, 'harp_v': .85,
                       'sections': [[0, CUT[3], 'groove'], [CUT[3], CUT[3] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[3], DUR - 2 * B], 'tail_silence': 3 / 24}})
