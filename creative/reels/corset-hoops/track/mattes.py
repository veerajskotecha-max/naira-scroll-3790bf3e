"""Person mattes for every frame (MediaPipe multiclass selfie segmenter), sharpened to the frame's own
edges, written as alpha-only PNGs so the engine can lay type behind her."""
import numpy as np, cv2, sys, os
import mediapipe as mp
from mediapipe.tasks import python as mpt
from mediapipe.tasks.python import vision
M = os.environ['MODEL']
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(base_options=mpt.BaseOptions(model_asset_path=M, delegate=mpt.BaseOptions.Delegate.CPU), output_confidence_masks=True))
def guided(I, p, r, eps):
    """He et al.'s guided filter with box means: the matte takes the frame's own edges (hair, jaw)."""
    k = (2 * r + 1, 2 * r + 1); m = lambda x: cv2.boxFilter(x, -1, k)
    mI, mp_, cI, cIp = m(I), m(p), m(I * I), m(I * p)
    a = (cIp - mI * mp_) / (cI - mI * mI + eps); b = mp_ - a * mI
    return m(a) * I + m(b)
a0, a1 = int(sys.argv[1]), int(sys.argv[2])
for f in range(a0, a1 + 1):
    out = f'matte/m_{f:04d}.png'
    if os.path.exists(out): continue
    bgr = cv2.imread(f'fr/f_{f:04d}.png'); rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
    p = 1 - r.confidence_masks[0].numpy_view().astype(np.float32)
    if p.shape != (1920, 1080): p = cv2.resize(p, (1080, 1920), interpolation=cv2.INTER_LINEAR)
    g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    p = guided(g, p, 6, 1e-3)
    p = np.clip((p - .32) / (.68 - .32), 0, 1); p = p * p * (3 - 2 * p)          # smoothstep: the curtain ghosted through at low confidence
    rgba = np.zeros((1920, 1080, 4), np.uint8); rgba[..., 3] = (p * 255 + .5).astype(np.uint8)
    cv2.imwrite(out, rgba, [cv2.IMWRITE_PNG_COMPRESSION, 6])
print('done', a0, a1)
