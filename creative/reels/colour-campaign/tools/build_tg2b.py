"""TOGGLE LINK CHAIN 2 v2: "three slats". Product only, no AI people (the owner: on-model shots read as AI). The same clasp
as the owner's photo.
- Frame 1: the piece seen through three slats on flat jade, all three at once: the paperclip links, the toggle bar on its
  jump ring, the ring clasp. Each is a still from the jade-plate clip's clean opening (clip 0.15 s, before any dust lands,
  1.3x at most), pushing or pulling slowly, alternately. One fact lands on each beat.
- The slats dissolve into the REAL cube photo, and the end card builds on it.
The review of the first cut: the bands were 2.3x crops of the dust-caked late frames (melted pave, pitted metal), the
hook and the dusted full frame were tg1b's footage, and the ad never paid off with the real piece. The plate is never
shown whole here; the dust stays in tg1b. Listing (live 5 Nov): 50 cm, 4 mm, gold toggle bar and ring clasp about 15 mm
"that sits at the front or the side as you prefer", PVD 18K gold coating; Rs 1,199 from 2,900.
Usage: python3.13 -I build_tg2b.py <S> [dpr]"""
import sys
_S = sys.argv[1]; DPR = int(sys.argv[2]) if len(sys.argv) > 2 else 1
for f in ('build5_head', 'hero_kit', 'col_kit', 'endcard7', 'redo_kit'): exec(open(f'{_S}/ads/tools/{f}.py').read())
FPS, B = 24, 60 / 96; X = '' if DPR == 1 else '_4k'
CUT = [0, 6 * B, 8 * B, 14 * B]                          # 0, 3.75, 5.0, 8.75
DUR = CUT[-1]
T1, T2, T3 = [64, 520, 952, 210], [64, 750, 952, 210], [64, 980, 952, 210]
def slat(px, py, rect, z0, z1):
    a = aim(px, py, rect, 1.3); a['zoom'] = [z0, z1]       # a 952-wide slat at 1.3 needs aim x within 415-665
    return shot('tg_plate', 0, CUT[1] + .4, off=.15, speed=0, **a)
shots = [slat(415, 620, T1, 1.30, 1.36), slat(495, 905, T2, 1.36, 1.30), slat(562, 1160, T3, 1.30, 1.36),
         shot('tg_real_cube' + X, CUT[1], DUR + .05, speed=0, fadeIn=.4, zoom=[1.0, 1.04], ax=.5, ay=0)]
JADE = dict(t0=0, t1=CUT[1] + .4, color='#14392D')
fact = lambda t0: K((t0 - .002, {'o': 0}, 'lin'), (t0 + .3, {'o': 1}, 'io'), (CUT[1] - .13, {'o': 1}, 'lin'), (CUT[1], {'o': 0}, 'in'))
ov = [f'<div class="o" style="left:465px;top:278px;width:150px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>{logo(letters="#99B4AF")}</div>',
      line('The details are the design.', 'q', 'iv sh', 56, 0, 392, 0, CUT[1], now=True),
      f'<div class="o" style="left:0;top:404px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:18px;z-index:16" data-k=\'{tk(0, CUT[1], now=True)}\'>'
      f'<span class="num7 iv sh" style="font-size:76px">{RS(1199)}</span>'
      f'<span class="mrp7" style="font-size:26px">{RS(2900)}<span class="o strike" data-k=\'{K((0, {"w": 92}, "step"))}\'></span></span></div>']
ov.append(quiet_offer(.6, CUT[1], y=1222, centre=True))
# one fact per beat, each on the plain-plate side of its slat
for (x, y), t0, lab in (((560, 615), B, '4 MM PAPERCLIP LINKS'), ((86, 905), 2 * B, 'THE TOGGLE BAR'), ((86, 1046), 3 * B, 'CLASP SITS<br>FRONT OR SIDE')):
    ov.append(f'<div class="o" style="left:{x}px;top:{y}px;z-index:16" data-k=\'{fact(t0)}\'>'
              f'<div class="lab7" style="font-size:{22 if y < 1000 else 19}px;color:#FBF3EC;letter-spacing:.25em;line-height:1.5;text-shadow:0 1px 10px rgba(6,23,15,.7)">{lab}</div></div>')
# ---- the real piece ----
ov.append(caps('PVD 18K GOLD COATING &nbsp;·&nbsp; 50 CM', 'lt', 0, 300, 22, CUT[1] + .45, CUT[2], track=.3, extra='width:1080px;text-align:center'))
ov += endcard(CUT[2], 'Toggle Link Chain', 1199, 2900, 'rgba(248,240,232,A)', ink=True, logo_letters='#50726A', chip_y=576)
cue('bloom', 0, v=.3); cue('bloom', B, v=.22); cue('bloom', 2 * B, v=.22); cue('bloom', 3 * B, v=.22)
cue('bloom', CUT[1], v=.3); cue('bloom', CUT[2] + .05, v=.3)
page7('tg2b' if DPR == 1 else 'tg2b_4k', DUR, shots, ov, fps=FPS, dpr=DPR, bg=[JADE],
      music={'bed_lufs': -16.0, 'duck_db': 0.0,
             'score': {'bpm': 96, 'anchor': 0, 'end': CUT[2] + 2 * B, 'hit0': True, 'harp_from': 0, 'strings_from': 0,
                       'snaps': False, 'shaker': .5, 'harp_v': .85,
                       'sections': [[0, CUT[2], 'groove'], [CUT[2], CUT[2] + 2 * B, 'soft']],
                       'end_downbeats': [CUT[2], DUR - 2 * B], 'tail_silence': 3 / 24}})
