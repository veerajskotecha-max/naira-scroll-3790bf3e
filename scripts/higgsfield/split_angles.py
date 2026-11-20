"""
Cuts each 12-angle contact grid into twelve individual e-commerce stills.

Nano Banana Pro renders one 4096x4096 image holding a 3x4 grid of twelve
camera angles of the same piece. That is one generation — 4 credits — and
each tile lands at roughly 1365x1024, which is large enough to use as a PDP
image on its own.

    python3 scripts/higgsfield/split_angles.py <grid.png> [outDir]
    python3 scripts/higgsfield/split_angles.py --all [outDir]

--all reads angles.json and pulls every SKU's grid down first.

Requires Pillow:  pip install pillow
"""

import json
import os
import subprocess
import sys

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))

COLS, ROWS = 3, 4
# The grid carries thin ivory gutters. Insetting each tile by this fraction
# of its own width drops the gutter without eating into the photograph.
INSET = 0.006


def split(grid_path, out_dir, stem):
    im = Image.open(grid_path).convert("RGB")
    W, H = im.size
    tw, th = W / COLS, H / ROWS
    dx, dy = tw * INSET, th * INSET

    os.makedirs(out_dir, exist_ok=True)
    written = []

    for r in range(ROWS):
        for c in range(COLS):
            n = r * COLS + c + 1
            box = (
                int(c * tw + dx),
                int(r * th + dy),
                int((c + 1) * tw - dx),
                int((r + 1) * th - dy),
            )
            out = os.path.join(out_dir, "%s--angle-%02d.png" % (stem, n))
            im.crop(box).save(out)
            written.append(out)

    return written, im.size


def fetch(url, path):
    if not os.path.exists(path):
        subprocess.run(["curl", "-sSLf", "-o", path, url], check=True)
    return path


def main():
    args = [a for a in sys.argv[1:]]

    if args and args[0] == "--all":
        out_root = args[1] if len(args) > 1 else os.path.join(HERE, "../../gilded-hour-angles")
        out_root = os.path.abspath(out_root)
        grids_dir = os.path.join(out_root, "_grids")
        os.makedirs(grids_dir, exist_ok=True)

        angles = json.load(open(os.path.join(HERE, "angles.json")))
        entries = {k: v for k, v in angles.items() if not k.startswith("_")}

        total = 0
        for handle, entry in entries.items():
            grid = fetch(entry["url"], os.path.join(grids_dir, "%s.png" % handle))
            written, size = split(grid, os.path.join(out_root, handle), handle)
            total += len(written)
            print("%-20s %s -> %d angles" % (handle, "x".join(map(str, size)), len(written)))

        print("\n%d SKUs, %d stills -> %s" % (len(entries), total, out_root))
        return

    if not args:
        print(__doc__)
        sys.exit(1)

    grid_path = args[0]
    out_dir = args[1] if len(args) > 1 else os.path.dirname(grid_path) or "."
    stem = os.path.splitext(os.path.basename(grid_path))[0]
    written, size = split(grid_path, out_dir, stem)
    print("%s %s -> %d angles in %s" % (stem, "x".join(map(str, size)), len(written), out_dir))


if __name__ == "__main__":
    main()
