"""AD 2 v2, Verdant Circlet Studs: "the anatomy". Product only. The owner: the on-model shots read as AI, so no AI people;
each ad gets its own idea.
- Emerald gulal and gold dust fall past one stud (an AI product shot, like the approved Prism and Cushion), under a veil
  that sinks the light shaft behind the type. Its greens are graded to the real stone (green_grade.py): the AI emerald
  was lime, the listing's is bottle green, and the colour changed at the cut.
- Then the REAL listing photo: its details drawn out one by one, on an even half-second, with hairline elbows like a
  jeweller's spec sheet (emerald-green CZ, gold star points, shell pearl, 16.8 mm). Only this ad uses callouts.
- Then the pair, once the clip's mist has cleared, held under the end card. The review: the mist beat was the most AI
  moment, and jumping inside the clip to the end card popped (fog gone, stones 4% larger in one frame).
Usage: python3.13 -I build_p2b.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7', 'redo_kit'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 6 * B, 12 * B, 18 * B]                         # 0, 3.75, 7.5, 11.25
DUR = CUT[-1]
shots = [shot('p2_hook' + X, CUT[0], CUT[1], off=.3),
         shot('v_real_one' + X, CUT[1], CUT[2], speed=0, zoom=[1.0, 1.015], ax=.42, ay=.5),
         # the pair from clip 4.0 s (by 3.4 s a big plume is still behind it), lower and larger so the chip clears the stones
         shot('p2_pair' + X, CUT[2], CUT[2] + 1.04, off=4.0, zoom=[1.10, 1.12], ax=.5, ay=0),
         shot('p2_pair' + X, CUT[2] + 1.04, DUR + .05, off=5.04, speed=0, zoom=[1.12, 1.13], ax=.5, ay=0)]
GLOW = 'text-shadow:0 0 16px rgba(251,243,236,.95)'
ov = [f'<div class="o" style="left:0;top:0;width:1080px;height:620px;z-index:14;background:linear-gradient(180deg, rgba(10,34,26,.6) 0%, '
      f'rgba(10,34,26,.45) 70%, rgba(10,34,26,0) 100%)" data-k=\'{tk(0, CUT[1], now=True)}\'></div>']
ov += [o.replace('data-k=\'' + tk(0, 99, now=True) + '\'', 'data-k=\'' + tk(0, CUT[1], now=True) + '\'') for o in hook('One bold ear is enough.', 1099, 2200, size=66)]
ov.append(quiet_offer(1.0, CUT[1], y=570, centre=True))
# ---- the anatomy, on the real photo: one detail every half second ----
t = CUT[1]
ov.append(caps('THE DETAILS', 'lt', 0, 296, 22, t + .05, CUT[2], track=.34, extra='width:1080px;text-align:center;color:#50726A'))
ov += elbow(505, 662, 560, 470, 'EMERALD-GREEN CZ', t + .25, CUT[2], glow=GLOW)        # the dot on the gold bezel, not the dark facets
ov += elbow(302, 935, 64, 560, '', t + .75, CUT[2])
ov.append(f'<div class="o" style="left:64px;top:518px;z-index:18" data-k=\'{tk(t + 1.2, CUT[2])}\'><div class="lab7 lt" style="font-size:20px;{GLOW}">GOLD STAR POINTS</div></div>')
ov.append(dot(736, 1046, t + 1.25, CUT[2], r=6, fill='#1A1614'))
ov.append(draw('M740 1036L800 640L830 640', t + 1.37, CUT[2], stroke='#1A1614', width=1.6, d=.4))
ov.append(f'<div class="o" style="left:842px;top:628px;z-index:18" data-k=\'{tk(t + 1.7, CUT[2])}\'><div class="lab7 lt" style="font-size:20px;{GLOW}">SHELL<br>PEARL</div></div>')
ov.append(dim_rule(235, 650, 235, 1240, t + 1.75, CUT[2], '', stroke='#1A1614', width=1.6))   # ticked at the stone top and the star tip
ov.append(vlabel(200, 945, '16.8 mm', t + 1.9, CUT[2], size=30))
ov.append(caps('PVD 18K GOLD COATING', 'lt', 0, 334, 18, t + 2.15, CUT[2], track=.28, extra=f'width:1080px;text-align:center;{GLOW}'))
# ---- the pair, seen clean for a beat, then the card ----
ov += endcard(CUT[2] + .4, 'Verdant Circlet Studs', 1099, 2200, 'rgba(10,34,26,A)', chip_y=596)
cue('air', 0, t1=1.6, v=.35); cue('bloom', CUT[2] + .45, v=.3)
page7('p2b' if DPR == 1 else 'p2b_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[2] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .4, 'harp_v': .85,
                       'sections': [[0, CUT[1], 'groove'], [CUT[1], CUT[2], 'light'], [CUT[2], CUT[2] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[2], DUR - 2 * B], 'tail_silence': 3 / 24}})
