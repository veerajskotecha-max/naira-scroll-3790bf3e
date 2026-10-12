"""Encode a rendered reel (q95 JPEG frames + mastered wav) to: final/<name>.mp4 (1080x1920 H.264, <=29 MB for sending) and
web/<name>.mp4 (720x1280 preview for the page) + web/<name>.jpg poster. BT.601 full-range JFIF in, BT.709 TV range out.
Usage: encode.py <S> <name> <frames dir or source mp4> <audio wav or 'none'> [poster time]"""
import os, subprocess, sys
S, name, src, aud = sys.argv[1:5]; pt = float(sys.argv[5]) if len(sys.argv) > 5 else 0.0
FF = f'{S}/ffmpeg'; O = f'{S}/v15/out'; MB = 1048576
vin = ['-framerate', '30', '-i', f'{src}/f_%05d.jpg'] if os.path.isdir(src) else ['-i', src]
cm = 'in_color_matrix=bt601:in_range=full' if os.path.isdir(src) else 'in_color_matrix=bt709:in_range=tv'
ain = ['-i', aud] if aud != 'none' else ['-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo']
tags = ['-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv']
def run(a): subprocess.run([FF, '-hide_banner', '-nostdin', '-y', '-v', 'error', *a], check=True)
def dur(p):
    v = subprocess.run([FF, '-hide_banner', '-i', p], capture_output=True, text=True).stderr.split('Duration: ')[1].split(',')[0].split(':')
    return float(v[0]) * 3600 + float(v[1]) * 60 + float(v[2])
def enc(out, w, h, rate=None, crf=None, ab='256k'):
    vf = f'scale={w}:{h}:flags=lanczos+accurate_rnd+full_chroma_int:{cm}:out_color_matrix=bt709:out_range=tv,format=yuv420p'
    base = [*vin, *ain, '-map', '0:v', '-map', '1:a', '-vf', vf, '-r', '30', '-c:v', 'libx264', '-preset', 'slow', '-profile:v', 'high', '-g', '60', '-bf', '2',
            *tags, '-shortest']
    if crf is not None:
        run([*base, '-crf', str(crf), '-maxrate', '24M', '-bufsize', '36M', '-c:a', 'aac', '-b:a', ab, '-ar', '48000', '-movflags', '+faststart', out]); return
    pl = f'{O}/x264_{name}_{w}'
    run([*base, '-b:v', str(int(rate)), '-pass', '1', '-passlogfile', pl, '-an', '-f', 'mp4', '/dev/null'])
    run([*base, '-b:v', str(int(rate)), '-pass', '2', '-passlogfile', pl, '-c:a', 'aac', '-b:a', ab, '-ar', '48000', '-movflags', '+faststart', out])
    for f in os.listdir(O):
        if f.startswith(f'x264_{name}_{w}'): os.remove(f'{O}/{f}')
fin = f'{O}/final/{name}.mp4'; only_final = os.environ.get('FINAL_ONLY') == '1'
if os.environ.get('SKIP_CRF') == '1':                            # already known to be over the limit at CRF 17
    d = len([f for f in os.listdir(src) if f.endswith('.jpg')]) / 30 if os.path.isdir(src) else dur(src); open(fin, 'wb').close()
else: enc(fin, 1080, 1920, crf=17); d = dur(fin)
if os.environ.get('SKIP_CRF') == '1' or os.path.getsize(fin) > 29.0e6: enc(fin, 1080, 1920, rate=(27.6e6 * 8 / d - 270000))   # decimal MB: the chat's send limit is 30 MB
if only_final: print(f'{name:16s} {d:6.3f}s  final {os.path.getsize(fin) / 1e6:5.1f} MB'); sys.exit(0)
web = f'{O}/web/{name}.mp4'; enc(web, 720, 1280, rate=min(3.4e6, 7.4 * MB * 8 / d - 140000), ab='128k')
run(['-ss', f'{pt:.3f}', '-i', fin, '-frames:v', '1', '-vf', 'scale=540:960:flags=lanczos', '-q:v', '3', f'{O}/web/{name}.jpg'])
print(f'{name:16s} {d:6.3f}s  final {os.path.getsize(fin) / 1e6:5.1f} MB  web {os.path.getsize(web) / 1e6:4.1f} MB')
