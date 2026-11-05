"""COLOUR CAMPAIGN, AD 0 v2: the owner's AI studio film of the Cushion Halo Ring, re-cut on the 96 BPM grid to 12.5 s after
two reviews of v1 (5.5 and 7.5).
- The price and the hook are on frame 1, and the wordmark sits above them.
- The dark tail before the drop is cut.
- The macro opens on its bright frames.
- The offer (the live 10/20 ladder) is on screen from 1.6 s, not 12.9.
- Proof: a real listing photo of the OPEN back ("THE REAL PIECE"), which also answers the AI film's closed band.
- The metal is graded neutral.
- Radius-0 dimension rules replace the rounded box.
- The end card runs the light bars edge to edge with the ring larger, in one centred column with a tap ask.
Usage: python3.13 -I build_c0v2.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
exec(open(f'{_S}/ads/tools/build5_head.py').read()); exec(open(f'{_S}/ads/tools/hero_kit.py').read()); exec(open(f'{_S}/ads/tools/col_kit.py').read())
FPS, B = 24, 60 / 96                                     # one beat at 96 BPM
SRC = 'c0_cushion' if DPR == 1 else 'c0_cushion_4k'; REAL = 'c0_real' if DPR == 1 else 'c0_real_4k'
CUT = [0, 2 * B, 5 * B, 9 * B, 12 * B, 15 * B, 20 * B]    # 0, 1.25, 3.125, 5.625, 7.5, 9.375, 12.5 (the proof got three beats)
DUR = CUT[-1]; N = dict(grade='url(#g_neutral)')
shots = [
    shot(SRC, CUT[0], CUT[1], off=0.25, zoom=[1.42, 1.48], ay=.95, sqBg='black', feather=.22, **N),         # the glint, punched in; ends before the dark tail
    shot(SRC, CUT[1], CUT[2], off=2.75, zoom=[1.78, 1.84], ax=.9, ay=.5, sqBg='black', feather=0, grade='url(#g_neutral_lift)'),   # pave macro on its bright frames
    shot(SRC, CUT[2], CUT[3], off=6.1, zoom=[1.85, 1.95], ay=.46, sqBg='black', feather=.10, **N),        # the turn, tight on the head: the AI's closed back drops out of frame
    shot(REAL, CUT[3], CUT[4], off=0, speed=0, zoom=[1.0, 1.15], ax=.43, ay=.62),                        # the real open back, on cream, pushing in on the split
    shot(SRC, CUT[4], CUT[5], off=9.0, sqBg='black', feather=.22, **N),                                  # top-down, measured
    shot('pl_powder_a', CUT[5] - .7, CUT[5] + .5, off=3.6 - .7, fadeOut=.45),                       # colour comes off the stone: a pastel burst carries the cut
    shot(SRC, CUT[5], DUR, off=11.875, zoom=[1.30, 1.33], ay=.62, sqBg='black', feather=.06, **N),       # between the light bars, edge to edge
]
IV = 'iv sh'; ov = []
# ---- frame 1: the mark, the line and the price together ----
ov.append(f'<div class="o" style="left:465px;top:286px;width:150px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>{logo(letters="#99B4AF")}</div>')
ov.append(line('The engagement-ring look,', 'q', IV, 70, 0, 410, 0.0, CUT[1], now=True))
ov.append(line(f'for {RS(1099)}.', 'b', IV, 118, 0, 1150, 0.0, CUT[1], now=True))
# ---- the macro: proof of wear ----
ov.append(caps('3-YEAR PLATING ASSURANCE', IV, 64, 930, 24, CUT[1] + .1, CUT[2], track=.24))
ov.append(line('Waterproof.', 'b', IV, 80, 64, 1040, CUT[1] + .2, CUT[2], align='l'))
ov.append(line('Tarnish-free.', 'b', IV, 80, 64, 1124, CUT[1] + .4, CUT[2], align='l'))
# ---- the offer, quiet and always there from the macro to the end card ----
ov.append(f'<div class="o" style="left:64px;top:1150px;z-index:15" data-k=\'{tk(1.6, CUT[5] - .7)}\'>'
          f'<div class="lab7 iv" style="font-size:28px;line-height:1.45;background:rgba(26,22,20,.72);padding:12px 18px 10px 20px">{OFFER2}<br>{OFFER3}</div></div>')
# ---- the turn ----
ov.append(line('Clear cubic zirconia,', 'q', IV, 72, 0, 400, CUT[2] + .1, CUT[3]))
ov.append(caps('FOUR CLAWS &nbsp;·&nbsp; PVD RHODIUM', IV, 0, 432, 24, CUT[2] + .3, CUT[3], track=.24, extra='width:1080px;text-align:center'))
ov.append(f'<div class="o" style="left:0;top:1240px;width:1080px;height:680px;z-index:4;background:linear-gradient(180deg, rgba(0,0,0,0), #000 50%)" data-k=\'{tk(CUT[2], CUT[3], now=True)}\'></div>')
# ---- the real piece ----
ov.append(caps('NO RING SIZE NEEDED', 'lt', 0, 300, 26, CUT[3], CUT[4], track=.3, extra='width:1080px;text-align:center;color:#50726A', now=True))
ov.append(line('Open back.', 'q', 'lt', 84, 0, 432, CUT[3], CUT[4], now=True))
ov.append(caps('ADJUSTS TO FIT US 5–9', 'lt', 0, 462, 26, CUT[3] + .04, CUT[4], track=.26, extra='width:1080px;text-align:center;color:#1A1614'))
ov.append(dot(460, 1192, CUT[3] + .3, CUT[4], r=8, fill='#1A1614'))
ov.append(draw(f'M{470} {1192}L{690} {1192}', CUT[3] + .45, CUT[4], stroke='#1A1614', width=2, d=.3))
ov.append(f'<div class="o" style="left:706px;top:1176px;z-index:18" data-k=\'{tk(CUT[3] + .65, CUT[4])}\'><div class="lab7" style="font-size:22px;color:#1A1614">THE SPLIT</div></div>')
# ---- the top-down, measured at radius 0 (square at y 420, 1:1 on 1080) ----
SQ = lambda u, v: (u * 1080, 420 + v * 1080)
cx_, cy_ = SQ(.505, .445); rs = .168 * 1080; hx0, hy0 = SQ(.265, .205); hx1, hy1 = SQ(.745, .68)
t8, t12 = CUT[4] + .1, CUT[4] + .35
ov.append(dim_rule(cx_ - rs, hy0 - 46, cx_ + rs, hy0 - 46, t8, CUT[5] - .6, ''))
ov.append(f'<div class="o" style="left:{cx_ + rs + 34:.0f}px;top:{hy0 - 46 - 36:.0f}px;z-index:18" data-k=\'{tk(t8 + .3, CUT[5] - .6)}\'>'
          f'<div class="num7 iv sh" style="font-size:60px">8 mm</div><div class="lab7 iv" style="font-size:18px;margin-top:10px">ROUND<br>BRILLIANT</div></div>')
ov.append(dim_rule(hx0 - 50, hy0, hx0 - 50, hy1, t12, CUT[5] - .6, ''))
ov.append(f'<div class="o" style="left:64px;top:{(hy0 + hy1) / 2 - 46:.0f}px;z-index:18" data-k=\'{tk(t12 + .3, CUT[5] - .6)}\'>'
          f'<div class="num7 iv sh" style="font-size:60px">12 mm</div><div class="lab7 iv" style="font-size:18px;margin-top:10px">CUSHION<br>HALO</div></div>')
# ---- the end card: one centred column above the bars, the tap ask under the ring ----
c6 = lambda t, dy=12: K((t - .002, {'o': 0, 'y': dy}, 'lin'), (t + .25, {'o': 1, 'y': 0}, 'out'))
t = CUT[5]
ov.append(f'<div class="o" style="left:420px;top:282px;width:240px;z-index:6" data-k=\'{c6(t + .05)}\'>{logo(letters="#99B4AF")}</div>')
ov.append(line('Cushion Halo Ring', 'q', IV, 62, 0, 418, t + .15, FOREVER))
ov.append(f'<div class="o" style="left:0;top:{438}px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:22px;z-index:6" data-k=\'{c6(t + .3)}\'>'
          f'<span class="num7 iv" style="font-size:92px">{RS(1099)}</span>'
          f'<span class="mrp7" style="font-size:30px">{RS(2200)}<span class="o strike" data-k=\'{K((t + .55, {"w": 0}, "lin"), (t + .75, {"w": 102}, "out"))}\'></span></span></div>')
ov.append(f'<div class="o" style="left:0;top:1032px;width:1080px;text-align:center;z-index:6" data-k=\'{c6(t + .7)}\'>'
          f'<div class="lab7 iv sh" style="font-size:24px;line-height:1.9">{OFFER2} &nbsp;·&nbsp; {OFFER3}<br>FREE SHIPPING &nbsp;·&nbsp; COD AVAILABLE</div></div>')
ov.append(f'<div class="o" style="left:0;top:1198px;width:1080px;text-align:center;z-index:7" data-k=\'{c6(t + 1.1)}\'>'
          f'<div class="lab7" style="font-size:26px;color:#1A1614;letter-spacing:.3em">SHOP NOW</div></div>')
for y0_, y1_ in ((548, 712), (1130, 1292)):                     # the light bars, tinted blush: the ring's star stays the brightest thing
    ov.append(f'<div class="o" style="left:0;top:{y0_}px;width:1080px;height:{y1_ - y0_}px;z-index:3;background:#F2B9A8;mix-blend-mode:multiply" data-k=\'{tk(CUT[5], FOREVER, now=True)}\'></div>')
cue('bloom', 0.10, v=.45)
cue('air', CUT[3] - .35, t1=CUT[3] + .15, v=.35)
cue('air', CUT[5] - .7, t1=CUT[5] + .3, v=.4)                                   # the cut to cream: a breath, not a whoosh
page7('c0v2' if DPR == 1 else 'c0v2_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': CUT[1], 'end': CUT[5] + 2 * B, 'hit0': True, 'harp_from': CUT[1], 'strings_from': CUT[2],
                       'snaps': False, 'shaker': .5, 'harp_v': .8,
                       'sections': [[0, CUT[1], 'pad'], [CUT[1], CUT[4], 'groove'], [CUT[4], CUT[4] + 2 * B, 'soft'], [CUT[4] + 2 * B, CUT[5] + 2 * B, 'groove']],
                       'rswell': [[.4, CUT[1]]], 'end_downbeats': [CUT[5], DUR - 2 * B], 'tail_silence': 3 / 24}})
