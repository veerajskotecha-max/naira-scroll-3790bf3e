"""COLOUR CAMPAIGN, AD 3: Baguette Tennis Necklace - "one line of colour", practical (the owner: "make the next video a bit
practical, not full AI, but full crazy too").
- 0-3.1 s: the only AI shot, worn. A garnet world turns emerald as a cloud of green powder sweeps across the neck; it is
  pinned to stills built on the real ruby and emerald photos.
- 3.1-10.6 s: the REAL listing photos, three colourways of the same piece on the same cube, in turn. Each cut hides under
  the densest moment of a photoreal powder wave in the next colour. The plates are veo element plates shot alone on black
  and turned into RGBA by tools/plate.py, so no AI ever touches the real photos.
- End card: the three real colourways side by side.
Claims, all from the listing: baguette CZ set crosswise, held at the corners in gold claws, 6 mm wide, 36 cm choker, box
clasp, PVD 18K gold coating; Rs 2,099 (MRP 3,500); three colours of CZ (crystal, emerald-green, ruby-red; never "emerald"
or "ruby" stones). Usage: python3.13 -I build_p3.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96
X = '' if DPR == 1 else '_4k'
CUT = [0, 5 * B, 9 * B, 13 * B, 17 * B, 23 * B]          # 0, 3.125, 5.625, 8.125, 10.625, 14.375
DUR = CUT[-1]
def wave(plate, cut, lead=1.0, dense=4.0, tail=.45):
    """a powder wave in the next colour: in `lead` s before the cut, at its densest on the cut, gone `tail` s after"""
    return shot(plate, cut - lead, cut + tail, off=dense - lead, fadeOut=tail * .9)
shots = [
    shot('p3_r2e' + X, CUT[0], CUT[1], off=.6),                                          # worn: the garnet world turns emerald
    shot('p3_real_crystal' + X, CUT[1], CUT[2], speed=0, zoom=[1.0, 1.04], ay=.4),
    shot('p3_real_emerald' + X, CUT[2], CUT[3], speed=0, zoom=[1.04, 1.08], ay=.4),
    shot('p3_real_ruby' + X, CUT[3], CUT[4], speed=0, zoom=[1.08, 1.12], ay=.4),
    wave('pl_green', CUT[2]), wave('pl_red', CUT[3]), wave('pl_ivory', CUT[4], dense=3.4),
    # the end card: the three real colourways side by side
    shot('p3_real_crystal' + X, CUT[4], DUR, speed=0, rect=[54, 640, 300, 533], zoom=[1.18, 1.2], ay=.45),
    shot('p3_real_emerald' + X, CUT[4], DUR, speed=0, rect=[390, 640, 300, 533], zoom=[1.18, 1.2], ay=.45),
    shot('p3_real_ruby' + X, CUT[4], DUR, speed=0, rect=[726, 640, 300, 533], zoom=[1.18, 1.2], ay=.45),
]
# the plates draw over the photos: put them after the photo shots in time order (the engine draws shots in list order)
shots = shots[:4] + shots[4:7] + shots[7:]
IV = 'iv sh'; INK = 'lt'; GLOW = 'text-shadow:0 0 20px rgba(251,243,236,.9)'
ov = []
# ---- frame 1, in the backdrop beside her neck: the mark, the line, the price ----
ov.append(f'<div class="o" style="left:64px;top:288px;width:150px;z-index:16;filter:drop-shadow(0 2px 8px rgba(0,0,0,.6))" data-k=\'{tk(0, CUT[1], now=True)}\'>{logo(letters="#99B4AF")}</div>')
ov.append(line('One line', 'q', IV, 66, 64, 420, 0, CUT[1], align='l', now=True))
ov.append(line('of colour.', 'q', IV, 66, 64, 492, 0, CUT[1], align='l', now=True))
ov.append(f'<div class="o" style="left:64px;top:512px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>'
          f'<div class="num7 iv sh" style="font-size:84px">{RS(2099)}</div>'
          f'<div class="mrp7" style="font-size:26px;margin-top:6px">{RS(3500)}<span class="o strike" data-k=\'{K((0, {"w": 92}, "step"))}\'></span></div></div>')
# ---- the real photos ----
ov.append(caps('THE REAL PIECE &nbsp;·&nbsp; THREE COLOURS', INK, 0, 292, 22, CUT[1] + .1, CUT[4] - .2, track=.26, extra=f'width:1080px;text-align:center;color:#50726A;{GLOW}'))
for name, a_, b_ in (('Crystal.', CUT[1] + .15, CUT[2] - 1.0), ('Emerald green.', CUT[2] + .45, CUT[3] - 1.0), ('Ruby red.', CUT[3] + .45, CUT[4] - 1.0)):
    ov.append(line(name, 'q', INK, 72, 0, 404, a_, b_, extra=GLOW))
ov.append(caps('BAGUETTE CZ SET CROSSWISE &nbsp;·&nbsp; GOLD CLAWS', INK, 0, 436, 20, CUT[1] + .3, CUT[2] - 1.0, track=.2, extra=f'width:1080px;text-align:center;{GLOW}'))
ov.append(caps('6 MM WIDE &nbsp;·&nbsp; 36 CM CHOKER', INK, 0, 436, 20, CUT[2] + .5, CUT[3] - 1.0, track=.2, extra=f'width:1080px;text-align:center;{GLOW}'))
ov.append(caps('PVD 18K GOLD COATING', INK, 0, 436, 20, CUT[3] + .5, CUT[4] - 1.0, track=.2, extra=f'width:1080px;text-align:center;{GLOW}'))
ov.append(quiet_offer(1.0, CUT[1]))                                      # over her shoulders: ivory
ov.append(f'<div class="o ta-r" style="left:{900 - 1080}px;top:1166px;width:1080px;z-index:15" data-k=\'{tk(CUT[1] + .2, CUT[4] - .2)}\'>'   # on the cube, right of the falling strand: ink
          f'<div class="lab7 lt" style="font-size:22px;line-height:1.9;margin-right:-.22em;{GLOW}">{OFFER2}<br>{OFFER3}</div></div>')
# ---- the end card: the column, the three colourways named, the ask ----
t = CUT[4] + .25; c6 = lambda t, dy=12: K((t - .002, {'o': 0, 'y': dy}, 'lin'), (t + .25, {'o': 1, 'y': 0}, 'out'))
ov.append(f'<div class="o" style="left:430px;top:282px;width:220px;z-index:6" data-k=\'{c6(t + .05)}\'>{logo(letters="#50726A")}</div>')
ov.append(line('Baguette Tennis Necklace', 'q', INK, 56, 0, 408, t + .15, FOREVER))
ov.append(f'<div class="o" style="left:0;top:424px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:22px;z-index:6" data-k=\'{c6(t + .3)}\'>'
          f'<span class="num7 lt" style="font-size:84px">{RS(2099)}</span>'
          f'<span class="mrp7" style="font-size:28px;color:rgba(26,22,20,.5)">{RS(3500)}<span class="o strike" data-k=\'{K((t + .5, {"w": 0}, "lin"), (t + .7, {"w": 98}, "out"))}\'></span></span></div>')
ov.append(f'<div class="o" style="left:0;top:540px;width:1080px;text-align:center;z-index:6" data-k=\'{c6(t + .45)}\'>'
          f'<div class="lab7 lt" style="font-size:20px">{OFFER2} &nbsp;·&nbsp; {OFFER3} &nbsp;·&nbsp; FREE SHIPPING &nbsp;·&nbsp; COD</div></div>')
for i, nm in enumerate(('CRYSTAL', 'EMERALD GREEN', 'RUBY RED')):
    ov.append(f'<div class="o" style="left:{54 + 336 * i}px;top:1186px;width:300px;text-align:center;z-index:6" data-k=\'{c6(t + .6 + .1 * i)}\'>'
              f'<div class="lab7 lt" style="font-size:18px">{nm}</div></div>')
ov.append(f'<div class="o" style="left:0;top:574px;width:1080px;display:flex;justify-content:center;z-index:7" data-k=\'{c6(t + .9)}\'>'
          f'<div class="lab7" style="font-size:20px;color:#FBF3EC;background:#1A1614;padding:12px 26px 10px 32px;letter-spacing:.28em">SHOP NOW</div></div>')
BG = dict(t0=CUT[4], t1=DUR, grad=[[0, '#F6EDE3'], [1, '#EADCCD']])
cue('air', CUT[2] - 1.0, t1=CUT[2] + .3, v=.45)
cue('air', CUT[3] - 1.0, t1=CUT[3] + .3, v=.45)
cue('air', CUT[4] - 1.0, t1=CUT[4] + .3, v=.4)
cue('bloom', CUT[4] + .3, v=.3)
page7('p3' if DPR == 1 else 'p3_4k', DUR, shots, ov, fps=FPS, dpr=DPR, bg=[BG],
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[4] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .5, 'harp_v': .85,
                       'sections': [[0, CUT[4], 'groove'], [CUT[4], CUT[4] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[4], DUR - 2 * B], 'tail_silence': 3 / 24}})
