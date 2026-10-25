"""Decode every Drive download that overflowed to a tool-results file.

download_file_content returns the image as base64 inside a JSON envelope, and
anything above the token ceiling gets written to disk instead of returned. This
drains that directory into audit/src/<SKU>/<title>, keyed by the folder map so
each photo lands beside its SKU's other two.
"""
import base64
import glob
import json
import os

SCRATCH = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
           "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad")
TOOLRES = ("/root/.claude/projects/-home-user-naira-scroll-3790bf3e/"
           "1171b414-e279-55a3-bd3a-591f6de1e021/tool-results")
OUT = os.path.join(SCRATCH, "audit/src")

fmap = json.load(open(os.path.join(SCRATCH, "audit/folder-map.json")))
need = json.load(open(os.path.join(SCRATCH, "audit/need.json")))
by_id = {fid: (sku, title) for sku, title, fid in need}

wrote, skipped = 0, 0
for p in glob.glob(os.path.join(TOOLRES, "mcp-Google_Drive-download_file_content-*.txt")):
    try:
        d = json.load(open(p))
    except (ValueError, OSError):
        skipped += 1
        continue
    fid = d.get("id")
    if fid not in by_id or not d.get("content"):
        skipped += 1
        continue
    sku, title = by_id[fid]
    dst_dir = os.path.join(OUT, sku)
    os.makedirs(dst_dir, exist_ok=True)
    dst = os.path.join(dst_dir, title)
    if os.path.exists(dst) and os.path.getsize(dst) > 1000:
        continue
    open(dst, "wb").write(base64.b64decode(d["content"]))
    wrote += 1

have = {s: len(os.listdir(os.path.join(OUT, s))) for s in os.listdir(OUT)} if os.path.isdir(OUT) else {}
still = [(s, t, f) for s, t, f in need
         if not os.path.exists(os.path.join(OUT, s, t))]
print("decoded %d, skipped %d | SKUs with new photos: %d | still to fetch: %d"
      % (wrote, skipped, len(have), len(still)))
json.dump(still, open(os.path.join(SCRATCH, "audit/still.json"), "w"), indent=1)
