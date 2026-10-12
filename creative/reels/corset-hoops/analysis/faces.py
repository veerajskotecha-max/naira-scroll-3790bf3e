"""Face box and landmarks for every frame (YuNet, opencv_zoo face_detection_yunet_2023mar), run at half size.
faces.json: {frame: [x, y, w, h, eye_r x/y, eye_l x/y, nose x/y, mouth_r x/y, mouth_l x/y, score]}, full-size pixels.
The engine anchors its zooms on these, keeps captions off the face, and sizes the hoop search window from them."""
import cv2, json, os
W = os.environ.get('WORK', '.') + '/v13/work'
det = cv2.FaceDetectorYN.create(os.environ.get('YUNET', 'yunet.onnx'), '', (540, 960), 0.6, 0.3, 5000)
faces = {}
for f in range(1, 727):
    _, r = det.detect(cv2.resize(cv2.imread(f'{W}/fr/f_{f:04d}.png'), (540, 960)))
    if r is None or len(r) == 0: continue
    b = max(r, key=lambda x: x[14] * x[2] * x[3]) * 2; b[14] /= 2       # the biggest confident face is hers
    faces[f] = [round(float(v), 1) for v in b[:15]]
# a detection that jumps more than 0.35 face-widths from its neighbours is a misfire (frame 702 found a box at
# y 967-1822): interpolate it, or the moon, which follows the averaged face, dips for half a second
import numpy as np
fs = sorted(faces); C = {f: (faces[f][0] + faces[f][2] / 2, faces[f][1] + faces[f][3] / 2, faces[f][2]) for f in fs}
bad = []
for f in fs:
    nb = [C[g] for g in (f - 2, f - 1, f + 1, f + 2) if g in C]
    mx, my, mw = (float(np.median([n[i] for n in nb])) for i in range(3))
    if abs(C[f][0] - mx) > .35 * mw or abs(C[f][1] - my) > .35 * mw or abs(C[f][2] - mw) > .4 * mw: bad.append(f)
for f in bad:
    a, b = f - 1, f + 1
    while a in bad: a -= 1
    while b in bad: b += 1
    p = (f - a) / (b - a); faces[f] = [round(faces[a][i] + (faces[b][i] - faces[a][i]) * p, 1) for i in range(15)]
print('interpolated misfires:', bad)
json.dump(faces, open(f'{W}/faces.json', 'w'))
print('faces in', len(faces), 'of 726 frames')
