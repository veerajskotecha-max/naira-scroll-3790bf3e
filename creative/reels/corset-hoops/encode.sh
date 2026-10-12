#!/bin/bash
# PNG frames + soundtrack -> H.264 High, BT.709 limited range, two-pass sized under the 30 MB cap.
# usage: ./encode.sh <version> <out.mp4>      (frames in eng/out_<version>, audio in audio/<version>.wav)
set -e
V=$1; OUT=$(realpath -m $2); ROOT=$(realpath ${WORK:-.})/v13; FF=${FFMPEG:-ffmpeg}
N=$(ls $ROOT/eng/out_$V/f_*.png | wc -l); DUR=$(python3 -c "print($N/30)")
# 28.5 MiB of room, less 256 kb/s of audio and 3% for the container; never above 14 Mb/s
KBPS=$(python3 -c "print(min(14000, int((28.5*1024*1024*8/$DUR - 256000)*0.97/1000)))")
cd $(mktemp -d)
IN="-framerate 30 -i $ROOT/eng/out_$V/f_%05d.png"
VOPT="-vf scale=out_color_matrix=bt709:out_range=tv:flags=accurate_rnd+full_chroma_int,format=yuv420p
  -c:v libx264 -preset slow -profile:v high -b:v ${KBPS}k -maxrate $((KBPS*3/2))k -bufsize $((KBPS*2))k
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv"
$FF -y -hide_banner -loglevel error $IN $VOPT -pass 1 -an -f mp4 /dev/null
$FF -y -hide_banner -loglevel error $IN -i $ROOT/audio/$V.wav $VOPT -pass 2 -map 0:v -map 1:a -c:a aac -b:a 256k -ar 48000 -shortest -movflags +faststart $OUT
SIZE=$(stat -c %s $OUT); echo "$V: $N frames, ${DUR}s, video ${KBPS} kb/s -> $(python3 -c "print(round($SIZE/1048576,2))") MiB"
[ $SIZE -lt 31457280 ] || { echo "too big for the 30 MB limit"; exit 1; }
