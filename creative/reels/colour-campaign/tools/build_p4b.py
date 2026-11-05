"""AD 4 v2, Woven Gold Hoops: "the framed print". Product only, no AI people (the owner: on-model shots read as AI).
- Marigold petals rain through saffron sunlight onto the hoops on a brass thali (an AI product shot), under a veil so
  the sage mark holds against the saffron.
- Then the same rain racks out of focus into amber bokeh, and a framed print hangs over it: a square window with an
  ivory mat and a gold fillet, the REAL listing photos inside, dissolving on the beat (the oxblood shot, then the cube).
  Both are square crops of the originals, so both hoops sit whole with their hinges and catch discs.
- The end card sits on the settled petals.
The review of the first cut: 'THE REAL PIECE, ONE PAIR' told viewers the opening was not real; the frame drew itself like
a UI stroke; the flat brown wall made it p5b's print. Usage: python3.13 -I build_p4b.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7', 'redo_kit'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 6 * B, 9.5 * B, 13 * B, 19 * B]                # 0, 3.75, 5.94, 8.125, 11.875
DUR = CUT[-1]
WIN = [200, 380, 680, 680]                               # the print: x, y, w, h (the frames hold the square at y 420-1500)
RF = .35                                                 # the rack focus out of the hook, seconds
shots = [# the hook's own rain, defocused, oversized so the blur never pulls in a dark edge
         shot('p4_hoops' + X, CUT[1], CUT[3], off=.6, zoom=[1.1, 1.13], grade=f'blur({36 * DPR}px) brightness(.72) saturate(1.05)'),
         # the hook runs on over it for RF while the focus pulls (fblur below) and it fades: a rack focus, not a cut to blur.
         # Zoom 1.02 crops the source's near-black edge bars (about 4 px a side at 1080).
         shot('p4_hoops' + X, CUT[0], CUT[1] + RF, off=.2, zoom=[1.02, 1.02], fadeOut=RF),
         shot('h_real_oxblood' + X, CUT[1] + .2, CUT[2] + .3, speed=0, rect=WIN, zoom=[1.0, 1.04], ax=.5, ay=.5, fadeIn=.25),   # only once the focus has pulled
         shot('h_real_cube' + X, CUT[2], CUT[3], speed=0, rect=WIN, zoom=[1.0, 1.03], ax=.5, ay=.5, fadeIn=.3),
         shot('p4_hoops' + X, CUT[3], DUR + .05, off=4.95, speed=0, zoom=[1.02, 1.05], ay=.6)]
WALL = dict(t0=CUT[1], t1=CUT[3], grad=[[0, '#B4561A'], [.55, '#8E3A12'], [1, '#5E220A']], angle=90)   # only ever under the bokeh
ov = [f'<div class="o" style="left:0;top:0;width:1080px;height:700px;z-index:14;background:linear-gradient(180deg, rgba(92,38,8,.5) 0%, '
      f'rgba(92,38,8,.3) 70%, rgba(92,38,8,0) 100%)" data-k=\'{tk(0, CUT[1], now=True)}\'></div>']
ov += [o.replace('data-k=\'' + tk(0, 99, now=True) + '\'', 'data-k=\'' + tk(0, CUT[1], now=True) + '\'') for o in hook('The hoops for every function.', 1199, 2769, size=64)]
ov.append(quiet_offer(1.0, CUT[1], y=585, centre=True))
# ---- the print: it hangs (fades in), it does not draw itself ----
x, y, w, h = WIN; M = 14
hang = K((CUT[1] + .2 - .002, {'o': 0}, 'lin'), (CUT[1] + .45, {'o': 1}, 'io'), (CUT[3] - .13, {'o': 1}, 'lin'), (CUT[3], {'o': 0}, 'in'))
ov.append(f'<div class="o" style="left:{x - M}px;top:{y - M}px;width:{w + 2 * M}px;height:{h + 2 * M}px;box-sizing:border-box;z-index:17;'
          f'border:{M}px solid #FBF3EC;outline:2px solid #EBC77F;box-shadow:0 22px 48px rgba(40,12,0,.5)" data-k=\'{hang}\'></div>')
ov.append(caps('PVD 18K GOLD COATING', 'iv sh', 0, 296, 20, CUT[1] + .3, CUT[3], track=.32, extra='width:1080px;text-align:center'))
ov.append(line('Braided gold rope.', 'q', 'iv sh', 60, 0, 1160, CUT[1] + .5, CUT[2]))
ov.append(line('About 25 mm.', 'q', 'iv sh', 60, 0, 1160, CUT[2] + .2, CUT[3]))
ov += endcard(CUT[3], 'Woven Gold Hoops', 1199, 2769, 'rgba(92,38,8,A)')
cue('air', 0, t1=1.8, v=.35); cue('bloom', CUT[1] + .1, v=.3); cue('bloom', CUT[3] + .05, v=.3)
page7('p4b' if DPR == 1 else 'p4b_4k', DUR, shots, ov, fps=FPS, dpr=DPR, bg=[WALL], fblur=[[CUT[1], 0], [CUT[1] + .25, 36], [CUT[1] + RF + .01, 36]],
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[3] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .55, 'harp_v': .85,
                       'sections': [[0, CUT[3], 'groove'], [CUT[3], CUT[3] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[3], DUR - 2 * B], 'tail_silence': 3 / 24}})
