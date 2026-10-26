"""Before and after the fix, side by side: what the phone shows at the same moments.

python3 -I new-listing-sheet.py <cmp dir> <profile> <out.png> <case,case,...> <t1,t2,...ms>
Rows alternate before / after for each case; each row is the median run
(by time to product, else to the shop listing).
"""
import json
import os
import sys

from PIL import Image, ImageDraw, ImageFont

root, profile, out, cases_arg, ticks_arg = sys.argv[1:6]
cases = cases_arg.split(",")
ticks = [int(t) for t in ticks_arg.split(",")]
F = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 15)
FB = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
COL = {"HOME": ("HOMEPAGE", (200, 40, 40)), "SKELETON": ("loading", (120, 120, 120)), "GUARD-PIECE": ("outline", (120, 120, 120)),
       "GUARD-PAGE": ("blank page", (150, 150, 150)), "PRODUCT": ("product", (30, 140, 60)), "PRODUCT+CTA": ("product", (30, 140, 60)),
       "BLANK": ("blank", (220, 130, 0)), "LISTING": ("shop", (40, 90, 200))}
CW, CH, BAND, LEFT, TOP = 150, 255, 24, 270, 44
rows = [(c, side) for c in cases for side in ("before", "after")]
img = Image.new("RGB", (LEFT + len(ticks) * (CW + 6) + 6, TOP + len(rows) * (CH + BAND + 10) + 10), "white")
d = ImageDraw.Draw(img)
d.text((8, 12), f"A link to a piece listed after the last Publish, {profile} profile (iPhone 13). Median of 3 cold loads; same server.", fill="black", font=FB)
for i, (case, side) in enumerate(rows):
    results = json.load(open(os.path.join(root, side, f"results-{profile}.json")))
    runs = sorted([r for r in results if r["case"] == case], key=lambda r: r["productAt"] or r["listingAt"] or 10**9)
    r = runs[len(runs) // 2]
    tk = {t["t"]: t for t in json.load(open(os.path.join(root, side, "frames", profile, case, f"run{r['run']}", "ticks.json")))["ticks"]}
    y = TOP + i * (CH + BAND + 10)
    d.text((8, y + 6), f"{side.upper()}  {case}", fill="black", font=FB)
    d.text((8, y + 30), r["url"], fill=(70, 70, 70), font=F)
    lines = []
    if r.get("homeTo"):
        lines.append(f"homepage {r['homeFrom']/1000:.1f}–{(r['homeTo'] if r['homeTo'] != 'still' else 0)/1000:.1f} s")
    if r.get("guardFrom"):
        lines.append(f"outline from {r['guardFrom']/1000:.1f} s")
    done = r["productAt"] or r["listingAt"]
    if done:
        lines.append(("product" if r["productAt"] else "shop") + f" at {done/1000:.2f} s")
    for k, line in enumerate(lines):
        d.text((8, y + 60 + k * 22), line, fill=(70, 70, 70), font=F)
    for col, t in enumerate(ticks):
        x = LEFT + col * (CW + 6)
        info = tk.get(t)
        if info and info["file"]:
            tile = Image.open(info["file"]).convert("RGB").resize((CW, CH))
            label, colour = COL.get(info["view"], (info["view"].lower(), (90, 90, 90)))
        else:
            tile = Image.new("RGB", (CW, CH), "white")
            label, colour = "nothing yet", (150, 150, 150)
        img.paste(tile, (x, y + BAND))
        d.rectangle([x, y, x + CW - 1, y + BAND - 1], fill=colour)
        d.text((x + 4, y + 3), f"{t/1000:.1f}s {label}", fill="white", font=F)
        d.rectangle([x, y + BAND, x + CW - 1, y + BAND + CH - 1], outline=(200, 200, 200))
img.save(out, optimize=True)
print(out)
