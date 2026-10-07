#!/bin/bash
# v5: two-pass x264 at ~5.3 Mbps, fails above 30 MB
set -e
S=${WORK:-.}; FF=${FFMPEG:-ffmpeg}; cd $S/v12
for v in "mix.wav naira-halo-baroque-v5.mp4" "mix_nomusic.wav naira-halo-baroque-v5-no-music.mp4"; do set -- $v
  $FF -y -hide_banner -loglevel error -framerate 30 -i eng/out6/f_%05d.jpg -c:v libx264 -preset slow -b:v 5300k -pass 1 -passlogfile x5 -pix_fmt yuv420p -an -f mp4 /dev/null
  $FF -y -hide_banner -loglevel error -framerate 30 -i eng/out6/f_%05d.jpg -i $1 -c:v libx264 -preset slow -b:v 5300k -pass 2 -passlogfile x5 -pix_fmt yuv420p -profile:v high -c:a aac -b:a 192k -shortest -movflags +faststart $2
  sz=$(stat -c %s $2); echo "$2 $sz"; [ $sz -lt 31457280 ] || { echo TOO BIG; exit 1; }
done
