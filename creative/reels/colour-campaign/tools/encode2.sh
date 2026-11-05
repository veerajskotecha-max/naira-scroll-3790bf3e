#!/bin/bash
# encode2.sh (FPS env sets the frame rate; level 5.1 allows 4K) <ad> <out.mp4> [crf | bitrate such as 6900k] [audio.wav, default <ad>/master.wav]: JPEG frames (BT.601 full, as browsers write them) -> H.264 High,
# BT.709 TV range, +faststart. A bitrate runs two passes, which keeps the 30 s ad under the chat's 30 MB limit.
a=$1; out=$2; q=${3:-16}; wav=${4:-$a/master.wav}; FR=${FPS:-30}
VF="scale=in_color_matrix=bt601:in_range=full:out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p"
X="-c:v libx264 -preset slow -profile:v high -level ${LEVEL:-4.2} -g 60 -bf 2 -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"
if [[ $q == *k ]]; then
  ffmpeg -nostdin -v error -y -framerate $FR -i out_$a/f_%05d.jpg -vf "$VF" $X -b:v $q -maxrate ${MAXRATE:-9000k} -bufsize ${BUFSIZE:-14000k} -pass 1 -passlogfile pass_$a -an -f mp4 /dev/null
  R="-b:v $q -maxrate ${MAXRATE:-9000k} -bufsize ${BUFSIZE:-14000k} -pass 2 -passlogfile pass_$a"
else
  R="-crf $q"
fi
ffmpeg -nostdin -v error -y -framerate $FR -i out_$a/f_%05d.jpg -i $wav -map 0:v -map 1:a -vf "$VF" $X $R \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -shortest "$out"
