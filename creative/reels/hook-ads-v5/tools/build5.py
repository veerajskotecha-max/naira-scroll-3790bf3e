"""v5: three 10-15 s hook ads from the two creator videos, each built on one fun, native format and finished in the
brand's elegant system (ivory cards, sage type, blush accents, the flower iris into the end card).
- A, RING, "every time I wear this ring...": the first frame is the ring over her face under that line; two DMs pop
  as she says she was asked twice, one gets a heart; the price counts down; the two stones slide in side by side with a
  drawn "not equal" between them; she closes "you know it" as the reply "nairaflore.com" sends.
- B, RING, "guess the price": the price tag reads ?,??? in the first frame, spins like a slot machine while she says
  "So it's this ring from Naira" and lands digit by digit on "Naira"; the picture freezes on the two stones to name them;
  "on purpose." lands on "the whole point"; the end card leads with the price.
- C, PEARL, "the jewellery I swore I'd gatekeep...": opens on the 4K stud; a lock opens on her "gatekeep"; the two
  pieces with their prices; the bag does the maths; "both for 2,718".
Every number was checked live in Shopify on 2 Nov 2026 (see build4.py). Usage: python3.13 -I build5.py <S>"""
import json, math, os, re, sys
S = sys.argv[1]; A = f'{S}/ads'
FPS = 30
META = {d: {k: v for k, v in json.load(open(f'{A}/frames/{d}/meta.json')).items() if k in ('fps', 'n', 'sq')} for d in ('ana', 'lv', 'lv_ear')}
IMG = '../img'

# ---------- pieces (live 2 Nov) ----------
P = {
    'ring':  dict(nm='Halo Curve Ring', pr=1199, mrp=3419, img='ring2'),
    'studs': dict(nm='Pearl Point Studs', pr=1499, mrp=3139, img='studs'),
    'heart': dict(nm='Heartline Paperclip Necklace', pr=1899, mrp=3499, img='heart'),
}
for p in P.values(): p['off'] = round(100 * (p['mrp'] - p['pr']) / p['mrp'])
assert [P[k]['off'] for k in ('ring', 'studs', 'heart')] == [65, 52, 46]
PAIR = P['studs']['pr'] + P['heart']['pr']; PAIR20 = round(PAIR * .8)
assert (PAIR, PAIR20, PAIR - PAIR20) == (3398, 2718, 680)          # what the bag charges for the two, BUY2 20%

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
FLOWER_D = re.search(r' d="([^"]+)"', next(p for p in PATHS if 'FFBDA8' in p)).group(1)
FLOWER = [[round(float(v), 4) for xy in re.findall(r'([\-\d.]+)[ ,]([\-\d.]+)', sp) for v in xy] for sp in re.split(r'(?=M)', FLOWER_D)]
FLOWER = [sp for sp in FLOWER if len(sp) >= 6]
FLOWER_ORIGIN = '47.5% 58.3%'

ICON = {
    'check': '<path d="M5 12.5l4.4 4.4L19 7.2"/>',
    'spark': '<path d="M12 2.8l2 7.2 7.2 2-7.2 2-2 7.2-2-7.2-7.2-2 7.2-2z"/>',
    'truck': '<path d="M2.5 6.5h11v9.5h-11z"/><path d="M13.5 9.5h4.2l3.3 3.4V16h-7.5z"/><circle cx="6.5" cy="17.4" r="1.9"/><circle cx="17.2" cy="17.4" r="1.9"/>',
    'cash': '<path d="M2.5 6.5h19v11h-19z"/><circle cx="12" cy="12" r="2.7"/><path d="M5.5 9.5v5M18.5 9.5v5"/>',
    'swap': '<path d="M4 9h15l-3.6-3.6"/><path d="M20 15H5l3.6 3.6"/>',
    'shield': '<path d="M12 2.8l7.4 2.8v5.5c0 4.6-3.1 8.3-7.4 9.9-4.3-1.6-7.4-5.3-7.4-9.9V5.6z"/><path d="M8.7 12.1l2.3 2.3 4.4-4.6"/>',
    'medal': '<circle cx="12" cy="9.2" r="5.6"/><path d="M8.7 13.8L7.2 21l4.8-2.5 4.8 2.5-1.5-7.2"/>',
    'ring': '<circle cx="12" cy="14.5" r="6.3"/><path d="M9.2 4.6h5.6l1.6 2.4-4.4 3.4-4.4-3.4z"/>',
}
def icon(n, cls='ic24'): return f'<svg class="{cls}" viewBox="0 0 24 24">{ICON[n]}</svg>'

CUES, IRIS = [], []
def cue(name, t, **kw): CUES.append(dict(k=name, t=round(t, 3), **kw))
def music_cue(name, t, **kw): cue(name, t, music=1, **kw)        # skipped under a song, which has its own build
pan = lambda x: round(max(-1.0, min(1.0, (x - 540) / 540)) * .6, 2)

# ---------- keyframes ----------
def K(*fr): return json.dumps([[round(t, 4), p, e] for t, p, e in fr])
def wipe(t0, t1, d=.34, dx=-34, d_out=.2):
    return K((t0 - .002, {'o': 0, 'cl': 0, 'x': dx}, 'lin'), (t0, {'o': 1}, 'step'), (t0 + d, {'cl': 100, 'x': 0}, 'out'),
             (t1 - d_out, {'o': 1, 'x': 0}, 'lin'), (t1, {'o': 0, 'x': -40}, 'in'))
def rise(t0, t1, d=.42, dy=46, d_out=.2):
    return K((t0 - .002, {'o': 0, 'ct': 0, 'y': dy}, 'lin'), (t0, {'o': 1}, 'step'), (t0 + d, {'ct': 100, 'y': 0}, 'out'),
             (t1 - d_out, {'o': 1, 'y': 0}, 'lin'), (t1, {'o': 0, 'y': -26}, 'in'))
def popk(t0, t1, s0=.6, d=.3, d_out=.2):
    return K((t0 - .002, {'o': 0, 's': s0}, 'lin'), (t0 + d, {'o': 1, 's': 1}, 'back'), (t1 - d_out, {'o': 1, 's': 1}, 'lin'), (t1, {'o': 0, 's': .94}, 'in'))
def fadek(t0, t1, d=.28, d_out=.2, dy=20):
    return K((t0 - .002, {'o': 0, 'y': dy}, 'lin'), (t0 + d, {'o': 1, 'y': 0}, 'out'), (t1 - d_out, {'o': 1}, 'lin'), (t1, {'o': 0}, 'in'))
FOREVER = 99
def el(html, x, y, k, z=10, cls='', w=None, style=''):
    ws = f'width:{w}px;' if w else ''
    return f'<div class="o {cls}" style="left:{x:.0f}px;top:{y:.0f}px;{ws}z-index:{z};{style}" data-k=\'{k}\'>{html}</div>'
def centred(html, y, k, z=10, col=False):
    fl = 'flex-direction:column;align-items:center;' if col else 'justify-content:center;'
    return f'<div class="o" style="left:0;top:{y:.0f}px;width:1080px;display:flex;{fl}z-index:{z}" data-k=\'{k}\'>{html}</div>'

# ---------- where a piece is on screen: the engine's own zoom and crop applied to points read off the source frames ----------
def shot(id, t0, t1, **kw): s = {'id': id, 't0': t0, 't1': t1}; s.update(kw); return s
def zoom_at(sh, t):
    u = min(1, max(0, (t - sh['t0']) / (sh['t1'] - sh['t0']))); z = sh.get('zoom', [1, 1]); return z[0] + (z[1] - z[0]) * u
def to_out(sh, t, x, y):
    s = zoom_at(sh, t); return x * s - (s - 1) * 1080 * sh.get('ax', .5), y * s - (s - 1) * 1920 * sh.get('ay', .5)
def src_at(pts, lt):
    if lt <= pts[0][0]: return pts[0][1:]
    if lt >= pts[-1][0]: return pts[-1][1:]
    for a, b in zip(pts, pts[1:]):
        if lt <= b[0]: u = (lt - a[0]) / (b[0] - a[0]); return a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u
def at(sh, pts, t, dx=0, dy=0):
    x, y = src_at(pts, (t - sh['t0']) + sh.get('off', 0)); return to_out(sh, t, x + dx, y + dy)
def track(sh, pts, t0, t1, step=1 / 15):
    out, t = [], t0
    while t < t1 + 1e-6: x, y = at(sh, pts, t); out.append([round(t, 3), round(x, 1), round(y, 1)]); t += step
    return out

# source-frame positions (1080x1920), read off grid crops of the extracted frames; times are SOURCE seconds
TR = {
    'ring_hook': [(11.45, 444, 872), (11.60, 405, 868), (12.00, 384, 881), (12.55, 420, 860)],
    'ring_up': [(3.40, 631, 1240), (3.60, 563, 875), (3.80, 414, 641), (4.00, 443, 776), (4.20, 429, 763), (4.40, 347, 803),
                (4.60, 416, 836), (4.80, 387, 770), (5.00, 414, 781), (5.20, 452, 790), (5.40, 524, 785), (5.60, 549, 899)],
    'stud': [(5.40, 239, 1079), (5.60, 301, 1053), (5.80, 323, 1053), (6.00, 327, 1049), (6.20, 327, 1047), (6.40, 332, 1040)],
    'stud_ear': [(0.0, 465, 1197), (0.2, 609, 1164), (0.4, 660, 1140), (0.6, 660, 1140)],      # lv_ear: the 2x crop
    'neck': [(12.0, 392, 1300), (14.0, 400, 1310), (17.0, 396, 1312)],
}

# ---------- components ----------
STAR = ('<svg viewBox="-50 -50 100 100" width="100%" height="100%">'
        '<path d="M0 -50C3 -8 8 -3 50 0C8 3 3 8 0 50C-3 8 -8 3 -50 0C-8 -3 -3 -8 0 -50Z" fill="#FFFBF6"/>'
        '<path d="M0 -22C2 -4 4 -2 22 0C4 2 2 4 0 22C-2 4 -4 2 -22 0C-4 -2 -2 -4 0 -22Z" fill="#FFFBF6" transform="rotate(45)"/>'
        '<circle r="5" fill="#fff"/></svg>')
def glint(x, y, t, size=140, r=0, z=26):
    """silent: the owner asked for fewer "ting tings", so sparkles carry no sound"""
    k = K((t - .002, {'o': 0, 's': .12, 'r': r}, 'lin'), (t + .11, {'o': 1, 's': 1, 'r': r + 22}, 'out'), (t + .5, {'o': 0, 's': .3, 'r': r + 75}, 'in'))
    return f'<div class="o spark" style="left:{x - size / 2:.0f}px;top:{y - size / 2:.0f}px;width:{size}px;height:{size}px;z-index:{z}" data-k=\'{k}\'>{STAR}</div>'
def callout(frm, trk, t0, t1, z=11):
    data = {'from': [round(frm[0]), round(frm[1])], 'track': trk, 't0': t0, 't1': t1, 'r': 8}
    return f'<svg class="callout thin" width="1080" height="1920" style="z-index:{z}" data-callout=\'{att(data)}\'><line/><circle class="ring" r="0"/><circle class="dot" r="0"/></svg>'
def leak(t, side=1, d=.62, a=.45, y=760, r=900, c='rgba(255,198,160,A)'):
    x0, x1 = (-260, 1000) if side > 0 else (1340, 80)
    return {'t': t, 'd': d, 'x0': x0, 'x1': x1, 'y0': y - 160, 'y1': y + 160, 'r': r, 'a': a, 'c': c}

def pcard3(p, x, y, t_in, t_out, tag="She's wearing", count=True, z=13):
    """what she is wearing, with its listing photo; the price counts down from the MRP, then the MRP is struck"""
    if count:
        tc0 = t_in + .36; tc1 = tc0 + .5; t_m = tc1 + .02
        pr = f'<span class="pr" data-count=\'{att({"k": [[tc0, p["mrp"]], [tc1, p["pr"], "expo"]], "pre": "₹"})}\'>{RS(p["mrp"])}</span>'
        cue('tap', tc1, v=.45, pan=-.3)
    else:
        pr = f'<span class="pr">{RS(p["pr"])}</span>'; t_m = t_in + .3
    mrp = (f'<span class="oi mrp" data-k=\'{K((t_m - .002, {"o": 0, "x": -12}, "lin"), (t_m + .18, {"o": 1, "x": 0}, "out"))}\'>{RS(p["mrp"])}'
           f'<span class="o strike" data-k=\'{K((t_m + .08, {"w": 0}, "lin"), (t_m + .28, {"w": 108}, "out"))}\'></span></span>')
    off = f'<span class="oi off" data-k=\'{K((t_m + .2 - .002, {"o": 0, "s": .6}, "lin"), (t_m + .5, {"o": 1, "s": 1}, "back"))}\'>{p["off"]}% OFF</span>'
    shine = f'<div class="o shine" data-k=\'{K((t_m + .6, {"x": -220}, "lin"), (t_m + 1.1, {"x": 760}, "io"))}\'><i></i></div>'
    cue('swish', t_in, v=.7, pan=-.4)
    html = (f'<div class="pc3"><div class="bar"></div><img src="{IMG}/{p["img"]}.jpg"><div class="tx"><div class="tg">{tag}</div>'
            f'<div class="nm">{p["nm"]}</div><div class="row">{pr}{mrp}{off}</div></div>{shine}</div>')
    return el(html, x, y, wipe(t_in, t_out, d=.36), z=z)

def detail(img, x, y, size, t_in, t_out, labels, z=14):
    """the listing photo's detail in an ivory frame; each part named on its word, with a leader drawn from the part.
    labels: [(html, (u, v) on the photo, (lx, ly) label top-left on the page, t)]"""
    pad = 10
    k = K((t_in - .002, {'o': 0, 's': .9, 'y': 24}, 'lin'), (t_in + .36, {'o': 1, 's': 1, 'y': 0}, 'out'), (t_out - .2, {'o': 1}, 'lin'), (t_out, {'o': 0, 's': .97}, 'in'))
    out = el(f'<div class="det"><img src="{IMG}/{img}.jpg" style="width:{size}px;height:{size}px"><div class="lb">THE DETAIL</div></div>', x, y, k, z=z)
    cue('swish', t_in, v=.5, pan=-.3)
    for html, (u, v), (lx, ly), t in labels:
        px, py = x + pad + u * size, y + pad + v * size; ex, ey = lx - 4, ly + 25
        mx = px + (ex - px) * .55
        d = f'M{px:.0f} {py:.0f}C{mx:.0f} {py:.0f} {mx:.0f} {ey:.0f} {ex:.0f} {ey:.0f}'
        lk = K((t - .002, {'o': 0, 'd': 0}, 'lin'), (t, {'o': 1}, 'step'), (t + .34, {'d': 1}, 'out'), (t_out - .2, {'o': 1}, 'lin'), (t_out, {'o': 0}, 'in'))
        tk = K((t + .2 - .002, {'o': 0, 'x': -14}, 'lin'), (t + .46, {'o': 1, 'x': 0}, 'out'))
        out += (f'<div class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:{z + 1}" data-k=\'{lk}\'>'
                f'<svg class="ldr" width="1080" height="1920"><path class="draw" d="{d}"/><circle cx="{px:.0f}" cy="{py:.0f}" r="7"/></svg>'
                f'<div class="o lbl" style="left:{lx}px;top:{ly}px" data-k=\'{tk}\'>{html}</div></div>')
        cue('swish', t + .2, v=.25, pan=.3)
    return out

def strip(items, x, y, t_out, z=12):
    """trust facts on an ivory strip, each fading in on its word"""
    t0 = items[0][2]; cue('swish', t0 - .04, v=.3, pan=-.3)
    inner = ''.join(f'<div class="o" style="position:relative" data-k=\'{K((t - .002, {"o": 0, "y": 12}, "lin"), (t + .26, {"o": 1, "y": 0}, "out"))}\'>{icon(i)}<span>{txt}</span></div>'
                    for i, txt, t in items)
    return el(f'<div class="trust" style="background:rgba(251,243,236,.96);padding:14px 24px;box-shadow:0 12px 30px rgba(26,22,20,.24);gap:26px;font-size:27px;width:max-content">{inner}</div>',
              x, y, wipe(t0 - .08, t_out, d=.3), z=z)
def chip(txt, ic, x, y, t_in, t_out, z=12):
    ik = K((t_in + .1, {'s': .2, 'r': -40}, 'lin'), (t_in + .42, {'s': 1, 'r': 0}, 'back'))
    cue('swish', t_in, v=.55, pan=-.4)
    return el(f'<div class="chip2"><div class="ic oi" data-k=\'{ik}\'>{icon(ic)}</div><span>{txt}</span></div>', x, y, wipe(t_in, t_out, d=.3), z=z)
def kicker(txt, y, t0, t1, x=64, z=14):
    return el(f'<div class="kick">{txt}</div>', x, y, wipe(t0, t1, d=.3, dx=-20), z=z)
def dm(txt, x, y, k, me=False, z=12, w=None):
    st = 'display:flex;justify-content:flex-end' if me else ''
    return el(f'<div class="dm"{" style=margin-left:auto" if me else ""}>{"" if me else "<div class=av></div>"}<div class="bub{" me" if me else ""}">{txt}</div></div>', x, y, k, z=z, w=w, style=st)
def dmk(t0, t1, s0=.7):
    return K((t0 - .002, {'o': 0, 's': s0, 'y': 18}, 'lin'), (t0 + .3, {'o': 1, 's': 1, 'y': 0}, 'back'), (t1 - .16, {'o': 1, 's': 1, 'y': 0}, 'lin'), (t1, {'o': 0, 's': .86, 'y': -30}, 'in'))
def typing(x, y, t0, t1, me=True, z=12, w=None):
    dots = ''.join(f'<i data-bob=\'{att({"t0": t0, "t1": t1, "p": .62, "a": 9, "ph": i * .9})}\'></i>' for i in range(3))
    k = K((t0 - .002, {'o': 0, 's': .7}, 'lin'), (t0 + .26, {'o': 1, 's': 1}, 'back'), (t1 - .1, {'o': 1, 's': 1}, 'lin'), (t1, {'o': 0, 's': .9}, 'in'))
    st = 'display:flex;justify-content:flex-end' if me else ''
    return el(f'<div class="dm"><div class="bub{" me" if me else ""} typing">{dots}</div></div>', x, y, k, z=z, w=w, style=st)

# ---------- end card: opens through the flower ----------
def endwrap(eid, t0, inner):
    IRIS.append({'el': eid, 't0': t0, 's0': 430, 's1': 560, 's2': 21000, 'tp': .17, 'th': .27, 'tz': .64,
                 'cx': .5102, 'cy': .1638, 'ox': 540, 'oy': 960, 'r0': -14, 'rim': 18})
    cue('boom', t0, v=.7); cue('bloom', t0); cue('dive', t0 + .27, t1=t0 + .64, v=.75)
    k = K((t0 - .002, {'o': 0}, 'lin'), (t0, {'o': 1}, 'step'))
    return f'<div id="{eid}" class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:40" data-k=\'{k}\'><div class="endc"></div>{inner}</div>'
def endlogo(x, y, w, t):
    lk = K((t - .002, {'o': 0, 'ct': 0, 'y': 26}, 'lin'), (t, {'o': 1}, 'step'), (t + .44, {'ct': 100, 'y': 0}, 'out'))
    fk = K((t + .14 - .002, {'o': 0, 's': .2, 'r': -60}, 'lin'), (t + .52, {'o': 1, 's': 1, 'r': 0}, 'back'))
    cue('swish', t, v=.4)
    return (f'<div class="o" style="left:{x}px;top:{y}px;width:{w}px;z-index:3" data-k=\'{lk}\'>{logo(part="letters")}</div>'
            f'<div class="o" style="left:{x}px;top:{y}px;width:{w}px;z-index:4;transform-origin:{FLOWER_ORIGIN}" data-k=\'{fk}\'>{logo(part="flower")}</div>')
def cta(y, t, taps, text='SHOP NOW'):
    press = [(t - .002, {'o': 0, 's': .6}, 'lin'), (t + .32, {'o': 1, 's': 1}, 'back')]
    for tp in taps: press += [(tp, {'s': 1}, 'lin'), (tp + .07, {'s': .94}, 'out'), (tp + .24, {'s': 1}, 'back')]
    sh = K((t + .55, {'x': -200}, 'lin'), (t + 1.0, {'x': 640}, 'io'))
    out = centred(f'<div class="cta2">{text}<div class="o shine" data-k=\'{sh}\'><i></i></div></div>', y, K(*press), z=5)
    for tp in taps:
        rk = K((tp - .002, {'o': 0, 's': .3}, 'lin'), (tp + .02, {'o': .95}, 'lin'), (tp + .56, {'o': 0, 's': 2.1}, 'out'))
        out += f'<div class="o ripple" style="left:470px;top:{y + 50 - 70}px;z-index:6" data-k=\'{rk}\'></div>'
        cue('tap', tp)
    return out
TRUST = (('medal', '3-year plating guarantee'), ('truck', 'Free shipping'), ('cash', 'Cash on delivery'))
def trust(y, t, items=TRUST):
    return centred('<div class="trust">' + ''.join(f'<div>{icon(i)}<span>{s}</span></div>' for i, s in items) + '</div>', y, fadek(t, FOREVER), z=4)
def struck(n, t, cls='endmrp'):
    return (f'<span class="{cls}" style="position:relative;display:inline-block">{RS(n)}'
            f'<span class="o strike" data-k=\'{K((t, {"w": 0}, "lin"), (t + .2, {"w": 108}, "out"))}\'></span></span>')
def care(y, t, txt='PVD coated · a lifetime of wear, with care'):
    return centred(f'<div class="care">{txt}</div>', y, fadek(t, FOREVER), z=4)
OFFER = '<div class="endh" style="font-size:48px">pick any 2 · <b>20% off</b> &nbsp;·&nbsp; any 3 · <b>30% off</b></div>'

def bag(x, y, t_in, t_out, drops, fills, nodes, tot_on, now_k, labels, was_on, was_sw, strike_t, save_t, save_sw, save_xy):
    """the bag fills as the pieces drop in; the ladder lights the rung; the total counts to what the bag charges"""
    slots = ''
    for i, (n, t) in enumerate(drops):
        k = K((t - .002, {'o': 0, 'y': -110, 's': .7}, 'lin'), (t + .06, {'o': 1}, 'out'), (t + .36, {'y': 0, 's': 1}, 'back'))
        slots += f'<div class="slot"><img class="o" src="{IMG}/{P[n]["img"]}.jpg" data-k=\'{k}\'></div>'
        cue('drop', t + .2, v=.75)
    def node(pos, t, label, right=False):
        if t < FOREVER: cue('tap', t + .05, v=.45)
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
    cue('swish', t_in, v=.7, pan=-.3)
    sk = K((save_t - .002, {'o': 0, 'cl': 0, 'x': -14}, 'lin'), (save_t, {'o': 1}, 'step'), (save_t + .32, {'cl': 100, 'x': 0}, 'out'),
           (t_out - .2, {'o': 1}, 'lin'), (t_out, {'o': 0}, 'in'))
    cue('tap', save_t + .12, v=.5)
    return (el(inner, x, y, wipe(t_in, t_out, d=.36), z=12)
            + el(f'<div class="save" data-swap=\'{att(save_sw)}\'></div>', save_xy[0], save_xy[1], sk, z=15))

# ---------- voice: picture and sound are cut together, so one list drives both ----------
def cut(segs, voice, words):
    """segs: [(src0, src1, at)] continuous; returns the vo plan and caption lines from word times in source seconds.
    words: [[(word, w0, w1[, emphasis]) ...] per caption line]"""
    plan = [{'src0': a, 'src1': b, 'at': t, 'file': voice} for a, b, t in segs]
    def to_ad(ts):
        for a, b, t in segs:
            if a - 1e-6 <= ts <= b + 1e-6: return t + ts - a
        raise ValueError(ts)
    lines = []
    for ln in words:
        ws = [[round(to_ad(w[1]), 3), round(to_ad(w[2]), 3), w[0], 1 if len(w) > 3 else 0] for w in ln]
        lines.append({'t0': ws[0][0], 't1': ws[-1][1], 'w': ws})
    return plan, lines, to_ad
def captions(lines, y):
    return f'<div class="cap2" style="top:{y}px;z-index:30" data-lines=\'{att(lines)}\'></div>'

def page(name, dur, shots, overlays, flash=(), dim=(), fblur=(), leaks=(), voice=None, vo=None, music=None):
    data = {'fps': FPS, 'dur': dur, 'frames': '../frames', 'meta': META, 'shots': shots, 'bg': [], 'flash': list(flash),
            'dim': list(dim), 'fblur': list(fblur), 'leaks': list(leaks), 'iris': IRIS, 'flower': FLOWER}
    html = f'''<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face {{ font-family:CG; src:url('{S}/fonts/CG.ttf'); font-weight:300 700; }}
@font-face {{ font-family:CG; font-style:italic; src:url('{S}/fonts/CG-Italic.ttf'); font-weight:300 700; }}
@font-face {{ font-family:Jost; src:url('{S}/fonts/Jost.ttf'); font-weight:100 900; }}
</style>
<link rel="stylesheet" href="../engine/base5.css"></head><body>
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


# ================================ v5: the short hook ads ================================
def callout(frm, trk, t0, t1, z=11, line=True):
    """v5: line=False keeps only the pulsing dot, for a piece that moves away from where the dot started"""
    data = {'from': [round(frm[0]), round(frm[1])], 'track': trk, 't0': t0, 't1': t1, 'r': 8}
    return f'<svg class="callout thin{"" if line else " dotonly"}" width="1080" height="1920" style="z-index:{z}" data-callout=\'{att(data)}\'><line/><circle class="ring" r="0"/><circle class="dot" r="0"/></svg>'
def at(sh, pts, t, dx=0, dy=0):
    """v5: honours a shot's speed, so a freeze (speed 0) holds its point"""
    x, y = src_at(pts, (t - sh['t0']) * sh.get('speed', 1) + sh.get('off', 0)); return to_out(sh, t, x + dx, y + dy)
TR['crystal785'] = [(7.85, 509, 869)]            # the freeze frame: both stones, read off the 7.85 s grid crop
TR['tiger785'] = [(7.85, 565, 894)]

def hook_text(lines, x, y, size, t_out, z=16):
    """the first frame's line: already there at 0 s, the frame Meta may show still; it leaves as the story starts"""
    k = K((-1, {'o': 1, 'y': 0, 's': 1}, 'lin'), (t_out - .24, {'o': 1, 'y': 0, 's': 1.015}, 'lin'), (t_out, {'o': 0, 'y': -34, 's': 1.015}, 'in'))
    return el(f'<div class="hook" style="font-size:{size}px">{"<br>".join(lines)}</div>', x, y, k, z=z, style='transform-origin:0 0')
def react(x, y, t, t_out, emoji='❤️', z=13):
    """a heart on the message, the way Instagram shows it"""
    cue('pop', t, v=.6)
    k = K((t - .002, {'o': 0, 's': .2}, 'lin'), (t + .3, {'o': 1, 's': 1}, 'back'), (t_out - .16, {'o': 1, 's': 1}, 'lin'), (t_out, {'o': 0, 's': .8}, 'in'))
    return el(f'<div class="react">{emoji}</div>', x, y, k, z=z)
def head_line(html, x, y, size, t_in, t_out, cls='hook', z=15, d=.42):
    return el(f'<div class="{cls}" style="font-size:{size}px">{html}</div>', x, y, rise(t_in, t_out, d=d), z=z)

def slot_price(x, y, label, digits, t_spin, lands, t_out, mrp, t_mrp, z=14):
    """the price as a slot machine: ? until it spins, every digit landing on its own beat, then the MRP struck beside it"""
    H, cols, j = 132, '', 0
    for ch in digits:
        if not ch.isdigit(): cols += f'<span>{ch}</span>'; continue
        cells = ['?'] + [str(i % 10) for i in range(10 * (2 + j))] + [ch]
        n = len(cells) - 1; land = lands[j]
        k = K((t_spin - .002, {'y': 0, 'b': 0}, 'lin'), (t_spin + .25, {'y': -H * 3, 'b': 5}, 'in'), (land - .08, {'y': -H * (n - .35), 'b': 1.2}, 'out'),
              (land, {'y': -H * n, 'b': 0}, 'out'))
        cols += f'<span class="col"><span class="oi strip" style="display:block" data-k=\'{k}\'>' + ''.join(f'<span class="cell">{c}</span>' for c in cells) + '</span></span>'
        cue('clack', land, v=.55 + .1 * j); j += 1
    cue('roll', t_spin, t1=lands[-1])
    mk = K((t_mrp - .002, {'o': 0, 'x': -14}, 'lin'), (t_mrp + .2, {'o': 1, 'x': 0}, 'out'))
    mrp_html = (f'<span class="oi mrp2" data-k=\'{mk}\'>{RS(mrp)}<span class="o strike" data-k=\'{K((t_mrp + .1, {"w": 0}, "lin"), (t_mrp + .3, {"w": 108}, "out"))}\'></span></span>')
    html = f'<div class="ptag"><div class="bar"></div><div class="lb">{label}</div><div class="pz"><span>₹</span>{cols}{mrp_html}</div></div>'
    k = K((-1, {'o': 1, 's': 1}, 'lin'), (t_out - .2, {'o': 1, 's': 1}, 'lin'), (t_out, {'o': 0, 's': .96}, 'in'))
    return el(html, x, y, k, z=z)

def twin(t_in, t_out, y=300, z=14):
    """the two stones side by side, a not-equal sign drawn between them: "they don't actually match" """
    out = ''
    for img, x, dx in (('stone_tiger', 90, -150), ('stone_crystal', 670, 150)):
        k = K((t_in - .002, {'o': 0, 'x': dx, 'r': -5 if dx < 0 else 5}, 'lin'), (t_in + .44, {'o': 1, 'x': 0, 'r': 0}, 'out'),
              (t_out - .2, {'o': 1, 'x': 0}, 'lin'), (t_out, {'o': 0, 'x': dx / 3}, 'in'))
        out += el(f'<div class="tw"><img src="{IMG}/{img}.jpg"></div>', x, y, k, z=z)
    nk = K((t_in + .32 - .002, {'o': 0, 'd': 0, 's': .7}, 'lin'), (t_in + .32, {'o': 1}, 'step'), (t_in + .74, {'d': 1, 's': 1}, 'out'),
           (t_out - .2, {'o': 1}, 'lin'), (t_out, {'o': 0}, 'in'))
    neq = ('<svg class="neq" width="120" height="120" viewBox="0 0 120 120"><path class="draw" d="M14 46H106"/>'
           '<path class="draw" d="M14 78H106"/><path class="draw" d="M86 12L34 108"/></svg>')
    out += el(neq, 480, y + 100, nk, z=z + 1)
    for name, cx, t in (('natural tiger eye', 250, t_in + .5), ('champagne crystal', 830, t_in + .66)):
        tk = K((t - .002, {'o': 0, 'y': 16}, 'lin'), (t + .3, {'o': 1, 'y': 0}, 'out'), (t_out - .2, {'o': 1}, 'lin'), (t_out, {'o': 0}, 'in'))
        out += el(f'<div class="tname" style="width:420px">{name}</div>', cx - 210, y + 334, tk, z=z)
    cue('swish', t_in, v=.5, pan=-.4); cue('swish', t_in + .04, v=.5, pan=.4); cue('swish', t_in + .32, v=.3)
    return out

def lock_pill(x, y, t_in, t_open, t_swap, t_out, z=14):
    """GATEKEEPING, locked; on her word the shackle swings open, the word is struck, and it turns to "not anymore." """
    shk = K((t_open - .002, {'y': 0, 'r': 0}, 'lin'), (t_open + .3, {'y': -7, 'r': 30}, 'back'))
    lk = ('<div class="lk"><svg viewBox="0 0 24 24"><path d="M5 11h14v10H5z"/><path d="M12 15v2.6"/></svg>'
          f'<div class="o" style="left:0;top:0;width:58px;height:58px;transform-origin:61.5% 47%" data-k=\'{shk}\'>'
          '<svg viewBox="0 0 24 24"><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/></svg></div></div>')
    sk = K((t_open + .06, {'w': 0, 'o': 1}, 'lin'), (t_open + .3, {'w': 106}, 'out'), (t_swap - .02, {'o': 1}, 'lin'), (t_swap, {'o': 0}, 'lin'))
    sw = att([[0, 'gatekeeping'], [t_swap, '<i>not anymore.</i>']])
    html = f'<div class="lockp">{lk}<div class="tx"><span data-swap=\'{sw}\'></span><span class="o strike" data-k=\'{sk}\'></span></div></div>'
    cue('swish', t_in, v=.45, pan=.4); cue('unlock', t_open, v=.8, pan=.4); cue('tap', t_swap, v=.4, pan=.4)
    k = K((t_in - .002, {'o': 0, 'cl': 0, 'x': 24, 's': 1}, 'lin'), (t_in, {'o': 1}, 'step'), (t_in + .3, {'cl': 100, 'x': 0}, 'out'),
          (t_open, {'s': 1}, 'lin'), (t_open + .12, {'s': 1.07}, 'out'), (t_open + .4, {'s': 1}, 'back'), (t_out - .2, {'o': 1, 'x': 0}, 'lin'), (t_out, {'o': 0, 'x': 40}, 'in'))
    return el(html, x, y, k, z=z)

def freeze_labels(sh, t0, t1, z=14):
    """the frozen frame: each stone named, a leader from its label to the stone"""
    out = ''
    for name, pts, (lx, ly), t in (('champagne <b>crystal</b>', TR['crystal785'], (64, 640), t0 + .18),
                                   ('natural <b>tiger eye</b>', TR['tiger785'], (620, 1040), t0 + .36)):
        frm = (lx + 380, ly + 26) if lx < 300 else (lx, ly + 26)
        out += callout(frm, track(sh, pts, t, t1), t, t1 - .04, z=z)
        tk = K((t + .12 - .002, {'o': 0, 'x': -14 if lx < 300 else 14}, 'lin'), (t + .4, {'o': 1, 'x': 0}, 'out'), (t1 - .16, {'o': 1}, 'lin'), (t1, {'o': 0}, 'in'))
        out += el(f'<div class="lbl">{name}</div>', lx, ly, tk, z=z + 1)
        cue('swish', t + .12, v=.3, pan=-.3 if lx < 300 else .3)
    return out

# ---------- A: RING, "every time I wear this ring..." ----------
CUES, IRIS = [], []
SEGA = [(0.00, 3.06, 0.00), (3.26, 6.30, 3.06), (7.47, 9.44, 6.10), (37.86, 39.98, 8.07), (40.42, 41.20, 10.19)]
for (a0, b0, t0), (a1, b1, t1) in zip(SEGA, SEGA[1:]): assert abs(t0 + b0 - a0 - t1) < 1e-6, (t0, t1)
RING_LINES = {
    'asked': [('Someone', 0.00, 0.48), ('actually', 0.48, 0.80), ('asked', 0.80, 1.08), ('me', 1.08, 1.24)],
    'where': [('where', 1.24, 1.40), ('this', 1.40, 1.62), ('is', 1.62, 1.74), ('from', 1.74, 2.00)],
    'twice': [('twice', 2.00, 2.40, 1), ('this', 2.40, 2.70), ('week.', 2.70, 3.00)],
    'ring': [('So', 3.36, 3.56), ("it's", 3.56, 3.78), ('this', 3.78, 4.00), ('ring', 4.00, 4.22)],
    'naira': [('from', 4.22, 4.50), ('Naira.', 4.50, 4.98, 1)],
    'stones': [('It', 5.16, 5.32), ('has', 5.32, 5.50), ('two', 5.50, 5.76, 1), ('stones,', 5.76, 6.14)],
    'love': [('and', 7.54, 7.64), ('I', 7.64, 7.76), ('love', 7.76, 7.88), ('that', 7.88, 8.08)],
    'match': [('they', 8.08, 8.24), ("don't", 8.24, 8.50), ('actually', 8.50, 8.86), ('match.', 8.86, 9.26, 1)],
    'point': [("That's", 9.64, 10.04), ('kind', 10.04, 10.20), ('of', 10.20, 10.32), ('the', 10.32, 10.44), ('whole', 10.44, 10.66), ('point.', 10.66, 11.02, 1)],
    'asks': [('So', 37.92, 38.10), ('now', 38.10, 38.38), ('if', 38.38, 38.54), ('someone', 38.54, 38.78), ('asks', 38.78, 39.08), ('you', 39.08, 39.24)],
    'fromq': [('where', 39.24, 39.40), ('this', 39.40, 39.52), ('is', 39.52, 39.66), ('from,', 39.66, 39.90)],
    'know': [('you', 40.50, 40.64), ('know', 40.64, 40.80, 1), ('it.', 40.80, 41.06)],
}
planA, linesA, AA = cut(SEGA, 'ana', [RING_LINES[k] for k in ('asked', 'where', 'twice', 'ring', 'naira', 'stones', 'love', 'match', 'asks', 'fromq', 'know')])
e = 10.97; DUR = 13.2
shotsA = [
    shot('ana', 0.00, 1.10, off=11.45, zoom=[1.08, 1.10], ax=.40, ay=.45),
    shot('ana', 1.10, 3.06, off=1.10, zoom=[1.0, 1.03]),
    shot('ana', 3.06, 6.10, off=3.26, zoom=[1.05, 1.08], ax=.42, ay=.45),
    shot('ana', 6.10, 8.07, off=7.47, zoom=[1.0, 1.03]),
    shot('ana', 8.07, 10.19, off=37.86, zoom=[1.05, 1.06]),
    shot('ana', 10.19, e + .7, off=40.42, zoom=[1.0, 1.02]),
]
cue('dm', 0.45, kind='in'); cue('dm', 1.94, kind='in')
endA = (endlogo(250, 236, 580, e + .5)
        + el(f'<img src="{IMG}/ring2.jpg" style="width:500px;height:500px;object-fit:cover;display:block;box-shadow:0 18px 40px rgba(26,22,20,.16)">',
             290, 392, K((e + .42 - .002, {'o': 0, 's': 1.06}, 'lin'), (e + .9, {'o': 1, 's': 1}, 'out')), z=2)
        + glint(290 + 317, 392 + 300, e + 1.35, 120)
        + centred(f'<div style="display:flex;align-items:baseline;gap:16px"><span class="endname">{P["ring"]["nm"]}</span>'
                  f'<span class="endpr">{RS(P["ring"]["pr"])}</span>{struck(P["ring"]["mrp"], e + 1.0)}</div>', 910, fadek(e + .7, FOREVER), z=4)
        + centred(OFFER, 990, rise(e + .82, FOREVER), z=4)
        + cta(1070, e + .95, [e + 1.75])
        + trust(1190, e + 1.1)
        + centred('<div class="url">nairaflore.com</div>', 1236, fadek(e + 1.2, FOREVER), z=4))
ovA = [
    hook_text(['every time I', 'wear this ring…'], 64, 268, 104, 1.08),
    dm('where is this from??', 64, 520, K((0.45 - .002, {'o': 0, 's': .7, 'y': 18}, 'lin'), (0.75, {'o': 1, 's': 1, 'y': 0}, 'back'), (1.06, {'y': 0}, 'lin'),
                                          (1.42, {'y': -228}, 'io'), (2.82, {'o': 1, 'y': -228, 's': 1}, 'lin'), (2.98, {'o': 0, 's': .86, 'y': -258}, 'in'))),
    dm('ok but WHERE is it from 😭', 64, 420, dmk(1.94, 2.98)),
    react(744, 486, 2.44, 2.98),
    glint(*at(shotsA[0], TR['ring_hook'], 0.30, -20, -14), 0.30, 130),
    pcard3(P['ring'], 64, 300, 3.40, 5.20),
    callout((236, 486), track(shotsA[2], TR['ring_up'], 3.62, 5.20), 3.64, 5.16),
    twin(AA(5.48), 7.98),
    centred('<div class="hook" style="font-size:84px">on purpose.</div>', 698, popk(AA(8.90), 7.98, s0=.8), z=15),
    dm('where is this from??', 64, 292, dmk(AA(38.54), e + .1)),
    typing(340, 420, AA(39.30), AA(40.42) + .02, w=676),
    dm('nairaflore.com ✨', 340, 420, dmk(AA(40.48), e + .1), me=True, w=676),
    react(548, 490, AA(40.86), e + .1),
    captions(linesA, 1112),
    endwrap('endA', e, endA),
]
cue('dm', AA(38.54), kind='in'); cue('typing', AA(39.30), t1=AA(40.44)); cue('dm', AA(40.48), kind='out'); cue('tap', AA(8.90) + .05, v=.4)
music_cue('riser', e, d=1.0, v=.6); music_cue('revcym', e, d=.7, v=.5)
page('hookA', DUR, shotsA, ovA, voice='ana', vo=planA,
     leaks=[leak(3.02, 1, .6, .35), leak(e - .06, 1, .7, .5, 960, 1100)],
     music={'bed_lufs': -20.0, 'duck_db': 8.0,
            'score': {'bpm': 104, 'anchor': 3.06, 'end': e, 'sections': [[0, 3.06, 'intro'], [3.06, 10.7, 'groove'], [10.7, e, 'stop'], [e, DUR, 'end']]},
            'song': {'name': 'd', 'file': 'songs/d_owner.wav', 'segs': [[0.0, DUR, 17.849 - 3.06]], 'drop': 3.06}})

# ---------- B: RING, "guess the price" ----------
CUES, IRIS = [], []
SEGB = [(3.30, 6.30, 1.30), (7.47, 9.44, 5.50), (9.56, 11.25, 7.47)]       # 0-1.3 is music only; 4.3-5.5 is the freeze
planB, linesB, BB = cut(SEGB, 'ana', [RING_LINES[k] for k in ('ring', 'naira', 'stones', 'love', 'match', 'point')])
e = 9.16; DUR = 11.5
shotsB = [
    shot('ana', 0.00, 1.30, off=11.45, zoom=[1.10, 1.14], ax=.40, ay=.45),
    shot('ana', 1.30, 4.30, off=3.30, zoom=[1.05, 1.08], ax=.42, ay=.45),
    shot('ana', 4.30, 5.50, off=7.85, speed=1e-6, zoom=[1.14, 1.26], ax=.49, ay=.42),     # the engine reads speed 0 as 1
    shot('ana', 5.50, 7.47, off=7.47, zoom=[1.0, 1.03]),
    shot('ana', 7.47, e + .7, off=9.56, zoom=[1.05, 1.07]),
]
cue('freeze', 4.30, v=.8); cue('air', 4.30, t1=5.4, v=.5); cue('whoosh', 5.50, dir=-1, v=.35)
endB = (endlogo(250, 236, 580, e + .5)
        + el(f'<img src="{IMG}/ring2.jpg" style="width:380px;height:380px;object-fit:cover;display:block;box-shadow:0 18px 40px rgba(26,22,20,.16)">',
             350, 384, K((e + .42 - .002, {'o': 0, 's': 1.06}, 'lin'), (e + .9, {'o': 1, 's': 1}, 'out')), z=2)
        + centred(f'<div style="display:flex;align-items:baseline;gap:22px"><span class="endbig">{RS(P["ring"]["pr"])}</span>{struck(P["ring"]["mrp"], e + 1.0)}</div>',
                  790, fadek(e + .6, FOREVER), z=4)
        + centred('<div class="endname">Halo Curve Ring · adjustable</div>', 950, fadek(e + .75, FOREVER), z=4)
        + centred(OFFER, 1022, rise(e + .85, FOREVER), z=4)
        + cta(1100, e + .95, [e + 1.75])
        + trust(1218, e + 1.1)
        + centred('<div class="url">nairaflore.com</div>', 1262, fadek(e + 1.2, FOREVER), z=4))
ovB = [
    hook_text(['guess the price 👀'], 64, 262, 112, 4.30),
    slot_price(64, 410, 'Halo Curve Ring', '1,199', 1.55, [2.50, 2.66, 2.82, 2.98], 4.30, P['ring']['mrp'], 3.08),
    el('<div class="stamp2">65% OFF</div>', 640, 382, K((3.30 - .002, {'o': 0, 'y': -26, 's': 1.08}, 'lin'), (3.62, {'o': 1, 'y': 0, 's': 1}, 'out'), (4.12, {'o': 1}, 'lin'), (4.30, {'o': 0}, 'in')), z=16),
    head_line('yes, really.', 64, 628, 66, 3.42, 4.30),
    callout(at(shotsB[1], TR['ring_up'], 1.62), track(shotsB[1], TR['ring_up'], 1.62, 3.40), 1.64, 3.36, line=False),
    head_line('two stones.', 64, 262, 104, 4.42, 5.48),
    freeze_labels(shotsB[2], 4.30, 5.50),
    centred('<div class="kick" style="font-size:30px">they don’t match</div>', 300, popk(BB(8.24), 7.40), z=15),
    el('<div class="wall" style="font-size:132px;font-weight:600;text-shadow:0 0 26px rgba(251,243,236,1),0 0 10px rgba(251,243,236,.95),0 0 3px rgba(251,243,236,.95)">on purpose.</div>',
       64, 336, rise(BB(10.44), e + .02, d=.46), z=13),
    captions(linesB, 1112),
    endwrap('endB', e, endB),
]
cue('swish', 0.0, v=.3); cue('tap', 3.30 + .1, v=.5); cue('swish', 3.42, v=.3); cue('tap', BB(10.66) + .05, v=.4)
music_cue('riser', e, d=1.0, v=.6); music_cue('revcym', e, d=.7, v=.5)
page('hookB', DUR, shotsB, ovB, voice='ana', vo=planB, flash=[{'t': 4.30, 'd': .22, 'a': .55}],
     leaks=[leak(1.26, 1, .6, .35), leak(e - .06, 1, .7, .5, 960, 1100)],
     music={'bed_lufs': -20.0, 'duck_db': 8.0,
            'score': {'bpm': 104, 'anchor': 1.30, 'end': e,
                      'sections': [[0, 1.30, 'intro'], [1.30, 4.30, 'groove'], [4.30, 5.50, 'break'], [5.50, 8.9, 'lift'], [8.9, e, 'stop'], [e, DUR, 'end']]},
            'song': {'name': 'grwm', 'file': 'songs/grwm.wav', 'segs': [[0.0, DUR, 8.63 - 2.98]], 'drop': 2.98}})

# ---------- C: PEARL, "the jewellery I swore I'd gatekeep..." ----------
CUES, IRIS = [], []
SEGC = [(0.00, 2.80, 0.00),                  # Guys, I think I found my favourite jewellery pieces   (0-1.05 over the 4K stud)
        (3.66, 5.20, 2.80),                  # I'm not going to gatekeep them.
        (5.75, 7.45, 4.34),                  # look at these earrings.
        (12.03, 13.15, 6.04),                # And this necklace,
        (14.91, 16.74, 7.16),                # so delicate and sparkly.
        (21.62, 24.00, 8.99)]                # I think I'm definitely going to wear these on repeat.
for (a0, b0, t0), (a1, b1, t1) in zip(SEGC, SEGC[1:]): assert abs(t0 + b0 - a0 - t1) < 1e-6, (t0, t1)
planC, _, CC = cut(SEGC, 'lvv', [])
e = 11.37; DUR = 13.7
shotsC = [
    shot('lv_ear', 0.00, 1.05, off=0.0, zoom=[1.0, 1.06], ax=.55, ay=.62),
    shot('lv', 1.05, 2.80, off=1.05, zoom=[1.0, 1.02]),
    shot('lv', 2.80, 4.34, off=3.66, zoom=[1.05, 1.07]),
    shot('lv', 4.34, 6.04, off=5.75, zoom=[1.04, 1.06], ax=.3, ay=.55),
    shot('lv', 6.04, 7.16, off=12.03, zoom=[1.0, 1.02], ax=.4, ay=.6),
    shot('lv', 7.16, 8.99, off=14.91, zoom=[1.05, 1.07], ax=.4, ay=.6),
    shot('lv', 8.99, e + .7, off=21.62, zoom=[1.0, 1.03]),
]
cue('whoosh', 1.05, dir=1, v=.4)
endC = (endlogo(250, 236, 580, e + .5)
        + el(f'<div class="endpair"><img src="{IMG}/studs.jpg"><img src="{IMG}/heart.jpg"></div>', 126, 392,
             K((e + .42 - .002, {'o': 0, 's': 1.05}, 'lin'), (e + .9, {'o': 1, 's': 1}, 'out')), z=2)
        + glint(126 + 200, 392 + 190, e + 1.35, 110)
        + centred(f'<div style="display:flex;align-items:baseline;gap:16px"><span class="endname">both for</span>'
                  f'<span class="endpr">{RS(PAIR20)}</span>{struck(PAIR, e + 1.0)}</div>', 830, fadek(e + .7, FOREVER), z=4)
        + centred(OFFER, 916, rise(e + .82, FOREVER), z=4)
        + cta(1000, e + .95, [e + 1.75])
        + trust(1120, e + 1.1)
        + centred('<div class="url">nairaflore.com</div>', 1166, fadek(e + 1.2, FOREVER), z=4))
ovC = [
    hook_text(['the jewellery I', 'swore I’d gatekeep…'], 64, 268, 100, 1.02),
    glint(*at(shotsC[0], TR['stud_ear'], 0.50, 10, -6), 0.50, 150),
    lock_pill(646, 696, CC(3.70), CC(4.52) + .02, CC(4.52) + .34, 4.30),
    pcard3(P['studs'], 64, 300, CC(5.84) - .1, 5.98),
    callout((236, 486), track(shotsC[3], TR['stud'], CC(5.80), CC(6.42)), CC(5.80), CC(6.42)),
    pcard3(P['heart'], 64, 292, CC(12.06), 8.95),
    callout(at(shotsC[4], TR['neck'], CC(12.30)), track(shotsC[4], TR['neck'], CC(12.30), 7.14), CC(12.32), 7.12, line=False),
    callout(at(shotsC[5], TR['neck'], 7.20), track(shotsC[5], TR['neck'], 7.20, 8.90), 7.22, 8.88, line=False),
    glint(*at(shotsC[5], TR['neck'], CC(16.10), -70, -2), CC(16.10), 100),
    glint(*at(shotsC[5], TR['neck'], CC(16.34), 70, -8), CC(16.34), 90),
    bag(100, 360, 9.04, e - .04,
        drops=[('studs', 9.20), ('heart', 9.50)],
        fills=[(9.20, {'w': 0}, 'lin'), (9.44, {'w': 33.33}, 'out'), (9.50, {'w': 33.33}, 'lin'), (9.82, {'w': 66.67}, 'out')],
        nodes=[9.86, FOREVER], tot_on=9.20,
        now_k={'k': [[9.20, P['studs']['pr']], [9.50, P['studs']['pr']], [9.74, PAIR, 'expo'], [9.98, PAIR], [10.48, PAIR20, 'expo']], 'pre': '₹'},
        labels=[[0, '1 piece'], [9.50, '2 pieces'], [9.94, '2 pieces · 20% off']],
        was_on=9.94, was_sw=[[0, RS(PAIR)]], strike_t=10.02,
        save_t=10.44, save_sw=[[0, f'YOU SAVE {RS(PAIR - PAIR20)}']], save_xy=(560, 878)),
    endwrap('endC', e, endC),
]
cue('air', 9.0, t1=9.4, v=.7)
music_cue('riser', e, d=1.0, v=.6); music_cue('revcym', e, d=.7, v=.5)
page('hookC', DUR, shotsC, ovC, voice='lvv', vo=planC,
     fblur=[[8.99, 0], [9.22, 14], [e - .2, 14], [e, 0]], dim=[{'t0': 8.99, 't1': e, 'a': .34}],
     leaks=[leak(1.0, 1, .5, .35), leak(e - .06, 1, .7, .5, 960, 1100)],
     music={'bed_lufs': -20.0, 'duck_db': 8.0,
            'score': {'bpm': 104, 'anchor': 2.80, 'end': e,
                      'sections': [[0, 2.80, 'intro'], [2.80, 8.99, 'groove'], [8.99, 11.1, 'lift'], [11.1, e, 'stop'], [e, DUR, 'end']]},
            'song': {'name': 'd', 'file': 'songs/d_owner.wav', 'segs': [[0.0, DUR, 17.849 - CC(4.52)]], 'drop': CC(4.52)}})
