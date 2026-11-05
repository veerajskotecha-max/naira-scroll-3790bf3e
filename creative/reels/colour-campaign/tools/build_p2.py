"""COLOUR CAMPAIGN, AD 2: Verdant Circlet Studs - emerald and gold. Three Kling 4.0 shots from start frames built on the
real listing photos:
1. One stud on emerald silk while green gulal and gold dust pour down through a warm beam behind it.
2. On the ear: a festive profile, jasmine in the bun, an emerald saree; the listing's own "one bold ear is enough".
3. The pair on a gold-edged plinth on emerald velvet; settled powder lifts in a slow swirl. The end card sits on this.
Claims, all from the listing: a cushion-cut emerald-GREEN cubic zirconia (never "emerald"), an open circlet of clear CZ
and gold points, a white shell pearl, PVD 18K gold coating, about 16.8 mm tall; Rs 1,099 (MRP 2,200). The offer is the
live ladder (col_kit). Usage: python3.13 -I build_p2.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
exec(open(f'{_S}/ads/tools/build5_head.py').read()); exec(open(f'{_S}/ads/tools/hero_kit.py').read()); exec(open(f'{_S}/ads/tools/col_kit.py').read())
FPS, B = 24, 60 / 96
SFX = '' if DPR == 1 else '_4k'
CUT = [0, 5 * B, 10 * B, 14 * B, 20 * B]                 # 0, 3.125, 6.25, 8.75, 12.5
DUR = CUT[-1]
shots = [
    shot('p2_hook' + SFX, CUT[0], CUT[1], off=.3),
    shot('p2_ear' + SFX, CUT[1], CUT[2], off=.5),
    shot('p2_pair' + SFX, CUT[2], CUT[3], off=.3),
    shot('p2_pair' + SFX, CUT[3], DUR, off=4.95, speed=0, zoom=[1.0, 1.035], ay=.55),
]
IV = 'iv sh'; ov = []
# ---- frame 1: the mark, the listing's own line, the price ----
ov.append(f'<div class="o" style="left:440px;top:280px;width:200px;z-index:16;filter:drop-shadow(0 2px 10px rgba(0,20,12,.85))" data-k=\'{tk(0, CUT[1], now=True)}\'>{logo(letters="#99B4AF")}</div>')
ov.append(line('One bold ear is enough.', 'q', IV, 70, 0, 420, 0, CUT[1], now=True))
ov.append(f'<div class="o" style="left:0;top:440px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:20px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>'
          f'<span class="num7 iv sh" style="font-size:100px">{RS(1099)}</span>'
          f'<span class="mrp7" style="font-size:30px">{RS(2200)}<span class="o strike" data-k=\'{K((0, {"w": 104}, "step"))}\'></span></span></div>')
# ---- on the ear ----
ov.append(line('For the wedding function.', 'q', IV, 66, 64, 1080, CUT[1] + .2, CUT[2], align='l'))
ov.append(caps('EMERALD-GREEN CZ &nbsp;·&nbsp; SHELL PEARL', IV, 64, 1112, 22, CUT[1] + .45, CUT[2], track=.22))
ov.append(caps('PVD 18K GOLD COATING', IV, 64, 1150, 22, CUT[1] + .6, CUT[2], track=.22))
# ---- the pair, measured ----
ov.append(dim_rule(990, 650, 990, 1075, CUT[2] + .4, CUT[3], ''))
ov.append(f'<div class="o ta-r" style="left:{1040 - 1080}px;top:500px;width:1080px;z-index:18" data-k=\'{tk(CUT[2] + .75, CUT[3])}\'>'
          f'<div class="num7 iv sh" style="font-size:56px">16.8 mm</div><div class="lab7 iv" style="font-size:18px;margin-top:10px;margin-right:-.22em">TOP TO PEARL</div></div>')
# ---- the offer, quiet ----
for a_, b_, y_ in ((1.0, CUT[1], 1222), (CUT[2] + .1, CUT[3], 300)):   # over the pair it rides the dark top band: the plinth face is cream
    ov.append(f'<div class="o" style="left:64px;top:{y_}px;z-index:15" data-k=\'{tk(a_, b_)}\'>'
              f'<div class="lab7 iv sh" style="font-size:22px"><span style="color:#FFBDA8">●</span>&nbsp; {OFFER2} &nbsp;·&nbsp; {OFFER3}</div></div>')
# ---- the end card: a deep green veil from the top, the column above the pair, the ask under it ----
t = CUT[3]; c6 = lambda t, dy=12: K((t - .002, {'o': 0, 'y': dy}, 'lin'), (t + .25, {'o': 1, 'y': 0}, 'out'))
ov.append(f'<div class="o" style="left:0;top:0;width:1080px;height:700px;z-index:5;background:linear-gradient(180deg, rgba(10,34,26,.92) 0%, rgba(10,34,26,.78) 70%, rgba(10,34,26,0) 100%)" data-k=\'{c6(t, 0)}\'></div>')
ov.append(f'<div class="o" style="left:420px;top:282px;width:240px;z-index:6" data-k=\'{c6(t + .05)}\'>{logo(letters="#99B4AF")}</div>')
ov.append(line('Verdant Circlet Studs', 'q', IV, 60, 0, 414, t + .15, FOREVER))
ov.append(f'<div class="o" style="left:0;top:432px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:22px;z-index:6" data-k=\'{c6(t + .3)}\'>'
          f'<span class="num7 iv" style="font-size:90px">{RS(1099)}</span>'
          f'<span class="mrp7" style="font-size:30px">{RS(2200)}<span class="o strike" data-k=\'{K((t + .55, {"w": 0}, "lin"), (t + .75, {"w": 104}, "out"))}\'></span></span></div>')
ov.append(f'<div class="o" style="left:0;top:548px;width:1080px;text-align:center;z-index:7" data-k=\'{c6(t + .55)}\'>'
          f'<div class="lab7 iv sh" style="font-size:22px;line-height:1.9">{OFFER2} &nbsp;·&nbsp; {OFFER3}<br>FREE SHIPPING &nbsp;·&nbsp; COD AVAILABLE</div></div>')
ov.append(f'<div class="o" style="left:0;top:1178px;width:1080px;display:flex;justify-content:center;z-index:7" data-k=\'{c6(t + .9)}\'>'
          f'<div class="lab7" style="font-size:24px;color:#FBF3EC;background:#1A1614;padding:17px 34px 15px 40px;letter-spacing:.28em">SHOP NOW</div></div>')
cue('air', 0, t1=1.6, v=.35)
cue('bloom', CUT[2] + .2, v=.35)
cue('bloom', CUT[3] + .05, v=.3)
page7('p2' if DPR == 1 else 'p2_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[3] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .45, 'harp_v': .85,
                       'sections': [[0, CUT[3], 'groove'], [CUT[3], CUT[3] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[3], DUR - 2 * B], 'tail_silence': 3 / 24}})
