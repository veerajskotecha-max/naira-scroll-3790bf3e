"""POST one file to a Shopify staged-upload target. Usage: post.py target.json file"""
import json, subprocess, sys
t = json.load(open(sys.argv[1]))
args = ["curl", "-sS", "-o", "/dev/null", "-w", "%{http_code}", "-X", "POST", t["url"]]
for p in t["parameters"]:
    args += ["-F", f"{p['name']}={p['value']}"]
args += ["-F", f"file=@{sys.argv[2]}"]
print(subprocess.run(args, capture_output=True, text=True).stdout)
