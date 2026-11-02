"""The pearl ad opens on her stud before her face: a native-resolution crop of the 4K CapCut export (a 2x punch-in with
no upscaling), 1080x1920 from x 0-1080, y 960-2880 of 2160x3840, for the same pictures lv_frames.py chose at 5.40-6.05 s.
The crop stops above her burned-in captions (y 1440+ in 1080 coordinates). Usage: python3.13 -I ear_frames.py <S>"""
import json, os, subprocess, sys
S = sys.argv[1]
pick = json.load(open(f'{S}/ads/frames/lv/meta.json'))['src50']
i0, i1 = round(5.40 * 30), round(6.05 * 30); idx = [pick[i] for i in range(i0, i1)]
d = f'{S}/ads/frames/lv_ear'; tmp = f'{S}/ads/new/lv_ear50'; os.makedirs(d, exist_ok=True); os.makedirs(tmp, exist_ok=True)
order = sorted(set(idx)); sel = '+'.join(f'eq(n\\,{j})' for j in order)
subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-y', '-i', f'{S}/dl/new/lv0/lv0.mp4', '-vf',
                f"select='{sel}',crop=1080:1920:0:960,scale=1080:1920:flags=lanczos+accurate_rnd+full_chroma_int:in_color_matrix=bt709:in_range=tv,format=rgb24",
                '-vsync', '0', '-q:v', '2', f'{tmp}/e_%03d.jpg'], check=True)
got = sorted(os.listdir(tmp)); assert len(got) == len(order), (len(got), len(order))
where = {j: f'{tmp}/{got[k]}' for k, j in enumerate(order)}
for f in os.listdir(d): os.remove(f'{d}/{f}')
for k, j in enumerate(idx): os.link(where[j], f'{d}/f_{k + 1:04d}.jpg')
json.dump({'fps': 30, 'n': len(idx), 'sq': False, 'from_lv': [i0, i1]}, open(f'{d}/meta.json', 'w')); print('lv_ear', len(idx))
