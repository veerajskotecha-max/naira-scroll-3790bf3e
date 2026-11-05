"""The colour campaign's kit, exec'd after build5_head.py and hero_kit.py (line, caps, credit, tk, logo, K, el, centred...).
Studio films: AI clips on black or in a colour world, brand type over them. page7 renders on engine v4 at the clip's own
frame rate (24 fps for the AI studio clips, so nothing judders) and at DPR 2 for native 4K."""
import json, os
# THE OFFER: one slot for the whole campaign. Live BUY2/BUY3 in Shopify, re-checked 4 Nov 22:40 (the owner set it back
# from 20/30 on 3-4 Nov). Re-check on launch morning; change it here and every ad follows.
OFFER2, OFFER3, OFFER_NOTE = 'ANY 2 · 10% OFF', 'ANY 3 · 20% OFF', 'APPLIED IN THE BAG · NO CODE'
# Colour grades the canvas applies per shot (shot grade='url(#g_neutral)'). g_neutral takes the AI film's warm cast off
# white metal (highlights R-B about +18 -> about 0) without touching the blacks.
GRADES = {'g_neutral': '0.96 0 0 0 0  0 1 0 0 0  0 0 1.05 0 0  0 0 0 1 0',
          'g_neutral_lift': '1.06 0 0 0 0.01  0 1.1 0 0 0.01  0 0 1.16 0 0.01  0 0 0 1 0'}

def page7(name, dur, shots, overlays, fps=24, dpr=1, voice=None, vo=None, music=None, bg=(), dim=(), flash=(), css=(), fx=(), leaks=(), grades=None, fblur=()):
    ids = sorted({s['id'] for s in shots})
    meta = {d: {k: v for k, v in json.load(open(f'{A}/frames/{d}/meta.json')).items() if k in ('fps', 'n', 'sq', 'ext')} for d in ids}
    for s in shots:
        m = meta[s['id']]; last = (s['t1'] - s['t0']) * s.get('speed', 1) + s.get('off', 0)
        assert s.get('hold') or last <= m['n'] / m['fps'] + 1e-3, (s, m)
    data = {'fps': fps, 'dpr': dpr, 'dur': dur, 'frames': '../frames', 'meta': meta, 'shots': shots, 'bg': list(bg), 'flash': list(flash),
            'dim': list(dim), 'fblur': [list(f) for f in fblur], 'leaks': list(leaks), 'fx': list(fx), 'iris': IRIS, 'flower': FLOWER}
    links = ''.join(f'<link rel="stylesheet" href="../engine/{c}">' for c in ('base5.css', 'base6.css', 'base7.css') + tuple(css))
    html = f'''<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face {{ font-family:CG; src:url('{S}/fonts/CG.ttf'); font-weight:300 700; }}
@font-face {{ font-family:CG; font-style:italic; src:url('{S}/fonts/CG-Italic.ttf'); font-weight:300 700; }}
@font-face {{ font-family:Jost; src:url('{S}/fonts/Jost.ttf'); font-weight:100 900; }}
</style>
{links}</head><body>
<svg width="0" height="0" style="position:absolute">{''.join(f'<filter id="{k}" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="{v}"/></filter>' for k, v in {**GRADES, **(grades or {})}.items())}</svg>
<canvas id="v" width="1080" height="1920"></canvas>
{''.join(overlays)}
<script>window.AD = {json.dumps(data, ensure_ascii=False)};</script>
<script src="../engine/fx7.js"></script>
<script src="../engine/engine4.js"></script>
</body></html>'''
    os.makedirs(f'{A}/{name}', exist_ok=True)
    open(f'{A}/{name}/index.html', 'w').write(html)
    json.dump({'dur': dur, 'voice': voice, 'vo': vo or [], 'music': music, 'sfx': sorted(CUES, key=lambda c: c['t'])},
              open(f'{A}/{name}/audio.json', 'w'), indent=1, ensure_ascii=False)
    print(name, dur, 's at', fps, 'fps, dpr', dpr, len(shots), 'shots', len(overlays), 'overlays', len(CUES), 'cues')

def draw(path_d, t0, t1, stroke='#FBF3EC', width=2.5, d=.6, z=17, dash=None, opacity=1):
    """a hairline drawn on, held, then faded: measurement lines and outlines"""
    k = K((t0 - .002, {'o': 0, 'd': 0}, 'lin'), (t0, {'o': opacity}, 'step'), (t0 + d, {'d': 1}, 'io'), (t1 - .2, {'o': opacity}, 'lin'), (t1, {'o': 0}, 'in'))
    da = f'stroke-dasharray:{dash};' if dash else ''
    return (f'<div class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:{z}" data-k=\'{k}\'>'
            f'<svg class="ldr" width="1080" height="1920"><path class="draw" d="{path_d}" style="stroke:{stroke};stroke-width:{width};fill:none;{da}"/></svg></div>')

def dot(x, y, t0, t1, r=6, fill='#FBF3EC', z=18):
    k = K((t0 - .002, {'o': 0, 's': .2}, 'lin'), (t0 + .25, {'o': 1, 's': 1}, 'back'), (t1 - .2, {'o': 1}, 'lin'), (t1, {'o': 0}, 'in'))
    return (f'<div class="o" style="left:{x - r}px;top:{y - r}px;width:{2 * r}px;height:{2 * r}px;background:{fill};border-radius:50%;'
            f'box-shadow:0 0 0 2px rgba(26,22,20,.75), 0 0 10px rgba(0,0,0,.6);z-index:{z}" data-k=\'{k}\'></div>')

def rrect(x0, y0, x1, y1, r):
    """a cushion: a rounded square path"""
    return (f'M{x0 + r:.0f} {y0:.0f}L{x1 - r:.0f} {y0:.0f}Q{x1:.0f} {y0:.0f} {x1:.0f} {y0 + r:.0f}L{x1:.0f} {y1 - r:.0f}Q{x1:.0f} {y1:.0f} {x1 - r:.0f} {y1:.0f}'
            f'L{x0 + r:.0f} {y1:.0f}Q{x0:.0f} {y1:.0f} {x0:.0f} {y1 - r:.0f}L{x0:.0f} {y0 + r:.0f}Q{x0:.0f} {y0:.0f} {x0 + r:.0f} {y0:.0f}Z')

def circle(cx_, cy_, r):
    return f'M{cx_ - r:.0f} {cy_:.0f}A{r:.0f} {r:.0f} 0 1 1 {cx_ + r:.0f} {cy_:.0f}A{r:.0f} {r:.0f} 0 1 1 {cx_ - r:.0f} {cy_:.0f}'

def dim_rule(x0, y0, x1, y1, t0, t1, label, sub='', side='above', stroke='#FBF3EC', width=2, z=17, cls='iv sh', size=56, gap=22):
    """a jeweller's dimension rule at radius 0: a hairline with square end ticks, drawn on, labelled at its centre"""
    import math
    L = math.hypot(x1 - x0, y1 - y0); nx, ny = -(y1 - y0) / L * 12, (x1 - x0) / L * 12
    d = (f'M{x0 + nx:.0f} {y0 + ny:.0f}L{x0 - nx:.0f} {y0 - ny:.0f}M{x0:.0f} {y0:.0f}L{x1:.0f} {y1:.0f}'
         f'M{x1 + nx:.0f} {y1 + ny:.0f}L{x1 - nx:.0f} {y1 - ny:.0f}')
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2
    top = my - gap - size if side == 'above' else my + gap
    lab = (f'<div class="o" style="left:{mx - 300:.0f}px;top:{top:.0f}px;width:600px;text-align:center;z-index:{z + 1}" data-k=\'{tk(t0 + .35, t1)}\'>'
           f'<div class="num7 {cls}" style="font-size:{size}px">{label}</div>'
           + (f'<div class="lab7 iv" style="font-size:18px;margin-top:10px">{sub}</div>' if sub else '') + '</div>')
    return draw(d, t0, t1, stroke=stroke, width=width, d=.45, z=z) + lab
