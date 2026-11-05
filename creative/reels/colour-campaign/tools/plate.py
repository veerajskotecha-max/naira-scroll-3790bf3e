"""An AI element plate shot on black (powder, petals, smoke) -> RGBA PNG frames the engine composites as real, occluding
matter. On black, a pixel is colour x coverage, so coverage = the brightest channel (lifted by `gain` so dense powder reads
solid) and colour = pixel / coverage. A soft mask removes what the model left in frame that is not the element (the key
light's flare). Usage: python3.13 -I plate.py <in.mp4 | frames_dir> <out_dir> [--gain 1.8] [--floor 10] [--kill x,y,r ...] [--band y0,y1,feather ...]
[--w 1080] [--webp] (--band clears rows y0..y1 with a feather: a backdrop cap the model left in the square)"""
import sys, os, json, subprocess
sys.path.append('/root/.local/lib/python3.13/site-packages')
import numpy as np
from PIL import Image
a = sys.argv[1:]; src, out = a[0], a[1]
opt = lambda k, d: type(d)(a[a.index(k) + 1]) if k in a else d
gain, floor, Wd = opt('--gain', 1.8), opt('--floor', 10.0), opt('--w', 1080)
kills = [tuple(map(float, a[i + 1].split(','))) for i, v in enumerate(a) if v == '--kill']   # x,y,r in output pixels
bands = [tuple(map(float, a[i + 1].split(','))) for i, v in enumerate(a) if v == '--band']   # y0,y1,feather in output pixels
WEBP = '--webp' in a; SOLID = opt('--solid', 0)   # px: close the piece's silhouette so its dark facets stay opaque on a light world
SOLT = opt('--solid-thr', 34.0); ROWBG = opt('--rowbg', 0.0)   # subtract this share of each row's median: a smooth backdrop or light band behind the piece
os.makedirs(out, exist_ok=True)
if os.path.isdir(src):                                     # a frames dir (the Ad 0 source frames), keeps its own meta
    import glob
    fs = sorted(glob.glob(f'{src}/f_*.jpg')); m0 = json.load(open(f'{src}/meta.json')); fps = m0['fps']
    im0 = Image.open(fs[0]); Hd = round(im0.height * Wd / im0.width)
    F = (np.asarray(Image.open(f).convert('RGB').resize((Wd, Hd), Image.LANCZOS)) for f in fs); NF = len(fs); SQ = m0.get('sq', False)
else:
    probe = json.loads(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate', '-of', 'json', src], capture_output=True, text=True).stdout)['streams'][0]
    w0, h0 = probe['width'], probe['height']; Hd = round(h0 * Wd / w0); n_, d_ = map(int, probe['r_frame_rate'].split('/')); fps = n_ / d_
    raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', src, '-vf', f'scale={Wd}:{Hd}:flags=lanczos', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    F = np.frombuffer(raw, np.uint8).reshape(-1, Hd, Wd, 3); NF = len(F); SQ = False
yy, xx = np.mgrid[0:Hd, 0:Wd].astype(np.float32); M = np.ones((Hd, Wd), np.float32)
for kx, ky, kr in kills: d = np.hypot(xx - kx, yy - ky) / kr; M *= np.clip((d - .55) / .45, 0, 1) ** 2
for y0, y1, fe in bands: M *= 1 - np.clip(np.minimum((yy - y0 + fe) / fe, (y1 + fe - yy) / fe), 0, 1)
for i, f in enumerate(F):
    c = f.astype(np.float32)
    if ROWBG:                                                          # the backdrop is smooth and fills most of each row; the piece fills little of it
        rb = np.median(c, axis=1, keepdims=True); k = 31; ker = np.ones(k) / k
        rb = np.stack([np.convolve(np.pad(rb[:, 0, ch], k // 2, mode='edge'), ker, 'valid') for ch in range(3)], 1)[:, None, :]
        c = np.clip(c - ROWBG * rb, 0, 255)
    m = c.max(2)
    al = np.clip((m - floor) / (255 - floor) * gain, 0, 1) * M
    if SOLID:                                                          # metal and CZ are solid: a stone's black facets are reflections, not holes
        import cv2
        bm = (m > SOLT).astype(np.uint8); kk = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * SOLID + 1, 2 * SOLID + 1))
        cl = cv2.morphologyEx(bm, cv2.MORPH_CLOSE, kk)
        inv = 1 - cl; nlab, lab, st, _ = cv2.connectedComponentsWithStats(inv, 4)
        small = np.isin(lab, [i for i in range(1, nlab) if st[i, cv2.CC_STAT_AREA] < (SOLID * 6) ** 2 and st[i, cv2.CC_STAT_LEFT] > 0 and st[i, cv2.CC_STAT_TOP] > 0])
        sol = np.clip(cl + small, 0, 1).astype(np.float32); sol = cv2.erode(sol, np.ones((3, 3), np.uint8)); sol = cv2.GaussianBlur(sol, (0, 0), 1.4)
        al = np.maximum(al, sol * .985 * M)
    col = np.clip(c / np.maximum(al[..., None], 1e-3), 0, 255)                     # un-premultiply
    im = Image.fromarray(np.dstack([col, al * 255]).astype(np.uint8), 'RGBA')
    if WEBP: im.save(f'{out}/f_{i + 1:04d}.webp', quality=94, alpha_quality=100, method=4)
    else: im.save(f'{out}/f_{i + 1:04d}.png', compress_level=3)
json.dump({'fps': fps, 'n': NF, 'ext': 'webp' if WEBP else 'png', 'plate': True, 'sq': SQ}, open(f'{out}/meta.json', 'w'))
print(out, NF, 'frames', Wd, 'x', Hd, 'at', fps)
