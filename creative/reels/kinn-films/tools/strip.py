"""Frames of source moments at a given rate, labelled, tiled: clip:t0:t1:fps ... -> out.jpg"""
import sys, subprocess
sys.path.append('/root/.local/lib/python3.11/site-packages')
import cv2, numpy as np
S = sys.argv[1]; out = sys.argv[2]; rows = []
for spec in sys.argv[3:]:
    c, t0, t1, fps = spec.split(':'); t0, t1, fps = float(t0), float(t1), float(fps)
    raw = subprocess.run([f'{S}/ffmpeg', '-v', 'error', '-ss', f'{t0:.3f}', '-t', f'{t1 - t0:.3f}', '-i', f'{S}/v14/dl/{c}/{c}.mov',
                          '-vf', f'fps={fps},scale=135:240:flags=area', '-f', 'rawvideo', '-pix_fmt', 'bgr24', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, 240, 135, 3).copy(); tiles = []
    for i, f in enumerate(fr[:14]):
        cv2.rectangle(f, (0, 0), (135, 14), (0, 0, 0), -1); cv2.putText(f, f'{c[:4]} {t0 + i / fps:.2f}', (2, 11), cv2.FONT_HERSHEY_SIMPLEX, .36, (255, 255, 255), 1); tiles.append(f)
    while len(tiles) < 14: tiles.append(np.zeros((240, 135, 3), np.uint8))
    rows.append(np.hstack(tiles))
cv2.imwrite(out, np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 82]); print(out)
