"""Builds the three ad pages (ad10, ad20, ad30) and their audio plans.
Usage: python3.13 -I build.py <S>
Facts checked live in Shopify on 2 Nov 2026 (prices, MRPs, stock, BUY2 20% / BUY3 30%, listing tags)."""
import json, os, re, sys
S = sys.argv[1]; A = f'{S}/ads'
FPS = 30
META = {d: json.load(open(f'{A}/frames/{d}/meta.json')) for d in os.listdir(f'{A}/frames')}
AIBG = json.load(open(f'{A}/img/ai_bg.json'))
rgb = lambda c: f'rgb({c[0]},{c[1]},{c[2]})'

# ---------- pieces (live 2 Nov) ----------
P = {
    'hoops':   dict(nm='Woven Gold Hoops', pr='₹1,199', mrp='₹2,769', off='57% OFF', img='hoops'),
    'huggies': dict(nm='Brushed Gold Huggies', pr='₹799', mrp='₹1,799', off='56% OFF', img='huggies'),
    'chain':   dict(nm='Toggle Link Chain', pr='₹1,199', mrp='₹2,900', off='59% OFF', img='chain'),
    'ring':    dict(nm='Cushion Halo Ring', pr='₹1,099', mrp='₹2,200', off='50% OFF', img='ring'),
}

# ---------- logo (repo vectors: sage letters, blush flower) ----------
LOGO = open(f'{A}/img/logo_sage.svg').read()
paths = re.findall(r'<path [^>]*/>|<path [^>]*>.*?</path>', LOGO, re.S)
def logo(letters='#5E8279', flower='#FFBDA8', part='both'):
    keep = []
    for p in paths:
        is_flower = 'FFBDA8' in p
        if part == 'letters' and is_flower: continue
        if part == 'flower' and not is_flower: continue
        keep.append(p.replace('#99B4AF', letters).replace('#FFBDA8', flower))
    return '<svg viewBox="0 0 2708 606" style="width:100%;height:auto;overflow:visible;display:block">' + ''.join(keep) + '</svg>'

# ---------- keyframe helpers ----------
def K(*frames): return json.dumps([[round(t, 4), p, e] for t, p, e in frames])
def show(t0, t1, enter='up', exit='fade', d_in=.32, d_out=.22, dy=36):
    pre = {'up': {'o': 0, 'y': dy, 'b': 6}, 'pop': {'o': 0, 's': .82, 'b': 4}, 'blur': {'o': 0, 'b': 18, 's': 1.05},
           'left': {'o': 0, 'x': -70, 'b': 8}, 'right': {'o': 0, 'x': 90, 'b': 8}, 'none': {'o': 0}}[enter]
    rest = {k: (1 if k in ('o', 's') else 0) for k in pre}
    post = {'fade': {'o': 0, 'b': 6}, 'up': {'o': 0, 'y': -40, 'b': 6}, 'left': {'o': 0, 'x': -120, 'b': 14},
            'cut': {'o': 0}}[exit]
    ein = 'back' if enter == 'pop' else 'out'
    fr = [(t0 - .001, pre, 'lin'), (t0 + d_in, rest, ein)]
    if exit == 'cut': fr += [(t1 - .001, {'o': 1}, 'step'), (t1, {'o': 0}, 'step')]
    else: fr += [(t1 - d_out, {k: rest.get(k, 0) for k in post}, 'lin'), (t1, post, 'in')]
    return K(*fr)
def el(html, x, y, k, cls='', w=None, z=10, extra=''):
    ws = f'width:{w}px;' if w else ''
    return f'<div class="o {cls}" style="left:{x}px;top:{y}px;{ws}z-index:{z};{extra}" data-k=\'{k}\'>{html}</div>'
def centred(html, y, k, z=10, extra=''):
    return f'<div class="o" style="left:0;top:{y}px;width:1080px;display:flex;justify-content:center;z-index:{z};{extra}" data-k=\'{k}\'>{html}</div>'
def pcard(p, tag=None):
    t = f'<div class="tag">{tag}</div>' if tag else ''
    return (f'<div class="pc">{t}<div class="nm">{p["nm"]}</div><div class="row"><span class="pr">{p["pr"]}</span>'
            f'<span class="mrp">{p["mrp"]}</span></div><div class="off">{p["off"]}</div></div>')
def chip(txt): return f'<div class="chip"><b>✓</b>{txt}</div>'

# ---------- voice: placed segments and caption lines ----------
def place(segs):
    """segs: [(src0, src1, at, [lines...])], a line = [(word, w0, w1)] in source time. Returns audio plan + caption lines."""
    plan, lines = [], []
    for s0, s1, at, lns in segs:
        plan.append({'src0': s0, 'src1': s1, 'at': at})
        for ln in lns:
            ws = [[round(at + (w0 - s0), 3), round(at + (w1 - s0), 3), w] for w, w0, w1 in ln]
            lines.append({'t0': ws[0][0], 't1': ws[-1][1], 'w': ws})
    return plan, lines
def captions(lines, y=1090):
    j = json.dumps(lines).replace("'", "&#39;")   # "it's" would end the quoted attribute
    return f'<div class="cap" style="top:{y}px;z-index:30" data-lines=\'{j}\'></div>'

# ---------- page ----------
def page(name, dur, shots, overlays, bg=(), flash=(), dim=(), voice=None, vo=None, music=None, fblur=()):
    data = {'fps': FPS, 'dur': dur, 'frames': '../frames', 'meta': META, 'shots': shots, 'bg': list(bg), 'flash': list(flash), 'dim': list(dim), 'fblur': list(fblur)}
    html = f'''<!doctype html><html><head><meta charset="utf-8">
<style>
@font-face {{ font-family:CG; src:url('{S}/fonts/CG.ttf'); font-weight:300 700; }}
@font-face {{ font-family:CG; font-style:italic; src:url('{S}/fonts/CG-Italic.ttf'); font-weight:300 700; }}
@font-face {{ font-family:Jost; src:url('{S}/fonts/Jost.ttf'); font-weight:100 900; }}
</style>
<link rel="stylesheet" href="../engine/base.css"></head><body>
<canvas id="v" width="1080" height="1920"></canvas>
{''.join(overlays)}
<script>window.AD = {json.dumps(data)};</script>
<script src="../engine/engine.js"></script>
</body></html>'''
    os.makedirs(f'{A}/{name}', exist_ok=True)
    open(f'{A}/{name}/index.html', 'w').write(html)
    json.dump({'dur': dur, 'vo': vo, 'voice': voice, 'music': music}, open(f'{A}/{name}/audio.json', 'w'), indent=1)
    print(name, dur, len(shots), 'shots', len(overlays), 'overlays')

def shot(id, t0, t1, **kw):
    s = {'id': id, 't0': t0, 't1': t1}; s.update(kw)
    if META[id]['sq']:
        b = AIBG[id]; s.update(bgTop=rgb(b['top']), bgMid=rgb(b['mid']), bgBot=rgb(b['bot']))
    return s

IMG = '../img'
# =====================================================================================================
# AD 10 — "Our #1 bestseller" (existing clips: GRWM, Riya's hoop box, Sonal) — price-led, one piece
# =====================================================================================================
plan, lines = place([
    (0.00, 1.86, 0.10, [[('Our', 0.00, 0.24), ('#1', 0.24, 0.98), ('bestseller.', 0.98, 1.74)]]),
    (3.78, 5.66, 2.04, [[('Now', 3.82, 4.06), ('just', 4.06, 4.34), ('₹1,199.', 4.34, 5.36)]]),
    (6.02, 6.84, 3.98, [[('Waterproof.', 6.00, 6.62)]]),
    (7.05, 7.95, 4.86, [[('Tarnish-free.', 7.14, 7.74)]]),
    (8.28, 10.43, 5.82, [[('Buy', 8.30, 8.50), ('2,', 8.50, 8.80), ('take', 9.08, 9.22), ('20%', 9.22, 9.92), ('off.', 9.92, 10.24)]]),
    (10.74, 11.68, 8.06, [[('Shop', 10.78, 11.02), ('Naira.', 11.02, 11.56)]]),
])
H = P['hoops']
shots10 = [
    shot('grwm_hoopheld', 0.00, 1.25, zoom=[1.0, 1.07]),
    shot('riya_hoopbox', 1.25, 2.45, zoom=[1.03, 1.10], whip=.16),
    shot('bb_close', 2.45, 3.73, zoom=[1.0, 1.05]),
    shot('riya_portrait', 3.73, 4.73, zoom=[1.04, 1.0], punch=[1.08, .25]),
    shot('grwm_close', 4.73, 5.82, zoom=[1.0, 1.05]),
    shot('grwm_fist', 5.82, 8.12, zoom=[1.0, 1.07], whip=.14, whipOut=.12),
]
end10 = (f'<div style="position:absolute;left:0;top:0;width:1080px;height:1920px;background:var(--ivory)"></div>'
         f'<div style="position:absolute;left:220px;top:290px;width:640px">{logo()}</div>'
         f'<img data-clip="ai_hoops" data-t0="8.05" style="position:absolute;left:250px;top:480px;width:580px;height:580px;object-fit:cover">'
         f'<div style="position:absolute;left:0;top:1075px;width:1080px;text-align:center" class="cg"><span style="font-size:54px;color:var(--deep)">Woven Gold Hoops · </span>'
         f'<span class="cgr" style="font-size:58px;color:var(--deep)">₹1,199</span> <span class="jo" style="font-size:30px;color:rgba(26,22,20,.45);text-decoration:line-through">₹2,769</span></div>'
         f'<div style="position:absolute;left:0;top:1160px;width:1080px;display:flex;justify-content:center"><div class="cta">SHOP NOW</div></div>'
         f'<div class="small" style="position:absolute;left:0;top:1268px;width:1080px;text-align:center;font-size:24px">Free insured shipping · Cash on delivery</div>')
ov10 = [
    centred('<div class="kick">Our #1 bestseller</div>', 290, show(1.28, 2.40, 'pop', 'fade')),
    centred('<div class="head" style="font-size:92px">the woven gold hoops.</div>', 360, show(1.36, 2.40, 'blur', 'fade')),
    el(pcard(H), 64, 290, show(2.06, 5.80, 'left', 'fade')),
    el(chip('Waterproof'), 64, 640, show(3.98, 5.80, 'left', 'fade')),
    el(chip('Tarnish-free'), 64, 740, show(4.86, 5.80, 'left', 'fade')),
    el('<div class="pc" style="min-width:0;padding:26px 34px"><div class="tag">Mix any pieces</div>'
       '<div class="nm" style="font-size:66px">Buy 2 · 20% off</div></div>', 64, 290, show(5.84, 8.0, 'left', 'fade')),
    el('<div class="pc" style="min-width:0;padding:22px 34px;background:var(--blush)"><div class="nm" style="font-size:66px">Buy 3 · 30% off</div></div>',
       64, 522, show(6.95, 8.0, 'left', 'fade')),
    captions(lines),
    f'<div class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:40" data-k=\'{K((8.04, {"o": 0, "s": 1.04}, "lin"), (8.30, {"o": 1, "s": 1}, "out"))}\'>{end10}</div>',
]
page('ad10', 10.0, shots10, ov10, voice='vo10', vo=plan,
     music={'bpm': 120, 'start': 0.0, 'hits': [1.25, 2.45, 3.73, 5.82, 8.05], 'whoosh': [1.21, 5.78, 8.0], 'glint': [2.6, 8.35],
            'end': 10.0, 'drop': 8.05})

# =====================================================================================================
# AD 20 — "Your whole stack, in one box" (Pankti, Riya, Sonal) — four pieces, the ladder
# =====================================================================================================
plan, lines = place([
    (0.00, 2.32, 0.15, [[('Your', 0.00, 0.22), ('whole', 0.22, 0.54), ('stack,', 0.54, 0.90), ('in', 1.28, 1.46), ('one', 1.46, 1.70), ('box.', 1.70, 2.08)]]),
    (2.64, 4.45, 2.58, [[('Huggies,', 2.60, 3.14), ('₹799.', 3.40, 4.18)]]),
    (4.80, 7.10, 4.50, [[('The', 4.76, 4.90), ('toggle', 4.90, 5.16), ('chain,', 5.16, 5.52), ('₹1,199.', 5.90, 6.82)]]),
    (7.44, 9.52, 6.92, [[('A', 7.42, 7.56), ('halo', 7.56, 7.80), ('ring,', 7.80, 8.12), ('₹1,099.', 8.52, 9.26)]]),
    (9.85, 11.58, 9.12, [[('Plus', 9.78, 10.06), ('our', 10.06, 10.38), ('bestselling', 10.38, 10.96), ('hoops.', 10.96, 11.44)]]),
    (11.81, 14.13, 11.00, [[('Pick', 11.80, 12.00), ('any', 12.00, 12.24), ('two,', 12.24, 12.58), ('take', 12.88, 12.98), ('20%', 12.98, 13.62), ('off.', 13.62, 13.96)]]),
    (14.38, 15.72, 13.46, [[('Pick', 14.34, 14.56), ('three,', 14.56, 14.86), ('30%.', 15.20, 15.50)]]),
    (16.01, 17.71, 14.96, [[('Free', 16.00, 16.28), ('shipping', 16.28, 16.56), ('across', 16.56, 16.94), ('India.', 16.94, 17.50)]]),
    (18.02, 18.92, 16.86, [[('Shop', 18.00, 18.30), ('Naira.', 18.30, 18.80)]]),
])
shots20 = [
    shot('pk_box', 0.00, 2.55, zoom=[1.0, 1.06]),
    shot('pk_hugheld', 2.55, 3.55, zoom=[1.04, 1.10], whip=.15),
    shot('pk_hugon', 3.55, 4.50, zoom=[1.0, 1.04]),
    shot('pk_palm', 4.50, 5.50, zoom=[1.04, 1.10], whip=.15),
    shot('pk_toggle', 5.50, 6.92, zoom=[1.0, 1.05]),
    shot('riya_ringbox', 6.92, 8.05, zoom=[1.02, 1.08], whip=.15, off=0.25),
    shot('riya_ringmacro', 8.05, 9.12, zoom=[1.0, 1.06]),
    shot('riya_hoopbox', 9.12, 10.12, zoom=[1.03, 1.09], whip=.15),
    shot('bb_close', 10.12, 11.00, zoom=[1.0, 1.04]),
    shot('pk_portrait', 11.00, 13.46, zoom=[1.0, 1.05], punch=[1.06, .3]),
    shot('riya_wear', 13.46, 14.96, zoom=[1.02, 1.06], whip=.14),
    shot('grwm_pose', 14.96, 16.80, zoom=[1.0, 1.05], whipOut=.12),
]
def bag(two_t, three_t, hide_t, y=300, left=110, slots=('huggies', 'chain', 'hoops'), slot_t=None, t_in=None):
    slot_t = slot_t or [two_t - .25, two_t + .05, three_t]
    s_html = ''.join(
        f'<div class="slot"><img src="{IMG}/{n}.jpg" class="o" style="left:0;top:0;width:150px;height:150px" data-k=\'{K((t - .001, {"o": 0, "s": .6}, "lin"), (t + .28, {"o": 1, "s": 1}, "back"))}\'></div>'
        for n, t in zip(slots, slot_t))
    fill = (f'<div class="fill o" style="position:absolute" data-k=\'{K((two_t - .3, {"w": 0}, "lin"), (two_t, {"w": 50}, "out"), (three_t, {"w": 50}, "lin"), (three_t + .35, {"w": 100}, "out"))}\'></div>')
    tot = (f'<div class="tot"><span class="l" data-swap=\'{json.dumps([[0, "2 pieces · 20% off"], [three_t, "3 pieces · 30% off"]])}\'></span>'
           f'<span><span class="was" data-swap=\'{json.dumps([[0, "₹1,998"], [three_t, "₹3,197"]])}\'></span>'
           f'<span class="r" data-swap=\'{json.dumps([[0, "₹1,598"], [three_t + .25, "₹2,238"]])}\'></span></span></div>')
    inner = (f'<div class="bag"><div class="h">YOUR BAG · APPLIED AUTOMATICALLY</div><div class="slots">{s_html}</div>'
             f'<div class="bar">{fill}</div><div class="rungs"><span>BUY 2 · 20% OFF</span><span>BUY 3 · 30% OFF</span></div>{tot}</div>')
    return el(inner, left, y, show(t_in if t_in is not None else two_t - .45, hide_t, 'left', 'fade'), z=12)
end20_tiles = ''.join(
    f'<div style="width:236px"><img src="{IMG}/{P[n]["img"]}.jpg" style="width:236px;height:236px;object-fit:cover;display:block">'
    f'<div class="cg" style="font-size:27px;color:var(--deep);margin-top:10px;line-height:1.1">{P[n]["nm"]}</div>'
    f'<div class="jo" style="font-weight:600;font-size:28px;color:var(--deep)">{P[n]["pr"]} <s style="font-weight:400;font-size:21px;color:rgba(26,22,20,.45)">{P[n]["mrp"]}</s></div></div>'
    for n in ('huggies', 'chain', 'ring', 'hoops'))
end20 = (f'<div style="position:absolute;left:0;top:0;width:1080px;height:1920px;background:var(--ivory)"></div>'
         f'<div style="position:absolute;left:250px;top:285px;width:580px">{logo()}</div>'
         f'<div class="cg" style="position:absolute;left:0;top:448px;width:1080px;text-align:center;font-size:66px;color:var(--deep)">pick any 3 · <span class="cgr">30% off</span></div>'
         f'<div style="position:absolute;left:36px;top:560px;width:1008px;display:flex;gap:21px">{end20_tiles}</div>'
         f'<div style="position:absolute;left:0;top:1000px;width:1080px;display:flex;justify-content:center"><div class="cta">SHOP NOW</div></div>'
         f'<div class="small" style="position:absolute;left:0;top:1112px;width:1080px;text-align:center;font-size:24px">Free insured shipping · COD · 7-day exchange</div>')
ov20 = [
    el(pcard(P['huggies']), 64, 290, show(2.60, 4.46, 'left', 'fade', d_out=.14)),
    el(pcard(P['chain']), 64, 290, show(4.52, 6.88, 'left', 'fade', d_out=.14)),
    el(pcard(P['ring']), 64, 290, show(6.94, 9.08, 'left', 'fade', d_out=.14)),
    el(pcard(P['hoops'], tag='#1 Bestseller'), 64, 290, show(9.14, 10.98, 'left', 'fade', d_out=.14)),
    bag(11.70, 13.62, 14.92, slot_t=[11.45, 11.75, 13.62], t_in=11.05),
    el(chip('Free insured shipping'), 64, 300, show(14.98, 16.74, 'left', 'fade')),
    el(chip('Cash on delivery'), 64, 400, show(15.22, 16.74, 'left', 'fade')),
    el(chip('7-day exchange & returns'), 64, 500, show(15.46, 16.74, 'left', 'fade')),
    captions(lines),
    f'<div class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:40" data-k=\'{K((16.74, {"o": 0, "s": 1.04}, "lin"), (17.0, {"o": 1, "s": 1}, "out"))}\'>{end20}</div>',
]
page('ad20', 20.0, shots20, ov20, voice='vo20b', vo=plan,
     fblur=[[11.0, 0], [11.32, 14], [14.70, 14], [14.98, 0]], dim=[{'t0': 11.0, 't1': 14.96, 'a': .30, 'y0': 0, 'y1': 1920, 'flat': True}],
     music={'bpm': 120, 'start': 0.0, 'hits': [2.55, 4.50, 6.92, 9.12, 11.0, 13.46, 14.96, 16.75], 'whoosh': [2.51, 4.46, 6.88, 9.08, 13.42],
            'glint': [3.3, 5.9, 8.4, 10.3, 14.1, 17.1], 'end': 20.0, 'drop': 16.75})

# =====================================================================================================
# AD 30 — creative: "Somewhere, someone just asked… where is it from?" (the reference's grammar in Naira's colours)
# =====================================================================================================
plan, lines = place([
    (0.00, 2.22, 0.45, [[('Somewhere,', 0.00, 0.46), ('someone', 0.94, 1.26), ('just', 1.26, 1.54), ('asked…', 1.54, 2.00)]]),
    (2.49, 3.39, 2.86, [[('where', 2.46, 2.68), ('is', 2.68, 2.84), ('it', 2.84, 2.94), ('from?', 2.94, 3.20)]]),
    (3.80, 4.35, 4.10, []), (4.72, 5.32, 5.05, []), (5.58, 6.24, 5.80, []), (6.47, 7.15, 6.60, []), (7.38, 8.06, 7.42, []),
    (8.38, 11.31, 8.40, [[('Demi-fine', 8.34, 8.98), ('jewellery,', 8.98, 9.38)], [('made', 9.38, 9.96), ('in', 9.96, 10.20), ('limited', 10.20, 10.54), ('batches.', 10.54, 11.30)]]),
    (11.61, 14.47, 11.48, []),
    (14.69, 17.13, 14.48, []),
    (17.43, 20.41, 17.12, [[('Pick', 17.42, 17.60), ('any', 17.60, 17.88), ('three,', 17.88, 18.18)], [('and', 18.18, 18.52), ('your', 18.52, 18.68), ('bag', 18.68, 18.94)], [('takes', 18.94, 19.24), ('30%', 19.24, 19.94), ('off.', 19.94, 20.32)]]),
    (20.72, 24.25, 20.32, []),
    (24.63, 26.67, 24.12, [[('So', 24.56, 24.78), ('the', 24.78, 24.90), ('next', 24.90, 25.10), ('time', 25.10, 25.34), ('they', 25.34, 25.48), ('ask', 25.48, 25.78)], [('where', 25.78, 25.94), ("it's", 25.94, 26.14), ('from,', 26.14, 26.46)]]),
    (26.94, 27.80, 26.42, [[('say', 26.92, 27.20), ('Naira.', 27.20, 27.72)]]),
])
for ln in lines:
    if 8.3 <= ln['t0'] < 11.4: ln['dark'] = True
INK = {'color': '#1A1614'}
glow = lambda t0, t1, x, y, r=900, a=.55, c='rgba(255,189,168,A)': {'t0': t0, 't1': t1, 'x': x, 'y': y, 'r': r, 'a': a, 'c': c}
bg30 = [
    dict(INK, t0=0.0, t1=4.85, glows=[glow(-0.9, 4.85, [380, 700], [1300, 900], 1000, .42), glow(-0.9, 4.85, [900, 520], [500, 1100], 700, .22, 'rgba(232,201,138,A)')]),
    dict(INK, t0=4.85, t1=8.30, glows=[glow(4.85, 8.30, [300, 820], [700, 1400], 1100, .40), glow(4.85, 8.30, [900, 300], [1200, 700], 800, .20, 'rgba(232,201,138,A)')]),
    {'color': '#FBF3EC', 't0': 14.40, 't1': 17.15, 'glows': [glow(14.4, 17.15, [540, 540], [400, 1100], 900, .35)]},
    dict(INK, t0=17.15, t1=20.32, glows=[glow(17.15, 20.32, [200, 880], [600, 1300], 1000, .45), glow(17.15, 20.32, [900, 400], [1300, 900], 700, .2, 'rgba(232,201,138,A)')]),
]
shots30 = [
    shot('ai_hoops', 8.28, 9.84, zoom=[1.0, 1.06], whip=.16, sqY=420),
    shot('ai_huggies', 9.84, 11.42, zoom=[1.0, 1.05], whip=.16, sqY=420),
    shot('bb_close', 11.42, 12.40, zoom=[1.04, 1.0], whip=.14),
    shot('pk_hugon', 12.40, 13.40, zoom=[1.0, 1.05]),
    shot('pk_neck', 13.40, 14.42, zoom=[1.0, 1.05], whipOut=.12),
    shot('riya_ringbox', 20.32, 23.05, zoom=[1.0, 1.07], whip=.15),
    shot('riya_hoopbox', 23.05, 24.12, zoom=[1.03, 1.08]),
    shot('riya_portrait', 24.12, 25.12, zoom=[1.04, 1.0], punch=[1.07, .25], whip=.14),
    shot('grwm_fist', 25.12, 27.30, zoom=[1.0, 1.06], whipOut=.12),
]
# A: the question, as DMs
dm1 = '<div class="dm"><div class="av"></div><div class="bub">omg your hoops 😍</div></div>'
dm2 = '<div class="dm"><div class="av"></div><div class="bub">wait where is it from??</div></div>'
collapse = lambda t0, x, y, dx, dy: K((t0 - .001, {'o': 0, 's': .7, 'b': 4, 'x': 0, 'y': 0}, 'lin'), (t0 + .35, {'o': 1, 's': 1, 'b': 0, 'x': 0, 'y': 0}, 'back'),
                                      (3.40, {'o': 1, 's': 1, 'b': 0, 'x': 0, 'y': 0}, 'lin'), (3.78, {'o': 0, 's': .12, 'b': 12, 'x': dx, 'y': dy}, 'in'))
glint = ('<div style="width:220px;height:220px;border-radius:50%;background:radial-gradient(circle, rgba(255,247,236,1) 0%, rgba(255,214,190,.95) 18%,'
         ' rgba(255,189,168,.45) 42%, rgba(255,189,168,0) 70%)"></div>')
rows = ''.join(
    f'<div class="prow o" style="position:relative" data-k=\'{{K}}\'><img src="{IMG}/{P[n]["img"]}.jpg"><div class="nm">{P[n]["nm"]}</div>'
    f'<div class="pr">{P[n]["pr"]}<s>{P[n]["mrp"]}</s></div><div class="st">IN STOCK</div></div>'
    for n in ('hoops', 'huggies', 'chain', 'ring'))
focus = [5.05, 5.80, 6.60, 7.42]
def row_k(i):
    fr = [(4.9, {'s': 1, 'b': 0, 'o': 1}, 'lin')]
    for j, t in enumerate(focus):
        on = (i == j)
        fr.append((t, {'s': 1.0 if not on else 1.0, 'b': 0 if on else (0 if j == 0 and False else 2.6), 'o': 1 if on else .5}, 'out'))
        fr.append((t + .22, {'s': 1.07 if on else .97, 'b': 0 if on else 2.6, 'o': 1 if on else .5}, 'out'))
    fr.append((8.0, {'s': 1, 'b': 0, 'o': 1}, 'out'))
    return K(*fr)
rows = ''.join(r.replace('{K}', row_k(i)) for i, r in enumerate(re.findall(r'<div class="prow.*?</div></div>', rows, re.S)))
plist = f'<div class="plist"><div class="h"><span>THE EDIT</span><span>4 PIECES</span></div>{rows}</div>'
tiles = ''.join(
    f'<div class="tile" style="width:440px"><img src="{IMG}/{P[n]["img"]}.jpg" style="width:440px;height:440px"><div class="t"><div class="nm">{P[n]["nm"]}</div>'
    f'<div class="pr">{P[n]["pr"]}<s>{P[n]["mrp"]}</s></div></div></div>' for n in ('hoops', 'huggies', 'chain', 'ring'))
tile_k = [K((14.40 + .08 * i - .001, {'o': 0, 'y': 60, 's': .94}, 'lin'), (14.40 + .08 * i + .38, {'o': 1, 'y': 0, 's': 1}, 'out'),
            (17.0, {'o': 1, 'y': 0, 's': 1}, 'lin'), (17.15, {'o': 0, 'y': -30, 's': 1}, 'in')) for i in range(4)]
tile_els = ''.join(
    f'<div class="o" style="left:{70 + (i % 2) * 500}px;top:{270 + (i // 2) * 560}px" data-k=\'{tile_k[i]}\'>{t}</div>'
    for i, t in enumerate(re.findall(r'<div class="tile".*?</div></div></div>', tiles, re.S)))
end30 = (f'<div style="position:absolute;left:0;top:0;width:1080px;height:1920px;background:var(--ivory)"></div>'
         f'<div style="position:absolute;left:200px;top:290px;width:680px">{logo()}</div>'
         f'<img data-clip="ai_hoops" data-t0="27.2" data-speed=".8" style="position:absolute;left:290px;top:480px;width:500px;height:500px;object-fit:cover">'
         f'<div class="cg" style="position:absolute;left:0;top:1000px;width:1080px;text-align:center;font-size:58px;color:var(--deep)">pick any 3 · <span class="cgr">30% off</span></div>'
         f'<div style="position:absolute;left:0;top:1085px;width:1080px;display:flex;justify-content:center"><div class="cta">SHOP NOW</div></div>'
         f'<div class="small" style="position:absolute;left:0;top:1192px;width:1080px;text-align:center;font-size:24px">nairaflore.com · Free insured shipping · COD</div>')
ov30 = [
    el(dm1, 80, 760, K((0.0, {'o': 1, 's': .93, 'b': 0, 'x': 0, 'y': 0}, 'lin'), (0.30, {'o': 1, 's': 1, 'b': 0, 'x': 0, 'y': 0}, 'back'),
                       (3.40, {'o': 1, 's': 1, 'b': 0, 'x': 0, 'y': 0}, 'lin'), (3.78, {'o': 0, 's': .12, 'b': 12, 'x': 380, 'y': 200}, 'in')), z=12),   # on screen from frame 1: the hook
    el(dm2, 80, 900, collapse(2.86, 80, 900, 380, 60), z=12),
    centred(glint, 850, K((3.45, {'o': 0, 's': .2}, 'lin'), (3.75, {'o': 1, 's': 1.15}, 'out'), (3.95, {'o': 1, 's': .8}, 'io'), (4.25, {'o': 0, 's': 2.4}, 'out')), z=13),
    el(f'<div style="width:880px">{logo(letters="#99B4AF", part="flower")}</div>', 100, 760,
       K((3.62, {'o': 0, 's': .3, 'r': -50, 'b': 6}, 'lin'), (4.05, {'o': 1, 's': 1, 'r': 0, 'b': 0}, 'back'), (4.70, {'o': 1, 'y': 0, 's': 1}, 'lin'), (5.0, {'o': 0, 'y': -120, 's': .9}, 'in')), z=14),
    el(f'<div style="width:880px">{logo(letters="#99B4AF", part="letters")}</div>', 100, 760,
       K((3.92, {'o': 0, 'b': 16, 's': 1.06}, 'lin'), (4.35, {'o': 1, 'b': 0, 's': 1}, 'out'), (4.70, {'o': 1, 'y': 0, 's': 1}, 'lin'), (5.0, {'o': 0, 'y': -120, 's': .9}, 'in')), z=14),
    el(plist, 100, 520, K((4.78, {'o': 0, 'rx': 26, 'ry': -18, 's': .86, 'y': 140, 'b': 8}, 'lin'), (5.25, {'o': 1, 'rx': 10, 'ry': -8, 's': 1, 'y': 0, 'b': 0}, 'out'),
                         (7.9, {'o': 1, 'rx': 4, 'ry': -3, 's': 1.02, 'x': 0, 'b': 0}, 'lin'), (8.30, {'o': 0, 'rx': 4, 'ry': -3, 's': 1.02, 'x': -1100, 'b': 22}, 'in')), z=12),
    centred('<div class="head" style="font-size:118px;color:var(--deep);text-shadow:none">demi-fine.</div>', 280, show(8.40, 11.36, 'blur', 'fade'), z=12),
    centred('<div class="kick">Made in limited batches</div>', 420, show(9.38, 11.36, 'pop', 'fade'), z=12),
    centred(chip('Waterproof'), 300, show(11.56, 14.40, 'pop', 'fade'), z=12),
    centred(chip('Tarnish-free'), 400, show(12.40, 14.40, 'pop', 'fade'), z=12),
    centred(chip('Hypoallergenic'), 500, show(13.36, 14.40, 'pop', 'fade'), z=12),
    tile_els,
    el('<div class="stamp"><div class="a">ALL UNDER</div><div class="b">₹1,200</div><div class="c">EACH</div></div>', 800, 750,
       K((15.62, {'o': 0, 's': .3, 'r': -30}, 'lin'), (15.95, {'o': 1, 's': 1, 'r': -8}, 'back'), (17.0, {'o': 1, 's': 1, 'r': -8}, 'lin'), (17.15, {'o': 0, 's': .8, 'r': -8}, 'in')), z=14),
    bag(18.10, 19.24, 20.30, y=560, slot_t=[17.55, 17.85, 18.15], t_in=17.18),
    el(chip('Free insured shipping'), 64, 300, show(20.70, 23.95, 'left', 'fade'), z=12),
    el(chip('Across India · 3–5 days'), 64, 400, show(21.85, 23.95, 'left', 'fade'), z=12),
    el(chip('Cash on delivery'), 64, 500, show(22.90, 23.95, 'left', 'fade'), z=12),
    el(dm2.replace('wait where', 'where'), 80, 330, show(24.55, 27.24, 'pop', 'fade'), z=12),
    el('<div class="dm" style="justify-content:flex-end"><div class="bub me">@nairaflore ✨</div></div>', 340, 480, show(26.40, 27.24, 'pop', 'fade'), z=12, w=660),
    captions(lines),
    f'<div class="o" style="left:0;top:0;width:1080px;height:1920px;z-index:40" data-k=\'{K((27.20, {"o": 0, "s": 1.04}, "lin"), (27.46, {"o": 1, "s": 1}, "out"))}\'>{end30}</div>',
]
page('ad30', 30.0, shots30, ov30, bg=bg30, voice='vo30', vo=plan,
     flash=[{'t': 4.08, 'd': .22, 'a': .35}, {'t': 19.26, 'd': .2, 'a': .35}],
     music={'bpm': 120, 'start': 0.0, 'hits': [4.10, 5.05, 5.80, 6.60, 7.42, 8.28, 11.42, 14.40, 17.15, 20.32, 24.12, 27.20], 'whoosh': [3.40, 8.22, 9.80, 14.36, 17.10, 20.28, 27.16],
            'glint': [3.75, 8.6, 10.0, 16.0, 19.26, 27.5], 'pop': [0.04, 2.86, 24.55, 26.40], 'end': 30.0, 'drop': 4.10})
