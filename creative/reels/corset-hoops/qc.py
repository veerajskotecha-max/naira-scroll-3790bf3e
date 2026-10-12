"""QC for one cut. Pass 1 (frames): a contact sheet every 0.5 s and the loop seam (last 4 frames | first 4).
Pass 2 (encode): decode the mp4 at 12 points, PSNR against the PNG it came from, stream durations and tags.
usage: python3 qc.py <version> [out.mp4]"""
import os, sys, glob, subprocess, numpy as np
from PIL import Image, ImageDraw
V = sys.argv[1]; ROOT = os.environ.get('WORK', '.') + '/v13'; FF = os.environ.get('FFMPEG', 'ffmpeg')
fs = sorted(glob.glob(f'{ROOT}/eng/out_{V}/f_*.png')); N = len(fs)
def tile(f, w=216):
    im = Image.open(f).convert('RGB').resize((w, int(w * 16 / 9))); n = int(f.split('_')[-1][:5])
    ImageDraw.Draw(im).text((4, 4), f'{(n - 1) / 30:.2f}', fill=(255, 255, 0)); return im
if len(sys.argv) < 3:
    pick = fs[::15]; cols = 10; W, H = 216, 384
    S = Image.new('RGB', (W * cols, H * ((len(pick) + cols - 1) // cols)))
    for i, f in enumerate(pick): S.paste(tile(f), ((i % cols) * W, (i // cols) * H))
    S.save(f'{ROOT}/qc_{V}_sheet.jpg', quality=82)
    seam = fs[-4:] + fs[:4]; S = Image.new('RGB', (W * 8 + 12, H)); x = 0
    for i, f in enumerate(seam): S.paste(tile(f), (x, 0)); x += W + (12 if i == 3 else 0)
    S.save(f'{ROOT}/qc_{V}_seam.jpg', quality=88)
    a = np.asarray(Image.open(fs[-1]).convert('RGB'), float); b = np.asarray(Image.open(fs[0]).convert('RGB'), float)
    print(f'{V}: {N} frames ({N / 30:.2f}s); last->first mean abs diff {np.abs(a - b).mean():.1f}')
else:
    mp4 = sys.argv[2]
    info = subprocess.run([FF, '-hide_banner', '-i', mp4], capture_output=True, text=True).stderr
    print('\n'.join(l.strip() for l in info.splitlines() if 'Stream' in l or 'Duration' in l))
    ps = []
    for k in np.linspace(0, N - 1, 12).astype(int):
        raw = subprocess.run([FF, '-v', 'error', '-i', mp4, '-vf', f'select=eq(n\\,{k}),scale=in_color_matrix=bt709:in_range=tv:out_range=full,format=rgb24',
                              '-frames:v', '1', '-f', 'rawvideo', '-'], capture_output=True).stdout
        d = np.frombuffer(raw, np.uint8).reshape(1920, 1080, 3).astype(float); r = np.asarray(Image.open(fs[k]).convert('RGB'), float)
        mse = ((d - r) ** 2).mean(); ps.append(10 * np.log10(255 ** 2 / max(mse, 1e-9)))
        if k == 0: print('frame 0 mean RGB: png', r.mean((0, 1)).round(1), 'mp4', d.mean((0, 1)).round(1))
    print('PSNR at 12 points (dB):', [round(p, 1) for p in ps], 'min', round(min(ps), 1))
