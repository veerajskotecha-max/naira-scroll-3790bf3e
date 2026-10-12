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
json.dump(faces, open(f'{W}/faces.json', 'w'))
print('faces in', len(faces), 'of 726 frames')
