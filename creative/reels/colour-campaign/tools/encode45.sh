#!/bin/bash
# encode45.sh <ad> <out.mp4> <bitrate> <audio.wav> [y0 in 1080-wide units, default 230]: the FEED cut. Meta crops 9:16 to
# 4:5 in feed, so we cut our own: the 1350-tall window from y0 keeps every line of type (all set in y 270-1250) and the
# piece. Works on the 4K frames (scaled by the frames' own width).
a=$1; out=$2; br=$3; wav=$4; y0=${5:-230}; FR=${FPS:-24}
W=$(python3 -c "from PIL import Image" 2>/dev/null; ffprobe -v error -select_streams v:0 -show_entries stream=width -of csv=p=0 out_$a/f_00001.jpg)
k=$(python3 -c "print($W/1080)"); CH=$(python3 -c "print(int(round(1350*$k)))"); CY=$(python3 -c "print(int(round($y0*$k)))")
VF="crop=$W:$CH:0:$CY,scale=in_color_matrix=bt601:in_range=full:out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p"
X="-c:v libx264 -preset slow -profile:v high -level ${LEVEL:-5.1} -g 48 -bf 2 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"
ffmpeg -nostdin -v error -y -framerate $FR -i out_$a/f_%05d.jpg -vf "$VF" $X -b:v $br -maxrate ${MAXRATE:-20000k} -bufsize ${BUFSIZE:-30000k} -pass 1 -passlogfile p45_$a -an -f mp4 /dev/null
ffmpeg -nostdin -v error -y -framerate $FR -i out_$a/f_%05d.jpg -i $wav -map 0:v -map 1:a -vf "$VF" $X -b:v $br -maxrate ${MAXRATE:-20000k} -bufsize ${BUFSIZE:-30000k} -pass 2 -passlogfile p45_$a \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "$out"
