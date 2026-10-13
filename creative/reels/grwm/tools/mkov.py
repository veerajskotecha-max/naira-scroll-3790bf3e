# Writes the title page: "get ready with" + the NAIRA wordmark (sage letters, blush flower) on an ivory label, animated by setT(t).
import re, sys
S = sys.argv[1]
svg = open(f'{S}/v15/img/logo_sage.svg').read()
paths = re.findall(r'<path [^>]*/>', svg)
letters, flower = paths
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face {{ font-family: CG; font-style: italic; src: url('{S}/fonts/CG-Italic.ttf'); font-weight: 300 700; }}
html, body {{ margin:0; width:1080px; height:1920px; overflow:hidden; background:transparent; }}
#card {{ position:absolute; left:{540 - 250}px; top:1180px; width:500px; height:226px; box-sizing:border-box; background:#FBF3EC;
  box-shadow:0 18px 48px rgba(26,22,20,.22), 0 2px 6px rgba(26,22,20,.10); transform-origin:50% 50%; }}
#rule {{ position:absolute; inset:12px; border:1.5px solid #99B4AF; opacity:.7; }}
#kick {{ position:absolute; left:0; right:0; top:44px; text-align:center; white-space:nowrap; font-family:CG; font-style:italic; font-weight:500;
  font-size:50px; line-height:1; color:#50726A; }}
#wm {{ position:absolute; left:{(500 - 300) // 2}px; top:118px; width:300px; height:{300 * 606 / 2708:.2f}px; overflow:visible; }}
#flower {{ transform-box:fill-box; transform-origin:50% 50%; }}
</style></head><body>
<div id="card"><div id="rule"></div><div id="kick">get ready with</div>
<svg id="wm" viewBox="0 0 2708 606"><g id="letters">{letters}</g><g id="flower">{flower}</g></svg></div>
<script>
const $ = id => document.getElementById(id);
const cl = x => Math.max(0, Math.min(1, x));
const P = (t, a, d) => cl((t - a) / d);
const out3 = x => 1 - Math.pow(1 - x, 3), io = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const lerp = (a, b, p) => a + (b - a) * p;
window.setT = t => {{
  // entry: the label lands, then the words, then NAIRA, then the flower opens as the I
  const ex = P(t, 8.00, .30), exC = P(t, 8.12, .33);          // exit: words first, then the label, gone by the silence at 8.45
  const card = $('card'), k = $('kick'), L = $('letters'), F = $('flower');
  card.style.opacity = Math.min(out3(P(t, .30, .45)), 1 - io(exC));
  card.style.transform = `translateY(${{lerp(26, 0, out3(P(t, .30, .65))) - 8 * io(exC)}}px) scale(${{lerp(1, .985, io(exC))}})`;
  const wOut = 1 - io(ex), blur = 4 * io(ex), lift = -10 * io(ex);
  k.style.opacity = Math.min(out3(P(t, .50, .45)), wOut);
  k.style.letterSpacing = `${{lerp(.10, .02, out3(P(t, .50, .60)))}}em`;
  k.style.transform = `translateY(${{lerp(12, 0, out3(P(t, .50, .55))) + lift}}px)`;
  k.style.filter = `blur(${{blur}}px)`;
  const wm = $('wm');
  wm.style.transform = `translateY(${{lerp(12, 0, out3(P(t, .70, .55))) + lift}}px)`;
  wm.style.filter = `blur(${{blur}}px)`;
  L.style.opacity = Math.min(out3(P(t, .70, .45)), wOut);
  const b = out3(P(t, .90, .55));
  F.style.opacity = Math.min(out3(P(t, .90, .25)), wOut);
  F.style.transform = `rotate(${{lerp(-60, 0, b)}}deg) scale(${{lerp(.55, 1, b)}})`;
}};
window.ready = document.fonts.ready.then(() => document.fonts.load("italic 500 50px CG")).then(() => true);
</script></body></html>'''
open(f'{S}/v20/ov/index.html', 'w').write(html)
print('ok', len(html))
