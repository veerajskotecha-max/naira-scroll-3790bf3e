"""Frames for the two creator ads.
- ana: the red-dress raw (VFR, about 29 fps, full range) resampled to 30 fps CFR, 1240 frames.
- lv50: every picture of the pearl CapCut export (50 fps, TV range, 2160x3840) at 1080x1920. lv_frames.py then picks the
  30 fps sequence from these, and ear_frames.py cuts the 4K stud close-up.
Usage: python3.13 -I prep4.py <S>"""
import json, os, subprocess, sys
S = sys.argv[1]; F = f'{S}/ads/frames'
SC = 'scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range={r},format=rgb24'
def run(*a): subprocess.run(list(a), check=True)
d = f'{F}/ana'; os.makedirs(d, exist_ok=True)
if len(os.listdir(d)) < 1200:
    run('ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{S}/dl/new/ananaya_raw/raw.mp4', '-vf', 'fps=30,' + SC.format(r='full'), '-q:v', '2', f'{d}/f_%04d.jpg')
n = len([f for f in os.listdir(d) if f.endswith('.jpg')]); json.dump({'fps': 30, 'n': n, 'sq': False}, open(f'{d}/meta.json', 'w')); print('ana', n)
tmp = f'{S}/ads/new/lv50'; os.makedirs(tmp, exist_ok=True)
if len(os.listdir(tmp)) < 1230:
    run('ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{S}/dl/new/lv0/lv0.mp4', '-vf', SC.format(r='tv'), '-q:v', '2', f'{tmp}/f_%04d.jpg')
print('lv50', len(os.listdir(tmp)))
