"""The campaign's end card over a frozen final frame: a veil from the top in the world's own colour, then one centred
column (mark, name, price struck from MRP, the live offer with shipping and COD, a SHOP NOW chip), all above the piece.
exec'd after col_kit."""
def endcard(t, name, price, mrp, veil, ink=False, chip_y=612, logo_letters='#99B4AF', veil_h=720):
    c6 = lambda t, dy=12: K((t - .002, {'o': 0, 'y': dy}, 'lin'), (t + .25, {'o': 1, 'y': 0}, 'out'))
    tone, chip = ('lt', 'color:#FBF3EC;background:#1A1614') if ink else ('iv sh', 'color:#1A1614;background:#FBF3EC')
    mrpc = 'color:rgba(26,22,20,.5)' if ink else ''
    out = [f'<div class="o" style="left:0;top:0;width:1080px;height:{veil_h}px;z-index:5;background:linear-gradient(180deg, {veil.replace("A", ".93")} 0%, {veil.replace("A", ".8")} 72%, {veil.replace("A", "0")} 100%)" data-k=\'{c6(t, 0)}\'></div>',
           f'<div class="o" style="left:430px;top:282px;width:220px;z-index:6" data-k=\'{c6(t + .05)}\'>{logo(letters=logo_letters)}</div>',
           line(name, 'q', tone, 58, 0, 410, t + .15, FOREVER),
           f'<div class="o" style="left:0;top:428px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:22px;z-index:6" data-k=\'{c6(t + .3)}\'>'
           f'<span class="num7 {tone}" style="font-size:88px">{RS(price)}</span>'
           f'<span class="mrp7" style="font-size:30px;{mrpc}">{RS(mrp)}<span class="o strike" data-k=\'{K((t + .55, {"w": 0}, "lin"), (t + .75, {"w": 104}, "out"))}\'></span></span></div>',
           f'<div class="o" style="left:0;top:540px;width:1080px;text-align:center;z-index:6" data-k=\'{c6(t + .5)}\'>'
           f'<div class="lab7 {tone}" style="font-size:18px">{OFFER2} &nbsp;·&nbsp; {OFFER3} &nbsp;·&nbsp; FREE SHIPPING &nbsp;·&nbsp; COD AVAILABLE</div></div>',
           f'<div class="o" style="left:0;top:{chip_y}px;width:1080px;display:flex;justify-content:center;z-index:7" data-k=\'{c6(t + .85)}\'>'
           f'<div class="lab7" style="font-size:22px;{chip};padding:14px 30px 12px 36px;letter-spacing:.28em">SHOP NOW</div></div>']
    return out
def quiet_offer(t0, t1, y=1222, ink=False, centre=False):
    tone = 'lt' if ink else 'iv sh'
    if centre:   # the redo review: at x 64, y 1222 the line ran across the piece; centred under the price it sits on clear ground
        return (f'<div class="o" style="left:0;top:{y}px;width:1080px;text-align:center;z-index:15" data-k=\'{tk(t0, t1)}\'>'
                f'<div class="lab7 {tone}" style="font-size:22px">{OFFER2} &nbsp;·&nbsp; {OFFER3}</div></div>')
    return (f'<div class="o" style="left:64px;top:{y}px;z-index:15" data-k=\'{tk(t0, t1)}\'>'
            f'<div class="lab7 {tone}" style="font-size:22px"><span style="color:#FFBDA8">●</span>&nbsp; {OFFER2} &nbsp;·&nbsp; {OFFER3}</div></div>')
def hook(line1, price, mrp, top=300, size=70, ink=False, line2=None):
    tone = 'lt' if ink else 'iv sh'; out = []
    out.append(f'<div class="o" style="left:440px;top:{top - 14}px;width:200px;z-index:16;filter:drop-shadow(0 2px 10px rgba(0,0,0,.5))" data-k=\'{tk(0, 99, now=True)}\'>{logo(letters="#99B4AF")}</div>')
    b = top + 120; out.append(line(line1, 'q', tone, size, 0, b, 0, 99, now=True))
    if line2: b += size * 1.05; out.append(line(line2, 'q', tone, size, 0, b, 0, 99, now=True))
    out.append(f'<div class="o" style="left:0;top:{b + 18:.0f}px;width:1080px;display:flex;justify-content:center;align-items:baseline;gap:20px;z-index:16" data-k=\'{tk(0, 99, now=True)}\'>'
               f'<span class="num7 {tone}" style="font-size:100px">{RS(price)}</span>'
               f'<span class="mrp7" style="font-size:30px">{RS(mrp)}<span class="o strike" data-k=\'{K((0, {"w": 104}, "step"))}\'></span></span></div>')
    return out
