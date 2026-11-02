"""Square crops of the live listing photos for the cards, detail insets, bag and end cards (600x600, ads/img/).
Usage: python3.13 -I product_img.py <S>   (downloads into dl/prod/ first if a photo is missing)"""
import os, subprocess, sys
sys.path.append('/root/.local/lib/python3.13/site-packages')
from PIL import Image
S = sys.argv[1]; D = f'{S}/dl/prod'; os.makedirs(D, exist_ok=True)
CDN = 'https://cdn.shopify.com/s/files/1/0680/9606/5698/files/'
SRC = {'ring_cube': 'CD6A27C9-F249-49BD-8212-54A7EEB03DFF.jpg', 'ring_close': 'B0DA22CE-47D0-4BA3-9CEF-52C34966BE0C.jpg',
       'studs0': 'pearl-point-studs-0.jpg', 'heart0': 'heartline-paperclip-necklace-0_660f5314-75b0-4ab9-8d78-cfb1bb519987.jpg'}
for k, f in SRC.items():
    if not os.path.exists(f'{D}/{k}.jpg'): subprocess.run(['curl', '-sS', '-L', CDN + f, '-o', f'{D}/{k}.jpg'], check=True)
C = {'ring2': ('ring_cube', (96, 140, 656, 700)), 'ring_det': ('ring_close', (250, 270, 640, 660)),
     'studs': ('studs0', (250, 200, 1600, 1550)), 'studs_det': ('studs0', (330, 640, 1150, 1460)),
     'heart': ('heart0', (300, 250, 1500, 1450)), 'heart_det': ('heart0', (580, 830, 1060, 1310))}
for k, (f, box) in C.items():
    Image.open(f'{D}/{f}.jpg').convert('RGB').crop(box).resize((600, 600), Image.LANCZOS).save(f'{S}/ads/img/{k}.jpg', quality=94); print(k)
