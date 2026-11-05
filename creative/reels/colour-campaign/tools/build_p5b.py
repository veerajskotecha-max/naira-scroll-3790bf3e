"""AD 5 v2, Halo Curve Ring: "two stones". Product only, no AI hand (the owner: on-model shots read as AI).
- A desert wind uncovers the ring from amber sand; the reveal is pinned at both ends.
- Then the same shot splits, full-bleed, into a live diptych: the tiger eye on the left half, the crystal on the right,
  the dust still drifting (slowed with blended frames, never frozen). "Two stones that do not match" made literal, and
  it stays in the sand: no wall, no print card (the review: those were p4b's and tg2b's devices, and a 1.8x freeze
  showed the AI).
- The end card sits on the ring as the dust settles.
Usage: python3.13 -I build_p5b.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7', 'redo_kit'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 6 * B, 11 * B, 17 * B]                         # 0, 3.75, 6.875, 10.625
DUR = CUT[-1]
HL, HR = [0, 0, 539, 1920], [541, 0, 539, 1920]          # a full-height half cover-fits at k = 1, so zoom 1.5 is a 1.5x source scale
shots = [shot('p5_reveal' + X, CUT[0], CUT[1] + .55, off=.6),          # runs on under the halves, so the full frame dissolves into the split
         shot('p5_reveal' + X, CUT[1], CUT[2], off=2.9, speed=.68, mix=True, fadeIn=.3, **aim(515, 835, HL, 1.5)),
         shot('p5_reveal' + X, CUT[1] + .25, CUT[2], off=3.07, speed=.68, mix=True, fadeIn=.3, **aim(695, 1020, HR, 1.5)),
         shot('p5_reveal' + X, CUT[2], DUR + .05, off=3.7, hold=True, zoom=[1.0, 1.035], ay=.6)]   # plays to the clip's end, then holds
ov = [o.replace('data-k=\'' + tk(0, 99, now=True) + '\'', 'data-k=\'' + tk(0, CUT[1], now=True) + '\'')
      for o in hook('Two stones that do not match.', 1199, 3419, size=58, line2='That is the point.')]
ov.append(quiet_offer(2.3, CUT[1], y=622, centre=True))      # after the sand ribbon has cleared y 600-700
# ---- the diptych: one hairline between the halves, every word in the dark band above the stones ----
ov.append(f'<div class="o" style="left:539px;top:0;width:2px;height:1920px;background:#FBF3EC;z-index:13" '
          f'data-k=\'{K((CUT[1] + .25 - .002, {"o": 0}, "lin"), (CUT[1] + .55, {"o": .9}, "io"), (CUT[2] - .13, {"o": .9}, "lin"), (CUT[2], {"o": 0}, "in"))}\'></div>')
ov.append(f'<div class="o" style="left:0;top:0;width:1080px;height:700px;z-index:14;background:linear-gradient(180deg, rgba(70,36,10,.6) 0%, '
          f'rgba(70,36,10,.4) 65%, rgba(70,36,10,0) 100%)" data-k=\'{tk(CUT[1], CUT[2])}\'></div>')
ov.append(line('One ring. Two stones.', 'q', 'iv sh', 54, 0, 352, CUT[1] + .2, CUT[2]))
ov.append(caps('NATURAL TIGER EYE', 'iv sh', -270, 392, 20, CUT[1] + .4, CUT[2], track=.3, extra='width:1080px;text-align:center'))
ov.append(caps('CRYSTAL', 'iv sh', 270, 392, 20, CUT[1] + .65, CUT[2], track=.3, extra='width:1080px;text-align:center'))
ov.append(caps('OPEN BAND &nbsp;·&nbsp; ADJUSTS US 5–9 &nbsp;·&nbsp; PVD 18K GOLD COATING', 'iv sh', 0, 450, 18, CUT[1] + .9, CUT[2], track=.26, extra='width:1080px;text-align:center'))
ov += endcard(CUT[2], 'Halo Curve Ring', 1199, 3419, 'rgba(70,36,10,A)')
cue('air', 0, t1=2.6, v=.45); cue('bloom', CUT[1] + .1, v=.3); cue('bloom', CUT[2] + .05, v=.3)
page7('p5b' if DPR == 1 else 'p5b_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[2] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .4, 'harp_v': .85,
                       'sections': [[0, CUT[1], 'groove'], [CUT[1], CUT[2], 'light'], [CUT[2], CUT[2] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[2], DUR - 2 * B], 'tail_silence': 3 / 24}})
