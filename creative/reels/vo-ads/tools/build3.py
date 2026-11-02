"""v3 of the three ad pages: v2's system made calmer, with the owner's material and guarantee claims.
- The owner asked for the PVD coating, the 18K gold coating, the zircon stones and the 3-year plating guarantee
  ("a lifetime with care") in all three, and for the "ting tings" to be toned down and everything to feel elegant.
- Each claim sits only where it is true:
  - 18K gold on the hoops, huggies and chain;
  - the ring is PVD rhodium, with the stones its listing calls cubic zirconia;
  - the hoops have no stones, so the 10 s ad says nothing about stones.
- New voice lines, in the same voice, replace "Waterproof. Tarnish-free." (10 s), "Free shipping across India." (20 s)
  and "Waterproof, tarnish-free, hypoallergenic, and all four under ₹1,200 each" (30 s).
- Calmer: stamps and offers wipe in rather than slam; no sparkle bursts; two or three sparkles an ad, most silent; one tap
  on the button. The cue list now names only soft sounds.
Usage: python3.13 -I build3.py <S>
Facts checked live in Shopify on 2 Nov 2026: prices, MRPs, BUY2 20% / BUY3 30%, listing tags, stock."""
import json, math, os, re, sys
S = sys.argv[1]; A = f'{S}/ads'
FPS = 30
META = {d: json.load(open(f'{A}/frames/{d}/meta.json')) for d in sorted(os.listdir(f'{A}/frames'))}
IMG = '../img'

# ---------- pieces (live 2 Nov) ----------
P = {
    'hoops':   dict(nm='Woven Gold Hoops', pr=1199, mrp=2769, off=57, img='hoops'),
    'huggies': dict(nm='Brushed Gold Huggies', pr=799, mrp=1799, off=56, img='huggies'),
    'chain':   dict(nm='Toggle Link Chain', pr=1199, mrp=2900, off=59, img='chain'),
    'ring':    dict(nm='Cushion Halo Ring', pr=1099, mrp=2200, off=50, img='ring'),
}
for p in P.values(): assert round(100 * (p['mrp'] - p['pr']) / p['mrp']) == p['off'], p
TWO = P['huggies']['pr'] + P['chain']['pr']; THREE = TWO + P['hoops']['pr']
assert (TWO, round(TWO * .8), THREE, round(THREE * .7)) == (1998, 1598, 3197, 2238)   # what the bag charges

def inr(n):
    s = str(int(round(n)))
    return s if len(s) <= 3 else re.sub(r'\B(?=(\d{2})+(?!\d))', ',', s[:-3]) + ',' + s[-3:]
RS = lambda n: '₹' + inr(n)
att = lambda o: json.dumps(o, ensure_ascii=False).replace("'", '&#39;')

# ---------- logo (repo vectors: sage letters, blush flower) ----------
LOGO = open(f'{A}/img/logo_sage.svg').read()
PATHS = re.findall(r'<path [^>]*/>|<path [^>]*>.*?</path>', LOGO, re.S)
def logo(letters='#5E8279', flower='#FFBDA8', part='both'):
    keep = [p.replace('#99B4AF', letters).replace('#FFBDA8', flower) for p in PATHS
            if not (part == 'letters' and 'FFBDA8' in p) and not (part == 'flower' and 'FFBDA8' not in p)]
    return '<svg viewBox="0 0 2708 606" style="width:100%;height:auto;overflow:visible;display:block">' + ''.join(keep) + '</svg>'
FLOWER_D = re.search(r' d="([^"]+)"', next(p for p in PATHS if 'FFBDA8' in p)).group(1)   # the flower is drawn in unit coordinates
FLOWER = [[round(float(v), 4) for xy in re.findall(r'([\-\d.]+)[ ,]([\-\d.]+)', sp) for v in xy] for sp in re.split(r'(?=M)', FLOWER_D)]
FLOWER = [sp for sp in FLOWER if len(sp) >= 6]
FLOWER_ORIGIN = '47.5% 58.3%'          # the flower's middle inside the 2708x606 logo box

ICON = {
    'check': '<path d="M5 12.5l4.4 4.4L19 7.2"/>',
    'drop': '<path d="M12 3.2c3.7 4.7 5.7 8 5.7 10.6a5.7 5.7 0 0 1-11.4 0c0-2.6 2-5.9 5.7-10.6z"/>',
    'spark': '<path d="M12 2.8l2 7.2 7.2 2-7.2 2-2 7.2-2-7.2-7.2-2 7.2-2z"/>',
    'leaf': '<path d="M5 19.5C5 11 10 5.6 19.5 4.5 19.5 14 14.4 19.5 5 19.5z"/><path d="M5 19.5l8.5-8.5"/>',
    'truck': '<path d="M2.5 6.5h11v9.5h-11z"/><path d="M13.5 9.5h4.2l3.3 3.4V16h-7.5z"/><circle cx="6.5" cy="17.4" r="1.9"/><circle cx="17.2" cy="17.4" r="1.9"/>',
    'cash': '<path d="M2.5 6.5h19v11h-19z"/><circle cx="12" cy="12" r="2.7"/><path d="M5.5 9.5v5M18.5 9.5v5"/>',
    'swap': '<path d="M4 9h15l-3.6-3.6"/><path d="M20 15H5l3.6 3.6"/>',
    'clock': '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.2V12l3.2 2.2"/>',
    'bag': '<path d="M5 8.2h14l-1.1 12H6.1z"/><path d="M9 8.2V6.6a3 3 0 0 1 6 0v1.6"/>',
    'shield': '<path d="M12 2.8l7.4 2.8v5.5c0 4.6-3.1 8.3-7.4 9.9-4.3-1.6-7.4-5.3-7.4-9.9V5.6z"/><path d="M8.7 12.1l2.3 2.3 4.4-4.6"/>',
    'medal': '<circle cx="12" cy="9.2" r="5.6"/><path d="M8.7 13.8L7.2 21l4.8-2.5 4.8 2.5-1.5-7.2"/>',
}
def icon(n, cls='ic24'): return f'<svg class="{cls}" viewBox="0 0 24 24">{ICON[n]}</svg>'

# ---------- cue list for the sound ----------
CUES, IRIS = [], []
def cue(name, t, **kw): CUES.append(dict(k=name, t=round(t, 3), **kw))
pan = lambda x: round(max(-1.0, min(1.0, (x - 540) / 540)) * .6, 2)

# ---------- keyframes ----------
def K(*fr): return json.dumps([[round(t, 4), p, e] for t, p, e in fr])
def wipe(t0, t1, d=.34, dx=-34, d_out=.2):                       # clip reveal from the left with a short slide
    return K((t0 - .002, {'o': 0, 'cl': 0, 'x': dx}, 'lin'), (t0, {'o': 1}, 'step'), (t0 + d, {'cl': 100, 'x': 0}, 'out'),
             (t1 - d_out, {'o': 1, 'x': 0}, 'lin'), (t1, {'o': 0, 'x': -40}, 'in'))
def rise(t0, t1, d=.42, dy=46, d_out=.2):                        # revealed upwards from its own baseline
    return K((t0 - .002, {'o': 0, 'ct': 0, 'y': dy}, 'lin'), (t0, {'o': 1}, 'step'), (t0 + d, {'ct': 100, 'y': 0}, 'out'),
             (t1 - d_out, {'o': 1, 'y': 0}, 'lin'), (t1, {'o': 0, 'y': -26}, 'in'))
def popk(t0, t1, s0=.6, d=.3, d_out=.2):
    return K((t0 - .002, {'o': 0, 's': s0}, 'lin'), (t0 + d, {'o': 1, 's': 1}, 'back'), (t1 - d_out, {'o': 1, 's': 1}, 'lin'), (t1, {'o': 0, 's': .94}, 'in'))
def slamk(t0, t1, s0=2.3, r0=-16, r1=-6, d=.2, d_out=.18):      # lands hard, squashes a touch, settles
    return K((t0 - .002, {'o': 0, 's': s0, 'r': r0}, 'lin'), (t0 + .06, {'o': 1}, 'out'), (t0 + d, {'s': 1, 'r': r1}, 'back'),
             (t1 - d_out, {'o': 1, 's': 1, 'r': r1}, 'lin'), (t1, {'o': 0, 's': .9, 'r': r1}, 'in'))
LAND = .37                                                        # where the back ease first reaches 1, as a share of d
def fadek(t0, t1, d=.28, d_out=.2, dy=20):
    return K((t0 - .002, {'o': 0, 'y': dy}, 'lin'), (t0 + d, {'o': 1, 'y': 0}, 'out'), (t1 - d_out, {'o': 1}, 'lin'), (t1, {'o': 0}, 'in'))
FOREVER = 99

def el(html, x, y, k, z=10, cls='', w=None, style=''):
    ws = f'width:{w}px;' if w else ''
    return f'<div class="o {cls}" style="left:{x:.0f}px;top:{y:.0f}px;{ws}z-index:{z};{style}" data-k=\'{k}\'>{html}</div>'
def centred(html, y, k, z=10, col=False):
    fl = 'flex-direction:column;align-items:center;' if col else 'justify-content:center;'
    return f'<div class="o" style="left:0;top:{y:.0f}px;width:1080px;display:flex;{fl}z-index:{z}" data-k=\'{k}\'>{html}</div>'

# ---------- where a piece is on screen: the engine's own zoom and crop, applied to points read off the source frames ----------
def shot(id, t0, t1, **kw): s = {'id': id, 't0': t0, 't1': t1}; s.update(kw); return s
def zoom_at(sh, t):
    u = min(1, max(0, (t - sh['t0']) / (sh['t1'] - sh['t0']))); z = sh.get('zoom', [1, 1]); s = z[0] + (z[1] - z[0]) * u
    if 'punch' in sh: p = min(1, max(0, (t - sh['t0']) / sh['punch'][1])); s *= 1 + (sh['punch'][0] - 1) * (1 - p) ** 3
    return s
def to_out(sh, t, x, y):
    s = zoom_at(sh, t)
    if META[sh['id']]['sq']:
        side = 1080 * s; return -(side - 1080) * .5 + x * s, sh.get('sqY', 420) - (side - 1080) * .5 + y * s
    return (x - 540) * s + 540, (y - 960) * s + 960
def src_at(pts, lt):
    if lt <= pts[0][0]: return pts[0][1:]
    if lt >= pts[-1][0]: return pts[-1][1:]
    for a, b in zip(pts, pts[1:]):
        if lt <= b[0]: u = (lt - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u
def at(sh, pts, t, dx=0, dy=0):
    x, y = src_at(pts, (t - sh['t0']) * sh.get('speed', 1) + sh.get('off', 0)); return to_out(sh, t, x + dx, y + dy)
def track(sh, pts, t0, t1, step=1 / 15):
    out, t = [], t0
    while t < t1 + 1e-6: x, y = at(sh, pts, t); out.append([round(t, 3), round(x, 1), round(y, 1)]); t += step
    return out
# source-frame positions (x, y in 1080x1920, or 1080x1080 for the studio clips), read off grid sheets and checked in crops
TR = {
    'hoopheld': [(0, 668, 662), (0.97, 584, 600)],
    'hoopbox_l': [(0, 440, 1372), (0.70, 504, 1352), (1.37, 480, 1240)],
    'hoopbox_r': [(0, 680, 1290), (0.70, 744, 1280), (1.37, 688, 1152)],
    'bb': [(0, 300, 920), (0.63, 320, 928), (1.23, 340, 928)],
    'portrait': [(0.5, 640, 888), (0.97, 720, 848)],
    'close': [(0, 240, 880), (0.63, 244, 912), (1.27, 240, 932)],
    'fist': [(0, 240, 888), (1.2, 244, 940), (2.37, 320, 856)],
    'hugheld_l': [(0, 300, 796), (0.87, 384, 836), (1.70, 368, 896)],
    'hugheld_r': [(0, 600, 736), (0.87, 684, 824), (1.70, 656, 1056)],
    'hugon': [(0.3, 378, 1249), (0.6, 335, 1166), (0.9, 371, 1145), (1.2, 374, 1134)],
    'palm': [(0, 620, 1048), (0.73, 584, 968), (1.43, 496, 1112)],
    'toggle': [(0, 448, 1408), (0.80, 524, 1396), (1.57, 448, 984)],
    'ringbox': [(1.40, 564, 1220), (2.77, 608, 1152)],
    'ringmacro': [(0, 560, 736), (0.67, 564, 828), (1.33, 568, 756)],
    'neck': [(0, 560, 1008), (0.60, 544, 1424), (1.17, 568, 1316)],
    'box_logo': [(0.5, 558, 900), (1.0, 558, 954)],
    'box_toggle': [(1.5, 554, 1254), (2.0, 510, 1288), (2.5, 484, 1270)],
    'ai_hoop_big': [(0, 380, 504), (2.5, 324, 512), (4.96, 360, 470)],
    'ai_hoop_small': [(0, 740, 624), (2.5, 700, 640), (4.96, 760, 690)],
    'ai_hug_l': [(0, 420, 416), (2.5, 400, 420), (4.96, 390, 400)],
    'ai_hug_r': [(0, 660, 508), (2.5, 640, 520), (4.96, 660, 560)],
}

# ---------- components ----------
STAR = ('<svg viewBox="-50 -50 100 100" width="100%" height="100%">'
        '<path d="M0 -50C3 -8 8 -3 50 0C8 3 3 8 0 50C-3 8 -8 3 -50 0C-8 -3 -3 -8 0 -50Z" fill="#FFFBF6"/>'
        '<path d="M0 -22C2 -4 4 -2 22 0C4 2 2 4 0 22C-2 4 -4 2 -22 0C-4 -2 -2 -4 0 -22Z" fill="#FFFBF6" transform="rotate(45)"/>'
        '<circle r="5" fill="#fff"/></svg>')
def glint(x, y, t, size=150, v=.6, r=0, z=26, sound=False):
    if sound: cue('shimmer', t, v=v, pan=pan(x))
    k = K((t - .002, {'o': 0, 's': .12, 'r': r}, 'lin'), (t + .11, {'o': 1, 's': 1, 'r': r + 22}, 'out'), (t + .5, {'o': 0, 's': .3, 'r': r + 75}, 'in'))
    return f'<div class="o spark" style="left:{x - size / 2:.0f}px;top:{y - size / 2:.0f}px;width:{size}px;height:{size}px;z-index:{z}" data-k=\'{k}\'>{STAR}</div>'
def burst(x, y, t, n=9, R=190, size=46, v=.5, z=27):
    cue('burst', t, v=v, pan=pan(x)); out = []
    for i in range(n):
        a = 2 * math.pi * i / n + .35 * math.sin(i * 2.1); rr = R * (.7 + .3 * ((i * 7) % 5) / 4); sz = size * (.65 + .35 * ((i * 3) % 4) / 3)
        k = K((t - .002, {'o': 0, 'x': 0, 'y': 0, 's': .2, 'r': 0}, 'lin'), (t + .07, {'o': 1, 's': 1}, 'out'),
              (t + .62, {'o': 0, 'x': math.cos(a) * rr, 'y': math.sin(a) * rr, 's': .25, 'r': 120}, 'out'))
        out.append(f'<div class="o spark" style="left:{x - sz / 2:.0f}px;top:{y - sz / 2:.0f}px;width:{sz:.0f}px;height:{sz:.0f}px;z-index:{z}" data-k=\'{k}\'>{STAR}</div>')
    return ''.join(out)
def callout(frm, trk, t0, t1, z=11):
    data = {'from': [round(frm[0]), round(frm[1])], 'track': trk, 't0': t0, 't1': t1, 'r': 8}
    return f'<svg class="callout thin" width="1080" height="1920" style="z-index:{z}" data-callout=\'{att(data)}\'><line/><circle class="ring" r="0"/><circle class="dot" r="0"/></svg>'
def leak(t, side=1, d=.62, a=.5, y=760, r=900, c='rgba(255,198,160,A)'):
    x0, x1 = (-260, 1000) if side > 0 else (1340, 80)
    return {'t': t, 'd': d, 'x0': x0, 'x1': x1, 'y0': y - 160, 'y1': y + 160, 'r': r, 'a': a, 'c': c}

def pcard(p, x, y, t_in, t_cnt, t_out, tag=None, w=500, z=13):
    """price card: wipes in at the MRP, counts down to the price as it is said, then strikes the MRP"""
    tc1 = t_cnt + .5; t_m = tc1 + .02; t_s = tc1 + .1
    cnt = {'k': [[t_cnt, p['mrp']], [tc1, p['pr'], 'expo']], 'pre': '₹'}
    mrp = (f'<span class="oi mrp" data-k=\'{K((t_m - .002, {"o": 0, "x": -16}, "lin"), (t_m + .18, {"o": 1, "x": 0}, "out"))}\'>{RS(p["mrp"])}'
           f'<span class="o strike" data-k=\'{K((t_s, {"w": 0}, "lin"), (t_s + .2, {"w": 108}, "out"))}\'></span></span>')
    shine = f'<div class="o shine" data-k=\'{K((t_s + .5, {"x": -220}, "lin"), (t_s + 1.0, {"x": w + 80}, "io"))}\'><i></i></div>'
    tg = f'<div class="tg">{tag}</div>' if tag else ''
    cue('swish', t_in, v=.8, pan=-.4)
    html = (f'<div class="pc2" style="width:{w}px"><div class="bar"></div>{tg}<div class="nm">{p["nm"]}</div>'
            f'<div class="row"><span class="pr" data-count=\'{att(cnt)}\'>{RS(p["mrp"])}</span>{mrp}</div>{shine}</div>')
    return el(html, x, y, wipe(t_in, t_out), z=z)
def stamp(txt, x, y, t, t_out, r1=-6, z=15, cls='stamp2', d=.2, drop=False):
    """v3: the tag wipes on (or, for the big price stamp, settles down into place) instead of slamming"""
    cue('tap', t + .12, v=.7, pan=pan(x + 100))
    k = (K((t - .002, {'o': 0, 'y': -26, 's': 1.06}, 'lin'), (t + .42, {'o': 1, 'y': 0, 's': 1}, 'out'), (t_out - .18, {'o': 1}, 'lin'), (t_out, {'o': 0}, 'in'))
         if drop else wipe(t, t_out, d=.32, dx=-14, d_out=.18))
    return el(f'<div class="{cls}">{txt}</div>', x, y, k, z=z)
def chip(txt, ic, x, y, t_in, t_out, z=12, centre=False):
    ik = K((t_in + .1, {'s': .2, 'r': -40}, 'lin'), (t_in + .42, {'s': 1, 'r': 0}, 'back'))
    html = f'<div class="chip2"><div class="ic oi" data-k=\'{ik}\'>{icon(ic)}</div><span>{txt}</span></div>'
    cue('swish', t_in, v=.6, pan=0 if centre else -.4)
    if centre: return centred(html, y, popk(t_in, t_out, s0=.7), z=z)
    return el(html, x, y, wipe(t_in, t_out, d=.3), z=z)
def kicker(txt, y, t0, t1, x=None, z=14):
    return (centred if x is None else (lambda h, yy, k, z: el(h, x, yy, k, z=z)))(f'<div class="kick">{txt}</div>', y, popk(t0, t1), z=z)
def offer_row(q, pct, y, t_in, t_val, t_out, alt=False, first=40):
    vk = K((t_val - .002, {'o': 0, 'y': 16}, 'lin'), (t_val + .3, {'o': 1, 'y': 0}, 'out'))
    rk = K((t_in - .002, {'o': 0, 'cl': 0, 'x': -34}, 'lin'), (t_in, {'o': 1}, 'step'), (t_in + .3, {'cl': first, 'x': 0}, 'out'),
           (t_val - .06, {'cl': first}, 'lin'), (t_val + .16, {'cl': 100}, 'out'), (t_out - .2, {'o': 1, 'x': 0}, 'lin'), (t_out, {'o': 0, 'x': -40}, 'in'))
    cue('swish', t_in, v=.8, pan=-.4); cue('tap', t_val + .1, v=.6, pan=-.2)
    html = f'<div class="ofr{" alt" if alt else ""}"><div class="q">{q}</div><div class="v oi" data-k=\'{vk}\'>{pct}%<small>OFF</small></div></div>'
    return el(html, 64, y, rk if t_val - t_in > .3 else wipe(t_in, t_out), z=13)

def bag(x, y, t_in, t_out, drops, fills, nodes, tot_on, now_k, labels, was_on, was_sw, strike_t, save_t, save_sw, bumps=(), counts=(), save_xy=None):
    """the bag fills as pieces drop in; the ladder lights each rung; the total counts to what the bag charges"""
    notes = (84, 88, 91)
    slots = ''
    for i, (n, t) in enumerate(drops):
        k = K((t - .002, {'o': 0, 'y': -110, 's': .7}, 'lin'), (t + .06, {'o': 1}, 'out'), (t + .36, {'y': 0, 's': 1}, 'back'))
        slots += f'<div class="slot"><img class="o" src="{IMG}/{P[n]["img"]}.jpg" data-k=\'{k}\'></div>'
        cue('drop', t + .2, note=notes[i], v=.8)
    def node(pos, t, label, right=False):
        cue('tap', t + .05, v=.5)
        nk = K((t - .002, {'o': 0, 's': .2}, 'lin'), (t + .3, {'o': 1, 's': 1}, 'back'))
        lk = K((t - .002, {'o': 0}, 'lin'), (t + .2, {'o': 1}, 'out'))
        return (f'<div class="node" style="left:{pos}%"><div class="o in" data-k=\'{nk}\'>{icon("check")}</div></div>'
                f'<div class="nlw{" r" if right else ""}" style="left:{pos}%"><div class="nl">{label}<span class="o lit" data-k=\'{lk}\'>{label}</span></div></div>')
    fill = f'<div class="o fill" data-k=\'{K(*fills)}\'><b></b></div>'
    lad = f'<div class="lad"><div class="track">{fill}</div>{node(66.667, nodes[0], "BUY 2<br>20% OFF")}{node(100, nodes[1], "BUY 3<br>30% OFF", True)}</div>'
    was = (f'<span class="oi was" data-k=\'{K((was_on - .002, {"o": 0, "x": -12}, "lin"), (was_on + .2, {"o": 1, "x": 0}, "out"))}\'>'
           f'<span data-swap=\'{att(was_sw)}\'></span><span class="o strike" data-k=\'{K((strike_t, {"w": 0}, "lin"), (strike_t + .2, {"w": 108}, "out"))}\'></span></span>')
    tot = (f'<div class="tot oi" style="display:flex" data-k=\'{K((tot_on - .002, {"o": 0, "y": 14}, "lin"), (tot_on + .25, {"o": 1, "y": 0}, "out"))}\'>'
           f'<span class="l" data-swap=\'{att(labels)}\'></span><span style="display:flex;align-items:flex-end">{was}'
           f'<span class="now" data-count=\'{att(now_k)}\'></span></span></div>')
    inner = (f'<div class="bag2"><div class="hd"><span>YOUR BAG</span><span class="auto">OFFER APPLIED AUTOMATICALLY</span></div>'
             f'<div class="slots">{slots}</div>{lad}{tot}</div>')
    cue('swish', t_in, v=.8, pan=-.3)
    sk = [(save_t - .002, {'o': 0, 'cl': 0, 'x': -14}, 'lin'), (save_t, {'o': 1}, 'step'), (save_t + .32, {'cl': 100, 'x': 0}, 'out'),
          (t_out - .2, {'o': 1}, 'lin'), (t_out, {'o': 0}, 'in')]
    for b in bumps: sk += [(b, {'s': 1}, 'lin'), (b + .1, {'s': 1.06}, 'out'), (b + .34, {'s': 1}, 'io')]
    cue('tap', save_t + .12, v=.6)
    sx, sy = save_xy
    return (el(inner, x, y, wipe(t_in, t_out, d=.36), z=12)
            + el(f'<div class="save" data-swap=\'{att(save_sw)}\'></div>', sx, sy, K(*sk), z=15))

# ---------- end card: opens through the flower ----------
def endwrap(eid, t0, inner):
    IRIS.append({'el': eid, 't0': t0, 's0': 430, 's1': 560, 's2': 21000, 'tp': .17, 'th': .27, 'tz': .64,
                 'cx': .5102, 'cy': .1638, 'ox': 540, 'oy': 960, 'r0': -14, 'rim': 18})
    cue('boom', t0, v=.8); cue('bloom', t0); cue('dive', t0 + .27, t1=t0 + .64, v=.8)
    k = K((t0 - .002, {'o': 0}, 'lin'), (t0, {'o': 1}, 'step'))
    return f'<div id="{eid}" class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:40" data-k=\'{k}\'><div class="endc"></div>{inner}</div>'
def endlogo(x, y, w, t):
    lk = K((t - .002, {'o': 0, 'ct': 0, 'y': 26}, 'lin'), (t, {'o': 1}, 'step'), (t + .44, {'ct': 100, 'y': 0}, 'out'))
    fk = K((t + .14 - .002, {'o': 0, 's': .2, 'r': -60}, 'lin'), (t + .52, {'o': 1, 's': 1, 'r': 0}, 'back'))
    cue('swish', t, v=.4)
    return (f'<div class="o" style="left:{x}px;top:{y}px;width:{w}px;z-index:3" data-k=\'{lk}\'>{logo(part="letters")}</div>'
            f'<div class="o" style="left:{x}px;top:{y}px;width:{w}px;z-index:4;transform-origin:{FLOWER_ORIGIN}" data-k=\'{fk}\'>{logo(part="flower")}</div>')
def endclip(id, x, y, size, t_vis, t0, speed):
    k = K((t_vis - .002, {'o': 0, 's': 1.07}, 'lin'), (t_vis + .45, {'o': 1, 's': 1}, 'out'))
    return el(f'<img data-clip="{id}" data-t0="{t0}" data-speed="{speed}" style="width:{size}px;height:{size}px;object-fit:cover;display:block">', x, y, k, z=2)
def cta(y, t, taps, text='SHOP NOW'):
    """the button pops, a shine runs across it, then a finger taps it"""
    press = [(t - .002, {'o': 0, 's': .6}, 'lin'), (t + .32, {'o': 1, 's': 1}, 'back')]
    for tp in taps: press += [(tp, {'s': 1}, 'lin'), (tp + .07, {'s': .94}, 'out'), (tp + .24, {'s': 1}, 'back')]
    sh = K((t + .55, {'x': -200}, 'lin'), (t + 1.0, {'x': 640}, 'io'))
    out = centred(f'<div class="cta2">{text}<div class="o shine" data-k=\'{sh}\'><i></i></div></div>', y, K(*press), z=5)
    for tp in taps:
        rk = K((tp - .002, {'o': 0, 's': .3}, 'lin'), (tp + .02, {'o': .95}, 'lin'), (tp + .56, {'o': 0, 's': 2.1}, 'out'))
        out += f'<div class="o ripple" style="left:470px;top:{y + 50 - 70}px;z-index:6" data-k=\'{rk}\'></div>'
        cue('tap', tp)
    return out
def trust(y, t, items=(('medal', '3-year plating guarantee'), ('truck', 'Free shipping'), ('cash', 'Cash on delivery'))):
    return centred('<div class="trust">' + ''.join(f'<div>{icon(i)}<span>{s}</span></div>' for i, s in items) + '</div>', y, fadek(t, FOREVER), z=4)
def struck(n, t, cls='endmrp'):
    return (f'<span class="{cls}" style="position:relative;display:inline-block">{RS(n)}'
            f'<span class="o strike" data-k=\'{K((t, {"w": 0}, "lin"), (t + .2, {"w": 108}, "out"))}\'></span></span>')

# ---------- voice: placed segments and caption lines ----------
def place(segs, voice):
    """segs: [(src0, src1, at, [lines...])] or with a fifth item naming another read; a line = [(word, w0, w1[, emphasis])]
    in source time."""
    plan, lines = [], []
    for sg in segs:
        s0, s1, at_, lns = sg[:4]
        plan.append({'src0': s0, 'src1': s1, 'at': at_, 'file': sg[4] if len(sg) > 4 else voice})
        for ln in lns:
            ws = [[round(at_ + (w[1] - s0), 3), round(at_ + (w[2] - s0), 3), w[0], 1 if len(w) > 3 else 0] for w in ln]
            lines.append({'t0': ws[0][0], 't1': ws[-1][1], 'w': ws})
    return plan, lines
def captions(lines, y=1090):
    return f'<div class="cap2" style="top:{y}px;z-index:30" data-lines=\'{att(lines)}\'></div>'

def page(name, dur, shots, overlays, bg=(), flash=(), dim=(), fblur=(), leaks=(), voice=None, vo=None, music=None):
    data = {'fps': FPS, 'dur': dur, 'frames': '../frames', 'meta': META, 'shots': shots, 'bg': list(bg), 'flash': list(flash),
            'dim': list(dim), 'fblur': list(fblur), 'leaks': list(leaks), 'iris': IRIS, 'flower': FLOWER}
    html = f'''<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face {{ font-family:CG; src:url('{S}/fonts/CG.ttf'); font-weight:300 700; }}
@font-face {{ font-family:CG; font-style:italic; src:url('{S}/fonts/CG-Italic.ttf'); font-weight:300 700; }}
@font-face {{ font-family:Jost; src:url('{S}/fonts/Jost.ttf'); font-weight:100 900; }}
</style>
<link rel="stylesheet" href="../engine/base2.css"></head><body>
<canvas id="v" width="1080" height="1920"></canvas>
{''.join(overlays)}
<script>window.AD = {json.dumps(data, ensure_ascii=False)};</script>
<script src="../engine/engine2.js"></script>
</body></html>'''
    os.makedirs(f'{A}/{name}', exist_ok=True)
    open(f'{A}/{name}/index.html', 'w').write(html)
    json.dump({'dur': dur, 'voice': voice, 'vo': vo, 'music': music, 'sfx': sorted(CUES, key=lambda c: c['t'])},
              open(f'{A}/{name}/audio.json', 'w'), indent=1, ensure_ascii=False)
    print(name, dur, 's', len(shots), 'shots', len(overlays), 'overlays', len(CUES), 'cues')

def whip_cues(shots):
    for sh in shots:
        if sh.get('whip'): cue('whoosh', sh['t0'], dir=sh.get('dir', 1), v=.8)
def care(y, t, txt='PVD coated · a lifetime of wear, with care'):
    """the owner's "lifetime, if you use it carefully", kept as small print under the guarantee"""
    return centred(f'<div class="care">{txt}</div>', y, fadek(t, FOREVER), z=4)

SONG = {'grwm': 'the GRWM song (the owner\'s GRWM edit)', 'd': 'Song D, "tera karaan intezaar" (the owner\'s corset edit)'}
HEADK = lambda t_out: K((1.36 - .002, {'o': 0, 'ct': 0, 'y': 46}, 'lin'), (1.36, {'o': 1}, 'step'), (1.76, {'ct': 100, 'y': 0}, 'out'),
                        (1.62, {'d': 0}, 'lin'), (1.98, {'d': 1}, 'io'), (t_out - .16, {'o': 1, 'y': 0}, 'lin'), (t_out, {'o': 0, 'y': -24}, 'in'))
UL = '<svg class="ul" width="600" height="30" viewBox="0 0 600 30"><path class="draw" d="M10 20C150 6 330 26 590 10"/></svg>'
def clip_glint(x0, y0, size, t, t0, speed, pts, v=.4, gsize=120):
    lx, ly = src_at(pts, (t - t0) * speed)
    return glint(x0 + lx * size / 1080, y0 + ly * size / 1080, t, gsize, v=v)
def music_cue(name, t, **kw): cue(name, t, music=1, **kw)       # skipped under a song, which has its own build into the drop

# =====================================================================================================
# AD 10 — "Our #1 bestseller": "18K gold, PVD coated." replaces "Waterproof. Tarnish-free."
# =====================================================================================================
CUES, IRIS = [], []
plan, lines = place([
    (0.00, 1.86, 0.10, [[('Our', 0.00, 0.24), ('#1', 0.24, 0.98, 1), ('bestseller.', 0.98, 1.74)]]),
    (3.78, 5.50, 2.00, [[('Now', 3.82, 4.06), ('just', 4.06, 4.34), ('₹1,199.', 4.34, 5.36, 1)]]),
    (3.86, 5.06, 3.78, [[('18K', 3.90, 4.52, 1), ('gold,', 4.52, 4.90)]], 'vo10c_fast'),
    (5.22, 6.28, 5.00, [[('PVD', 5.24, 5.76, 1), ('coated.', 5.76, 6.10)]], 'vo10c_fast'),
    (8.28, 10.43, 6.12, [[('Buy', 8.30, 8.50), ('2,', 8.50, 8.80), ('take', 9.08, 9.22), ('20%', 9.22, 9.92, 1), ('off.', 9.92, 10.24)]]),
    (10.74, 11.68, 8.34, [[('Shop', 10.78, 11.02), ('Naira.', 11.02, 11.56)]]),
], 'vo10')
H = P['hoops']
shots10 = [
    shot('grwm_hoopheld', 0.00, 1.25, zoom=[1.0, 1.07]),
    shot('riya_hoopbox', 1.25, 2.45, zoom=[1.03, 1.10], whip=.16, dir=1),
    shot('bb_close', 2.45, 3.73, zoom=[1.0, 1.05]),
    shot('riya_portrait', 3.73, 4.98, zoom=[1.04, 1.0], punch=[1.06, .25], speed=1.0 / 1.25),
    shot('grwm_close', 4.98, 6.12, zoom=[1.0, 1.05]),
    shot('grwm_fist', 6.12, 9.0, zoom=[1.0, 1.08], whip=.14, dir=-1, speed=2.40 / 2.88),
]
s = {sh['id']: sh for sh in shots10}
whip_cues(shots10); cue('swish', 1.36, v=.4)
e = 8.32
end10 = (endlogo(260, 290, 560, e + .48)
         + endclip('ai_hoops', 310, 440, 460, e + .44, e + .26, .9)
         + clip_glint(310, 440, 460, 9.36, e + .26, .9, TR['ai_hoop_big'])
         + centred(f'<div style="display:flex;align-items:baseline;gap:16px"><span class="endname">{H["nm"]}</span>'
                   f'<span class="endpr">{RS(H["pr"])}</span>{struck(H["mrp"], e + .98)}</div>', 918, fadek(e + .70, FOREVER), z=4)
         + cta(1004, e + .80, [9.62])
         + trust(1124, e + .98)
         + care(1172, e + 1.08))
ov10 = [
    glint(*at(s['grwm_hoopheld'], TR['hoopheld'], .30), .30, 150, v=.5, sound=True),
    kicker('Our #1 bestseller', 290, 1.30, 2.28),
    centred(f'<div class="head" style="font-size:92px;color:var(--deep);text-shadow:0 0 18px rgba(251,243,236,.9),0 0 3px rgba(251,243,236,.8)">the woven gold hoops.</div>{UL}', 352, HEADK(2.28), z=13, col=True),
    glint(*at(s['riya_hoopbox'], TR['hoopbox_l'], 1.55, -55, -60), 1.55, 130),
    pcard(H, 64, 290, 2.30, 2.56, 6.06, tag='PVD 18K gold coating'),
    stamp(f'{H["off"]}% OFF', 500, 246, 3.62, 6.06),
    callout((300, 522), track(s['bb_close'], TR['bb'], 2.70, 3.73), 2.72, 3.70),
    chip('18K gold coating', 'spark', 64, 548, 3.80, 6.06),
    chip('PVD · anti-tarnish', 'shield', 64, 636, 5.02, 6.06),
    kicker('Mix any pieces', 290, 6.14, 8.32, x=64),
    offer_row('BUY 2', 20, 352, 6.20, 7.04, 8.32),
    offer_row('BUY 3', 30, 516, 7.46, 7.62, 8.32, alt=True),
    captions(lines),
    endwrap('end10', e, end10),
]
music_cue('riser', e, d=1.2, v=.7); music_cue('revcym', e, d=.8, v=.6)
page('ad10v3', 10.0, shots10, ov10, voice='vo10', vo=plan, leaks=[leak(1.22), leak(6.08, -1), leak(8.26, 1, .7, .55, 960, 1100)],
     music={'score': {'bpm': 93.5, 'anchor': e, 'end': e, 'sections': [[0, 7.66, 'groove'], [7.66, e, 'stop'], [e, 10.0, 'end']]},
            'song': {'name': 'grwm', 'file': 'songs/grwm.wav', 'segs': [[0.0, 10.0, 8.63 - e]], 'drop': e}})

# =====================================================================================================
# AD 20 — "Your whole stack, in one box": "Three-year plating guarantee." replaces "Free shipping across India."
# =====================================================================================================
CUES, IRIS = [], []
plan, lines = place([
    (0.00, 2.32, 0.15, [[('Your', 0.00, 0.22), ('whole', 0.22, 0.54), ('stack,', 0.54, 0.90), ('in', 1.28, 1.46), ('one', 1.46, 1.70), ('box.', 1.70, 2.08)]]),
    (2.64, 4.45, 2.58, [[('Huggies,', 2.60, 3.14), ('₹799.', 3.40, 4.18, 1)]]),
    (4.80, 7.10, 4.50, [[('The', 4.76, 4.90), ('toggle', 4.90, 5.16), ('chain,', 5.16, 5.52), ('₹1,199.', 5.90, 6.82, 1)]]),
    (7.44, 9.52, 6.92, [[('A', 7.42, 7.56), ('halo', 7.56, 7.80), ('ring,', 7.80, 8.12), ('₹1,099.', 8.52, 9.26, 1)]]),
    (9.85, 11.58, 9.12, [[('Plus', 9.78, 10.06), ('our', 10.06, 10.38), ('bestselling', 10.38, 10.96), ('hoops.', 10.96, 11.44)]]),
    (11.81, 14.13, 11.00, [[('Pick', 11.80, 12.00), ('any', 12.00, 12.24), ('two,', 12.24, 12.58), ('take', 12.88, 12.98), ('20%', 12.98, 13.62, 1), ('off.', 13.62, 13.96)]]),
    (14.38, 15.72, 13.46, [[('Pick', 14.34, 14.56), ('three,', 14.56, 14.86), ('30%.', 15.20, 15.50, 1)]]),
    (4.64, 6.30, 14.96, [[('3-year', 4.68, 5.22, 1), ('plating', 5.22, 5.64), ('guarantee.', 5.64, 6.14)]], 'vo20c'),
    (18.02, 18.92, 16.86, [[('Shop', 18.00, 18.30), ('Naira.', 18.30, 18.80)]]),
], 'vo20b')
shots20 = [
    shot('pk_box', 0.00, 2.55, zoom=[1.0, 1.06]),
    shot('pk_hugheld', 2.55, 3.55, zoom=[1.04, 1.10], whip=.15, dir=1),
    shot('pk_hugon', 3.55, 4.50, zoom=[1.0, 1.04]),
    shot('pk_palm', 4.50, 5.50, zoom=[1.04, 1.10], whip=.15, dir=-1),
    shot('pk_toggle', 5.50, 6.92, zoom=[1.0, 1.05]),
    shot('riya_ringbox', 6.92, 8.05, zoom=[1.02, 1.08], whip=.15, off=0.25, dir=1),
    shot('riya_ringmacro', 8.05, 9.12, zoom=[1.0, 1.06]),
    shot('riya_hoopbox', 9.12, 10.12, zoom=[1.03, 1.09], whip=.15, dir=-1),
    shot('bb_close', 10.12, 11.00, zoom=[1.0, 1.04]),
    shot('pk_portrait', 11.00, 13.46, zoom=[1.0, 1.05], punch=[1.06, .3]),
    shot('riya_wear', 13.46, 14.96, zoom=[1.02, 1.06], whip=.14, dir=1),
    shot('grwm_pose', 14.96, 17.45, zoom=[1.0, 1.06], speed=2.30 / 2.49),
]
s = {sh['id']: sh for sh in shots20}
whip_cues(shots20)
e = 16.74
tiles20 = ''.join(
    f'<div class="mt o" style="position:relative" data-k=\'{K((e + .66 + .07 * i - .002, {"o": 0, "y": 50}, "lin"), (e + .66 + .07 * i + .38, {"o": 1, "y": 0}, "out"))}\'>'
    f'<img src="{IMG}/{P[n]["img"]}.jpg"><div class="n">{P[n]["nm"]}</div><div class="p">{RS(P[n]["pr"])}{struck(P[n]["mrp"], e + 1.2 + .05 * i, "m")}</div></div>'
    for i, n in enumerate(('huggies', 'chain', 'ring', 'hoops')))
for i in range(4): cue('swish', e + .66 + .07 * i, v=.25, pan=(i - 1.5) * .3)
end20 = (endlogo(250, 285, 580, e + .5)
         + centred('<div class="endh">pick any 3 · <b>30% off</b></div>', 440, rise(e + .62, FOREVER), z=4)
         + f'<div style="position:absolute;left:36px;top:545px;width:1008px;display:flex;gap:21px;z-index:3">{tiles20}</div>'
         + glint(36 + 3 * 257 + 80, 545 + 70, 18.30, 110)
         + cta(905, e + 1.0, [18.75])
         + trust(1025, e + 1.15)
         + care(1072, e + 1.25)
         + centred('<div class="url">nairaflore.com</div>', 1114, fadek(e + 1.3, FOREVER), z=4))
ov20 = [
    glint(*at(s['pk_box'], TR['box_toggle'], 1.70), 1.70, 140, v=.45, sound=True),
    pcard(P['huggies'], 64, 290, 2.60, 3.34, 4.46, tag='PVD 18K gold coating'),
    stamp(f'{P["huggies"]["off"]}% OFF', 500, 246, 3.98, 4.46),
    callout((420, 522), track(s['pk_hugheld'], TR['hugheld_r'], 2.74, 3.55), 2.76, 3.53),
    pcard(P['chain'], 64, 290, 4.52, 5.62, 6.88, tag='PVD 18K gold coating'),
    stamp(f'{P["chain"]["off"]}% OFF', 500, 246, 6.30, 6.88),
    callout((420, 522), track(s['pk_palm'], TR['palm'], 4.70, 5.50), 4.72, 5.48),
    pcard(P['ring'], 64, 290, 6.94, 8.02, 9.08, tag='Cubic zirconia'),
    stamp(f'{P["ring"]["off"]}% OFF', 500, 246, 8.66, 9.08),
    callout((420, 556), track(s['riya_ringmacro'], TR['ringmacro'], 8.10, 9.12), 8.12, 9.08),
    glint(*at(s['riya_ringmacro'], TR['ringmacro'], 8.56, 40, -30), 8.56, 120),
    pcard(P['hoops'], 64, 290, 9.14, 9.70, 10.98, tag='#1 Bestseller'),
    stamp(f'{P["hoops"]["off"]}% OFF', 500, 246, 10.36, 10.98),
    callout((420, 556), track(s['bb_close'], TR['bb'], 10.13, 11.00), 10.15, 10.98),
    glint(*at(s['riya_hoopbox'], TR['hoopbox_l'], 9.40, -55, -60), 9.40, 130),
    bag(100, 300, 11.05, 14.92,
        drops=[('huggies', 11.45), ('chain', 11.75), ('hoops', 13.62)],
        fills=[(11.45, {'w': 0}, 'lin'), (11.70, {'w': 33.33}, 'out'), (11.78, {'w': 33.33}, 'lin'), (12.08, {'w': 66.67}, 'out'),
               (13.66, {'w': 66.67}, 'lin'), (13.98, {'w': 100}, 'out')],
        nodes=[12.12, 14.02], tot_on=11.45,
        now_k={'k': [[11.45, 799], [11.78, 799], [12.0, 1998, 'expo'], [12.22, 1998], [12.72, 1598, 'expo'], [13.66, 1598], [14.30, 2238, 'expo']], 'pre': '₹'},
        labels=[[0, '1 piece'], [11.78, '2 pieces'], [12.17, '2 pieces · 20% off'], [13.62, '3 pieces'], [14.28, '3 pieces · 30% off']],
        was_on=12.17, was_sw=[[0, '₹1,998'], [13.62, '₹3,197']], strike_t=12.24,
        save_t=12.55, save_sw=[[0, 'YOU SAVE ₹400'], [14.32, 'YOU SAVE ₹959']], bumps=[14.32], save_xy=(560, 818)),
    chip('3-year plating guarantee', 'medal', 64, 300, 14.98, 16.74),
    chip('Free insured shipping', 'truck', 64, 400, 15.30, 16.74),
    chip('Cash on delivery', 'cash', 64, 500, 15.56, 16.74),
    el('<div class="care bg">PVD coated · a lifetime of wear, with care</div>', 64, 600, fadek(15.80, 16.74), z=12),
    captions(lines),
    endwrap('end20', e, end20),
]
cue('whoosh', 11.0, dir=-1, v=.45); cue('air', 11.0, t1=11.4, v=.8)
music_cue('revcym', 1.34, d=.8, v=.6); music_cue('riser', e, d=1.5, v=.7); music_cue('revcym', e, d=1.0, v=.6)
page('ad20v3', 20.0, shots20, ov20, voice='vo20b', vo=plan,
     fblur=[[11.0, 0], [11.32, 14], [14.70, 14], [14.98, 0]], dim=[{'t0': 11.0, 't1': 14.96, 'a': .32}],
     leaks=[leak(6.90), leak(10.98, -1), leak(16.68, 1, .7, .55, 960, 1100)],
     music={'score': {'bpm': 93.5, 'anchor': e, 'end': e,
                      'sections': [[0, 1.34, 'intro'], [1.34, 11.0, 'groove'], [11.0, 14.96, 'lift'], [14.96, 16.24, 'groove'], [16.24, e, 'stop'], [e, 20.0, 'end']]},
            'song': {'name': 'd', 'file': 'songs/d_owner.wav', 'segs': [[0.0, 20.0, 17.849 - e]], 'drop': e}})

# =====================================================================================================
# AD 30 — "Where is it from?": the claims line replaces "Waterproof, tarnish-free, hypoallergenic, and all four under ₹1,200"
# =====================================================================================================
CUES, IRIS = [], []
plan, lines = place([
    (0.00, 2.22, 0.45, [[('Somewhere,', 0.00, 0.46), ('someone', 0.94, 1.26), ('just', 1.26, 1.54), ('asked…', 1.54, 2.00)]]),
    (2.49, 3.39, 2.86, [[('where', 2.46, 2.68), ('is', 2.68, 2.84), ('it', 2.84, 2.94), ('from?', 2.94, 3.20)]]),
    (3.80, 4.35, 4.10, []), (4.72, 5.32, 5.05, []), (5.58, 6.24, 5.80, []), (6.47, 7.15, 6.60, []), (7.38, 8.06, 7.42, []),
    (8.38, 11.31, 8.40, [[('Demi-fine', 8.34, 8.98), ('jewellery,', 8.98, 9.38)], [('made', 9.38, 9.96), ('in', 9.96, 10.20), ('limited', 10.20, 10.54), ('batches.', 10.54, 11.30)]]),
    (3.38, 4.16, 11.48, [], 'vo30c'),
    (4.44, 8.12, 12.32, [], 'vo30c'),
    (17.43, 20.41, 17.12, [[('Pick', 17.42, 17.60), ('any', 17.60, 17.88), ('three,', 17.88, 18.18)], [('and', 18.18, 18.52), ('your', 18.52, 18.68), ('bag', 18.68, 18.94)], [('takes', 18.94, 19.24), ('30%', 19.24, 19.94, 1), ('off.', 19.94, 20.32)]]),
    (20.72, 24.25, 20.32, []),
    (24.63, 26.67, 24.12, [[('So', 24.56, 24.78), ('the', 24.78, 24.90), ('next', 24.90, 25.10), ('time', 25.10, 25.34), ('they', 25.34, 25.48), ('ask', 25.48, 25.78)], [('where', 25.78, 25.94), ("it's", 25.94, 26.14), ('from,', 26.14, 26.46)]]),
    (26.94, 27.80, 26.42, [[('say', 26.92, 27.20), ('Naira.', 27.20, 27.72, 1)]]),
], 'vo30')
for ln in lines:
    if 8.3 <= ln['t0'] < 11.4: ln['dark'] = True
INK = {'color': '#1A1614'}
glowbg = lambda t0, t1, x, y, r=900, a=.55, c='rgba(255,189,168,A)': {'t0': t0, 't1': t1, 'x': x, 'y': y, 'r': r, 'a': a, 'c': c}
bg30 = [
    dict(INK, t0=0.0, t1=4.85, glows=[glowbg(-0.9, 4.85, [380, 700], [1300, 900], 1000, .42), glowbg(-0.9, 4.85, [900, 520], [500, 1100], 700, .22, 'rgba(232,201,138,A)')]),
    dict(INK, t0=4.85, t1=8.30, glows=[glowbg(4.85, 8.30, [300, 820], [700, 1400], 1100, .40), glowbg(4.85, 8.30, [900, 300], [1200, 700], 800, .20, 'rgba(232,201,138,A)')]),
    {'color': '#FBF3EC', 't0': 15.80, 't1': 17.15, 'glows': [glowbg(15.8, 17.15, [540, 540], [400, 1100], 900, .35)]},
    dict(INK, t0=17.15, t1=20.32, glows=[glowbg(17.15, 20.32, [200, 880], [600, 1300], 1000, .45), glowbg(17.15, 20.32, [900, 400], [1300, 900], 700, .2, 'rgba(232,201,138,A)')]),
]
shots30 = [
    shot('ai_hoops', 8.28, 9.84, zoom=[1.0, 1.06], whip=.16, sqY=420, dir=1),
    shot('ai_huggies', 9.84, 11.42, zoom=[1.0, 1.05], whip=.16, sqY=420, dir=-1),
    shot('bb_close', 11.42, 12.60, zoom=[1.04, 1.0], whip=.14, dir=1),
    shot('pk_hugon', 12.60, 13.70, zoom=[1.0, 1.05]),
    shot('pk_neck', 13.70, 14.72, zoom=[1.0, 1.05]),
    shot('riya_wear', 14.72, 15.80, zoom=[1.02, 1.06], whip=.14, whipOut=.12, dir=-1),
    shot('riya_ringbox', 20.32, 23.05, zoom=[1.0, 1.07], whip=.15, dir=1),
    shot('riya_hoopbox', 23.05, 24.12, zoom=[1.03, 1.08]),
    shot('riya_portrait', 24.12, 25.12, zoom=[1.04, 1.0], punch=[1.07, .25], whip=.14, dir=-1),
    shot('grwm_fist', 25.12, 27.90, zoom=[1.0, 1.07], speed=2.40 / 2.78),
]
s = {sh['id']: sh for sh in shots30}
whip_cues(shots30); cue('whoosh', 15.80, dir=1, v=.6)
def collapse(t_in, dx, dy, first=False):
    a = {'o': 1, 's': .96, 'b': 0, 'x': 0, 'y': 0} if first else {'o': 0, 's': .7, 'b': 4, 'x': 0, 'y': 0}
    return K((t_in - .002, a, 'lin'), (t_in + .32, {'o': 1, 's': 1, 'b': 0}, 'back'), (3.40, {'o': 1, 's': 1, 'b': 0, 'x': 0, 'y': 0}, 'lin'),
             (3.78, {'o': 0, 's': .12, 'b': 12, 'x': dx, 'y': dy}, 'in'))
story = ('<div class="story"><div class="lb">Replied to your story</div><div class="th"><i></i>'
         '<img data-clip="grwm_hoopheld" data-t0="0" data-speed=".35"></div></div>')
dots = ''.join(f'<i data-bob=\'{att({"t0": 1.9, "t1": 2.8, "p": .62, "a": 9, "ph": i * .9})}\'></i>' for i in range(3))
dots2 = ''.join(f'<i data-bob=\'{att({"t0": 25.72, "t1": 26.36, "p": .62, "a": 9, "ph": i * .9})}\'></i>' for i in range(3))
cue('dm', 0.04, kind='in'); cue('typing', 1.92, t1=2.78); cue('dm', 2.86, kind='in'); cue('suck', 3.40, t1=3.78, v=.8)
cue('boom', 4.08, v=.7); cue('bloom', 3.62); music_cue('riser', 4.10, d=1.3, v=.7); music_cue('revcym', 4.10, d=.85, v=.6)
rows, focus = '', [5.05, 5.80, 6.60, 7.42]
for i, n in enumerate(('hoops', 'huggies', 'chain', 'ring')):
    fr = [(4.9, {'s': 1, 'b': 0, 'o': 1}, 'lin')]
    for j, t in enumerate(focus):
        on = i == j
        fr += [(t, {'s': 1.0, 'b': 0 if on else 2.6, 'o': 1 if on else .5}, 'out'), (t + .22, {'s': 1.07 if on else .97, 'b': 0 if on else 2.6, 'o': 1 if on else .5}, 'out')]
    fr.append((8.0, {'s': 1, 'b': 0, 'o': 1}, 'out'))
    hk = K((focus[i] - .002, {'o': 0}, 'lin'), (focus[i] + .14, {'o': 1}, 'out'), *([(focus[i + 1], {'o': 1}, 'lin'), (focus[i + 1] + .14, {'o': 0}, 'out')] if i < 3 else []))
    rows += (f'<div class="prow o" style="position:relative" data-k=\'{K(*fr)}\'><div class="o hl" data-k=\'{hk}\'></div>'
             f'<img src="{IMG}/{P[n]["img"]}.jpg"><div class="nm">{P[n]["nm"]}</div><div class="pr">{RS(P[n]["pr"])}<s>{RS(P[n]["mrp"])}</s></div>'
             f'<div class="st">IN STOCK</div></div>')
    cue('tap', focus[i] + .02, v=.35)
cue('swish', 4.78, v=.6); cue('whoosh', 8.06, dir=-1, v=.55)
plist = f'<div class="plist"><div class="h"><span>THE EDIT</span><span>4 PIECES</span></div>{rows}</div>'
def stag(nm, sub, xy, frm, trk, t0, t1):
    """a product tag: a dot on the piece, a line out to a pill with its name, kept off the face"""
    pill = f'<div class="tag2"><div class="tb">{icon("bag")}</div><div><div class="t1">{nm}</div><div class="t2">{sub}</div></div></div>'
    k = K((t0 + .2 - .002, {'o': 0, 'x': -20, 'cl': 0}, 'lin'), (t0 + .2, {'o': 1}, 'step'), (t0 + .52, {'x': 0, 'cl': 100}, 'out'),
          (t1 - .18, {'o': 1}, 'lin'), (t1, {'o': 0}, 'in'))
    cue('swish', t0 + .2, v=.35, pan=.3)
    return callout(frm, trk, t0, t1, z=12) + el(pill, xy[0], xy[1], k, z=13)
tiles = ''
for i, n in enumerate(('hoops', 'huggies', 'chain', 'ring')):
    x, y = (160, 560)[i % 2], (282, 772)[i // 2]; t = 15.80 + .08 * i
    k = K((t - .002, {'o': 0, 'y': 60, 's': .94}, 'lin'), (t + .4, {'o': 1, 'y': 0, 's': 1}, 'out'), (17.0, {'o': 1, 'y': 0, 's': 1}, 'lin'), (17.15, {'o': 0, 'y': -30, 's': 1}, 'in'))
    sh = K((16.5 + .07 * i, {'x': -220}, 'lin'), (16.98 + .07 * i, {'x': 520}, 'io'))
    tiles += (f'<div class="o" style="left:{x}px;top:{y}px;z-index:12" data-k=\'{k}\'><div class="tile"><img src="{IMG}/{P[n]["img"]}.jpg">'
              f'<div class="t"><div class="nm">{P[n]["nm"]}</div><div class="pr">{RS(P[n]["pr"])}{struck(P[n]["mrp"], 16.30 + .05 * i, "m")}</div></div>'
              f'<div class="o shine" data-k=\'{sh}\'><i></i></div></div></div>')
    cue('swish', t, v=.25, pan=(-.3 if i % 2 == 0 else .3))
e = 27.20
end30 = (endlogo(200, 280, 680, e + .5)
         + endclip('ai_hoops', 300, 460, 480, e + .46, 27.2, .8)
         + clip_glint(300, 460, 480, 28.4, 27.2, .8, TR['ai_hoop_big'])
         + centred('<div class="endh">pick any 3 · <b>30% off</b></div>', 952, rise(e + .75, FOREVER), z=4)
         + cta(1030, e + .9, [28.75])
         + trust(1146, e + 1.1)
         + care(1194, e + 1.2)
         + centred('<div class="url">nairaflore.com</div>', 1228, fadek(e + 1.3, FOREVER), z=4))
ov30 = [
    el(story, 182, 430, collapse(0.0, 188, 295, first=True), z=12),
    el('<div class="dm"><div class="av"></div><div class="bub">omg your hoops 😍</div></div>', 80, 806, collapse(0.0, 189, 44, first=True), z=12),
    el(f'<div class="dm"><div class="av"></div><div class="bub typing">{dots}</div></div>', 80, 936,
       K((1.9 - .002, {'o': 0, 's': .7}, 'lin'), (2.16, {'o': 1, 's': 1}, 'back'), (2.70, {'o': 1, 's': 1}, 'lin'), (2.82, {'o': 0, 's': .9}, 'in')), z=12),
    el('<div class="dm"><div class="av"></div><div class="bub">wait where is it from??</div></div>', 80, 936, collapse(2.86, 126, -86), z=12),
    el('<div class="glow" style="width:240px;height:240px"></div>', 420, 780,
       K((3.45, {'o': 0, 's': .2}, 'lin'), (3.75, {'o': 1, 's': 1.2}, 'out'), (3.95, {'o': 1, 's': .85}, 'io'), (4.30, {'o': 0, 's': 2.6}, 'out')), z=13),
    glint(540, 900, 3.66, 240, v=.4, sound=True),
    el('<div class="glow"></div>', 40, 360, K((3.95, {'o': 0, 's': .6}, 'lin'), (4.20, {'o': .9, 's': 1}, 'out'), (4.70, {'o': .7, 's': 1.05}, 'lin'), (5.0, {'o': 0, 's': 1.1}, 'in')), z=11),
    el(f'<div style="width:880px">{logo(letters="#99B4AF", part="flower")}</div>', 100, 760,
       K((3.62, {'o': 0, 's': .3, 'r': -50, 'b': 6}, 'lin'), (4.05, {'o': 1, 's': 1, 'r': 0, 'b': 0}, 'back'), (4.70, {'o': 1, 'y': 0, 's': 1}, 'lin'), (5.0, {'o': 0, 'y': -120, 's': .9}, 'in')),
       z=14, style=f'transform-origin:{FLOWER_ORIGIN}'),
    el(f'<div style="width:880px">{logo(letters="#99B4AF", part="letters")}</div>', 100, 760,
       K((3.92 - .002, {'o': 0, 'ct': 0, 'y': 40}, 'lin'), (3.92, {'o': 1}, 'step'), (4.36, {'ct': 100, 'y': 0}, 'out'), (4.70, {'o': 1, 'y': 0, 's': 1}, 'lin'), (5.0, {'o': 0, 'y': -120, 's': .9}, 'in')), z=14),
    el(plist, 100, 520, K((4.78, {'o': 0, 'rx': 26, 'ry': -18, 's': .86, 'y': 140, 'b': 8}, 'lin'), (5.25, {'o': 1, 'rx': 10, 'ry': -8, 's': 1, 'y': 0, 'b': 0}, 'out'),
                         (7.9, {'o': 1, 'rx': 4, 'ry': -3, 's': 1.02, 'x': 0, 'b': 0}, 'lin'), (8.30, {'o': 0, 'rx': 4, 'ry': -3, 's': 1.02, 'x': -1100, 'b': 22}, 'in')), z=12),
    centred('<div class="head" style="font-size:118px;color:var(--deep);text-shadow:none">demi-fine.</div>', 280, rise(8.40, 11.36), z=12),
    kicker('Made in limited batches', 420, 9.38, 11.36, z=12),
    glint(*at(s['ai_hoops'], TR['ai_hoop_big'], 8.70), 8.70, 140),
    chip('PVD coated · anti-tarnish', 'shield', 0, 300, 11.52, 15.76, centre=True),
    chip('18K gold coating', 'spark', 0, 400, 12.86, 15.76, centre=True),
    chip('3-year plating guarantee', 'medal', 0, 500, 14.38, 15.76, centre=True),
    centred('<div class="care bg">a lifetime of wear, with care</div>', 596, fadek(14.92, 15.76), z=12),
    stag('Woven Gold Hoops', RS(P['hoops']['pr']), (40, 1040), (300, 1040), track(s['bb_close'], TR['bb'], 11.60, 12.60), 11.62, 12.52),
    stag('Brushed Gold Huggies', RS(P['huggies']['pr']), (40, 790), (250, 893), track(s['pk_hugon'], TR['hugon'], 12.88, 13.70), 12.90, 13.64),
    tiles,
    stamp('<div class="a">ALL UNDER</div><div class="b">₹1,200</div><div class="c">EACH</div>', 390, 190, 16.05, 17.15, cls='stamp3', drop=True),
    bag(100, 496, 17.18, 20.30,
        drops=[('huggies', 17.45), ('chain', 17.70), ('hoops', 17.95)],
        fills=[(17.45, {'w': 0}, 'lin'), (17.65, {'w': 33.33}, 'out'), (17.70, {'w': 33.33}, 'lin'), (17.90, {'w': 66.67}, 'out'),
               (17.95, {'w': 66.67}, 'lin'), (18.20, {'w': 100}, 'out')],
        nodes=[17.92, 18.22], tot_on=17.45,
        now_k={'k': [[17.45, 799], [17.70, 799], [17.88, 1998, 'expo'], [17.95, 1998], [18.15, 3197, 'expo'], [18.92, 3197], [19.46, 2238, 'expo']], 'pre': '₹'},
        labels=[[0, 'Subtotal · 1 piece'], [17.70, 'Subtotal · 2 pieces'], [17.95, 'Subtotal · 3 pieces'], [18.90, '3 pieces · 30% off']],
        was_on=18.90, was_sw=[[0, '₹3,197']], strike_t=18.96,
        save_t=19.46, save_sw=[[0, 'YOU SAVE ₹959']], save_xy=(560, 1014)),
    chip('Free insured shipping', 'truck', 64, 300, 20.70, 23.95),
    chip('Across India · 3–5 days', 'clock', 64, 400, 21.85, 23.95),
    chip('Cash on delivery', 'cash', 64, 500, 22.90, 23.95),
    stag('Cushion Halo Ring', 'Cubic zirconia · ' + RS(P['ring']['pr']), (600, 900), (700, 1003), track(s['riya_ringbox'], TR['ringbox'], 21.78, 23.05), 21.80, 22.98),
    glint(*at(s['riya_ringbox'], TR['ringbox'], 21.95), 21.95, 140),
    el('<div class="dm"><div class="av"></div><div class="bub">where is it from??</div></div>', 80, 330, popk(24.55, 27.24, s0=.7), z=12),
    el(f'<div class="dm" style="margin-left:auto"><div class="bub me typing">{dots2}</div></div>', 340, 476,
       K((25.72 - .002, {'o': 0, 's': .7}, 'lin'), (25.98, {'o': 1, 's': 1}, 'back'), (26.28, {'o': 1, 's': 1}, 'lin'), (26.38, {'o': 0, 's': .9}, 'in')),
       z=12, w=660, style='display:flex;justify-content:flex-end'),
    el('<div class="dm"><div class="bub me">@nairaflore ✨</div></div>', 340, 476, popk(26.40, 27.24, s0=.7), z=12, w=660, style='display:flex;justify-content:flex-end'),
    captions(lines),
    endwrap('end30', e, end30),
]
cue('dm', 24.55, kind='in'); cue('typing', 25.74, t1=26.34); cue('dm', 26.40, kind='out')
music_cue('riser', e, d=2.0, v=.7); music_cue('revcym', e, d=1.0, v=.6)
page('ad30v3', 30.0, shots30, ov30, bg=bg30, voice='vo30', vo=plan,
     flash=[{'t': 4.08, 'd': .22, 'a': .22}],
     leaks=[leak(4.06, 1, .7, .45, 860, 1000), leak(8.24, -1), leak(15.76, 1, .6, .35), leak(20.28, -1), leak(27.14, 1, .7, .55, 960, 1100)],
     music={'score': {'bpm': 93.5, 'anchor': 4.10, 'end': e,
                      'sections': [[0, 4.10, 'intro'], [4.10, 15.80, 'groove'], [15.80, 24.12, 'lift'], [24.12, 26.6, 'break'], [26.6, e, 'stop'], [e, 30.0, 'end']]},
            'song': {'name': 'd', 'file': 'songs/d_owner.wav', 'segs': [[0.0, 24.12, 17.849 - 4.10], [24.12, 30.0, -24.12]], 'drop': 4.10}})
