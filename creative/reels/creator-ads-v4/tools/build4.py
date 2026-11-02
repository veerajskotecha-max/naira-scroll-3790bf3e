"""v4: two creator ads cut from the creators' own videos, built for Meta.
- RING, "Where is this from?": Ananaya's raw draft (Drive, 720p, her own voice, no music). It sells the Halo Curve Ring
  only. The Baroque Pearl Lariat she also shows is sold out (0 in stock on 2 Nov), so its section and her words "both the
  pieces are" are cut, and nothing names or prices it.
- PEARL, "Found my favourite jewellery": the creator's CapCut export, with her title and captions burned in. Her voice is
  lifted off the song CapCut laid under it (Demucs), so the paid cut can carry our own cleared score.
- No voiceover. Each creator tells the product story better than a read would; the graphics carry price, offer and claims.
- The hook is the product in the first frame: the ring held over her face while her first line plays (her mouth is
  hidden by her hand, so nothing is out of sync), and a native 4K crop of the pearl stud before the pearl creator's face.
- Every number on screen was checked live in Shopify on 2 Nov 2026: prices, MRPs, stock, BUY2 20% / BUY3 30%, and the
  listing wording behind each claim (tiger eye and champagne crystal, adjustable US 5-9, 9 mm shell pearl, cubic
  zirconia, PVD 18K gold coating). The 3-year plating guarantee is the owner's claim; the site still says 2 years.
Usage: python3.13 -I build4.py <S>"""
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
<link rel="stylesheet" href="../engine/base4.css"></head><body>
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

# =====================================================================================================
# RING — "Where is this from?"  (Ananaya; Halo Curve Ring, Rs 1,199)
# =====================================================================================================
CUES, IRIS = [], []
SEGS = [(0.00, 3.06, 0.00),                  # Someone actually asked me where this is from twice this week.
        (3.26, 6.41, 3.06),                  # So it's this ring from Naira. It has two stones,
        (7.47, 9.44, 6.21),                  # and I love that they don't actually match.
        (9.56, 11.25, 8.18),                 # That's kind of the whole point.
        (14.385, 17.30, 9.87),               # It's open at the back so it just fits really easily.
        (34.56, 37.86, 12.785),              # [both the pieces are] available at Naira with free delivery as well.
        (37.86, 39.98, 16.085),              # So now if someone asks you where this is from,
        (40.42, 41.20, 18.205)]              # you know it.
for (a0, b0, t0), (a1, b1, t1) in zip(SEGS, SEGS[1:]): assert abs(t0 + b0 - a0 - t1) < 1e-6, (t0, t1)
plan, lines, AD_ = cut(SEGS, 'ana', [
    [('Someone', 0.00, 0.48), ('actually', 0.48, 0.80), ('asked', 0.80, 1.08), ('me', 1.08, 1.24)],
    [('where', 1.24, 1.40), ('this', 1.40, 1.62), ('is', 1.62, 1.74), ('from', 1.74, 2.00)],
    [('twice', 2.00, 2.40, 1), ('this', 2.40, 2.70), ('week.', 2.70, 3.00)],
    [('So', 3.36, 3.56), ("it's", 3.56, 3.78), ('this', 3.78, 4.00), ('ring', 4.00, 4.22)],
    [('from', 4.22, 4.50), ('Naira.', 4.50, 4.98, 1)],
    [('It', 5.16, 5.32), ('has', 5.32, 5.50), ('two', 5.50, 5.76, 1), ('stones,', 5.76, 6.14)],
    [('and', 7.54, 7.64), ('I', 7.64, 7.76), ('love', 7.76, 7.88), ('that', 7.88, 8.08)],
    [('they', 8.08, 8.24), ("don't", 8.24, 8.50), ('actually', 8.50, 8.86), ('match.', 8.86, 9.26, 1)],
    [("That's", 9.64, 10.04), ('kind', 10.04, 10.20), ('of', 10.20, 10.32), ('the', 10.32, 10.44), ('whole', 10.44, 10.66), ('point.', 10.66, 11.02, 1)],
    [("It's", 14.54, 14.74), ('open', 14.74, 14.90), ('at', 14.90, 15.10), ('the', 15.10, 15.18), ('back,', 15.18, 15.46)],
    [('so', 15.46, 15.78), ('it', 15.78, 15.98), ('just', 15.98, 16.18), ('fits', 16.18, 16.40)],
    [('really', 16.40, 16.80), ('easily.', 16.80, 17.26, 1)],
    [('Available', 34.68, 34.98), ('at', 34.98, 35.30), ('Naira,', 35.30, 35.74, 1)],
    [('with', 35.74, 36.24), ('free', 36.24, 36.52, 1), ('delivery', 36.52, 36.92), ('as', 36.92, 37.20), ('well.', 37.20, 37.56)],
    [('So', 37.92, 38.10), ('now', 38.10, 38.38), ('if', 38.38, 38.54), ('someone', 38.54, 38.78), ('asks', 38.78, 39.08), ('you', 39.08, 39.24)],
    [('where', 39.24, 39.40), ('this', 39.40, 39.52), ('is', 39.52, 39.66), ('from,', 39.66, 39.90)],
    [('you', 40.50, 40.64), ('know', 40.64, 40.80, 1), ('it.', 40.80, 41.06)],
])
e = 18.985; DUR = 22.0
shotsR = [
    shot('ana', 0.00, 1.10, off=11.45, zoom=[1.08, 1.10], ax=.40, ay=.45),     # the hook: the ring over her face, her first line
    shot('ana', 1.10, 3.06, off=1.10, zoom=[1.0, 1.03]),
    shot('ana', 3.06, 6.21, off=3.26, zoom=[1.05, 1.08], ax=.42, ay=.45),
    shot('ana', 6.21, 8.18, off=7.47, zoom=[1.0, 1.03]),
    shot('ana', 8.18, 9.87, off=9.56, zoom=[1.05, 1.07]),
    shot('ana', 9.87, 12.785, off=14.385, zoom=[1.0, 1.04]),
    shot('ana', 12.785, 16.085, off=34.56, zoom=[1.04, 1.0]),
    shot('ana', 16.085, 18.205, off=37.86, zoom=[1.05, 1.06]),
    shot('ana', 18.205, e + .7, off=40.42, zoom=[1.0, 1.02]),
]
s = shotsR
hook, rise_, two = s[0], s[2], s[3]
cue('dm', 0.0, kind='in'); cue('dm', AD_(2.00) - .04, kind='in')
endR = (endlogo(250, 236, 580, e + .5)
        + el(f'<img src="{IMG}/ring2.jpg" style="width:500px;height:500px;object-fit:cover;display:block;box-shadow:0 18px 40px rgba(26,22,20,.16)">',
             290, 392, K((e + .42 - .002, {'o': 0, 's': 1.06}, 'lin'), (e + .9, {'o': 1, 's': 1}, 'out')), z=2)
        + glint(290 + 317, 392 + 300, e + 1.5, 120)
        + centred(f'<div style="display:flex;align-items:baseline;gap:16px"><span class="endname">{P["ring"]["nm"]}</span>'
                  f'<span class="endpr">{RS(P["ring"]["pr"])}</span>{struck(P["ring"]["mrp"], e + 1.0)}</div>', 910, fadek(e + .7, FOREVER), z=4)
        + centred(OFFER, 990, rise(e + .82, FOREVER), z=4)
        + cta(1070, e + .95, [e + 2.15])
        + trust(1190, e + 1.1) + care(1236, e + 1.2)
        + centred('<div class="url">nairaflore.com</div>', 1274, fadek(e + 1.3, FOREVER), z=4))
ovR = [
    dm('where is this from??', 64, 292, dmk(-0.32, 2.98)),
    dm('ok but WHERE is it from 😭', 64, 420, dmk(AD_(2.00) - .06, 2.98)),
    glint(*at(hook, TR['ring_hook'], 0.42, -20, -14), 0.42, 130),
    pcard3(P['ring'], 64, 300, 3.40, 5.28),
    callout((236, 486), track(rise_, TR['ring_up'], 3.62, 5.28), 3.64, 5.24),
    glint(*at(rise_, TR['ring_up'], AD_(4.10), -18, -10), AD_(4.10), 120),
    detail('ring_det', 64, 288, 360, 5.26, 8.10, [
        ('natural <b>tiger eye</b>', (.333, .35), (470, 318), AD_(5.50)),
        ('champagne <b>crystal</b>', (.683, .642), (470, 470), AD_(5.76) + .1),
    ]),
    kicker("Two stones that don't match", 300, 8.24, 9.84),
    el('<div class="wall" style="font-size:132px;font-weight:600;text-shadow:0 0 26px rgba(251,243,236,1),0 0 10px rgba(251,243,236,.95),0 0 3px rgba(251,243,236,.95)">on purpose.</div>', 64, 360, rise(AD_(10.44), 9.84, d=.46), z=13),
    chip('Adjustable · fits US 5–9', 'ring', 64, 300, AD_(14.74), 12.74),
    chip('PVD 18K gold coating', 'spark', 64, 398, AD_(15.98), 12.74),
    pcard3(P['ring'], 64, 292, AD_(34.62), 16.02, tag='In stock', count=False),
    strip([('truck', 'Free delivery', AD_(36.24)), ('cash', 'Cash on delivery', AD_(36.60))], 64, 500, 16.02),
    strip([('medal', '3-year plating guarantee', AD_(37.0))], 64, 576, 16.02),
    dm('where is this from??', 64, 292, dmk(AD_(38.54), e + .1)),
    typing(340, 420, AD_(39.30), AD_(40.42) + .02, w=676),
    dm('nairaflore.com ✨', 340, 420, dmk(AD_(40.48), e + .1), me=True, w=676),
    captions(lines, 1112),
    endwrap('endR', e, endR),
]
cue('swish', AD_(14.74) - .02, v=.3); cue('tap', AD_(10.66) + .05, v=.4)
for t in (AD_(36.60), AD_(37.0)): cue('swish', t, v=.25, pan=-.3)
cue('dm', AD_(38.54), kind='in'); cue('typing', AD_(39.30), t1=AD_(40.44)); cue('dm', AD_(40.48), kind='out')
music_cue('riser', e, d=1.2, v=.6); music_cue('revcym', e, d=.8, v=.5)
page('ringv4', DUR, shotsR, ovR, voice='ana', vo=plan,
     leaks=[leak(3.02, 1, .6, .35), leak(12.76, -1, .6, .3), leak(e - .06, 1, .7, .5, 960, 1100)],
     music={'bed_lufs': -20.0, 'duck_db': 8.0,
            'score': {'bpm': 93.5, 'anchor': 3.06, 'end': e,
                      'sections': [[0, 3.06, 'intro'], [3.06, 8.18, 'groove'], [8.18, 12.785, 'lift'], [12.785, 18.4, 'groove'], [18.4, e, 'stop'], [e, DUR, 'end']]},
            'song': {'name': 'grwm', 'file': 'songs/grwm.wav', 'segs': [[0.0, DUR, 8.63 - 8.18]], 'drop': 8.18}})

# =====================================================================================================
# PEARL — "Found my favourite jewellery"  (Pearl Point Studs Rs 1,499 + Heartline Paperclip Necklace Rs 1,899)
# =====================================================================================================
CUES, IRIS = [], []
SEGP = [(0.00, 0.50, 0.00),                  # Guys,                (over the 4K crop of the stud)
        (0.50, 5.385, 0.50),                 # I think I found my favourite jewellery pieces and don't worry, I'm not going to gatekeep them.
        (5.385, 7.45, 5.385),                # Like, look at these earrings.
        (7.74, 10.035, 7.45),                # The pearl detailing with the gold finish,
        (12.03, 16.98, 9.745),               # And this necklace, the little heart shape details look so delicate and sparkly.
        (16.98, 18.50, 14.695),              # And you know what the best part is?
        (18.66, 21.37, 16.215),              # I can pair it with my everyday outfits and my traditional.
        (21.62, 24.00, 18.925)]              # I think I'm definitely going to wear these on repeat.
for (a0, b0, t0), (a1, b1, t1) in zip(SEGP, SEGP[1:]): assert abs(t0 + b0 - a0 - t1) < 1e-6, (t0, t1)
planP, _, AP = cut(SEGP, 'lvv', [])
e = 21.305; DUR = 24.3
shotsP = [
    shot('lv_ear', 0.00, 0.50, off=0.0, zoom=[1.0, 1.04], ax=.55, ay=.62),        # native 4K: the stud, before her face
    shot('lv', 0.50, 5.385, off=0.50, zoom=[1.0, 1.03]),
    shot('lv', 5.385, 7.45, off=5.385, zoom=[1.04, 1.06], ax=.3, ay=.55),
    shot('lv', 7.45, 9.745, off=7.74, zoom=[1.0, 1.03]),
    shot('lv', 9.745, 14.695, off=12.03, zoom=[1.04, 1.07], ax=.4, ay=.6),
    shot('lv', 14.695, 16.215, off=16.98, zoom=[1.0, 1.02]),
    shot('lv', 16.215, 18.925, off=18.66, zoom=[1.05, 1.07]),
    shot('lv', 18.925, e + .7, off=21.62, zoom=[1.0, 1.03]),
]
s = shotsP
ear, look, neck = s[0], s[2], s[4]
cue('whoosh', 0.50, dir=1, v=.45)
tiles = (f'<div class="endpair"><img src="{IMG}/studs.jpg"><img src="{IMG}/heart.jpg"></div>')
endP = (endlogo(250, 236, 580, e + .5)
        + el(tiles, 126, 392, K((e + .42 - .002, {'o': 0, 's': 1.05}, 'lin'), (e + .9, {'o': 1, 's': 1}, 'out')), z=2)
        + glint(126 + 200, 392 + 190, e + 1.45, 110)
        + centred(f'<div style="display:flex;align-items:baseline;gap:16px"><span class="endname">both for</span>'
                  f'<span class="endpr">{RS(PAIR20)}</span>{struck(PAIR, e + 1.0)}</div>', 830, fadek(e + .7, FOREVER), z=4)
        + centred(OFFER, 916, rise(e + .82, FOREVER), z=4)
        + cta(1000, e + .95, [e + 2.15])
        + trust(1120, e + 1.1) + care(1166, e + 1.2)
        + centred('<div class="url">nairaflore.com</div>', 1204, fadek(e + 1.3, FOREVER), z=4))
ovP = [
    glint(*at(ear, TR['stud_ear'], 0.14, 10, -6), 0.14, 150),
    pcard3(P['studs'], 64, 300, AP(5.60), 7.40),
    callout((236, 486), track(look, TR['stud'], AP(5.80), AP(6.42)), AP(5.80), AP(6.42)),
    detail('studs_det', 64, 286, 330, AP(7.80), 9.70, [
        ('9 mm <b>shell pearl</b>', (.55, .55), (440, 292), AP(7.86)),
        ('3 <b>cubic zirconia</b>', (.16, .18), (440, 372), AP(8.40)),
        ('twisted <b>gold rope</b>', (.9, .62), (440, 452), AP(9.0)),
        ('PVD <b>18K gold coating</b>', (.62, .9), (440, 532), AP(9.40)),
    ]),
    pcard3(P['heart'], 64, 292, AP(12.30), AP(13.70) + .02),
    callout(at(neck, TR['neck'], AP(12.50)), track(neck, TR['neck'], AP(12.50), AP(13.60)), AP(12.52), AP(13.62)),     # a dot only: a leader would cross her face
    detail('heart_det', 64, 286, 330, AP(13.70), 14.62, [
        ('heart-cut <b>cubic zirconia</b>', (.26, .44), (440, 312), AP(13.70) + .2),
        ('PVD <b>18K gold coating</b>', (.64, .58), (440, 400), AP(15.32)),
    ]),
    glint(*at(neck, TR['neck'], AP(16.10), -60, -4), AP(16.10), 110),
    el('<div class="head" style="font-size:118px">everyday</div>', 64, 300, rise(AP(19.62), 18.86), z=13),
    el('<div class="head" style="font-size:118px">&amp; traditional.</div>', 64, 432, rise(AP(20.98), 18.86), z=13),
    bag(100, 360, 18.98, e - .04,
        drops=[('studs', 19.16), ('heart', 19.46)],
        fills=[(19.16, {'w': 0}, 'lin'), (19.40, {'w': 33.33}, 'out'), (19.46, {'w': 33.33}, 'lin'), (19.78, {'w': 66.67}, 'out')],
        nodes=[19.82, FOREVER], tot_on=19.16,
        now_k={'k': [[19.16, P['studs']['pr']], [19.46, P['studs']['pr']], [19.70, PAIR, 'expo'], [19.94, PAIR], [20.44, PAIR20, 'expo']], 'pre': '₹'},
        labels=[[0, '1 piece'], [19.46, '2 pieces'], [19.90, '2 pieces · 20% off']],
        was_on=19.90, was_sw=[[0, RS(PAIR)]], strike_t=19.98,
        save_t=20.40, save_sw=[[0, f'YOU SAVE {RS(PAIR - PAIR20)}']], save_xy=(560, 878)),
    endwrap('endP', e, endP),
]
cue('swish', AP(19.62), v=.35); cue('swish', AP(20.98), v=.35); cue('air', 18.95, t1=19.35, v=.7)
music_cue('riser', e, d=1.2, v=.6); music_cue('revcym', e, d=.8, v=.5)
page('pearlv4', DUR, shotsP, ovP, voice='lvv', vo=planP,
     fblur=[[18.93, 0], [19.18, 14], [e - .2, 14], [e, 0]], dim=[{'t0': 18.93, 't1': e, 'a': .34}],
     leaks=[leak(0.46, 1, .5, .35), leak(9.70, -1, .6, .3), leak(e - .06, 1, .7, .5, 960, 1100)],
     music={'bed_lufs': -20.0, 'duck_db': 8.0,
            'score': {'bpm': 93.5, 'anchor': 16.215, 'end': e,
                      'sections': [[0, 5.385, 'intro'], [5.385, 14.695, 'groove'], [14.695, 16.215, 'break'], [16.215, 20.8, 'lift'], [20.8, e, 'stop'], [e, DUR, 'end']]},
            'song': {'name': 'd', 'file': 'songs/d_owner.wav', 'segs': [[0.0, DUR, 17.849 - 16.215]], 'drop': 16.215}})
