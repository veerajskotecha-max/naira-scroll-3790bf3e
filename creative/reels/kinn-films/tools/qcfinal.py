"""Final-file QC: container facts, exact frame counts, audio length, BT.709 tags; colour bias against the source (no grade);
and whether the song's drop really sits where the edit put it (onset in the file's own audio)."""
import json, subprocess, sys, numpy as np
S = sys.argv[1]; FF = f'{S}/ffmpeg'; O = f'{S}/v15/out'
def probe(p):
    r = subprocess.run([FF, '-hide_banner', '-i', p], capture_output=True, text=True).stderr
    v = [l for l in r.split('\n') if 'Video:' in l][0]; a = [l for l in r.split('\n') if 'Audio:' in l]
    return v.strip(), (a[0].strip() if a else '')
def frames(p):
    r = subprocess.run([FF, '-v', 'error', '-nostdin', '-i', p, '-map', '0:v', '-c', 'copy', '-f', 'framecrc', '-'], capture_output=True, text=True).stdout
    return sum(1 for l in r.split('\n') if l.startswith('0,'))
def pcm(p):
    raw = subprocess.run([FF, '-v', 'error', '-nostdin', '-i', p, '-map', '0:a', '-ac', '1', '-ar', '48000', '-f', 'f32le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.float32)
def frame(p, t, src=False):
    vf = 'scale=1080:1920:flags=lanczos:in_color_matrix=bt709:in_range=full' if src else 'scale=in_color_matrix=bt709:in_range=tv'
    raw = subprocess.run([FF, '-v', 'error', '-nostdin', '-ss', f'{t:.4f}', '-i', p, '-frames:v', '1', '-vf', vf + ',format=rgb24', '-f', 'rawvideo', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(1920, 1080, 3).astype(np.float32)
rows = []
for name in sys.argv[2:]:
    p = f'{O}/final/{name}.mp4'; v, a = probe(p); n = frames(p); x = pcm(p)
    D = json.load(open(f'{S}/v15/eng/data_{name}.json')) if not name.startswith('best') else None
    want = D['frames'] if D else 900
    sz = __import__('os').path.getsize(p) / 1048576
    tags = 'bt709' in v and 'tv' in v
    line = f'{name:14s} {sz:5.1f} MB  frames {n} (want {want})  audio {len(x) / 48000:6.3f}s  1080x1920 {"1080x1920" in v}  30fps {"30 fps" in v}  bt709/tv {tags}'
    cue = (D or {}).get('cues', {}).get('drop') or (D or {}).get('cues', {}).get('lift') if D else 64 * 0.34238
    if cue:                                                          # the bass jump across the cut, and where in +-60 ms it peaks
        n, hop = 2048, 240; f = np.fft.rfftfreq(n, 1 / 48000); m = (f >= 20) & (f < 150); w = np.hanning(n)
        lo = lambda c: 10 * np.log10(np.sum(np.abs(np.fft.rfft(x[c - n // 2:c + n // 2] * w))[m] ** 2) + 1e-9)
        ts = np.arange(cue - .3, cue + .3, hop / 48000); L = np.array([lo(int(tt * 48000)) for tt in ts])
        before = L[(ts > cue - .3) & (ts < cue - .05)].mean(); after = L[(ts > cue + .02) & (ts < cue + .25)].mean()
        fl = np.diff(L, prepend=L[0]); k = np.argmax(np.where(np.abs(ts - cue) < .06, fl, -99))
        line += f'  bass {before:5.1f} -> {after:5.1f} dB across the cut, steepest rise {(ts[k] - cue) * 1000:+.0f} ms'
    rows.append(line)
print('\n'.join(rows))
# colour: a kick-free, overlay-free stretch of each pipeline against the source decoded straight
for name, t, clip, st, box in [('maine', 4.60, '5627AA72', 14.45, (1000, 1500, 100, 980)), ('best30', 0.50, '62379666', 0.50, (300, 1700, 60, 1020))]:
    a = frame(f'{O}/final/{name}.mp4', t); b = frame(f'{S}/v14/dl/{clip}/{clip}.mov', st, src=True)
    y0, y1, x0, x1 = box; d = a[y0:y1, x0:x1] - b[y0:y1, x0:x1]
    print(f'colour {name:7s} vs {clip}@{st}: mean shift R {d[..., 0].mean():+.2f} G {d[..., 1].mean():+.2f} B {d[..., 2].mean():+.2f}  mean |diff| {np.abs(d).mean():.2f} (levels of 255)')
