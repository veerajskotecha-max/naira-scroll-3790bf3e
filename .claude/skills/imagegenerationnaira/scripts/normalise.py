#!/usr/bin/env python3
"""Put a generated frame and a live product photo side by side, scaled so one shared
feature is the same number of pixels in both, with a ruler overlaid so a ratio can be read.

    normalise.py FRAME.png LIVE.img OUT.png [--grid 100] [--crop-a x0,y0,x1,y1] [--crop-b x0,y0,x1,y1]

Crops are fractions of each image (0-1), so the same command works whatever the source size.
Read the two edges of the shared feature off the grid in each panel, then scale one panel by
the ratio and re-run. A miss that is invisible at montage size is obvious once the ruler matches.
"""
import sys
from PIL import Image, ImageDraw

def frac_crop(im, spec):
    if not spec:
        return im
    x0, y0, x1, y1 = (float(v) for v in spec.split(","))
    w, h = im.size
    return im.crop((int(w * x0), int(h * y0), int(w * x1), int(h * y1)))

def grid(im, step, width):
    im = im.resize((width, max(1, int(width * im.height / im.width))))
    d = ImageDraw.Draw(im)
    for x in range(0, im.width, step):
        d.line([(x, 0), (x, im.height)], fill=(0, 80, 255), width=1)
        d.text((x + 3, 3), str(x), fill=(0, 80, 255))
    for y in range(0, im.height, step):
        d.line([(0, y), (im.width, y)], fill=(255, 0, 0), width=1)
        d.text((3, y + 3), str(y), fill=(255, 0, 0))
    return im

def main(argv):
    a_path, b_path, out = argv[1], argv[2], argv[3]
    opts = dict(zip(argv[4::2], argv[5::2]))
    step = int(opts.get("--grid", 100))
    width = int(opts.get("--width", 900))
    a = grid(frac_crop(Image.open(a_path).convert("RGB"), opts.get("--crop-a")), step, width)
    b = grid(frac_crop(Image.open(b_path).convert("RGB"), opts.get("--crop-b")), step, width)
    h = max(a.height, b.height)
    sheet = Image.new("RGB", (a.width + b.width + 20, h + 26), "white")
    d = ImageDraw.Draw(sheet)
    sheet.paste(a, (0, 26)); d.text((4, 7), "FRAME", fill=(0, 0, 0))
    sheet.paste(b, (a.width + 20, 26)); d.text((a.width + 24, 7), "LIVE", fill=(0, 0, 0))
    sheet.save(out)
    print(out, sheet.size)

if __name__ == "__main__":
    main(sys.argv)
