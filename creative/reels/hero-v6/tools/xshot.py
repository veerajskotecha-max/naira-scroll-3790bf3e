"""Pull any shot from any source as 30 fps 1080x1920 JPEG frames (no grade): Kinn clips, Riya 4K, Pankti HLG, GRWM,
Ananaya, the AI squares. Shots come from a JSON list [{id, src, t0, dur, crop?}] where crop = [x, y, w, h] in SOURCE pixels
(a native punch-in, e.g. from Riya's 4K). Usage: python3.13 -I xshot.py <S> <shots.json>"""
import json, os, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
S = sys.argv[1]; shots = json.load(open(sys.argv[2]))
SRC = {'riya': ('src/riya_F67FB13D.mp4', 'pc'), 'pankti': ('src/pankti_raw.mp4', 'hlg'), 'grwm': ('src/grwm.mp4', 'pc'),
       'ana': ('dl/new/ananaya_raw/raw.mp4', 'pc'), 'bb': ('v14/dl/8BB38387-8A4F-4E75-BEE3-B25BB1F487CD/8BB38387-8A4F-4E75-BEE3-B25BB1F487CD.mp4', 'pc'),
       'aihoops': ('ai/hoops_hero.mp4', 'tv'), 'aihuggies': ('ai/huggies_hero.mp4', 'tv')}
def src_of(s):
    if s in SRC: return SRC[s]
    return (f'v14/dl/{s}/{s}.mov', 'pc')                                   # a Kinn Films clip id
HLG = ('zscale=tin=arib-std-b67:min=bt2020nc:pin=bt2020:rin=tv:t=linear:npl=203,format=gbrpf32le,'
       'zscale=p=bt709,tonemap=tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p,hflip,')
def job(sh):
    path, kind = src_of(sh['src']); sq = sh['src'].startswith('ai')
    out = f'{S}/ads/frames/{sh["id"]}'; os.makedirs(out, exist_ok=True)
    n = int(round(sh['dur'] * 30))
    if len([f for f in os.listdir(out) if f.endswith('.jpg')]) >= n: return sh['id'], n, 'cached'
    pre = HLG if kind == 'hlg' else ''
    rng = 'tv' if kind in ('tv', 'hlg') else 'full'
    crop = 'crop={2}:{3}:{0}:{1},'.format(*sh['crop']) if sh.get('crop') else ''
    size = '1080:1080' if sq else '1080:1920'
    vf = f'fps=30,{pre}{crop}scale={size}:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range={rng},format=rgb24'
    subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-ss', f'{sh["t0"]:.4f}', '-i', f'{S}/{path}', '-frames:v', str(n), '-vf', vf, '-q:v', '2', f'{out}/f_%04d.jpg'], check=True)
    got = len([f for f in os.listdir(out) if f.endswith('.jpg')])
    json.dump({'fps': 30, 'n': got, 'sq': sq}, open(f'{out}/meta.json', 'w'))
    return sh['id'], got, 'ok'
with ThreadPoolExecutor(4) as ex:
    for r in ex.map(job, shots): print(*r)
