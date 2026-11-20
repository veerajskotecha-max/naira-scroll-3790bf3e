"""Render the approval book as a self-contained page you can decide on.

The PDF is fine for looking. This is for deciding: every frame is a toggle, the
tally is live, and the reject list copies out as plain codes so it can be pasted
straight back. Images are inlined as data URIs because the artifact CSP blocks
every external host, which also means the whole thing has to fit in 16MB.
"""
import base64
import html
import importlib.util
import io
import os

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = "/tmp/claude-0/-home-user-naira-scroll-3790bf3e/1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad/approval.html"

# Reuse the curated set list rather than restating it; the filename is hyphenated
# so it cannot be imported normally.
_spec = importlib.util.spec_from_file_location(
    "book", os.path.join(HERE, "build-approval-book.py"))
book = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(book)

# Each set carries the colour of the campaign it came from, so the page reads as
# six chapters rather than one undifferentiated grid.
ACCENT = {
    "I · THE RED ROOM": "#7E1620",
    "II · STILL WATER": "#5C8577",
    "III · AFTER DARK": "#2E2E38",
    "IV · NOT A PHASE": "#116246",
    "V · SOFTLY, SLOWLY, WORN": "#8FA694",
    "VI · UGC": "#C2714E",
}
BLURB = {
    "I · THE RED ROOM": "Oxblood lacquer, water, red glass. Festive with no diya in sight.",
    "II · STILL WATER": "Botanical and water. The quietest set, closest to the house palette.",
    "III · AFTER DARK": "Black ground, one pool of light. Built for gifting season.",
    "IV · NOT A PHASE": "Saturated colour blocks, one impossible idea per frame.",
    "V · SOFTLY, SLOWLY, WORN": "Indian craft materials. Clay, khadi, cardamom, jaali.",
    "VI · UGC": "Phone snapshots. Lifestyle and social, not customer reviews.",
}

# Sized up from 880/68 once the first build came in at 4.2MB against a 16MB
# ceiling. Stones are the thing being judged and they need the pixels.
TARGET_W = 1200
QUALITY = 80


def encode(path):
    im = Image.open(path).convert("RGB")
    if im.width > TARGET_W:
        im = im.resize((TARGET_W, round(im.height * TARGET_W / im.width)), Image.LANCZOS)
    buf = io.BytesIO()
    im.save(buf, "JPEG", quality=QUALITY, optimize=True, progressive=True)
    return base64.b64encode(buf.getvalue()).decode("ascii"), len(buf.getvalue())


def resolve(folder, fname):
    p = os.path.join(folder, fname)
    if os.path.exists(p):
        return p
    code = fname.split("-")[0]
    cand = [f for f in sorted(os.listdir(folder)) if f.startswith(code + "-")]
    return os.path.join(folder, cand[0]) if cand else None


CSS = """
:root{
  --paper:#F7F4EF; --ground:#FFFFFF; --ink:#17161A; --muted:#6E6A64;
  --rule:#DFD9CF; --card:#FFFFFF; --shadow:0 1px 2px rgba(23,22,26,.06),0 8px 24px rgba(23,22,26,.05);
  --strike:#8A2B20; --ok:#2F6B4F;
}
@media (prefers-color-scheme:dark){
  :root:not([data-theme="light"]){
    --paper:#131215; --ground:#0E0D10; --ink:#EDE9E2; --muted:#9B958C;
    --rule:#2C2A30; --card:#1A181D; --shadow:0 1px 2px rgba(0,0,0,.5),0 8px 28px rgba(0,0,0,.45);
    --strike:#E08172; --ok:#7FBF9B;
  }
}
:root[data-theme="dark"]{
  --paper:#131215; --ground:#0E0D10; --ink:#EDE9E2; --muted:#9B958C;
  --rule:#2C2A30; --card:#1A181D; --shadow:0 1px 2px rgba(0,0,0,.5),0 8px 28px rgba(0,0,0,.45);
  --strike:#E08172; --ok:#7FBF9B;
}
*{box-sizing:border-box}
body{
  margin:0; background:var(--paper); color:var(--ink);
  font-family:ui-sans-serif,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;
  font-size:16px; line-height:1.55; -webkit-font-smoothing:antialiased;
}
.serif{font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,"Times New Roman",serif}
.wrap{max-width:1180px;margin:0 auto;padding:0 24px}

header.top{
  position:sticky;top:0;z-index:20;background:color-mix(in srgb,var(--paper) 92%,transparent);
  backdrop-filter:blur(10px);border-bottom:1px solid var(--rule);
}
.topbar{display:flex;align-items:center;gap:16px;padding:12px 0;flex-wrap:wrap}
.mark{font-size:19px;letter-spacing:.34em;font-weight:600}
.mark em{font-style:normal;color:var(--muted)}
.tally{margin-left:auto;display:flex;align-items:center;gap:10px;font-size:13px;color:var(--muted)}
.count{font-variant-numeric:tabular-nums;font-weight:600;color:var(--ink)}
button{
  font:inherit;font-size:13px;padding:7px 13px;border-radius:2px;cursor:pointer;
  border:1px solid var(--rule);background:var(--card);color:var(--ink);
  transition:border-color .15s,color .15s;
}
button:hover{border-color:var(--ink)}
button:focus-visible{outline:2px solid var(--ink);outline-offset:2px}

.hero{padding:64px 0 36px;border-bottom:1px solid var(--rule)}
.hero h1{font-size:clamp(38px,7vw,72px);line-height:1.02;margin:0 0 18px;font-weight:500;text-wrap:balance;letter-spacing:-.015em}
.hero p{max-width:62ch;color:var(--muted);margin:0 0 10px;font-size:17px}
.eyebrow{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--muted);margin:0 0 20px}
.how{margin-top:26px;padding:14px 16px;border:1px solid var(--rule);border-left:3px solid var(--ink);background:var(--card);max-width:62ch;font-size:14.5px}

section.set{padding:52px 0 8px}
.sethead{display:flex;align-items:baseline;gap:14px;flex-wrap:wrap;margin-bottom:6px}
.setbar{height:5px;width:100%;margin-bottom:18px;border-radius:2px}
.sethead h2{font-size:23px;margin:0;font-weight:600;letter-spacing:.05em}
.sethead .n{font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums}
.sethead p{margin:0;color:var(--muted);font-size:14.5px;flex-basis:100%}

.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:26px;margin-top:24px}
.card{
  background:var(--card);border:1px solid var(--rule);box-shadow:var(--shadow);
  display:flex;flex-direction:column;text-align:left;padding:0;overflow:hidden;
  border-radius:2px;transition:opacity .18s,border-color .18s;
}
.card img{width:100%;display:block;aspect-ratio:4/5;object-fit:cover;background:var(--paper)}
.meta{padding:13px 14px 15px;display:flex;flex-direction:column;gap:5px}
.row1{display:flex;align-items:baseline;gap:9px}
.code{font-size:12px;font-weight:700;letter-spacing:.08em;font-variant-numeric:tabular-nums}
.sku{font-size:11.5px;color:var(--muted);margin-left:auto;font-variant-numeric:tabular-nums}
.why{font-size:13.5px;color:var(--muted);line-height:1.45}
.state{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ok)}
.card[aria-pressed="true"]{opacity:.42;border-color:var(--strike)}
.card[aria-pressed="true"] img{filter:grayscale(1)}
.card[aria-pressed="true"] .state{color:var(--strike)}
.card[aria-pressed="true"] .code{text-decoration:line-through}

footer{margin:64px 0 80px;padding-top:26px;border-top:1px solid var(--rule);color:var(--muted);font-size:14px}
#out{width:100%;margin-top:12px;padding:11px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
  font-size:13px;border:1px solid var(--rule);background:var(--card);color:var(--ink);border-radius:2px;min-height:76px}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
"""

JS = """
const cards=[...document.querySelectorAll('.card')];
const total=cards.length;
const kept=document.getElementById('kept');
const out=document.getElementById('out');
function refresh(){
  const rejects=cards.filter(c=>c.getAttribute('aria-pressed')==='true');
  kept.textContent=(total-rejects.length)+' of '+total;
  out.value = rejects.length
    ? 'Strike these '+rejects.length+':\\n'+rejects.map(c=>c.dataset.code+'  '+c.dataset.sku).join('\\n')
    : 'Nothing struck — all '+total+' approved.';
}
cards.forEach(c=>{
  c.addEventListener('click',()=>{
    const on=c.getAttribute('aria-pressed')==='true';
    c.setAttribute('aria-pressed',String(!on));
    c.querySelector('.state').textContent=on?'Keep':'Struck';
    refresh();
  });
});
document.getElementById('reset').addEventListener('click',()=>{
  cards.forEach(c=>{c.setAttribute('aria-pressed','false');c.querySelector('.state').textContent='Keep';});
  refresh();
});
document.getElementById('copy').addEventListener('click',async e=>{
  try{await navigator.clipboard.writeText(out.value);e.target.textContent='Copied';
    setTimeout(()=>e.target.textContent='Copy list',1400);}catch(_){out.select();}
});
refresh();
"""


def main():
    total_bytes, n = 0, 0
    body = []
    for label, _accent, folder, shots in book.SETS:
        acc = ACCENT[label]
        cards = []
        for fname, sku, why in shots:
            p = resolve(folder, fname)
            if not p:
                continue
            b64, sz = encode(p)
            total_bytes += sz
            n += 1
            code = os.path.basename(p).split("-")[0].upper()
            cards.append(
                '<button class="card" type="button" aria-pressed="false" '
                'data-code="%s" data-sku="%s">'
                '<img src="data:image/jpeg;base64,%s" alt="%s" loading="lazy">'
                '<span class="meta"><span class="row1"><span class="code">%s</span>'
                '<span class="sku">%s</span></span>'
                '<span class="why">%s</span><span class="state">Keep</span></span></button>'
                % (code, html.escape(sku), b64, html.escape(why), code,
                   html.escape(sku), html.escape(why)))
        body.append(
            '<section class="set"><div class="setbar" style="background:%s"></div>'
            '<div class="sethead"><h2 class="serif">%s</h2><span class="n">%d frames</span>'
            '<p>%s</p></div><div class="grid">%s</div></section>'
            % (acc, html.escape(label), len(cards), html.escape(BLURB[label]), "".join(cards)))

    page = (
        '<title>Naira Flore · Image Approval</title>'
        '<style>%s</style>'
        '<header class="top"><div class="wrap topbar">'
        '<span class="mark serif">NAIRA<em>·</em>FLORE</span>'
        '<span class="tally"><span>Keeping</span><span class="count" id="kept"></span>'
        '<button id="reset" type="button">Reset</button>'
        '<button id="copy" type="button">Copy list</button></span>'
        '</div></header>'
        '<main class="wrap">'
        '<div class="hero"><p class="eyebrow">For approval · %d frames · all 1856 × 2304</p>'
        '<h1 class="serif">Every image we already have, ready for the site.</h1>'
        '<p>Six sets. Five campaigns shot against their own worlds, plus the phone-snapshot '
        'set. Nothing here is below 1856 × 2304, so approving the lot adds nothing to the '
        'soft 896 × 1200 heroes still sitting on about forty live listings.</p>'
        '<p>There is no green velvet set. The emerald velvet ground was designed for this '
        'shoot and never used — the green you may be remembering is either the sage chair '
        'behind all twenty bracelet worn frames, or a low-resolution model shot already live '
        'on the site.</p>'
        '<div class="how"><strong>Tap any frame to strike it.</strong> The tally updates as '
        'you go, and <em>Copy list</em> gives you the struck codes to paste back. Say nothing '
        'and all %d go up.</div></div>'
        '%s'
        '<footer><strong>Send this back.</strong> Paste the struck list, or just say '
        '“all of set III” and I will hold those.'
        '<textarea id="out" readonly aria-label="Struck frames"></textarea></footer>'
        '</main><script>%s</script>' % (CSS, n, n, "".join(body), JS))

    with open(OUT, "w") as fh:
        fh.write(page)
    print("%s  %d frames  images %.1f MB  page %.1f MB"
          % (OUT, n, total_bytes / 1048576, os.path.getsize(OUT) / 1048576))


if __name__ == "__main__":
    main()
