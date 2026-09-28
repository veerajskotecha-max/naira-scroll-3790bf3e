"""Render every text layer of the Pankti re-edit as a transparent 1080x1920 PNG.

Type is set in the site's own faces (Cormorant Garamond, Jost) through Chromium,
so kerning, tracking and italics match nairaflore.com rather than an ffmpeg
drawtext approximation. Every block is kept inside Meta's Reels safe area:
top 14% (269px), bottom 35% (y > 1248px) and 6% (65px) each side are left clear.
"""
import json, os, subprocess, sys

S = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(S, "ov")
os.makedirs(OUT, exist_ok=True)
CHROME = os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")

INK, IVORY, GOLD, GOLD_DEEP, GOLD_SHADOW = "#1A1614", "#FBF3EC", "#C99A4C", "#B0843A", "#9A7634"
SAFE_TOP, SAFE_BOTTOM = 269, 1248

FONTS = f"""
@font-face {{ font-family: CG; src: url('file://{S}/fonts/CG.ttf'); font-weight: 300 700; }}
@font-face {{ font-family: CG; font-style: italic; src: url('file://{S}/fonts/CG-Italic.ttf'); font-weight: 300 700; }}
@font-face {{ font-family: Jost; src: url('file://{S}/fonts/Jost.ttf'); font-weight: 100 900; }}
"""

# Two tones, chosen per shot by what sits behind the words: ivory over hair,
# skin and shadow; ink over Pankti's light grey tee, where ivory would vanish.
TONE = {
    "ivory": dict(fg=IVORY, sub=IVORY, rule=GOLD,
                  shadow="0 2px 26px rgba(26,22,20,.6), 0 1px 4px rgba(26,22,20,.55)"),
    "ink": dict(fg=INK, sub=INK, rule=GOLD_DEEP,
                shadow="0 0 26px rgba(251,243,236,.85), 0 0 8px rgba(251,243,236,.6)"),
}


def page(body, css, bg="transparent"):
    return f"""<!doctype html><html><head><meta charset="utf-8"><style>{FONTS}
html,body{{margin:0;width:1080px;height:1920px;background:{bg};overflow:hidden}}
.b{{position:absolute;left:65px;right:65px;text-align:center;transform:translateY(-50%)}}
{css}</style></head><body>{body}</body></html>"""


def line(text, y, tone):
    t = TONE[tone]
    css = f""".l{{font-family:CG;font-style:italic;font-weight:500;font-size:104px;line-height:1.05;
letter-spacing:.005em;color:{t['fg']};text-shadow:{t['shadow']}}}"""
    return page(f'<div class="b l" style="top:{y}px">{text}</div>', css)


def label(name, price, y, tone):
    t = TONE[tone]
    css = f""".n{{font-family:Jost;font-weight:500;font-size:40px;letter-spacing:.28em;text-transform:uppercase;
color:{t['fg']};text-shadow:{t['shadow']};padding-left:.28em}}
.r{{width:72px;height:2px;background:{t['rule']};margin:22px auto 16px}}
.p{{font-family:CG;font-weight:500;font-size:96px;color:{t['fg']};text-shadow:{t['shadow']}}}"""
    return page(f'<div class="b" style="top:{y}px"><div class="n">{name}</div><div class="r"></div>'
                f'<div class="p">{price}</div></div>', css)


def offer(y, tone):
    t = TONE[tone]
    css = f""".o{{font-family:CG;font-style:italic;font-weight:500;font-size:112px;line-height:1;color:{t['fg']};text-shadow:{t['shadow']}}}
.s{{font-family:CG;font-weight:500;font-size:58px;color:{t['fg']};opacity:.8;text-decoration:line-through;
text-decoration-thickness:2px;margin-bottom:6px;text-shadow:{t['shadow']}}}
.k{{font-family:Jost;font-weight:500;font-size:28px;letter-spacing:.26em;text-transform:uppercase;color:{t['fg']};
text-shadow:{t['shadow']};margin-top:26px;padding-left:.26em}}"""
    return page(f'<div class="b" style="top:{y}px"><div class="s">₹2,598</div>'
                f'<div class="o">both for ₹2,338</div>'
                f'<div class="k">10% off in the bag · no code</div></div>', css)


def endcard():
    """Logo, the pair's price, where to buy. All of it inside the safe area."""
    logo = open(os.path.join(S, "logo_ink.svg")).read()
    css = f""".w{{position:absolute;left:50%;top:600px;width:700px;transform:translate(-50%,-50%)}}
.w svg{{width:100%;height:auto;display:block}}
.c{{position:absolute;left:0;right:0;text-align:center;transform:translateY(-50%)}}
.r{{position:absolute;left:50%;top:760px;width:96px;height:2px;background:{GOLD};transform:translateX(-50%)}}
.o{{top:870px;font-family:CG;font-style:italic;font-weight:500;font-size:96px;color:{INK}}}
.o s{{font-style:normal;font-size:58px;opacity:.55;text-decoration-thickness:2px;margin-right:18px}}
.k{{top:975px;font-family:Jost;font-weight:500;font-size:28px;letter-spacing:.26em;padding-left:.26em;color:{INK}}}
.u{{top:1085px;font-family:CG;font-style:italic;font-weight:500;font-size:62px;color:{INK}}}
.f{{top:1190px;font-family:Jost;font-weight:400;font-size:25px;letter-spacing:.24em;padding-left:.24em;color:{GOLD_SHADOW}}}"""
    body = (f'<div class="w">{logo}</div><div class="r"></div>'
            f'<div class="c o"><s>₹2,598</s>both for ₹2,338</div>'
            f'<div class="c k">10% OFF IN THE BAG · NO CODE</div>'
            f'<div class="c u">nairaflore.com/jewellery</div>'
            f'<div class="c f">TARNISH FREE · WATERPROOF · HYPOALLERGENIC</div>')
    return page(body, css, bg=IVORY)


def render(name, html):
    src = os.path.join(OUT, name + ".html")
    png = os.path.join(OUT, name + ".png")
    open(src, "w").write(html)
    subprocess.run([CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                    "--force-device-scale-factor=1", "--default-background-color=00000000",
                    "--allow-file-access-from-files", "--virtual-time-budget=3000",
                    f"--screenshot={png}", "--window-size=1080,1920", "file://" + src],
                   check=True, capture_output=True)
    return png


if __name__ == "__main__":
    spec = json.load(open(sys.argv[1]))
    for o in spec:
        kind = o["kind"]
        if kind == "line":
            html = line(o["text"], o["y"], o["tone"])
        elif kind == "label":
            html = label(o["name"], o["price"], o["y"], o["tone"])
        elif kind == "offer":
            html = offer(o["y"], o["tone"])
        else:
            html = endcard()
        print(render(o["id"], html))
