"""Helpers for the product-only redos (exec'd after col_kit and endcard7)."""
def aim(px, py, rect, s):
    """ax, ay that put the point (px, py) of a full 1080x1920 frame at the centre of a rect tile at zoom s"""
    rx, ry, rw, rh = rect; k = max(rw / 1080, rh / 1920) * s; dw, dh = 1080 * k, 1920 * k
    ax = (rw / 2 - px / 1080 * dw) / (rw - dw); ay = (rh / 2 - py / 1920 * dh) / (rh - dh)
    return dict(rect=list(rect), zoom=[s, s * 1.02], ax=round(ax, 4), ay=round(ay, 4))
def elbow(x, y, x2, y2, label, t0, t1, tone='lt', size=20, side='r', ink='#1A1614', glow=''):
    """a callout: a dot on the feature, a hairline up to (x, y2) then across to (x2, y2), the label at the end"""
    out = [dot(x, y, t0, t1, r=6, fill=ink if tone == 'lt' else '#FBF3EC'),
           draw(f'M{x} {y - 8}L{x} {y2}L{x2} {y2}', t0 + .12, t1, stroke=ink if tone == 'lt' else '#FBF3EC', width=1.6, d=.4)]
    if side == 'r':
        out.append(f'<div class="o" style="left:{x2 + 12}px;top:{y2 - size * .62:.0f}px;z-index:18" data-k=\'{tk(t0 + .45, t1)}\'><div class="lab7 {tone}" style="font-size:{size}px;{glow}">{label}</div></div>')
    else:
        out.append(f'<div class="o ta-r" style="left:{x2 - 12 - 1080}px;top:{y2 - size * .62:.0f}px;width:1080px;z-index:18" data-k=\'{tk(t0 + .45, t1)}\'><div class="lab7 {tone}" style="font-size:{size}px;margin-right:-.22em;{glow}">{label}</div></div>')
    return out
def gold_frame(x, y, w, h, t0, t1, colour='#D9B26A', width=2.2, d=.7):
    return draw(f'M{x} {y}L{x + w} {y}L{x + w} {y + h}L{x} {y + h}Z', t0, t1, stroke=colour, width=width, d=d, z=17)
def vlabel(x, ymid, text, t0, t1, tone='lt', size=46):
    """a measurement label set vertically along a rule"""
    return (f'<div class="o" style="left:{x - 300}px;top:{ymid - 30}px;width:600px;z-index:18" data-k=\'{tk(t0, t1)}\'>'   # the engine owns the outer transform
            f'<div class="num7 {tone}" style="font-size:{size}px;text-align:center;transform:rotate(-90deg)">{text}</div></div>')
