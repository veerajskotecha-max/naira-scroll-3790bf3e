"""track.py: where things are in a clip, so the virtual camera can aim at them and morphs can align them.
- face(frames): per frame, both eyes (iris centre and radius) and the face box, from MediaPipe's face landmarker
- hands(frames): per frame, 21 landmarks per hand (ring-finger base for rings, wrist for bracelets)
- seg(frame): MediaPipe multiclass masks: background, hair, body skin, face skin, clothes, accessories
- box(frames, k0, box): an OpenCV CSRT track of a box (a hoop, a box lid) from frame k0, forwards
All coordinates are 0-1 of the source frame. Results are cached as JSON beside the frames."""
import os, sys, json
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np, cv2
M = '/tmp/claude-0/-home-user/aaed4e78-f5ea-57f6-bb8a-ea8f2c0ecee0/scratchpad/mx/models'


def _mp():
    import mediapipe as mp
    from mediapipe.tasks import python as mpt
    from mediapipe.tasks.python import vision
    return mp, mpt, vision


def _img(mp, rgb):
    return mp.Image(image_format=mp.ImageFormat.SRGB, data=np.ascontiguousarray((rgb * 255).astype(np.uint8) if rgb.dtype != np.uint8 else rgb))


def face(F, step=1):
    """F: mx.Frames. Returns {k: {'L': [x, y, r], 'R': [x, y, r], 'box': [x0, y0, x1, y1]}} for frames with a face"""
    cache = f'{F.d}/face.json'
    if os.path.exists(cache): return {int(k): v for k, v in json.load(open(cache)).items()}
    mp, mpt, vision = _mp()
    opt = vision.FaceLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=f'{M}/face_landmarker.task'), num_faces=1,
                                       running_mode=vision.RunningMode.VIDEO)
    out = {}
    with vision.FaceLandmarker.create_from_options(opt) as det:
        for k in range(0, F.n, step):
            r = det.detect_for_video(_img(mp, F.get(k)), int(k * 1000 / F.fps))
            if not r.face_landmarks: continue
            p = np.array([[l.x, l.y] for l in r.face_landmarks[0]])
            def iris(ids):                                           # 468-472 one iris, 473-477 the other: centre + ring
                c = p[ids[0]]; rad = np.mean(np.linalg.norm(p[ids[1:]] - c, axis=1)); return [float(c[0]), float(c[1]), float(rad)]
            out[k] = {'L': iris([468, 469, 470, 471, 472]), 'R': iris([473, 474, 475, 476, 477]),
                      'box': [float(p[:, 0].min()), float(p[:, 1].min()), float(p[:, 0].max()), float(p[:, 1].max())]}
    json.dump(out, open(cache, 'w')); return out


def hands(F, step=1):
    cache = f'{F.d}/hands.json'
    if os.path.exists(cache): return {int(k): v for k, v in json.load(open(cache)).items()}
    mp, mpt, vision = _mp()
    opt = vision.HandLandmarkerOptions(base_options=mpt.BaseOptions(model_asset_path=f'{M}/hand_landmarker.task'), num_hands=2,
                                       running_mode=vision.RunningMode.VIDEO)
    out = {}
    with vision.HandLandmarker.create_from_options(opt) as det:
        for k in range(0, F.n, step):
            r = det.detect_for_video(_img(mp, F.get(k)), int(k * 1000 / F.fps))
            if r.hand_landmarks: out[k] = [[[l.x, l.y] for l in h] for h in r.hand_landmarks]
    json.dump(out, open(cache, 'w')); return out


_SEG = None
def seg(rgb):
    """class masks (float 0-1, frame size): 0 background, 1 hair, 2 body skin, 3 face skin, 4 clothes, 5 others (accessories)"""
    global _SEG
    mp, mpt, vision = _mp()
    if _SEG is None:
        opt = vision.ImageSegmenterOptions(base_options=mpt.BaseOptions(model_asset_path=f'{M}/selfie_multiclass.tflite'), output_confidence_masks=True)
        _SEG = vision.ImageSegmenter.create_from_options(opt)
    r = _SEG.segment(_img(mp, rgb))
    return [m.numpy_view().astype(np.float32) for m in r.confidence_masks]


def box(F, k0, b, k1=None):
    """track box b = [x0, y0, x1, y1] (0-1) from frame k0 to k1; returns {k: [x0, y0, x1, y1]}"""
    W, H = F.size; k1 = F.n - 1 if k1 is None else k1
    tr = cv2.TrackerCSRT.create() if hasattr(cv2, 'TrackerCSRT') else cv2.legacy.TrackerCSRT_create()
    u8 = lambda k: cv2.cvtColor((F.get(k) * 255).astype(np.uint8), cv2.COLOR_RGB2BGR)
    tr.init(u8(k0), (int(b[0] * W), int(b[1] * H), int((b[2] - b[0]) * W), int((b[3] - b[1]) * H)))
    out = {k0: b}
    for k in range(k0 + 1, k1 + 1):
        ok, (x, y, w, h) = tr.update(u8(k))
        if not ok: break
        out[k] = [x / W, y / H, (x + w) / W, (y + h) / H]
    return out


def tmatch(F, k_ref, b, ks, search=1.6, scale=.5):
    """per-frame position of a patch by normalised cross-correlation (sub-pixel), for stabilising a hold or locking a
    piece. b = [x0, y0, x1, y1] in SOURCE px on frame k_ref; ks = frames to find it in. Each frame searches a window
    `search` times the patch around the previous hit. Returns {k: (cx, cy, score)} in source px (patch centre)."""
    def g(k):
        im = F.get(k)[..., :3]
        im = cv2.cvtColor(im, cv2.COLOR_RGB2GRAY)
        return cv2.resize(im, None, fx=scale, fy=scale, interpolation=cv2.INTER_AREA) if scale != 1 else im
    x0, y0, x1, y1 = [int(round(v * scale)) for v in b]
    tpl = g(k_ref)[y0:y1, x0:x1].astype(np.float32); th, tw = tpl.shape
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2; out = {}
    for k in ks:
        im = g(k).astype(np.float32); H, W = im.shape
        rw, rh = int(tw * search), int(th * search)
        sx0, sy0 = int(max(0, cx - rw / 2 - tw / 2)), int(max(0, cy - rh / 2 - th / 2))
        sx1, sy1 = int(min(W, cx + rw / 2 + tw / 2)), int(min(H, cy + rh / 2 + th / 2))
        win = im[sy0:sy1, sx0:sx1]
        if win.shape[0] <= th or win.shape[1] <= tw: continue
        r = cv2.matchTemplate(win, tpl, cv2.TM_CCOEFF_NORMED); _, mv, _, ml = cv2.minMaxLoc(r)
        dx = dy = 0.0
        if 0 < ml[0] < r.shape[1] - 1:
            a, c, b_ = r[ml[1], ml[0] - 1], r[ml[1], ml[0]], r[ml[1], ml[0] + 1]; dx = .5 * (a - b_) / (a - 2 * c + b_ + 1e-9)
        if 0 < ml[1] < r.shape[0] - 1:
            a, c, b_ = r[ml[1] - 1, ml[0]], r[ml[1], ml[0]], r[ml[1] + 1, ml[0]]; dy = .5 * (a - b_) / (a - 2 * c + b_ + 1e-9)
        cx, cy = sx0 + ml[0] + dx + tw / 2, sy0 + ml[1] + dy + th / 2
        out[k] = (cx / scale, cy / scale, float(mv))
    return out


def path(track, fps, smooth=0):
    """a track {k: (x, y, ...)} as a function of source time (linear between found frames, optional moving average)"""
    ks = sorted(track); xs = np.array([track[k][0] for k in ks]); ys = np.array([track[k][1] for k in ks])
    if smooth and len(ks) > 2 * smooth:
        w = np.ones(2 * smooth + 1) / (2 * smooth + 1)
        xs = np.convolve(np.pad(xs, smooth, mode='edge'), w, 'valid'); ys = np.convolve(np.pad(ys, smooth, mode='edge'), w, 'valid')
    ts = np.array(ks) / fps
    return lambda t: (float(np.interp(t, ts, xs)), float(np.interp(t, ts, ys)))
