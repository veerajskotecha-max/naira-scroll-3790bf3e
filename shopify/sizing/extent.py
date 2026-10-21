# Find a piece's exact extent inside a rough window: pixels that differ from a
# heavily blurred copy of the photo are detail (metal, stones), not backdrop.
import cv2, numpy as np, sys, json
def extent(path, win, thr=26, minfrac=0.04):
    a = cv2.imread(path)
    lab = cv2.cvtColor(a, cv2.COLOR_BGR2LAB).astype(np.float32)
    bg = cv2.medianBlur(a, 61)
    blab = cv2.cvtColor(bg, cv2.COLOR_BGR2LAB).astype(np.float32)
    d = np.sqrt(((lab - blab) ** 2).sum(2))
    m = (d > thr).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
    x0, y0, x1, y1 = win
    sub = m[y0:y1, x0:x1]
    rows = np.nonzero(sub.sum(1) > max(2, minfrac * (x1 - x0)))[0]
    cols = np.nonzero(sub.sum(0) > max(2, minfrac * (y1 - y0)))[0]
    if not len(rows) or not len(cols):
        return None
    return [int(x0 + cols[0]), int(y0 + rows[0]), int(x0 + cols[-1]), int(y0 + rows[-1])]
if __name__ == '__main__':
    print(extent(sys.argv[1], json.loads(sys.argv[2])))
