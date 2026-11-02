"""Stills the pages use: product photos from Shopify's CDN cropped square, the repo's sage logo, the AI clips' backdrop colours.
Usage: python3.13 -I assets.py <S> <repo root>      (run after extract.py, which writes the AI clips' first frames)"""
import json, shutil, subprocess, sys
from PIL import Image
S, REPO = sys.argv[1], sys.argv[2]; A = f'{S}/ads'
CDN = 'https://cdn.shopify.com/s/files/1/0680/9606/5698/files/'
PHOTOS = {'hoops': 'woven-gold-hoops-0_6c9f6b30-a09f-479d-bbfa-ab40df3853a4.jpg', 'huggies': 'brushed-gold-huggies-0_d9e5187c-0e22-4997-988b-81e1533a5ebd.jpg',
          'chain': 'toggle-link-chain-1.jpg', 'ring': 'hf_20261021_080442_3e62cb3f-26c5-4ea9-825d-0fc8b545e0b7.png'}
subprocess.run(['mkdir', '-p', f'{A}/img', f'{S}/prod'], check=True)
for n, f in PHOTOS.items():
    subprocess.run(['curl', '-sS', '-o', f'{S}/prod/{n}.src', CDN + f + '?width=1200'], check=True)
    im = Image.open(f'{S}/prod/{n}.src').convert('RGB'); w, h = im.size; s = min(w, h)
    top = int((h - s) * (0.35 if n == 'chain' else 0.5))          # the chain photo is portrait: keep the piece in the square
    im.crop(((w - s) // 2, top, (w - s) // 2 + s, top + s)).resize((600, 600), Image.LANCZOS).save(f'{A}/img/{n}.jpg', quality=92)
shutil.copy(f'{REPO}/creative/reels/kinn-films/img/logo_sage.svg', f'{A}/img/logo_sage.svg')
out = {}
for c in ('ai_hoops', 'ai_huggies'):
    im = Image.open(f'{A}/frames/{c}/f_0001.jpg').convert('RGB'); w, h = im.size
    row = lambda y0, y1: tuple(int(sum(v) / len(v)) for v in zip(*[im.getpixel((x, y)) for x in range(0, w, 8) for y in range(y0, y1)]))
    out[c] = {'top': row(0, 12), 'mid': row(h // 2 - 4, h // 2 + 4), 'bot': row(h - 12, h)}
json.dump(out, open(f'{A}/img/ai_bg.json', 'w')); print(out)
