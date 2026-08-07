"""Refresh naira-flore-shots/ so the on-disk originals match what is in the books.

Layout is <Group>/<catalogue name> - <SKU>/<SKU>--<shot>.png. Any folder for a
SKU whose frame URL has changed is rewritten; the rest are left alone.
"""
import json
import os
import re
import shutil
import subprocess

ROOT = "/home/user/naira-scroll-3790bf3e"
SHOTS = os.path.join(ROOT, "naira-flore-shots")
CACHE = ("/tmp/claude-0/-home-user-naira-scroll-3790bf3e/"
         "1171b414-e279-55a3-bd3a-591f6de1e021/scratchpad/book")

SAFE = re.compile(r'[<>:"/\\|?*]')


def clean(s):
    return SAFE.sub("-", s).strip().rstrip(".")


def entries():
    G = json.load(open(os.path.join(ROOT, "scripts/higgsfield/results.json")))
    for h, v in sorted(G.items()):
        if h.startswith("_") or not isinstance(v, dict) or "shots" not in v:
            continue
        yield ("Gilded Hour", v.get("sku", h), v.get("name", h),
               {s: v["shots"][s]["url"] for s in ("ecom", "worn", "angle") if s in v["shots"]})

    T = json.load(open(os.path.join(ROOT, "scripts/higgsfield/supplier-tracker.json")))
    for sku, v in sorted(T["done"].items()):
        g = ("Yiss Fera" if sku.startswith("YF")
             else "Yiwu JD" if sku.startswith("JD") else "KAVNAR")
        yield (g, sku, v.get("catalogue_name") or v["name"],
               {s: v[s] for s in ("ecom", "worn", "angle")
                if isinstance(v.get(s), str) and v[s].startswith("http")})


def main():
    wrote = stale = 0
    keep = set()
    for group, sku, name, urls in entries():
        d = os.path.join(SHOTS, group, "%s - %s" % (clean(name), sku))
        keep.add(d)
        os.makedirs(d, exist_ok=True)
        for shot, url in urls.items():
            dst = os.path.join(d, "%s--%s.png" % (sku, shot))
            src = os.path.join(CACHE, "%s--%s.png" % (sku, shot))
            # the cache is keyed off the live URL, so it is the source of truth
            if not os.path.exists(src) or os.path.getsize(src) < 1000:
                subprocess.run(["curl", "-sSLf", "-o", src, url], check=False)
            if not os.path.exists(src):
                continue
            if not os.path.exists(dst) or os.path.getsize(dst) != os.path.getsize(src):
                shutil.copyfile(src, dst)
                wrote += 1

    # folders left over from an older naming pass or a deleted frame
    for group in os.listdir(SHOTS):
        gp = os.path.join(SHOTS, group)
        if not os.path.isdir(gp):
            continue
        for sub in os.listdir(gp):
            p = os.path.join(gp, sub)
            if os.path.isdir(p) and p not in keep:
                shutil.rmtree(p)
                stale += 1

    n = sum(len(f) for _, _, f in os.walk(SHOTS))
    print("copied %d, removed %d stale folders, %d files on disk" % (wrote, stale, n))


if __name__ == "__main__":
    main()
