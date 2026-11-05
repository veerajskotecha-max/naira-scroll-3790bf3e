"""TOGGLE LINK CHAIN 1 v2: "the blueprint". Product only, no AI people (the owner: on-model shots read as AI). The clasp
is the owner's photo: a round spring-gate ring about 15 mm with a small pave bar, on 4 mm paperclip links (listing: 50 cm).
- Frame 1 is the REAL cube photo on drafting paper: the only ad in the set that opens on a real photo. The parts are
  drawn, not labelled: a compass circle round the ring clasp, a detail circle on one link, then a title block. Deep sage
  lines, no dots (p2b keeps the dot-and-hairline callouts).
- Then the one colour beat: gold dust rings the clasp on a jade plate (the owner's accurate AI plate), slowed with
  blended frames, stopping before the heavy pour; the end card holds on that frame, polished metal and white stones.
The review of the first cut: an ivory powder burst read as the most AI moment in the batch, the hook was tg2b's opening,
and "Every part, in gold." read as a gold-content claim. Usage: python3.13 -I build_tg1b.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7', 'redo_kit'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 8 * B, 11 * B, 17 * B]                         # 0, 5.0, 6.875, 10.625
DUR = CUT[-1]; PL = .6                                   # the plate at 0.6x: clip 0 -> 1.125 s, the dust ring formed, no pour yet
shots = [shot('tg_real_cube' + X, CUT[0], CUT[1], speed=0, zoom=[1.15, 1.15], ax=.45, ay=.8),   # still: the drawing is pinned to it
         shot('tg_plate', CUT[1], CUT[2], off=0, speed=PL, mix=True, zoom=[1.0, 1.08], ax=.54, ay=.55),
         shot('tg_plate', CUT[2], DUR + .05, off=(CUT[2] - CUT[1]) * PL, speed=0, zoom=[1.08, 1.12], ax=.54, ay=.55)]
INK, GLOW, SAGE = 'lt', 'text-shadow:0 0 16px rgba(251,243,236,.95)', '#50726A'
END = CUT[1] - .1
ov = []
# ---- drafting paper from frame 1: a fine grid, every fifth line stronger ----
ov.append(f'<div class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:3;background-image:'
          f'linear-gradient(rgba(80,114,106,.24) 1px, transparent 1px), linear-gradient(90deg, rgba(80,114,106,.24) 1px, transparent 1px),'
          f'linear-gradient(rgba(80,114,106,.14) 1px, transparent 1px), linear-gradient(90deg, rgba(80,114,106,.14) 1px, transparent 1px);'
          f'background-size:270px 270px, 270px 270px, 54px 54px, 54px 54px" data-k=\'{tk(0, CUT[1], now=True)}\'></div>')
# ---- the hook, ink on cream (the chain's highest point is about y 535) ----
ov.append(f'<div class="o" style="left:465px;top:278px;width:150px;z-index:16" data-k=\'{tk(0, END, now=True)}\'>{logo(letters=SAGE)}</div>')
ov.append(line('Every millimetre, considered.', 'q', INK, 56, 0, 384, 0, END, now=True, extra=GLOW))
ov.append(f'<div class="o" style="left:0;top:394px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:18px;z-index:16" data-k=\'{tk(0, END, now=True)}\'>'
          f'<span class="num7 lt" style="font-size:72px;{GLOW}">{RS(1199)}</span>'
          f'<span class="mrp7" style="font-size:26px;color:rgba(26,22,20,.55)">{RS(2900)}<span class="o strike" data-k=\'{K((0, {"w": 92}, "step"))}\'></span></span></div>')
ov.append(f'<div class="o" style="left:0;top:486px;width:1080px;text-align:center;z-index:16" data-k=\'{tk(.8, END)}\'>'
          f'<div class="lab7 lt" style="font-size:20px;{GLOW}">{OFFER2} &nbsp;·&nbsp; {OFFER3}</div></div>')
# ---- (a) the ring clasp: a compass circle and its centre, measured on the photo at (374, 1224), outer radius 64 ----
cx_, cy_ = 374, 1224
ov.append(draw(circle(cx_, cy_, 86), .3, END, stroke=SAGE, width=1.8, d=.7))
ov.append(draw(f'M{cx_ - 12} {cy_}L{cx_ + 12} {cy_}M{cx_} {cy_ - 12}L{cx_} {cy_ + 12}', .95, END, stroke=SAGE, width=1.5, d=.15))
ov.append(f'<div class="o ta-r" style="left:{270 - 1080}px;top:1150px;width:1080px;z-index:18" data-k=\'{tk(1.05, END)}\'>'
          f'<div class="lab7 lt" style="font-size:19px;margin-right:-.22em;{GLOW}">RING CLASP</div>'
          f'<div class="num7 lt" style="font-size:46px;margin-top:8px;{GLOW}">Ø 15 mm</div></div>')
# ---- (b) one link: a dashed detail circle and a leader to its width ----
lx, ly = 497, 908
ov.append(draw(circle(lx, ly, 52), 1.9, END, stroke=SAGE, width=1.6, d=.5, dash='7 5'))
ov.append(draw(f'M{lx + 52} {ly}L{596} {ly}', 2.35, END, stroke=SAGE, width=1.5, d=.2))
ov.append(f'<div class="o" style="left:608px;top:{ly - 44}px;z-index:18" data-k=\'{tk(2.45, END)}\'>'
          f'<div class="num7 lt" style="font-size:42px;{GLOW}">4 mm</div>'
          f'<div class="lab7 lt" style="font-size:19px;margin-top:8px;{GLOW}">PAPERCLIP LINKS</div></div>')
# ---- (c) the title block, bottom right on the cube face: two cells ----
TX0, TX1, TY0, TY1, TM = 480, 894, 1190, 1246, 580       # right edge inside x 900; left edge clear of the compass (460)
ov.append(draw(f'M{TX0} {TY0}L{TX1} {TY0}L{TX1} {TY1}L{TX0} {TY1}ZM{TM} {TY0}L{TM} {TY1}', 3.1, END, stroke=SAGE, width=1.5, d=.45))
ov.append(f'<div class="o" style="left:{TX0}px;top:{TY0 + 18}px;width:{TM - TX0}px;text-align:center;z-index:18" data-k=\'{tk(3.4, END)}\'>'
          f'<div class="lab7 lt" style="font-size:17px;margin-right:-.22em">50 CM</div></div>')
ov.append(f'<div class="o" style="left:{TM}px;top:{TY0 + 18}px;width:{TX1 - TM}px;text-align:center;z-index:18" data-k=\'{tk(3.55, END)}\'>'
          f'<div class="lab7 lt" style="font-size:17px;margin-right:-.22em">PVD 18K GOLD COATING</div></div>')
# ---- the plate: the one colour beat, the type on a veil so it never fights the links ----
ov.append(f'<div class="o" style="left:0;top:0;width:1080px;height:640px;z-index:14;background:linear-gradient(180deg, rgba(14,44,34,.5) 0%, '
          f'rgba(14,44,34,0) 100%)" data-k=\'{tk(CUT[1], CUT[2] + .3)}\'></div>')
ov.append(line('The clasp is the jewel.', 'q', 'iv sh', 62, 0, 392, CUT[1] + .1, CUT[2]))
ov.append(quiet_offer(CUT[1] + .25, CUT[2], y=428, centre=True))
ov += endcard(CUT[2], 'Toggle Link Chain', 1199, 2900, 'rgba(14,44,34,A)')
cue('bloom', .3, v=.25); cue('bloom', CUT[1] + .05, v=.3); cue('bloom', CUT[2] + .05, v=.3)
page7('tg1b' if DPR == 1 else 'tg1b_4k', DUR, shots, ov, fps=FPS, dpr=DPR,
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[2] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': CUT[1],
                       'snaps': False, 'shaker': .45, 'harp_v': .85,
                       'sections': [[0, CUT[1], 'light'], [CUT[1], CUT[2], 'groove'], [CUT[2], CUT[2] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[2], DUR - 2 * B], 'tail_silence': 3 / 24}})
