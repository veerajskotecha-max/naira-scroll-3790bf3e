# Fit the user's grade on S4 (their edit = the raw 720p clip 84BD71C7, upscaled and graded) so the shot can run 5 frames longer
# with REAL frames instead of a freeze. Checks the frame offset and the alignment first, then fits a 3rd-order RGB polynomial on
# early frames and reports the error on held-out late frames.
import subprocess, sys, numpy as np
FF, user, raw = sys.argv[1:4]
def rgb(src, a, b, w, h, rng='full'):
    vf = f"select='between(n\\,{a}\\,{b})',scale={w}:{h}:flags=area+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range={rng},format=rgb24"
    p = subprocess.run([FF, '-v', 'error', '-i', src, '-vf', vf, '-vsync', '0', '-f', 'rawvideo', '-'], capture_output=True, check=True)
    return np.frombuffer(p.stdout, np.uint8).reshape(-1, h, w, 3).astype(np.float32)
W, H = 720, 1280
U = rgb(user, 221, 253, W, H)                      # user frames 221..253 at the raw size
R = rgb(raw, 1046, 1090, W, H)                     # raw 1046..1090
print('user', U.shape, 'raw', R.shape)
lum = lambda x: x @ np.array([.2126, .7152, .0722], np.float32)
# offset: which raw frame matches user 253 (after removing each frame's mean, so the grade does not dominate)
for off in range(826, 836):
    errs = []
    for k in (230, 240, 253):
        u, r = lum(U[k - 221]), lum(R[k + off - 1046])
        errs.append(np.abs((u - u.mean()) / u.std() - (r - r.mean()) / r.std()).mean())
    print('offset', off, ' '.join(f'{e:.3f}' for e in errs))
# alignment: phase correlation of user 253 vs raw 1083 luma
def pc(a, b):
    A, B = np.fft.fft2(a - a.mean()), np.fft.fft2(b - b.mean())
    r = np.fft.ifft2(A * np.conj(B) / (np.abs(A * np.conj(B)) + 1e-6)).real
    y, x = np.unravel_index(r.argmax(), r.shape)
    return (y if y < r.shape[0] // 2 else y - r.shape[0]), (x if x < r.shape[1] // 2 else x - r.shape[1]), r.max()
for k in (225, 240, 253):
    print('shift user', k, pc(lum(U[k - 221]), lum(R[k + 830 - 1046])))
# grade fit: 3rd-order polynomial in normalised RGB, fit on user 221..245, tested on 246..253
def feats(x):
    r, g, b = [x[..., i] / 255. for i in range(3)]
    return np.stack([np.ones_like(r), r, g, b, r * r, g * g, b * b, r * g, r * b, g * b,
                     r ** 3, g ** 3, b ** 3, r * r * g, r * r * b, g * g * r, g * g * b, b * b * r, b * b * g, r * g * b], -1)
rs = np.random.default_rng(1)
def sample(ks, n):
    X, Y = [], []
    for k in ks:
        u, r = U[k - 221].reshape(-1, 3), R[k + 830 - 1046].reshape(-1, 3)
        i = rs.choice(len(u), n, replace=False); X.append(feats(r[i])); Y.append(u[i])
    return np.concatenate(X), np.concatenate(Y)
X, Y = sample(range(221, 246), 40000)
coef, *_ = np.linalg.lstsq(X, Y, rcond=None)
np.save(sys.argv[4], coef)
for k in (230, 245, 248, 251, 253):
    u, r = U[k - 221], R[k + 830 - 1046]
    p = feats(r) @ coef
    e = p - u
    print(f'user {k}: mean err {e.mean((0, 1)).round(2)}  MAE {np.abs(e).mean():.2f}  p95 {np.percentile(np.abs(e), 95):.1f}   raw-vs-user mean diff {(u - r).mean((0, 1)).round(1)}')
