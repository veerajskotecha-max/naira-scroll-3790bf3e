# per-frame mean abs diff (luma, 270x480) for a frame range of the GRWM source, to judge how visible a hold would be
import subprocess, sys, numpy as np
FF, src, a, b = sys.argv[1], sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
w, h = 270, 480
p = subprocess.run([FF, '-v', 'error', '-i', src, '-vf', f"select='between(n\\,{a}\\,{b})',scale={w}:{h},format=gray", '-vsync', '0', '-f', 'rawvideo', '-'], capture_output=True, check=True)
fr = np.frombuffer(p.stdout, np.uint8).reshape(-1, h, w).astype(np.float32)
for i in range(1, len(fr)):
    print(a + i, f'{np.abs(fr[i] - fr[i - 1]).mean():6.2f}')
