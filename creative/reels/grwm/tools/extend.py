# Build the 5 frames that carry S4 on to the drop: raw 84BD71C7 frames 1084..1088, upscaled to 1080x1920 and graded with the fitted
# polynomial. Picks the upscaler whose result best matches the user's own frame 253 (= raw 1083), reports the spatial error
# pattern (a vignette or sharpening in the user's grade would show here), and writes 16-bit-free PNGs for the composite.
import subprocess, sys, numpy as np, os
FF, user, raw, coefp, out = sys.argv[1:6]
coef = np.load(coefp)
def rgb(src, a, b, w, h, flags):
    vf = f"select='between(n\\,{a}\\,{b})',scale={w}:{h}:flags={flags}+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range=full,format=rgb48le"
    p = subprocess.run([FF, '-v', 'error', '-i', src, '-vf', vf, '-vsync', '0', '-f', 'rawvideo', '-'], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.uint16).reshape(-1, h, w, 3).astype(np.float32) / 257.
def feats(x):
    r, g, b = [x[..., i] / 255. for i in range(3)]
    return np.stack([np.ones_like(r), r, g, b, r * r, g * g, b * b, r * g, r * b, g * b,
                     r ** 3, g ** 3, b ** 3, r * r * g, r * r * b, g * g * r, g * g * b, b * b * r, b * b * g, r * g * b], -1)
grade = lambda x: np.clip(feats(x) @ coef, 0, 255)
u253 = rgb(user, 253, 253, 1080, 1920, 'lanczos')[0]
best = None
for fl in ('bilinear', 'bicubic', 'lanczos', 'spline'):
    g = grade(rgb(raw, 1083, 1083, 1080, 1920, fl)[0])
    e = g - u253; mae = np.abs(e).mean()
    # high-frequency energy, to compare sharpness
    hf = lambda x: np.abs(np.diff(x.mean(-1), axis=1)).mean()
    print(f'{fl:9s} MAE {mae:.2f}  hf user {hf(u253):.2f} ours {hf(g):.2f}')
    if best is None or mae < best[1]: best = (fl, mae, e)
fl, mae, e = best
print('best', fl)
blk = np.abs(e).mean(-1).reshape(8, 240, 6, 180).mean((1, 3))
sgn = e.mean(-1).reshape(8, 240, 6, 180).mean((1, 3))
print('block MAE (8 rows x 6 cols):'); print(blk.round(1)); print('block signed:'); print(sgn.round(1))
os.makedirs(out, exist_ok=True)
fr = rgb(raw, 1084, 1088, 1080, 1920, fl)
for i, f in enumerate(fr):
    g = np.rint(grade(f)).astype(np.uint8)
    subprocess.run([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1080x1920', '-i', '-', f'{out}/ext_{i}.png'], input=g.tobytes(), check=True)
g = np.rint(grade(rgb(raw, 1083, 1083, 1080, 1920, fl)[0])).astype(np.uint8)
subprocess.run([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1080x1920', '-i', '-', f'{out}/ours_1083.png'], input=g.tobytes(), check=True)
subprocess.run([FF, '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', '1080x1920', '-i', '-', f'{out}/user_253.png'], input=np.rint(u253).astype(np.uint8).tobytes(), check=True)
print('wrote', out)
