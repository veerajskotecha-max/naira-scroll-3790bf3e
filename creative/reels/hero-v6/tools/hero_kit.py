"""v6, the hero film's kit. exec'd after build5_head.py (its helpers: K, el, centred, fadek, shot, logo, cue, IRIS, P...).
The type grammar: real women's words in Cormorant italic (.q), the film's own voice upright (.b), credits on ONE line
(name in Jost caps, price in Cormorant). Ink on pale grounds, ivory with a soft shadow on dark ones, never a scrim.
At most one text element and one product graphic on screen at a time. No MRP strikes: the only strike is the bag's
subtotal. Everything sits between y 290 and 1245."""
HERO = {
    'cushion': dict(nm='CUSHION HALO RING', pr=1099),
    'hoops': dict(nm='WOVEN GOLD HOOPS', pr=1199, img='hoops'),
    'huggies': dict(nm='BRUSHED GOLD HUGGIES', pr=799, img='huggies'),
    'chain': dict(nm='TOGGLE LINK CHAIN', pr=1199, img='chain'),
    'bracelet': dict(nm='PRISM RIVIÈRE BRACELET', pr=2399),
    'halo': dict(nm='HALO CURVE RING', pr=1199),
}
TWO = HERO['huggies']['pr'] + HERO['chain']['pr']; THREE = TWO + HERO['hoops']['pr']
TWO20, THREE30 = round(TWO * .8), round(THREE * .7)
assert (TWO, TWO20, THREE, THREE30, THREE - THREE30) == (1998, 1598, 3197, 2238, 959)   # BUY2 20%, BUY3 30% (origin/main promo.ts)
assert THREE30 * 1.05 < 2500                                          # "still under 2,500" holds with the 5% COD fee too

def tk(t0, t1, d=.2, d_out=.13, dy=12, now=False):
    """text in: a 6-frame fade and a 12 px rise; out: 4 frames. now=True is on screen from its first frame (frame 1)"""
    if now: return K((t0 - .002, {'o': 0, 'y': 0}, 'lin'), (t0, {'o': 1}, 'step'), (t1 - d_out, {'o': 1}, 'lin'), (t1, {'o': 0}, 'in'))   # hidden until t0, then on, no fade
    return K((t0 - .002, {'o': 0, 'y': dy}, 'lin'), (t0 + d, {'o': 1, 'y': 0}, 'out'), (t1 - d_out, {'o': 1}, 'lin'), (t1, {'o': 0}, 'in'))

def line(html, voice, tone, size, x, base, t0, t1, align='c', z=16, now=False, extra=''):
    """one line of type with its baseline at `base`. voice: 'q' (a woman's words, italic) or 'b' (the film, upright)"""
    top = base - .80 * size
    cls = f'{voice} {tone}'
    inner = f'<div class="{cls}" style="font-size:{size}px;{extra}">{html}</div>'
    k = tk(t0, t1, now=now)
    if align == 'c': return f'<div class="o ta-c" style="left:0;top:{top:.0f}px;width:1080px;z-index:{z}" data-k=\'{k}\'>{inner}</div>'
    if align == 'r': return f'<div class="o ta-r" style="left:{x - 1080:.0f}px;top:{top:.0f}px;width:1080px;z-index:{z}" data-k=\'{k}\'>{inner}</div>'
    return f'<div class="o" style="left:{x:.0f}px;top:{top:.0f}px;z-index:{z}" data-k=\'{k}\'>{inner}</div>'

def credit(piece, tone, x, base, t0, t1, align='c', z=15):
    p = HERO[piece]
    inner = f'<div class="cred {tone}"><span class="n">{p["nm"]}</span><span class="p">{RS(p["pr"])}</span></div>'
    top = base - 30; k = tk(t0, t1)
    if align == 'c': return f'<div class="o" style="left:0;top:{top:.0f}px;width:1080px;display:flex;justify-content:center;z-index:{z}" data-k=\'{k}\'>{inner}</div>'
    if align == 'r': return f'<div class="o" style="left:{x - 1080:.0f}px;top:{top:.0f}px;width:1080px;display:flex;justify-content:flex-end;z-index:{z}" data-k=\'{k}\'>{inner}</div>'
    return f'<div class="o" style="left:{x:.0f}px;top:{top:.0f}px;z-index:{z}" data-k=\'{k}\'>{inner}</div>'

def iris_into(eid, t0, ox, oy, inner, tp=.12, th=.2, tz=.46, z=40):
    """the flower opens from a point on the picture (here: where the piece is) and dives through to the ivory page"""
    IRIS.append({'el': eid, 't0': t0, 's0': 430, 's1': 560, 's2': 21000, 'tp': tp, 'th': th, 'tz': tz,
                 'cx': .5102, 'cy': .1638, 'ox': ox, 'oy': oy, 'r0': -14, 'rim': 14})
    cue('bloom', t0, v=.6); cue('dive', t0 + th, t1=t0 + tz, v=.6)
    k = K((t0 - .002, {'o': 0}, 'lin'), (t0, {'o': 1}, 'step'))
    return f'<div id="{eid}" class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:{z}" data-k=\'{k}\'><div class="hpage"></div>{inner}</div>'

def page6(name, dur, shots, overlays, voice=None, vo=None, music=None, dim=(), flash=(), bg=()):
    ids = sorted({s['id'] for s in shots})
    meta = {d: {k: v for k, v in json.load(open(f'{A}/frames/{d}/meta.json')).items() if k in ('fps', 'n', 'sq')} for d in ids}
    for s in shots:                                                     # every shot must stay inside its frames
        m = meta[s['id']]; last = (s['t1'] - s['t0']) * s.get('speed', 1) + s.get('off', 0)
        assert s.get('hold') or last <= m['n'] / m['fps'] + 1e-3, (s, m)        # a tile may play once and hold
    data = {'fps': FPS, 'dur': dur, 'frames': '../frames', 'meta': meta, 'shots': shots, 'bg': list(bg), 'flash': list(flash),
            'dim': list(dim), 'fblur': [], 'leaks': [], 'iris': IRIS, 'flower': FLOWER}
    html = f'''<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face {{ font-family:CG; src:url('{S}/fonts/CG.ttf'); font-weight:300 700; }}
@font-face {{ font-family:CG; font-style:italic; src:url('{S}/fonts/CG-Italic.ttf'); font-weight:300 700; }}
@font-face {{ font-family:Jost; src:url('{S}/fonts/Jost.ttf'); font-weight:100 900; }}
</style>
<link rel="stylesheet" href="../engine/base5.css"><link rel="stylesheet" href="../engine/base6.css"></head><body>
<canvas id="v" width="1080" height="1920"></canvas>
{''.join(overlays)}
<script>window.AD = {json.dumps(data, ensure_ascii=False)};</script>
<script src="../engine/engine3.js"></script>
</body></html>'''
    os.makedirs(f'{A}/{name}', exist_ok=True)
    open(f'{A}/{name}/index.html', 'w').write(html)
    json.dump({'dur': dur, 'voice': voice, 'vo': vo, 'music': music, 'sfx': sorted(CUES, key=lambda c: c['t'])},
              open(f'{A}/{name}/audio.json', 'w'), indent=1, ensure_ascii=False)
    print(name, dur, 's', len(shots), 'shots', len(overlays), 'overlays', len(CUES), 'cues')

def bag_and_end(t_bag, t_buy2, t_more, t_drop, t_buy3, t_three, t_these, t_end, t_press, lines, end_line='Made to be asked about.'):
    """THE BAG, built on the ivory page the iris dives into, then resolved IN PLACE into the end card.
    Two pieces are already in it (the two she was wearing); the third tile is an empty outline that asks for one more.
    lines: {'three': (html, t0, t1), 'these': (html, t0, t1)} - the one text element under the bag"""
    out = []
    TX = [60, 390, 720]; TY = 350; TS = 300
    EX = [140, 415, 690]; EY = 500; ES = 250; sc = ES / TS
    fade_out = lambda t: K((t, {'o': 1}, 'lin'), (t + .2, {'o': 0}, 'in'))
    out.append(centred('<div class="hb-h">YOUR BAG</div>', 300, K((t_bag, {'o': 1}, 'step'), (t_end, {'o': 1}, 'lin'), (t_end + .2, {'o': 0}, 'in')), z=3))
    for i, key in enumerate(('huggies', 'chain', 'hoops')):
        p = HERO[key]
        dx = (EX[i] + ES / 2) - (TX[i] + TS / 2); dy = (EY + ES / 2) - (TY + TS / 2)
        move = [(t_end, {'x': 0, 'y': 0, 's': 1}, 'lin'), (t_end + .333, {'x': dx, 'y': dy, 's': sc}, 'out')]
        if i < 2:
            k = K((t_bag, {'o': 1}, 'step'), *move)
            out.append(el(f'<div class="hb-tile" style="position:relative"><img src="{IMG}/{p["img"]}.jpg"></div>', TX[i], TY, k, z=4))
        else:
            k = K((t_bag, {'o': 1}, 'step'), *move)
            ik = K((t_drop - .002, {'o': 0, 'y': -40}, 'lin'), (t_drop + .2, {'o': 1, 'y': 0}, 'out'))
            mk = K((t_more - .002, {'o': 0}, 'lin'), (t_more + .2, {'o': 1}, 'out'), (t_drop, {'o': 1}, 'lin'), (t_drop + .1, {'o': 0}, 'in'))
            out.append(el(f'<div class="hb-tile" style="position:relative;overflow:hidden">'
                          f'<div class="o" style="left:0;top:0;width:300px;height:300px;display:flex;align-items:center;justify-content:center" data-k=\'{mk}\'><span class="hb-more">+ ONE MORE</span></div>'
                          f'<img class="o" src="{IMG}/{p["img"]}.jpg" data-k=\'{ik}\'></div>', TX[i], TY, k, z=4))
            cue('clack', t_drop + .12, v=.8)
        t_on = t_bag if i < 2 else t_drop + .05
        nk = K((t_on - .002, {'o': 0}, 'lin'), (t_on + .15, {'o': 1}, 'out'), (t_end, {'o': 1}, 'lin'), (t_end + .2, {'o': 0}, 'in'))
        out.append(el(f'<div class="hb-n">{p["nm"]}</div><div class="hb-p">{RS(p["pr"])}</div>', TX[i], 666, nk, z=4))
    # the ladder
    def rung(x, label, lit):
        lk = K(*[(t, {'o': o}, 'lin') for t, o in lit])
        return el(f'<div class="rung" style="position:relative">{label}<div class="o lit" data-k=\'{lk}\'>{label}</div></div>', x, 790,
                  K((t_bag, {'o': 1}, 'step'), (t_end, {'o': 1}, 'lin'), (t_end + .2, {'o': 0}, 'in')), z=4)
    out.append(rung(75, 'BUY 2 · 20% OFF', [(0, 0), (t_buy2 - .001, 0), (t_buy2 + .12, 1), (t_buy3 - .001, 1), (t_buy3 + .12, 0)]))
    out.append(rung(555, 'BUY 3 · 30% OFF', [(0, 0), (t_buy3 - .001, 0), (t_buy3 + .12, 1)]))
    cue('tap', t_buy2, v=.5); cue('tap', t_buy3, v=.55)
    # the subtotal, struck while a rung is earned
    was_sw = att([[0, RS(TWO)], [t_drop, RS(THREE)]])
    wk = K((t_buy2 - .002, {'o': 0}, 'lin'), (t_buy2 + .15, {'o': 1}, 'out'), (t_drop, {'o': 1}, 'lin'), (t_drop + .02, {'o': 0}, 'lin'),
           (t_buy3 - .002, {'o': 0}, 'lin'), (t_buy3 + .15, {'o': 1}, 'out'), (t_end, {'o': 1}, 'lin'), (t_end + .2, {'o': 0}, 'in'))
    sk = K((t_buy2, {'w': 0}, 'lin'), (t_buy2 + .27, {'w': 108}, 'out'), (t_drop, {'w': 108}, 'lin'), (t_drop + .01, {'w': 0}, 'lin'),
           (t_buy3, {'w': 0}, 'lin'), (t_buy3 + .27, {'w': 108}, 'out'))
    out.append(centred(f'<span class="hb-was" style="position:relative;display:inline-block"><span data-swap=\'{was_sw}\'></span>'
                       f'<span class="o strike" data-k=\'{sk}\'></span></span>', 878, wk, z=4))
    cnt = att({'k': [[0, TWO], [t_buy2, TWO], [t_buy2 + .33, TWO20, 'expo'], [t_drop, TWO20], [t_drop + .003, THREE, 'step'],
                     [t_buy3, THREE], [t_buy3 + .6, THREE30, 'expo']], 'pre': '₹'})
    out.append(centred(f'<span class="hb-tot" data-count=\'{cnt}\'>{RS(TWO)}</span>', 918,
                       K((t_bag, {'o': 1}, 'step'), (t_end, {'o': 1}, 'lin'), (t_end + .2, {'o': 0}, 'in')), z=4))
    out.append(centred('<div class="hb-app">APPLIED IN YOUR BAG</div>', 1070, K((t_bag, {'o': 1}, 'step'), (t_end, {'o': 1}, 'lin'), (t_end + .2, {'o': 0}, 'in')), z=4))
    for key in ('three', 'these'):
        if key in lines:
            html, a, b = lines[key]
            out.append(line(html, 'b', 'lt', 60 if key == 'three' else 54, 0, 1200, a, b, z=5))
    # ---- the end card, built in place ----
    st = lambda t, dy=12: K((t - .002, {'o': 0, 'y': dy}, 'lin'), (t + .2, {'o': 1, 'y': 0}, 'out'))
    lk = st(t_end + .067)
    out.append(f'<div class="o" style="left:320px;top:290px;width:440px;z-index:6" data-k=\'{lk}\'>{logo(letters="#5E8279")}</div>')
    out.append(line(end_line, 'b', 'lt', 64, 0, 462, t_end + .167, FOREVER, z=6))
    out.append(centred(f'<div style="display:flex;align-items:baseline;gap:22px">{struck(THREE, t_end + .35, cls="hb-was")}'
                       f'<span class="b lt" style="font-size:66px">All three, {RS(THREE30)}</span></div>', 782, st(t_end + .267), z=6))
    out.append(centred('<div class="hb-app" style="font-size:22px;letter-spacing:.2em">BUY 2 · 20% OFF &nbsp;·&nbsp; BUY 3 · 30% OFF</div>', 872, st(t_end + .367), z=6))
    out.append(centred('<div class="hb-app" style="font-size:18px;color:rgba(26,22,20,.6)">APPLIED IN YOUR BAG</div>', 910, st(t_end + .367), z=6))
    press = K((t_press - .002, {'o': 0}, 'lin'), (t_press + .03, {'o': 1}, 'out'), (t_press + .2, {'o': 1}, 'lin'), (t_press + .32, {'o': 0}, 'in'))
    ck = K((t_end + .467 - .002, {'o': 0, 'y': 12, 's': 1}, 'lin'), (t_end + .667, {'o': 1, 'y': 0}, 'out'),
           (t_press, {'s': 1}, 'lin'), (t_press + .05, {'s': .985}, 'out'), (t_press + .25, {'s': 1}, 'out'))
    out.append(el(f'<div class="hcta"><div class="o dn" style="left:0;top:0;width:560px;height:96px" data-k=\'{press}\'></div><span>SHOP NOW</span></div>', 260, 958, ck, z=6))
    cue('tap', t_press, v=.6)
    out.append(centred('<div class="htrust">FREE SHIPPING &nbsp;·&nbsp; COD AVAILABLE &nbsp;·&nbsp; 3-YEAR PLATING ASSURANCE</div>', 1088, st(t_end + .567), z=6))
    out.append(centred('<div class="hurl">nairaflore.com</div>', 1136, st(t_end + .667), z=6))
    return out

def credit2(piece, tone, x, cap_top, t0, t1, name_px=30, price_px=64, z=15, gap=10):
    """v2: the credit on two lines, name in Jost caps over the price in Cormorant Medium, left-aligned"""
    p = HERO[piece]
    inner = (f'<div class="{tone}" style="display:flex;flex-direction:column;gap:{gap}px">'
             f'<span class="jo" style="font-weight:500;font-size:{name_px}px;letter-spacing:.2em;line-height:1;white-space:nowrap">{p["nm"]}</span>'
             f'<span class="b" style="font-size:{price_px}px;line-height:.9">{RS(p["pr"])}</span></div>')
    return f'<div class="o" style="left:{x:.0f}px;top:{cap_top:.0f}px;z-index:{z}" data-k=\'{tk(t0, t1)}\'>{inner}</div>'
def caps(txt, tone, x, cap_top, size, t0, t1, z=15, track=.2, extra='', now=False):
    return (f'<div class="o" style="left:{x:.0f}px;top:{cap_top - .14 * size:.0f}px;z-index:{z}" data-k=\'{tk(t0, t1, now=now)}\'>'
            f'<div class="jo {tone}" style="font-weight:500;font-size:{size}px;letter-spacing:{track}em;line-height:1.2;white-space:nowrap;{extra}">{txt}</div></div>')
