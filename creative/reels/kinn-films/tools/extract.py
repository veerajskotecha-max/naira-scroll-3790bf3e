"""Pull each source range as 1080x1920 JPEG frames (no grade: BT.709 in, JFIF out), and person mattes where flagged.
Usage: python3 -I extract.py <S> <shard> <nshards>"""
import json, os, subprocess, sys
sys.path.append('/root/.local/lib/python3.11/site-packages')
S, shard, nsh = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
V = f'{S}/v15'; FF = f'{S}/ffmpeg'
jobs = json.load(open(f'{V}/extract.json'))[shard::nsh]
seg = None
def guided(I, p, r, eps):
    import cv2
    k = (2 * r + 1, 2 * r + 1); m = lambda x: cv2.boxFilter(x, -1, k)
    mI, mp_, cI, cIp = m(I), m(p), m(I * I), m(I * p)
    a = (cIp - mI * mp_) / (cI - mI * mI + eps); b = mp_ - a * mI
    return m(a) * I + m(b)
for j in jobs:
    out = f"{V}/fr/{j['key']}"; os.makedirs(out, exist_ok=True)
    if len([f for f in os.listdir(out) if f.endswith('.jpg')]) < j['n']:
        clip = f"{S}/v14/dl/{j['clip']}/{j['clip']}.mov"
        # Decode to RGB with the source's own BT.709 matrix, then let the JPEG take its standard BT.601 JFIF YCbCr. A direct
        # yuvj420p -> yuvj420p scale ignores out_color_matrix, so the 709 values landed in a 601 JPEG: skin read ~1.5% cooler.
        vf = ('fps=30,scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range=full'
              ',format=rgb24,format=yuvj420p')
        subprocess.run([FF, '-nostdin', '-v', 'error', '-y', '-ss', f"{j['ext0']:.4f}", '-i', clip, '-frames:v', str(j['n']), '-vf', vf, '-q:v', '2',
                        f'{out}/f_%04d.jpg'], check=True)
        got = len([f for f in os.listdir(out) if f.endswith('.jpg')])
        if got < j['n']:                                     # the clip ended: repeat the last frame so indices stay valid
            import shutil
            for i in range(got + 1, j['n'] + 1): shutil.copy(f'{out}/f_{got:04d}.jpg', f'{out}/f_{i:04d}.jpg')
    if j['matte']:
        import numpy as np, cv2, mediapipe as mp
        from mediapipe.tasks.python import vision, BaseOptions
        if seg is None:
            seg = vision.ImageSegmenter.create_from_options(vision.ImageSegmenterOptions(base_options=BaseOptions(
                model_asset_path=f'{S}/v14/models/selfie_multiclass_256x256.tflite', delegate=BaseOptions.Delegate.CPU), output_confidence_masks=True))
        mo = f"{V}/mt/{j['key']}"; os.makedirs(mo, exist_ok=True)
        for i in range(1, j['n'] + 1):
            dst = f'{mo}/m_{i:04d}.png'
            if os.path.exists(dst): continue
            bgr = cv2.imread(f'{out}/f_{i:04d}.jpg'); rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
            r = seg.segment(mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb))
            p = 1 - r.confidence_masks[0].numpy_view().astype(np.float32)
            if p.shape != (1920, 1080): p = cv2.resize(p, (1080, 1920), interpolation=cv2.INTER_LINEAR)
            g = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
            p = guided(g, p, 6, 1e-3); p = np.clip((p - .32) / (.68 - .32), 0, 1); p = p * p * (3 - 2 * p)
            rgba = np.zeros((1920, 1080, 4), np.uint8); rgba[..., 3] = (p * 255 + .5).astype(np.uint8)
            cv2.imwrite(dst, rgba, [cv2.IMWRITE_PNG_COMPRESSION, 6])
    print('ok', j['key'], j['n'], 'matte' if j['matte'] else '', flush=True)
