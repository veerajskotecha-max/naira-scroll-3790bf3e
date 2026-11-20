#!/usr/bin/env python3
"""PUT the bytes for a media_upload spill file and record media_id per filename."""
import json, sys, subprocess, os, re
spill, srcdir, outmap = sys.argv[1], sys.argv[2], sys.argv[3]
d = json.load(open(spill))
got = json.load(open(outmap)) if os.path.exists(outmap) else {}
for u in d["uploads"]:
    # the filename is inside the instructions string: --data-binary @NAME
    m = re.search(r"--data-binary @(\S+?) '", u["instructions"])
    fn = m.group(1)
    p = os.path.join(srcdir, fn)
    r = subprocess.run(["curl","-sS","-o","/dev/null","-w","%{http_code}","-X","PUT",
                        "-H","Content-Type: "+u["content_type"],
                        "--data-binary","@"+p, u["upload_url"]],
                       capture_output=True, text=True)
    code = r.stdout.strip()
    print(code, fn)
    if code == "200":
        got[fn] = u["media_id"]
json.dump(got, open(outmap,"w"), indent=1)
print("recorded", len(got), "media ids")
