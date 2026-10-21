# Clean a Yiss Fera measurement photo for use in Shopify: remove the screenshot's
# carousel arrows and the supplier's typed spec lines, keep the photo and its
# dimension marks. Extra boxes per file can be passed for text elsewhere.
import cv2, json, sys, numpy as np

def chevrons(g):
    h, w = g.shape
    x0 = int(w * 0.9)
    dark = (g[:, x0:] < 150).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(dark)
    marks = [(int(x + x0), int(y), int(ww), int(hh)) for x, y, ww, hh, a in st[1:] if 12 <= ww <= 16 and 6 <= hh <= 10]
    for a in marks:
        for b in marks:
            if abs(a[0] - b[0]) <= 2 and 35 <= b[1] - a[1] <= 45:
                return (a[0] - 14, a[1] - 18, a[0] + a[2] + 14, b[1] + b[3] + 18)
    return None

def spec_lines(g, band=0.2):
    # Typed spec lines sit in the bottom band, hugging the left or right margin.
    h, w = g.shape
    y0 = int(h * (1 - band))
    dark = (g[y0:] < 140).astype(np.uint8)
    blob = cv2.dilate(dark, np.ones((5, 17), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(blob)
    boxes = []
    for x, y, ww, hh, a in st[1:]:
        if hh > 34 or ww < 30:
            continue
        if x < w * 0.12 or x + ww > w * 0.88:
            boxes.append((int(x) - 3, int(y + y0) - 3, int(x + ww) + 3, int(y + y0 + hh) + 3))
    return boxes

def clean(src, extra=()):
    a = cv2.imread(src)
    g = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
    mask = np.zeros(g.shape, np.uint8)
    found = []
    c = chevrons(g)
    if c:
        cv2.rectangle(mask, c[:2], c[2:], 255, -1)
        found.append(('arrows', c))
    for b in spec_lines(g):
        cv2.rectangle(mask, b[:2], b[2:], 255, -1)
        found.append(('spec', b))
    for b in extra:
        cv2.rectangle(mask, tuple(b[:2]), tuple(b[2:]), 255, -1)
        found.append(('extra', tuple(b)))
    out = cv2.inpaint(a, mask, 9, cv2.INPAINT_TELEA) if found else a
    return out, found

if __name__ == '__main__':
    src, dst = sys.argv[1], sys.argv[2]
    extra = json.loads(sys.argv[3]) if len(sys.argv) > 3 else []
    out, found = clean(src, extra)
    cv2.imwrite(dst, out)
    print(dst, found)

def clean_rois(img, rois, thresh=160):
    # Remove dark text strokes inside given regions (fractions of width/height).
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    h, w = g.shape
    mask = np.zeros(g.shape, np.uint8)
    for r in rois:
        x0, y0, x1, y1 = int(r[0] * w), int(r[1] * h), int(r[2] * w), int(r[3] * h)
        t = r[4] if len(r) > 4 else thresh
        sub = (g[y0:y1, x0:x1] < t).astype(np.uint8) * 255
        mask[y0:y1, x0:x1] = cv2.dilate(sub, np.ones((5, 5), np.uint8))
    return cv2.inpaint(img, mask, 7, cv2.INPAINT_TELEA) if mask.any() else img
