# Ad masters (the song removed: Meta can mute or reject unlicensed music in paid placements; Riya keeps her voice and the original
# synth bed, which is cleared), 540x960 previews with the original audio, posters, and two-part splits for the page's asset store.
import subprocess, sys, json, hashlib, os
FF, S = sys.argv[1], sys.argv[2]; O = f'{S}/ads/out'
ITEMS = json.loads(open(sys.argv[3]).read())
def run(a): subprocess.run([FF, '-hide_banner', '-nostdin', '-y', '-v', 'error', *a], check=True)
man = []
for it in ITEMS:
    src, name = f"{S}/{it['src']}", it['file']
    m = f'{O}/master/{name}'
    if it.get('bed'):
        run(['-i', src, '-i', f"{S}/{it['bed']}", '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-shortest', '-movflags', '+faststart', m])
    else:
        run(['-i', src, '-f', 'lavfi', '-i', 'anullsrc=r=48000:cl=stereo', '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '64k', '-shortest', '-movflags', '+faststart', m])
    pv_src = m if it.get('bed') else src
    pv = f"{O}/preview/{it['id']}.mp4"
    run(['-i', pv_src, '-vf', 'scale=540:960:flags=lanczos', '-c:v', 'libx264', '-preset', 'medium', '-crf', '25', '-maxrate', '1800k', '-bufsize', '3600k',
         '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
         '-c:a', 'aac', '-b:a', '96k', '-movflags', '+faststart', pv])
    po = f"{O}/poster/{it['id']}.jpg"
    run(['-ss', str(it.get('poster_t', .5)), '-i', src, '-frames:v', '1', '-vf', 'scale=540:960:flags=lanczos', '-q:v', '4', po])
    data = open(m, 'rb').read(); size = len(data); half = (size + 1) // 2
    parts = []
    for k, chunk in enumerate((data[:half], data[half:])):
        p = f"{O}/parts/{name[:-4]}.part{k + 1}"; open(p, 'wb').write(chunk); parts.append({'path': p, 'size': len(chunk)})
    dur = float(subprocess.run([FF, '-hide_banner', '-i', m], capture_output=True, text=True).stderr.split('Duration: ')[1].split(',')[0].split(':')[2])
    man.append({'id': it['id'], 'file': name, 'size': size, 'sha256': hashlib.sha256(data).hexdigest(), 'secs': round(dur, 2), 'parts': parts,
                'preview': pv, 'preview_size': os.path.getsize(pv), 'poster': po})
    print(f"{it['id']:4s} {name:52s} {size / 1e6:5.1f} MB  {dur:5.2f}s  preview {os.path.getsize(pv) / 1e6:4.1f} MB")
json.dump(man, open(f'{O}/manifest.json', 'w'), indent=1)
