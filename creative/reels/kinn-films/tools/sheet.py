import sys, glob, cv2, numpy as np
d, out, cols = sys.argv[1], sys.argv[2], int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(d + '/f_*.*')); tiles = []
for f in fs:
    im = cv2.resize(cv2.imread(f), (270, 480), interpolation=cv2.INTER_AREA)
    n = int(f.split('_')[-1].split('.')[0]) - 1
    cv2.putText(im, f'{n/30:.2f}s', (6, 22), cv2.FONT_HERSHEY_SIMPLEX, .6, (0, 0, 255), 2); tiles.append(im)
while len(tiles) % cols: tiles.append(np.zeros_like(tiles[0]))
cv2.imwrite(out, np.vstack([np.hstack(tiles[i:i + cols]) for i in range(0, len(tiles), cols)]), [cv2.IMWRITE_JPEG_QUALITY, 82]); print(out, len(fs))
