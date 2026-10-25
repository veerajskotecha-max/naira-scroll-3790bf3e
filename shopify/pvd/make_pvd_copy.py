"""PVD coating copy for the stainless steel listings (owner, 25 Oct 2026).

Gold pieces read "PVD 18K gold coating", white pieces "PVD rhodium coating", both
anti-tarnish, and each gets one short line on how PVD differs from regular
plating. Only listings with a Plating line and a steel Material line change:
the "Finish:" ones and those naming no base metal (some on a copper alloy body,
their care says "keep it dry") wait until the owner confirms they are PVD too.

    python3 make_pvd_copy.py <admin-export.jsonl> <out-dir>

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


def main(src: str, out_dir: str) -> None:
    rows = [json.loads(line) for line in open(src)]
    after, skipped = [], []
    for row in rows:
        desc = row["descriptionHtml"] or ""
        if "<li>Plating:" not in desc or not re.search(r"<li>Material:[^<]*steel", desc, re.I):
            skipped.append(row["handle"])
            continue
        new = rewrite(desc)
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
    main(*sys.argv[1:])
