"""AD 3 v2, Baguette Tennis Necklace: "colour swap". All REAL listing photos, nothing generated. The same necklace on the
same cube in three colourways; the three photos are pixel-registered, so the colour FLOWS along the strand from the clasp
(swap_frames.py), round the loop and down the tail, and nothing else in the frame moves. Ruby (the hook and the price) ->
emerald -> crystal -> the three side by side. The review of the first cut: powder waves on cream looked composited and hid
the piece for 4.35 of 7.5 s, so they are gone. Live 5 Nov: all three colourways in stock (20/29/20), each Rs 2,099 from
3,500. Usage: python3.13 -I build_p3b.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7', 'redo_kit'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 4 * B, 8 * B, 12 * B, 18 * B]                  # 0, 2.5, 5.0, 7.5, 11.25
DUR = CUT[-1]; SW = 1.0                                   # each swap: 24 frames, from the downbeat
Z = lambda t: round(1 + .06 * t / CUT[3], 5)              # one slow push across all three, so the swaps stay registered
P = lambda id_, a, b, **k: shot(id_ + X, a, b, zoom=[Z(a), Z(b)], ay=.4, **k)
shots = [P('p3_real_ruby', CUT[0], CUT[1], speed=0),
         P('p3_swap_r2e', CUT[1], CUT[1] + SW),
         P('p3_real_emerald', CUT[1] + SW, CUT[2], speed=0),
         P('p3_swap_e2c', CUT[2], CUT[2] + SW),
         # the card: ruby, emerald, crystal, the order the viewer just saw; the crystal frame dissolves off on top of it
         shot('p3_real_ruby' + X, CUT[3], DUR + .05, speed=0, rect=[54, 672, 300, 533], zoom=[1.18, 1.2], ay=.45),
         shot('p3_real_emerald' + X, CUT[3], DUR + .05, speed=0, rect=[390, 672, 300, 533], zoom=[1.18, 1.2], ay=.45),
         shot('p3_real_crystal' + X, CUT[3], DUR + .05, speed=0, rect=[726, 672, 300, 533], zoom=[1.18, 1.2], ay=.45),
         P('p3_real_crystal', CUT[2] + SW, CUT[3] + .3, speed=0, fadeOut=.3)]
INK = 'lt'; GLOW = 'text-shadow:0 0 20px rgba(251,243,236,.9)'
ov = []
# ---- frame 1, on the real ruby necklace: the mark, the line, the price, the colour (the loop's top is at y 504) ----
ov.append(f'<div class="o" style="left:465px;top:272px;width:150px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>{logo(letters="#50726A")}</div>')
ov.append(line('One line of colour.', 'q', INK, 60, 0, 376, 0, CUT[1], now=True, extra=GLOW))
ov.append(f'<div class="o" style="left:0;top:388px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:18px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>'
          f'<span class="num7 lt" style="font-size:72px;{GLOW}">{RS(2099)}</span>'
          f'<span class="mrp7" style="font-size:26px;color:rgba(26,22,20,.55)">{RS(3500)}<span class="o strike" data-k=\'{K((0, {"w": 92}, "step"))}\'></span></span></div>')
ov.append(caps('RUBY-RED CZ', INK, 0, 468, 18, .3, CUT[1], track=.3, extra=f'width:1080px;text-align:center;{GLOW}'))
# ---- each colour as it arrives: the old name clears on the downbeat, the colour flows, the new name lands as the stones turn ----
for name, sub, a_, b_ in (('Emerald green.', 'EMERALD-GREEN CZ &nbsp;·&nbsp; 6 MM &nbsp;·&nbsp; 36 CM CHOKER', CUT[1] + .3, CUT[2]),
                          ('Crystal.', 'BAGUETTE CZ, GOLD CLAWS &nbsp;·&nbsp; PVD 18K GOLD COATING', CUT[2] + .3, CUT[3] - .1)):
    ov.append(caps(f'THREE COLOURS &nbsp;·&nbsp; {RS(2099)} EACH', INK, 0, 292, 20, a_, b_, track=.3, extra=f'width:1080px;text-align:center;color:#50726A;{GLOW}'))
    ov.append(line(name, 'q', INK, 72, 0, 404, a_, b_, extra=GLOW))
    ov.append(caps(sub, INK, 0, 436, 18, a_ + .15, b_, track=.22, extra=f'width:1080px;text-align:center;{GLOW}'))
# the offer: one slot, right edge at x 900, held still through both swaps
ov.append(f'<div class="o ta-r" style="left:{900 - 1080}px;top:1166px;width:1080px;z-index:15" data-k=\'{tk(.6, CUT[3] - .1)}\'>'
          f'<div class="lab7 lt" style="font-size:22px;line-height:1.9;margin-right:-.22em;{GLOW}">{OFFER2}<br>{OFFER3}</div></div>')
# ---- the end card: the column, the ask, the three named inside their tiles ----
t = CUT[3] + .25; c6 = lambda t, dy=12: K((t - .002, {'o': 0, 'y': dy}, 'lin'), (t + .25, {'o': 1, 'y': 0}, 'out'))
ov.append(f'<div class="o" style="left:430px;top:282px;width:220px;z-index:6" data-k=\'{c6(t + .05)}\'>{logo(letters="#50726A")}</div>')
ov.append(line('Baguette Tennis Necklace', 'q', INK, 56, 0, 408, t + .15, FOREVER))
ov.append(f'<div class="o" style="left:0;top:424px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:22px;z-index:6" data-k=\'{c6(t + .3)}\'>'
          f'<span class="num7 lt" style="font-size:84px">{RS(2099)}</span>'
          f'<span class="mrp7" style="font-size:28px;color:rgba(26,22,20,.5)">{RS(3500)}<span class="o strike" data-k=\'{K((t + .5, {"w": 0}, "lin"), (t + .7, {"w": 98}, "out"))}\'></span></span></div>')
ov.append(f'<div class="o" style="left:0;top:540px;width:1080px;text-align:center;z-index:6" data-k=\'{c6(t + .45)}\'>'
          f'<div class="lab7 lt" style="font-size:20px">{OFFER2} &nbsp;·&nbsp; {OFFER3} &nbsp;·&nbsp; FREE SHIPPING &nbsp;·&nbsp; COD</div></div>')
ov.append(f'<div class="o" style="left:0;top:574px;width:1080px;display:flex;justify-content:center;z-index:7" data-k=\'{c6(t + .9)}\'>'
          f'<div class="lab7" style="font-size:20px;color:#FBF3EC;background:#1A1614;padding:12px 26px 10px 32px;letter-spacing:.28em">SHOP NOW</div></div>')
for i, nm in enumerate(('RUBY RED', 'EMERALD GREEN', 'CRYSTAL')):
    ov.append(f'<div class="o" style="left:{54 + 336 * i}px;top:692px;width:300px;text-align:center;z-index:6" data-k=\'{c6(t + .6 + .1 * i)}\'>'
              f'<div class="lab7 lt" style="font-size:17px">{nm}</div></div>')
BG = dict(t0=CUT[3], t1=DUR + .05, grad=[[0, '#F6EDE3'], [1, '#EADCCD']])
cue('bloom', CUT[1] + .05, v=.18); cue('bloom', CUT[2] + .05, v=.18); cue('bloom', CUT[3] + .3, v=.3)
page7('p3b' if DPR == 1 else 'p3b_4k', DUR, shots, ov, fps=FPS, dpr=DPR, bg=[BG],
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[3] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .5, 'harp_v': .85,
                       'sections': [[0, CUT[3], 'groove'], [CUT[3], CUT[3] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[3], DUR - 2 * B], 'tail_silence': 3 / 24}})
