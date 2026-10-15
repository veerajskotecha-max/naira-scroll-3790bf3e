"""Writes the cover page from spec.json: the extended plate, NAIRA masthead (The Cover's colours), cut-out, cover lines, sticker.
Usage: python3 -I page.py <spec.json> <logo_sage.svg> <fonts dir> <work dir with bg/her pngs> <out.html>"""
import json, re, sys
spec_p, logo_p, fonts, work, out = sys.argv[1:6]
spec = json.load(open(spec_p))
svg = open(logo_p).read()
svg = svg.replace('fill="#99B4AF"', 'fill="#5E8279"')          # The Cover's masthead letters; the flower stays blush
W = spec['mast_w']; H = W * 606 / 2708
svg = re.sub(r'<svg [^>]*>', f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2708 606" style="position:absolute; '
             f'left:{(1080 - W) / 2:.1f}px; top:{spec["mast_top"]}px; width:{W}px; height:{H:.1f}px; overflow:visible">', svg, count=1)
k, h, st = spec['kick'], spec['head'], spec['sticker']; d = st['d']
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: CG; src: url('{fonts}/CG.ttf'); font-weight: 300 700; }}
@font-face {{ font-family: CG; font-style: italic; src: url('{fonts}/CG-Italic.ttf'); font-weight: 300 700; }}
@font-face {{ font-family: Jost; src: url('{fonts}/Jost.ttf'); font-weight: 100 900; }}
:root {{ --ivory:#FBF3EC; --deep:#50726A; --blush:#FFBDA8; }}
html, body {{ margin:0; width:1080px; height:1920px; overflow:hidden; background:#000; }}
img.full {{ position:absolute; left:0; top:0; width:1080px; height:1920px; }}
.t {{ position:absolute; white-space:nowrap; }}
.cg {{ font-family:CG; font-style:italic; font-weight:500; line-height:1.02; font-feature-settings:"lnum" 1; }}
.kick {{ font-family:Jost; font-weight:500; text-transform:uppercase; letter-spacing:.22em; color:var(--ivory);
  filter:drop-shadow(0 1px 6px rgba(26,22,20,.7)) drop-shadow(0 1px 1px rgba(26,22,20,.6)); }}
.print {{ color:var(--deep); filter:drop-shadow(0 0 10px rgba(251,243,236,.85)) drop-shadow(0 0 2px rgba(251,243,236,.9)); }}
.sticker {{ position:absolute; border-radius:50%; background:var(--blush); display:flex; flex-direction:column; align-items:center;
  justify-content:center; box-shadow:0 10px 24px rgba(26,22,20,.3); color:var(--deep); transform:rotate(-8deg); }}
#frame {{ position:absolute; left:34px; right:34px; top:{spec['frame_top']}px; bottom:{spec['frame_bottom']}px; border:2px solid rgba(251,243,236,.75); }}
</style></head><body>
<img class="full" src="{work}/bg.png">
{svg}
<img class="full" src="{work}/her.png">
<div id="frame"></div>
<div class="t kick" style="left:0; width:1080px; text-align:center; top:{spec['issue_top']}px; font-size:19px">{spec['issue']}</div>
<div class="t kick print" style="left:{k['x']}px; top:{k['y']}px; font-size:{k['size']}px">{k['text']}</div>
<div class="t cg print" style="left:{h['x']}px; top:{h['y']}px; font-size:{h['size']}px">{h['html']}</div>
<div class="sticker" style="left:{st['x']}px; top:{st['y']}px; width:{d}px; height:{d}px">
  <div style="font-family:CG;font-style:italic;font-weight:600;font-size:{0.38 * d:.0f}px;line-height:1;font-feature-settings:'lnum' 1">{st['pct']}</div>
  <div style="font-family:Jost;font-weight:600;font-size:{0.12 * d:.0f}px;letter-spacing:.22em;margin-top:2px;padding-left:.22em">OFF</div>
  <div style="font-family:Jost;font-weight:400;font-size:{0.1 * d:.0f}px;margin-top:5px;text-decoration:line-through;opacity:.75">{st['was']}</div></div>
</body></html>'''
open(out, 'w').write(html)
