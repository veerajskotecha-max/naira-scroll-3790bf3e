"""Pull each shot's frames as 1080-wide JPEG (q2) in RGB with the source's own matrix; no grade.
Pankti's raw is HLG and mirrored: Hable tone-map to BT.709 and flip, nothing else.
Usage: python3.13 -I extract.py <S> [ids...]"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
S = sys.argv[1]
sys.path.insert(0, f'{S}/ads/tools'); from shots import SRC, SHOTS
want = sys.argv[2:] or list(SHOTS)
HLG = ('zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,'
       'zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,hflip,'
       'scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range=tv,format=rgb24')
def vf(kind, sq):
    if kind == 'hlg': return HLG
    rng = 'full' if kind == 'pc' else 'tv'
    size = '1080:1080' if sq else '1080:1920'
    return f'scale={size}:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range={rng},format=rgb24'
def job(i):
    src, t0, dur = SHOTS[i]; path, kind = SRC[src]; sq = src.startswith('ai')
    out = f'{S}/ads/frames/{i}'; os.makedirs(out, exist_ok=True)
    fps = 24 if sq else 30
    n = int(round(dur * fps))
    if len([f for f in os.listdir(out) if f.endswith('.jpg')]) >= n: return i, n, 'cached'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{t0:.4f}', '-i', f'{S}/{path}', '-frames:v', str(n),
                    '-vf', vf(kind, sq), '-q:v', '2', f'{out}/f_%04d.jpg'], check=True)
    got = len([f for f in os.listdir(out) if f.endswith('.jpg')])
    json.dump({'fps': fps, 'n': got, 'sq': sq}, open(f'{out}/meta.json', 'w'))
    return i, got, 'ok'
with ThreadPoolExecutor(4) as ex:
    for r in ex.map(job, want): print(*r)
