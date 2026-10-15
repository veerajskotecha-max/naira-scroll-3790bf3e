"""The DP frame (clip 62379666 at 4.00 s, frame 120) at 1080x1920 RGB, and her cut-out (RGBA, person matte).
Usage: python3 -I frame.py <S> <outdir>      writes dp_1080.png and her_cut.png"""
import os, subprocess, sys
sys.path.append('/root/.local/lib/python3.11/site-packages')
import numpy as np, cv2
S, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
clip = f'{S}/v14/dl/62379666/62379666.mov'
# Decode to RGB with the source's own BT.709 full-range matrix; no grade.
vf = 'scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range=full,format=rgb24'
subprocess.run([f'{S}/ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', '4.0', '-i', clip, '-frames:v', '1', '-vf', vf,
                f'{out}/dp_1080.png'], check=True)

# Same matte as kinn-films/tools/extract.py: 1 - background confidence, guided by the grey frame, smoothstep .32-.68.
import mediapipe as mp
from mediapipe.tasks.python import vision, BaseOptions
def guided(I, p, r, eps):
    k = (2 * r + 1, 2 * r + 1); m = lambda x: cv2.boxFilter(x, -1, k)
    mI, mp_, cI, cIp = m(I), m(p), m(I * I), m(I * p)
    a = (cIp - mI * mp_) / (cI - mI * mI + eps); b = mp_ - a * mI
    return m(a) * I + m(b)
seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(base_options=BaseOptions(
    model_asset_path=f'{S}/v14/models/selfie_multiclass_256x256.tflite', delegate=BaseOptions.Delegate.CPU), output_confidence_masks=True))
bgr = cv2.imread(f'{out}/dp_1080.png'); rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
p = 1 - seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)).confidence_masks[0].numpy_view().astype(np.float32)
if p.shape != (1920, 1080): p = cv2.resize(p, (1080, 1920), interpolation=cv2.INTER_LINEAR)
g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
p = guided(g, p, 6, 1e-3); p = np.clip((p - .32) / (.68 - .32), 0, 1); p = p * p * (3 - 2 * p)
rgba = np.dstack([rgb, (p * 255 + .5).astype(np.uint8)])
cv2.imwrite(f'{out}/her_cut.png', cv2.cvtColor(rgba, cv2.COLOR_RGBA2BGRA))
print('ok', out)
