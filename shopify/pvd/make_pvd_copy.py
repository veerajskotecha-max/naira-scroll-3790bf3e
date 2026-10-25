"""PVD coating copy for the stainless steel listings (owner, 25 Oct 2026).

Gold pieces read "PVD 18K gold coating", white pieces "PVD rhodium coating", both
anti-tarnish, and each gets one short line on how PVD differs from regular
plating. Only listings with a Plating line and a steel Material line change:
the "Finish:" ones and those naming no base metal (some on a copper alloy body,
their care says "keep it dry") wait until the owner confirms they are PVD too.

    python3 make_pvd_copy.py <admin-export.jsonl> <out-dir> [--held]

--held covers the rest (owner, 25 Oct 2026: "Yes, all are PVD"): listings with
no steel Material line, the "Finish:" ones, the older "The making." drafts and
the one-line draft stubs. Deco Ribbon Hoops is skipped: its stub names no metal.

Writes <out-dir>/after.jsonl (handle, id, before, after), <out-dir>/vars.jsonl
(bulk productUpdate variables) and prints a review of every change.
"""
import html
import json
import re
import sys

PLATING = {
    "18k gold tone plated": "PVD 18K gold coating, anti-tarnish",
    "18k PVD gold tone plated": "PVD 18K gold coating, anti-tarnish",
    "18k gold tone plated or rhodium plated silver tone (choose above)": "PVD 18K gold or PVD rhodium coating (choose above), anti-tarnish",
    "Rhodium plated silver tone or 18k gold tone plated (choose above)": "PVD rhodium or PVD 18K gold coating (choose above), anti-tarnish",
    "Rhodium plated silver tone": "PVD rhodium coating, anti-tarnish",
    "Rhodium plated": "PVD rhodium coating, anti-tarnish",
    "Rhodium silver tone PVD plated": "PVD rhodium coating, anti-tarnish",
    "18k gold tone plated findings": "PVD 18K gold coating on the findings, anti-tarnish",
    "18k gold tone plated and rhodium plated silver tone": "PVD 18K gold and PVD rhodium coating, anti-tarnish",
    "Silver tone strand with 18k gold tone clasp and charm": "Polished steel strand with a PVD 18K gold coated clasp and charm, anti-tarnish",
    "Rose gold tone plated": "PVD rose gold coating, anti-tarnish",
    "18k gold tone plated bezels on a steel tone shank": "PVD 18K gold coated bezels on a steel tone shank, anti-tarnish",
    "Rose gold tone, rhodium silver tone and 18k gold tone": "PVD rose gold, PVD rhodium and PVD 18K gold coating, anti-tarnish",
}

# The site splits plain-text specs on "Label:" where the label is a capitalised
# word plus up to two lowercase words, so "PVD vs plating" parses as a label.
# No metal names here: the site rewrites gold/silver words to suit each piece.
PVD_LINE = ("PVD vs plating: Regular plating is a soft layer that wears off over time. "
            "PVD is bonded to the metal in a vacuum, so it is far harder, stands up to "
            "sweat and keeps its colour much longer.")

# The finish method named elsewhere in a listing (blurb, tip, other specs).
PHRASES = [
    ("rhodium plated silver tone", "PVD rhodium coated"),
    ("rhodium plated", "PVD rhodium coated"),
    ("18k PVD gold tone plated", "PVD 18K gold coated"),
    ("18k gold tone plated", "PVD 18K gold coated"),
    ("rose gold plated", "PVD rose gold coated"),
    ("Tarnish resistant gold plating", "Tarnish resistant PVD gold coating"),
    ("gold tone plating", "PVD gold coating"),
    ("PVD plating", "PVD coating"),
    ("The plating is finished", "The PVD coating is finished"),
    ("just weight, plating and pattern", "just weight, PVD coating and pattern"),
]


def rewrite(desc: str) -> str:
    li = re.compile(r"<li>Plating:\s*(.*?)</li>", re.S)
    found = li.findall(desc)
    if len(found) != 1:
        raise ValueError(f"{len(found)} Plating lines")
    value = html.unescape(found[0]).strip()
    if value not in PLATING:
        raise ValueError(f"unknown plating {value!r}")
    head, tail = li.split(desc, maxsplit=1)[0], li.split(desc, maxsplit=1)[2]
    for old, new in PHRASES:
        head = re.sub(re.escape(old), new, head, flags=re.I)
        tail = re.sub(re.escape(old), new, tail, flags=re.I)
    out = f"{head}<li>Plating: {PLATING[value]}</li>{tail}"
    if "PVD vs plating:" not in out:
        anchor = re.search(r"<li>Material:.*?</li>", out, re.S) or re.search(r"<li>Plating:.*?</li>", out, re.S)
        out = out[: anchor.end()] + f"\n<li>{PVD_LINE}</li>" + out[anchor.end():]
    return out


GOLD = "PVD 18K gold coating, anti-tarnish"
WHITE = "PVD rhodium coating, anti-tarnish"
FINISH = {
    "Polished gold tone": GOLD,
    "Gold tone": GOLD,
    "Bright silver tone": WHITE,
    "Rhodium silver tone": WHITE,
    "Silver tone cable with 18k gold tone ends": "PVD rhodium coated cable with PVD 18K gold coated ends, anti-tarnish",
}
# One-line draft stubs: the metal their sentence names.
STUBS = {"riviere-eternal-bracelet-1": GOLD, "pearl-crossover-ring": GOLD}


def with_pvd_line(out: str) -> str:
    anchor = re.search(r"<li>Material:.*?</li>", out, re.S) or re.search(r"<li>Plating:.*?</li>", out, re.S)
    return out[: anchor.end()] + f"\n<li>{PVD_LINE}</li>" + out[anchor.end():]


def rewrite_held(handle: str, desc: str):
    """The listings the first pass left alone, or None to keep one as it is."""
    if "<li>Plating:" in desc:
        return rewrite(desc)
    for old, new in PHRASES:
        desc = re.sub(re.escape(old), new, desc, flags=re.I)
    finish = re.search(r"<li>Finish:\s*(.*?)</li>", desc, re.S)
    if finish and html.unescape(finish.group(1)).strip() in FINISH:
        plating = FINISH[html.unescape(finish.group(1)).strip()]
        out = desc[: finish.end()] + f"\n<li>Plating: {plating}</li>" + desc[finish.end():]
        return with_pvd_line(out)
    body = re.search(r"<li>Body:[^<]*silver tone</li>", desc)
    if body:  # Verdant Drop: copper alloy body, finished in silver tone
        out = desc[: body.end()] + f"\n<li>Plating: {WHITE}</li>" + desc[body.end():]
        return with_pvd_line(out)
    making = re.search(r"<li>18k gold-plated 316L stainless steel</li>", desc)
    if making:  # the older "The making." drafts
        out = desc.replace(making.group(0), "<li>PVD 18K gold coated 316L stainless steel, anti-tarnish</li>")
        end = out.index("<li>PVD 18K gold coated 316L") + len("<li>PVD 18K gold coated 316L stainless steel, anti-tarnish</li>")
        return out[:end] + f"\n<li>{PVD_LINE}</li>" + out[end:]
    if handle in STUBS:
        return desc + f"<p><strong>Details</strong></p><ul>\n<li>Plating: {STUBS[handle]}</li>\n<li>{PVD_LINE}</li>\n</ul>"
    return None


def main(src: str, out_dir: str, held: bool = False) -> None:
    rows = [json.loads(line) for line in open(src)]
    after, skipped = [], []
    for row in rows:
        desc = row["descriptionHtml"] or ""
        steel = "<li>Plating:" in desc and re.search(r"<li>Material:[^<]*steel", desc, re.I)
        if "PVD vs plating:" in desc or (not held and not steel):
            skipped.append(row["handle"])
            continue
        new = rewrite(desc) if steel else rewrite_held(row["handle"], desc)
        if new is None:
            skipped.append(row["handle"])
            continue
        if new != desc:
            after.append({"id": row["id"], "handle": row["handle"], "status": row["status"], "before": desc, "after": new})
    with open(f"{out_dir}/after.jsonl", "w") as f:
        for a in after:
            f.write(json.dumps(a, ensure_ascii=False) + "\n")
    with open(f"{out_dir}/vars.jsonl", "w") as f:
        for a in after:
            f.write(json.dumps({"product": {"id": a["id"], "descriptionHtml": a["after"]}}, ensure_ascii=False) + "\n")
    print(f"changed {len(after)}, left alone {len(skipped)}")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if a != "--held"]
    main(*args, held="--held" in sys.argv)
