#!/usr/bin/env bash
# Two-pass x264 at a bitrate that lands the file near 27.4 MB for its running time, film grain on top
# of the render, AAC 192k, faststart. Run from this folder after engine/render.mjs and mix.py.
set -euo pipefail
FF=${FFMPEG:-./ffmpeg}; DUR=19.6; OUT=${1:-naira-pankti-v11.mp4}
VK=$(python3 -c "print(int((27.4e6*8 - 192e3*$DUR)/$DUR/1e3*0.985))")
COMMON="-framerate 30 -i engine/out/f_%05d.jpg -i mix.wav -map 0:v -map 1:a -t $DUR -vf noise=alls=4:allf=t,format=yuv420p -r 30
 -c:v libx264 -preset slow -profile:v high -level 4.2 -b:v ${VK}k -maxrate $((VK*19/10))k -bufsize $((VK*26/10))k -g 60
 -pix_fmt yuv420p -color_primaries bt709 -color_trc bt709 -colorspace bt709 -color_range tv"
$FF -loglevel error -y $COMMON -pass 1 -passlogfile x264pass -an -f null /dev/null
$FF -loglevel error -y $COMMON -pass 2 -passlogfile x264pass -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
python3 -c "import os,sys; mb=os.path.getsize('$OUT')/1e6; print(f'$OUT {mb:.2f} MB'); sys.exit(mb >= 30)"
