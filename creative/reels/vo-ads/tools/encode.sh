#!/bin/bash
# encode.sh <ad> <out.mp4> [crf]: JPEG frames (BT.601 full, as browsers write them) -> H.264 High, BT.709 TV range, +faststart
a=$1; out=$2; crf=${3:-16}
ffmpeg -nostdin -v error -y -framerate 30 -i out_$a/f_%05d.jpg -i $a/master.wav -map 0:v -map 1:a \
  -vf "scale=in_color_matrix=bt601:in_range=full:out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p" \
  -c:v libx264 -preset slow -crf $crf -profile:v high -level 4.2 -g 60 -bf 2 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "$out"
