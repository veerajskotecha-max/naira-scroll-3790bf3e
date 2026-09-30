"""Template tracker: follow a small patch (ring / earring / huggie) through a shot.
NCC template match in a search window around the last position; the template is
refreshed slowly so it follows appearance changes without drifting off the object."""
import cv2, json, os, sys, numpy as np
FRAMES = os.environ.get("FRAMES", "frames")
def track(f0, f1, x, y, half=60, search=80, alpha=0.15, start=None):
    gray = lambda f: cv2.GaussianBlur(cv2.cvtColor(cv2.imread(f"{FRAMES}/f_{f:05d}.jpg"), cv2.COLOR_BGR2GRAY), (3, 3), 0)
    start = start or f0
    out = {}
    def run(frames):
        cx, cy = x, y
        g = gray(frames[0]); tpl = g[cy-half:cy+half, cx-half:cx+half].astype(np.float32)
        for f in frames:
            g = gray(f).astype(np.float32)
            x0, y0 = max(0, cx-half-search), max(0, cy-half-search)
            win = g[y0:min(g.shape[0], cy+half+search), x0:min(g.shape[1], cx+half+search)]
            r = cv2.matchTemplate(win, tpl, cv2.TM_CCOEFF_NORMED)
            _, score, _, loc = cv2.minMaxLoc(r)
            nx, ny = x0+loc[0]+half, y0+loc[1]+half
            if score > 0.35: cx, cy = nx, ny
            patch = g[cy-half:cy+half, cx-half:cx+half]
            if patch.shape == tpl.shape and score > 0.5: tpl = (1-alpha)*tpl + alpha*patch
            out[f] = (cx, cy, round(float(score), 3))
    run(list(range(start, f1+1)))
    if start > f0: run(list(range(start, f0-1, -1)))
    return out
if __name__ == "__main__":
    spec = json.load(open(sys.argv[1])); res = {}
    for name, s in spec.items():
        res[name] = {str(k): v for k, v in sorted(track(**s).items())}
        sc = [v[2] for v in res[name].values()]
        print(name, "frames", len(sc), "min score", min(sc), "mean", round(sum(sc)/len(sc), 3))
    json.dump(res, open(sys.argv[2], "w"))
