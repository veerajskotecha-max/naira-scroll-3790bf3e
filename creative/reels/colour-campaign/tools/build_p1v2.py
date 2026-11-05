"""COLOUR CAMPAIGN, AD 1 v2 (the owner: "remove the standing part for the bracelet, rest looks good"): opens on the macro.
Prism Riviere Bracelet - "the colours come off the stones". Three Kling 4.0 shots from
start frames built on the real listing photos:
1. The bracelet upright on a plinth while pastel gulal in its own three colours (aqua, pink, butter) blooms behind it.
2. A macro glide along the stones.
3. Overhead: powder rains down and draws a pastel rangoli around it. Start AND end frames are pinned, so the bracelet
   is identical stone for stone.
The end card sits on the finished rangoli. Ink type on the pastel world; brand marks sage and blush.
Claims, all from the listing: square cushion-cut pastel CZ (aqua blue, soft pink, pale yellow), each in a pave halo; PVD
rhodium; waterproof, tarnish free; 18 cm, fits wrists 15-19 cm; Rs 2,399 (MRP 4,200). The offer is the live 10/20 ladder
(col_kit OFFER). Usage: python3.13 -I build_p1.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
exec(open(f'{_S}/ads/tools/build5_head.py').read()); exec(open(f'{_S}/ads/tools/hero_kit.py').read()); exec(open(f'{_S}/ads/tools/col_kit.py').read())
FPS, B = 24, 60 / 96
SFX = '' if DPR == 1 else '_4k'
CUT = [0, 4 * B, 11 * B, 17 * B]                         # 0, 2.5, 6.875, 10.625
DUR = CUT[-1]
shots = [
    shot('p1_macro' + SFX, CUT[0], CUT[1], off=.4),                                   # frame 1: the pastel stones up close
    shot('p1_rangoli' + SFX, CUT[1], CUT[2], off=.6),                                 # the rangoli draws itself, at its own speed
    shot('p1_rangoli' + SFX, CUT[2], DUR, off=5.0, speed=0, zoom=[1.0, 1.035]),        # the end card on the finished rangoli
]
INK = 'lt'; GLOW = 'text-shadow:0 0 22px rgba(251,243,236,.9), 0 0 6px rgba(251,243,236,.7)'
ov = []
# ---- frame 1, over the macro's clean top-left: the mark, the line, the price ----
ov.append(f'<div class="o" style="left:64px;top:288px;width:150px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>{logo(letters="#50726A")}</div>')
ov.append(line('The pastel tennis bracelet,', 'q', INK, 62, 64, 420, 0, CUT[1], align='l', now=True, extra=GLOW))
ov.append(f'<div class="o" style="left:64px;top:440px;display:flex;align-items:baseline;gap:20px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>'
          f'<span class="num7 lt" style="font-size:104px;{GLOW}">{RS(2399)}</span>'
          f'<span class="mrp7" style="font-size:30px;color:rgba(26,22,20,.55)">{RS(4200)}<span class="o strike" data-k=\'{K((0, {"w": 104}, "step"))}\'></span></span></div>')   # struck from frame 1: an unstruck MRP on the thumbnail reads as a second price
# ---- the rangoli ----
ov.append(line('Square cushion-cut CZ in pavé halos.', 'q', INK, 54, 0, 352, CUT[1] + .15, CUT[1] + 2.0, extra=GLOW))
ov.append(caps('PVD RHODIUM &nbsp;·&nbsp; WATERPROOF &nbsp;·&nbsp; TARNISH-FREE', INK, 0, 292, 22, CUT[1] + 2.1, CUT[2], track=.22, extra=f'width:1080px;text-align:center;{GLOW}'))
ov.append(dim_rule(262, 965, 838, 965, CUT[1] + 2.2, CUT[2], 'Fits wrists 15–19 cm', stroke='#50726A', width=2, cls='lt', size=34, gap=16))
# ---- the offer, quiet, from the bloom to the end card ----
ov.append(f'<div class="o" style="left:64px;top:1222px;z-index:15" data-k=\'{tk(1.0, CUT[2])}\'>'
          f'<div class="lab7 lt" style="font-size:22px;{GLOW}"><span style="color:#FFBDA8">●</span>&nbsp; {OFFER2} &nbsp;·&nbsp; {OFFER3}</div></div>')
# ---- the end card: an ivory veil from the top, the column above the bracelet, the ask inside its circle ----
t = CUT[2]; c6 = lambda t, dy=12: K((t - .002, {'o': 0, 'y': dy}, 'lin'), (t + .25, {'o': 1, 'y': 0}, 'out'))
ov.append(f'<div class="o" style="left:0;top:0;width:1080px;height:660px;z-index:5;background:linear-gradient(180deg, rgba(248,240,232,.97) 0%, rgba(248,240,232,.94) 72%, rgba(248,240,232,0) 100%)" data-k=\'{c6(t, 0)}\'></div>')
ov.append(f'<div class="o" style="left:390px;top:640px;width:300px;height:640px;z-index:5;border-radius:50%;background:radial-gradient(closest-side, rgba(248,240,232,.95) 62%, rgba(248,240,232,0) 100%);transform:scale(1.25)" data-k=\'{c6(t + .1, 0)}\'></div>')
ov.append(f'<div class="o" style="left:430px;top:282px;width:220px;z-index:6" data-k=\'{c6(t + .05)}\'>{logo(letters="#99B4AF")}</div>')
ov.append(line('Prism Rivière Bracelet', 'q', INK, 58, 0, 410, t + .15, FOREVER))
ov.append(f'<div class="o" style="left:0;top:430px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:22px;z-index:6" data-k=\'{c6(t + .3)}\'>'
          f'<span class="num7 lt" style="font-size:88px">{RS(2399)}</span>'
          f'<span class="mrp7" style="font-size:30px;color:rgba(26,22,20,.5)">{RS(4200)}<span class="o strike" data-k=\'{K((t + .55, {"w": 0}, "lin"), (t + .75, {"w": 104}, "out"))}\'></span></span></div>')
ov.append(f'<div class="o" style="left:0;top:836px;width:1080px;text-align:center;z-index:7" data-k=\'{c6(t + .6)}\'>'
          f'<div class="lab7 lt" style="font-size:22px;line-height:1.9">{OFFER2}<br>{OFFER3}</div></div>')
ov.append(f'<div class="o" style="left:0;top:952px;width:1080px;display:flex;justify-content:center;z-index:7" data-k=\'{c6(t + .9)}\'>'
          f'<div class="lab7" style="font-size:24px;color:#FBF3EC;background:#1A1614;padding:18px 34px 16px 40px;letter-spacing:.28em">SHOP NOW</div></div>')
ov.append(f'<div class="o" style="left:0;top:1046px;width:1080px;text-align:center;z-index:7" data-k=\'{c6(t + 1.05)}\'>'
          f'<div class="lab7 lt" style="font-size:18px;line-height:1.8">FREE SHIPPING<br>COD AVAILABLE</div></div>')
cue('air', CUT[1] - .25, t1=CUT[1] + 1.4, v=.4)                       # powder falling: a breath of air
cue('bloom', CUT[2] + .05, v=.35)
page7('p1v2' if DPR == 1 else 'p1v2_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[2] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .45, 'harp_v': .85,
                       'sections': [[0, CUT[2], 'groove'], [CUT[2], CUT[2] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[2], DUR - 2 * B], 'tail_silence': 3 / 24}})
